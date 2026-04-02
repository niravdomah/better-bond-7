# Test Design: Role-Based Route Guards

## Story Summary

**Epic:** 1
**Story:** 4
**As a** system administrator
**I want** route-level access control enforced based on user roles
**So that** Agents cannot see restricted screens and sensitive banking details are hidden from unauthorized users.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- Agents are blocked from accessing the Payments Made screen (Screen 3) and are redirected away
- Agents cannot see banking details (bank account number, branch code, branch name, VAT number) on any screen
- Only Admins see the "Reset Demo" button in the interface
- Brokers and Agents never see the "Reset Demo" button
- Brokers see only their own agency's data on all screens
- Admins have unrestricted access to every screen including Payments Made
- Brokers can access the Payments Made screen and see their agency's batch history
- Direct URL entry to a restricted page still enforces the route guard (no bypass)

## Key Decisions Surfaced by AI

- **Redirect target for blocked Agents:** The story says "redirected to a 'Not Authorized' page or back to the Dashboard." The existing codebase has a `requireMinimumRole()` function that redirects to `/auth/forbidden`. We will test that Agents are redirected away from the Payments Made route, accepting either a "Not Authorized" page or the Dashboard as valid targets.
- **Banking details component scope:** This story introduces a `BankingDetails` visibility utility/component. The actual data screens (Screens 2 and 3) are built in later epics. For this story, we test that the utility correctly hides or shows banking fields based on role — not the full screen integration.
- **Reset Demo button scope:** The button is wired to `POST /demo/reset-demo` in a later epic. For this story, we test only that the button renders for Admin and is absent for Broker and Agent.
- **Broker agency scoping mechanism:** The Broker's agency ID comes from their session. For this story, we test that the session-based agency scoping utility correctly identifies and passes the agency filter — the full data filtering integration is covered in later epics.

## Test Scenarios / Review Examples

### 1. Agent is blocked from Payments Made screen

| Setup | Value |
| --- | --- |
| User | Logged in as Agent |
| Navigation target | Payments Made screen (Screen 3) |

| Input | Value |
| --- | --- |
| User navigates to | Payments Made route |

| Expected | Value |
| --- | --- |
| Page displayed | Not the Payments Made screen |
| Redirect occurs | Yes — user is sent to a "Not Authorized" page or back to the Dashboard |
| Payments Made content | Not visible to the user |

---

### 2. Agent is blocked even when typing the URL directly

| Setup | Value |
| --- | --- |
| User | Logged in as Agent |

| Input | Value |
| --- | --- |
| User types directly | The Payments Made URL in the browser address bar |

| Expected | Value |
| --- | --- |
| Page displayed | Not the Payments Made screen |
| Redirect occurs | Yes — same behavior as navigating via links |

---

### 3. Agent cannot see banking details

| Setup | Value |
| --- | --- |
| User | Logged in as Agent |
| Data available | Payment records with banking fields (BankAccountNumber, BranchCode, BranchName, VATNumber) |

| Expected | Value |
| --- | --- |
| Bank account number | Not visible |
| Branch code | Not visible |
| Branch name | Not visible |
| VAT number | Not visible |

---

### 4. Admin sees banking details

| Setup | Value |
| --- | --- |
| User | Logged in as Admin |
| Data available | Payment records with banking fields |

| Expected | Value |
| --- | --- |
| Bank account number | Visible |
| Branch code | Visible |
| Branch name | Visible |
| VAT number | Visible |

---

### 5. Broker sees banking details

| Setup | Value |
| --- | --- |
| User | Logged in as Broker |
| Data available | Payment records with banking fields |

| Expected | Value |
| --- | --- |
| Bank account number | Visible |
| Branch code | Visible |
| Branch name | Visible |
| VAT number | Visible |

---

### 6. Admin sees the Reset Demo button

| Setup | Value |
| --- | --- |
| User | Logged in as Admin |
| Screen | Any screen in the application |

| Expected | Value |
| --- | --- |
| "Reset Demo" button | Visible |

---

### 7. Broker does not see the Reset Demo button

| Setup | Value |
| --- | --- |
| User | Logged in as Broker |
| Screen | Any screen in the application |

| Expected | Value |
| --- | --- |
| "Reset Demo" button | Not visible |

---

### 8. Agent does not see the Reset Demo button

| Setup | Value |
| --- | --- |
| User | Logged in as Agent |
| Screen | Any screen in the application |

| Expected | Value |
| --- | --- |
| "Reset Demo" button | Not visible |

---

### 9. Admin has full access to Payments Made screen

| Setup | Value |
| --- | --- |
| User | Logged in as Admin |

| Input | Value |
| --- | --- |
| User navigates to | Payments Made route |

| Expected | Value |
| --- | --- |
| Page displayed | Payments Made screen |
| Access | Full — no restrictions |

---

### 10. Broker can access Payments Made screen

