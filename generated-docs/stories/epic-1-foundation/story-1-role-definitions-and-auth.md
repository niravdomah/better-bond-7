# Story: Role Definitions and Auth Configuration

**Epic:** Foundation — Auth, Layout, and API Client | **Story:** 1 of 6 | **Wireframe:** N/A

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (configuration and auth infrastructure) |
| **Target File** | `types/roles.ts`, `lib/auth/auth.config.ts`, `lib/auth/auth.ts` |
| **Page Action** | `modify_existing` |

## User Story
**As a** user of the BetterBond Commission Payments system **I want** to log in and be assigned my correct role (Admin, Broker, or Agent) **So that** I see only the features and data appropriate for my role.

## Acceptance Criteria

### Happy Path
- [ ] AC-1: Given I log in as an Admin, when I am authenticated, then my session reflects the Admin role and I can access all areas of the application.
- [ ] AC-2: Given I log in as a Broker, when I am authenticated, then my session reflects the Broker role and I see only my own agency's data.
- [ ] AC-3: Given I log in as an Agent, when I am authenticated, then my session reflects the Agent role with read-only access.
- [ ] AC-4: Given I am logged in, when I make any request to the API, then the request includes an Authorization: Bearer <token> header automatically.

### Edge Cases
- [ ] AC-5: Given my session token is about to expire, when the token is refreshed, then I continue using the application without seeing any session expiry notice or being interrupted.

### Error Handling
- [ ] AC-6: Given I am not authenticated, when I try to access any protected page, then I am redirected to the login screen.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| N/A | N/A | Auth is handled by NextAuth credentials provider; no dedicated auth API endpoint in the OpenAPI spec |

## Implementation Notes
- The template currently defines 4 generic roles (ADMIN, POWER_USER, STANDARD_USER, READ_ONLY) in `types/roles.ts`. Replace these with the 3 BetterBond roles: Admin, Broker, Agent per the FRS Section 3.
- Update the `ROLE_HIERARCHY` to reflect Admin > Broker > Agent privilege levels.
- The existing auth system in `lib/auth/` uses NextAuth with a credentials provider. Configure it to assign BetterBond roles and include a Bearer token in the session.
- Silent token refresh (R52): tokens must auto-refresh without any visible notification. Implement this in the NextAuth JWT callback.
- The existing `RoleGate.tsx` component and `(protected)` layout group should continue to work with the new role enum values.
- This story enables manual verification of auth-dependent stories (Stories 4, 6) which build on these role definitions.
