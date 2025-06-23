'use server';

import { prisma } from '@/lib/prisma';
import { getSensorHistoryData, getVesselLocationData } from '@/lib/influxdb';
import { SensorReading, VesselLocation } from '@/types';
import { StatusDescription } from '@/lib/vessel-status';

type ReportData = {
  vesselName: string;
  startDate: string;
  endDate: string;
  distanceTraveled: number;
  fuelConsumption: number;
  waterConsumption: number;
  alarmHistory: StatusDescription[];
};

async function checkUserVesselPermission(
  userId: string,
  vesselShortId: string
): Promise<boolean> {
  const permission = await prisma.permission.findFirst({
    where: {
      userId: userId,
      vessel: {
        shortId: vesselShortId,
      },
    },
  });

  return !!permission;
}

async function calculateDistance(locations: VesselLocation[]): Promise<number> {
  // Sort locations by timestamp
  const sortedLocations = [...locations].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let totalDistance = 0;

  // Calculate distance between each consecutive position
  for (let i = 0; i < sortedLocations.length - 1; i++) {
    const loc1 = sortedLocations[i];
    const loc2 = sortedLocations[i + 1];

    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.latitude * Math.PI) / 180) *
        Math.cos((loc2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Add to total distance if the movement is significant (filter out GPS jitter)
    if (distance > 0.05) {
      // Consider movements over 50 meters
      totalDistance += distance;
    }
  }

  // Convert to nautical miles
  return totalDistance * 0.539957;
}

async function calculateConsumption(
  readings: SensorReading[],
  type: string
): Promise<number> {
  // Filter only the readings we need
  const relevantReadings = readings.filter((r) => r.type === type);

  if (relevantReadings.length < 2) {
    return 0;
  }

  // Sort by time
  const sorted = [...relevantReadings].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  // For simplicity, calculate the difference between first and last reading
  // More complex logic would analyze the trend over time
  const firstReading = sorted[0];
  const lastReading = sorted[sorted.length - 1];

  // If the values are percentages or levels, calculate the difference
  if (firstReading.value > lastReading.value) {
    return firstReading.value - lastReading.value;
  }

  return 0; // Default to 0 if no consumption detected
}

