import { SensorReading } from '@/types';

export type VesselStatusType = 'nominal' | 'expired' | 'warning' | 'alarm';

export const VesselStatusColor: Record<VesselStatusType, string> = {
  nominal: 'text-green-600',
  expired: 'text-gray-400',
  warning: 'text-amber-500',
  alarm: 'text-red-500',
};

interface StatusThresholds {
  Voltage: { warning: number; alarm: number };
  Temperature: {
    warningLow: number;
    warningHigh: number;
    alarmLow: number;
    alarmHigh: number;
  };
  Humidity: { warning: number; alarm: number };
  Water: { warning: number; alarm: number };
  Fuel: { warning: number; alarm: number };
  Battery: { warning: number; alarm: number };
}

const DEFAULT_THRESHOLDS: StatusThresholds = {
  Voltage: { warning: 11.8, alarm: 11.2 },
  Temperature: { warningLow: 5, warningHigh: 40, alarmLow: 0, alarmHigh: 50 },
  Humidity: { warning: 85, alarm: 95 },
  Water: { warning: 10, alarm: 30 },
  Fuel: { warning: 20, alarm: 10 },
  Battery: { warning: 30, alarm: 20 },
};

const DATA_MAX_AGE = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export interface VesselHealthStatus {
  status: VesselStatusType;
  description: string[];
}

/**
 * Determines vessel status based on sensor data and location information
 */
export function determineVesselStatus(
  sensorReadings: SensorReading[],
  thresholds: StatusThresholds = DEFAULT_THRESHOLDS
): VesselHealthStatus {
  const description: string[] = [];
  let status: VesselStatusType = 'nominal';

  if (sensorReadings.length === 0) {
    return {
      status: 'expired',
      description: ['No sensor data available'],
    };
  }

  const timeNow = new Date().getTime();

  for (const reading of sensorReadings) {
    const dataAge = timeNow - new Date(reading.time).getTime();
    if (dataAge > DATA_MAX_AGE) {
      status = 'expired';
      description.push(`Expired ${reading.type.toLowerCase()} data`);
      continue;
    }

    switch (reading.type) {
      case 'Voltage':
      case 'Battery':
        if (reading.value <= thresholds[reading.type].alarm) {
          status = 'alarm';
          description.push(
            `Low ${reading.type}: ${reading.value}${reading.unit}`
          );
        } else if (reading.value <= thresholds[reading.type].warning) {
          if (status !== 'alarm') status = 'warning';
          description.push(
            `${reading.type} is low: ${reading.value}${reading.unit}`
          );
        }
        break;

      case 'Temperature':
        if (
          reading.value <= thresholds.Temperature.alarmLow ||
          reading.value >= thresholds.Temperature.alarmHigh
        ) {
          status = 'alarm';
          description.push(
            `Temperature critical: ${reading.value}${reading.unit}`
          );
        } else if (
          reading.value <= thresholds.Temperature.warningLow ||
          reading.value >= thresholds.Temperature.warningHigh
        ) {
          if (status !== 'alarm') status = 'warning';
          description.push(
            `Temperature abnormal: ${reading.value}${reading.unit}`
          );
        }
        break;

      case 'Water':
        if (reading.value >= thresholds.Water.alarm) {
          status = 'alarm';
          description.push(
            `Water level critical: ${reading.value}${reading.unit}`
          );
        } else if (reading.value >= thresholds.Water.warning) {
          if (status !== 'alarm') status = 'warning';
          description.push(
            `Water level elevated: ${reading.value}${reading.unit}`
          );
        }
        break;

      case 'Fuel':
        if (reading.value <= thresholds.Fuel.alarm) {
          status = 'alarm';
          description.push(
            `Fuel critically low: ${reading.value}${reading.unit}`
          );
        } else if (reading.value <= thresholds.Fuel.warning) {
          if (status !== 'alarm') status = 'warning';
          description.push(`Fuel low: ${reading.value}${reading.unit}`);
        }
        break;

      case 'Humidity':
        if (reading.value >= thresholds.Humidity.alarm) {
          status = 'alarm';
          description.push(
            `Humidity critical: ${reading.value}${reading.unit}`
          );
        } else if (reading.value >= thresholds.Humidity.warning) {
          if (status !== 'alarm') status = 'warning';
          description.push(`High Humidity: ${reading.value}${reading.unit}`);
        }
        break;
    }
  }

  if (status === 'nominal') {
    description.push('Nominal');
  }

  return {
    status,
    description,
  };
}
