/**
 * Epic 2, Story 2: Dashboard Agency Filtering and Role-Based Views
 *
 * Tests verify that:
 * - Admin sees combined data when no agency is selected (AC-1)
 * - Admin clicks agency row and all components update to show that agency's data (AC-2)
 * - Admin deselects agency and view returns to all-agency (AC-3)
 * - Broker sees only own agency data on page load (AC-4)
 * - Broker cannot view other agencies' data (AC-5)
 * - URL updates with agencyId when agency is selected (AC-6)
 * - Direct navigation with agencyId pre-selects agency (AC-7)
 * - Browser back preserves agency selection via URL (AC-8)
 * - Payments Ready chart filters by selected agency (AC-9)
 * - Parked Payments chart filters by selected agency (AC-10)
 * - Metric cards filter by selected agency (AC-11)
 * - Invalid agencyId in URL falls back to default view (AC-12)
 * - Agent sees read-only Dashboard (AC-13)
 */

import { vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ---------------------------------------------------------------------------
// Module-level mocks — must be before imports that use mocked modules
// ---------------------------------------------------------------------------

// Track the current session mock so individual tests can override it
let mockSessionData: {
  data: {
    user: { name: string; role: string; agencyId?: string };
    expires: string;
  };
  status: string;
};

function setAdminSession() {
  mockSessionData = {
    data: {
      user: { name: 'Test Admin', role: 'admin' },
      expires: '2099-01-01',
    },
    status: 'authenticated',
  };
}

function setBrokerSession(agencyId: string) {
  mockSessionData = {
    data: {
      user: { name: 'Test Broker', role: 'broker', agencyId },
      expires: '2099-01-01',
    },
    status: 'authenticated',
  };
}

function setAgentSession() {
  mockSessionData = {
    data: {
      user: { name: 'Test Agent', role: 'agent' },
      expires: '2099-01-01',
    },
    status: 'authenticated',
  };
}

// Default to Admin
setAdminSession();

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => mockSessionData,
}));

// Mock next/navigation with configurable search params
let mockSearchParams = new URLSearchParams();
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => mockSearchParams,
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
// Multi-Agency Test Data Factory
// ---------------------------------------------------------------------------

/**
 * Creates a dashboard response with data spread across multiple agencies,
 * with distinct values per agency so that filtering can be verified.
 */
