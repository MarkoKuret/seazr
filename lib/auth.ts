import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { sendEmail } from '@/server/email-action';
import { getPasswordResetEmailTemplate } from '@/lib/email-templates';

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({user, url}) => {
      const emailContent = getPasswordResetEmailTemplate(user.name, url);
      await sendEmail({
        to: user.email,
        ...emailContent
      });
    },
  },
  plugins: [nextCookies()],
});

export async function getSessionApi() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function signUpApi(name: string, email: string, password: string) {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return error.body?.message ?? 'An unknown error occurred.';
    }

    console.log(error);
    return 'Something went wrong. Please try again.';
  }
}

export async function logInApi(email: string, password: string) {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return error.body?.message ?? 'An unknown error occurred.';
    }

    console.log(error);
    return 'Something went wrong. Please try again.';
  }
}

export async function signOutApi() {
  await auth.api.signOut({
    headers: await headers(),
  });
}

export async function requestPasswordResetApi(email: string) {
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: '/reset-password',
      }
    });
    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return error.body?.message ?? 'An unknown error occurred.';
    }
    console.log(error);
    return 'Something went wrong. Please try again.';
  }
}

export async function resetPasswordApi(newPassword: string, token: string) {
  try {
    await auth.api.resetPassword({
      body: {
        newPassword,
        token,
      }
    });
    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return error.body?.message ?? 'An unknown error occurred.';
    }
    console.log(error);
    return 'Something went wrong. Please try again.';
  }
}