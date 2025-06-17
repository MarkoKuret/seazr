'use client';

import dynamic from 'next/dynamic';
import type { VesselLocation } from '@/types';

// The dynamic import is defined here, in a client component.
const VesselMap = dynamic(() => import('@/components/vessel-map'), {
  loading: () => (
    <div className='bg-muted-foreground/10 h-[400px] animate-pulse rounded-lg'></div>
  ),
  ssr: false,
});

interface VesselMapLoaderProps {
  locations: VesselLocation[];
}

// This component acts as a client-side boundary that can be used in Server Components
export default function VesselMapLoader({ locations }: VesselMapLoaderProps) {
  return <VesselMap locations={locations} />;
}
