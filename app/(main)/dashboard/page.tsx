import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { DataTable } from '@/components/data-table';
import { getVesselLocation, getAllSensorValues } from '@/server/sensor-action';
import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';
import VesselMapLoader from '@/components/vessel-map-loader';
import { VesselStatusCards } from '@/components/vessel-status-card';
import { getUserVessels } from '@/server/vessel-action';
import { determineVesselStatus } from '@/lib/vessel-status';

import data from './data.json';

async function VesselMapContainer() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  try {
    const locations = await getVesselLocation(session.user.id);
    return <VesselMapLoader locations={locations} />;
  } catch (error) {
    console.error('Error fetching vessel location:', error);
    return <VesselMapLoader locations={[]} />;
  }
}

async function VesselStatusContainer() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  try {
    const vessels = await getUserVessels(session.user.id);

    const vesselStatusPromises = vessels.map(async (vessel) => {
      const sensorReadings = await getAllSensorValues(
        session.user.id,
        vessel.shortId
      );
      const healthStatus = determineVesselStatus(sensorReadings);
      return {
        shortId: vessel.shortId,
        name: vessel.name,
        status: healthStatus.status,
        lastSeen: sensorReadings[0]?.time,
        description: healthStatus.description,
      };
    });

    const vesselStatuses = await Promise.all(vesselStatusPromises);

    return (
      <VesselStatusCards
        vessels={vesselStatuses}
        isLoading={false}
        minCards={1}
        placeholderTitle='No Vessels'
        placeholderDescription='No vessels available'
        placeholderMessage='Add vessels to get started'
      />
    );
  } catch (error) {
    console.error('Error fetching vessels:', error);
    return (
      <VesselStatusCards
        vessels={[]}
        isLoading={false}
        minCards={1}
        placeholderTitle='Error'
        placeholderDescription='Error loading vessels'
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
            <Suspense
              fallback={<VesselStatusCards isLoading={true} vessels={[]} />}
            >
              <VesselStatusContainer />
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
