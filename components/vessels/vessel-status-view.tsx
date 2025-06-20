import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  VesselStatusType,
  VesselStatusColor,
  StatusDescription,
} from '@/lib/vessel-status';
import { Badge } from '@/components/ui/badge';
import {
  IconAlertCircle,
  IconCircleCheckFilled,
  IconClockHour4,
} from '@tabler/icons-react';

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
                <StatusIcon status={desc.status} />
                <span className={VesselStatusColor[desc.status]}>
                  {desc.text}
                </span>
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

function StatusIcon({ status }: { status: VesselStatusType }) {
  const className = VesselStatusColor[status];

  switch (status) {
    case 'nominal':
      return <IconCircleCheckFilled className={className} size={20} />;
    case 'warning':
      return <IconAlertCircle className={className} size={20} />;
    case 'alarm':
      return <IconAlertCircle className={className} size={20} />;
    case 'expired':
      return <IconClockHour4 className={className} size={20} />;
    default:
      return null;
  }
}
