# Test Design: Global Error Handling

## Story Summary

**Epic:** 1
**Story:** 6
**As a** user of the BetterBond application
**I want to** see clear feedback when something goes wrong with an API call
**So that** I understand what happened and can take appropriate action.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- **B1: Automatic login redirect on expired/invalid session** — When the server rejects a request because the user is not authenticated (401), the application automatically sends the user back to the login screen.
- **B2: Error messages from the server are shown to the user** — When a server error (500) occurs and the server includes a message, that message is displayed in a toast notification.
- **B3: Fallback error message when server provides none** — When a server error (500) occurs but the server does not include a specific message, a standard fallback message is shown.
- **B4: Grid data is preserved when a Park/Unpark action fails** — If parking or unparking a payment fails, the payment rows stay exactly where they were. Nothing moves between grids.
- **B5: Park/Unpark error messages are displayed** — When a Park or Unpark action fails and the server includes error messages, those messages are shown to the user.
- **B6: Multiple rapid errors are all visible** — When several errors occur in quick succession, each error notification is displayed without hiding previous ones.
- **B7: Error notifications auto-dismiss** — Toast notifications automatically disappear after a few seconds so they do not clutter the screen permanently.

## Key Decisions Surfaced by AI

- **D1: Toast auto-dismiss duration** — The story says toasts should "automatically dismiss after a few seconds." The existing toast system uses a 5-second default. Is 5 seconds appropriate for error messages, or should errors display longer (e.g., 8-10 seconds) since users may need more time to read error details?
- **D2: Maximum concurrent toast limit** — The existing toast system limits display to 3 toasts at once. When a 4th error arrives, the oldest is removed. Is 3 toasts sufficient, or should error toasts have a higher limit?
- **D3: 401 redirect — clear session first?** — When a 401 is received, should the application clear the local session/token before redirecting to login, or simply redirect (letting the login page handle a fresh session)?

## Test Scenarios / Review Examples

### 1. 401 response redirects user to login

| Setup | Value |
| --- | --- |
| User | Logged in as any role (Admin, Broker, or Agent) |
| Action | Any API call (e.g., fetching dashboard data) |

| Input | Value |
| --- | --- |
| API response status | 401 Unauthorized |

| Expected | Value |
| --- | --- |
| User sees | Login screen (automatic redirect) |
| Current page | No longer visible — user is on the login page |

---

### 2. 500 response with server-provided error message

| Setup | Value |
| --- | --- |
| User | Logged in, viewing any page |
| Action | Any API call |

| Input | Value |
| --- | --- |
| API response status | 500 Internal Server Error |
| Response body Messages | ["Database connection timeout. Please try again."] |

| Expected | Value |
| --- | --- |
| Toast notification shown | Yes |
| Toast type | Error |
| Toast message text | "Database connection timeout. Please try again." |

---

### 3. 500 response with no server message — fallback text

| Setup | Value |
| --- | --- |
| User | Logged in, viewing any page |
| Action | Any API call |

| Input | Value |
| --- | --- |
| API response status | 500 Internal Server Error |
| Response body Messages | Empty array or missing |

| Expected | Value |
| --- | --- |
| Toast notification shown | Yes |
| Toast type | Error |
| Toast message text | "An unexpected error occurred. Please try again." |

---

### 4. Park action fails — grid remains unchanged

| Setup | Value |
| --- | --- |
| User | Admin, viewing Payment Management screen |
| Main Grid | Contains payment row "PAY-001" with status READY |
| Parked Grid | Contains payment row "PAY-002" with status PARKED |

| Input | Value |
| --- | --- |
| Action | User attempts to park payment PAY-001 |
| API response (PUT /v1/payments/park) | 500 error with Messages: ["Payment cannot be parked — insufficient data."] |

| Expected | Value |
| --- | --- |
| Main Grid | Still contains PAY-001 (not moved) |
| Parked Grid | Still contains PAY-002 only (PAY-001 not added) |
| Error toast shown | "Payment cannot be parked — insufficient data." |

---

### 5. Unpark action fails — grid remains unchanged

| Setup | Value |
| --- | --- |
| User | Broker, viewing Payment Management screen |
| Parked Grid | Contains payment row "PAY-003" with status PARKED |
| Main Grid | Contains payment row "PAY-004" with status READY |

| Input | Value |
| --- | --- |
| Action | User attempts to unpark payment PAY-003 |
| API response (PUT /v1/payments/unpark) | 500 error with Messages: ["Unpark failed — record locked by another user."] |

| Expected | Value |
| --- | --- |
| Parked Grid | Still contains PAY-003 (not moved) |
| Main Grid | Still contains PAY-004 only (PAY-003 not added) |
| Error toast shown | "Unpark failed — record locked by another user." |

---

### 6. 500 response with multiple server messages

| Setup | Value |
| --- | --- |
| User | Logged in, performing a Park action |

| Input | Value |
| --- | --- |
| API response status | 500 |
| Response body Messages | ["Validation failed for field A.", "Validation failed for field B."] |

| Expected | Value |
| --- | --- |
| Toast notification(s) | Both messages displayed to user (either in a single toast or as separate toasts) |
| No message lost | User can see both error messages |

> **BA decision required:** When the server returns multiple messages in one error response, should they appear as a single toast with all messages listed, or as separate individual toasts?
>
> Options:
> - Option A: Single toast listing all messages (e.g., bullet-pointed within one notification)
> - Option B: One toast per message (each displayed separately)

---

### 7. Toast automatically dismisses after timeout

| Setup | Value |
| --- | --- |
| User | Viewing any page |
| Error occurs | 500 with message "Temporary error" |

| Input | Value |
| --- | --- |
| Toast appears | Error toast with "Temporary error" |
| Time passes | Auto-dismiss duration elapses (default: 5 seconds) |

| Expected | Value |
| --- | --- |
| Toast | Automatically disappears from screen |
| User action required | None — dismissal is automatic |

## Edge and Alternate Examples

### E1. Multiple rapid errors — all visible without overlap

| Setup | Value |
| --- | --- |
| User | Performing several actions that trigger API calls |

| Input | Value |
| --- | --- |
| Error 1 | 500 with message "Error Alpha" at time T |
| Error 2 | 500 with message "Error Beta" at time T+200ms |
| Error 3 | 500 with message "Error Gamma" at time T+400ms |

| Expected | Value |
| --- | --- |
| Visible toasts | All three error toasts are visible simultaneously |
| Layout | Toasts are stacked so no text is hidden behind another toast |

---

### E2. 500 with non-JSON response body

| Setup | Value |
| --- | --- |
| User | Logged in, performing any action |

| Input | Value |
| --- | --- |
| API response status | 500 |
| Response body | HTML error page (not JSON) |

| Expected | Value |
| --- | --- |
| Toast shown | Yes |
| Toast message | "An unexpected error occurred. Please try again." (fallback) |

---

### E3. Park fails with no messages in error response

| Setup | Value |
| --- | --- |
| User | Admin, attempting to park a payment |

| Input | Value |
| --- | --- |
| API response (PUT /v1/payments/park) | 500 with empty Messages array |

| Expected | Value |
| --- | --- |
| Grid unchanged | Payment stays in Main Grid |
| Toast shown | "An unexpected error occurred. Please try again." (fallback) |

## Out of Scope / Not For This Story

- Actual Park/Unpark UI buttons and grid interactions (Epic 3 — Payment Management)
- PDF download error handling (covered in Epic 4, referencing R39)
- Network connectivity loss or offline behavior
- Retry mechanisms for failed API calls
- 403 Forbidden handling (covered by route guards in Story 4)
- Loading states or skeleton screens during API calls
