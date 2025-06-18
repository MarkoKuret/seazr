'use client';

import { IconAlertCircle, IconCircleDashedCheck } from '@tabler/icons-react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { VesselStatusType } from '@/lib/vessel-status';
import Link from 'next/link';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VesselStatus {
  id: string;
  shortId: string;
  name: string;
  status: VesselStatusType;
  lastSeen: string;
  issues?: string[];
}

function VesselStatusCard({ vessel }: { vessel: VesselStatus }) {
  const lastSeenDate = new Date(vessel.lastSeen);
  return (
    <Link
      href={`/vessels/${vessel.shortId}?name=${encodeURIComponent(vessel.name)}`}
    >
      <Card className='@container/card relative min-h-[180px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardDescription></CardDescription>
            <CardTitle className='text-xl font-semibold @[250px]/card:text-2xl'>
              {vessel.name}
            </CardTitle>
          </div>
          <div className='flex items-center'>
            {vessel.status === 'good' && (
              <IconCircleDashedCheck className='text-green-500' size={30} />
            )}
            {vessel.status === 'warning' && (
              <IconAlertCircle className='text-red-500' size={30} />
            )}
            {vessel.status === 'error' && (
              <IconAlertCircle className='text-amber-500' size={30} />
            )}
          </div>
        </CardHeader>

        <Tooltip>
          <TooltipTrigger>
            <CardFooter className='w-full flex-col items-start gap-1.5 text-left text-sm'>
              <div className='line-clamp-1 flex w-full gap-2 text-left font-medium'>
                {vessel.status === 'good' ? 'All systems normal' : ''}
              </div>
              {vessel.issues &&
                vessel.issues.length > 0 &&
                vessel.status !== 'good' && (
                  <div
                    className={`w-full text-left text-sm ${
                      vessel.status === 'warning'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {vessel.issues[0]}
                    {vessel.issues.length > 1 &&
                      `  (+${vessel.issues.length - 1} more)`}

                    <TooltipContent
                      side='bottom'
                      className='text-md text-black'
                    >
                      {vessel.issues.map((issue, index) => (
                        <p key={`${vessel.id}-issue-${index}`}>{issue}</p>
                      ))}
                    </TooltipContent>
                  </div>
                )}
              <div className='text-muted-foreground'>
                {(() => {
                  const isToday =
                    lastSeenDate.getDate() === new Date().getDate();
                  const formattedTime = isToday
                    ? lastSeenDate.toLocaleTimeString(['hr-HR'], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : lastSeenDate.toLocaleString('hr-HR');
                  return `Last seen: ${formattedTime}`;
                })()}
              </div>
            </CardFooter>
          </TooltipTrigger>
        </Tooltip>
      </Card>
    </Link>
  );
}

interface VesselStatusCardsProps {
  vessels: VesselStatus[];
  isLoading?: boolean;
  minCards?: number;
  placeholderTitle?: string;
  placeholderDescription?: string;
  placeholderMessage?: string;
}

export function VesselStatusCards({
  vessels = [],
  isLoading = false,
  minCards = 4,
  placeholderTitle = 'No Vessels',
  placeholderDescription = 'No vessels available',
  placeholderMessage = 'Add vessels to get started',
}: VesselStatusCardsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
        {[...Array(minCards)].map((_, i) => (
          <Card key={i} className='@container/card min-h-[180px] animate-pulse'>
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
      {vessels.map((vessel) => (
        <VesselStatusCard key={vessel.id} vessel={vessel} />
      ))}

      {vessels.length < minCards &&
        [...Array(minCards - vessels.length)].map((_, i) => (
          <Card
            key={`placeholder-${i}`}
            className='@container/card min-h-[180px]'
          >
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
