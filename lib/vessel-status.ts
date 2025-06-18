import { SensorReading } from '@/types';

export type VesselStatusType = 'good' | 'warning' | 'error';

interface StatusThresholds {
  Voltage: { warning: number; error: number };
  Temperature: {
    warningLow: number;
    warningHigh: number;
    errorLow: number;
    errorHigh: number;
  };
  Humidity: { warning: number; error: number };
  Water: { warning: number; error: number };
  Fuel: { warning: number; error: number };
  Battery: { warning: number; error: number };
}

// Define thresholds for different sensor types
// These should be adjusted based on actual vessels and sensor specifications
const DEFAULT_THRESHOLDS: StatusThresholds = {
  Voltage: { warning: 11.8, error: 11.2 }, // 12V system thresholds
  Temperature: { warningLow: 5, warningHigh: 40, errorLow: 0, errorHigh: 50 },
  Humidity: { warning: 85, error: 95 },
  Water: { warning: 10, error: 30 }, // Bilge Water level thresholds
  Fuel: { warning: 20, error: 10 }, // Percentage remaining
  Battery: { warning: 30, error: 20 }, // Percentage remaining
};

// Max age for data before considering it stale (in milliseconds)
const DATA_MAX_AGE = {
  warning: 6 * 60 * 60 * 1000, // 6 hours
  error: 24 * 60 * 60 * 1000, // 24 hours
};

export interface VesselHealthStatus {
  status: VesselStatusType;
  issues: string[];
}

/**
 * Determines vessel status based on sensor data and location information
 */
export function determineVesselStatus(
  sensorReadings: SensorReading[],
  thresholds: StatusThresholds = DEFAULT_THRESHOLDS
): VesselHealthStatus {
  const issues: string[] = [];
  let status: VesselStatusType = 'good';

  if (sensorReadings.length === 0) {
    return {
      status: 'error',
      issues: ['No sensor data available'],
    };
  }

  const now = new Date();

  for (const reading of sensorReadings) {
    const readingTime = new Date(reading.time);
    const dataAge = now.getTime() - readingTime.getTime();

    // Check if data is stale
    if (dataAge > DATA_MAX_AGE.error) {
      status = 'error';
      issues.push(`No recent ${reading.type} data (over 24 hours old)`);
      continue;
    } else if (dataAge > DATA_MAX_AGE.warning) {
      if (status !== 'error') status = 'warning';
      issues.push(`${reading.type} data is outdated (over 6 hours old)`);
      continue;
    }

    // Check specific sensor values against thresholds
    switch (reading.type) {
      case 'Voltage':
      case 'Battery':
        if (reading.value <= thresholds[reading.type].error) {
          status = 'error';
          issues.push(`Low ${reading.type}: ${reading.value}${reading.unit}`);
        } else if (reading.value <= thresholds[reading.type].warning) {
          if (status !== 'error') status = 'warning';
          issues.push(
            `${reading.type} is low: ${reading.value}${reading.unit}`
          );
        }
        break;

      case 'Temperature':
        if (
          reading.value <= thresholds.Temperature.errorLow ||
          reading.value >= thresholds.Temperature.errorHigh
        ) {
          status = 'error';
          issues.push(`Temperature critical: ${reading.value}${reading.unit}`);
        } else if (
          reading.value <= thresholds.Temperature.warningLow ||
          reading.value >= thresholds.Temperature.warningHigh
        ) {
          if (status !== 'error') status = 'warning';
          issues.push(`Temperature abnormal: ${reading.value}${reading.unit}`);
        }
        break;

      case 'Water':
        if (reading.value >= thresholds.Water.error) {
          status = 'error';
          issues.push(`Water level critical: ${reading.value}${reading.unit}`);
        } else if (reading.value >= thresholds.Water.warning) {
          if (status !== 'error') status = 'warning';
          issues.push(`Water level elevated: ${reading.value}${reading.unit}`);
        }
        break;

      case 'Fuel':
        if (reading.value <= thresholds.Fuel.error) {
          status = 'error';
          issues.push(`Fuel critically low: ${reading.value}${reading.unit}`);
        } else if (reading.value <= thresholds.Fuel.warning) {
          if (status !== 'error') status = 'warning';
          issues.push(`Fuel low: ${reading.value}${reading.unit}`);
        }
        break;

      case 'Humidity':
        if (reading.value >= thresholds.Humidity.error) {
          status = 'error';
          issues.push(`Humidity critical: ${reading.value}${reading.unit}`);
        } else if (reading.value >= thresholds.Humidity.warning) {
          if (status !== 'error') status = 'warning';
          issues.push(`High Humidity: ${reading.value}${reading.unit}`);
        }
        break;
    }
  }

  return {
    status,
    issues,
  };
}
