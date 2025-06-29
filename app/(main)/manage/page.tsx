import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { VesselsListContainer } from '@/components/vessels/vessels-list-container';
import { AddVesselForm } from '@/components/vessels/add-vessel-form';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default async function VesselsPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <SiteHeader title='Manage Vessels' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='flex items-center justify-between px-4 lg:px-6'>
              <h1 className='text-2xl font-semibold'>Your Vessels</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>
                    <PlusIcon className='mr-2 h-4 w-4' />
                    Add New Vessel
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add New Vessel</SheetTitle>
                    <SheetDescription>
                      Add a new vessel to your account. Fill in the details
                      below.
                    </SheetDescription>
                  </SheetHeader>
                  <AddVesselForm userId={session.user.id} />
                </SheetContent>
              </Sheet>
            </div>
            <Suspense
              fallback={<div className='px-4 lg:px-6'>Loading vessels...</div>}
            >
              <VesselsListContainer userId={session.user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
