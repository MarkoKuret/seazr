import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SensorType, SensorUnit } from '@/types';

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
