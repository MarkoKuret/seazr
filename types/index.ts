/**
 * Sensor related types
 */

// All possible sensor types
export type SensorType =
  | 'Voltage'
  | 'Temperature'
  | 'Humidity'
  | 'Pressure'
  | 'Water'
  | 'Fuel'
  | 'Battery';

export type SensorUnit = 'V' | '°C' | 'L' | '%' | 'hPa' | '';

export function getSensorUnit(type: SensorType): SensorUnit {
  switch (type) {
    case 'Voltage':
    case 'Battery':
      return 'V';
    case 'Temperature':
      return '°C';
    case 'Humidity':
      return '%';
    case 'Pressure':
      return 'hPa';
    case 'Water':
    case 'Fuel':
      return 'L';
    default:
      return 'V';
  }
}

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
