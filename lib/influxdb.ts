import { InfluxDBClient } from '@influxdata/influxdb3-client';
import {
  InfluxSensor,
  VesselLocation,
  SensorReading,
  SensorType,
} from '@/types';
import { getUnitForSensorType } from '@/lib/utils';

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
    client = new InfluxDBClient({ host, token, database }); //?! provjerit jeli ovo najbolji način
  }
  return client;
}

/**
 * Map sensor types to their measurements in the database
 */
function getMeasurementsForType(sensorType: SensorType): string[] {
  const sensorTypeMap: Record<SensorType, string[]> = {
    Voltage: ['Voltage', 'Battery'],
    Battery: ['Voltage', 'Battery'],
    Temperature: ['Temperature'],
    Humidity: ['Humidity'],
    Pressure: ['Pressure'],
    Water: ['Water'],
    Fuel: ['Fuel'],
  };

  return sensorTypeMap[sensorType] || [sensorType];
}

/**
 * Execute a query with error handling
 */
async function executeSensorQuery(query: string): Promise<InfluxSensor[]> {
  try {
    const client = getInfluxClient();
    const rows: InfluxSensor[] = [];
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
    throw error;
  }
}

async function executeLocationQuery(query: string): Promise<VesselLocation[]> {
  try {
    const client = getInfluxClient();
    const rows: VesselLocation[] = [];
    const result = client.query(query, database);

    for await (const row of result) {
      rows.push({
        timestamp: row.time || row._time,
        vesselId: row.vesselId || 'unknown',
        latitude: row.latitude !== undefined ? parseFloat(row.latitude) : 0,
        longitude: row.longitude !== undefined ? parseFloat(row.longitude) : 0,
      });
    }

    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
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

    const rows = await executeSensorQuery(sqlQuery);

    return rows.map((row) => ({
      id: row.sensorId || row.vesselId + '-' + row.sensorType,
      type: row.sensorType as SensorType,
      value: row._value,
      time: row._time,
      vesselId: row.vesselId,
      unit: getUnitForSensorType(row.sensorType as SensorType),
    }));
  } catch (error) {
    console.error('Error fetching all sensor data:', error);
    return [];
  }
}

// /**
//  * Get historical data for Battery/Voltage sensors
//  * @deprecated Use getSensorHistoryData with type='Voltage' instead
//  */
// export async function getBatteryHistoryData(
//   vesselShortIds: string[],
//   days: number = 30
// ): Promise<InfluxSensor[]> {
//   return getSensorHistoryData(vesselShortIds, 'Voltage', days);
// }

/**
 * Get historical data for any sensor type
 */
export async function getSensorHistoryData(
  vesselShortIds: string[],
  sensorType: SensorType = 'Voltage',
  days: number = 30
): Promise<SensorReading[]> {
  if (vesselShortIds.length === 0) return [];

  try {
    // Get the appropriate sensor types to query
    const types = getMeasurementsForType(sensorType);

    // Format for SQL
    const formattedTypes = types
      .map((type) => `'${type.toLowerCase()}'`)
      .join(', ');
    const formattedVesselIds = vesselShortIds.map((id) => `'${id}'`).join(', ');

    const sqlQuery = `
      SELECT time, value, "vesselId", "sensorType"
      FROM sensor
      WHERE time >= now() - interval '${days} days'
      AND "sensorType" IN (${formattedTypes})
      AND "vesselId" IN (${formattedVesselIds})
      ORDER BY time ASC
    `;

    const rows = await executeSensorQuery(sqlQuery);

    return rows.map((point) => ({
      time: new Date(point._time).toISOString(),
      value: point._value,
      vesselId: point.vesselId,
      type: sensorType,
      unit: getUnitForSensorType(sensorType),
    }));
  } catch (error) {
    console.error(`Error fetching ${sensorType} history data:`, error);
    return [];
  }
}

/**
 * Gets the latest location data for specified vessels
 * @param vesselIds Array of vessel IDs to fetch locations for
 */
export async function getVesselLocationData(
  vesselShortIds: string[]
): Promise<VesselLocation[]> {
  if (vesselShortIds.length === 0) return [];
  const formattedVesselIds = vesselShortIds.map((id) => `'${id}'`).join(', ');

  try {
    const sqlQuery = `
      SELECT DISTINCT ON ("vesselId") "vesselId", latitude, longitude, time
      FROM "location"
      WHERE "vesselId" IN (${formattedVesselIds})
      ORDER BY "vesselId", time DESC
    `;

    const rows = await executeLocationQuery(sqlQuery);
    return rows;
  } catch (error) {
    console.error('Error querying vessel location data:', error);
    throw error;
  }
}
