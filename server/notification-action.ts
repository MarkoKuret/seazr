'use server';

import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

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

export async function subscribeUser(sub: PushSubscription) {
  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        endpoint: sub.endpoint,
        subscription: sub as any,
      },
      update: {
        subscription: sub as any,
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
