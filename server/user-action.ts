'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function updateUserProfile({
  userId,
  name,
  email,
}: {
  userId: string;
  name: string;
  email: string;
}) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      return { error: 'Email is already in use' };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
    });

    revalidatePath('/account');
    return { user };
  } catch (error) {
    console.error('Failed to update user profile', error);
    return { error: 'Failed to update user profile' };
  }
}

export async function changeUserPassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    try {
      await auth.api.signInEmail({
        body: {
          email: user.email,
          password: currentPassword,
        },
      });
    } catch (error) {
      return { error: 'Current password is incorrect' };
    }

    const ctx = await auth.$context;
    const hash = await ctx.password.hash(newPassword);
    await ctx.internalAdapter.updatePassword(userId, hash);

    return { success: true };
  } catch (error) {
    console.error('Failed to change password', error);
    return { error: 'Failed to change password' };
  }
}
