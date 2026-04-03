# Test Handoff: Dashboard with Charts, Metrics, and Agency Summary Grid

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-1-dashboard-charts-metrics-grid-test-design.md](./story-1-dashboard-charts-metrics-grid-test-design.md)
**Epic:** 2 | **Story:** 1

## Coverage for WRITE-TESTS

- AC-1: "Payments Ready for Payment" bar chart with commission type split → Example 1
- AC-2: "Parked Payments" bar chart with commission type split → Example 2
- AC-3: "Total Value Ready for Payment" metric card in ZAR → Example 3
- AC-4: "Total Value of Parked Payments" metric card in ZAR → Example 4
- AC-5: "Parked Payments Aging Report" chart with day ranges → Example 5
- AC-6: "Payments Made (Last 14 Days)" metric in ZAR → Example 6
- AC-7: 14-day metric frontend computation (sum PROCESSED within 14 days) → Example 6
- AC-8: Agency Summary grid with agency name, payment count, commission, VAT → Example 7
- AC-9: Each agency row has a "View" button → Example 7, Example 8
- AC-10: "View" button navigates to /payments?agencyId=N → Example 8
- AC-11: All currency values use ZAR formatting → Example 3, Example 4, Example 7, Edge Example E3
- AC-12: Loading indicators while data is being fetched → Example 9
- AC-13: Dashboard API failure shows error message → Example 10
- AC-14: Payments API failure shows error for 14-day metric, rest of dashboard still displays → Edge Example E1
- AC-15: Empty data shows empty state message → Edge Example E2
- AC-16: Agencies with zero payments appear in grid with zero values → Example 7

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: full page (`app/page.tsx` Dashboard component)
- Suggested primary assertions:
  - Bar chart components render with correct titles and data labels (text-based assertions, not SVG internals)
  - Metric cards render with correct titles and ZAR-formatted values
  - Agency Summary grid renders correct rows with agency names, counts, and formatted amounts
  - "View" button triggers navigation to `/payments?agencyId=N`
  - Loading indicators appear when data is not yet loaded
  - Error message appears when dashboard API fails
  - Partial error: 14-day metric shows error while rest of dashboard displays normally
  - Empty state message appears when API returns empty data
- Important ambiguity flags:
  - 14-day boundary: whether "last 14 calendar days" includes today or not (BA decision D1 in test-design). For tests, use dates clearly within and clearly outside the window to avoid boundary ambiguity.
  - "Ready for Payment" status mapping: tests should use the data from the dashboard API PaymentStatusReport as-is, filtering for READY status entries for the "Ready" chart and PARKED entries for the "Parked" chart (BA decision D2).
- Mock strategy:
  - Mock `getDashboard` from `@/lib/api/endpoints` to return configured `PaymentsDashboardRead` responses
  - Mock `getPayments` from `@/lib/api/endpoints` to return configured `PaymentReadList` for the 14-day metric computation
  - Mock `next/navigation` for `useRouter` to verify navigation on "View" click
  - Use `vi.useFakeTimers()` with `vi.setSystemTime()` to control "today's date" for the 14-day computation test
  - For error scenarios, mock endpoints to reject with appropriate error responses
  - Do NOT test Recharts SVG internals — assert on visible text labels and values only
- Existing utilities to use:
  - `formatCurrency` from `@/lib/utils/formatting` is the ZAR formatter (already tested in Epic 1 Story 5)
  - `getDashboard` and `getPayments` from `@/lib/api/endpoints` are the typed API functions
  - Types `PaymentsDashboardRead`, `PaymentStatusReportItem`, `ParkedPaymentsAgingReportItem`, `PaymentsByAgencyReportItem`, `PaymentRead` from `@/types/api-generated`
- The current `app/page.tsx` is a placeholder. The implementation will replace it entirely with the dashboard components.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. "Payments Ready for Payment" bar chart | Unit-testable (RTL) | Component renders chart title and data labels based on mocked API response |
| 2. "Parked Payments" bar chart | Unit-testable (RTL) | Component renders chart title and data labels based on mocked API response |
| 3. "Total Value Ready for Payment" metric card | Unit-testable (RTL) | Component renders formatted currency value from API data |
| 4. "Total Value of Parked Payments" metric card | Unit-testable (RTL) | Component renders formatted currency value from API data |
| 5. Parked Payments Aging Report chart | Unit-testable (RTL) | Component renders aging ranges and counts as text/labels |
| 6. "Payments Made (Last 14 Days)" frontend computation | Unit-testable (RTL) | Can mock date and payments list, verify computed sum display |
| 7. Agency Summary grid | Unit-testable (RTL) | Component renders table rows with agency data |
| 8. "View" button navigation | Unit-testable (RTL) | Can mock router.push and verify it's called with correct URL |
| 9. Loading state | Unit-testable (RTL) | Can render with pending API state and verify loading indicators |
| 10. Dashboard API failure | Unit-testable (RTL) | Can mock API rejection and verify error message |
| E1. Partial failure (payments API) | Unit-testable (RTL) | Can mock one endpoint to fail and one to succeed, verify partial rendering |
| E2. Empty data | Unit-testable (RTL) | Can mock empty API responses and verify empty state message |
| E3. ZAR formatting consistency | Unit-testable (RTL) | Formatting utility already tested; verify integration with displayed values |

All scenarios in this story are unit-testable. No runtime verification needed.
