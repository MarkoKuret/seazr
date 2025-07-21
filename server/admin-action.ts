'use server';

import { prisma } from '@/lib/prisma';
import { Role, Vessel } from '@prisma/client';

/**
 * Gets all vessels in the system (admin only)
 * @param adminId The ID of the admin user
 */
export async function getAllVessels(adminId: string): Promise<Vessel[]> {
  try {
    // Verify the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (user?.role !== Role.ADMIN) {
      throw new Error('Unauthorized access');
    }

    // Get all vessels
    const vessels = await prisma.vessel.findMany({
      orderBy: { name: 'asc' },
    });

    return vessels;
  } catch (error) {
    console.error('Failed to fetch vessels', error);
    return [];
  }
}

/**
 * Gets all users with access to a vessel
 * @param adminId The ID of the admin user
 * @param vesselId The ID of the vessel
 */
export async function getVesselUsers(
  adminId: string,
  vesselId: string
): Promise<{ id: string; email: string; name: string | null }[]> {
  try {
    // Verify the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (user?.role !== Role.ADMIN) {
      throw new Error('Unauthorized access');
    }

    // Get all users with access to this vessel
    const permissions = await prisma.permission.findMany({
      where: { vesselId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return permissions.map((permission) => permission.user);
  } catch (error) {
    console.error('Failed to fetch vessel users', error);
    return [];
  }
}

/**
 * Adds a user to a vessel by email
 * @param userId The ID of the admin user
 * @param vesselId The ID of the vessel
 * @param email The email of the user to add
 */
export async function addUserToVessel({
  userId,
  vesselId,
  email,
}: {
  userId: string;
  vesselId: string;
  email: string;
}) {
  try {
    // Verify the user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (adminUser?.role !== Role.ADMIN) {
      return { error: 'Unauthorized access' };
    }

    // Find the user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return { error: 'User not found' };
    }

    // Check if permission already exists
    const existingPermission = await prisma.permission.findFirst({
      where: {
        userId: userToAdd.id,
        vesselId,
      },
    });

    if (existingPermission) {
      return { error: 'User already has access to this vessel' };
    }

    // Create the permission
    await prisma.permission.create({
      data: {
        userId: userToAdd.id,
        vesselId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to add user to vessel', error);
    return { error: 'Failed to add user to vessel' };
  }
}

/**
 * Removes a user's access from a vessel
 * @param adminUserId The ID of the admin user
 * @param vesselId The ID of the vessel
 * @param userIdToRemove The ID of the user to remove
 */
export async function removeUserFromVessel({
  adminUserId,
  vesselId,
  userIdToRemove,
}: {
  adminUserId: string;
  vesselId: string;
  userIdToRemove: string;
}) {
  try {
    // Verify the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { role: true },
    });

    if (user?.role !== Role.ADMIN) {
      return { error: 'Unauthorized access' };
    }

    // Delete the permission
    await prisma.permission.deleteMany({
      where: {
        userId: userIdToRemove,
        vesselId: vesselId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove user from vessel', error);
    return { error: 'Failed to remove user from vessel' };
  }
}
