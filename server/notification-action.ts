'use server';

import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import { sendEmail } from '@/server/email-action';
import { getUserNotificationPreferences } from '@/server/notification-preference-action';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.NEXT_PUBLIC_VAPID_SUBJECT;

if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
  console.error('VAPID keys are not set in environment variables');
  throw new Error(
    'Web push notification configuration is incomplete. VAPID keys missing.'
  );
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

export async function subscribeUser(sub: PushSubscription, userId?: string) {
  try {
    const subscriptionData = {
      ...sub,
      userId: userId
    };

    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        endpoint: sub.endpoint,
        subscription: subscriptionData as any,
      },
      update: {
        subscription: subscriptionData as any,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving subscription:', error);
    return { success: false, error: 'Failed to save subscription' };
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint: endpoint },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    if (error.code === 'P2025') {
      return { success: true, message: 'Subscription not found' };
    }
    return { success: false, error: 'Failed to unsubscribe' };
  }
}

export async function sendNotification(
  titleMessage: string,
  bodyMessage: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return;
    }

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription as any,
            JSON.stringify({
              title: titleMessage,
              body: bodyMessage,
              icon: '/icon1.png',
            })
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error(
            `Error sending push notification to ${sub.endpoint}:`,
            error
          );
          return { success: false, endpoint: sub.endpoint };
        }
      })
    );

    const anySuccess = results.some((r) => r.success);

    return {
      success: anySuccess,
      failedCount: results.filter((r) => !r.success).length,
      successCount: results.filter((r) => r.success).length,
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

export async function sendNotificationForVessel(
  vesselId: string,
  vesselName: string,
  titleMessage: string,
  bodyMessage: string
) {
  try {
    // Get all users who have permissions for this vessel
    const vesselPermissions = await prisma.permission.findMany({
      where: { vesselId: vesselId },
      include: {
        user: true,
      },
    });

    if (vesselPermissions.length === 0) {
      return { success: true, message: 'No users to notify', notificationsSent: 0, emailsSent: 0 };
    }

    // Get the authorized user IDs and emails
    const authorizedUserIds = vesselPermissions.map(p => p.userId);
    const authorizedUsers = vesselPermissions.map(p => p.user.email);

    console.log(`Vessel ${vesselName} alarm should notify users: ${authorizedUsers.join(', ')}`);

    // Get notification preferences for all authorized users
    const userPreferences = await Promise.all(
      authorizedUserIds.map(async (userId) => {
        const prefs = await getUserNotificationPreferences(userId);
        return { userId, preferences: prefs };
      })
    );

    // Filter users who want email notifications
    const emailEnabledUsers = vesselPermissions.filter(permission => {
      const userPref = userPreferences.find(pref => pref.userId === permission.userId);
      return userPref?.preferences.emailNotifications !== false;
    });

    // Send email notifications to users who have email notifications enabled
    const emailResults = await Promise.all(
      emailEnabledUsers.map(async (permission) => {
        const email = permission.user.email;
        try {
          const emailSubject = `🚨 Vessel Alert: ${vesselName}`;
          const emailText = `Dear User,

A critical alarm has been detected for vessel "${vesselName}".

Alert Details:
${bodyMessage}

Please check your vessel dashboard for more information and take necessary actions.

Time: ${new Date().toLocaleString()}

Best regards,
Seazr Team`;

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">🚨 Vessel Alert: ${vesselName}</h2>
              <p>Dear User,</p>
              <p>A critical alarm has been detected for vessel <strong>"${vesselName}"</strong>.</p>

              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">Alert Details:</h3>
                <p style="margin: 0;">${bodyMessage}</p>
              </div>

              <p>Please check your vessel dashboard for more information and take necessary actions.</p>

              <p style="color: #666; font-size: 12px;">
                Time: ${new Date().toLocaleString()}<br>
                This is an automated message from Seazr.
              </p>
            </div>
          `;

          const result = await sendEmail({
            to: email,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          });

          if (result.success) {
            console.log(`Sent email notification to ${email}`);
            return { success: true, email };
          } else {
            console.error(`Failed to send email to ${email}:`, result.error);
            return { success: false, email, error: result.error };
          }
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error);
          return { success: false, email, error: error };
        }
      })
    );

    const emailSuccessCount = emailResults.filter(r => r.success).length;
    const emailFailedCount = emailResults.filter(r => !r.success).length;

    // Filter users who want push notifications
    const pushEnabledUserIds = userPreferences
      .filter(pref => pref.preferences.pushNotifications !== false)
      .map(pref => pref.userId);

    // Get all push subscriptions and filter for authorized users with push enabled
    const allSubscriptions = await prisma.pushSubscription.findMany();

    // Filter subscriptions by checking if userId is stored in the subscription data and user wants push notifications
    const authorizedSubscriptions = allSubscriptions.filter(sub => {
      const subscriptionData = sub.subscription as any;
      return subscriptionData.userId &&
             authorizedUserIds.includes(subscriptionData.userId) &&
             pushEnabledUserIds.includes(subscriptionData.userId);
    });

    let pushNotificationResults = [];
    let pushSuccessCount = 0;
    let pushFailedCount = 0;

    if (authorizedSubscriptions.length === 0) {
      console.log(`No push subscriptions found for authorized users with push notifications enabled for vessel ${vesselId}`);
      console.log(`Falling back to sending push notification to all ${allSubscriptions.length} subscriptions`);

      // Only send to users who have push notifications enabled (if we can determine it)
      const fallbackSubscriptions = allSubscriptions.filter(sub => {
        const subscriptionData = sub.subscription as any;
        if (subscriptionData.userId) {
          return pushEnabledUserIds.includes(subscriptionData.userId);
        }
        // If no userId in subscription, send anyway (legacy behavior)
        return true;
      });

      pushNotificationResults = await Promise.all(
        fallbackSubscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              sub.subscription as any,
              JSON.stringify({
                title: titleMessage,
                body: bodyMessage,
                icon: '/icon1.png',
                data: {
                  vesselId,
                  vesselName,
                  type: 'vessel-alarm',
                  authorizedUsers: authorizedUsers,
                  note: 'Update your notification settings to receive targeted alerts'
                },
              })
            );
            return { success: true, endpoint: sub.endpoint };
          } catch (error) {
            console.error(`Error sending push notification to ${sub.endpoint}:`, error);
            return { success: false, endpoint: sub.endpoint };
          }
        })
      );

      pushSuccessCount = pushNotificationResults.filter((r) => r.success).length;
      pushFailedCount = pushNotificationResults.filter((r) => !r.success).length;

      return {
        success: (emailSuccessCount > 0) || (pushSuccessCount > 0),
        emailsSent: emailSuccessCount,
        emailsFailed: emailFailedCount,
        pushNotificationsSent: pushSuccessCount,
        pushNotificationsFailed: pushFailedCount,
        authorizedUsersCount: vesselPermissions.length,
        emailEnabledUsersCount: emailEnabledUsers.length,
        pushEnabledUsersCount: pushEnabledUserIds.length,
        totalSubscriptions: allSubscriptions.length,
        notificationsSent: pushSuccessCount, // For backward compatibility
        note: 'Sent push notifications to users with preferences enabled - user-specific targeting not yet fully configured'
      };
    }

    // Send push notifications to authorized subscriptions
    pushNotificationResults = await Promise.all(
      authorizedSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription as any,
            JSON.stringify({
              title: titleMessage,
              body: bodyMessage,
              icon: '/icon1.png',
              data: {
                vesselId,
                vesselName,
                type: 'vessel-alarm'
              },
            })
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error(
            `Error sending push notification to ${sub.endpoint}:`,
            error
          );
          return { success: false, endpoint: sub.endpoint };
        }
      })
    );

    pushSuccessCount = pushNotificationResults.filter((r) => r.success).length;
    pushFailedCount = pushNotificationResults.filter((r) => !r.success).length;

    console.log(`Sent ${emailSuccessCount} emails and ${pushSuccessCount} push notifications for vessel ${vesselName} to authorized users (${emailEnabledUsers.length} email-enabled, ${pushEnabledUserIds.length} push-enabled)`);

    return {
      success: (emailSuccessCount > 0) || (pushSuccessCount > 0),
      emailsSent: emailSuccessCount,
      emailsFailed: emailFailedCount,
      pushNotificationsSent: pushSuccessCount,
      pushNotificationsFailed: pushFailedCount,
      authorizedUsersCount: vesselPermissions.length,
      emailEnabledUsersCount: emailEnabledUsers.length,
      pushEnabledUsersCount: pushEnabledUserIds.length,
      totalSubscriptions: authorizedSubscriptions.length,
      notificationsSent: pushSuccessCount, // For backward compatibility
    };
  } catch (error) {
    console.error('Error sending vessel-specific notifications:', error);
    return { success: false, error: 'Failed to send notification', notificationsSent: 0, emailsSent: 0 };
  }
}
