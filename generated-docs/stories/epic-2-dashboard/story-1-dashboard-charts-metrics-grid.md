# Story: Dashboard with Charts, Metrics, and Agency Summary Grid

**Epic:** Dashboard (Screen 1) | **Story:** 1 of 2 | **Wireframe:** generated-docs/specs/wireframes/screen-1-dashboard.md

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond Commission Payments system **I want** to see a Dashboard with charts, metrics, and an agency summary grid when I open the application **So that** I can quickly understand the current state of commission payments across agencies at a glance.

## Acceptance Criteria

### Happy Path — Page and Data Loading
- [x] AC-1: Given I am on the home page (Dashboard), when data loads from the API, then I see a "Payments Ready for Payment" bar chart showing payment counts split by commission type (Bond Comm and Manual Payments).
- [x] AC-2: Given I am on the home page (Dashboard), when data loads, then I see a "Parked Payments" bar chart showing parked payment counts split by commission type (Bond Comm and Manual Payments).
- [x] AC-3: Given I am on the home page (Dashboard), when data loads, then I see a "Total Value Ready for Payment" metric card displaying the sum of commission amounts for non-processed and non-parked payments, formatted in ZAR (e.g., R 1 234 567,89).
- [x] AC-4: Given I am on the home page (Dashboard), when data loads, then I see a "Total Value of Parked Payments" metric card displaying the sum of commission amounts for parked payments, formatted in ZAR.
- [x] AC-5: Given I am on the home page (Dashboard), when data loads, then I see a "Parked Payments Aging Report" chart showing how long payments have been parked, grouped into ranges: 1–3 days, 4–7 days, and more than 7 days.
- [x] AC-6: Given I am on the home page (Dashboard), when data loads, then I see a "Payments Made (Last 14 Days)" metric displaying the total value of recently processed payments, formatted in ZAR.

### Happy Path — 14-Day Metric Computation
- [x] AC-7: Given I am on the home page (Dashboard), when payments data loads, then the "Payments Made (Last 14 Days)" value is computed on the frontend by summing CommissionAmount from all payments where Status is PROCESSED and LastChangedDate falls within the last 14 calendar days.

### Happy Path — Agency Summary Grid
- [x] AC-8: Given I am on the home page (Dashboard), when data loads, then I see an Agency Summary grid with one row per agency showing: Agency Name, Number of Payments, Total Commission Amount (ZAR), and VAT (ZAR).
- [x] AC-9: Given I am on the home page (Dashboard), when I see the Agency Summary grid, then each row has a "View" button.
- [x] AC-10: Given I am on the home page (Dashboard), when I click the "View" button on an agency row, then I am navigated to the Payment Management screen filtered for that agency (e.g., /payments?agencyId=N).

### Happy Path — Currency Formatting
- [x] AC-11: Given I am on the home page (Dashboard), when data is displayed, then all currency values use South African ZAR formatting with space as thousands separator and comma as decimal separator (e.g., R 1 234 567,89).

### Loading and Error States
- [x] AC-12: Given I am on the home page (Dashboard), when data is being fetched from the API, then I see loading indicators in place of the charts, metrics, and grid.
- [x] AC-13: Given I am on the home page (Dashboard), when the dashboard API call fails, then I see an error message explaining that data could not be loaded.
- [x] AC-14: Given I am on the home page (Dashboard), when the payments API call fails (needed for the 14-day metric), then I see an error message for that metric while the rest of the dashboard still displays if its data loaded successfully.

### Edge Cases
- [x] AC-15: Given I am on the home page (Dashboard), when the API returns no data (zero agencies, zero payments), then I see an empty state message instead of blank charts and an empty grid.
- [x] AC-16: Given I am on the home page (Dashboard), when the API returns agencies with zero payments, then the Agency Summary grid shows those agencies with zero values rather than hiding them.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments/dashboard` | Fetch dashboard metrics: status reports, aging report, agency summary |
| GET | `/v1/payments` | Fetch all payments (used to compute 14-day Payments Made metric on frontend) |

## Implementation Notes
- The home page at `/` replaces the template placeholder with the full Dashboard screen.
- Data for charts and metric cards comes from `GET /v1/payments/dashboard` (PaymentStatusReport, ParkedPaymentsAgingReport, PaymentsByAgency).
- The 14-day metric requires a separate `GET /v1/payments` call to access individual payment records with Status and LastChangedDate fields (BR8).
- Use existing ZAR formatting utilities from Epic 1 (Story 5) for all currency values.
- Use existing API client from Epic 1 (Story 2) for all fetch calls.
- Use existing loading/error patterns from Epic 1 (Story 6) for error handling.
- Bar charts should use Recharts or similar charting library compatible with Shadcn UI.
- FRS references: R6, R7, R8, R9, R10, R11, R12, R13, BR8.
