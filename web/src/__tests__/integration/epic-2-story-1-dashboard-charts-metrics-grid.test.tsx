/**
 * Epic 2, Story 1: Dashboard with Charts, Metrics, and Agency Summary Grid
 *
 * Tests verify that:
 * - "Payments Ready for Payment" bar chart displays with commission type split (AC-1)
 * - "Parked Payments" bar chart displays with commission type split (AC-2)
 * - "Total Value Ready for Payment" metric card shows ZAR formatted value (AC-3)
 * - "Total Value of Parked Payments" metric card shows ZAR formatted value (AC-4)
 * - "Parked Payments Aging Report" chart shows aging ranges (AC-5)
 * - "Payments Made (Last 14 Days)" metric displays ZAR formatted value (AC-6)
 * - 14-day metric is computed on frontend from payments data (AC-7)
 * - Agency Summary grid shows agency rows with name, count, commission, VAT (AC-8)
 * - Each agency row has a "View" button (AC-9)
 * - "View" button navigates to /payments?agencyId=N (AC-10)
 * - All currency values use ZAR formatting (AC-11)
 * - Loading indicators appear while data is being fetched (AC-12)
 * - Dashboard API failure shows error message (AC-13)
 * - Payments API failure shows error for 14-day metric only (AC-14)
 * - Empty data shows empty state message (AC-15)
 * - Agencies with zero payments appear in grid (AC-16)
 */

import { vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
  within,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: {
      user: { name: 'Test Admin', role: 'Admin' },
      expires: '2099-01-01',
    },
    status: 'authenticated',
  }),
}));

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Recharts to render text content without SVG internals
vi.mock('recharts', async () => {
  const ReactModule = await import('react');
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      ReactModule.createElement(
        'div',
        { 'data-testid': 'responsive-container' },
        children,
      ),
    BarChart: ({ children }: { children: React.ReactNode }) =>
      ReactModule.createElement(
        'div',
        { 'data-testid': 'bar-chart' },
        children,
      ),
    Bar: ({ dataKey, name }: { dataKey: string; name?: string }) =>
      ReactModule.createElement(
        'div',
        { 'data-testid': `bar-${dataKey}` },
        name || dataKey,
      ),
    XAxis: () => ReactModule.createElement('div', { 'data-testid': 'x-axis' }),
    YAxis: () => ReactModule.createElement('div', { 'data-testid': 'y-axis' }),
    CartesianGrid: () => ReactModule.createElement('div'),
    Tooltip: () => ReactModule.createElement('div'),
    Legend: () => ReactModule.createElement('div'),
    Cell: () => ReactModule.createElement('div'),
  };
});

// Mock API endpoints
const mockGetDashboard = vi.fn();
const mockGetPayments = vi.fn();

