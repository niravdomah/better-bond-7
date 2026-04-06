# Test Design: Dashboard Agency Filtering and Role-Based Views

## Story Summary

**Epic:** 2
**Story:** 2
**As a** user of the BetterBond Commission Payments system
**I want** the Dashboard to filter charts and metrics when I select an agency, and to automatically show me only my agency's data if I am a Broker
**So that** I can focus on the data most relevant to me without manual setup.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- **B1: Admin default view shows all agencies** — When an Admin opens the Dashboard with no agency selected, all charts and metrics show combined data across all agencies.
- **B2: Admin agency selection filters all components** — When an Admin clicks an agency row in the Agency Summary grid, all six chart and metric components update to show data for only that agency.
- **B3: Admin agency deselection restores all-agency view** — When an Admin clicks the already-selected agency row again (or uses a clear control), charts and metrics return to the combined all-agency view.
- **B4: Broker pre-filtering to own agency** — When a Broker opens the Dashboard, all charts, metrics, and the Agency Summary grid are automatically filtered to show only their own agency's data.
- **B5: Broker cannot view other agencies** — A Broker cannot see or select data for agencies other than their own.
- **B6: URL query parameter reflects selection** — When an agency is selected, the URL updates to include `?agencyId=N`. This enables deep-linking and browser back-navigation.
- **B7: URL-based agency pre-selection** — When a user navigates directly to `/?agencyId=5`, that agency is pre-selected and all components show filtered data.
- **B8: Browser back preserves selection** — When returning to the Dashboard via the browser back button from Payment Management, the previously selected agency is still reflected via the URL parameter.
- **B9: Filtered chart — Payments Ready** — With an agency selected, the "Payments Ready" bar chart shows only that agency's payment counts.
- **B10: Filtered chart — Parked Payments** — With an agency selected, the "Parked Payments" bar chart shows only that agency's parked payment counts.
- **B11: Filtered metrics** — With an agency selected, "Total Value Ready," "Total Value Parked," and "Payments Made (Last 14 Days)" all reflect only that agency's values.
- **B12: Invalid agencyId in URL graceful fallback** — If the URL contains an agencyId that does not match any agency in the data, the user sees the default view (all agencies for Admin, own agency for Broker) rather than an error.
- **B13: Agent read-only Dashboard view** — An Agent sees a read-only Dashboard view without the ability to change agency selection beyond what their role permits.

## Key Decisions Surfaced by AI

- **D1: What is the agency identifier in the URL?** The story says `agencyId=N` but the current "View" button uses `AgencyName` as the identifier (`encodeURIComponent(agency.AgencyName)`). The implementation should be consistent — using AgencyName as the identifier since the dashboard API returns data keyed by AgencyName, not a numeric ID. The URL parameter name `agencyId` is a label; the value is the agency name string.
- **D2: How does an Admin deselect an agency?** AC-3 says "click the selected row again or use a clear/reset control." The simplest approach is toggling selection on row click. Should there also be a visible "Clear filter" button or chip? This is a UX decision — the minimum is toggle-on-row-click.
- **D3: What does a Broker's Agency Summary grid look like?** AC-4 says the grid is "pre-filtered to show only my own agency's data." Does this mean the grid shows only one row (the Broker's agency), or all rows but the data is filtered? Since the grid is an agency list, showing only the Broker's single agency row is most consistent with the filtering intent.
- **D4: Agent dashboard scope — what data does an Agent see?** AC-13 says the Agent sees a "read-only view" and cannot change agency selection "beyond what my role permits." The FRS (R1) does not explicitly say Agents are filtered to their own agency on the Dashboard. The current implementation shows all data. This needs BA clarification, but the safest interpretation is that Agents see the same data as an Admin (all agencies) but in read-only mode (no selection capability).
- **D5: Does the 14-day metric also filter by agency?** AC-11 says "Payments Made (Last 14 Days)" reflects only the selected agency's values. This metric is computed from the payments list, so client-side filtering by agency name should apply to this computation as well.

## Test Scenarios / Review Examples

### 1. Admin sees combined data when no agency is selected (AC-1)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| Dashboard API returns | Data for Agency One, Agency Two, Agency Three |
| URL | `/` (no agencyId parameter) |

| Input | Action |
| --- | --- |
| Page loads | Dashboard renders with no agency pre-selected |

| Expected | Value |
| --- | --- |
| Charts show | Combined data across all agencies |
| Metric cards show | Totals summed across all agencies |
| Agency Summary grid | All agency rows visible, none highlighted as selected |

---

### 2. Admin selects an agency and all components update (AC-2, AC-9, AC-10, AC-11)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| Dashboard shows | Combined all-agency data |
| Agency Summary grid has | Agency One (15 payments), Agency Two (8 payments) |

| Input | Action |
| --- | --- |
| Admin clicks | Agency One row in the Agency Summary grid |

