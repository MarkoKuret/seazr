'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff, Loader2, Mail, MailX } from 'lucide-react';
import { urlBase64ToUint8Array } from '@/lib/utils';
import { subscribeUser, unsubscribeUser } from '@/server/notification-action';
import {
  getUserNotificationPreferences,
  toggleEmailNotifications,
  togglePushNotifications,
  type NotificationPreferences,
} from '@/server/notification-preference-action';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PushNotificationManagerProps {
  userId: string;
}

export function PushNotificationManager({
  userId,
}: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
  });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const loadUserPreferences = useCallback(async () => {
    try {
      const userPrefs = await getUserNotificationPreferences(userId);
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, [userId]);

  useEffect(() => {
    async function initializeNotifications() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        try {
          await registerServiceWorker();
          await loadUserPreferences();
        } catch (error) {
          console.error('Service worker registration failed:', error);
          setError('Failed to initialize push notifications');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsSupported(false);
        try {
          await loadUserPreferences();
        } catch (error) {
          console.error('Failed to load preferences:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    initializeNotifications();
  }, [userId, loadUserPreferences]);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Error registering service worker:', error);
      throw error;
    }
  }

  async function handleSubscriptionToggle() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        await togglePushNotifications(userId, false);
      } else {
        await subscribeToPush();
        await togglePushNotifications(userId, true);
      }
      await loadUserPreferences();
    } catch (error) {
      setError('Failed to update notification settings');
      toast.error('Failed to update notification settings');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailToggle() {
    if (isUpdatingEmail) return;

    setIsUpdatingEmail(true);
    setError(null);

    try {
      const newEmailState = !preferences.emailNotifications;
      const result = await toggleEmailNotifications(userId, newEmailState);

      if (result.success) {
        setPreferences((prev) => ({
          ...prev,
          emailNotifications: newEmailState,
        }));
        toast.success(
          newEmailState
            ? 'Email notifications enabled'
            : 'Email notifications disabled'
        );
      } else {
        throw new Error(result.error || 'Failed to update email preferences');
      }
    } catch (error) {
      setError('Failed to update email notification settings');
      toast.error('Failed to update email notification settings');
      console.error(error);
    } finally {
      setIsUpdatingEmail(false);
    }
  }

  async function subscribeToPush() {
    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setError('Notification permission denied');
        toast.error('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        setError('VAPID public key is not configured');
        toast.error('Push notification configuration error');
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Store subscription on server with user ID
      const serializedSub = JSON.parse(JSON.stringify(sub));
      const result = await subscribeUser(serializedSub, userId);

      if (result.success) {
        toast.success('Successfully subscribed to push notifications');
      } else {
        throw new Error(result.error || 'Failed to save subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  }

  async function unsubscribeFromPush() {
    if (!subscription) return;

    setSubscription(null);
    setIsSubscribed(false);

    try {
      await subscription.unsubscribe();
      const result = await unsubscribeUser(subscription.endpoint);

      if (result.success) {
        toast.success('Unsubscribed!');
        setIsSubscribed(false);
      } else {
        throw new Error(result.error || 'Failed to remove subscription');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to unsubscribe');
    }
  }

  if (!isSupported) {
    return (
      <div className='space-y-4'>
        {/* Email Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription className='flex items-center justify-between'>
              Vessel alerts via email
              {isLoading ? (
                <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
              ) : (
                <Switch
                  id='email-notifications'
                  checked={preferences.emailNotifications}
                  onCheckedChange={handleEmailToggle}
                  disabled={isUpdatingEmail}
                />
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='bg-muted flex items-start gap-3 rounded-md p-4'>
                {preferences.emailNotifications ? (
                  <>
                    <Mail className='text-primary mt-0.5 h-5 w-5' />
                    <div>
                      <h4 className='font-medium'>
                        Email notifications are enabled
                      </h4>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        You will receive email alerts for important vessel
                        events, such as bilge water detection, critical battery
                        levels, and security events.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <MailX className='text-muted-foreground mt-0.5 h-5 w-5' />
                    <div>
                      <h4 className='font-medium'>
                        Email notifications are disabled
                      </h4>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        Enable email notifications to receive alerts about
                        important vessel events in your inbox.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>
              Receive alerts and updates about your vessels directly to this
              device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant='destructive'>
              <AlertDescription>
                <p>
                  <strong>
                    Push notifications on mobile require the app to be installed
                    as a Progressive Web App (PWA).
                  </strong>
                  <br />
                  To enable notifications:
                </p>
                <ul>
                  <li>
                    <strong>On iOS (iPhone/iPad):</strong> Open the site in{' '}
                    <em>Safari</em>, tap the <em>Share</em> icon, and select{' '}
                    <em>&ldquo;Add to Home Screen&rdquo;</em>.
                  </li>
                  <li>
                    <strong>On Android:</strong> Use <em>Chrome</em>,{' '}
                    <em>Firefox</em>, or <em>Edge</em>. Open the menu (three
                    dots) and tap <em>&ldquo;Install app&rdquo;</em> or{' '}
                    <em>&ldquo;Add to Home screen&rdquo;</em>.
                  </li>
                </ul>
                <p>
                  After installation, you will be able to receive push
                  notifications just like with a native mobile app.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Email Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription className='flex items-center justify-between'>
            Vessel alerts via email
            {isLoading ? (
              <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
            ) : (
              <Switch
                id='email-notifications'
                checked={preferences.emailNotifications}
                onCheckedChange={handleEmailToggle}
                disabled={isUpdatingEmail}
              />
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='bg-muted flex items-start gap-3 rounded-md p-4'>
              {preferences.emailNotifications ? (
                <>
                  <Mail className='text-primary mt-0.5 h-5 w-5' />
                  <div>
                    <h4 className='font-medium'>
                      Email notifications are enabled
                    </h4>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      You will receive email alerts for important vessel events,
                      such as bilge water detection, critical battery levels,
                      and security events.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <MailX className='text-muted-foreground mt-0.5 h-5 w-5' />
                  <div>
                    <h4 className='font-medium'>
                      Email notifications are disabled
                    </h4>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Enable email notifications to receive alerts about
                      important vessel events in your inbox.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription className='flex items-center justify-between'>
            Receive alerts and updates about your vessels directly to this
            device
            {isLoading ? (
              <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
            ) : (
              <Switch
                id='notifications'
                checked={isSubscribed && preferences.pushNotifications}
                onCheckedChange={handleSubscriptionToggle}
                disabled={isSubmitting}
              />
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='bg-muted flex items-start gap-3 rounded-md p-4'>
              {isSubscribed && preferences.pushNotifications ? (
                <>
                  <Bell className='text-primary mt-0.5 h-5 w-5' />
                  <div>
                    <h4 className='font-medium'>
                      Push notifications are enabled
                    </h4>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      You will receive push notifications for important vessel
                      alerts, such as bilge water detection, critical battery
                      levels, and security events.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <BellOff className='text-muted-foreground mt-0.5 h-5 w-5' />
                  <div>
                    <h4 className='font-medium'>
                      Push notifications are disabled
                    </h4>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Enable push notifications to get immediate alerts about
                      important vessel events on this device.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
