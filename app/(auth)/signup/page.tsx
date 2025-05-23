import Link from 'next/link';
import Image from 'next/image';
import { SignupForm } from '@/components/auth/signup-form';

export default async function SignupPage() {
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
        <SignupForm />
      </div>
    </div>
  );
}
