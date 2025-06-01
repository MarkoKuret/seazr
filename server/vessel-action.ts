'use server';

import { prisma } from '@/lib/prisma';

export async function getUserVessels(userId: string) {
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
