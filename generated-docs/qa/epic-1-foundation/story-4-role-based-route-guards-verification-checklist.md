# Story 4: Role-Based Route Guards — Verification Checklist

**Epic:** Foundation — Auth, Layout, and API Client
**Story:** 4 of 6 — Role-Based Route Guards
**Classification:** NON-ROUTABLE (utility/middleware — no new browser-visible pages)

## Quality Gate Results

| Gate | Result |
|------|--------|
| All tests pass (`npm test`) | PASS — 158 tests across 12 files |
| No lint errors (`npm run lint`) | PASS — 0 errors (1 warning: unused import in test file) |
| Production build (`npm run build`) | PASS — compiled and generated all pages |
| Test quality validation (`npm run test:quality`) | PASS — no quality issues |
| No suppressions in changed files | PASS — no eslint-disable, ts-ignore, ts-expect-error, or ts-nocheck found |

## Manual Verification Checklist

This story implements route guards, role-gating components, agency filter utilities, and authorization helpers. These are cross-cutting utilities that protect routes and conditionally render content based on user roles. The screens they protect (Payments Made, Dashboard data views, Reset Demo button) are built in later epics.

**Because no new browser-visible pages or UI elements are introduced by this story, manual browser verification is not applicable at this stage.** The behavior will become browser-verifiable once the protected screens are built in Epics 2-4.

### What was implemented and tested (automated)
- [ ] RoleGate component correctly shows/hides children based on user role
- [ ] Route guard redirects Agent users away from restricted routes
- [ ] Banking details (account numbers, branch codes, VAT numbers) are hidden from Agent users
- [ ] Reset Demo button visibility is restricted to Admin role only
- [ ] Broker data scoping filters data by agency ID
- [ ] Admin has unrestricted access to all routes
- [ ] Direct URL entry for restricted routes still triggers the guard (no bypass)
- [ ] withRoleProtection API wrapper enforces role checks on API routes

### Deferred to later epics (browser verification)
- AC-1: Agent redirect from Payments Made screen (Screen 3 built in Epic 4)
- AC-2: Banking details hidden from Agent on data screens (Screens built in Epics 2-3)
- AC-3: Reset Demo button visible for Admin (built in Epic 4)
- AC-5: Broker sees only their agency data (data screens built in Epics 2-3)
- AC-6/AC-7: Admin and Broker full access to Payments Made (Epic 4)
