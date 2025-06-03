import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SectionCards } from '@/components/section-cards';
import { DataTable } from '@/components/data-table';
import { getAllSensorValues } from '@/server/sensor-action';
import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';

import data from './data.json';
async function SensorCards() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  try {
    const sensors = await getAllSensorValues(session.user.id);
    return (
      <SectionCards
        sensors={sensors}
        isLoading={false}
        minCards={4}
        placeholderTitle='No Data'
        placeholderDescription='No sensor available'
        placeholderMessage='Add sensors to your vessel'
      />
    );
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return (
      <SectionCards
        sensors={[]}
        isLoading={false}
        minCards={4}
        placeholderTitle='Error'
        placeholderDescription='Error loading sensors'
        placeholderMessage='Please try again later'
      />
    );
  }
}

export default async function DashboardPage() {
  return (
    <>
      <SiteHeader title='Dashboard' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <Suspense fallback={<SectionCards isLoading={true} sensors={[]} />}>
              <SensorCards />
            </Suspense>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
