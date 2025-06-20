'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateVessel } from '@/server/vessel-action';
import { SheetClose } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Vessel } from '@/types';

const vesselEditSchema = z.object({
  name: z.string().min(1, { message: 'Vessel name is required' }),
  description: z.string().max(100, {
    message: 'Description cannot exceed 100 characters',
  }).optional(),
});

interface EditVesselFormProps {
  userId: string;
  vessel: Vessel;
  onClose?: () => void;
}

export function EditVesselForm({ userId, vessel, onClose }: EditVesselFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof vesselEditSchema>>({
    resolver: zodResolver(vesselEditSchema),
    defaultValues: {
      name: vessel.name,
      description: vessel.description || '',
    },
  });

  async function onSubmit(values: z.infer<typeof vesselEditSchema>) {
    setIsSubmitting(true);
    try {
      const result = await updateVessel({
        userId,
        vesselId: vessel.id,
        name: values.name,
        description: values.description,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Vessel updated successfully');
        router.refresh();
        if (onClose) onClose();
      }
    } catch (error) {
      toast.error('Failed to update vessel');
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel Name</FormLabel>
              <FormControl>
                <Input placeholder='My Boat' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us about your vessel...'
                  {...field}
                />
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}