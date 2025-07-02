'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { addUserToVessel } from '@/server/vessel-action';
import { SheetClose } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Vessel } from '@/types';

const addUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

interface AddUserToVesselFormProps {
  userId: string;
  vessel: Vessel;
  onClose?: () => void;
}

export function AddUserToVesselForm({
  userId,
  vessel,
  onClose,
}: AddUserToVesselFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof addUserSchema>) {
    setIsSubmitting(true);
    try {
      const result = await addUserToVessel({
        userId,
        vesselId: vessel.id,
        email: values.email,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('User added to vessel successfully');
        form.reset();
        router.refresh();
        if (onClose) onClose();
      }
    } catch (error) {
      toast.error('Failed to add user to vessel');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 pt-6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Email</FormLabel>
              <FormControl>
                <Input placeholder='user@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-3'>
          <SheetClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </SheetClose>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
