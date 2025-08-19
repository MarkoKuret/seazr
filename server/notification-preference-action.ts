'use server';

import { prisma } from '@/lib/prisma';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Return defaults if no preferences exist
    if (!preferences) {
      return {
        emailNotifications: true,
        pushNotifications: true,
      };
    }

    return {
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    // Return defaults on error
    return {
      emailNotifications: true,
      pushNotifications: true,
    };
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
) {
  try {
    const result = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
      },
      update: {
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
      },
    });

    return { success: true, preferences: result };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

export async function toggleEmailNotifications(userId: string, enabled: boolean) {
  try {
    const result = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailNotifications: enabled,
        pushNotifications: true, // Default push to true for new records
      },
      update: {
        emailNotifications: enabled,
      },
    });

    return { success: true, emailNotifications: result.emailNotifications };
  } catch (error) {
    console.error('Error toggling email notifications:', error);
    return { success: false, error: 'Failed to update email preferences' };
  }
}

export async function togglePushNotifications(userId: string, enabled: boolean) {
  try {
    const result = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        emailNotifications: true, // Default email to true for new records
        pushNotifications: enabled,
      },
      update: {
        pushNotifications: enabled,
      },
    });

    return { success: true, pushNotifications: result.pushNotifications };
  } catch (error) {
    console.error('Error toggling push notifications:', error);
    return { success: false, error: 'Failed to update push preferences' };
  }
}
