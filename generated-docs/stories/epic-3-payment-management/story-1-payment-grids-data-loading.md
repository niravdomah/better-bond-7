# Story: Payment Grids with Data Loading and Computed Fields

**Epic:** Payment Management (Screen 2) | **Story:** 1 of 4 | **Wireframe:** generated-docs/specs/wireframes/screen-2-payment-management.md

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/payments` |
| **Target File** | `app/payments/page.tsx` |
| **Page Action** | `create_new` |

## User Story
**As a** user of the BetterBond Commission Payments system **I want** to see all payments for a selected agency displayed in two grids (Main and Parked) with all relevant columns and computed fields **So that** I can review the current state of commission payments and identify which are ready for processing versus parked.

## Acceptance Criteria

### Happy Path — Page and Data Loading
- [ ] AC-1: Given I navigate to `/payments?agencyId=N`, when the page loads and data is fetched from the API, then I see a "Payment Management" heading with the agency name displayed.
- [ ] AC-2: Given I am on the Payment Management page, when data loads successfully, then I see a Main Grid showing all payments where the status is not PROCESSED (including READY, PENDING, and other non-processed statuses but excluding PARKED).
- [ ] AC-3: Given I am on the Payment Management page, when data loads successfully, then I see a Parked Grid below the Main Grid showing all payments where the status is PARKED.

### Happy Path — Main Grid Columns
- [ ] AC-4: Given I am on the Payment Management page, when the Main Grid displays payments, then I see the following columns: Agency Name, Batch ID, Claim Date, Agent Name and Surname, Bond Amount, Commission Type, Commission % (computed), Grant Date, Reg Date, Bank, Commission Amount, VAT, and Status.
- [ ] AC-5: Given I am on the Payment Management page, when a payment row shows in the Main Grid, then the Commission % column displays a value computed as Commission Amount divided by Bond Amount (e.g., if Commission Amount is R 30 000 and Bond Amount is R 1 200 000, Commission % shows 2,5%).

### Happy Path — Parked Grid Columns
- [ ] AC-6: Given I am on the Payment Management page, when the Parked Grid displays payments, then I see the same columns as the Main Grid: Agency Name, Batch ID, Claim Date, Agent Name and Surname, Bond Amount, Commission Type, Commission %, Grant Date, Reg Date, Bank, Commission Amount, VAT, and Status.

### Happy Path — Currency Formatting
- [ ] AC-7: Given I am on the Payment Management page, when payment data is displayed in either grid, then all currency values (Bond Amount, Commission Amount, VAT) use South African ZAR formatting with space as thousands separator and comma as decimal separator (e.g., R 1 234 567,89).

### Loading and Error States
- [ ] AC-8: Given I navigate to `/payments?agencyId=N`, when the payment data is being fetched from the API, then I see loading indicators in place of the grids.
- [ ] AC-9: Given I am on the Payment Management page, when the payments API call fails, then I see an error message explaining that payment data could not be loaded.

### Edge Cases
- [ ] AC-10: Given I am on the Payment Management page, when the API returns no payments for the selected agency, then I see an empty state message indicating there are no payments to display.
- [ ] AC-11: Given I am on the Payment Management page, when the API returns payments but none are parked, then the Parked Grid shows an empty state message while the Main Grid displays normally.
- [ ] AC-12: Given I am on the Payment Management page, when a payment has a Bond Amount of zero, then the Commission % column displays a dash or zero rather than causing a division error.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments` | Fetch all payments (filtered client-side by agencyId URL parameter) |

## Implementation Notes
- The page reads `agencyId` from the URL search parameters to filter payments for that agency.
- Commission % is a frontend-computed field: `CommissionAmount / BondAmount * 100`.
- Use existing ZAR formatting utilities from Epic 1 (Story 5) for all currency values.
- Use existing API client from Epic 1 (Story 2) for all fetch calls.
- Use existing loading/error patterns from Epic 1 (Story 6) for error handling.
- The Main Grid shows payments where Status is NOT PROCESSED and NOT PARKED. The Parked Grid shows payments where Status IS PARKED.
- FRS references: R17, R18, R19, BR1, BR2, BR7, R45, R46.
