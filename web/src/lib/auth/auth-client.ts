'use client';

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  getSession,
} from 'next-auth/react';

export { useSession } from 'next-auth/react';

/**
 * Get the current access token from the session.
 * Used by the API client for automatic Bearer token attachment (AC-4).
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session as { accessToken?: string } | null)?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error?: string; ok: boolean }> {
  try {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Invalid credentials', ok: false };
    }

    return { ok: true };
  } catch {
    return { error: 'An error occurred during sign in', ok: false };
  }
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirect: true, callbackUrl: '/auth/signin' });
}
