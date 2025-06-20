'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function VesselPageTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className='px-4 lg:px-6'>
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList className='grid w-full max-w-xs grid-cols-2'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='status'>Status</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
