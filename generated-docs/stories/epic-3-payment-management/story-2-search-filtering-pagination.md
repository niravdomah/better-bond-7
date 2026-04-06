# Story: Client-Side Search Filtering and Pagination

**Epic:** Payment Management (Screen 2) | **Story:** 2 of 4 | **Wireframe:** generated-docs/specs/wireframes/screen-2-payment-management.md

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/payments` |
| **Target File** | `app/payments/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond Commission Payments system **I want** to search and filter payments across both grids and navigate through pages of results **So that** I can quickly find specific payments without waiting for API calls and manage large lists of payments efficiently.

## Acceptance Criteria

### Happy Path — Search Filtering
- [ ] AC-1: Given I am on the Payment Management page with payments loaded, when I type in the search bar, then both the Main Grid and Parked Grid are filtered client-side to show only rows matching my search text — no API call is made.
- [ ] AC-2: Given I am on the Payment Management page, when I type a date value in the search bar (e.g., "15/03"), then both grids filter to show only payments whose Claim Date contains the search text.
- [ ] AC-3: Given I am on the Payment Management page, when I type an agency name in the search bar (e.g., "Agency One"), then both grids filter to show only payments whose Agency Name contains the search text (case-insensitive).
- [ ] AC-4: Given I am on the Payment Management page, when I type a status value in the search bar (e.g., "READY"), then both grids filter to show only payments whose Status contains the search text (case-insensitive).
- [ ] AC-5: Given I am on the Payment Management page, when I clear the search bar, then both grids return to showing all payments (unfiltered).

### Happy Path — Pagination
- [ ] AC-6: Given I am on the Payment Management page with more payments than fit on one page, when I view the Main Grid, then I see pagination controls (Previous and Next buttons) with the current page indicator (e.g., "Page 1 of 3").
- [ ] AC-7: Given I am on the Payment Management page, when I click the Next button on the Main Grid pagination, then the grid advances to the next page of results.
- [ ] AC-8: Given I am on the Payment Management page, when I am on page 1 of the Main Grid, then the Previous button is disabled.
- [ ] AC-9: Given I am on the Payment Management page, when I am on the last page of the Main Grid, then the Next button is disabled.
- [ ] AC-10: Given I am on the Payment Management page, when the Parked Grid has more payments than fit on one page, then the Parked Grid also has its own pagination controls that work independently of the Main Grid.

### Happy Path — URL Parameter Preservation
- [ ] AC-11: Given I navigate to `/payments?agencyId=N`, when I use search or pagination, then the `agencyId` parameter remains in the URL for deep-linking and back-navigation.

### Edge Cases
- [ ] AC-12: Given I am on the Payment Management page, when I type a search term that matches no payments, then both grids show an empty state message (e.g., "No payments match your search").
- [ ] AC-13: Given I am on the Payment Management page with search applied, when I use pagination, then the pagination reflects the filtered results (not all results).

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| — | — | No API calls — all filtering and pagination are client-side |

## Implementation Notes
- Search filtering is purely client-side — no API call on keypress. Filter the already-loaded payments array.
- Search matches against Claim Date, Agency Name, and Status fields as specified in the FRS.
- Pagination is also client-side, splitting the (possibly filtered) payments into pages.
- Each grid (Main and Parked) has independent pagination state.
- The `agencyId` URL search parameter must be preserved during all interactions for deep-linking and browser back-navigation.
- FRS references: R20, R21, R42, BR10, R36.
