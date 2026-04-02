# Story: API Client Configuration

**Epic:** Foundation — Auth, Layout, and API Client | **Story:** 2 of 6 | **Wireframe:** N/A

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (infrastructure, visible on all pages) |
| **Target File** | `lib/api/client.ts`, `lib/utils/constants.ts`, `lib/api/endpoints.ts` |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond application **I want** all data to load from the live API at localhost:8042 with my credentials attached **So that** I see real payment data and a loading indicator while it loads.

## Acceptance Criteria

### Happy Path
- [x] AC-1: Given I am logged in, when the application makes any API call, then the request is sent to the base URL configured via the NEXT_PUBLIC_API_BASE_URL environment variable (defaulting to http://localhost:8042).
- [x] AC-2: Given I am logged in, when any API call is in progress, then I see a loading indicator on the screen.
- [x] AC-3: Given a data fetch completes successfully, when the response arrives, then the loading indicator disappears and the data is displayed.
- [x] AC-4: Given the typed endpoint functions exist (e.g., getPayments, getDashboard), when I use any screen that calls the API, then the correct endpoint and HTTP method are used as defined in the OpenAPI spec.

### Edge Cases
- [x] AC-5: Given the environment variable NEXT_PUBLIC_API_BASE_URL is set to a custom value, when the application makes API calls, then those calls go to the custom URL instead of the default.

### Error Handling
- [x] AC-6: Given the API server is unreachable, when a request times out or fails to connect, then I see an error message rather than an endlessly spinning loader.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/payments` | Fetch all payments |
| GET | `/v1/payments/dashboard` | Fetch dashboard data |
| GET | `/v1/payment-batches` | Fetch payment batches |
| PUT | `/v1/payments/park` | Park payments |
| PUT | `/v1/payments/unpark` | Unpark payments |
| POST | `/v1/payment-batches/{Id}/download-invoice-pdf` | Download invoice PDF |
| POST | `/demo/reset-demo` | Reset demo data |

## Implementation Notes
- The API client (`lib/api/client.ts`) already exists with a fetch wrapper. Configure it to read the base URL from `NEXT_PUBLIC_API_BASE_URL` and default to `http://localhost:8042`.
- Bearer token attachment: integrate with the auth session from Story 1 so every request includes the `Authorization: Bearer <token>` header.
- The typed endpoint functions in `lib/api/endpoints.ts` are already generated from the OpenAPI spec. Verify they use the configured client and update if needed.
- The global loading indicator (R54) should be visible whenever any API call is in flight. Consider a thin progress bar at the top of the page or a spinner in the header.
- Use the existing `apiClient` function as the base — do not create a parallel fetch mechanism.
