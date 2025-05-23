'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

import { signUp } from '@/server/user';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signUp(data.name, data.email, data.password, data.confirmPassword);
      if (typeof result === 'string') {
        setError(result);
        setIsSubmitting(false);
      } else if (result?.success) {
        router.push('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Welcome</CardTitle>
          <CardDescription>Create account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
              {error && (
                <div className='bg-destructive/15 text-destructive rounded-md p-3 text-sm'>
                  {error}
                </div>
              )}

              <div className='grid gap-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='grid gap-3'>
                      <Label htmlFor='name'>Name</Label>
                      <FormControl>
                        <Input
                          id='name'
                          type='text'
                          placeholder='Jack Sparrow'
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='grid gap-3'>
                      <Label htmlFor='email'>Email</Label>
                      <FormControl>
                        <Input
                          id='email'
                          type='email'
                          placeholder='captain@example.com'
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='grid gap-3'>
                      <Label htmlFor='password'>Password</Label>
                      <FormControl>
                        <Input
                          id='password'
                          type='password'
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='grid gap-3'>
                      <Label htmlFor='confirmPassword'>Confirm Password</Label>
                      <FormControl>
                        <Input
                          id='confirmPassword'
                          type='password'
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing up...' : 'Sign up'}
                </Button>
              </div>

              <div className='text-center text-sm'>
                Already have an account?{' '}
                <a href='/login' className='underline underline-offset-4'>
                  Log in
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
        By clicking continue, you agree to our <a href='#'>Terms of Service</a>{' '}
        and <a href='#'>Privacy Policy</a>.
      </div>
    </div>
  );
}