| Setup | Value |
| --- | --- |
| User | Logged in as Broker |

| Input | Value |
| --- | --- |
| User navigates to | Payments Made route |

| Expected | Value |
| --- | --- |
| Page displayed | Payments Made screen |
| Data shown | Only their own agency's batch history |

---

### 11. Broker sees only their own agency's data

| Setup | Value |
| --- | --- |
| User | Logged in as Broker for "Agency Alpha" |
| Available data | Records from Agency Alpha, Agency Beta, Agency Gamma |

| Expected | Value |
| --- | --- |
| Data from Agency Alpha | Visible |
| Data from Agency Beta | Not visible |
| Data from Agency Gamma | Not visible |

---

## Edge and Alternate Examples

### E1. Unauthenticated user cannot access any protected route

| Setup | Value |
| --- | --- |
| User | Not logged in |

| Input | Value |
| --- | --- |
| User navigates to | Any protected route |

| Expected | Value |
| --- | --- |
| Redirect | Yes — to sign-in page |

---

### E2. Session with no user object is treated as unauthenticated

| Setup | Value |
| --- | --- |
| Session | Exists but user object is null/undefined |

| Input | Value |
| --- | --- |
| Access attempted | Any role-gated content |

| Expected | Value |
| --- | --- |
| Content shown | No — fallback or redirect |

---

### E3. Agent accessing a non-restricted screen sees normal content

| Setup | Value |
| --- | --- |
| User | Logged in as Agent |

| Input | Value |
| --- | --- |
| User navigates to | Dashboard (Screen 1) |

| Expected | Value |
| --- | --- |
| Page displayed | Dashboard — read-only view |
| Access | Granted (Agent has read access to Dashboard) |

---

### E4. Broker agency scoping filters data at the utility level

| Setup | Value |
| --- | --- |
| User | Logged in as Broker with agencyId "5" in session |

| Expected | Value |
| --- | --- |
| Agency filter value | "5" — extracted from session |
| Filter applied | Automatically, without manual user selection |

---

## Out of Scope

- Full Screen 2 and Screen 3 integration (built in Epic 3 and Epic 4)
- Wiring the Reset Demo button to `POST /demo/reset-demo` (later epic)
- Actual API data filtering for Broker scoping (later epic integration)
- Login page and authentication flow (covered in Story 1)
- Park/Unpark button disabling for Agents (Screen 2 story)

## Coverage for WRITE-TESTS (AC to Example Mapping)

| AC | Scenario(s) |
| --- | --- |
| AC-1: Agent redirected from Payments Made | Scenario 1, Scenario 2 |
| AC-2: Agent cannot see banking details | Scenario 3 |
| AC-3: Admin sees Reset Demo button | Scenario 6 |
| AC-4: Broker/Agent do not see Reset Demo button | Scenario 7, Scenario 8 |
| AC-5: Broker sees only own agency data | Scenario 11, Edge E4 |
| AC-6: Admin has full access | Scenario 4, Scenario 9 |
| AC-7: Broker can access Payments Made | Scenario 5, Scenario 10 |
| AC-8: Direct URL entry still enforces guard | Scenario 2 |

## Handoff Notes for WRITE-TESTS

1. **Existing infrastructure:** The codebase already has `RoleGate` (server component), `requireMinimumRole()`, `requireAuth()`, `isAuthorized()`, and role hierarchy utilities. Tests for the RoleGate component itself already exist in `web/src/__tests__/integration/role-gate.test.tsx`. This story extends them with route-level guards and new utility components.

2. **Route guard approach:** Use `requireMinimumRole(UserRole.BROKER)` in the Payments Made page layout to block Agents. The existing `auth-server.ts` redirects to `/auth/forbidden` when the check fails — verify this behavior.

3. **Banking details utility:** Create a `BankingDetailsGate` component or `canViewBankingDetails()` helper that checks `isAuthorized(user, 'banking-details', 'read')`. Test that Agent role returns false and Admin/Broker return true.

4. **Reset Demo button:** Use `RoleGate allowedRoles={[UserRole.ADMIN]}` to conditionally render the button. Test presence for Admin, absence for Broker and Agent.

5. **Broker agency scoping:** Create a `getAgencyFilter()` utility that extracts agencyId from the session. Broker sessions should include an agencyId field. Test that the utility returns the correct agency ID for Brokers and null/undefined for Admins (who see all agencies).

6. **Mock pattern:** Follow the existing mock pattern from `role-gate.test.tsx` — mock `@/lib/auth/auth` and `next-auth`, create sessions with `createMockSession()`, and test server component behavior by calling the component function directly.

7. **FRS-over-template reminder:** The FRS requires that banking details are hidden from Agents and the Reset Demo button is Admin-only. If any existing template code renders these without role checks, the tests should verify the spec behavior (role-gated), not the template behavior (unrestricted).
