# Feature: BetterBond Commission Payments POC

## 1. Problem Statement

BetterBond currently manages commission payments via spreadsheets, causing errors and delays across their agency network. This proof-of-concept demonstrates a web-based Payments module — providing a visual and functional preview of three core screens (Dashboard, Payment Management, Payments Made) — so that BetterBond can evaluate the approach before committing to a full system rewrite.

---

## 2. Feature Overview

The Commission Payments POC is a frontend application backed by a live REST API at `http://localhost:8042`. It covers three primary screens:

| Screen | Purpose |
|--------|---------|
| Screen 1 — Dashboard | At-a-glance summary of commission payment activity, segmented by agency |
| Screen 2 — Payment Management | Operational hub for viewing, parking, and initiating payments per agency |
| Screen 3 — Payments Made | Historical view of processed payment batches with invoice download capability |

Authentication uses NextAuth with Bearer token flow. All API requests carry an `Authorization: Bearer <token>` header.

---

## 3. User Roles & Permissions

| Role | Description | Screen 1 | Screen 2 | Screen 3 | Park/Unpark | Initiate Payment | Reset Demo |
|------|-------------|----------|----------|----------|-------------|-----------------|------------|
| Admin | Full access across all agencies | All agencies | All agencies | Yes | Yes — all agencies | Yes | Yes |
| Broker | Manages own agency only | Pre-filtered to own agency | Own agency only | Yes | Yes — own agency only | Yes | No |
| Agent | Read-only view of own records | Read-only | Own rows visible, Park/Unpark disabled | No access | No | No | No |

**R1:** The Dashboard (Screen 1) for an Admin shows combined metrics across all agencies by default. For a Broker, the Dashboard is pre-filtered to their own agency.

**R2:** On Screen 2, an Agent can see only their own payment rows. The Park and Unpark buttons are disabled for Agents.

**R3:** Agents have no access to Screen 3 (Payments Made). Navigating to the Screen 3 route while authenticated as an Agent redirects to a "Not Authorized" page or back to the Dashboard.

**R4:** Only Admins can trigger the Reset Demo action (POST `/demo/reset-demo`).

**R5:** Banking details (bank account number, branch code) are visible only to Broker and Admin roles. Agents cannot see banking details on any screen.

---

## 4. Business Rules

**BR1:** The Main Grid on Screen 2 displays payments where `Status` is any value except `PROCESSED`. Payments with `Status = PROCESSED` never appear in the Main Grid.

**BR2:** The Parked Grid on Screen 2 displays payments where `Status = PARKED` and other non-PROCESSED, non-READY states. Payments with `Status = PROCESSED` never appear in the Parked Grid.

**BR3:** After the Initiate Payment action is confirmed by the user, all visible (filtered) payments in the Main Grid transition to `PROCESSED` state and are removed from the Main Grid. This is a demo action — no real bank disbursement occurs and no POST to `/v1/payment-batches` is made.

**BR4:** The Initiate Payment button is disabled when the Main Grid is empty (zero visible rows after applying any active search filter).

**BR5:** Park and Unpark actions operate only on the currently visible (filtered) rows. If a search filter is active, only matching rows are parked or unparked.

**BR6:** Any Broker belonging to an agency can park or unpark any payment for that agency. There are no per-user restrictions within the same agency.

**BR7:** `CommissionPct` is a computed field: `CommissionPct = CommissionAmount / BondAmount`. It is not stored server-side and must be calculated on the frontend before display.

**BR8:** The "Total Value of Payments Made (Last 14 Days)" metric on the Dashboard is computed on the frontend by summing `CommissionAmount` from all payments where `Status = PROCESSED` and `LastChangedDate` falls within the last 14 calendar days.

**BR9:** Selecting an agency row on the Dashboard grid navigates to Screen 2 filtered for that agency (via URL parameter, e.g. `/payments?agencyId=5`). All dashboard charts update to reflect the selected agency's metrics.

