'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDashboard, getPayments } from '@/lib/api/endpoints';
import { formatCurrency } from '@/lib/utils/formatting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  PaymentsDashboardRead,
  PaymentStatusReportItem,
  ParkedPaymentsAgingReportItem,
  PaymentsByAgencyReportItem,
  PaymentRead,
} from '@/types/api-generated';

interface DashboardState {
  dashboard: PaymentsDashboardRead | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  payments: PaymentRead[] | null;
  payments14DayLoading: boolean;
  payments14DayError: string | null;
}

function computeReadyForPaymentChartData(
  statusReport: PaymentStatusReportItem[],
): { commissionType: string; count: number }[] {
  const readyItems = statusReport.filter((item) => item.Status === 'READY');
  const grouped: Record<string, number> = {};
  for (const item of readyItems) {
    grouped[item.CommissionType] =
      (grouped[item.CommissionType] || 0) + item.PaymentCount;
  }
  return Object.entries(grouped).map(([commissionType, count]) => ({
    commissionType,
    count,
  }));
}

function computeParkedChartData(
  statusReport: PaymentStatusReportItem[],
): { commissionType: string; count: number }[] {
  const parkedItems = statusReport.filter((item) => item.Status === 'PARKED');
  const grouped: Record<string, number> = {};
  for (const item of parkedItems) {
    grouped[item.CommissionType] =
      (grouped[item.CommissionType] || 0) + item.PaymentCount;
  }
  return Object.entries(grouped).map(([commissionType, count]) => ({
    commissionType,
    count,
  }));
}

function computeTotalReadyValue(
  statusReport: PaymentStatusReportItem[],
): number {
  return statusReport
    .filter((item) => item.Status === 'READY')
    .reduce((sum, item) => sum + item.TotalPaymentAmount, 0);
}

function computeTotalParkedValue(
  statusReport: PaymentStatusReportItem[],
): number {
  return statusReport
    .filter((item) => item.Status === 'PARKED')
    .reduce((sum, item) => sum + item.TotalPaymentAmount, 0);
}

function compute14DayPaymentsValue(payments: PaymentRead[]): number {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  return payments
    .filter((p) => {
      if (p.Status !== 'PROCESSED') return false;
      const changedDate = new Date(p.LastChangedDate);
      return changedDate >= fourteenDaysAgo;
    })
    .reduce((sum, p) => sum + p.CommissionAmount, 0);
}

function isDashboardEmpty(dashboard: PaymentsDashboardRead): boolean {
  return (
    dashboard.PaymentStatusReport.length === 0 &&
    dashboard.ParkedPaymentsAgingReport.length === 0 &&
    dashboard.PaymentsByAgency.length === 0
  );
}

/**
 * Filter data by agency name. If agencyFilter is null, returns all data.
 */
function filterStatusReport(
  items: PaymentStatusReportItem[],
  agencyFilter: string | null,
): PaymentStatusReportItem[] {
  if (!agencyFilter) return items;
  return items.filter((item) => item.AgencyName === agencyFilter);
}

function filterAgingReport(
  items: ParkedPaymentsAgingReportItem[],
  agencyFilter: string | null,
): ParkedPaymentsAgingReportItem[] {
  if (!agencyFilter) return items;
  return items.filter((item) => item.AgencyName === agencyFilter);
}

function filterPaymentsByAgency(
  items: PaymentsByAgencyReportItem[],
  agencyFilter: string | null,
): PaymentsByAgencyReportItem[] {
  if (!agencyFilter) return items;
  return items.filter((item) => item.AgencyName === agencyFilter);
}

function filterPayments(
  payments: PaymentRead[],
  agencyFilter: string | null,
): PaymentRead[] {
  if (!agencyFilter) return payments;
  return payments.filter((p) => p.AgencyName === agencyFilter);
}

/**
 * Check if an agency name exists in the dashboard data.
 */
