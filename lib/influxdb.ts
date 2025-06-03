import { InfluxDBClient } from '@influxdata/influxdb3-client';
import { InfluxRecord, SensorReading, SensorType, SensorUnit } from '@/types';

// Configuration - ideally moved to a separate config service
const host = process.env.INFLUX_HOST || 'http://localhost';
const token = process.env.INFLUX_TOKEN || 'your-token';
const database = process.env.INFLUX_DATABASE || 'vessel_sensors';

// Singleton pattern for client (only create once)
let client: InfluxDBClient | null = null;

/**
 * Get the InfluxDB client instance
 */
function getInfluxClient(): InfluxDBClient {
  if (!client) {
    client = new InfluxDBClient({ host, token, database });
  }
  return client;
}

/**
 * Map sensor types to their measurements in the database
 */
function getMeasurementsForType(sensorType: SensorType): string[] {
  const sensorTypeMap: Record<SensorType, string[]> = {
    voltage: ['voltage', 'battery'],
    battery: ['voltage', 'battery'],
    temperature: ['temperature'],
    humidity: ['humidity'],
    pressure: ['pressure'],
    water: ['water'],
    fuel: ['fuel'],
  };

  return sensorTypeMap[sensorType] || [sensorType];
}

/**
 * Get the appropriate unit for a sensor type
 */
export function getUnitForSensorType(type: string): SensorUnit {
  const typeToUnit: Record<string, SensorUnit> = {
    voltage: 'V',
    battery: 'V',
    temperature: '°C',
    humidity: '%',
    pressure: 'hPa',
    water: 'L',
    fuel: 'L',
  };

  return typeToUnit[type as SensorType] || 'V';
}

/**
 * Execute a query with error handling
 */
async function executeQuery(query: string): Promise<InfluxRecord[]> {
  try {
    const client = getInfluxClient();
    const rows: InfluxRecord[] = [];
    const result = client.query(query, database);

    for await (const row of result) {
      rows.push({
        _time: row.time || row._time,
        _value: row.value !== undefined ? row.value : row._value,
        vesselId: row.vesselId || 'unknown',
        sensorType: row.sensorType || row._measurement || 'unknown',
        sensorId: row.sensorId,
      });
    }

    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
}

/**
 * Get the most recent data for all sensors of specified vessels
 */
export async function getAllSensorData(
  vesselShortIds: string[]
): Promise<SensorReading[]> {
  if (vesselShortIds.length === 0) return [];

  try {
    const formattedVesselIds = vesselShortIds.map((id) => `'${id}'`).join(', ');

    const sqlQuery = `
      SELECT DISTINCT ON ("sensorId") *
      FROM sensor
      WHERE "vesselId" IN (${formattedVesselIds})
      ORDER BY "sensorId", time DESC
    `;

    const rows = await executeQuery(sqlQuery);

    // Transform raw data to application model
    return rows.map((row) => ({
      id: row.sensorId || row.vesselId + '-' + row.sensorType,
      type: row.sensorType as SensorType,
      value: row._value,
      time: row._time,
      vesselId: row.vesselId,
      unit: getUnitForSensorType(row.sensorType),
    }));
  } catch (error) {
    console.error('Error fetching all sensor data:', error);
    return [];
  }
}

/**
 * Get historical data for battery/voltage sensors
 * @deprecated Use getSensorHistoryData with type='voltage' instead
 */
export async function getBatteryHistoryData(
  vesselShortIds: string[],
  days: number = 30
): Promise<InfluxRecord[]> {
  return getSensorHistoryData(vesselShortIds, 'voltage', days);
}

/**
 * Get historical data for any sensor type
 */
export async function getSensorHistoryData(
  vesselShortIds: string[],
  sensorType: SensorType = 'voltage',
  days: number = 30
): Promise<InfluxRecord[]> {
  if (vesselShortIds.length === 0) return [];

  try {
    // Get the appropriate sensor types to query
    const types = getMeasurementsForType(sensorType);

    // Format for SQL
    const formattedTypes = types.map((type) => `'${type}'`).join(', ');
    const formattedVesselIds = vesselShortIds.map((id) => `'${id}'`).join(', ');

    const sqlQuery = `
      SELECT time, value, "vesselId", "sensorType"
      FROM sensor
      WHERE time >= now() - interval '${days} days'
      AND "sensorType" IN (${formattedTypes})
      AND "vesselId" IN (${formattedVesselIds})
      ORDER BY time ASC
    `;

    return await executeQuery(sqlQuery);
  } catch (error) {
    console.error(`Error fetching ${sensorType} history data:`, error);
    return [];
  }
}