**BR10:** The agency filter on Screen 1 and the agency selection on Screen 2 are expressed as URL query parameters to support browser back-navigation and deep-linking.

**BR11:** Bulk park and bulk unpark require multi-select via row checkboxes. Single-row park/unpark is via a per-row "Park" / "Unpark" button.

**BR12:** Before initiating a payment, a confirmation modal is displayed showing: number of payments and total value of payments to be processed.

**BR13:** Before parking (single or bulk), a confirmation modal is displayed showing: Agent Name, Claim Date, and Amount (for single) or number of payments and total combined amount (for bulk).

**BR14:** Before unparking (single or bulk), a confirmation modal mirrors the parking flow with equivalent details for unparked payments.

**BR15:** After the Initiate Payment action completes, a success modal confirms that the payment has been processed. A payment batch invoice is generated server-side and accessible on Screen 3.

---

## 5. Data Model

### 5.1 Payment

Source: `GET /v1/payments` and `GET /v1/payments/{Id}` — schema `PaymentRead`.

| Field | Type | Notes |
|-------|------|-------|
| Id | integer | Primary key |
| Reference | string | Payment reference code |
| AgencyName | string | Name of the agency |
| ClaimDate | string (date) | Date of the commission claim |
| AgentName | string | Agent's first name |
| AgentSurname | string | Agent's surname |
| LastChangedUser | string | User who last modified the record |
| LastChangedDate | string (date-time) | Timestamp of last modification; used for 14-day dashboard metric |
| BondAmount | number | Bond value in ZAR; used as denominator for CommissionPct |
| CommissionType | string | "Bond Comm" or "Manual Payments" |
| GrantDate | string (date) | Date bond was granted |
| RegistrationDate | string (date) | Date bond was registered |
| Bank | string | Bank abbreviation (ABSA, FNB, STD, NED) |
| CommissionAmount | number | Gross commission in ZAR |
| VAT | number | VAT portion in ZAR |
| Status | string | Payment state: READY, PARKED, PROCESSED, or other non-PROCESSED values |
| BatchId | integer | Foreign key to PaymentBatch (null if not yet batched) |
| CommissionPct | computed | `CommissionAmount / BondAmount` — calculated on frontend, not stored |

**Main Grid shows:** payments where `Status != PROCESSED`.
**Parked Grid shows:** payments where `Status = PARKED` (and other non-PROCESSED, non-READY states).

### 5.2 PaymentBatch

Source: `GET /v1/payment-batches` and `GET /v1/payment-batches/{Id}` — schema `PaymentBatchRead`.

| Field | Type | Notes |
|-------|------|-------|
| Id | integer | Primary key |
| CreatedDate | string (date-time) | Date batch was created |
| Status | string | Batch processing status |
| Reference | string | Batch reference number |
| LastChangedUser | string | User who last acted on the batch |
| AgencyName | string | Agency this batch belongs to |
| PaymentCount | integer | Number of payments in batch |
| TotalCommissionAmount | number | Sum of CommissionAmount for the batch |
| TotalVat | number | Sum of VAT for the batch |

**Agency data required for invoice generation:** AgencyName, AddressLine1, AddressLine2, AddressLine3, PostalCode, BankAccountNumber, BranchName, BranchCode, BankName, VATNumber. This data must be available in the PaymentBatch response or supplemented by the agency lookup.

### 5.3 Dashboard

Source: `GET /v1/payments/dashboard` — schema `PaymentsDashboardRead`.

| Field | Type | Notes |
|-------|------|-------|
| PaymentStatusReport | array of PaymentStatusReportItem | Status breakdown by CommissionType and AgencyName |
| ParkedPaymentsAgingReport | array of ParkedPaymentsAgingReportItem | Aging buckets (1-3 days, 4-7 days, >7 days) |
| TotalPaymentCountInLast14Days | integer | Count of processed payments in last 14 days |
| PaymentsByAgency | array of PaymentsByAgencyReportItem | Per-agency summary: AgencyName, PaymentCount, TotalCommissionCount, Vat |