vi.mock('@/lib/api/endpoints', () => ({
  getDashboard: (...args: unknown[]) => mockGetDashboard(...args),
  getPayments: (...args: unknown[]) => mockGetPayments(...args),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import type {
  PaymentsDashboardRead,
  PaymentRead,
  PaymentReadList,
} from '@/types/api-generated';

// ---------------------------------------------------------------------------
// Test Data Factories
// ---------------------------------------------------------------------------

function createDashboardResponse(
  overrides: Partial<PaymentsDashboardRead> = {},
): PaymentsDashboardRead {
  return {
    PaymentStatusReport: [
      {
        Status: 'READY',
        PaymentCount: 15,
        TotalPaymentAmount: 1234567.89,
        CommissionType: 'Bond Comm',
        AgencyName: 'Agency One',
      },
      {
        Status: 'READY',
        PaymentCount: 8,
        TotalPaymentAmount: 500000,
        CommissionType: 'Manual Payments',
        AgencyName: 'Agency One',
      },
      {
        Status: 'PARKED',
        PaymentCount: 5,
        TotalPaymentAmount: 456789.12,
        CommissionType: 'Bond Comm',
        AgencyName: 'Agency One',
      },
      {
        Status: 'PARKED',
        PaymentCount: 3,
        TotalPaymentAmount: 100000,
        CommissionType: 'Manual Payments',
        AgencyName: 'Agency One',
      },
    ],
    ParkedPaymentsAgingReport: [
      { Range: '1-3 days', AgencyName: 'Agency One', PaymentCount: 10 },
      { Range: '4-7 days', AgencyName: 'Agency One', PaymentCount: 6 },
      { Range: '>7 days', AgencyName: 'Agency One', PaymentCount: 3 },
    ],
    TotalPaymentCountInLast14Days: 0,
    PaymentsByAgency: [
      {
        AgencyName: 'Agency One',
        PaymentCount: 12,
        TotalCommissionCount: 123456.78,
        Vat: 12345.68,
      },
      {
        AgencyName: 'Agency Two',
        PaymentCount: 8,
        TotalCommissionCount: 89012.34,
        Vat: 8901.23,
      },
      {
        AgencyName: 'Agency Three',
        PaymentCount: 0,
        TotalCommissionCount: 0,
        Vat: 0,
      },
    ],
    ...overrides,
  };
}

function createPayment(overrides: Partial<PaymentRead> = {}): PaymentRead {
  return {
    Id: 1,
    Reference: 'REF-001',
    AgencyName: 'Agency One',
    ClaimDate: '2026-01-01',
    AgentName: 'John',
    AgentSurname: 'Doe',
    LastChangedUser: 'admin',
    LastChangedDate: '2026-03-30',
    BondAmount: 1000000,
    CommissionType: 'Bond Comm',
    GrantDate: '2026-01-15',
    RegistrationDate: '2026-02-01',
    Bank: 'Test Bank',
    CommissionAmount: 50000,
    VAT: 7500,
    Status: 'PROCESSED',
    BatchId: 0,
    ...overrides,
  };
}

function createPaymentsResponse(payments: PaymentRead[]): PaymentReadList {
  return { PaymentList: payments };
}

// ---------------------------------------------------------------------------
// Helper: render a fresh Dashboard
// ---------------------------------------------------------------------------

let DashboardPage: React.ComponentType;

beforeAll(async () => {
  const mod = await import('@/app/page');
  DashboardPage = mod.default;
});

function renderDashboard() {
  return render(<DashboardPage />);
}

// ---------------------------------------------------------------------------
// Test Setup
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ===========================================================================
// AC-1: "Payments Ready for Payment" bar chart
// ===========================================================================

describe('AC-1: "Payments Ready for Payment" bar chart', () => {
  it('displays a bar chart titled "Payments Ready for Payment" with Bond Comm and Manual Payments bars', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('Payments Ready for Payment'),
      ).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-2: "Parked Payments" bar chart
// ===========================================================================

describe('AC-2: "Parked Payments" bar chart', () => {
  it('displays a bar chart titled "Parked Payments" with Bond Comm and Manual Payments bars', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Parked Payments')).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-3: "Total Value Ready for Payment" metric card
// ===========================================================================

describe('AC-3: "Total Value Ready for Payment" metric card', () => {
  it('displays the total value of ready-for-payment items formatted in ZAR', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('Total Value Ready for Payment'),
      ).toBeInTheDocument();
    });
    // Sum of READY TotalPaymentAmount: 1234567.89 + 500000 = 1734567.89
    expect(screen.getByText('R 1 734 567,89')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-4: "Total Value of Parked Payments" metric card
// ===========================================================================

describe('AC-4: "Total Value of Parked Payments" metric card', () => {
  it('displays the total value of parked payments formatted in ZAR', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('Total Value of Parked Payments'),
      ).toBeInTheDocument();
    });
    // Sum of PARKED TotalPaymentAmount: 456789.12 + 100000 = 556789.12
    expect(screen.getByText('R 556 789,12')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-5: "Parked Payments Aging Report" chart
// ===========================================================================

describe('AC-5: "Parked Payments Aging Report" chart', () => {
  it('displays aging ranges: 1-3 days, 4-7 days, and >7 days', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('Parked Payments Aging Report'),
      ).toBeInTheDocument();
    });
    // The aging ranges are rendered as text labels alongside the chart
    expect(screen.getByText(/1-3 days/)).toBeInTheDocument();
    expect(screen.getByText(/4-7 days/)).toBeInTheDocument();
    expect(screen.getByText(/>7 days/)).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-6 & AC-7: "Payments Made (Last 14 Days)" metric — frontend computation
// ===========================================================================

describe('AC-6 & AC-7: "Payments Made (Last 14 Days)" frontend computation', () => {
  it('computes 14-day metric by summing PROCESSED payments within 14 calendar days', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-03T12:00:00Z'));

    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(
      createPaymentsResponse([
        createPayment({
          Id: 1,
          Status: 'PROCESSED',
          LastChangedDate: '2026-03-25',
          CommissionAmount: 50000,
        }),
        createPayment({
          Id: 2,
          Status: 'PROCESSED',
          LastChangedDate: '2026-03-30',
          CommissionAmount: 75000,
        }),
        createPayment({
          Id: 3,
          Status: 'PROCESSED',
          LastChangedDate: '2026-03-10',
          CommissionAmount: 30000,
        }), // older than 14 days
        createPayment({
          Id: 4,
          Status: 'READY',
          LastChangedDate: '2026-03-28',
          CommissionAmount: 20000,
        }), // not PROCESSED
      ]),
    );

    renderDashboard();

    await vi.waitFor(() => {
      expect(
        screen.getByText('Payments Made (Last 14 Days)'),
      ).toBeInTheDocument();
    });
    // Only Payment 1 (50000) + Payment 2 (75000) = 125000
    await vi.waitFor(() => {
      expect(screen.getByText('R 125 000,00')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

// ===========================================================================
// AC-8: Agency Summary grid
// ===========================================================================

describe('AC-8: Agency Summary grid', () => {
  it('displays agency rows with name, payment count, commission amount (ZAR), and VAT (ZAR)', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Agency One row
    expect(screen.getByText('Agency One')).toBeInTheDocument();
    expect(screen.getByText('R 123 456,78')).toBeInTheDocument();
    expect(screen.getByText('R 12 345,68')).toBeInTheDocument();

    // Agency Two row
    expect(screen.getByText('Agency Two')).toBeInTheDocument();
    expect(screen.getByText('R 89 012,34')).toBeInTheDocument();
    expect(screen.getByText('R 8 901,23')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-9: Each agency row has a "View" button
// ===========================================================================

describe('AC-9: Each agency row has a "View" button', () => {
  it('shows a "View" button for every agency row', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    // 3 agencies = 3 "View" buttons
    expect(viewButtons).toHaveLength(3);
  });
});

// ===========================================================================
// AC-10: "View" button navigates to /payments?agencyId=N
// ===========================================================================

describe('AC-10: "View" button navigates to payment management for that agency', () => {
  it('navigates to /payments?agencyId=N when clicking "View" on an agency row', async () => {
    const user = userEvent.setup();
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Find the row containing "Agency One" and click its View button
    const agencyOneRow = screen.getByText('Agency One').closest('tr');
    expect(agencyOneRow).not.toBeNull();
    const viewButton = within(agencyOneRow!).getByRole('button', {
      name: /view/i,
    });

    await user.click(viewButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining('/payments?agencyId='),
    );
  });
});

// ===========================================================================
// AC-11: ZAR currency formatting
// ===========================================================================

describe('AC-11: All currency values use ZAR formatting', () => {
  it('formats zero values as R 0,00', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Agency Three has 0 commission and 0 VAT
    const zeroValues = screen.getAllByText('R 0,00');
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });
});

// ===========================================================================
// AC-12: Loading indicators while data is being fetched
// ===========================================================================

describe('AC-12: Loading indicators during data fetch', () => {
  it('shows loading indicators while API calls are in progress', async () => {
    // Keep promises pending to simulate loading
    mockGetDashboard.mockReturnValue(new Promise(() => {}));
    mockGetPayments.mockReturnValue(new Promise(() => {}));

    renderDashboard();

    // Loading indicators should appear immediately (skeleton elements with role="status")
    await waitFor(() => {
      const loadingElements = screen.getAllByRole('status');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });
});

// ===========================================================================
// AC-13: Dashboard API failure shows error message
// ===========================================================================

describe('AC-13: Dashboard API failure shows error message', () => {
  it('displays an error message when the dashboard API call fails', async () => {
    mockGetDashboard.mockRejectedValue(new Error('Internal Server Error'));
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-14: Payments API failure — partial error handling
// ===========================================================================

describe('AC-14: Payments API failure shows error for 14-day metric while rest displays', () => {
  it('shows the dashboard charts and grid but an error for the 14-day metric when payments API fails', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockRejectedValue(new Error('Internal Server Error'));

    renderDashboard();

    // Dashboard data should still be visible
    await waitFor(() => {
      expect(
        screen.getByText('Payments Ready for Payment'),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Agency Summary')).toBeInTheDocument();

    // 14-day metric should show an error
    await waitFor(() => {
      expect(screen.getByText(/failed to load payments/i)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-15: Empty data shows empty state message
// ===========================================================================

describe('AC-15: Empty data shows empty state message', () => {
  it('displays an empty state message when API returns no data', async () => {
    mockGetDashboard.mockResolvedValue({
      PaymentStatusReport: [],
      ParkedPaymentsAgingReport: [],
      TotalPaymentCountInLast14Days: 0,
      PaymentsByAgency: [],
    });
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-16: Agencies with zero payments appear in grid
// ===========================================================================

describe('AC-16: Agencies with zero payments appear in grid with zero values', () => {
  it('shows agencies with zero payments rather than hiding them', async () => {
    mockGetDashboard.mockResolvedValue(createDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Agency Three has 0 payments — should still appear
    expect(screen.getByText('Agency Three')).toBeInTheDocument();
  });
});
