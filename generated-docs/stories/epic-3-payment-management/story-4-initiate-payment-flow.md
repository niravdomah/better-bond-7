# Story: Initiate Payment Flow with Confirmation and Success Modals

**Epic:** Payment Management (Screen 2) | **Story:** 4 of 4 | **Wireframe:** generated-docs/specs/wireframes/screen-2-payment-management.md

**Role:** All Roles (with restrictions for Agent)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/payments` |
| **Target File** | `app/payments/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** Broker or Admin user **I want** to initiate payment processing for all visible payments in the Main Grid with a confirmation step and receive a success notification **So that** I can batch-process commission payments and know that an invoice will be available on the Payments Made screen.

## Acceptance Criteria

### Happy Path — Initiate Payment Button
- [ ] AC-1: Given I am on the Payment Management page as a Broker or Admin, when I see payments in the Main Grid, then I see an "Initiate Payment" button.
- [ ] AC-2: Given I click the "Initiate Payment" button, when the confirmation modal opens, then I see the number of visible (filtered) Main Grid payments and their total Commission Amount formatted in ZAR.
- [ ] AC-3: Given I see the Initiate Payment confirmation modal, when I click "Confirm Payment", then all visible Main Grid payments transition to PROCESSED status and are removed from the Main Grid.
- [ ] AC-4: Given the payments have been successfully processed, when the success modal appears, then I see a message informing me that the payments have been processed and an invoice is available on the Payments Made screen.
- [ ] AC-5: Given I see the success modal, when I click "OK", then the modal closes and the Main Grid reflects the updated state (processed payments removed).

### Happy Path — Filtered Payments
- [ ] AC-6: Given I have a search filter active on the Payment Management page, when I click "Initiate Payment", then only the visible (filtered) Main Grid payments are included in the confirmation count and total — not all payments.

### Disabled State
- [ ] AC-7: Given I am on the Payment Management page, when the Main Grid has zero visible rows (either no data or all filtered out), then the "Initiate Payment" button is disabled.

### Role-Based Restrictions
- [ ] AC-8: Given I am on the Payment Management page as an Agent user, then the "Initiate Payment" button is disabled (or not visible) and I cannot initiate payments.

### Banking Details Visibility
- [ ] AC-9: Given I am on the Payment Management page as a Broker or Admin, when I view payment details, then I can see banking details (bank account number, branch code) in the grid.
- [ ] AC-10: Given I am on the Payment Management page as an Agent user, when I view payment details, then banking details (bank account number, branch code) are hidden from view.

### Edge Cases
- [ ] AC-11: Given I initiate payment for visible payments, when the processing completes, then the payments are only removed from the UI (this is a demo action — no POST to the payment batches API endpoint is made).

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| — | — | No API call — Initiate Payment is a demo action that transitions payment state in the UI only |

## Implementation Notes
- Initiate Payment is a **demo action**: it transitions visible Main Grid payments to PROCESSED status in the local state and removes them from the grid. No `POST /v1/payment-batches` call is made.
- The confirmation modal shows the count and total Commission Amount of the currently visible (filtered) Main Grid payments.
- The success modal references the Payments Made screen for the invoice.
- Banking details (bank account number, branch code) are visible only to Broker and Admin roles — use role-based access from Epic 1 (Story 1).
- Agent users cannot initiate payments — the button is disabled based on role.
- The "Initiate Payment" button is disabled when the Main Grid has zero visible rows.
- FRS references: R28, R29, R30, BR3, BR4, BR12, BR15, R2, R5.
