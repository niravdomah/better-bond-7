# Test Handoff: API Client Configuration

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-2-api-client-configuration-test-design.md](./story-2-api-client-configuration-test-design.md)
**Epic:** 1 | **Story:** 2

## Coverage for WRITE-TESTS

- AC-1: Base URL from env var defaulting to localhost:8042 → Example 1, Example 7
- AC-2: Loading indicator visible during API calls → Example 3
- AC-3: Loading indicator disappears and data displayed after successful fetch → Example 4, Example 6
- AC-4: Typed endpoint functions use correct HTTP method and path from OpenAPI spec → Example 5
- AC-5: Custom base URL via NEXT_PUBLIC_API_BASE_URL overrides default → Example 7
- AC-6: Error message shown when API server is unreachable (no endless spinner) → Example 8

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: mixed — unit tests for API client/endpoints functions, component-level integration test for loading indicator behavior
- Suggested primary assertions:
  - `apiClient` / convenience functions (`get`, `post`, `put`, `del`) construct URLs using `API_BASE_URL` from constants
  - `API_BASE_URL` reads from `process.env.NEXT_PUBLIC_API_BASE_URL` with fallback to `http://localhost:8042`
  - `buildHeaders` includes `Authorization: Bearer <token>` when a token is available
  - `buildHeaders` omits `Authorization` header when token is null
  - Each typed endpoint function in `endpoints.ts` calls the correct HTTP method and path
  - A component using an endpoint shows a loading indicator while the request is pending
  - A component using an endpoint shows data after the request resolves
  - A component shows an error message (not an endless spinner) when the request fails with a network error
- Important ambiguity flags:
  - The "global loading indicator" visual form is unspecified. Test for presence of a loading state element (role="progressbar", spinner text, or similar), not a specific component.
  - The exact error message text for network failures is not specified in the story. Assert that an error message exists, not its exact wording. The current code throws "Network error: Unable to connect to the API server" but this may change.
- Mock strategy:
  - Mock `fetch` globally for API client unit tests
  - Mock `getAccessToken` from `@/lib/auth/auth-client` to control token presence
  - For endpoint function tests, mock `apiClient` or the underlying `fetch` to verify method/path/body
  - For loading indicator integration tests, use a delayed mock response to observe the loading state
  - For env variable tests, set `process.env.NEXT_PUBLIC_API_BASE_URL` in test setup (note: `constants.ts` reads it at module load time, so may need to use `jest.resetModules()` or dynamic imports)

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. API calls go to default base URL | Unit-testable (RTL) | URL construction is a pure function of constants |
| 2. Bearer token attached to requests | Unit-testable (RTL) | Header construction testable by mocking token provider |
| 3. Loading indicator during fetch | Unit-testable (RTL) | Component rendering with pending async state |
| 4. Loading disappears, data shown | Unit-testable (RTL) | Component rendering after async resolve |
| 5. Typed endpoints use correct methods/paths | Unit-testable (RTL) | Function calls verifiable via mocked fetch |
| 6. Successful data display | Unit-testable (RTL) | Component renders API response data |
| 7. Custom base URL via env var | Unit-testable (RTL) | Module-level constant reads env var |
| 8. Error shown when server unreachable | Unit-testable (RTL) | Component renders error state on fetch rejection |
| 9. No token when unauthenticated | Unit-testable (RTL) | Header construction testable by mocking token provider returning null |

All scenarios in this story are unit-testable. No runtime verification needed.
