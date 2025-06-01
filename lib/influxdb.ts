import {InfluxDBClient } from '@influxdata/influxdb3-client'

// const url = process.env.INFLUX_URL || 'http://localhost:8086'
// const token = process.env.INFLUX_TOKEN || 'your-token'
// const org = process.env.INFLUX_ORG || 'your-org'
// const bucket = process.env.INFLUX_BUCKET || 'vessel_sensors'

const host = process.env.INFLUX_HOST || 'http://localhost'
const token = process.env.INFLUX_TOKEN || 'your-token'
const database = process.env.INFLUX_DATABASE || 'vessel_sensors'

const client = new InfluxDBClient({host, token, database})

// export async function getSensorData(
//   sensorId: string,
//   startTime: string = '-24h',
//   endTime: string = 'now()',
//   userId: string,
//   prisma: any
// ) {
//   const sensor = await prisma.sensor.findUnique({
//     where: { id: sensorId },
//     include: { vessel: true },
//   })

//   if (!sensor) {
//     throw new Error('Sensor not found')
//   }

//   const permission = await prisma.permission.findUnique({
//     where: {
//       userId_vesselId: {
//         userId: userId,
//         vesselId: sensor.vesselId,
//       },
//     },
//   })

//   if (!permission) {
//     throw new Error('Access denied')
//   }

//   const fluxQuery = `
//     from(bucket: "${bucket}")
//       |> range(start: ${startTime}, stop: ${endTime})
//       |> filter(fn: (r) => r._measurement == "sensor")
//       |> filter(fn: (r) => r.sensor_id == "${sensorId}")`

//   const result = await client.collectRows(fluxQuery)
//   return result
// }

export async function getAllSensorData(
  vesselShortId: string[],
) {
  try {
    // const fluxQuery = `
    //   from(bucket: "${database}")
    //     |> range(start: ${startTime}, stop: ${endTime})
    //     |> filter(fn: (r) => r._measurement == "sensor")
    //     |> last()
    //     |> group(columns: ["sensor_id", "sensor_name", "sensor_type"])
    // `

    //     const sqlQuery = `
    //   SELECT *
    //   FROM sensor
    //   WHERE time >= now() - interval '24 hours'
    //   GROUP BY vesselId, sensorType, sensorId
    // `

    // const sqlQuery = `
    //   SELECT *
    //   FROM sensor
    //   WHERE time >= now() - interval '24 hours'
    //   LIMIT 100

    // SELECT s.*
    //   FROM sensor s
    //   JOIN (
    //     SELECT "sensorId", MAX(time) as max_time
    //     FROM sensor
    //     GROUP BY "sensorId"
    //   ) latest
    //   ON s."sensorId" = latest."sensorId" AND s.time = latest.max_time

    // `

      const formattedVesselIds = vesselShortId.map(id => `'${id}'`).join(', ');

//     const sqlQuery = `
// SELECT DISTINCT ON ("sensorId") *
// FROM sensor
// ORDER BY "sensorId", time DESC
//     `;

    const sqlQuery = `
SELECT DISTINCT ON ("sensorId") *
FROM sensor
WHERE "vesselId" IN (${formattedVesselIds})
ORDER BY "sensorId", time DESC
    `;

    const rows: any[] = [];
    const result = client.query(sqlQuery, database);
    for await (const row of result) {
  rows.push({
    id: row.sensorId || 'unknown',
    type: row.sensorType || 'UNKNOWN',
    value: row.value,
    time: row.time,
    vesselId: row.vesselId || 'unknown',
    unit: getUnitForSensorType(row.sensorType)
  });
}

    return rows
  } catch (error) {
    console.error('Error fetching all sensor data:', error)
    return []
  }
}

// Add this after getAllSensorData function

