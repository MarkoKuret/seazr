import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SectionCards } from '@/components/section-cards';
import { DataTable } from '@/components/data-table';
import { getAllSensorValues, getVesselLocation } from '@/server/sensor-action';
import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';
import VesselMapLoader from '@/components/vessel-map-loader';

import data from './data.json';

async function VesselMapContainer() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  try {
    const locations = await getVesselLocation(session.user.id);
    // Use the new client component loader
    return <VesselMapLoader locations={locations} />;
  } catch (error) {
    console.error('Error fetching vessel location:', error);
    // Use the new client component loader with empty data
    return <VesselMapLoader locations={[]} />;
  }
}

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
            <div className='px-4 lg:px-6'>
              <Suspense
                fallback={
                  <div className='bg-muted-foreground/10 h-[400px] animate-pulse rounded-lg'></div>
                }
              >
                <VesselMapContainer />
              </Suspense>
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
