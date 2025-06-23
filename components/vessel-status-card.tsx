'use client';

import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { VesselStatusType } from '@/types';
import { StatusIcon, getStatusColor } from '@/lib/utils';
import Link from 'next/link';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatusDescription {
  status: VesselStatusType;
  text: string;
}

interface VesselStatus {
  shortId: string;
  name: string;
  status: VesselStatusType;
  lastSeen: string;
  description: StatusDescription[]; // Update to use StatusDescription[]
}

function VesselStatusCard({ vessel }: { vessel: VesselStatus }) {
  const lastSeenDate = new Date(vessel.lastSeen);
  return (
    <Link
      href={`/vessels/${vessel.shortId}?name=${encodeURIComponent(vessel.name)}`}
    >
      <Card className='from-primary/5 @container/card relative min-h-[180px] bg-gradient-to-t shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardDescription></CardDescription>
            <CardTitle className='line-clamp-1 text-xl font-semibold @[250px]/card:text-2xl'>
              {vessel.name}
            </CardTitle>
          </div>
          <div className='flex items-center'>
            <StatusIcon status={vessel.status} size={30} />
          </div>
        </CardHeader>

        <Tooltip>
          <TooltipTrigger>
            <CardContent>
              <div className={`${getStatusColor(vessel.status)} text-left`}>
                {vessel.description[0].text}
                {vessel.description.length > 1 &&
                  `  (+${vessel.description.length - 1} more)`}
                <TooltipContent side='bottom' className='text-md text-black'>
                  {vessel.description.map((issue, index) => (
                    <div
                      key={`${vessel.shortId}-issue-${index}`}
                      className='flex items-center gap-2'
                    >
                      <StatusIcon status={issue.status} />
                      <span className={getStatusColor(issue.status)}>
                        {issue.text}
                      </span>
                    </div>
                  ))}
                </TooltipContent>
              </div>
            </CardContent>

            <CardFooter className='text-left sm:text-sm'>
              <div className='text-muted-foreground'>
                {(() => {
                  if (isNaN(lastSeenDate.getTime()))
                    return 'Connect sensors to see status';
                  const isToday =
                    lastSeenDate.getDate() === new Date().getDate();
                  const formattedTime = isToday
                    ? lastSeenDate.toLocaleTimeString(['hr-HR'], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : lastSeenDate.toLocaleDateString('hr-HR');
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
    <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 @6xl/main:grid-cols-5'>
      {vessels.map((vessel) => (
        <VesselStatusCard key={vessel.shortId} vessel={vessel} />
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