`PaymentStatusReportItem`: `{ Status, PaymentCount, TotalPaymentAmount, CommissionType, AgencyName }`
`ParkedPaymentsAgingReportItem`: `{ Range, AgencyName, PaymentCount }`
`PaymentsByAgencyReportItem`: `{ AgencyName, PaymentCount, TotalCommissionCount, Vat }`

### 5.4 Agency (Reference Data — from dataset)

10 agencies in the sample dataset. Agency banking details (BankAccountNumber, BranchCode, VATNumber) are sensitive and visible to Broker and Admin roles only.

| Field | Notes |
|-------|-------|
| AgencyName | Display name |
| AddressLine1, 2, 3, PostalCode | Physical address for invoices |
| BankAccountNumber | Sensitive — restricted to Broker/Admin |
| BranchName, BranchCode | Sensitive — restricted to Broker/Admin |
| BankName | Bank display name |
| VATNumber | Sensitive — restricted to Broker/Admin |

---

## 6. Functional Requirements

### Screen 1 — Dashboard

**R6:** The Dashboard screen displays six visual components: (1) Payments Ready for Payment bar chart, (2) Parked Payments bar chart, (3) Total Value Ready for Payment metric, (4) Total Value of Parked Payments metric, (5) Parked Payments Aging Report chart, (6) Total Value of Payments Made (Last 14 Days) metric.

**R7:** The "Payments Ready for Payment" bar chart displays the total count of payments in the Main Grid (i.e., `Status != PROCESSED`), split by CommissionType ("Bond Comm" and "Manual Payments"). Data source: `PaymentStatusReport` from `GET /v1/payments/dashboard`.

**R8:** The "Parked Payments" bar chart displays the total count of payments with `Status = PARKED`, split by CommissionType. Data source: `PaymentStatusReport`.

**R9:** The "Total Value Ready for Payment" metric displays the sum of `CommissionAmount` for payments where `Status != PROCESSED` and `Status != PARKED`. Data source: `PaymentStatusReport`.

**R10:** The "Total Value of Parked Payments" metric displays the sum of `CommissionAmount` for payments where `Status = PARKED`. Data source: `PaymentStatusReport`.

**R11:** The "Parked Payments Aging Report" chart shows how long payments have been parked, grouped into ranges: 1–3 days, 4–7 days, and >7 days. Data source: `ParkedPaymentsAgingReport`.

**R12:** The "Total Value of Payments Made (Last 14 Days)" metric is computed on the frontend by summing `CommissionAmount` from all payments where `Status = PROCESSED` and `LastChangedDate` is within the last 14 calendar days.

**R13:** The Dashboard Grid (Agency Summary) displays one row per agency with columns: Agency Name, Number of Payments (ready, not parked), Total Commission Amount, VAT. Data source: `PaymentsByAgency`.

**R14:** Each row in the Dashboard Grid has a clickable button that navigates to Screen 2 with the `agencyId` URL parameter set to the selected agency (e.g., `/payments?agencyId=5`). Selecting a row also updates all dashboard charts to show metrics for that agency only.

**R15:** When an Admin user selects an agency on the Dashboard, all charts and metrics update to reflect that agency. When no agency is selected, charts show combined metrics across all agencies.

**R16:** When a Broker user loads the Dashboard, charts and the Agency Summary grid are pre-filtered to the Broker's own agency. The Broker cannot view metrics for other agencies from the Dashboard.

### Screen 2 — Payment Management

**R17:** Screen 2 loads all payments for the selected agency via `GET /v1/payments` (client-side filtering applied after full load). The agency is determined by the `agencyId` URL parameter.

**R18:** The Main Grid displays payments where `Status != PROCESSED` with the following columns: Agency Name, Batch ID, Claim Date, Agent Name & Surname, Bond Amount, Commission Type, Commission % (computed), Grant Date, Reg Date, Bank, Commission Amount, VAT, Status.

