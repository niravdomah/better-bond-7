# Story: Role-Based Route Guards

**Epic:** Foundation — Auth, Layout, and API Client | **Story:** 4 of 6 | **Wireframe:** N/A

**Role:** All Roles

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | All routes (cross-cutting access control) |
| **Target File** | `app/(protected)/`, `components/RoleGate.tsx`, route guard middleware |
| **Page Action** | `modify_existing` |

## User Story
**As a** system administrator **I want** route-level access control enforced based on user roles **So that** Agents cannot see restricted screens and sensitive banking details are hidden from unauthorized users.

## Acceptance Criteria

### Happy Path — Agent Restrictions
- [ ] AC-1: Given I am logged in as an Agent, when I try to navigate to the Payments Made screen (Screen 3), then I am redirected to a "Not Authorized" page or back to the Dashboard.
- [ ] AC-2: Given I am logged in as an Agent, when I view any screen, then I cannot see banking details such as bank account numbers, branch codes, or VAT numbers.

### Happy Path — Admin Privileges
- [ ] AC-3: Given I am logged in as an Admin, when I view the application, then I see a "Reset Demo" button available in the interface.
- [ ] AC-4: Given I am logged in as a Broker or Agent, when I view the application, then the "Reset Demo" button is not visible anywhere.

### Happy Path — Broker Scoping
- [ ] AC-5: Given I am logged in as a Broker, when I view any data screen, then I see only data belonging to my own agency — not data from other agencies.

### Happy Path — Full Access
- [ ] AC-6: Given I am logged in as an Admin, when I navigate to any screen including Payments Made, then I have full access with no restrictions.
- [ ] AC-7: Given I am logged in as a Broker, when I navigate to the Payments Made screen, then I can access it and see my agency's batch history.

### Edge Cases
- [ ] AC-8: Given I am logged in as an Agent, when I manually type the Payments Made URL in my browser, then I am still redirected — the guard cannot be bypassed by direct URL entry.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/demo/reset-demo` | Reset demo data (Admin only — R4, R37) |

## Implementation Notes
- The template already has a `RoleGate.tsx` component and `(protected)` layout group. Extend these with the BetterBond role definitions from Story 1.
- Agent redirect from Screen 3 (R3): implement as a route guard that checks the user's role before rendering the Payments Made page. Redirect to Dashboard or a "Not Authorized" page.
- Banking details visibility (R5, CR1 — POPIA data minimisation): create a utility or component that conditionally renders banking fields (BankAccountNumber, BranchCode, BranchName, VATNumber) only for Admin and Broker roles. Agent users must never see these fields.
- Reset Demo button visibility (R4, R37): conditionally render based on Admin role. The button calls `POST /demo/reset-demo` — wire this in a later epic or in the error handling story.
- Broker pre-filtering (R1, R16): the Broker's agency ID should come from their session. All data queries should be automatically scoped to their agency.
- FRS-over-template reminder: if the existing `RoleGate` or route protection logic conflicts with these requirements, replace it rather than working around it.
