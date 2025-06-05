import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SensorType, SensorUnit } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function getUnitForSensorType(sensorType: SensorType): SensorUnit {
  switch (sensorType) {
    case 'voltage':
      return 'V';
    case 'temperature':
      return '°C';
    case 'humidity':
      return '%';
    case 'pressure':
      return 'hPa';
    case 'water':
      return 'L';
    case 'fuel':
      return 'L';
    case 'battery':
      return '%';
    default:
      throw new Error("Unknown sensor type");
  }
}

export function getSensorTypeLabel(sensorType: SensorType): string {
  switch (sensorType) {
    case 'voltage':
      return 'Voltage';
    case 'temperature':
      return 'Temperature';
    case 'humidity':
      return 'Humidity';
    case 'pressure':
      return 'Pressure';
    case 'water':
      return 'Water Level';
    case 'fuel':
      return 'Fuel Level';
    case 'battery':
      return 'Battery';
    default:
      throw new Error("Unknown sensor type");
  }
}

export function getSensorTypeColor(sensorType: SensorType): string {
  switch (sensorType) {
    case 'voltage':
    case 'battery':
      return '#4ade80'; // Green
    case 'temperature':
      return '#f97316'; // Orange
    case 'humidity':
      return '#3b82f6'; // Blue
    case 'pressure':
      return '#8b5cf6'; // Purple
    case 'water':
      return '#06b6d4'; // Cyan
    case 'fuel':
      return '#005F6A'; // Petrol
    default:
      throw new Error("Unknown sensor type");
  }
}