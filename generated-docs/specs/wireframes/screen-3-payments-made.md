# Screen: Payments Made

## Purpose

Historical view of processed payment batches with the ability to search, view details, and download invoice PDFs.

## Wireframe

```
+------+-------------------------------------------------------+
| SIDE |  Logo   BetterBond Commission Payments   [Light/Dark] |
| BAR  |--------------------------------------------------------|
|      |                                                        |
| Dash |  Payments Made                                         |
| board|  ───────────────────────────────────────────────────── |
|      |                                                        |
| Pay- |  [Search by Agency Name or Batch ID..._______________] |
| ment |                                                        |
| Mgmt |  Payment Batches                                       |
|      |  ───────────────────────────────────────────────────── |
| Pay- |  | Agency Name  | # Payments | Commission   | VAT    ||
| ments|  |              |            | Amount       |        ||
| Made |  |──────────────|────────────|──────────────|────────||
| *    |  | Agency One   | 15         | R 450 000,00 | R 67.5k||
|      |  |              |            |              |[Invoice]||
|      |  |──────────────|────────────|──────────────|────────||
|      |  | Agency Two   | 8          | R 200 000,00 | R 30.0k||
|      |  |              |            |              |[Invoice]||
|      |  |──────────────|────────────|──────────────|────────||
|      |  | Agency Three | 22         | R 678 900,00 | R101.8k||
|      |  |              |            |              |[Invoice]||
|      |  |──────────────|────────────|──────────────|────────||
|      |  |              Page 1 of 2  [< Prev] [Next >]       ||
|      |                                                        |
+------+-------------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Search Bar | Input | Client-side filter by Agency Name or Batch ID |
| Payment Batches Grid | Data Table | Columns: Agency Name, Number of Payments, Total Commission Amount, VAT, Invoice Link |
| Invoice Link | Button | Per-row button that downloads the batch invoice PDF |
| Pagination | Controls | Client-side page navigation |

## User Actions

- **Search:** Types in search bar to filter batches client-side by Agency Name or Batch ID.
- **Download Invoice:** Clicks Invoice link, triggers POST /v1/payment-batches/{Id}/download-invoice-pdf. Browser downloads the PDF.
- **Invoice download fails:** Toast notification appears with error message from the API response.

## Navigation

- **From:** Sidebar link, or after successful Initiate Payment on Screen 2
- **To:** Dashboard (sidebar), Payment Management (sidebar)

## Access Control

- **Admin and Broker:** Full access to view batches and download invoices.
- **Agent:** No access. Navigating to this route redirects to Dashboard or "Not Authorized" page (per R3).
