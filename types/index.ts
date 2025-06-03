/**
 * Sensor related types
 */

// All possible sensor types
export type SensorType =
  | 'voltage'
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'water'
  | 'fuel'
  | 'battery';

export type SensorUnit = 'V' | '°C' | 'L' | '%' | 'hPa';

// Single sensor reading model
export interface SensorReading {
  id: string;
  type: SensorType;
  value: number;
  time: string;
  vesselId: string;
  unit: SensorUnit;
}

// Historical data point for charts
export interface SensorHistoryPoint {
  date: string;
  value: number;
  vesselId: string;
  type: SensorType;
}

// Raw data returned from InfluxDB
export interface InfluxRecord {
  _time: string;
  _value: number;
  vesselId: string;
  sensorType: string;
  sensorId?: string;
  time?: string; // Some queries return time instead of _time
  value?: number; // Some queries return value instead of _value
}

/**
 * Vessel related types
 */
export interface Vessel {
  id: string;
  shortId: string;
  name: string;
  description?: string;
}

/**
 * User permission types
 */
export interface Permission {
  id: string;
  userId: string;
  vesselId: string;
  level?: 'owner' | 'viewer' | 'editor';
  vessel: {
    shortId: string;
  };
}

/**
 * Chart configuration
 */
export interface ChartSensorConfig {
  label: string;
  color: string;
  unit: SensorUnit;
}

export type ChartConfigMap = {
  [key in SensorType]: ChartSensorConfig;
};
