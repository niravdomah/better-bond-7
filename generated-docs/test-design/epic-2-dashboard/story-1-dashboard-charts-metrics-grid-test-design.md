# Test Design: Dashboard with Charts, Metrics, and Agency Summary Grid

## Story Summary

**Epic:** 2
**Story:** 1
**As a** user of the BetterBond Commission Payments system
**I want to** see a Dashboard with charts, metrics, and an agency summary grid when I open the application
**So that** I can quickly understand the current state of commission payments across agencies at a glance.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- **B1: "Payments Ready for Payment" bar chart** — The dashboard displays a bar chart showing payment counts for non-processed, non-parked payments, split by commission type (Bond Comm and Manual Payments).
- **B2: "Parked Payments" bar chart** — A second bar chart shows payment counts for parked payments, also split by commission type.
- **B3: "Total Value Ready for Payment" metric card** — A metric card displays the sum of commission amounts for payments that are neither processed nor parked, formatted in ZAR.
- **B4: "Total Value of Parked Payments" metric card** — A metric card displays the sum of commission amounts for parked payments, formatted in ZAR.
- **B5: "Parked Payments Aging Report" chart** — A chart displays parked payment counts grouped into aging ranges: 1-3 days, 4-7 days, and more than 7 days.
- **B6: "Payments Made (Last 14 Days)" metric** — A metric card displays the total value of recently processed payments, computed on the frontend by summing CommissionAmount from payments where Status is PROCESSED and LastChangedDate falls within the last 14 calendar days.
- **B7: Agency Summary grid** — A data table shows one row per agency with columns: Agency Name, Number of Payments, Total Commission Amount (ZAR), and VAT (ZAR).
- **B8: Agency "View" button navigation** — Each agency row has a "View" button that navigates to the Payment Management screen filtered for that agency.
- **B9: ZAR currency formatting** — All currency values use South African Rand formatting with space as thousands separator and comma as decimal separator (e.g., R 1 234 567,89).
- **B10: Loading states** — Loading indicators appear in place of charts, metrics, and the grid while data is being fetched.
- **B11: Error handling — dashboard API failure** — When the dashboard API call fails, an error message is shown explaining that data could not be loaded.
- **B12: Error handling — payments API failure (partial)** — When the payments API call fails (needed for the 14-day metric), an error is shown for that metric while the rest of the dashboard still displays if its data loaded successfully.
- **B13: Empty state** — When the API returns no data, the user sees an empty state message instead of blank charts and an empty grid.
- **B14: Agencies with zero payments** — Agencies with zero payments still appear in the grid with zero values rather than being hidden.

## Key Decisions Surfaced by AI

- **D1: 14-day metric — which date boundary counts as "within 14 days"?** The story says "last 14 calendar days." Does that mean strictly within the past 14 full days (excluding today), or does it include today as day 0? For example, if today is 3 April 2026, does a payment processed on 20 March 2026 (exactly 14 days ago) count?
- **D2: Bar chart data source — which statuses count as "Ready for Payment"?** The dashboard API returns PaymentStatusReport items with a Status field. AC-1 says "Payments Ready for Payment" but the API may return multiple non-PROCESSED statuses (READY, PARKED, etc.). Are we showing only Status=READY payments in the "Ready" chart, or all non-PROCESSED/non-PARKED payments? The wireframe element description says "Count of non-PROCESSED payments" which would include PARKED, but that contradicts having a separate Parked chart.
- **D3: "Total Value Ready for Payment" — does it include or exclude parked?** AC-3 says "non-processed and non-parked payments." The wireframe element description says "Status != PROCESSED and != PARKED." These agree. Confirming: this metric excludes both PROCESSED and PARKED payments.

## Test Scenarios / Review Examples

### 1. Dashboard displays "Payments Ready for Payment" bar chart

| Setup | Value |
| --- | --- |
| Dashboard API returns | PaymentStatusReport with entries for Status=READY |
| Commission types present | Bond Comm: 15 payments, Manual Payments: 8 payments |

| Expected | Value |
| --- | --- |
| Bar chart visible | Yes — titled "Payments Ready for Payment" |
| Bars shown | Two bars: Bond Comm (15) and Manual Payments (8) |

---

### 2. Dashboard displays "Parked Payments" bar chart

| Setup | Value |
| --- | --- |
| Dashboard API returns | PaymentStatusReport with entries for Status=PARKED |
| Commission types present | Bond Comm: 5 payments, Manual Payments: 3 payments |

| Expected | Value |
| --- | --- |
| Bar chart visible | Yes — titled "Parked Payments" |
| Bars shown | Two bars: Bond Comm (5) and Manual Payments (3) |

---

### 3. "Total Value Ready for Payment" metric card

| Setup | Value |
| --- | --- |
| Dashboard API returns | PaymentStatusReport with READY entries |
| Total payment amount for READY (non-parked, non-processed) | 1234567.89 |

| Expected | Value |
| --- | --- |
| Metric card visible | Yes — titled "Total Value Ready for Payment" |
| Displayed value | R 1 234 567,89 |

---

### 4. "Total Value of Parked Payments" metric card

| Setup | Value |
| --- | --- |
| Dashboard API returns | PaymentStatusReport with PARKED entries |
| Total payment amount for PARKED | 456789.12 |

