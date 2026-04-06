# Story: Park and Unpark with Confirmation Modals

**Epic:** Payment Management (Screen 2) | **Story:** 3 of 4 | **Wireframe:** generated-docs/specs/wireframes/screen-2-payment-management.md

**Role:** All Roles (with restrictions for Agent)

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | `/payments` |
| **Target File** | `app/payments/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story
**As a** Broker or Admin user **I want** to park and unpark individual or multiple payments with a confirmation step **So that** I can manage which payments are held aside and which are ready for processing, with confidence that I won't accidentally change payment states.

## Acceptance Criteria

### Happy Path — Single Park
- [ ] AC-1: Given I am on the Payment Management page as a Broker or Admin, when I see a payment row in the Main Grid, then I see a Park button on that row.
- [ ] AC-2: Given I click the Park button on a Main Grid row, when the confirmation modal opens, then I see the Agent Name, Claim Date, and Commission Amount for that payment.
- [ ] AC-3: Given I see the Park confirmation modal, when I click "Confirm Park", then the payment is parked via the API and moves from the Main Grid to the Parked Grid without a full page reload.
- [ ] AC-4: Given I see the Park confirmation modal, when I click "Cancel", then the modal closes and no changes are made.

### Happy Path — Single Unpark
- [ ] AC-5: Given I am on the Payment Management page as a Broker or Admin, when I see a payment row in the Parked Grid, then I see an Unpark button on that row.
- [ ] AC-6: Given I click the Unpark button on a Parked Grid row, when the confirmation modal opens, then I see the Agent Name, Claim Date, and Commission Amount for that payment.
- [ ] AC-7: Given I see the Unpark confirmation modal, when I click "Confirm Unpark", then the payment is unparked via the API and moves from the Parked Grid back to the Main Grid without a full page reload.

### Happy Path — Multi-Select and Bulk Park
- [ ] AC-8: Given I am on the Payment Management page, when I look at the Main Grid, then each row has a checkbox for selection.
- [ ] AC-9: Given I have selected multiple checkboxes in the Main Grid, when I click the "Park Selected" button, then a bulk confirmation modal opens showing the number of selected payments and their total Commission Amount.
- [ ] AC-10: Given I see the bulk Park confirmation modal, when I click "Confirm Park", then all selected payments are parked via the API and move from the Main Grid to the Parked Grid.

### Happy Path — Multi-Select and Bulk Unpark
- [ ] AC-11: Given I am on the Payment Management page, when I look at the Parked Grid, then each row has a checkbox for selection.
- [ ] AC-12: Given I have selected multiple checkboxes in the Parked Grid, when I click the "Unpark Selected" button, then a bulk confirmation modal opens showing the number of selected payments and their total Commission Amount.
- [ ] AC-13: Given I see the bulk Unpark confirmation modal, when I click "Confirm Unpark", then all selected payments are unparked via the API and move from the Parked Grid back to the Main Grid.

### Role-Based Restrictions
- [ ] AC-14: Given I am on the Payment Management page as an Agent user, when I view the Main Grid, then the Park buttons are disabled (or not visible) and I cannot park payments.
- [ ] AC-15: Given I am on the Payment Management page as an Agent user, when I view the Parked Grid, then the Unpark buttons are disabled (or not visible) and I cannot unpark payments.

### Error Handling
- [ ] AC-16: Given I confirm a Park action and the API returns an error (e.g., 500), then I see the error message from the API response and the grids are not modified (the payment stays in its original grid).
- [ ] AC-17: Given I confirm an Unpark action and the API returns an error, then I see the error message from the API response and the grids are not modified.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/v1/payments/park` | Park one or more payments |
| PUT | `/v1/payments/unpark` | Unpark one or more payments |

## Implementation Notes
- Park calls `PUT /v1/payments/park` and Unpark calls `PUT /v1/payments/unpark`.
- After a successful park/unpark, update the local payment state to move the payment between grids without re-fetching from the API.
- On API error (500), display the error message from the response body; do not modify the grid state.
- Bulk operations use the same API endpoints, sending multiple payment IDs.
- Agent users have park/unpark buttons disabled — use role-based access from Epic 1 (Story 1) to determine the current user's role.
- Checkboxes are cleared after a successful bulk operation.
- FRS references: R22, R23, R24, R25, R26, R27, BR5, BR6, BR11, BR13, BR14, R2, R38.
