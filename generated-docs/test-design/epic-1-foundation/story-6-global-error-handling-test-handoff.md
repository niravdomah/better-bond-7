# Test Handoff: Global Error Handling

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-6-global-error-handling-test-design.md](./story-6-global-error-handling-test-design.md)
**Epic:** 1 | **Story:** 6

## Coverage for WRITE-TESTS

- AC-1: 401 response redirects to login → Example 1
- AC-2: 500 with server message shows toast with that message → Example 2, Example 6
- AC-3: 500 with no server message shows fallback toast → Example 3, Edge Example E2, Edge Example E3
- AC-4: Park/Unpark failure leaves grid unchanged → Example 4, Example 5
- AC-5: Park/Unpark failure shows error messages → Example 4, Example 5, Edge Example E3
- AC-6: Multiple rapid errors all visible without overlap → Edge Example E1
- AC-7: Toast auto-dismisses after timeout → Example 7

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: component-level (API client error handling, toast display, error hook/utility)
- Suggested primary assertions:
  - API client 401 handler triggers redirect/signOut call
  - API client 500 handler extracts `DefaultResponse.Messages` and calls toast
  - API client 500 handler uses fallback message when `Messages` is empty or response is non-JSON
  - Error handler for Park/Unpark does not update grid state on failure
  - Toast container renders multiple toasts simultaneously without hiding content
  - Toast auto-dismisses after configured duration
- Important ambiguity flags:
  - Multiple server messages in one response: single combined toast vs. multiple separate toasts (BA decision D1 in test-design)
  - Auto-dismiss duration: 5 seconds vs. longer for errors (BA decision D1 in test-design)
  - Maximum concurrent toasts: current limit is 3 (BA decision D2 in test-design)
- Mock strategy:
  - Mock `fetch` to return configured error responses (401, 500 with/without Messages)
  - Mock `next-auth` signOut / router redirect for 401 testing
  - Use `ToastProvider` wrapper in test render for toast assertion
  - Use `vi.useFakeTimers()` for toast auto-dismiss timing tests
- The API client (`lib/api/client.ts`) already has `handleErrorResponse` with status-specific logic. Tests should verify the integration between this handler and the toast notification system.
- The existing `ToastContext` and `useToast` hook provide `showToast` and toast state. Tests should verify that error handlers invoke `showToast` with correct variant and message.
- Grid protection (AC-4/AC-5): Since the actual Park/Unpark UI is in Epic 3, test the error-handling contract — i.e., that when the API client throws on a 500, the calling pattern does not proceed with state updates. This can be tested as a utility/hook pattern.

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. 401 redirects to login | Unit-testable (RTL) | Can mock signOut/router and verify it's called on 401 |
| 2. 500 with server message shows toast | Unit-testable (RTL) | Mock fetch, render component with ToastProvider, verify toast text |
| 3. 500 with no message shows fallback | Unit-testable (RTL) | Mock fetch with empty Messages, verify fallback text |
| 4. Park fails — grid unchanged | Unit-testable (RTL) | Mock fetch for PUT /v1/payments/park, verify state not updated |
| 5. Unpark fails — grid unchanged | Unit-testable (RTL) | Mock fetch for PUT /v1/payments/unpark, verify state not updated |
| 6. 500 with multiple messages | Unit-testable (RTL) | Mock fetch with multiple Messages, verify display |
| 7. Toast auto-dismiss | Unit-testable (RTL) | Use fake timers, verify toast removed after duration |
| E1. Multiple rapid errors visible | Unit-testable (RTL) | Trigger multiple showToast calls, verify all rendered |
| E2. 500 with non-JSON body | Unit-testable (RTL) | Mock fetch with HTML response, verify fallback message |
| E3. Park fails with empty messages | Unit-testable (RTL) | Mock fetch with empty Messages array, verify fallback + grid unchanged |

All scenarios in this story are unit-testable. No runtime verification needed.