function createMultiAgencyDashboardResponse(
  overrides: Partial<PaymentsDashboardRead> = {},
): PaymentsDashboardRead {
  return {
    PaymentStatusReport: [
      // Agency One — READY
      {
        Status: 'READY',
        PaymentCount: 10,
        TotalPaymentAmount: 500000,
        CommissionType: 'Bond Comm',
        AgencyName: 'Agency One',
      },
      {
        Status: 'READY',
        PaymentCount: 5,
        TotalPaymentAmount: 200000,
        CommissionType: 'Manual Payments',
        AgencyName: 'Agency One',
      },
      // Agency One — PARKED
      {
        Status: 'PARKED',
        PaymentCount: 3,
        TotalPaymentAmount: 150000,
        CommissionType: 'Bond Comm',
        AgencyName: 'Agency One',
      },
      {
        Status: 'PARKED',
        PaymentCount: 2,
        TotalPaymentAmount: 50000,
        CommissionType: 'Manual Payments',
        AgencyName: 'Agency One',
      },
      // Agency Two — READY
      {
        Status: 'READY',
        PaymentCount: 8,
        TotalPaymentAmount: 800000,
        CommissionType: 'Bond Comm',
        AgencyName: 'Agency Two',
      },
      {
        Status: 'READY',
        PaymentCount: 4,
        TotalPaymentAmount: 300000,
        CommissionType: 'Manual Payments',
        AgencyName: 'Agency Two',
      },
      // Agency Two — PARKED
      {
        Status: 'PARKED',
        PaymentCount: 6,
        TotalPaymentAmount: 400000,
        CommissionType: 'Bond Comm',
        AgencyName: 'Agency Two',
      },
      {
        Status: 'PARKED',
        PaymentCount: 1,
        TotalPaymentAmount: 25000,
        CommissionType: 'Manual Payments',
        AgencyName: 'Agency Two',
      },
      // Agency Three — no payments (zero data)
    ],
    ParkedPaymentsAgingReport: [
      { Range: '1-3 days', AgencyName: 'Agency One', PaymentCount: 4 },
      { Range: '4-7 days', AgencyName: 'Agency One', PaymentCount: 2 },
      { Range: '>7 days', AgencyName: 'Agency One', PaymentCount: 1 },
      { Range: '1-3 days', AgencyName: 'Agency Two', PaymentCount: 6 },
      { Range: '4-7 days', AgencyName: 'Agency Two', PaymentCount: 3 },
      { Range: '>7 days', AgencyName: 'Agency Two', PaymentCount: 2 },
    ],
    TotalPaymentCountInLast14Days: 0,
    PaymentsByAgency: [
      {
        AgencyName: 'Agency One',
        PaymentCount: 15,
        TotalCommissionCount: 500000,
        Vat: 75000,
      },
      {
        AgencyName: 'Agency Two',
        PaymentCount: 12,
        TotalCommissionCount: 800000,
        Vat: 120000,
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
  vi.useRealTimers();
  vi.clearAllMocks();
  setAdminSession();
  mockSearchParams = new URLSearchParams();
});

// ===========================================================================
// AC-1: Admin sees combined data when no agency is selected
// ===========================================================================

describe('AC-1: Admin default view shows combined data across all agencies', () => {
  it('displays combined metric values summed across all agencies when no agency is selected', async () => {
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    // Total Ready Value = Agency One (500000 + 200000) + Agency Two (800000 + 300000) = 1800000
    await waitFor(() => {
      expect(screen.getByText('R 1 800 000,00')).toBeInTheDocument();
    });

    // Total Parked Value = Agency One (150000 + 50000) + Agency Two (400000 + 25000) = 625000
    expect(screen.getByText('R 625 000,00')).toBeInTheDocument();

    // All three agency rows are visible in the grid
    expect(screen.getByText('Agency One')).toBeInTheDocument();
    expect(screen.getByText('Agency Two')).toBeInTheDocument();
    expect(screen.getByText('Agency Three')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-2: Admin selects an agency and all components update (AC-9, AC-10, AC-11)
// ===========================================================================

describe('AC-2: Admin agency selection filters all components', () => {
  it('updates metric cards to show only the selected agency values when an agency row is clicked', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Click on Agency One row in the grid
    const agencyOneRow = screen.getByText('Agency One').closest('tr');
    expect(agencyOneRow).not.toBeNull();
    await user.click(agencyOneRow!);

    // After selection, metrics should show Agency One only:
    // Ready = 500000 + 200000 = 700000
    await waitFor(() => {
      expect(screen.getByText('R 700 000,00')).toBeInTheDocument();
    });

    // Parked = 150000 + 50000 = 200000
    expect(screen.getByText('R 200 000,00')).toBeInTheDocument();
  });

  it('visually highlights the selected agency row', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Click on Agency One row
    const agencyOneRow = screen.getByText('Agency One').closest('tr');
    expect(agencyOneRow).not.toBeNull();
    await user.click(agencyOneRow!);

    // The selected row should have an aria-selected attribute or a visual distinction
    await waitFor(() => {
      expect(agencyOneRow).toHaveAttribute('aria-selected', 'true');
    });
  });
});

// ===========================================================================
// AC-3: Admin deselects agency and view returns to all-agency
// ===========================================================================

describe('AC-3: Admin agency deselection restores all-agency view', () => {
  it('returns to combined all-agency metrics when the selected agency row is clicked again', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    const agencyOneRow = screen.getByText('Agency One').closest('tr');
    expect(agencyOneRow).not.toBeNull();

    // Select Agency One
    await user.click(agencyOneRow!);
    await waitFor(() => {
      expect(agencyOneRow).toHaveAttribute('aria-selected', 'true');
    });

    // Deselect Agency One (click again)
    await user.click(agencyOneRow!);

    // After deselection, should show combined all-agency data again
    // Total Ready = 1800000
    await waitFor(() => {
      expect(screen.getByText('R 1 800 000,00')).toBeInTheDocument();
    });

    // Row should no longer be selected
    expect(agencyOneRow).not.toHaveAttribute('aria-selected', 'true');
  });
});

// ===========================================================================
// AC-4: Broker sees only own agency data on page load
// ===========================================================================

describe('AC-4: Broker pre-filtering to own agency', () => {
  it('shows only the Broker own agency data in charts, metrics, and grid on page load', async () => {
    setBrokerSession('Agency Two');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Agency Two should be visible
    expect(screen.getByText('Agency Two')).toBeInTheDocument();

    // Agency One and Agency Three should NOT be visible in the grid
    expect(screen.queryByText('Agency One')).not.toBeInTheDocument();
    expect(screen.queryByText('Agency Three')).not.toBeInTheDocument();

    // Metrics should reflect Agency Two only:
    // Ready = 800000 + 300000 = 1100000
    expect(screen.getByText('R 1 100 000,00')).toBeInTheDocument();

    // Parked = 400000 + 25000 = 425000
    expect(screen.getByText('R 425 000,00')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-5: Broker cannot view other agencies' data
// ===========================================================================

describe('AC-5: Broker cannot view other agencies data', () => {
  it('ignores a URL agencyId pointing to a different agency and shows own agency data', async () => {
    setBrokerSession('Agency Two');
    // URL points to Agency One — but Broker should see Agency Two
    mockSearchParams = new URLSearchParams('agencyId=Agency One');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Should show Agency Two, not Agency One
    expect(screen.getByText('Agency Two')).toBeInTheDocument();
    expect(screen.queryByText('Agency One')).not.toBeInTheDocument();
  });
});

// ===========================================================================
// AC-6: URL updates with agencyId when agency is selected
// ===========================================================================

describe('AC-6: URL query parameter reflects agency selection', () => {
  it('updates the URL with agencyId when Admin clicks an agency row', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Click on Agency Two row
    const agencyTwoRow = screen.getByText('Agency Two').closest('tr');
    expect(agencyTwoRow).not.toBeNull();
    await user.click(agencyTwoRow!);

    // URL should be updated with agencyId parameter
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith(
        expect.stringContaining('agencyId=Agency'),
      );
    });
  });

  it('removes the agencyId from URL when agency is deselected', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    const agencyTwoRow = screen.getByText('Agency Two').closest('tr');
    expect(agencyTwoRow).not.toBeNull();

    // Select
    await user.click(agencyTwoRow!);
    await waitFor(() => {
      expect(agencyTwoRow).toHaveAttribute('aria-selected', 'true');
    });

    // Deselect
    await user.click(agencyTwoRow!);

    // URL should be updated to remove agencyId (navigates to '/')
    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/');
    });
  });
});

// ===========================================================================
// AC-7: Direct navigation with agencyId pre-selects agency
// ===========================================================================

describe('AC-7: URL-based agency pre-selection', () => {
  it('pre-selects the agency from URL agencyId parameter and shows filtered data', async () => {
    setAdminSession();
    mockSearchParams = new URLSearchParams('agencyId=Agency One');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Agency One row should be selected (set via useEffect after dashboard loads)
    await waitFor(() => {
      const agencyOneRow = screen.getByText('Agency One').closest('tr');
      expect(agencyOneRow).toHaveAttribute('aria-selected', 'true');
    });

    // Metrics should show Agency One only:
    // Ready = 500000 + 200000 = 700000
    expect(screen.getByText('R 700 000,00')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-8: Browser back preserves agency selection via URL
// ===========================================================================

describe('AC-8: Browser back preserves selection', () => {
  it('restores agency selection from URL agencyId when returning via browser back', async () => {
    // Simulates the scenario: user selected Agency One, navigated away, pressed back
    // On return, the URL still has agencyId=Agency One
    setAdminSession();
    mockSearchParams = new URLSearchParams('agencyId=Agency One');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Agency One should be pre-selected from URL (set via useEffect after dashboard loads)
    await waitFor(() => {
      const agencyOneRow = screen.getByText('Agency One').closest('tr');
      expect(agencyOneRow).toHaveAttribute('aria-selected', 'true');
    });

    // Filtered data for Agency One should display
    expect(screen.getByText('R 700 000,00')).toBeInTheDocument();
  });
});

// ===========================================================================
// AC-9: Payments Ready chart filters by selected agency
// ===========================================================================

describe('AC-9: Payments Ready chart filtered by agency', () => {
  it('shows only the selected agency payment counts in the Payments Ready chart area', async () => {
    setAdminSession();
    mockSearchParams = new URLSearchParams('agencyId=Agency One');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    // With Agency One selected, the Payments Ready chart should show Agency One data only
    // The chart heading should still be present
    await waitFor(() => {
      expect(
        screen.getByText('Payments Ready for Payment'),
      ).toBeInTheDocument();
    });

    // Ready metric for Agency One only = 700000 (wait for useEffect initialization)
    await waitFor(() => {
      expect(screen.getByText('R 700 000,00')).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-10: Parked Payments chart filters by selected agency
// ===========================================================================

describe('AC-10: Parked Payments chart filtered by agency', () => {
  it('shows only the selected agency parked payment counts in the Parked Payments chart area', async () => {
    setAdminSession();
    mockSearchParams = new URLSearchParams('agencyId=Agency One');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Parked Payments')).toBeInTheDocument();
    });

    // Parked metric for Agency One only = 150000 + 50000 = 200000 (wait for useEffect initialization)
    await waitFor(() => {
      expect(screen.getByText('R 200 000,00')).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// AC-11: Metric cards filter by selected agency
// ===========================================================================

describe('AC-11: Metric cards filtered by selected agency', () => {
  it('shows 14-day metric filtered to only the selected agency payments', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-03T12:00:00Z'));

    setAdminSession();
    mockSearchParams = new URLSearchParams('agencyId=Agency Two');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(
      createPaymentsResponse([
        createPayment({
          Id: 1,
          Status: 'PROCESSED',
          LastChangedDate: '2026-03-30',
          CommissionAmount: 50000,
          AgencyName: 'Agency One',
        }),
        createPayment({
          Id: 2,
          Status: 'PROCESSED',
          LastChangedDate: '2026-03-28',
          CommissionAmount: 75000,
          AgencyName: 'Agency Two',
        }),
        createPayment({
          Id: 3,
          Status: 'PROCESSED',
          LastChangedDate: '2026-04-01',
          CommissionAmount: 30000,
          AgencyName: 'Agency Two',
        }),
      ]),
    );

    renderDashboard();

    await vi.waitFor(() => {
      expect(
        screen.getByText('Payments Made (Last 14 Days)'),
      ).toBeInTheDocument();
    });

    // With Agency Two selected, only Agency Two payments should be counted:
    // 75000 + 30000 = 105000
    await vi.waitFor(() => {
      expect(screen.getByText('R 105 000,00')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

// ===========================================================================
// AC-12: Invalid agencyId in URL falls back to default view
// ===========================================================================

describe('AC-12: Invalid agencyId in URL graceful fallback', () => {
  it('shows combined all-agency view for Admin when URL contains non-existent agencyId', async () => {
    setAdminSession();
    mockSearchParams = new URLSearchParams('agencyId=NonExistentAgency');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Should fall back to all-agency view — all three agencies visible
    expect(screen.getByText('Agency One')).toBeInTheDocument();
    expect(screen.getByText('Agency Two')).toBeInTheDocument();
    expect(screen.getByText('Agency Three')).toBeInTheDocument();

    // Combined totals
    // Ready = 1800000
    expect(screen.getByText('R 1 800 000,00')).toBeInTheDocument();
  });

  it('shows own agency data for Broker when URL contains non-existent agencyId', async () => {
    setBrokerSession('Agency Two');
    mockSearchParams = new URLSearchParams('agencyId=NonExistentAgency');
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Should fall back to Broker's own agency
    expect(screen.getByText('Agency Two')).toBeInTheDocument();
    expect(screen.queryByText('Agency One')).not.toBeInTheDocument();
  });
});

// ===========================================================================
// AC-13: Agent sees read-only Dashboard
// ===========================================================================

describe('AC-13: Agent read-only Dashboard view', () => {
  it('displays dashboard data but clicking agency rows does not change selection', async () => {
    const user = userEvent.setup();
    setAgentSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Dashboard data should be visible
    expect(screen.getByText('Agency One')).toBeInTheDocument();
    expect(screen.getByText('Agency Two')).toBeInTheDocument();

    // Click on Agency One row — should NOT select it
    const agencyOneRow = screen.getByText('Agency One').closest('tr');
    expect(agencyOneRow).not.toBeNull();
    await user.click(agencyOneRow!);

    // Row should NOT be selected (no aria-selected="true")
    expect(agencyOneRow).not.toHaveAttribute('aria-selected', 'true');

    // Metrics should remain at combined all-agency values
    expect(screen.getByText('R 1 800 000,00')).toBeInTheDocument();
  });
});

// ===========================================================================
// Edge Case E1: Agency with no data shows zero metrics when selected
// ===========================================================================

describe('E1: Agency with no data shows zero metrics when selected', () => {
  it('displays R 0,00 for all metric values when an agency with no payments is selected', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Click on Agency Three (has zero data)
    const agencyThreeRow = screen.getByText('Agency Three').closest('tr');
    expect(agencyThreeRow).not.toBeNull();
    await user.click(agencyThreeRow!);

    // Ready and Parked totals should be R 0,00
    await waitFor(() => {
      const zeroValues = screen.getAllByText('R 0,00');
      // At least 2 zero values: Total Value Ready and Total Value Parked
      expect(zeroValues.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ===========================================================================
// Edge Case E3: Admin selects agency, then selects a different agency
// ===========================================================================

describe('E3: Admin switches agency selection', () => {
  it('updates to the new agency data when a different agency row is clicked', async () => {
    const user = userEvent.setup();
    setAdminSession();
    mockGetDashboard.mockResolvedValue(createMultiAgencyDashboardResponse());
    mockGetPayments.mockResolvedValue(createPaymentsResponse([]));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Agency Summary')).toBeInTheDocument();
    });

    // Select Agency One first
    const agencyOneRow = screen.getByText('Agency One').closest('tr');
    expect(agencyOneRow).not.toBeNull();
    await user.click(agencyOneRow!);

    await waitFor(() => {
      expect(agencyOneRow).toHaveAttribute('aria-selected', 'true');
    });

    // Now select Agency Two
    const agencyTwoRow = screen.getByText('Agency Two').closest('tr');
    expect(agencyTwoRow).not.toBeNull();
    await user.click(agencyTwoRow!);

    // Agency Two should be selected, Agency One deselected
    await waitFor(() => {
      expect(agencyTwoRow).toHaveAttribute('aria-selected', 'true');
    });
    expect(agencyOneRow).not.toHaveAttribute('aria-selected', 'true');

    // Metrics should show Agency Two data:
    // Ready = 800000 + 300000 = 1100000
    expect(screen.getByText('R 1 100 000,00')).toBeInTheDocument();
  });
});
