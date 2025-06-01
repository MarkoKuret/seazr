import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getAllSensorValues, getSensorHistory } from '@/server/sensor-action';
import { SensorType } from '@/types';
import { Suspense } from 'react';
import { getSession } from '@/server/auth-action';

import data from './data.json';

async function SensorCards() {
  const session = await getSession();

  if (!session?.user) {
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

async function SensorChart() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  try {
    // Default to voltage data with 90 days of history
    const sensorData = await getSensorHistory(
      session.user.id,
      'voltage' as SensorType,
      90
    );
    return <ChartAreaInteractive sensorData={sensorData} />;
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    return (
      <div className='p-6 text-center'>
        <p>Failed to load sensor history data.</p>
      </div>
    );
  }
}

export default async function Page() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant='inset'
        user={{
          name: session.user.name,
          email: session.user.email,
          image: '/avatars/shadcn.jpg',
        }}
      />
      <SidebarInset>
        <SiteHeader title='Dashboard' />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              <Suspense
                fallback={<SectionCards isLoading={true} sensors={[]} />}
              >
                <SensorCards />
              </Suspense>
              <div className='px-4 lg:px-6'>
                <Suspense
                  fallback={
                    <div className='bg-muted h-[250px] animate-pulse rounded-lg'></div>
                  }
                >
                  <SensorChart />
                </Suspense>
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
