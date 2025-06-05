'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SensorReading } from '@/types';

// Helper component for sensor cards with hover state
function SensorCard({ sensor }: { sensor: SensorReading }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className='@container/card transition-all duration-200'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <CardDescription>
          {sensor.type.toUpperCase()}
          <span
            className={`ml-1 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={!isHovered}
          >
            - {sensor.id}
          </span>
        </CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {sensor.value.toFixed(2)} {sensor.unit}
        </CardTitle>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='text-muted-foreground'>
          Updated: {new Date(sensor.time).toLocaleTimeString('hr-HR')}
        </div>
      </CardFooter>
    </Card>
  );
}

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
        <SensorCard key={sensor.id} sensor={sensor} />
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
