# Screen: Dashboard

## Purpose

At-a-glance summary of commission payment activity across agencies, with interactive charts and an agency summary grid that links to Payment Management.

## Wireframe

```
+------+-------------------------------------------------------+
| SIDE |  Logo   BetterBond Commission Payments   [Light/Dark] |
| BAR  |--------------------------------------------------------|
|      |                                                        |
| Dash |  Dashboard                                             |
| board|  ───────────────────────────────────────────────────── |
| *    |                                                        |
|      |  +-------------------+  +-------------------+          |
| Pay- |  | Payments Ready    |  | Parked Payments   |          |
| ment |  | for Payment       |  |                   |          |
| Mgmt |  | ┌──┐ ┌──┐        |  | ┌──┐ ┌──┐        |          |
|      |  | │BC│ │MP│ (bars)  |  | │BC│ │MP│ (bars)  |          |
| Pay- |  | └──┘ └──┘        |  | └──┘ └──┘        |          |
| ments|  +-------------------+  +-------------------+          |
| Made |                                                        |
|      |  +-------------------+  +-------------------+          |
|      |  | Total Value Ready |  | Total Value       |          |
| [Re- |  | for Payment       |  | Parked            |          |
| set  |  | R 1 234 567,89    |  | R 456 789,12      |          |
| Demo]|  +-------------------+  +-------------------+          |
| (Adm |                                                        |
| only)|  +-------------------+  +-------------------+          |
|      |  | Parked Payments   |  | Payments Made     |          |
|      |  | Aging Report      |  | (Last 14 Days)    |          |
|      |  | 1-3d | 4-7d | >7d|  | R 2 345 678,90    |          |
|      |  | ███  | ██   | █  |  |                   |          |
|      |  +-------------------+  +-------------------+          |
|      |                                                        |
|      |  Agency Summary                                        |
|      |  ───────────────────────────────────────────────────── |
|      |  | Agency Name  | # Payments | Commission   | VAT    | |
|      |  |──────────────|────────────|──────────────|────────| |
|      |  | Agency One   | 12         | R 123 456,78 | R 1 2..| |
|      |  | Agency Two   | 8          | R  89 012,34 | R   8..| |
|      |  | [View >>]    |            |              |        | |
|      |  |──────────────|────────────|──────────────|────────| |
|      |  |                    Page 1 of 2  [< Prev] [Next >]| |
|      |                                                        |
+------+-------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Sidebar Nav | Navigation | Persistent sidebar with links to Dashboard, Payment Management, Payments Made |
| BetterBond Logo | Image | Brand logo in sidebar header |
| Light/Dark Toggle | Button | Switches between light and dark mode themes |
| Payments Ready Chart | Bar Chart | Count of non-PROCESSED payments split by CommissionType (Bond Comm / Manual Payments) |
| Parked Payments Chart | Bar Chart | Count of PARKED payments split by CommissionType |
| Total Value Ready | Metric Card | Sum of CommissionAmount where Status != PROCESSED and != PARKED |
| Total Value Parked | Metric Card | Sum of CommissionAmount where Status = PARKED |
| Aging Report Chart | Bar Chart | Parked payment counts grouped by 1-3 days, 4-7 days, >7 days |
| Payments Made (14d) | Metric Card | Frontend-computed sum of PROCESSED payments within last 14 days |
| Agency Summary Grid | Data Table | One row per agency with payment count, total commission, VAT |
| View Button | Button | Per-row button navigating to Payment Management for that agency |
| Reset Demo | Button | Admin-only button to reset demo data (POST /demo/reset-demo) |

## User Actions

- **Click agency row / View button:** Navigates to Payment Management filtered by agencyId (e.g., /payments?agencyId=5). Charts update to show that agency's metrics.
- **Click agency (Admin, already selected):** Deselects agency, charts return to all-agency view.
- **Toggle light/dark mode:** Switches theme, preference persisted.
- **Click Reset Demo (Admin only):** Calls POST /demo/reset-demo, refreshes all data on success.

## Navigation

- **From:** Sidebar link, or initial landing page
- **To:** Payment Management (via agency row click), Payments Made (via sidebar)