async function getAlarmHistory(
  readings: SensorReading[]
): Promise<StatusDescription[]> {
  // Group readings by sensor type
  const readingsByType: Record<string, SensorReading[]> = {};

  readings.forEach((reading) => {
    if (!readingsByType[reading.type]) {
      readingsByType[reading.type] = [];
    }
    readingsByType[reading.type].push(reading);
  });

  const alarms: StatusDescription[] = [];
  const alarmRegistry = new Set<string>(); // Track unique alarm signatures

  // Process Battery readings
  if (readingsByType['Battery']) {
    const batteryReadings = readingsByType['Battery'].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const criticalBattery = batteryReadings.find((r) => r.value <= 11.2);
    if (criticalBattery && !alarmRegistry.has('battery-critical')) {
      alarms.push({
        text: `Critical Battery Level: ${criticalBattery.value}${criticalBattery.unit} - at ${new Date(criticalBattery.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('battery-critical');
    } else {
      const lowBattery = batteryReadings.find((r) => r.value <= 11.8);
      if (lowBattery && !alarmRegistry.has('battery-low')) {
        alarms.push({
          text: `Low Battery Warning: ${lowBattery.value}${lowBattery.unit} - at ${new Date(lowBattery.time).toLocaleString('hr-HR')}`,
          status: 'warning',
        });
        alarmRegistry.add('battery-low');
      }
    }
  }

  // Process Bilge readings
  if (readingsByType['Bilge']) {
    const bilgeReadings = readingsByType['Bilge'].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const bilgeAlarm = bilgeReadings.find((r) => r.value > 0.5);
    if (bilgeAlarm && !alarmRegistry.has('bilge-water')) {
      alarms.push({
        text: `Water detected in bilge - at ${new Date(bilgeAlarm.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('bilge-water');
    }
  }

  // Process Water level readings
  if (readingsByType['Water']) {
    const waterReadings = readingsByType['Water'].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const criticalWater = waterReadings.find((r) => r.value >= 30);
    if (criticalWater && !alarmRegistry.has('water-critical')) {
      alarms.push({
        text: `Critical water level: ${criticalWater.value}${criticalWater.unit} - at ${new Date(criticalWater.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('water-critical');
    } else {
      const elevatedWater = waterReadings.find((r) => r.value >= 10);
      if (elevatedWater && !alarmRegistry.has('water-elevated')) {
        alarms.push({
          text: `Elevated water level: ${elevatedWater.value}${elevatedWater.unit} - at ${new Date(elevatedWater.time).toLocaleString('hr-HR')}`,
          status: 'warning',
        });
        alarmRegistry.add('water-elevated');
      }
    }
  }

  // Process Fuel readings
  if (readingsByType['Fuel']) {
    const fuelReadings = readingsByType['Fuel'].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const criticalFuel = fuelReadings.find((r) => r.value <= 10);
    if (criticalFuel && !alarmRegistry.has('fuel-critical')) {
      alarms.push({
        text: `Fuel critically low: ${criticalFuel.value}${criticalFuel.unit} - at ${new Date(criticalFuel.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('fuel-critical');
    } else {
      const lowFuel = fuelReadings.find((r) => r.value <= 20);
      if (lowFuel && !alarmRegistry.has('fuel-low')) {
        alarms.push({
          text: `Fuel low: ${lowFuel.value}${lowFuel.unit} - at ${new Date(lowFuel.time).toLocaleString('hr-HR')}`,
          status: 'warning',
        });
        alarmRegistry.add('fuel-low');
      }
    }
  }

  // Process Humidity readings
  if (readingsByType['Humidity']) {
    const humidityReadings = readingsByType['Humidity'].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const criticalHumidity = humidityReadings.find((r) => r.value >= 95);
    if (criticalHumidity && !alarmRegistry.has('humidity-critical')) {
      alarms.push({
        text: `Humidity critical: ${criticalHumidity.value}${criticalHumidity.unit} - at ${new Date(criticalHumidity.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('humidity-critical');
    } else {
      const highHumidity = humidityReadings.find((r) => r.value >= 85);
      if (highHumidity && !alarmRegistry.has('humidity-high')) {
        alarms.push({
          text: `High Humidity: ${highHumidity.value}${highHumidity.unit} - at ${new Date(highHumidity.time).toLocaleString('hr-HR')}`,
          status: 'warning',
        });
        alarmRegistry.add('humidity-high');
      }
    }
  }

  // Process Temperature readings
  if (readingsByType['Temperature']) {
    const tempReadings = readingsByType['Temperature'].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const criticalHighTemp = tempReadings.find((r) => r.value >= 50);
    const criticalLowTemp = tempReadings.find((r) => r.value <= 0);

    if (criticalHighTemp && !alarmRegistry.has('temperature-critical-high')) {
      alarms.push({
        text: `Temperature critically high: ${criticalHighTemp.value}${criticalHighTemp.unit} - at ${new Date(criticalHighTemp.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('temperature-critical-high');
    } else if (
      criticalLowTemp &&
      !alarmRegistry.has('temperature-critical-low')
    ) {
      alarms.push({
        text: `Temperature critically low: ${criticalLowTemp.value}${criticalLowTemp.unit} - at ${new Date(criticalLowTemp.time).toLocaleString('hr-HR')}`,
        status: 'alarm',
      });
      alarmRegistry.add('temperature-critical-low');
    } else {
      const warningHighTemp = tempReadings.find((r) => r.value >= 40);
      const warningLowTemp = tempReadings.find((r) => r.value <= 5);

      if (warningHighTemp && !alarmRegistry.has('temperature-warning-high')) {
        alarms.push({
          text: `Temperature high: ${warningHighTemp.value}${warningHighTemp.unit} - at ${new Date(warningHighTemp.time).toLocaleString('hr-HR')}`,
          status: 'warning',
        });
        alarmRegistry.add('temperature-warning-high');
      } else if (
        warningLowTemp &&
        !alarmRegistry.has('temperature-warning-low')
      ) {
        alarms.push({
          text: `Temperature low: ${warningLowTemp.value}${warningLowTemp.unit} - at ${new Date(warningLowTemp.time).toLocaleString('hr-HR')}`,
          status: 'warning',
        });
        alarmRegistry.add('temperature-warning-low');
      }
    }
  }

  return alarms;
}

function generateHTMLReport(data: ReportData): string {
  const startDate = new Date(data.startDate).toLocaleDateString();
  const endDate = new Date(data.endDate).toLocaleDateString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.vesselName} - Vessel Report (${startDate} to ${endDate})</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #045c75;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
    }
    .logo {
      margin-bottom: 20px;
    }
    .summary-box {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      flex: 1;
      min-width: 200px;
      background-color: #fff;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #045c75;
      margin: 10px 0;
    }
    .stat-label {
      color: #64748b;
      font-size: 0.9rem;
      text-transform: uppercase;
    }
    .alarm-list {
      background-color: #fff;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
    }
    .alarm-warning {
      background-color: #fef9c3;
      color: #854d0e;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .alarm-critical {
      background-color: #fee2e2;
      color: #b91c1c;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #64748b;
      font-size: 0.9rem;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.vesselName} - Vessel Report</h1>
    <p>Report period: ${startDate} to ${endDate}</p>
  </div>

  <div class="summary-box">
    <h2>Trip Summary</h2>
    <p>This report contains data collected from ${data.vesselName} during the selected time period. It includes distance traveled, resource consumption, and any alerts that were triggered.</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Distance Traveled</div>
      <div class="stat-value">${data.distanceTraveled.toFixed(1)}</div>
      <div>nautical miles</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Fuel Consumption</div>
      <div class="stat-value">${data.fuelConsumption.toFixed(1)}</div>
      <div>liters</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Water Consumption</div>
      <div class="stat-value">${data.waterConsumption.toFixed(1)}</div>
      <div>liters</div>
    </div>
  </div>

  <h2>Alarm History</h2>
  ${
    data.alarmHistory.length === 0
      ? '<p>No alarms were triggered during this period.</p>'
      : `<div class="alarm-list">
      ${data.alarmHistory
        .map(
          (alarm) => `
        <div class="${alarm.status === 'alarm' ? 'alarm-critical' : 'alarm-warning'}">
          ${alarm.text}
        </div>
      `
        )
        .join('')}
    </div>`
  }

  <div class="footer">
    <p>Generated by Seazr on ${new Date().toLocaleString('hr-HR')}</p>
    <p>© ${new Date().getFullYear()} Seazr - Maritime IoT</p>
  </div>
</body>
</html>
  `;
}

export async function generateVesselReport({
  userId,
  vesselShortId,
  startDate,
  endDate,
  vesselName,
}: {
  userId: string;
  vesselShortId: string;
  startDate: string;
  endDate: string;
  vesselName: string;
}) {
  try {
    // Verify user has permission to access this vessel
    const hasPermission = await checkUserVesselPermission(
      userId,
      vesselShortId
    );
    if (!hasPermission) {
      return { error: "You don't have permission to access this vessel" };
    }

    // Get all sensor data for the timeframe
    const sensorTypes = [
      'Battery',
      'Temperature',
      'Humidity',
      'Pressure',
      'Wind',
      'Water',
      'Fuel',
      'Bilge',
    ];
    const sensorPromises = sensorTypes.map((type) =>
      getSensorHistoryData(
        vesselShortId,
        type as any,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (24 * 60 * 60 * 1000)
        )
      )
    );
    const sensorData = (await Promise.all(sensorPromises)).flat();

    // Filter data to the selected time range
    const timeFilteredData = sensorData.filter((reading) => {
      const readingTime = new Date(reading.time).getTime();
      return (
        readingTime >= new Date(startDate).getTime() &&
        readingTime <= new Date(endDate).getTime()
      );
    });

    // Get location data
    const locationData = await getVesselLocationData([vesselShortId]);
    const timeFilteredLocations = locationData.filter((loc) => {
      const locTime = new Date(loc.timestamp).getTime();
      return (
        locTime >= new Date(startDate).getTime() &&
        locTime <= new Date(endDate).getTime()
      );
    });

    // Calculate metrics
    const distanceTraveled = await calculateDistance(timeFilteredLocations);
    const fuelConsumption = await calculateConsumption(
      timeFilteredData,
      'Fuel'
    );
    const waterConsumption = await calculateConsumption(
      timeFilteredData,
      'Water'
    );
    const alarmHistory = await getAlarmHistory(timeFilteredData);

    // Generate report data
    const reportData: ReportData = {
      vesselName,
      startDate,
      endDate,
      distanceTraveled,
      fuelConsumption,
      waterConsumption,
      alarmHistory,
    };

    // Generate HTML report
    const htmlReport = generateHTMLReport(reportData);

    // Create data URL for the HTML content
    const reportUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlReport)}`;

    return { reportUrl };
  } catch (error) {
    console.error('Error generating vessel report:', error);
    return { error: 'Failed to generate report' };
  }
}
