'use server';

import { prisma } from '@/lib/prisma';
import { Vessel } from '@prisma/client';

export async function getUserVessels(userId: string): Promise<Vessel[]> {
  try {
    const permissions = await prisma.permission.findMany({
      where: { userId },
      include: {
        vessel: true,
      },
    });

    return permissions.map((p) => p.vessel);
  } catch (error) {
    console.error('Failed to fetch vessels', error);
    return [];
  }
}

export async function addVessel({
  userId,
  name,
  shortId,
  description,
}: {
  userId: string;
  name: string;
  shortId: string;
  description?: string;
}) {
  try {
    const existingVessel = await prisma.vessel.findUnique({
      where: { shortId },
    });

    if (existingVessel) {
      return { error: 'A vessel with this ID already exists' };
    }

    const vessel = await prisma.$transaction(async (tx) => {
      const newVessel = await tx.vessel.create({
        data: {
          name,
          shortId,
          description,
        },
      });

      await tx.permission.create({
        data: {
          userId,
          vesselId: newVessel.id,
        },
      });

      return newVessel;
    });

    return { vessel };
  } catch (error) {
    console.error('Failed to add vessel', error);
    return { error: 'Failed to add vessel' };
  }
}

export async function deleteVessel({
  userId,
  vesselId,
}: {
  userId: string;
  vesselId: string;
}) {
  try {
    // Check if user has permission to delete this vessel
    const permission = await prisma.permission.findFirst({
      where: {
        userId,
        vessel: {
          id: vesselId,
        },
      },
    });

    if (!permission) {
      return { error: 'You do not have permission to delete this vessel' };
    }

    // Delete vessel and related permissions
    await prisma.$transaction(async (tx) => {
      await tx.permission.deleteMany({
        where: { vesselId },
      });

      await tx.vessel.delete({
        where: { id: vesselId },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete vessel', error);
    return { error: 'Failed to delete vessel' };
  }
}

export async function updateVessel({
  userId,
  vesselId,
  name,
  description,
}: {
  userId: string;
  vesselId: string;
  name: string;
  description?: string;
}) {
  try {
    // Check if user has permission to update this vessel
    const permission = await prisma.permission.findFirst({
      where: {
        userId,
        vessel: {
          id: vesselId,
        },
      },
    });

    if (!permission) {
      return { error: 'You do not have permission to update this vessel' };
    }

    // Update vessel
    const updatedVessel = await prisma.vessel.update({
      where: { id: vesselId },
      data: {
        name,
        description,
      },
    });

    return { vessel: updatedVessel };
  } catch (error) {
    console.error('Failed to update vessel', error);
    return { error: 'Failed to update vessel' };
  }
}
