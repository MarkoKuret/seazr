// app/actions/sensor-data.ts
'use server';

import {
  getAllSensorData,
  getBatteryHistoryData,
  getSensorHistoryData as fetchSensorHistoryData,
} from '@/lib/influxdb';
import { prisma } from '@/lib/prisma';
import { SensorHistoryPoint, SensorReading, SensorType } from '@/types';

/**
 * Gets vessels shortIds a user has permission to access
 * @private utility function
 */
async function getUserVesselShortIds(userId: string): Promise<string[]> {
  const permissions = await prisma.permission.findMany({
    where: {
      userId: userId,
    },
    select: {
      vessel: {
        select: {
          shortId: true,
        },
      },
    },
  });

  return permissions.map((permission) => permission.vessel.shortId);
}

/**
 * Get all current sensor values for vessels a user has access to
 * @param userId The user ID
 * @param vesselId Optional vessel ID to filter by
 */
export async function getAllSensorValues(
  userId: string,
  vesselId?: string
): Promise<SensorReading[]> {
  try {
    if (vesselId) {
      const hasPermission = await checkUserVesselPermission(userId, vesselId);
      if (!hasPermission) {
        throw new Error('You do not have permission to access this vessel');
      }

      return await getAllSensorData([vesselId]);
    }

    // Otherwise get data for all vessels the user has access to
    const vesselShortIds = await getUserVesselShortIds(userId);
    return await getAllSensorData(vesselShortIds);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(message);
  }
}

/**
 * Get battery history for a user's permitted vessels
 * @deprecated Use getSensorHistory with type='voltage' instead
 */
export async function getBatteryHistory(
  userId: string,
  days: number = 30
): Promise<SensorHistoryPoint[]> {
  try {
    const vesselShortIds = await getUserVesselShortIds(userId);
    const rawData = await getBatteryHistoryData(vesselShortIds, days);

    return rawData.map((point) => ({
      date: new Date(point._time).toISOString(),
      value: point._value,
      vesselId: point.vesselId,
      type: 'voltage' as SensorType,
    }));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(message);
  }
}

/**
 * Get history for any sensor type from vessels a user has access to
 * @param userId The user ID
 * @param sensorType The type of sensor to get history for
 * @param days Number of days of history to fetch
 * @param vesselId Optional vessel ID to filter by
 */
export async function getSensorHistory(
  userId: string,
  sensorType: SensorType = 'voltage',
  days: number = 30,
  vesselId?: string
): Promise<SensorHistoryPoint[]> {
  try {
    // If vesselId is provided, just use that (after verifying permissions)
    if (vesselId) {
      const hasPermission = await checkUserVesselPermission(userId, vesselId);
      if (!hasPermission) {
        throw new Error('You do not have permission to access this vessel');
      }

      // Get the raw data from the influxdb layer
      const data = await fetchSensorHistoryData([vesselId], sensorType, days);

      // Format the data for the chart
      return data.map((point) => ({
        date: new Date(point._time).toISOString(),
        value: point._value,
        vesselId: point.vesselId,
        type: sensorType,
      }));
    }

    // Otherwise get data for all vessels the user has access to
    const vesselShortIds = await getUserVesselShortIds(userId);

    // If no permissions, return empty array
    if (vesselShortIds.length === 0) {
      return [];
    }

    // Get the raw data from the influxdb layer
    const data = await fetchSensorHistoryData(vesselShortIds, sensorType, days);

    // Format the data for the chart
    return data.map((point) => ({
      date: new Date(point._time).toISOString(),
      value: point._value,
      vesselId: point.vesselId,
      type: sensorType,
    }));
  } catch (error: unknown) {
    console.error('Error fetching sensor history:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(message);
  }
}

// Add a helper function to check if a user has permission to access a vessel
async function checkUserVesselPermission(
  userId: string,
  vesselId: string
): Promise<boolean> {
  const permission = await prisma.permission.findFirst({
    where: {
      userId: userId,
      vessel: {
        shortId: vesselId,
      },
    },
  });

  return !!permission;
}