function isValidAgency(
  dashboard: PaymentsDashboardRead,
  agencyName: string,
): boolean {
  return dashboard.PaymentsByAgency.some((a) => a.AgencyName === agencyName);
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const userRole = session?.user?.role;
  const userAgencyId = (session?.user as { agencyId?: string } | undefined)
    ?.agencyId;

  // Determine if this user is a Broker (pre-filtered to own agency)
  const isBroker = userRole === 'broker';
  // Determine if this user is an Agent (read-only, no agency selection)
  const isAgent = userRole === 'agent';

  const [state, setState] = useState<DashboardState>({
    dashboard: null,
    dashboardLoading: true,
    dashboardError: null,
    payments: null,
    payments14DayLoading: true,
    payments14DayError: null,
  });

  // Track user-initiated agency selection (Admin clicking rows)
  // null means "no explicit selection" — use URL or default
  const [clickedAgency, setClickedAgency] = useState<string | null>(null);
  // Track whether the user has explicitly interacted (to distinguish "no selection" from "initial state")
  const [hasUserClicked, setHasUserClicked] = useState(false);

  // Derive the effective agency filter from role, URL, user click, and data
  const effectiveAgencyFilter = useMemo(() => {
    // Broker is always locked to own agency
    if (isBroker && userAgencyId) {
      return userAgencyId;
    }
    // Agent: no filtering
    if (isAgent) {
      return null;
    }
    // Admin: user click takes priority
    if (hasUserClicked) {
      return clickedAgency;
    }
    // Admin: check URL for agencyId (initial load / back navigation)
    const urlAgency = searchParams.get('agencyId');
    if (
      urlAgency &&
      state.dashboard &&
      isValidAgency(state.dashboard, urlAgency)
    ) {
      return urlAgency;
    }
    // Default: no filter (all agencies)
    return null;
  }, [
    isBroker,
    userAgencyId,
    isAgent,
    hasUserClicked,
    clickedAgency,
    searchParams,
    state.dashboard,
  ]);

  // Derive selectedAgency for visual highlight (matches effectiveAgencyFilter for Admin/Broker)
  const selectedAgency = effectiveAgencyFilter;

  // Handle agency row click
  const handleAgencyRowClick = useCallback(
    (agencyName: string) => {
      // Agent role: no selection allowed
      if (isAgent) return;
      // Broker role: no selection changes allowed
      if (isBroker) return;

      // Admin: toggle selection
      setHasUserClicked(true);
      if (clickedAgency === agencyName) {
        // Deselect
        setClickedAgency(null);
        router.replace('/');
      } else {
        // Select new agency
        setClickedAgency(agencyName);
        router.replace(`/?agencyId=${encodeURIComponent(agencyName)}`);
      }
    },
    [isAgent, isBroker, clickedAgency, router],
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const data = await getDashboard();
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            dashboard: data,
            dashboardLoading: false,
          }));
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            dashboardLoading: false,
            dashboardError: 'Dashboard data could not be loaded.',
          }));
        }
      }
    }

    async function fetchPayments() {
      try {
        const data = await getPayments();
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            payments: data.PaymentList,
            payments14DayLoading: false,
          }));
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            payments14DayLoading: false,
            payments14DayError: 'Failed to load payments data for this metric.',
          }));
        }
      }
    }

    fetchDashboard();
    fetchPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute filtered data
  const filteredStatusReport = useMemo(
    () =>
      state.dashboard
        ? filterStatusReport(
            state.dashboard.PaymentStatusReport,
            effectiveAgencyFilter,
          )
        : [],
    [state.dashboard, effectiveAgencyFilter],
  );

  const filteredAgingReport = useMemo(
    () =>
      state.dashboard
        ? filterAgingReport(
            state.dashboard.ParkedPaymentsAgingReport,
            effectiveAgencyFilter,
          )
        : [],
    [state.dashboard, effectiveAgencyFilter],
  );

  // For the agency grid: Broker sees only own agency; Admin/Agent see all agencies
  // (Admin selection filters charts/metrics but the grid still shows all agencies)
  const displayAgencies = useMemo(
    () =>
      state.dashboard
        ? filterPaymentsByAgency(
            state.dashboard.PaymentsByAgency,
            isBroker ? effectiveAgencyFilter : null,
          )
        : [],
    [state.dashboard, isBroker, effectiveAgencyFilter],
  );

  const payments14DayValue = useMemo(() => {
    if (!state.payments) return null;
    const filtered = filterPayments(state.payments, effectiveAgencyFilter);
    return compute14DayPaymentsValue(filtered);
  }, [state.payments, effectiveAgencyFilter]);

  // Loading state
  if (state.dashboardLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton role="status" className="h-48 w-full" />
          <Skeleton role="status" className="h-48 w-full" />
          <Skeleton role="status" className="h-24 w-full" />
          <Skeleton role="status" className="h-24 w-full" />
          <Skeleton role="status" className="h-48 w-full" />
          <Skeleton role="status" className="h-24 w-full" />
        </div>
        <Skeleton role="status" className="h-64 w-full mt-4" />
      </div>
    );
  }

  // Dashboard API error
  if (state.dashboardError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{state.dashboardError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboard = state.dashboard!;

  // Empty state
  if (isDashboardEmpty(dashboard)) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No data available. There are currently no payments or agencies to
              display.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const readyChartData = computeReadyForPaymentChartData(filteredStatusReport);
  const parkedChartData = computeParkedChartData(filteredStatusReport);
  const totalReadyValue = computeTotalReadyValue(filteredStatusReport);
  const totalParkedValue = computeTotalParkedValue(filteredStatusReport);

  const agingData = filteredAgingReport.reduce(
    (acc: Record<string, number>, item: ParkedPaymentsAgingReportItem) => {
      acc[item.Range] = (acc[item.Range] || 0) + item.PaymentCount;
      return acc;
    },
    {},
  );
  const agingChartData = Object.entries(agingData).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        {/* AC-1: Payments Ready for Payment bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payments Ready for Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={readyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="commissionType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Payments" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AC-2: Parked Payments bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Parked Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={parkedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="commissionType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Payments" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AC-3: Total Value Ready for Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Total Value Ready for Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(totalReadyValue)}
            </p>
          </CardContent>
        </Card>

        {/* AC-4: Total Value of Parked Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Total Value of Parked Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(totalParkedValue)}
            </p>
          </CardContent>
        </Card>

        {/* AC-5: Parked Payments Aging Report */}
        <Card>
          <CardHeader>
            <CardTitle>Parked Payments Aging Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around mb-2 text-sm text-muted-foreground">
              {agingChartData.map((item) => (
                <span key={item.range}>
                  {item.range}: {item.count}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Payments" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AC-6: Payments Made (Last 14 Days) */}
        <Card>
          <CardHeader>
            <CardTitle>Payments Made (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {state.payments14DayLoading ? (
              <Skeleton role="status" className="h-10 w-48" />
            ) : state.payments14DayError ? (
              <p className="text-destructive">{state.payments14DayError}</p>
            ) : (
              <p className="text-3xl font-bold">
                {formatCurrency(payments14DayValue)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AC-8: Agency Summary grid */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency Name</TableHead>
                <TableHead>Number of Payments</TableHead>
                <TableHead>Total Commission Amount</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayAgencies.map((agency: PaymentsByAgencyReportItem) => (
                <TableRow
                  key={agency.AgencyName}
                  aria-selected={
                    selectedAgency === agency.AgencyName ? 'true' : undefined
                  }
                  className={
                    selectedAgency === agency.AgencyName
                      ? 'bg-muted cursor-pointer'
                      : 'cursor-pointer'
                  }
                  onClick={() => handleAgencyRowClick(agency.AgencyName)}
                >
                  <TableCell>{agency.AgencyName}</TableCell>
                  <TableCell>{agency.PaymentCount}</TableCell>
                  <TableCell>
                    {formatCurrency(agency.TotalCommissionCount)}
                  </TableCell>
                  <TableCell>{formatCurrency(agency.Vat)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/payments?agencyId=${encodeURIComponent(agency.AgencyName)}`,
                        );
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
