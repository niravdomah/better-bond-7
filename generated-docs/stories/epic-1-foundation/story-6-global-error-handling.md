# Story: Global Error Handling

**Epic:** Foundation — Auth, Layout, and API Client | **Story:** 6 of 6 | **Wireframe:** N/A

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (cross-cutting, visible on all pages) |
| **Target File** | `lib/api/client.ts`, `components/toast/` |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond application **I want** clear feedback when something goes wrong with an API call **So that** I understand what happened and can take appropriate action.

## Acceptance Criteria

### Happy Path — 401 Handling
- [ ] AC-1: Given I am using the application, when any API call returns a 401 Unauthorized response, then I am automatically redirected to the login screen.

### Happy Path — 500 Handling
- [ ] AC-2: Given I am using the application, when an API call returns a 500 error with a message in the response, then I see a toast notification showing that error message.
- [ ] AC-3: Given I am using the application, when an API call returns a 500 error with no message in the response, then I see a toast notification with the fallback text "An unexpected error occurred. Please try again."

### Happy Path — Mutation Protection
- [ ] AC-4: Given I am viewing payment data in a grid, when a Park or Unpark action fails, then the grid remains unchanged — no rows move between grids and no data is lost.
- [ ] AC-5: Given a Park or Unpark action fails, when the error response contains messages, then I see those error messages displayed clearly (via toast or inline alert).

### Edge Cases
- [ ] AC-6: Given multiple API calls fail in quick succession, when error toasts are shown, then each error is displayed and the toasts do not overlap in a way that hides information.
- [ ] AC-7: Given an error toast is displayed, when a few seconds pass, then the toast automatically dismisses (it does not remain on screen indefinitely).

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/v1/payments/park` | Park payments — error display on 500 (R38) |
| PUT | `/v1/payments/unpark` | Unpark payments — error display on 500 (R38) |
| All | All endpoints | 401 redirect (R40), generic 500 handling (R41) |

## Implementation Notes
- The API client (`lib/api/client.ts`) already has basic error handling structure. Extend it with: (1) 401 → redirect to login (R40), (2) 500 → extract `DefaultResponse.Messages` and display via toast (R41), (3) fallback message when no server message is available.
- The `DefaultResponse` type from the OpenAPI spec has a `Messages` array. Parse this on error responses.
- Toast component: use Shadcn UI's toast system. The template may already have toast infrastructure in `components/toast/`.
- Grid protection (R38): when a Park or Unpark mutation fails, the calling code must not update grid state. This is an error-handling contract — the actual Park/Unpark UI is in Epic 3, but the error handling pattern is established here.
- The 401 redirect should use NextAuth's `signOut` or router redirect to the login page, clearing the session.
