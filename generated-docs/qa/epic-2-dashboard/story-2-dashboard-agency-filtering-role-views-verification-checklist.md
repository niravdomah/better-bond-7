# Manual Verification Checklist: Dashboard Agency Filtering & Role-Based Views

**Route:** `/` (Dashboard home page)

## Prerequisites
- Dev server running (`npm run dev` in `/web`)
- Backend API running at `localhost:8042`

## Admin Role Verification

- [ ] Open the Dashboard as an Admin user. All charts and metrics show combined data across all agencies. The Agency Summary grid shows all agency rows with none highlighted.
- [ ] Click on an agency row in the Agency Summary grid. All charts update to show only that agency's data. The metric cards reflect only that agency's totals. The clicked row is visually highlighted.
- [ ] Check the browser URL bar — it should now include `?agencyId=AgencyName`.
- [ ] Click the same agency row again to deselect it. Charts and metrics return to the combined all-agency view. The URL returns to `/` without the agencyId parameter. No row is highlighted.
- [ ] Click one agency, then click a different agency. The selection switches to the new agency. The previous agency is no longer highlighted. Metrics update to the newly selected agency.
- [ ] Navigate directly to `/?agencyId=Agency%20One` (or a valid agency name). The page loads with that agency pre-selected and filtered data shown.
- [ ] Navigate to `/?agencyId=NonExistentAgency`. The page loads normally showing the combined all-agency view (no error).

## Broker Role Verification

- [ ] Open the Dashboard as a Broker user. Charts and metrics are automatically filtered to show only the Broker's own agency. The Agency Summary grid shows only one row (the Broker's agency).
- [ ] Try navigating to `/?agencyId=SomeOtherAgency`. The page should ignore the URL parameter and show only the Broker's own agency data.

## Agent Role Verification

- [ ] Open the Dashboard as an Agent user. All agency data is visible (same view as Admin default). Clicking an agency row does nothing — no selection, no filtering, no URL change.

## Browser Navigation

- [ ] As Admin, select an agency. Click the "View" button to navigate to Payment Management. Press the browser back button. The Dashboard should restore the previously selected agency from the URL.
