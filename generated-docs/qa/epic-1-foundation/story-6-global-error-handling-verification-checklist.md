# Manual Verification Checklist: Story 6 — Global Error Handling

**Epic:** 1 (Foundation) | **Story:** 6 of 6 | **Route:** N/A (infrastructure)

## Note

Story 6 is an infrastructure/cross-cutting story with no dedicated route. It modifies the API client error handling pipeline and the toast notification system. The behavior it implements (error toasts, 401 redirects) will be exercised when the screens that consume API endpoints are built in Epics 2-4.

## Automated Test Coverage (13 tests, all passing)

- AC-1: 401 response triggers redirect to login screen
- AC-2: 500 response with server message displays that message in a toast
- AC-2: 500 response with multiple server messages displays all messages
- AC-3: 500 response with empty Messages array shows fallback text
- AC-3: 500 response with non-JSON body shows fallback text
- AC-4: parkPayments rejects (throws) on 500 — no success data returned
- AC-4: unparkPayments rejects on 500 — no success data returned
- AC-4: Failed park never resolves — callers cannot accidentally update state
- AC-5: Failed park action displays the server error message via toast
- AC-5: Failed unpark action displays the server error message via toast
- AC-5: Failed park with no server messages shows fallback toast
- AC-6: Three rapid errors produce three visible stacked toasts
- AC-7: Error toast auto-dismisses after the timeout duration

## Manual Verification

This story has no browser route to verify manually. All acceptance criteria are covered by automated integration tests. Manual verification will occur naturally when Epics 2-4 build the screens that call these API endpoints.
