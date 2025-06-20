import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth-action';
import { SiteHeader } from '@/components/site-header';
import { ProfileForm } from '@/components/auth/profile-form';

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <SiteHeader title='Account Settings' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='flex items-center justify-between px-4 lg:px-6'>
              <h1 className='text-2xl font-semibold'>Your Account</h1>
            </div>
            <div className='px-4 lg:px-6'>
              <ProfileForm
                user={{
                  id: session.user.id,
                  name: session.user.name,
                  email: session.user.email,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
