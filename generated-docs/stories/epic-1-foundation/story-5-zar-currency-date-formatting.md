# Story: ZAR Currency and Date Formatting Utilities

**Epic:** Foundation — Auth, Layout, and API Client | **Story:** 5 of 6 | **Wireframe:** N/A

**Role:** N/A

## Story Metadata
| Field | Value |
|-------|-------|
| **Route** | N/A (utility functions, no dedicated page) |
| **Target File** | `lib/utils/formatting.ts` (new) |
| **Page Action** | `create_new` |

## User Story
**As a** user viewing commission payment data **I want** all currency values displayed as South African Rand (e.g., R 1 234 567,89) and all dates in DD/MM/YYYY format **So that** the numbers and dates are familiar and easy to read.

## Acceptance Criteria

### Happy Path — Currency
- [ ] AC-1: Given a commission amount of 1234567.89, when it is displayed on any screen, then I see it formatted as "R 1 234 567,89" (space as thousands separator, comma as decimal separator).
- [ ] AC-2: Given a commission amount of 0, when it is displayed, then I see "R 0,00".
- [ ] AC-3: Given a negative value (e.g., -500.50), when it is displayed, then the negative sign is clearly shown (e.g., "-R 500,50" or "R -500,50").

### Happy Path — Dates
- [ ] AC-4: Given a date value of 2026-03-15, when it is displayed on any screen, then I see it formatted as "15/03/2026" (DD/MM/YYYY).
- [ ] AC-5: Given a date-time value like 2026-03-15T14:30:00Z, when it is displayed as a date, then only the date portion is shown as "15/03/2026".

### Edge Cases
- [ ] AC-6: Given a null or undefined currency value, when the formatter is called, then it returns a safe fallback (e.g., "R 0,00" or a dash) rather than crashing.
- [ ] AC-7: Given a null or undefined date value, when the formatter is called, then it returns a safe fallback (e.g., a dash or empty string) rather than crashing.

## API Endpoints (from OpenAPI spec)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| N/A | N/A | No API calls — pure utility functions |

## Implementation Notes
- Use the JavaScript `Intl.NumberFormat` with locale `en-ZA` and currency `ZAR` for currency formatting (R45). Verify the output matches the expected format "R 1 234 567,89" — adjust if the locale produces a different symbol or spacing.
- Use `Intl.DateTimeFormat` with locale `en-ZA` or manual formatting for DD/MM/YYYY dates (R46).
- These utilities will be imported by all screen stories (Epics 2-4) wherever amounts or dates appear.
- Deferred manual verification: these are component-only utilities with no route. They will be visually verified when screen stories (Dashboard, Payment Management, Payments Made) render formatted data.
- The `lib/utils.ts` file already exists with a `cn()` helper. Create a separate `formatting.ts` file in `lib/utils/` for these formatters to keep concerns separated.
