/**
 * Story 2: API Client Configuration
 *
 * Tests verify that:
 * - All API calls target the correct base URL (defaulting to localhost:8042)
 * - Bearer tokens are automatically attached when a user is logged in
 * - No Authorization header is sent when no user is logged in
 * - The base URL can be overridden via NEXT_PUBLIC_API_BASE_URL
 * - Typed endpoint functions use the correct HTTP methods and paths
 * - Network errors produce a user-visible error message (not an endless spinner)
 */

import { vi, type Mock } from 'vitest';

// We need to be able to swap environment variables per test, so capture the
// original module and re-import where necessary.
let get: typeof import('@/lib/api/client').get;
let setTokenProvider: typeof import('@/lib/api/client').setTokenProvider;

// Mock fetch globally
global.fetch = vi.fn();

function mockFetchOk(data: unknown = {}) {
  (global.fetch as Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
  });
}

function mockFetchNetworkError() {
  (global.fetch as Mock).mockRejectedValueOnce(
    new TypeError('Failed to fetch'),
  );
}

beforeEach(async () => {
  vi.clearAllMocks();

  // Dynamic import so each test starts with fresh module state
  const mod = await import('@/lib/api/client');
  get = mod.get;
  setTokenProvider = mod.setTokenProvider;
});

// ---------------------------------------------------------------------------
// AC-1: Default base URL is http://localhost:8042
// ---------------------------------------------------------------------------
describe('AC-1: API calls use the configured base URL', () => {
  it('sends requests to http://localhost:8042 by default', async () => {
    setTokenProvider(async () => null);
    mockFetchOk([]);

    await get('/v1/payments');

    const calledUrl = (global.fetch as Mock).mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/^http:\/\/localhost:8042\/v1\/payments/);
  });
});

// ---------------------------------------------------------------------------
// AC-2 / AC-3: (Loading indicator tests are UI-level — covered when a
// component consumes the API. These acceptance criteria will be verified
// via component tests or manual testing since the client itself is not
// responsible for rendering loading states.)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// AC-4: Typed endpoint functions use the correct HTTP methods and paths
// ---------------------------------------------------------------------------
describe('AC-4: Typed endpoint functions use the correct methods and paths', () => {
  let endpoints: typeof import('@/lib/api/endpoints');

  beforeEach(async () => {
    setTokenProvider(async () => null);
    endpoints = await import('@/lib/api/endpoints');
  });

  it('getPayments calls GET /v1/payments', async () => {
    mockFetchOk({ PaymentList: [] });
    await endpoints.getPayments();
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/v1\/payments$/);
    expect(opts.method).toBe('GET');
  });

  it('getDashboard calls GET /v1/payments/dashboard', async () => {
    mockFetchOk({});
    await endpoints.getDashboard();
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/v1\/payments\/dashboard$/);
    expect(opts.method).toBe('GET');
  });

  it('getPaymentBatches calls GET /v1/payment-batches', async () => {
    mockFetchOk({ PaymentBatchList: [] });
    await endpoints.getPaymentBatches();
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/v1\/payment-batches$/);
    expect(opts.method).toBe('GET');
  });

  it('parkPayments calls PUT /v1/payments/park', async () => {
    mockFetchOk();
    await endpoints.parkPayments({ PaymentIds: [1] });
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/v1\/payments\/park$/);
    expect(opts.method).toBe('PUT');
  });

  it('unparkPayments calls PUT /v1/payments/unpark', async () => {
    mockFetchOk();
    await endpoints.unparkPayments({ PaymentIds: [1] });
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/v1\/payments\/unpark$/);
    expect(opts.method).toBe('PUT');
  });

  it('downloadInvoicePdf calls POST /v1/payment-batches/{Id}/download-invoice-pdf', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/octet-stream' }),
      blob: async () => new Blob(['pdf-data']),
    });
    await endpoints.downloadInvoicePdf(42);
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/v1\/payment-batches\/42\/download-invoice-pdf$/);
    expect(opts.method).toBe('POST');
  });

  it('resetDemo calls POST /demo/reset-demo', async () => {
    mockFetchOk();
    await endpoints.resetDemo();
    const [url, opts] = (global.fetch as Mock).mock.calls[0];
    expect(url).toMatch(/\/demo\/reset-demo$/);
    expect(opts.method).toBe('POST');
  });
});

// ---------------------------------------------------------------------------
// AC-5: Custom base URL via environment variable
// ---------------------------------------------------------------------------
describe('AC-5: Custom base URL via environment variable', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    // Restore original env
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    }
    // Reset module registry so constants re-evaluate
    vi.resetModules();
  });

  it('uses the custom base URL when NEXT_PUBLIC_API_BASE_URL is set', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL =
      'http://staging-api.example.com:9000';
    vi.resetModules();

    // Re-import after env change so constants.ts picks up the new value
    const freshClient = await import('@/lib/api/client');
    freshClient.setTokenProvider(async () => null);
    mockFetchOk([]);

    await freshClient.get('/v1/payments');

    const calledUrl = (global.fetch as Mock).mock.calls[0][0] as string;
    expect(calledUrl).toMatch(
      /^http:\/\/staging-api\.example\.com:9000\/v1\/payments/,
    );
    expect(calledUrl).not.toContain('localhost:8042');
  });
});

// ---------------------------------------------------------------------------
// AC-6: Network error produces an error message, not an endless spinner
// ---------------------------------------------------------------------------
describe('AC-6: Unreachable API server produces an error message', () => {
  it('throws an error with a user-readable message when the server is unreachable', async () => {
    setTokenProvider(async () => null);
    mockFetchNetworkError();

    try {
      await get('/v1/payments');
      throw new Error('Expected an error to be thrown');
    } catch (error) {
      const apiError = error as { message: string; statusCode: number };
      expect(apiError.message).toMatch(
        /network|unable to connect|unreachable/i,
      );
      expect(apiError.statusCode).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: Bearer token is attached to every API request
// ---------------------------------------------------------------------------
describe('Bearer token attachment', () => {
  it('includes Authorization: Bearer <token> when the user is logged in', async () => {
    setTokenProvider(async () => 'test-jwt-token-abc123');
    mockFetchOk({ PaymentList: [] });

    await get('/v1/payments');

    const calledHeaders = (global.fetch as Mock).mock.calls[0][1]
      .headers as Record<string, string>;
    expect(calledHeaders['Authorization']).toBe('Bearer test-jwt-token-abc123');
  });

  it('does not include an Authorization header when no user is logged in', async () => {
    setTokenProvider(async () => null);
    mockFetchOk({ PaymentList: [] });

    await get('/v1/payments');

    const calledHeaders = (global.fetch as Mock).mock.calls[0][1]
      .headers as Record<string, string>;
    expect(calledHeaders['Authorization']).toBeUndefined();
  });
});
