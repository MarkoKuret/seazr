import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusDescription } from '@/lib/vessel-status';
import { VesselStatusType } from '@/types';
import { StatusIcon, getStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface VesselStatusViewProps {
  status: {
    status: VesselStatusType;
    description: StatusDescription[];
  };
}

export function VesselStatusView({ status }: VesselStatusViewProps) {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Vessel Status</CardTitle>
            <StatusBadge status={status.status} />
          </div>
        </CardHeader>
        <CardContent>
          <ul className='space-y-4'>
            {status.description.map((desc, index) => (
              <li key={`status-${index}`} className='flex items-center gap-3'>
                <StatusIcon status={desc.status} size={20} variant='filled' />
                <span className={getStatusColor(desc.status)}>{desc.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: VesselStatusType }) {
  switch (status) {
    case 'nominal':
      return (
        <Badge className='bg-green-100 text-green-800 hover:bg-green-200'>
          Nominal
        </Badge>
      );
    case 'warning':
      return (
        <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-200'>
          Warning
        </Badge>
      );
    case 'alarm':
      return (
        <Badge className='bg-red-100 text-red-800 hover:bg-red-200'>
          Alarm
        </Badge>
      );
    case 'expired':
      return (
        <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200'>
          Expired
        </Badge>
      );
    default:
      return null;
  }
}
