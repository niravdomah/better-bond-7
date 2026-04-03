# Story: Dashboard Agency Filtering and Role-Based Views

**Epic:** Dashboard (Screen 1) | **Story:** 2 of 2 | **Wireframe:** generated-docs/specs/wireframes/screen-1-dashboard.md

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond Commission Payments system **I want** the Dashboard to filter charts and metrics when I select an agency, and to automatically show me only my agency's data if I am a Broker **So that** I can focus on the data most relevant to me without manual setup.

## Acceptance Criteria

### Happy Path — Admin Agency Selection
- [ ] AC-1: Given I am logged in as an Admin and I am on the home page (Dashboard), when no agency is selected, then all charts and metrics show combined data across all agencies.
- [ ] AC-2: Given I am logged in as an Admin and I am on the home page (Dashboard), when I click on an agency row in the Agency Summary grid, then all six chart and metric components update to show data for only that selected agency.
- [ ] AC-3: Given I am logged in as an Admin and I have selected an agency on the home page (Dashboard), when I deselect the agency (click the selected row again or use a clear/reset control), then charts and metrics return to the combined all-agency view.

### Happy Path — Broker Pre-Filtering
- [ ] AC-4: Given I am logged in as a Broker, when I open the home page (Dashboard), then all charts, metrics, and the Agency Summary grid are pre-filtered to show only my own agency's data.
- [ ] AC-5: Given I am logged in as a Broker, when I am on the home page (Dashboard), then I cannot view metrics or data for agencies other than my own.

### Happy Path — URL Query Parameter
- [ ] AC-6: Given I am on the home page (Dashboard), when I select an agency, then the URL updates to include the agencyId query parameter (e.g., /?agencyId=N).
- [ ] AC-7: Given I navigate directly to the home page with an agencyId in the URL (e.g., /?agencyId=5), when the page loads, then that agency is pre-selected and all charts and metrics show data for that agency.
- [ ] AC-8: Given I am on the Payment Management screen (Screen 2) and I press the browser back button, when I return to the home page (Dashboard), then the previously selected agency is still reflected via the URL parameter.

### Happy Path — Chart Updates on Selection
- [ ] AC-9: Given I am on the home page (Dashboard) with an agency selected, when I look at the "Payments Ready" bar chart, then it shows only that agency's payment counts.
- [ ] AC-10: Given I am on the home page (Dashboard) with an agency selected, when I look at the "Parked Payments" bar chart, then it shows only that agency's parked payment counts.
- [ ] AC-11: Given I am on the home page (Dashboard) with an agency selected, when I look at the metric cards, then "Total Value Ready," "Total Value Parked," and "Payments Made (Last 14 Days)" all reflect only that agency's values.

### Edge Cases
- [ ] AC-12: Given I am on the home page (Dashboard) with an agencyId in the URL that does not match any agency in the data, when the page loads, then I see the default all-agency view (for Admin) or my own agency view (for Broker) rather than an error.
- [ ] AC-13: Given I am logged in as an Agent, when I open the home page (Dashboard), then I see a read-only view of the Dashboard (no agency selection changes the data beyond what my role permits).

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments/dashboard` | Fetch dashboard metrics (filtered client-side by selected agency) |
| GET | `/v1/payments` | Fetch all payments (filtered client-side for 14-day metric by agency) |

## Implementation Notes
- Agency filtering is performed client-side: the full dataset is fetched, then filtered in the browser based on AgencyName matching the selected agency.
- The URL query parameter `agencyId` enables deep-linking and browser back-navigation (BR10). Use Next.js `useSearchParams` to read and `useRouter` to update.
- For Broker users, the agency is determined from the user's session data (set during authentication in Epic 1). The Broker's agencyId should be applied automatically on page load.
- The "View" button navigation from Story 1 (AC-10) navigates to `/payments?agencyId=N`. When the user presses back, the Dashboard should restore the agency selection from the URL.
- Admin sees all agencies by default. Clicking a row selects it; clicking again (or a clear action) deselects.
- Agent role has read-only Dashboard access per R1 — they see data but cannot change agency selection beyond their permitted scope.
- FRS references: R1, R14, R15, R16, BR9, BR10.