| Expected | Value |
| --- | --- |
| Metric card visible | Yes — titled "Total Value of Parked Payments" |
| Displayed value | R 456 789,12 |

---

### 5. Parked Payments Aging Report chart

| Setup | Value |
| --- | --- |
| Dashboard API returns | ParkedPaymentsAgingReport with three ranges |
| 1-3 days | 10 payments |
| 4-7 days | 6 payments |
| More than 7 days | 3 payments |

| Expected | Value |
| --- | --- |
| Aging chart visible | Yes — titled "Parked Payments Aging Report" |
| Ranges displayed | 1-3 days (10), 4-7 days (6), >7 days (3) |

---

### 6. "Payments Made (Last 14 Days)" metric — frontend computation

| Setup | Value |
| --- | --- |
| Today's date | 3 April 2026 |
| Payments API returns | 4 payments |
| Payment A | Status=PROCESSED, LastChangedDate=2026-03-25, CommissionAmount=50000 |
| Payment B | Status=PROCESSED, LastChangedDate=2026-03-30, CommissionAmount=75000 |
| Payment C | Status=PROCESSED, LastChangedDate=2026-03-10, CommissionAmount=30000 (older than 14 days) |
| Payment D | Status=READY, LastChangedDate=2026-03-28, CommissionAmount=20000 (not processed) |

| Expected | Value |
| --- | --- |
| Metric card visible | Yes — titled "Payments Made (Last 14 Days)" |
| Displayed value | R 125 000,00 (sum of Payment A + B only) |
| Payment C excluded | Yes — older than 14 days |
| Payment D excluded | Yes — not in PROCESSED status |

---

### 7. Agency Summary grid with multiple agencies

| Setup | Value |
| --- | --- |
| Dashboard API returns | PaymentsByAgency with 3 agencies |
| Agency One | 12 payments, Commission R 123 456,78, VAT R 12 345,68 |
| Agency Two | 8 payments, Commission R 89 012,34, VAT R 8 901,23 |
| Agency Three | 0 payments, Commission R 0,00, VAT R 0,00 |

| Expected | Value |
| --- | --- |
| Grid visible | Yes — titled "Agency Summary" |
| Row count | 3 rows (including Agency Three with zero payments) |
| Agency One row | Agency One, 12, R 123 456,78, R 12 345,68 |
| Agency Two row | Agency Two, 8, R 89 012,34, R 8 901,23 |
| Agency Three row | Agency Three, 0, R 0,00, R 0,00 |
| Each row has "View" button | Yes |

---

### 8. Clicking "View" on an agency row navigates to Payment Management

| Setup | Value |
| --- | --- |
| User is on the Dashboard |  |
| Agency row visible | Agency One (agencyId = 5) |

| Input | Value |
| --- | --- |
| User action | Clicks "View" button on Agency One row |

| Expected | Value |
| --- | --- |
| Navigation | User is taken to /payments?agencyId=5 |

---

### 9. Loading state while data is being fetched

| Setup | Value |
| --- | --- |
| Dashboard page is loading | API calls in progress |

| Expected | Value |
| --- | --- |
| Charts area | Shows loading indicators (not blank) |
| Metric cards area | Shows loading indicators (not blank) |
| Agency Summary grid area | Shows loading indicator (not blank) |

---

### 10. Dashboard API failure shows error message

| Setup | Value |
| --- | --- |
| Dashboard API call | Returns 500 error |

| Expected | Value |
| --- | --- |
| Error message shown | Yes — explains that dashboard data could not be loaded |
| Charts and metrics | Not displayed (no stale data) |

## Edge and Alternate Examples

### E1. Payments API failure while dashboard API succeeds (partial failure)

| Setup | Value |
| --- | --- |
| Dashboard API call | Succeeds with charts, metrics, agency data |
| Payments API call | Returns 500 error |

| Expected | Value |
| --- | --- |
| Charts and metric cards | Displayed normally from dashboard API data |
| Agency Summary grid | Displayed normally |
| "Payments Made (Last 14 Days)" metric | Shows error message for this metric only |

---

### E2. API returns completely empty data (no agencies, no payments)

| Setup | Value |
| --- | --- |
| Dashboard API returns | Empty arrays: PaymentStatusReport=[], ParkedPaymentsAgingReport=[], PaymentsByAgency=[] |
| Payments API returns | Empty array: [] |

| Expected | Value |
| --- | --- |
| Empty state message | Shown instead of blank charts and empty grid |
| No blank charts visible | Correct — empty state replaces them |

---

### E3. All currency values use ZAR formatting consistently

| Setup | Value |
| --- | --- |
| Various values on screen | 0, 1234567.89, 99.50 |

| Expected | Value |
| --- | --- |
| Zero | R 0,00 |
| Large value | R 1 234 567,89 |
| Small value | R 99,50 |

## Out of Scope / Not For This Story

- Agency filtering and role-based views (covered in Story 2 of this epic)
- Admin vs Broker vs Agent dashboard differences (Story 2)
- Reset Demo button functionality (separate story)
- Payment Management screen (Epic 3)
- Click-on-agency-row chart filtering (Story 2 — BR9 specifies charts update to reflect selected agency, but the agency filter is Story 2 scope)
- Light/dark mode toggle (cosmetic, not a dashboard data story)