**R19:** The Parked Grid displays payments where `Status = PARKED` with the same columns as the Main Grid.

**R20:** The Search Bar on Screen 2 filters payments client-side by Claim Date, Agency Name, and Status. Filtering occurs after the full dataset has been loaded; no additional API call is made on each keypress.

**R21:** Grid pagination is client-side — all records are loaded from the API, then paginated in the browser.

**R22:** A user can select multiple payments via row checkboxes to enable bulk Park or Unpark actions.

**R23:** Clicking "Park" on a single payment row opens a confirmation modal displaying: Agent Name, Claim Date, and Commission Amount. On confirmation, the app calls `PUT /v1/payments/park` with the payment's Id array.

**R24:** Clicking "Park Selected" for a bulk selection opens a confirmation modal displaying: count of selected payments and total combined Commission Amount. On confirmation, the app calls `PUT /v1/payments/park` with all selected payment Id values.

**R25:** After a successful Park API call, the parked payment(s) move from the Main Grid to the Parked Grid without a full page reload.

**R26:** Clicking "Unpark" on a single payment row opens a confirmation modal mirroring the Park flow. On confirmation, the app calls `PUT /v1/payments/unpark` with the payment's Id array.

**R27:** After a successful Unpark API call, the unparked payment(s) move from the Parked Grid back to the Main Grid without a full page reload.

**R28:** Clicking "Initiate Payment" opens a confirmation modal displaying: number of currently visible (filtered) Main Grid payments and their total Commission Amount. On confirmation, all visible payments transition to `PROCESSED` state in the UI (removed from Main Grid). This is a demo action — no POST to `/v1/payment-batches` is made.

**R29:** After the Initiate Payment confirmation completes, a success modal informs the user that payments have been processed.

**R30:** The Initiate Payment button is disabled when the Main Grid has zero visible rows (empty after any active search filter).

### Screen 3 — Payments Made

**R31:** Screen 3 displays all processed payment batches retrieved via `GET /v1/payment-batches` with columns: Agency Name, Number of Payments, Total Commission Amount, VAT, Invoice Link.

**R32:** The Search Bar on Screen 3 filters results client-side by Agency Name and Batch ID.

**R33:** Each row in Screen 3 has an Invoice Link that triggers `POST /v1/payment-batches/{Id}/download-invoice-pdf`. The response (binary `application/octet-stream`) is downloaded as a PDF file in the browser.

**R34:** If the PDF download fails, a toast notification is shown with the error message from `DefaultResponse.Messages`. The user remains on Screen 3.

### Navigation & Layout

**R35:** The application has a persistent header and/or sidebar with navigation links to all three screens. Users can navigate to any screen at any time (subject to role restrictions in R3).

**R36:** Agency selection is preserved in the URL as a query parameter (e.g., `?agencyId=5`) to enable browser back-navigation and deep-linking to a specific agency's payment view.

**R37:** An Admin user has a "Reset Demo" button in the UI that calls `POST /demo/reset-demo`. On success, the UI refreshes its data. This button is hidden from Broker and Agent users.

---

## 7. API Integration

**Base URL:** `http://localhost:8042`
**Auth:** Bearer token via `Authorization` header on all requests. Managed by NextAuth.

| Operation | Method | Endpoint | Used On |
|-----------|--------|----------|---------|
| Get all payments | GET | `/v1/payments` | Screen 2 |
| Get payment by ID | GET | `/v1/payments/{Id}` | As needed |
| Park payments | PUT | `/v1/payments/park` | Screen 2 |
| Unpark payments | PUT | `/v1/payments/unpark` | Screen 2 |
| Get dashboard data | GET | `/v1/payments/dashboard` | Screen 1 |
| Get all payment batches | GET | `/v1/payment-batches` | Screen 3 |
| Get payment batch by ID | GET | `/v1/payment-batches/{Id}` | Screen 3 |
| Download invoice PDF | POST | `/v1/payment-batches/{Id}/download-invoice-pdf` | Screen 3 |
| Reset demo data | POST | `/demo/reset-demo` | Admin only |

