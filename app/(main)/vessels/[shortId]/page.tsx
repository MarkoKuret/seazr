import { Suspense } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { getAllSensorValues, getSensorHistory } from '@/server/sensor-action';
import { SensorType } from '@/types';
import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';

async function VesselSensorCards({ vesselId }: { vesselId: string }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  try {
    const sensors = await getAllSensorValues(session.user.id, vesselId);
    return (
      <SectionCards
        sensors={sensors}
        isLoading={false}
        minCards={4}
        placeholderTitle='No Data'
        placeholderDescription='No sensor data for this vessel'
        placeholderMessage='Connect sensors to this vessel'
      />
    );
  } catch (error) {
    console.error('Error fetching vessel sensor data:', error);
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

async function VesselSensorChart({ vesselShortId }: { vesselShortId: string }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  try {
    // Create an array to hold promises for all sensor types
    const sensorTypes: SensorType[] = [
      'voltage',
      'temperature',
      'humidity',
      'pressure',
      'water',
      'fuel',
      'battery',
    ];

    const sensorDataPromises = sensorTypes.map((type) =>
      getSensorHistory(session.user.id, type, 30, vesselShortId)
    );

    // Wait for all requests to complete
    const allSensorData = await Promise.all(sensorDataPromises);

    // Merge all sensor data into a single array
    const combinedSensorData = allSensorData.flat();

    return <ChartAreaInteractive sensorData={combinedSensorData} />;
  } catch (error) {
    console.error('Error fetching vessel sensor history:', error);
    return (
      <div className='p-6 text-center'>
        <p>Failed to load vessel sensor history data.</p>
      </div>
    );
  }
}

export default async function VesselPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const vesselShortId = (await params).shortId;
  //const vesselShortId = shortId;

  return (
    <>
      <SiteHeader title='Vessel' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <Suspense fallback={<SectionCards isLoading={true} sensors={[]} />}>
              <VesselSensorCards vesselId={vesselShortId} />
            </Suspense>
            <div className='px-4 lg:px-6'>
              <Suspense
                fallback={
                  <div className='bg-muted h-[250px] animate-pulse rounded-lg'></div>
                }
              >
                <VesselSensorChart vesselShortId={vesselShortId} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
