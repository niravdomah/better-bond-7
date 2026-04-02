# Test Design: API Client Configuration

## Story Summary

**Epic:** 1
**Story:** 2
**As a** user of the BetterBond application
**I want** all data to load from the live API at localhost:8042 with my credentials attached
**So that** I see real payment data and a loading indicator while it loads.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- The application sends all API requests to the configured base URL (defaulting to `http://localhost:8042`)
- Every API request includes the logged-in user's credentials (Bearer token) automatically
- A loading indicator is visible while any API call is in progress
- The loading indicator disappears once data arrives and the data is displayed
- Typed endpoint functions use the correct HTTP method and path as defined in the API spec
- The base URL can be changed via environment variable
- If the API server is unreachable, an error message is shown instead of an endless spinner

## Key Decisions Surfaced by AI

- The story references a "global loading indicator" (R54). This could be a thin progress bar at the top of the page, a spinner in the header, or an overlay. The exact visual treatment is left open by the spec. For testing purposes, we verify that *some* loading indicator is visible during API calls, not its specific visual form.
- The story says "Bearer token attachment: integrate with the auth session from Story 1." The existing code already imports `getAccessToken` from `auth-client.ts`. The test scenarios verify the integration works end-to-end (token present in requests) rather than testing the auth module itself.
- Error message content for unreachable servers: the exact wording is not specified. Tests will verify an error message appears, not its exact text.

## Test Scenarios / Review Examples

### 1. API calls go to the default base URL

| Setup | Value |
| --- | --- |
| Environment variable NEXT_PUBLIC_API_BASE_URL | Not set (absent) |
| User | Logged in as any role |

| Input | Value |
| --- | --- |
| Action | Application fetches payment data |

| Expected | Value |
| --- | --- |
| Request URL starts with | `http://localhost:8042` |
| Endpoint path | `/v1/payments` (or whichever endpoint the screen uses) |

---

### 2. Bearer token is attached to every API request

| Setup | Value |
| --- | --- |
| User | Logged in (session has a valid token) |

| Input | Value |
| --- | --- |
| Action | Any API call is made |

| Expected | Value |
| --- | --- |
| Authorization header | `Bearer <user's token>` |

---

### 3. Loading indicator appears while data is being fetched

| Setup | Value |
| --- | --- |
| User | Logged in |
| API response | Delayed (still in progress) |

| Input | Value |
| --- | --- |
| Action | Navigate to a page that fetches data |

| Expected | Value |
| --- | --- |
| Loading indicator | Visible on screen |

---

### 4. Loading indicator disappears and data is shown after successful fetch

| Setup | Value |
| --- | --- |
| User | Logged in |
| API response | Returns payment data successfully |

| Input | Value |
| --- | --- |
| Action | Wait for the data fetch to complete |

| Expected | Value |
| --- | --- |
| Loading indicator | No longer visible |
| Payment data | Displayed on screen |

---

### 5. Typed endpoint functions use the correct HTTP methods and paths

| Endpoint Function | HTTP Method | Path |
| --- | --- | --- |
| getPayments | GET | `/v1/payments` |
| getDashboard | GET | `/v1/payments/dashboard` |
| getPaymentBatches | GET | `/v1/payment-batches` |
| parkPayments | PUT | `/v1/payments/park` |
| unparkPayments | PUT | `/v1/payments/unpark` |
| downloadInvoicePdf | POST | `/v1/payment-batches/{Id}/download-invoice-pdf` |
| resetDemo | POST | `/demo/reset-demo` |

| Expected | Value |
| --- | --- |
| Each function | Calls the API client with the method and path shown above |

---

### 6. Successful data display after fetch

| Setup | Value |
| --- | --- |
| User | Logged in as Admin |
| API response for GET /v1/payments | `[{ "Id": 101, "Reference": "PAY-2024-001", "AgencyName": "Cape Realty", "CommissionAmount": 12500.00 }]` |

| Input | Value |
| --- | --- |
| Action | View a page that lists payments |

| Expected | Value |
| --- | --- |
| Screen shows | Payment reference "PAY-2024-001", agency "Cape Realty", amount displayed |

## Edge and Alternate Examples

### 7. Custom base URL via environment variable

| Setup | Value |
| --- | --- |
| NEXT_PUBLIC_API_BASE_URL | `http://staging-api.example.com:9000` |
| User | Logged in |

| Input | Value |
| --- | --- |
| Action | Application makes an API call |

| Expected | Value |
| --- | --- |
| Request URL starts with | `http://staging-api.example.com:9000` |
| Default URL (localhost:8042) | Not used |

---

### 8. API server is unreachable — error shown instead of endless spinner

| Setup | Value |
| --- | --- |
| API server | Down / unreachable |
| User | Logged in |

| Input | Value |
| --- | --- |
| Action | Application attempts to fetch data |

| Expected | Value |
| --- | --- |
| Error message | Visible on screen (e.g., "Unable to connect to the API server") |
| Loading indicator | No longer visible (not spinning forever) |

---

### 9. No Bearer token when user is not authenticated

| Setup | Value |
| --- | --- |
| User | Not logged in (no session / token is null) |

| Input | Value |
| --- | --- |
| Action | An API call is made |

| Expected | Value |
| --- | --- |
| Authorization header | Absent from the request |

## Out of Scope / Not For This Story

- Specific error handling for 401, 403, 404, 500 responses (covered by Story 6: Global Error Handling)
- Authentication flow itself (login, logout, session management) — covered by Story 1
- Role-based UI differences (which data each role sees) — covered by Stories 3 and 4
- Currency formatting of amounts — covered by Story 5
- Retry logic or request queuing — not specified in the FRS