| Expected | Value |
| --- | --- |
| "Payments Ready" chart | Shows only Agency One's ready payment counts |
| "Parked Payments" chart | Shows only Agency One's parked payment counts |
| "Total Value Ready" metric | Shows sum for Agency One only |
| "Total Value Parked" metric | Shows sum for Agency One only |
| "Payments Made (Last 14 Days)" metric | Shows 14-day total for Agency One only |
| Aging Report | Shows aging data for Agency One only |
| URL | Updates to `/?agencyId=Agency%20One` |
| Selected row | Agency One row is visually highlighted |

---

### 3. Admin deselects an agency and view returns to all-agency (AC-3)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| Currently selected | Agency One (URL has `?agencyId=Agency%20One`) |

| Input | Action |
| --- | --- |
| Admin clicks | Agency One row again (toggle off) |

| Expected | Value |
| --- | --- |
| Charts and metrics | Return to combined all-agency view |
| URL | Returns to `/` (agencyId parameter removed) |
| Selected row | No row is highlighted |

---

### 4. Broker sees only own agency data on page load (AC-4, AC-5)

| Setup | Value |
| --- | --- |
| Logged-in user | Broker role, agencyId = "Agency Two" in session |
| Dashboard API returns | Data for Agency One, Agency Two, Agency Three |

| Input | Action |
| --- | --- |
| Page loads | Dashboard renders automatically |

| Expected | Value |
| --- | --- |
| Charts | Filtered to Agency Two data only |
| Metric cards | Reflect Agency Two values only |
| Agency Summary grid | Shows only the Agency Two row |
| Other agency rows | Not visible |
| URL | Reflects `/?agencyId=Agency%20Two` |

---

### 5. Broker cannot view other agencies' data (AC-5)

| Setup | Value |
| --- | --- |
| Logged-in user | Broker role, agencyId = "Agency Two" |
| URL navigated to | `/?agencyId=Agency%20One` (a different agency) |

| Input | Action |
| --- | --- |
| Page loads | With URL pointing to a different agency |

