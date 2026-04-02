/**
 * Global API Error Handler
 *
 * Provides a mechanism for the API client (non-React code) to trigger
 * toast notifications and auth redirects. The ToastProvider bridges
 * this module into React by calling setErrorToastDispatcher on mount.
 *
 * - 401 → redirect to login (via signOut)
 * - 500 → show error toast(s) with server messages or fallback
 */

import type { ToastOptions } from '@/types/toast';

const FALLBACK_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again.';

/**
 * Dispatcher function type — shows a toast from non-React code.
 * Set by the ToastProvider on mount via setErrorToastDispatcher().
 */
type ErrorToastDispatcher = (options: ToastOptions) => void;

let errorToastDispatcher: ErrorToastDispatcher | null = null;

/**
 * Called by ToastProvider on mount to wire up the toast system.
 */
export function setErrorToastDispatcher(
  dispatcher: ErrorToastDispatcher | null,
): void {
  errorToastDispatcher = dispatcher;
}

/**
 * Show one or more error toasts. If the dispatcher is not yet connected
 * (e.g., during SSR), errors are silently dropped.
 */
export function showErrorToasts(messages: string[]): void {
  if (!errorToastDispatcher) return;

  if (messages.length === 0) {
    errorToastDispatcher({
      variant: 'error',
      title: 'Error',
      message: FALLBACK_ERROR_MESSAGE,
    });
    return;
  }

  for (const msg of messages) {
    errorToastDispatcher({
      variant: 'error',
      title: 'Error',
      message: msg,
    });
  }
}

/**
 * Handle a 401 Unauthorized response by signing the user out
 * and redirecting to the login page.
 */
export async function handleUnauthorized(): Promise<void> {
  try {
    const { signOut } = await import('@/lib/auth/auth-client');
    await signOut();
  } catch {
    // If signOut fails, attempt a manual redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
  }
}

/**
 * Central error handler called by the API client after an error response.
 * Parses the error, triggers toasts, and handles auth redirects.
 *
 * @param statusCode - HTTP status code
 * @param messages - Parsed Messages array from DefaultResponse (may be empty)
 */
export function handleApiError(statusCode: number, messages: string[]): void {
  if (statusCode === 401) {
    handleUnauthorized();
    return;
  }

  if (statusCode >= 500) {
    showErrorToasts(messages);
    return;
  }

  // For other error codes, show messages if present
  if (messages.length > 0) {
    showErrorToasts(messages);
  }
}
