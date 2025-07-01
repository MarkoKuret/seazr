import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SensorType, SensorUnit } from '@/types';
import {
  IconAlertCircle,
  IconCircleDashedCheck,
  IconCircleCheckFilled,
  IconClockHour4,
} from '@tabler/icons-react';
import { VesselStatusType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUnitForSensorType(sensorType: SensorType): SensorUnit {
  switch (sensorType) {
    case 'Battery':
      return 'V';
    case 'Temperature':
      return '°C';
    case 'Humidity':
      return '%';
    case 'Pressure':
      return 'hPa';
    case 'Wind':
      return 'kn';
    case 'Water':
      return 'L';
    case 'Fuel':
      return 'L';
    default:
      return ''; // Default to empty string for unknown types
  }
}

export function getSensorTypeColor(sensorType: SensorType): string {
  switch (sensorType) {
    case 'Battery':
      return '#4ade80'; // Green
    case 'Temperature':
      return '#f97316'; // Orange
    case 'Humidity':
      return '#3b82f6'; // Blue
    case 'Pressure':
      return '#8b5cf6'; // Purple
    case 'Water':
      return '#06b6d4'; // Cyan
    case 'Fuel':
      return '#005F6A'; // Petrol
    case 'Bilge':
      return '#ef4444'; // Red (indicating potential problem)
    default:
      return '#000000'; // Black for unknown types
  }
}

interface StatusIconProps {
  status: VesselStatusType;
  size?: number;
  variant?: 'default' | 'filled';
}

const VesselStatusColor: Record<VesselStatusType, string> = {
  nominal: 'text-green-600',
  expired: 'text-gray-400',
  warning: 'text-amber-500',
  alarm: 'text-red-500',
};

export function StatusIcon({
  status,
  size = 16,
  variant = 'default',
}: StatusIconProps) {
  const className = VesselStatusColor[status];

  switch (status) {
    case 'nominal':
      return variant === 'filled' ? (
        <IconCircleCheckFilled className={className} size={size} />
      ) : (
        <IconCircleDashedCheck className={className} size={size} />
      );
    case 'warning':
      return <IconAlertCircle className={className} size={size} />;
    case 'alarm':
      return <IconAlertCircle className={className} size={size} />;
    case 'expired':
      return <IconClockHour4 className={className} size={size} />;
    default:
      return null;
  }
}

export function getStatusColor(status: VesselStatusType): string {
  return VesselStatusColor[status];
}

export function urlBase64ToUint8Array(base64String: string) {
  try {
    // Make sure we have a string
    if (!base64String) {
      throw new Error('Empty VAPID key provided');
    }

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('Error converting base64 to Uint8Array:', error);
    throw new Error('Invalid VAPID public key format');
  }
}
