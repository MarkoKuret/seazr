import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth';

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link href='/' className='flex items-center self-center'>
          <Image
            src='/logo.svg'
            alt='Seazr Logo'
            width={24}
            height={24}
            className='h-32 w-32'
          />
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
