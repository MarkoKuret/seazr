'use server';

import {
  getAllSensorData,
  getSensorHistoryData,
} from '@/lib/influxdb';
import { prisma } from '@/lib/prisma';
import { SensorReading, SensorType } from '@/types';
import { getUnitForSensorType } from '@/lib/utils';
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

    const vesselShortIds = await getUserVesselShortIds(userId);
    return await getAllSensorData(vesselShortIds);
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
): Promise<SensorReading[]> {
  try {
    if (vesselId) {
      const hasPermission = await checkUserVesselPermission(userId, vesselId);
      if (!hasPermission) {
        throw new Error('You do not have permission to access this vessel');
      }

      return await getSensorHistoryData([vesselId], sensorType, days);
    }

    const vesselShortIds = await getUserVesselShortIds(userId);

    if (vesselShortIds.length === 0) {
      return [];
    }

    return await getSensorHistoryData(vesselShortIds, sensorType, days);
  } catch (error: unknown) {
    console.error('Error fetching sensor history:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(message);
  }
}

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
