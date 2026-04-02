/**
 * Story 5: ZAR Currency and Date Formatting Utilities
 *
 * Tests verify that:
 * - Currency values are formatted as South African Rand (R 1 234 567,89)
 * - Zero amounts display as "R 0,00"
 * - Negative amounts clearly show the negative sign
 * - Dates are formatted as DD/MM/YYYY
 * - Date-time strings strip the time portion
 * - Null/undefined values return a safe fallback (em dash)
 *
 * FRS references: R45 (currency format), R46 (date format)
 */

import { formatCurrency, formatDate } from '@/lib/utils/formatting';

// ─── Currency Formatting ────────────────────────────────────────────────────

describe('formatCurrency', () => {
  // AC-1: Standard amount with thousands separator
  it('formats 1234567.89 as "R 1 234 567,89"', () => {
    expect(formatCurrency(1234567.89)).toBe('R\u00a01\u00a0234\u00a0567,89');
  });

  // AC-2: Zero displays as R 0,00
  it('formats 0 as "R 0,00"', () => {
    expect(formatCurrency(0)).toBe('R\u00a00,00');
  });

  // AC-3: Negative amounts show negative sign
  it('formats -500.50 with a negative sign and correct number parts', () => {
    const result = formatCurrency(-500.5);
    expect(result).toContain('R');
    expect(result).toContain('500,50');
    expect(result).toMatch(/-/);
  });

  // Scenario 4: Small amount (less than 1 000)
  it('formats 42.10 as "R 42,10"', () => {
    expect(formatCurrency(42.1)).toBe('R\u00a042,10');
  });

  // Scenario 5: Whole number gets ,00 decimal
  it('formats 1000 as "R 1 000,00"', () => {
    expect(formatCurrency(1000)).toBe('R\u00a01\u00a0000,00');
  });

  // Scenario 6: Very large amount
  it('formats 99999999.99 as "R 99 999 999,99"', () => {
    expect(formatCurrency(99999999.99)).toBe('R\u00a099\u00a0999\u00a0999,99');
  });

  // AC-6: Null returns fallback dash
  it('returns "—" for null', () => {
    expect(formatCurrency(null)).toBe('—');
  });

  // AC-6: Undefined returns fallback dash
  it('returns "—" for undefined', () => {
    expect(formatCurrency(undefined)).toBe('—');
  });

  // Scenario 15: Rounding to 2 decimal places
  it('rounds 1234.999 to "R 1 235,00"', () => {
    expect(formatCurrency(1234.999)).toBe('R\u00a01\u00a0235,00');
  });

  // Scenario 16: Single decimal digit padded to 2
  it('formats 50.5 as "R 50,50"', () => {
    expect(formatCurrency(50.5)).toBe('R\u00a050,50');
  });
});

// ─── Date Formatting ────────────────────────────────────────────────────────

describe('formatDate', () => {
  // AC-4: Standard ISO date
  it('formats "2026-03-15" as "15/03/2026"', () => {
    expect(formatDate('2026-03-15')).toBe('15/03/2026');
  });

  // AC-5: Date-time string strips time portion
  it('formats "2026-03-15T14:30:00Z" as "15/03/2026"', () => {
    expect(formatDate('2026-03-15T14:30:00Z')).toBe('15/03/2026');
  });

  // Scenario 11: End-of-year date
  it('formats "2026-12-31" as "31/12/2026"', () => {
    expect(formatDate('2026-12-31')).toBe('31/12/2026');
  });

  // Scenario 12: Single-digit day and month are zero-padded
  it('formats "2026-01-05" as "05/01/2026"', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });

  // AC-7: Null returns fallback dash
  it('returns "—" for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  // AC-7: Undefined returns fallback dash
  it('returns "—" for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  // Scenario 17: Empty string returns fallback dash
  it('returns "—" for empty string', () => {
    expect(formatDate('')).toBe('—');
  });

  // Scenario 18: Date-time with timezone offset strips time and timezone
  it('formats "2026-03-15T14:30:00+02:00" as "15/03/2026"', () => {
    expect(formatDate('2026-03-15T14:30:00+02:00')).toBe('15/03/2026');
  });
});
