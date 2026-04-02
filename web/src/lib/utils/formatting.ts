/**
 * ZAR Currency and Date Formatting Utilities
 *
 * Pure utility functions for formatting currency values as South African Rand
 * and dates in DD/MM/YYYY format. Used across all screens in the application.
 *
 * FRS: R45 (currency format), R46 (date format)
 */

const FALLBACK = '\u2014'; // em dash

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric value as South African Rand.
 *
 * Examples:
 * - 1234567.89 → "R 1 234 567,89"
 * - 0          → "R 0,00"
 * - null       → "—"
 *
 * @param value - The numeric amount, or null/undefined for fallback
 * @returns Formatted currency string or em dash fallback
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return FALLBACK;
  }

  return currencyFormatter.format(value);
}

/**
 * Formats an ISO date or date-time string as DD/MM/YYYY.
 *
 * Examples:
 * - "2026-03-15"            → "15/03/2026"
 * - "2026-03-15T14:30:00Z"  → "15/03/2026"
 * - null                    → "—"
 *
 * @param value - ISO date string, or null/undefined/empty for fallback
 * @returns Formatted date string or em dash fallback
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return FALLBACK;
  }

  // Extract only the date portion (YYYY-MM-DD) to avoid timezone shifts
  const datePart = value.substring(0, 10);
  const [year, month, day] = datePart.split('-');

  return `${day}/${month}/${year}`;
}
