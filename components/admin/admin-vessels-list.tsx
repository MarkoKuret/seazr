'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vessel } from '@/types';
import { Button } from '@/components/ui/button';
import {
  PenIcon,
  Trash2Icon,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
import { EditVesselForm } from '@/components/vessels/edit-vessel-form';
import { ManageVesselPermissions } from './manage-vessel-permissions';
import { deleteVessel } from '@/server/vessel-action';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface AdminVesselsListProps {
  vessels: Vessel[];
  userId: string;
}

export function AdminVesselsList({ vessels, userId }: AdminVesselsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vesselToDelete, setVesselToDelete] = useState<Vessel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter vessels based on search query
  const filteredVessels = vessels.filter(
    (vessel) =>
      vessel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vessel.shortId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vessel.description &&
        vessel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredVessels.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentVessels = filteredVessels.slice(startIndex, endIndex);

  if (vessels.length === 0) {
    return (
      <div className='px-4 lg:px-6'>
        <div className='rounded-md border p-8 text-center'>
          <h2 className='text-lg font-medium'>No vessels found</h2>
          <p className='text-muted-foreground mt-2'>
            No vessels have been added to the system yet.
          </p>
        </div>
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

  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  return (
    <>
      <div className='m-8 flex flex-col gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Search vessels...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className='max-w-xs'
            />
            <div className='text-muted-foreground text-sm'>
              {filteredVessels.length} vessel
              {filteredVessels.length !== 1 ? 's' : ''} found
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Rows per page' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5 per page</SelectItem>
                <SelectItem value='10'>10 per page</SelectItem>
                <SelectItem value='20'>20 per page</SelectItem>
                <SelectItem value='50'>50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVessels.map((vessel) => (
                <TableRow key={vessel.id}>
                  <TableCell className='font-medium'>
                    <Link
                      href={`/vessels/${vessel.shortId}?name=${encodeURIComponent(vessel.name)}`}
                      className='text-primary hover:underline'
                    >
                      {vessel.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{vessel.shortId}</Badge>
                  </TableCell>
                  <TableCell className='max-w-[300px] truncate'>
                    {vessel.description || (
                      <span className='text-muted-foreground italic'>
                        No description
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant='outline' size='sm'>
                            <PenIcon className='h-4 w-4' />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Edit Vessel</SheetTitle>
                            <SheetDescription>
                              Update vessel information below.
                            </SheetDescription>
                          </SheetHeader>
                          <EditVesselForm userId={userId} vessel={vessel} />
                        </SheetContent>
                      </Sheet>

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant='outline' size='sm'>
                            <Users className='h-4 w-4' />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Manage User Permissions</SheetTitle>
                            <SheetDescription>
                              Add or remove users access to this vessel.
                            </SheetDescription>
                          </SheetHeader>
                          <ManageVesselPermissions
                            userId={userId}
                            vessel={vessel}
                          />
                        </SheetContent>
                      </Sheet>

                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeleteClick(vessel)}
                      >
                        <Trash2Icon className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {currentVessels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    No vessels matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between py-4'>
            <div className='text-muted-foreground text-sm'>
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredVessels.length)} of{' '}
              {filteredVessels.length}
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Previous Page</span>
              </Button>
              <div className='flex items-center justify-center text-sm font-medium'>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className='h-4 w-4' />
                <span className='sr-only'>Next Page</span>
              </Button>
            </div>
          </div>
        )}
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
