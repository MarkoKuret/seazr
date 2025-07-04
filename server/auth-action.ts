'use server';

import { redirect } from 'next/navigation';
import {
  getSessionApi,
  signUpApi,
  logInApi,
  signOutApi,
  requestPasswordResetApi,
  resetPasswordApi,
} from '@/lib/auth';
import { signupSchema, loginSchema } from '@/lib/auth-schema';
import z from 'zod';

export const signUp = async (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  const validInput = signupSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  });
  if (!validInput.success) {
    return validInput.error.issues[0].message;
  }

  const error = await signUpApi(name, email, password);

  if (error) {
    return error;
  }

  return { success: true };
};
export const logIn = async (email: string, password: string) => {
  const validInput = loginSchema.safeParse({ email, password });
  if (!validInput.success) {
    return validInput.error.issues[0].message;
  }

  const error = await logInApi(email, password);

  if (error) {
    return error;
  }

  return { success: true };
};

export async function signOut() {
  await signOutApi();
  redirect('/');
}

export async function getSession() {
  const session = await getSessionApi();
  return session;
}

export const requestPasswordReset = async (email: string) => {
  const validInput = z.string().email().safeParse(email);
  if (!validInput.success) {
    return 'Please enter a valid email address';
  }

  const error = await requestPasswordResetApi(email);
  if (error !== undefined && typeof error === 'string') {
    return error;
  }

  return { success: true };
};

export const resetPassword = async (newPassword: string, token: string) => {
  if (!newPassword || newPassword.length < 6) {
    return 'Password must be at least 6 characters';
  }

  if (!token) {
    return 'Invalid or missing reset token';
  }

  const error = await resetPasswordApi(newPassword, token);
  if (error !== undefined && typeof error === 'string') {
    return error;
  }

  return { success: true };
};
