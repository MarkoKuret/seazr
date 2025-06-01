'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addVessel } from '@/server/vessel-action';
import { SheetClose } from '@/components/ui/sheet';
import { toast } from 'sonner';

const vesselSchema = z.object({
  name: z.string().min(1, { message: "Vessel name is required" }),
  shortId: z.string().length(5, { message: "ShortID must be exactly 5 characters" })
    .regex(/^[0-9a-fA-F]{5}$/, { message: "ShortID must be a 5-digit hexadecimal number" }),
  description: z.string().optional(),
});

export function AddVesselForm({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof vesselSchema>>({
    resolver: zodResolver(vesselSchema),
    defaultValues: {
      name: '',
      shortId: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof vesselSchema>) {
    setIsSubmitting(true);
    try {
      const result = await addVessel({
        userId,
        name: values.name,
        shortId: values.shortId,
        description: values.description || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Vessel added successfully');
        form.reset();
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to add vessel');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel Name</FormLabel>
              <FormControl>
                <Input placeholder="My Boat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel ID</FormLabel>
              <FormControl>
                <Input placeholder="a1b2c" {...field} />
              </FormControl>
              <FormDescription>
                Enter the 5-digit hex ID provided with your device
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about your vessel..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <SheetClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Vessel'}
          </Button>
        </div>
      </form>
    </Form>
  );
}