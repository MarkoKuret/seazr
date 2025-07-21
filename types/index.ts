export interface User {
  name: string;
  email: string;
  role: string;
}

/**
 * Sensor related types
 */

// All possible sensor types
export type SensorType =
  | 'Battery'
  | 'Temperature'
  | 'Humidity'
  | 'Pressure'
  | 'Wind'
  | 'Water'
  | 'Fuel'
  | 'Bilge'; // Added new sensor type

export type SensorUnit = 'V' | '°C' | 'L' | '%' | 'hPa' | 'kn' | '';

export interface SensorReading {
  id?: string;
  type: SensorType;
  value: number;
  time: string;
  vesselId: string;
  unit: SensorUnit;
}

export interface InfluxSensor {
  _time: string;
  _value: number;
  vesselId: string;
  sensorType: string;
  sensorId?: string;
  time?: string;
  value?: number; //?! neke vracaju valu i time u razlicitim formatima
}

/**
 * Vessel related types
 */
export interface Vessel {
  id: string;
  shortId: string;
  name: string;
  description?: string | null;
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

export interface VesselLocation {
  vesselId: string;
  vesselName?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export type VesselStatusType = 'nominal' | 'expired' | 'warning' | 'alarm';
