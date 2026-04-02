# Test Handoff: Role Definitions and Auth Configuration

> Engineering document for downstream agents. Not reviewed by the BA.

**Source:** [story-1-role-definitions-and-auth-test-design.md](./story-1-role-definitions-and-auth-test-design.md)
**Epic:** 1 | **Story:** 1

## Coverage for WRITE-TESTS

- AC-1: Admin login assigns Admin role → Example 1
- AC-2: Broker login assigns Broker role → Example 2
- AC-3: Agent login assigns Agent role with read-only access → Example 3
- AC-4: API requests include Authorization: Bearer header → Example 4
- AC-5: Token refreshes silently without user interruption → Example 5
- AC-6: Unauthenticated user redirected to login → Example 6

## Handoff Notes for WRITE-TESTS

- Only generate executable tests from examples in the test-design document
- Do not invent behavior not represented there or explicitly approved
- Preferred render scope: unit/integration (types, auth config, auth helpers, API client)
- This story is primarily about **configuration and type definitions**, not UI pages. Most tests will verify:
  - The `UserRole` enum contains exactly Admin, Broker, Agent
  - The `ROLE_HIERARCHY` orders Admin > Broker > Agent
  - Legacy roles (POWER_USER, STANDARD_USER, READ_ONLY) are fully removed
  - Auth helper functions (`hasRole`, `hasMinimumRole`, `hasAnyRole`) work correctly with the new roles
  - The demo users in `auth.config.ts` are configured with the three BetterBond roles
  - The NextAuth JWT callback stores the role in the token
  - The NextAuth session callback exposes the role on `session.user`
- Suggested primary assertions:
  - `UserRole` enum has exactly 3 values: Admin, Broker, Agent
  - `ROLE_HIERARCHY[Admin] > ROLE_HIERARCHY[Broker] > ROLE_HIERARCHY[Agent]`
  - `hasMinimumRole(adminUser, UserRole.BROKER)` returns true
  - `hasMinimumRole(agentUser, UserRole.BROKER)` returns false
  - Demo users array contains one Admin, one Broker, one Agent
  - `isValidRole('admin')` returns true; `isValidRole('power_user')` returns false
  - API client attaches `Authorization: Bearer <token>` header to outgoing requests
- Important ambiguity flags:
  - The BA decision on demo user email addresses/names may affect test assertions for the demo user setup
  - Silent token refresh (AC-5) behavior depends on NextAuth JWT configuration — the test can verify the `maxAge` and callback setup, but actual silent refresh is a runtime behavior
  - AC-6 redirect to login is a server-side redirect via `requireAuth()` — testable as a unit test on the helper function (verifying it calls `redirect`), but full navigation is runtime-only

## Testability Classification

| Scenario | Category | Reason |
| --- | --- | --- |
| 1. Admin logs in and receives Admin role | Unit-testable (RTL) | Verify auth config returns correct role for Admin credentials |
| 2. Broker logs in and receives Broker role | Unit-testable (RTL) | Verify auth config returns correct role for Broker credentials |
| 3. Agent logs in and receives Agent role | Unit-testable (RTL) | Verify auth config returns correct role for Agent credentials |
| 4. Bearer token in API requests | Unit-testable (RTL) | Verify API client builds headers with Authorization: Bearer token |
| 5. Silent token refresh | Runtime-only | Actual token refresh lifecycle requires real NextAuth runtime; can only verify config settings |
| 6. Unauthenticated redirect to login | Partial — Unit + Runtime | Can test that `requireAuth` calls redirect when session is null; full browser redirect is runtime-only |
| 7. Role hierarchy Admin > Broker > Agent | Unit-testable (RTL) | Pure function tests on ROLE_HIERARCHY values and hasMinimumRole |
| E1. Login with incorrect password | Unit-testable (RTL) | Verify authorize() returns null for wrong password |
| E2. Login with unknown email | Unit-testable (RTL) | Verify authorize() returns null for unknown email |
| E3. Only three roles exist | Unit-testable (RTL) | Verify UserRole enum values and absence of legacy roles |

## Runtime Verification Checklist

These items cannot be verified by automated tests and must be checked during QA manual verification:

- [ ] Logging in with Admin credentials shows the Admin role reflected in the session (visible via user menu or debug panel)
- [ ] Logging in with Broker credentials shows the Broker role reflected in the session
- [ ] Logging in with Agent credentials shows the Agent role reflected in the session
- [ ] After staying logged in for an extended period, the session remains active without any expiry notice or forced re-login
- [ ] Visiting a protected page (e.g., /dashboard) without being logged in redirects to the login screen
- [ ] After being redirected to login, successfully logging in returns the user to the page they originally requested