export async function getBatteryHistoryData(
  vesselShortIds: string[],
  days: number = 30
) {
  try {
    const formattedVesselIds = vesselShortIds.map(id => `'${id}'`).join(', ');

    // For InfluxDB v1 (SQL-like syntax)
    // Adjust this query based on your actual database structure
    const sqlQuery = `
      SELECT time, value, "vesselId"
      FROM sensor
      WHERE time >= now() - interval '${days} days'
      AND ("sensorType" = 'battery' OR "sensorType" = 'voltage')
      AND "vesselId" IN (${formattedVesselIds})
      ORDER BY time ASC
    `;

    // For InfluxDB v2 (Flux syntax)
    // const fluxQuery = `
    //   from(bucket: "${database}")
    //     |> range(start: -${days}d)
    //     |> filter(fn: (r) => r["_measurement"] == "voltage" or r["_measurement"] == "battery")
    //     |> filter(fn: (r) => contains(value: r["vesselId"], set: [${vesselShortIds.map(id => `"${id}"`).join(',')}]))
    //     |> aggregateWindow(every: 6h, fn: mean)
    //     |> yield(name: "mean")
    // `;

    const rows: any[] = [];
    const result = client.query(sqlQuery, database);

    for await (const row of result) {
      rows.push({
        _time: row.time,
        _value: row.value,
        vesselId: row.vesselId || 'unknown'
      });
    }

    return rows;
  } catch (error) {
    console.error('Error fetching battery history data:', error);
    return [];
  }
}

// Updated getSensorHistoryData function

export async function getSensorHistoryData(
  vesselShortIds: string[],
  sensorType: string = 'voltage',
  days: number = 30
) {
  try {
    // Map sensor types to how they're stored in your database
    // This is the key part that's likely causing your issue
    const sensorTypeMap: Record<string, string[]> = {
      'voltage': ['voltage', 'battery'], // Support both names
      'temperature': ['temperature'],
      'humidity': ['humidity'],
      'pressure': ['pressure'],
      'water_level': ['water_level']
    };

    // Get the appropriate sensor types to query
    const types = sensorTypeMap[sensorType] || [sensorType];

    // Create a properly formatted list of types for the SQL query
    const formattedTypes = types.map(type => `'${type}'`).join(', ');
    const formattedVesselIds = vesselShortIds.map(id => `'${id}'`).join(', ');

    // Change your SQL query to correctly filter by the sensor type
    // Use "sensorType" column which is what your database seems to use based on getAllSensorData
    const sqlQuery = `
      SELECT time, value, "vesselId", "sensorType"
      FROM sensor
      WHERE time >= now() - interval '${days} days'
      AND "sensorType" IN (${formattedTypes})
      AND "vesselId" IN (${formattedVesselIds})
      ORDER BY time ASC
    `;

    console.log(`Fetching ${sensorType} data with query:`, sqlQuery);

    const rows: any[] = [];
    const result = client.query(sqlQuery, database);

    for await (const row of result) {
      // Make sure to include the original sensor type in the response
      rows.push({
        _time: row.time,
        _value: row.value,
        vesselId: row.vesselId || 'unknown',
        sensorType: sensorType // Use the requested type rather than db value for consistency
      });
    }

    console.log(`Found ${rows.length} ${sensorType} data points`);
    return rows;
  } catch (error) {
    console.error(`Error fetching ${sensorType} history data:`, error);
    return [];
  }
}

// Helper function to determine appropriate unit based on sensor type
export function getUnitForSensorType(type: string): string {
  const typeToUnit: Record<string, string> = {
    'voltage': 'V',
    'battery': 'V',
    'temperature': '°C',
    'humidity': '%',
    'pressure': 'hPa',
    'water_level': '%'
  };

  return typeToUnit[type] || '';
}

/**
 * Execute a query against InfluxDB and return formatted results
 * @param vesselShortIds Array of vessel IDs for tracking
 * @param query The SQL query to execute
 * @returns Formatted array of query results
 */
async function executeQuery(vesselShortIds: string[], query: string) {
  try {
    // SQL query format for vessel IDs
    const formattedVesselIds = vesselShortIds.map(id => `'${id}'`).join(', ');

    // Replace the placeholder in the query with actual vessel IDs if needed
    const finalQuery = query.replace('${formattedVesselIds}', formattedVesselIds);

    const rows: any[] = [];
    const result = client.query(finalQuery, database);

    for await (const row of result) {
      rows.push({
        _time: row.time,
        _value: row.value,
        vesselId: row.vesselId || 'unknown',
        sensorType: row.sensorType
      });
    }

    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    return [];
  }
}