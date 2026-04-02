# Wireframes: BetterBond Commission Payments POC

## Summary

Three-screen commission payment management application for BetterBond. Provides dashboard metrics, operational payment management with park/unpark workflows, and historical payment batch records with invoice downloads.

## Screens

| # | Screen | Description | File |
|---|--------|-------------|------|
| 1 | Dashboard | At-a-glance commission metrics with charts, summary cards, and agency grid | `screen-1-dashboard.md` |
| 2 | Payment Management | Operational hub for viewing, parking/unparking, and initiating payments | `screen-2-payment-management.md` |
| 3 | Payments Made | Historical processed payment batches with invoice download | `screen-3-payments-made.md` |

## Screen Flow

```
[Dashboard] --click agency row--> [Payment Management (?agencyId=N)]
[Payment Management] --initiate payment success--> [Payments Made]
[Any Screen] --sidebar nav--> [Any Screen]
```

## Design Notes

- Persistent sidebar navigation with BetterBond logo
- Light/dark mode toggle in header
- All grids use client-side pagination and filtering
- Currency formatted as en-ZA locale (R 1 234 567,89)
- Responsive: desktop 1280px+, tablet 768-1279px, mobile <768px
- Role-based visibility controls (Admin/Broker/Agent)