**Query parameters available:**
- `GET /v1/payments`: `ClaimDate`, `AgencyName`, `Status` (used for server-side filtering, but the POC performs client-side filtering after full load)
- `GET /v1/payment-batches`: `Reference`, `AgencyName`

**Park/Unpark request body:**
```json
{ "PaymentIds": [1, 2, 3] }
```

**Create payment batch request body** (not used in demo — for reference only):
```json
{ "PaymentIds": [1, 2, 3] }
```
Header: `LastChangedUser: <username>`

**Session management:** Silent token refresh — tokens are refreshed automatically without prompting the user. There is no explicit session expiry notification in this POC.

---

## 8. Error Handling & Validation

**R38:** When a Park or Unpark API call returns a 500 response, the application displays the error message(s) from `DefaultResponse.Messages` to the user (e.g., inline alert or toast). The grids are not modified on error.

**R39:** When a PDF invoice download (`POST /v1/payment-batches/{Id}/download-invoice-pdf`) fails with a non-200 response, a toast notification is shown with the error message from `DefaultResponse.Messages`.

**R40:** When `GET /v1/payments` or `GET /v1/payments/dashboard` returns a 401, the user is redirected to the login screen.

**R41:** When any API call returns a 500 response that is not specifically handled (Park/Unpark/PDF), a generic error state is shown with the server message if available, or a fallback message: "An unexpected error occurred. Please try again."

**R42:** The Search Bar on Screen 2 performs client-side filtering only (no debounced API calls). No validation is required for the search input.

---

## 9. Styling & Branding

**R43:** The application supports both Light and Dark mode. The user can toggle between modes; preference is persisted across sessions.

**R44:** The BetterBond / MortgageMax logo (located at `documentation/morgagemaxlogo.png`) is displayed in the application header and on the login page.

**R45:** All currency values are formatted using the South African en-ZA locale: space as thousands separator, comma as decimal separator (e.g., R 1 234 567,89).

**R46:** Date values are displayed in South African format (DD/MM/YYYY or similar locale-appropriate format).

**R47:** The application uses Shadcn UI components with Tailwind CSS 4. Design tokens for both light and dark themes are generated by the DESIGN phase.

**R48:** The application is responsive and must function correctly on desktop, tablet, and mobile screen sizes.

---

## 10. Compliance & Regulatory

POPIA (Protection of Personal Information Act) was identified as applicable during intake screening. Full POPIA compliance implementation is deferred to future phases. The following minimum constraints apply to this POC:

**CR1:** Banking details (BankAccountNumber, BranchCode, BranchName, VATNumber) MUST NOT be displayed to users with the Agent role. These fields must be omitted from Agent-visible views and API responses should not expose them to Agent-scoped requests. (POPIA — data minimisation / access control)

**CR2:** Commission amounts, agent names, and agency details constitute personally identifiable financial information under POPIA. Access to this data is restricted by role as defined in Section 3. No additional POPIA controls (consent flows, data deletion requests, audit trail) are in scope for this POC — these are deferred to future phases.

---

## 11. Non-Functional Requirements

**R49:** The application must be fully responsive, supporting desktop (1280px+), tablet (768px–1279px), and mobile (< 768px) screen sizes. Grid layouts must adapt gracefully on smaller screens (horizontal scroll or stacked layout as appropriate).

**R50:** WCAG accessibility compliance is not a priority for this POC and is deferred to future phases. Standard semantic HTML should still be used where it does not add implementation overhead.

**R51:** Grid pagination is client-side. All payment records for the selected agency are loaded in a single API call; the browser handles pagination. No infinite scroll or server-side pagination is required.

**R52:** Session tokens are refreshed silently (auto-refresh) without any visible notification to the user. There is no explicit session expiry page in this POC.

