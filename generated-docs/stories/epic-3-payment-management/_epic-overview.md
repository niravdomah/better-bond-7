# Epic 3: Payment Management (Screen 2)

## Description
Build the Payment Management screen — the operational hub for viewing, parking, unparking, and initiating commission payments for a specific agency. Features two data grids (Main and Parked), client-side search and pagination, single and bulk Park/Unpark actions with confirmation modals, an Initiate Payment flow with confirmation and success modals, computed Commission % column, and role-based restrictions for Agent users.

## Stories
1. **Payment Grids with Data Loading and Computed Fields** - Load payments for the selected agency via API, display Main Grid (non-PROCESSED payments) and Parked Grid (PARKED payments) with all columns including computed Commission %, ZAR formatting, loading/error/empty states | File: `story-1-payment-grids-data-loading.md` | Status: Pending
2. **Client-Side Search Filtering and Pagination** - Search bar filtering both grids by Claim Date, Agency Name, and Status without API calls, client-side pagination for both grids, agencyId URL parameter preserved for deep-linking | File: `story-2-search-filtering-pagination.md` | Status: Pending
3. **Park and Unpark with Confirmation Modals** - Per-row and bulk Park/Unpark actions with confirmation modals, API calls to park/unpark endpoints, grid updates without full reload, error handling, role-based restrictions for Agent users | File: `story-3-park-unpark-confirmation.md` | Status: Pending
4. **Initiate Payment Flow with Confirmation and Success Modals** - Initiate Payment button with confirmation modal showing count and total, payments transition to PROCESSED and leave Main Grid, success modal with Payments Made reference, disabled when grid empty, Agent role restrictions, banking details visibility | File: `story-4-initiate-payment-flow.md` | Status: Pending
