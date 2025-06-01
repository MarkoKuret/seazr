// app/actions/sensor-data.ts
'use server'

import { getAllSensorData, getBatteryHistoryData } from '@/lib/influxdb'
import { prisma } from '@/lib/prisma'

export async function getAllSensorValues(userId: string) {

  const permissions = await prisma.permission.findMany({
    where: {
      userId: userId
    },
    select: {
      vessel: {
        select: {
          shortId: true
        }
      }
    }
  });

  const vesselShortId = permissions.map(permission => permission.vessel.shortId);

  try {
    const data = await getAllSensorData(vesselShortId);
    return data
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Battery history function using proper separation of concerns
export async function getBatteryHistory(userId: string, days: number = 30) {
  const permissions = await prisma.permission.findMany({
    where: {
      userId: userId
    },
    select: {
      vessel: {
        select: {
          shortId: true
        }
      }
    }
  });

  const vesselShortIds = permissions.map(permission => permission.vessel.shortId);

  try {
    // Get the raw data from the influxdb layer
    const rawData = await getBatteryHistoryData(vesselShortIds, days);

    // Transform the data if needed for the client
    return rawData.map(point => ({
      date: new Date(point._time).toISOString(),
      value: point._value,
      vesselId: point.vesselId
    }));
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// New function to get sensor history
export async function getSensorHistory(
  userId: string,
  sensorType: string = 'voltage',
  days: number = 30
) {
  // Get vessels the user has permission to access
  const permissions = await prisma.permission.findMany({
    where: {
      userId: userId
    },
    select: {
      vessel: {
        select: {
          shortId: true
        }
      }
    }
  });

  const vesselShortIds = permissions.map(permission => permission.vessel.shortId);

  // If no permissions, return empty array
  if (vesselShortIds.length === 0) {
    return [];
  }

  try {
    // Get the raw data from the influxdb layer
    const { getSensorHistoryData } = await import('@/lib/influxdb');
    const data = await getSensorHistoryData(vesselShortIds, sensorType, days);

    // Format the data for the chart
    return data.map(point => ({
      date: new Date(point._time).toISOString(),
      value: point._value,
      vesselId: point.vesselId,
      type: sensorType
    }));
  } catch (error: any) {
    console.error("Error fetching sensor history:", error);
    throw new Error(error.message);
  }
}