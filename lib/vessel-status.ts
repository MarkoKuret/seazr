import { SensorReading, VesselStatusType } from '@/types';

// New interface for individual status descriptions
export interface StatusDescription {
  text: string;
  status: VesselStatusType;
}

interface StatusThresholds {
  Battery: { warning: number; alarm: number };
  Temperature: {
    warningLow: number;
    warningHigh: number;
    alarmLow: number;
    alarmHigh: number;
  };
  Humidity: { warning: number; alarm: number };
  Water: { warning: number; alarm: number };
  Fuel: { warning: number; alarm: number };
  Bilge: { threshold: number }; // Threshold for bilge (1 = water detected)
}

const DEFAULT_THRESHOLDS: StatusThresholds = {
  Battery: { warning: 11.8, alarm: 11.2 },
  Temperature: { warningLow: 5, warningHigh: 40, alarmLow: 0, alarmHigh: 50 },
  Humidity: { warning: 85, alarm: 95 },
  Water: { warning: 10, alarm: 30 },
  Fuel: { warning: 20, alarm: 10 },
  Bilge: { threshold: 0.5 }, // Above this value means water is detected
};

const DATA_MAX_AGE = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export interface VesselHealthStatus {
  status: VesselStatusType;
  description: StatusDescription[]; // Now uses the new interface
}

/**
 * Determines vessel status based on sensor data and location information
 */
export function determineVesselStatus(
  sensorReadings: SensorReading[],
  thresholds: StatusThresholds = DEFAULT_THRESHOLDS
): VesselHealthStatus {
  const description: StatusDescription[] = [];
  let status: VesselStatusType = 'nominal';

  if (sensorReadings.length === 0) {
    return {
      status: 'expired',
      description: [{ text: 'No sensor data available', status: 'expired' }],
    };
  }

  const timeNow = new Date().getTime();

  for (const reading of sensorReadings) {
    const dataAge = timeNow - new Date(reading.time).getTime();
    if (dataAge > DATA_MAX_AGE) {
      if (status == 'nominal') {
        status = 'expired';
      }
      description.push({
        text: `Expired ${reading.type.toLowerCase()} data`,
        status: 'expired',
      });
      continue;
    }

    switch (reading.type) {
      case 'Battery':
        if (reading.value <= thresholds[reading.type].alarm) {
          status = 'alarm';
          description.push({
            text: `Low ${reading.type}: ${reading.value}${reading.unit}`,
            status: 'alarm',
          });
        } else if (reading.value <= thresholds[reading.type].warning) {
          if (status !== 'alarm') status = 'warning';
          description.push({
            text: `${reading.type} is low: ${reading.value}${reading.unit}`,
            status: 'warning',
          });
        }
        break;

      case 'Temperature':
        if (
          reading.value <= thresholds.Temperature.alarmLow ||
          reading.value >= thresholds.Temperature.alarmHigh
        ) {
          status = 'alarm';
          description.push({
            text: `Temperature critical: ${reading.value}${reading.unit}`,
            status: 'alarm',
          });
        } else if (
          reading.value <= thresholds.Temperature.warningLow ||
          reading.value >= thresholds.Temperature.warningHigh
        ) {
          if (status !== 'alarm') status = 'warning';
          description.push({
            text: `Temperature abnormal: ${reading.value}${reading.unit}`,
            status: 'warning',
          });
        }
        break;

      case 'Water':
        if (reading.value >= thresholds.Water.alarm) {
          status = 'alarm';
          description.push({
            text: `Water level critical: ${reading.value}${reading.unit}`,
            status: 'alarm',
          });
        } else if (reading.value >= thresholds.Water.warning) {
          if (status !== 'alarm') status = 'warning';
          description.push({
            text: `Water level elevated: ${reading.value}${reading.unit}`,
            status: 'warning',
          });
        }
        break;

      case 'Fuel':
        if (reading.value <= thresholds.Fuel.alarm) {
          status = 'alarm';
          description.push({
            text: `Fuel critically low: ${reading.value}${reading.unit}`,
            status: 'alarm',
          });
        } else if (reading.value <= thresholds.Fuel.warning) {
          if (status !== 'alarm') status = 'warning';
          description.push({
            text: `Fuel low: ${reading.value}${reading.unit}`,
            status: 'warning',
          });
        }
        break;

      case 'Humidity':
        if (reading.value >= thresholds.Humidity.alarm) {
          status = 'alarm';
          description.push({
            text: `Humidity critical: ${reading.value}${reading.unit}`,
            status: 'alarm',
          });
        } else if (reading.value >= thresholds.Humidity.warning) {
          if (status !== 'alarm') status = 'warning';
          description.push({
            text: `High Humidity: ${reading.value}${reading.unit}`,
            status: 'warning',
          });
        }
        break;

      case 'Bilge':
        if (reading.value > thresholds.Bilge.threshold) {
          status = 'alarm';
          description.push({
            text: 'Water detected in bilge',
            status: 'alarm',
          });
        }
        break;
    }
  }

  if (status === 'nominal') {
    description.push({
      text: 'Nominal',
      status: 'nominal',
    });
  }

  return {
    status,
    description,
  };
}