| Expected | Value |
| --- | --- |
| Dashboard shows | Agency Two data only (Broker's own agency) |
| URL | Corrected to `/?agencyId=Agency%20Two` or agencyId ignored |
| No data shown for | Agency One |

---

### 6. URL query parameter pre-selects agency on direct navigation (AC-7)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| URL navigated to | `/?agencyId=Agency%20One` |

| Input | Action |
| --- | --- |
| Page loads | Dashboard reads agencyId from URL |

| Expected | Value |
| --- | --- |
| Charts and metrics | Show Agency One data only |
| Agency Summary grid | Agency One row is highlighted/selected |
| All other agency rows | Visible but not selected |

---

### 7. Browser back button preserves agency selection (AC-8)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| User selected | Agency One on Dashboard (URL: `/?agencyId=Agency%20One`) |
| User then navigated to | `/payments?agencyId=Agency%20One` via View button |

| Input | Action |
| --- | --- |
| User presses | Browser back button |

| Expected | Value |
| --- | --- |
| URL | `/?agencyId=Agency%20One` |
| Dashboard shows | Agency One data (selection preserved) |

---

### 8. Invalid agencyId in URL falls back to default view (AC-12)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| URL navigated to | `/?agencyId=NonExistentAgency` |

| Input | Action |
| --- | --- |
| Page loads | Dashboard attempts to match agencyId |

| Expected | Value |
| --- | --- |
| No error shown | Dashboard displays normally |
| Charts and metrics | Show combined all-agency view (default for Admin) |
| URL | May remain as-is or clear the invalid parameter |

---

### 9. Invalid agencyId for Broker falls back to own agency (AC-12)

| Setup | Value |
| --- | --- |
| Logged-in user | Broker role, agencyId = "Agency Two" |
| URL navigated to | `/?agencyId=NonExistentAgency` |

| Input | Action |
| --- | --- |
| Page loads | Dashboard attempts to match agencyId |

| Expected | Value |
| --- | --- |
| Dashboard shows | Agency Two data (Broker's own agency) |
| No error shown | Graceful fallback |

---

### 10. Agent sees read-only Dashboard (AC-13)

| Setup | Value |
| --- | --- |
| Logged-in user | Agent role |
| Dashboard API returns | Data for multiple agencies |

| Input | Action |
| --- | --- |
| Page loads | Dashboard renders |

| Expected | Value |
| --- | --- |
| Dashboard displays | Charts, metrics, and Agency Summary grid |
| Agency row click | Does not filter data or change selection (read-only) |
| No selection highlight | No row appears selected |

---

### 11. URL updates when agency is selected (AC-6)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| Current URL | `/` (no agencyId) |

| Input | Action |
| --- | --- |
| Admin clicks | Agency Two row in the grid |

| Expected | Value |
| --- | --- |
| URL changes to | `/?agencyId=Agency%20Two` |
| Page does not | Full reload (URL change is client-side) |

## Edge and Alternate Examples

### E1: Agency with no dashboard data returns zero metrics when selected

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| Agency Three | Has 0 payments in PaymentStatusReport, 0 in aging, 0 in PaymentsByAgency |

| Input | Action |
| --- | --- |
| Admin selects | Agency Three |

| Expected | Value |
| --- | --- |
| "Total Value Ready" | R 0,00 |
| "Total Value Parked" | R 0,00 |
| "Payments Made (Last 14 Days)" | R 0,00 |
| Charts | Show empty or zero bars |

---

### E2: Dashboard with only one agency (Broker scenario, single-agency dataset)

| Setup | Value |
| --- | --- |
| Logged-in user | Broker role, agencyId = "Agency One" |
| Dashboard API returns | Data for only Agency One |

| Input | Action |
| --- | --- |
| Page loads | Dashboard renders |

| Expected | Value |
| --- | --- |
| All data shown | Agency One data |
| Grid shows | Single row for Agency One |

---

### E3: Admin selects agency, then selects a different agency

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |
| Currently selected | Agency One |

| Input | Action |
| --- | --- |
| Admin clicks | Agency Two row |

| Expected | Value |
| --- | --- |
| Selection changes to | Agency Two |
| Charts and metrics | Update to Agency Two data |
| URL | Updates to `/?agencyId=Agency%20Two` |
| Previous selection | Agency One row is no longer highlighted |

---

### E4: Rapid agency selection changes (click multiple agencies quickly)

| Setup | Value |
| --- | --- |
| Logged-in user | Admin role |

| Input | Action |
| --- | --- |
| Admin clicks | Agency One, then immediately clicks Agency Two |

| Expected | Value |
| --- | --- |
| Final state | Agency Two is selected, data reflects Agency Two |
| No stale data | Previous selection does not persist |

## Out of Scope

- **Chart internal rendering** — We do not test Recharts SVG internals (bar colors, axis ticks, tooltip positions). We verify that the correct data is passed and the chart component renders.
- **Authentication flow** — Login, logout, and session management are covered in Epic 1. These tests mock the session.
- **API error scenarios for filtering** — The dashboard API fetch itself is tested in Story 1. This story tests client-side filtering of already-fetched data.
- **Payment Management screen behavior** — Navigation to `/payments?agencyId=N` is tested (the click + URL), but what happens on that screen is Epic 3.
- **Dark/light mode** — Theme toggle is visual and does not affect data filtering logic.

## Coverage for WRITE-TESTS (AC to Example Mapping)

| AC | Scenario(s) | Notes |
| --- | --- | --- |
| AC-1 | Scenario 1 | Admin default = all-agency combined data |
| AC-2 | Scenario 2 | Admin clicks agency row, all components update |
| AC-3 | Scenario 3 | Admin deselects via toggle click |
| AC-4 | Scenario 4 | Broker auto-filtered to own agency on load |
| AC-5 | Scenarios 4, 5 | Broker cannot view other agencies |
| AC-6 | Scenario 11 | URL updates with agencyId on selection |
| AC-7 | Scenario 6 | Direct navigation with agencyId pre-selects |
| AC-8 | Scenario 7 | Browser back preserves selection |
| AC-9 | Scenario 2 | Payments Ready chart filtered by agency |
| AC-10 | Scenario 2 | Parked Payments chart filtered by agency |
| AC-11 | Scenario 2 | Metric cards filtered by agency |
| AC-12 | Scenarios 8, 9 | Invalid agencyId graceful fallback (Admin + Broker) |
| AC-13 | Scenario 10 | Agent read-only view |

## Handoff Notes for WRITE-TESTS

1. **Mock patterns:** Follow the same patterns as the Story 1 test file (`epic-2-story-1-dashboard-charts-metrics-grid.test.tsx`). Mock `next-auth/react`, `next/navigation`, `recharts`, and `@/lib/api/endpoints`.

2. **Session mocking per role:** Use `vi.mock('next-auth/react')` with different `useSession` return values for Admin, Broker, and Agent scenarios. Broker sessions must include `agencyId` in `session.user`.

3. **URL parameter testing:** Mock `useSearchParams` to return different query parameter values. For AC-6 and AC-8, verify that `router.push` or `router.replace` is called with the correct URL including the `agencyId` parameter.

4. **Filtering is client-side:** The dashboard fetches all data, then filters in-browser by `AgencyName`. Tests should provide multi-agency mock data and verify that only the selected agency's data appears in the rendered output.

5. **Agency selection state:** The component needs to manage a `selectedAgency` state. When an agency row is clicked, it sets this state. When clicked again, it clears it. For Brokers, the state is initialized from the session's `agencyId`.

6. **Data filtering functions:** The existing `compute*` functions in `page.tsx` currently process all data. They will need to accept an optional agency filter parameter, or the data should be pre-filtered before passing to these functions.

7. **Test data factory:** Extend the existing `createDashboardResponse` factory to include multi-agency data with distinct values per agency, so tests can verify that filtering produces the correct subset.

8. **Visual selection indicator:** Tests should verify that a selected agency row has some visual distinction (e.g., an aria attribute, a specific CSS class surfaced via role, or visible "Selected" text). Use accessibility-first queries.

9. **FRS-over-template reminder:** The FRS and story acceptance criteria are the source of truth. The current `page.tsx` has no filtering logic — it all needs to be added. Do not assume the existing code is correct for this story's requirements.
