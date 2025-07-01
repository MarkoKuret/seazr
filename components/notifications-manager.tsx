'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { urlBase64ToUint8Array } from '@/lib/utils';
import { subscribeUser, unsubscribeUser } from '@/server/notification-action';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeNotifications() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        try {
          await registerServiceWorker();
        } catch (error) {
          console.error('Service worker registration failed:', error);
          setError('Failed to initialize push notifications');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsSupported(false);
        setIsLoading(false);
      }
    }

    initializeNotifications();
  }, []);

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
      } else {
        await subscribeToPush();
      }
    } catch (error) {
      setError('Failed to update notification settings');
      toast.error('Failed to update notification settings');
      console.error(error);
    } finally {
      setIsSubmitting(false);
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

      // Store subscription on server
      const serializedSub = JSON.parse(JSON.stringify(sub));
      const result = await subscribeUser(serializedSub);

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
              Push notifications are not supported in this browser. Please use a
              modern browser like Chrome, Firefox, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription className='flex items-center justify-between'>
          Receive alerts and updates about your vessels directly to this device
          {isLoading ? (
            <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
          ) : (
            <Switch
              id='notifications'
              checked={isSubscribed}
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
            {isSubscribed ? (
              <>
                <Bell className='text-primary mt-0.5 h-5 w-5' />
                <div>
                  <h4 className='font-medium'>Notifications are enabled</h4>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    You will receive notifications for important vessel alerts,
                    such as bilge water detection, critical battery levels, and
                    security events.
                  </p>
                </div>
              </>
            ) : (
              <>
                <BellOff className='text-muted-foreground mt-0.5 h-5 w-5' />
                <div>
                  <h4 className='font-medium'>Notifications are disabled</h4>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    Enable notifications to get immediate alerts about important
                    vessel events.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