**R53:** The frontend application loads against the API at `http://localhost:8042`. The base URL must be configurable via environment variable for non-local deployments.

**R54:** The application must display a loading indicator while any API call is in progress (data fetch or mutation).

---

## 12. Out of Scope

- Real payment disbursement or bank integration — the Initiate Payment action is demo-only with no actual bank transfer
- POST `/v1/payment-batches` is not called by the POC frontend — batch creation is simulated client-side
- User account management UI (creating, editing, or deleting user accounts) — backend-handled
- Audit trail of payment actions
- Email notifications for payment events
- Multi-currency support — South African Rand (ZAR) only
- WCAG / accessibility compliance — deferred to future phases
- Full POPIA compliance controls (consent management, data deletion workflows, audit logging) — deferred to future phases
- Multi-environment deployment pipeline — POC targets localhost only

---

## Source Traceability

| ID | Source | Reference |
|----|--------|-----------|
| R1 | User input | Clarifying question: "What does the dashboard show by default for Admin vs Broker?" |
| R2 | User input | Clarifying question: "What can an Agent see on Screen 2 — all rows or only their own?" |
| R3 | User input | Clarifying question: "Does the Agent role have any access to Screen 3?" |
| R4 | User input | Clarifying question: "Which roles can access the Reset Demo button?" |
| R5 | User input | Clarifying question: "Are banking details visible to all roles?" — POPIA scope answer |
| R6 | BetterBond-Commission-Payments-POC-002.md | §Screen 1: Dashboard Screen — Dashboard Components |
| R7 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Payments Ready for Payment (Bar Chart)" |
| R8 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Parked Payments (Bar Chart)" |
| R9 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Total Value Ready for Payment" |
| R10 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Total Value of Parked Payments" |
| R11 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Components — "Parked Payments Aging Report" |
| R12 | User input | Clarifying question: "How is 'Total Value of Payments Made (Last 14 Days)' calculated?" |
| R13 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Grid (Agency Summary) |
| R14 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Grid — "Each record is clickable (button on row)" |
| R15 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Grid — "Selecting a record dynamically updates dashboard graphs" |
| R16 | User input | Clarifying question: "How does the Broker role interact with the Dashboard?" |
| R17 | BetterBond-Commission-Payments-POC-002.md | §Screen 2: Payment Management Screen — Main Grid |
| R18 | BetterBond-Commission-Payments-POC-002.md | §Main Grid — Columns list |
| R19 | BetterBond-Commission-Payments-POC-002.md | §Parked Grid |
| R20 | User input | Clarifying question: "Is the Search Bar client-side or server-side filtering?" |
| R21 | User input | Clarifying question: "How does grid pagination work?" |
| R22 | BetterBond-Commission-Payments-POC-002.md | §Bulk Parking — "Multi-select payments via checkboxes" |
| R23 | BetterBond-Commission-Payments-POC-002.md | §Single Payment Parking |
| R24 | BetterBond-Commission-Payments-POC-002.md | §Bulk Parking |
| R25 | BetterBond-Commission-Payments-POC-002.md | §Parking Payments — implied post-action behaviour |
| R26 | BetterBond-Commission-Payments-POC-002.md | §Parked Grid — Unpark individual or multiple |
| R27 | BetterBond-Commission-Payments-POC-002.md | §Parked Grid — "items return to the Main Grid" |
| R28 | User input | Clarifying question: "Does Initiate Payment call POST /v1/payment-batches?" |
| R29 | BetterBond-Commission-Payments-POC-002.md | §Initiate Payment — "Show modal that confirms the payment has been processed" |
| R30 | User input | Clarifying question: "What happens when Initiate Payment is clicked with zero payments?" |
| R31 | BetterBond-Commission-Payments-POC-002.md | §Screen 3: Payments Made Screen — Main Grid |
| R32 | BetterBond-Commission-Payments-POC-002.md | §Screen 3 — "Search bar for filtering by Agency Name or Batch ID" |
| R33 | BetterBond-Commission-Payments-POC-002.md | §Screen 3 — "Clickable invoice link to open/download invoice" |
| R34 | User input | Clarifying question: "What happens when a PDF download fails?" |
| R35 | User input | Clarifying question: "How is navigation between screens structured?" |
| R36 | User input | Clarifying question: "How does deep-linking and back-navigation work?" |
| R37 | User input | Clarifying question: "Which roles can access the Reset Demo button?" |
| R38 | User input | Clarifying question: "How are Park/Unpark errors shown to the user?" |
| R39 | User input | Clarifying question: "What happens when a PDF download fails?" |
| R40 | Api Definition.yaml | 401 responses on GET /v1/payments and GET /v1/payments/dashboard |
| R41 | Api Definition.yaml | 500 responses with DefaultResponse schema across all endpoints |
| R42 | User input | Clarifying question: "Is the Search Bar client-side or server-side filtering?" |
| R43 | intake-manifest.json | context.stylingNotes — "Light and dark mode support required" |
| R44 | intake-manifest.json | context.additionalAssets — "BetterBond / MortgageMax brand logo" |
| R45 | intake-manifest.json | context.stylingNotes — en-ZA locale currency formatting |
| R46 | intake-manifest.json | context.stylingNotes — South African real estate domain context |
| R47 | intake-manifest.json | artifacts.designTokensCss — Tailwind CSS 4 + Shadcn UI |
| R48 | User input | Clarifying question: "What responsive breakpoints are required?" |
| R49 | User input | Clarifying question: "Desktop, tablet, and mobile support required" |
| R50 | User input | Clarifying question: "Accessibility — defer WCAG compliance for POC" |
| R51 | User input | Clarifying question: "Grid pagination — client-side" |
| R52 | User input | Clarifying question: "Session expiry — silent token refresh" |
| R53 | intake-manifest.json | context.apiBaseUrl — "http://localhost:8042" |
| R54 | BetterBond-Commission-Payments-POC-002.md | Implied by interactive data grids and API integration |
| BR1 | User input | Clarifying question: "What payments appear in the Main Grid?" |
| BR2 | User input | Clarifying question: "What payments appear in the Parked Grid?" |
| BR3 | User input | Clarifying question: "What does Initiate Payment do — demo action or real API call?" |
| BR4 | User input | Clarifying question: "Initiate Payment button disabled when grid is empty" |
| BR5 | User input | Clarifying question: "Does Park/Unpark respect active search filters?" |
| BR6 | User input | Clarifying question: "Are there per-user restrictions for Park/Unpark within an agency?" |
| BR7 | User input | Clarifying question: "How is CommissionPct calculated?" |
| BR8 | User input | Clarifying question: "How is 'Total Value of Payments Made (Last 14 Days)' calculated?" |
| BR9 | BetterBond-Commission-Payments-POC-002.md | §Dashboard Grid — "navigates to Screen 2 for that specific agency" |
| BR10 | User input | Clarifying question: "How does deep-linking and back-navigation work?" |
| BR11 | BetterBond-Commission-Payments-POC-002.md | §Bulk Parking — checkboxes for multi-select |
| BR12 | BetterBond-Commission-Payments-POC-002.md | §Initiate Payment — confirmation modal |
| BR13 | BetterBond-Commission-Payments-POC-002.md | §Single Payment Parking and §Bulk Parking — confirmation modals |
| BR14 | BetterBond-Commission-Payments-POC-002.md | §Parked Grid — "Confirmation modal mirrors parking flow" |
| BR15 | BetterBond-Commission-Payments-POC-002.md | §Initiate Payment — invoice generated, success modal shown |
| CR1 | User input | Clarifying question: "Are banking details visible to all roles?" — POPIA minimum constraint |
| CR2 | intake-manifest.json | context.complianceNotes — POPIA flagged; full compliance deferred per user answer |
