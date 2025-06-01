'use client';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SensorReading } from '@/types';

interface SectionCardsProps {
  sensors: SensorReading[];
  isLoading?: boolean;
  minCards?: number;
  placeholderTitle?: string;
  placeholderDescription?: string;
  placeholderMessage?: string;
}

export function SectionCards({
  sensors = [],
  isLoading = false,
  minCards = 4,
  placeholderTitle = 'No Sensor',
  placeholderDescription = 'No data available',
  placeholderMessage = 'Add more sensors to your vessel',
}: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
        {[...Array(minCards)].map((_, i) => (
          <Card key={i} className='@container/card animate-pulse'>
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
              <CardTitle className='bg-muted h-8 rounded'></CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='bg-muted h-4 w-24 rounded'></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      {sensors.map((sensor) => (
        <Card key={sensor.id} className='@container/card'>
          <CardHeader>
            <CardDescription>{sensor.type.toUpperCase()}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {sensor.value} {sensor.unit}
            </CardTitle>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='text-muted-foreground'>
              Updated: {new Date(sensor.time).toLocaleTimeString('hr-HR')}
            </div>
          </CardFooter>
        </Card>
      ))}

      {/* Display placeholder cards if we have fewer than minCards sensors */}
      {sensors.length < minCards &&
        [...Array(minCards - sensors.length)].map((_, i) => (
          <Card key={`placeholder-${i}`} className='@container/card'>
            <CardHeader>
              <CardDescription>{placeholderTitle}</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                --
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {placeholderDescription}
              </div>
              <div className='text-muted-foreground'>{placeholderMessage}</div>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}
