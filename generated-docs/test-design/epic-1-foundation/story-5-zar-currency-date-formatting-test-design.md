# Test Design: ZAR Currency and Date Formatting Utilities

## Story Summary

**Epic:** 1
**Story:** 5
**As a** user viewing commission payment data
**I want** all currency values displayed as South African Rand (e.g., R 1 234 567,89) and all dates in DD/MM/YYYY format
**So that** the numbers and dates are familiar and easy to read.

## Review Purpose

This document presents concrete business examples for BA review before executable tests are written.

Its purpose is to:
- surface missing business decisions
- let the BA review behavior using examples and expected outcomes
- provide an approved source for downstream test generation

## Business Behaviors Identified

- A currency formatting function converts numeric amounts into South African Rand display format: "R" symbol, space as thousands separator, comma as decimal separator (e.g., R 1 234 567,89)
- Zero amounts display as "R 0,00" (not blank, not "R 0")
- Negative amounts display with a visible negative sign (e.g., "-R 500,50")
- A date formatting function converts ISO date strings (YYYY-MM-DD) into DD/MM/YYYY display format
- A date formatting function strips the time portion from ISO date-time strings (e.g., 2026-03-15T14:30:00Z becomes 15/03/2026)
- Null or undefined currency values produce a safe fallback rather than crashing
- Null or undefined date values produce a safe fallback rather than crashing
- These are pure utility functions with no UI component or route — they will be consumed by screen stories in Epics 2-4

## Key Decisions Surfaced by AI

1. **Negative currency format:** The acceptance criteria show two possible negative formats: "-R 500,50" or "R -500,50". The `Intl.NumberFormat` with `en-ZA` locale and `ZAR` currency will produce one specific format. The test will verify the output contains both the negative sign and the correctly formatted number, rather than mandating one exact placement. If the user has a preference, please specify it during review.

2. **Currency fallback for null/undefined:** AC-6 suggests either "R 0,00" or a dash as the fallback. The test design uses a dash ("—") as the fallback for null/undefined currency values, since displaying "R 0,00" could be misleading (it implies a zero payment rather than missing data). If the user prefers "R 0,00", this can be adjusted.

3. **Date fallback for null/undefined:** AC-7 suggests a dash or empty string. The test design uses a dash ("—") for consistency with the currency fallback. An empty string could confuse users into thinking data failed to load.

4. **Intl.NumberFormat symbol and spacing:** The `en-ZA` locale with `ZAR` currency may produce "R" or "ZAR" depending on the runtime. The implementation notes (R45) specify the output must match "R 1 234 567,89" format. Tests will verify the exact "R" symbol with a space after it, and the implementation may need to adjust `Intl` output if the runtime differs.

5. **Small decimal amounts:** Values like 0.50 should display as "R 0,50" (not "R ,50"). This is implicit in AC-2 but worth calling out.

## Test Scenarios / Review Examples

### 1. Standard currency amount with thousands

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `1234567.89` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 1 234 567,89` |

---

### 2. Zero currency amount

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `0` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 0,00` |

---

### 3. Negative currency amount

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `-500.50` |

| Expected | Value |
| --- | --- |
| Formatted output contains | Negative sign, `R`, `500,50` |
| Example | `-R 500,50` or `R -500,50` (either acceptable) |

---

### 4. Small currency amount (less than 1 000)

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `42.10` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 42,10` |

---

### 5. Currency amount with no decimal portion

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `1000` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 1 000,00` |

---

### 6. Very large currency amount

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `99999999.99` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 99 999 999,99` |

---

### 7. Null currency value returns fallback

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `null` |

| Expected | Value |
| --- | --- |
| Formatted output | `—` (dash) |

---

### 8. Undefined currency value returns fallback

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `undefined` |

| Expected | Value |
| --- | --- |
| Formatted output | `—` (dash) |

---

### 9. Standard date (ISO date string)

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `"2026-03-15"` |

| Expected | Value |
| --- | --- |
| Formatted output | `15/03/2026` |

---

### 10. Date-time string (time portion stripped)

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `"2026-03-15T14:30:00Z"` |

| Expected | Value |
| --- | --- |
| Formatted output | `15/03/2026` |

---

### 11. End-of-year date

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `"2026-12-31"` |

| Expected | Value |
| --- | --- |
| Formatted output | `31/12/2026` |

---

### 12. Single-digit day and month (zero-padded)

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `"2026-01-05"` |

| Expected | Value |
| --- | --- |
| Formatted output | `05/01/2026` |

---

### 13. Null date value returns fallback

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `null` |

| Expected | Value |
| --- | --- |
| Formatted output | `—` (dash) |

---

### 14. Undefined date value returns fallback

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `undefined` |

| Expected | Value |
| --- | --- |
| Formatted output | `—` (dash) |

---

## Edge and Alternate Examples

### 15. Currency with very small decimal (rounding)

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `1234.999` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 1 235,00` (rounded to 2 decimal places) |

---

### 16. Currency with single decimal digit input

| Setup | Value |
| --- | --- |
| Function | `formatCurrency` |

| Input | Value |
| --- | --- |
| Amount | `50.5` |

| Expected | Value |
| --- | --- |
| Formatted output | `R 50,50` (always 2 decimal places) |

---

### 17. Empty string date

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `""` (empty string) |

| Expected | Value |
| --- | --- |
| Formatted output | `—` (dash fallback) |

---

### 18. Date-time with timezone offset

| Setup | Value |
| --- | --- |
| Function | `formatDate` |

| Input | Value |
| --- | --- |
| Date | `"2026-03-15T14:30:00+02:00"` |

| Expected | Value |
| --- | --- |
| Formatted output | `15/03/2026` (date portion only, time and timezone stripped) |

---

## Out of Scope

- Visual rendering of formatted values in UI components (covered by screen stories in Epics 2-4)
- Locale switching or multi-currency support (R45 specifies ZAR only)
- Date/time display with time portion (only date formatting is required)
- Server-side formatting (these are client-side utility functions)
- Integration testing with actual API response data (covered by screen stories)

## Coverage for WRITE-TESTS

| Acceptance Criteria | Covered By Examples |
| --- | --- |
| AC-1: R 1 234 567,89 format | #1 (standard), #5 (whole number), #6 (large number) |
| AC-2: Zero displays as R 0,00 | #2 |
| AC-3: Negative amounts show negative sign | #3 |
| AC-4: Date as DD/MM/YYYY | #9, #11, #12 |
| AC-5: Date-time shows only date portion | #10, #18 |
| AC-6: Null/undefined currency fallback | #7, #8 |
| AC-7: Null/undefined date fallback | #13, #14, #17 |

## Handoff Notes for WRITE-TESTS

1. **File location:** Tests should target `lib/utils/formatting.ts` (new file). The existing `lib/utils.ts` contains `cn()` helper and should not be modified.
2. **Pure function tests:** All scenarios are unit tests of pure functions — no React component rendering, no mocking, no async behavior needed.
3. **Test file location:** `web/src/lib/utils/__tests__/formatting.test.ts` (co-located with source).
4. **Export shape:** Expect two named exports: `formatCurrency(value: number | null | undefined): string` and `formatDate(value: string | null | undefined): string`.
5. **Negative format flexibility:** Scenario #3 should assert that the output contains a negative sign and the formatted number parts, rather than matching one exact string — the `Intl` API may produce either "-R 500,50" or "R -500,50".
6. **Rounding behavior:** Scenario #15 tests that 3+ decimal digits are rounded to 2 places. Use `Intl.NumberFormat` default rounding.
7. **FRS references:** R45 (currency format), R46 (date format). These are the authoritative requirements — not any template code that may exist.
