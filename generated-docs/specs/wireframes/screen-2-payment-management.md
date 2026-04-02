# Screen: Payment Management

## Purpose

Operational hub for viewing, parking, unparking, and initiating commission payments for a specific agency.

## Wireframe

```
+------+-------------------------------------------------------+
| SIDE |  Logo   BetterBond Commission Payments   [Light/Dark] |
| BAR  |--------------------------------------------------------|
|      |                                                        |
| Dash |  Payment Management — Agency One                       |
| board|  ───────────────────────────────────────────────────── |
|      |                                                        |
| Pay- |  [Search...________________________] [Initiate Payment]|
| ment |                                                        |
| Mgmt |  Main Grid                                             |
| *    |  ───────────────────────────────────────────────────── |
|      |  |[ ]| Agency  | Batch| Claim  | Agent      | Bond   ||
| Pay- |  |   | Name    | ID   | Date   | Name       | Amount ||
| ments|  |   |         |      |        |            |        ||
| Made |  | Comm Type | Comm% | Grant  | Reg Date | Bank     ||
|      |  | Comm Amt  | VAT   | Status | Actions              ||
|      |  |───|────────|──────|────────|────────────|─────────||
|      |  |[x]| Ag One | 101  | 15/03  | John Smith | R 1.2M  ||
|      |  |   | Bond C | 2,5% | 01/02  | 15/02    | ABSA     ||
|      |  |   | R30k   | R4.5k| READY  | [Park]             ||
|      |  |───|────────|──────|────────|────────────|─────────||
|      |  |[ ]| Ag One | 102  | 16/03  | Jane Doe   | R 800k  ||
|      |  |   | Manual | 3,1% | 05/02  | 20/02    | FNB      ||
|      |  |   | R25k   | R3.7k| READY  | [Park]             ||
|      |  |───|────────|──────|────────|────────────|─────────||
|      |  |              Page 1 of 3  [< Prev] [Next >]       ||
|      |  [Park Selected (2)]                                  |
|      |                                                        |
|      |  Parked Grid                                           |
|      |  ───────────────────────────────────────────────────── |
|      |  |[ ]| Agency  | Batch| Claim  | Agent      | Bond   ||
|      |  |   | Name    | ID   | Date   | Name       | Amount ||
|      |  |   | (same columns as Main Grid)                    ||
|      |  |───|────────|──────|────────|────────────|─────────||
|      |  |[x]| Ag One | 103  | 10/03  | Bob Lee    | R 500k  ||
|      |  |   | Bond C | 2,0% | 28/01  | 10/02    | STD      ||
|      |  |   | R10k   | R1.5k| PARKED | [Unpark]           ||
|      |  |───|────────|──────|────────|────────────|─────────||
|      |  |              Page 1 of 1  [< Prev] [Next >]       ||
|      |  [Unpark Selected (1)]                                |
|      |                                                        |
+------+-------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Search Bar | Input | Client-side filter by Claim Date, Agency Name, Status |
| Initiate Payment | Button | Opens confirmation modal to process all visible Main Grid payments. Disabled when grid is empty. |
| Main Grid | Data Table | Payments where Status != PROCESSED. Columns: Agency Name, Batch ID, Claim Date, Agent Name & Surname, Bond Amount, Commission Type, Commission % (computed), Grant Date, Reg Date, Bank, Commission Amount, VAT, Status, Actions |
| Row Checkbox | Checkbox | Multi-select for bulk park/unpark |
| Park Button | Button | Per-row action to park a single payment (opens confirmation modal) |
| Park Selected | Button | Bulk park all checked rows (opens confirmation modal) |
| Parked Grid | Data Table | Payments where Status = PARKED. Same columns as Main Grid. |
| Unpark Button | Button | Per-row action to unpark a single payment (opens confirmation modal) |
| Unpark Selected | Button | Bulk unpark all checked rows (opens confirmation modal) |
| Pagination | Controls | Client-side page navigation for both grids |

## Modals

### Park Confirmation (Single)
```
+----------------------------------+
| Park Payment                     |
|                                  |
| Agent: John Smith                |
| Claim Date: 15/03/2026          |
| Amount: R 30 000,00             |
|                                  |
| [Cancel]          [Confirm Park] |
+----------------------------------+
```

### Park Confirmation (Bulk)
```
+----------------------------------+
| Park Payments                    |
|                                  |
| 2 payments selected              |
| Total: R 55 000,00              |
|                                  |
| [Cancel]          [Confirm Park] |
+----------------------------------+
```

### Unpark Confirmation (mirrors Park)
```
+----------------------------------+
| Unpark Payment(s)                |
|                                  |
| (same detail layout as Park)    |
|                                  |
| [Cancel]        [Confirm Unpark] |
+----------------------------------+
```

### Initiate Payment Confirmation
```
+----------------------------------+
| Initiate Payment                 |
|                                  |
| 15 payments will be processed    |
| Total: R 450 000,00             |
|                                  |
| [Cancel]    [Confirm Payment]    |
+----------------------------------+
```

### Payment Success
```
+----------------------------------+
| Payment Processed                |
|                                  |
| 15 payments have been processed  |
| successfully. Invoice available  |
| on the Payments Made screen.     |
|                                  |
|              [OK]                |
+----------------------------------+
```

## User Actions

- **Search:** Types in search bar to filter both grids client-side by Claim Date, Agency Name, or Status.
- **Park (single):** Clicks per-row Park button, confirms in modal, payment moves from Main Grid to Parked Grid.
- **Park (bulk):** Selects multiple checkboxes, clicks Park Selected, confirms in modal.
- **Unpark (single/bulk):** Mirrors park flow, payments move from Parked Grid to Main Grid.
- **Initiate Payment:** Clicks button, confirms in modal, all visible Main Grid payments become PROCESSED and are removed.
- **Select row checkbox:** Enables bulk Park Selected / Unpark Selected buttons.

## Navigation

- **From:** Dashboard (agency row click with ?agencyId=N), Sidebar link
- **To:** Dashboard (sidebar), Payments Made (sidebar or after successful initiate payment)
