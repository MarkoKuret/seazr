import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth-action';
import { SiteHeader } from '@/components/site-header';
import { PushNotificationManager } from '@/components/notifications-manager';

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <SiteHeader title='Notifications' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='flex items-center justify-between px-4 lg:px-6'></div>
            <div className='px-4 lg:px-6'>
              <PushNotificationManager userId={session.user.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
