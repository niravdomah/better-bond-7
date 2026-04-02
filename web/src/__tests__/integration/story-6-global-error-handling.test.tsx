/**
 * Story 6: Global Error Handling
 *
 * Tests verify that:
 * - 401 responses redirect the user to the login screen (AC-1)
 * - 500 responses with server messages show those messages via toast (AC-2)
 * - 500 responses without messages show a fallback toast message (AC-3)
 * - Park/Unpark failures do not mutate grid state (AC-4)
 * - Park/Unpark failures display server error messages (AC-5)
 * - Multiple rapid errors are all visible as stacked toasts (AC-6)
 * - Error toasts auto-dismiss after a timeout (AC-7)
 */

import { vi, type Mock } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

// Mock next-auth/react — prevent real auth calls
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  getSession: vi.fn().mockResolvedValue(null),
  useSession: vi
    .fn()
    .mockReturnValue({ data: null, status: 'unauthenticated' }),
}));

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch globally
global.fetch = vi.fn();

// ---------------------------------------------------------------------------
// Static imports — same module instances throughout the test file
// ---------------------------------------------------------------------------
import { get, setTokenProvider } from '@/lib/api/client';
import { parkPayments, unparkPayments } from '@/lib/api/endpoints';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/toast/ToastContainer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch500WithMessages(messages: string[]) {
  (global.fetch as Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({
      Id: 0,
      MessageType: 'ERROR',
      Messages: messages,
    }),
  });
}

function mockFetch500NoMessages() {
  (global.fetch as Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({
      Id: 0,
      MessageType: 'ERROR',
      Messages: [],
    }),
  });
}

function mockFetch500Html() {
  (global.fetch as Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    headers: new Headers({ 'content-type': 'text/html' }),
    text: async () => '<html>Error</html>',
    json: async () => {
      throw new Error('not JSON');
    },
  });
}

function mockFetch401() {
  (global.fetch as Mock).mockResolvedValueOnce({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({ Id: 0, MessageType: 'ERROR', Messages: [] }),
  });
}

/**
 * Renders the ToastProvider + ToastContainer, waits for the useEffect
 * that wires the global error-toast dispatcher, then returns.
 */
async function renderWithToasts(ui?: React.ReactElement) {
  const result = render(
    <ToastProvider>
      {ui ?? <div data-testid="placeholder" />}
      <ToastContainer />
    </ToastProvider>,
  );

  // Flush the useEffect that wires setErrorToastDispatcher
  await act(async () => {});

  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });

  // No auth token by default
  setTokenProvider(async () => null);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// ===========================================================================
// AC-1: 401 → redirect to login
// ===========================================================================
describe('AC-1: 401 response redirects user to login screen', () => {
  it('redirects to the login page when any API call returns 401', async () => {
    mockFetch401();

    const { signOut } = await import('next-auth/react');

    try {
      await get('/v1/payments');
    } catch {
      // error is expected — we care about the redirect side-effect
    }

    // Verify redirect was triggered (signOut with redirect, or router push)
    await waitFor(() => {
      const signOutCalled = (signOut as Mock).mock.calls.length > 0;
      const routerPushCalled = mockRouterPush.mock.calls.some(
        (call: string[]) =>
          call[0]?.includes('signin') || call[0]?.includes('login'),
      );
      expect(signOutCalled || routerPushCalled).toBe(true);
    });
  });
});

