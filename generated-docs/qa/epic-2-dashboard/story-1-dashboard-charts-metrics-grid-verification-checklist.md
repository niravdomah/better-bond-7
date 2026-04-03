# Manual Verification Checklist — Dashboard Charts, Metrics, and Agency Summary Grid

**Epic:** 2 (Dashboard) | **Story:** 1 | **Route:** http://localhost:3000

## Pre-requisites
- The dev server is running (`npm run dev` from `web/`)
- The backend API is running at `http://localhost:8042`

## Checks

### Charts
- [ ] **Payments Ready for Payment chart** — You see a bar chart titled "Payments Ready for Payment" with bars grouped by commission type (Bond Comm and Manual Payments).
- [ ] **Parked Payments chart** — You see a bar chart titled "Parked Payments" with bars grouped by commission type (Bond Comm and Manual Payments).
- [ ] **Parked Payments Aging Report** — You see a chart titled "Parked Payments Aging Report" showing aging ranges: 1-3 days, 4-7 days, and more than 7 days.

### Metric Cards
- [ ] **Total Value Ready for Payment** — You see a card titled "Total Value Ready for Payment" displaying a Rand amount (e.g., R 1 234 567,89) with space as thousands separator and comma as decimal.
- [ ] **Total Value of Parked Payments** — You see a card titled "Total Value of Parked Payments" displaying a Rand amount in the same format.
- [ ] **Payments Made (Last 14 Days)** — You see a card titled "Payments Made (Last 14 Days)" displaying a Rand amount. This value is calculated from recent processed payments.

### Agency Summary Grid
- [ ] **Grid displays** — Below the charts and metrics, you see an "Agency Summary" table with columns: Agency Name, Number of Payments, Total Commission Amount, VAT, and Actions.
- [ ] **All agencies shown** — Every agency from the API appears in the grid, including agencies with zero payments.
- [ ] **Currency formatting** — All Rand amounts in the grid use the format R X XXX XXX,XX (space separators, comma decimal).
- [ ] **View buttons** — Each agency row has a "View" button.
- [ ] **View navigation** — Clicking a "View" button takes you to a URL like /payments?agencyId=... (the page may not exist yet, but the URL should change).

### Loading and Error States
- [ ] **Loading indicators** — When the page first loads (or if you throttle the network), you briefly see placeholder loading indicators (grey pulsing rectangles) instead of charts and data.
- [ ] **Dashboard error** — If the API is unreachable (stop the backend), refreshing the page shows an error message saying data could not be loaded.
- [ ] **Partial error** — If only the payments endpoint fails (but the dashboard endpoint works), the 14-day metric shows its own error message while the rest of the dashboard still displays.

### Empty State
- [ ] **No data message** — If the API returns no agencies and no payments, you see a message like "No data available" instead of blank charts and an empty grid.
