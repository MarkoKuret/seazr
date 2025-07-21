'use client';

import { useState, useEffect } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  addUserToVessel,
  removeUserFromVessel,
  getVesselUsers,
} from '@/server/admin-action';
import { toast } from 'sonner';
import { Vessel } from '@/types';
import { Loader2, TrashIcon } from 'lucide-react';

const addUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

interface VesselUser {
  id: string;
  email: string;
  name: string | null;
}

interface ManageVesselPermissionsProps {
  userId: string;
  vessel: Vessel;
}

export function ManageVesselPermissions({
  userId,
  vessel,
}: ManageVesselPermissionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<VesselUser[]>([]);

  const form = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const fetchedUsers = await getVesselUsers(userId, vessel.id);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users with access to this vessel');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [userId, vessel.id]);

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
        // Refresh the user list
        const fetchedUsers = await getVesselUsers(userId, vessel.id);
        setUsers(fetchedUsers);
      }
    } catch (error) {
      toast.error('Failed to add user to vessel');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRemoveUser = async (userIdToRemove: string) => {
    try {
      const result = await removeUserFromVessel({
        adminUserId: userId,
        vesselId: vessel.id,
        userIdToRemove,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('User removed from vessel successfully');
        // Update the local state by filtering out the removed user
        setUsers(users.filter((user) => user.id !== userIdToRemove));
      }
    } catch (error) {
      toast.error('Failed to remove user from vessel');
      console.error(error);
    }
  };

  return (
    <div className='space-y-6 pt-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Email</FormLabel>
                <div className='flex gap-2'>
                  <FormControl>
                    <Input placeholder='user@example.com' {...field} />
                  </FormControl>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className='mt-6'>
        <h3 className='mb-4 text-lg font-medium'>Users with access</h3>
        {isLoading ? (
          <div className='flex justify-center py-4'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || 'No name'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <TrashIcon className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className='text-muted-foreground py-4 text-center'>
            No users have access to this vessel
          </p>
        )}
      </div>
    </div>
  );
}