// ===========================================================================
// AC-2: 500 with server message → toast shows server message
// ===========================================================================
describe('AC-2: 500 with server-provided error message shows toast', () => {
  it('displays the server error message in a toast notification', async () => {
    mockFetch500WithMessages([
      'Database connection timeout. Please try again.',
    ]);

    await renderWithToasts();

    try {
      await get('/v1/payments');
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(
        screen.getByText('Database connection timeout. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('displays multiple server messages when present', async () => {
    mockFetch500WithMessages([
      'Validation failed for field A.',
      'Validation failed for field B.',
    ]);

    await renderWithToasts();

    try {
      await get('/v1/payments');
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(
        screen.getByText(/Validation failed for field A/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Validation failed for field B/),
      ).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-3: 500 with no message → toast shows fallback text
// ===========================================================================
describe('AC-3: 500 without server message shows fallback toast', () => {
  it('displays the fallback message when server sends empty Messages array', async () => {
    mockFetch500NoMessages();

    await renderWithToasts();

    try {
      await get('/v1/payments');
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(
        screen.getByText('An unexpected error occurred. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('displays the fallback message when server responds with non-JSON body', async () => {
    mockFetch500Html();

    await renderWithToasts();

    try {
      await get('/v1/payments');
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(
        screen.getByText('An unexpected error occurred. Please try again.'),
      ).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-4: Grid remains unchanged on Park/Unpark failure
// ===========================================================================
describe('AC-4: Grid data is preserved when Park/Unpark fails', () => {
  it('parkPayments throws an error without returning success data', async () => {
    mockFetch500WithMessages(['Payment cannot be parked — insufficient data.']);

    await expect(parkPayments({ PaymentIds: [1] })).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it('unparkPayments throws an error without returning success data', async () => {
    mockFetch500WithMessages([
      'Unpark failed — record locked by another user.',
    ]);

    await expect(unparkPayments({ PaymentIds: [3] })).rejects.toMatchObject({
      statusCode: 500,
    });
  });

  it('a failed park does not resolve — callers should not update state on rejection', async () => {
    mockFetch500WithMessages(['Payment cannot be parked — insufficient data.']);

    let resolved = false;
    try {
      await parkPayments({ PaymentIds: [1] });
      resolved = true;
    } catch {
      // expected path
    }

    expect(resolved).toBe(false);
  });
});

// ===========================================================================
// AC-5: Park/Unpark error messages are displayed
// ===========================================================================
describe('AC-5: Park/Unpark failure shows error messages to user', () => {
  it('displays error message from a failed park action', async () => {
    mockFetch500WithMessages(['Payment cannot be parked — insufficient data.']);

    await renderWithToasts();

    try {
      await parkPayments({ PaymentIds: [1] });
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(screen.getByText(/Payment cannot be parked/)).toBeInTheDocument();
    });
  });

  it('displays error message from a failed unpark action', async () => {
    mockFetch500WithMessages([
      'Unpark failed — record locked by another user.',
    ]);

    await renderWithToasts();

    try {
      await unparkPayments({ PaymentIds: [3] });
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(
        screen.getByText(/Unpark failed — record locked by another user/),
      ).toBeInTheDocument();
    });
  });

  it('displays fallback message when park fails with no server messages', async () => {
    mockFetch500NoMessages();

    await renderWithToasts();

    try {
      await parkPayments({ PaymentIds: [1] });
    } catch {
      // expected
    }

    await waitFor(() => {
      expect(
        screen.getByText('An unexpected error occurred. Please try again.'),
      ).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-6: Multiple rapid errors are all visible
// ===========================================================================
describe('AC-6: Multiple rapid errors are all displayed', () => {
  it('shows multiple error toasts stacked when errors arrive in quick succession', async () => {
    mockFetch500WithMessages(['Error Alpha']);
    mockFetch500WithMessages(['Error Beta']);
    mockFetch500WithMessages(['Error Gamma']);

    await renderWithToasts();

    // Fire three API calls rapidly
    const calls = [
      get('/v1/endpoint-a').catch(() => {}),
      get('/v1/endpoint-b').catch(() => {}),
      get('/v1/endpoint-c').catch(() => {}),
    ];
    await Promise.all(calls);

    // All three error messages should be visible simultaneously
    await waitFor(() => {
      expect(screen.getByText('Error Alpha')).toBeInTheDocument();
      expect(screen.getByText('Error Beta')).toBeInTheDocument();
      expect(screen.getByText('Error Gamma')).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-7: Error toasts auto-dismiss
// ===========================================================================
describe('AC-7: Error toasts automatically dismiss after timeout', () => {
  it('removes the error toast from the DOM after the auto-dismiss duration', async () => {
    mockFetch500WithMessages(['Temporary error']);

    await renderWithToasts();

    try {
      await get('/v1/payments');
    } catch {
      // expected
    }

    // Verify the toast appears
    await waitFor(() => {
      expect(screen.getByText('Temporary error')).toBeInTheDocument();
    });

    // Advance time past auto-dismiss duration (default 5000ms)
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // The toast should now be gone
    await waitFor(() => {
      expect(screen.queryByText('Temporary error')).not.toBeInTheDocument();
    });
  });
});
