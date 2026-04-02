# Feature: BetterBond Commission Payments POC

## Summary
A frontend proof-of-concept for BetterBond's commission payment management system, featuring three core screens (Dashboard, Payment Management, Payments Made) backed by a live REST API at localhost:8042. The application supports three user roles (Admin, Broker, Agent) with role-based access controls, and provides real-time visibility into payment status, agency metrics, and batch processing workflows.

## Epics
1. **Epic 1: Foundation — Auth, Layout, and API Client** - Set up the application shell: NextAuth with Bearer token flow, persistent header/sidebar navigation, light/dark theme toggle, BetterBond branding with logo, role-based route guards, the API client configured for localhost:8042 with Bearer token headers, and ZAR currency/date formatting utilities. Loading indicators for API calls and generic error handling. | Status: Pending | Dir: `epic-1-foundation/`
2. **Epic 2: Dashboard (Screen 1)** - Build the Dashboard screen with six visual components: Payments Ready bar chart, Parked Payments bar chart, Total Value Ready metric, Total Value Parked metric, Parked Payments Aging chart, Total Payments Made (14 days) metric. Agency Summary grid with click-to-navigate, agency filtering via URL params, and role-based pre-filtering for Brokers. | Status: Pending | Dir: `epic-2-dashboard/`
3. **Epic 3: Payment Management (Screen 2)** - Build the Payment Management screen with Main Grid and Parked Grid, client-side search filtering, client-side pagination, row checkboxes for multi-select, single and bulk Park/Unpark with confirmation modals, Initiate Payment flow with confirmation and success modals, computed CommissionPct column, and role-based restrictions. | Status: Pending | Dir: `epic-3-payment-management/`
4. **Epic 4: Payments Made (Screen 3) and Demo Reset** - Build the Payments Made screen showing processed payment batches, client-side search, PDF invoice download with error handling, Admin-only Reset Demo action, and Agent role redirect away from Screen 3. | Status: Pending | Dir: `epic-4-payments-made/`

## Epic Dependencies
- Epic 1: Foundation (no dependencies — must be first)
- Epic 2: Dashboard (depends on Epic 1 — independent of Epics 3 and 4, can parallel with them)
- Epic 3: Payment Management (depends on Epic 1 — independent of Epics 2 and 4, can parallel with them)
- Epic 4: Payments Made (depends on Epic 1 — independent of Epics 2 and 3, can parallel with them)

## Implementation Order
Epic 1 (Foundation) -> Epic 3 (Payment Management) -> Epic 2 (Dashboard) -> Epic 4 (Payments Made)
