import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SensorType, SensorUnit } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUnitForSensorType(sensorType: SensorType): SensorUnit {
  switch (sensorType) {
    case 'Voltage':
      return 'V';
    case 'Temperature':
      return '°C';
    case 'Humidity':
      return '%';
    case 'Pressure':
      return 'hPa';
    case 'Water':
      return 'L';
    case 'Fuel':
      return 'L';
    case 'Battery':
      return '%';
    default:
      return ''; // Default to empty string for unknown types
  }
}

export function getSensorTypeLabel(sensorType: SensorType): string {
  switch (sensorType) {
    case 'Voltage':
      return 'Voltage';
    case 'Temperature':
      return 'Temperature';
    case 'Humidity':
      return 'Humidity';
    case 'Pressure':
      return 'Pressure';
    case 'Water':
      return 'Water Level';
    case 'Fuel':
      return 'Fuel Level';
    case 'Battery':
      return 'Battery';
    default:
      return 'Unknown sensor type';
  }
}

export function getSensorTypeColor(sensorType: SensorType): string {
  switch (sensorType) {
    case 'Voltage':
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
    default:
      return '#000000'; // Black for unknown types
  }
}
