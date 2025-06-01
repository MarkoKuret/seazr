'use server';

import { redirect } from 'next/navigation';
import { getSessionApi, signUpApi, logInApi, signOutApi } from '@/lib/auth';
import { signupSchema, loginSchema } from '@/lib/auth-schema';

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