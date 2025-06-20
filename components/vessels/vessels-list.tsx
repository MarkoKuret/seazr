'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Vessel } from '@/types';
import { Button } from '@/components/ui/button';
import { PenIcon, Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { EditVesselForm } from './edit-vessel-form';
import { deleteVessel } from '@/server/vessel-action';
import { toast } from 'sonner';
import Link from 'next/link';

interface VesselsListProps {
  vessels: Vessel[];
  userId: string;
}

export function VesselsList({ vessels, userId }: VesselsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vesselToDelete, setVesselToDelete] = useState<Vessel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (vessels.length === 0) {
    return (
      <div className='px-4 lg:px-6'>
        <Card className='border-dashed'>
          <CardContent className='pt-6 text-center'>
            <p className='text-muted-foreground'>
              No vessels added yet. Add your first vessel to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteClick = (vessel: Vessel) => {
    setVesselToDelete(vessel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vesselToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteVessel({
        userId,
        vesselId: vesselToDelete.id,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Vessel deleted successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to delete vessel');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setVesselToDelete(null);
    }
  };

  return (
    <>
      <div className='grid gap-4 px-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:px-6'>
        {vessels.map((vessel) => (
          <Link key={vessel.id} href={`/vessels/${vessel.shortId}`}>
          <Card key={vessel.id}>
            <CardHeader>
              <CardTitle className='text-lg'>{vessel.name}</CardTitle>
              <CardDescription>ID: {vessel.shortId}</CardDescription>
            </CardHeader>
            <CardContent>
              {vessel.description ? (
                <p>{vessel.description}</p>
              ) : (
                <p className='text-muted-foreground italic'>No description</p>
              )}
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <PenIcon className='h-4 w-4 mr-1' /> Edit
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Vessel</SheetTitle>
                    <SheetDescription>
                      Update your vessel information below.
                    </SheetDescription>
                  </SheetHeader>
                  <EditVesselForm userId={userId} vessel={vessel} />
                </SheetContent>
              </Sheet>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => handleDeleteClick(vessel)}
              >
                <Trash2Icon className='h-4 w-4'/>
              </Button>
            </CardFooter>
          </Card>
          </Link>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vessel
              {vesselToDelete && ` "${vesselToDelete.name}"`}
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
