import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, calcDiscountPercent } from '../formatting';

describe('formatPrice', () => {
  it('returns an empty string for null or undefined', () => {
    expect(formatPrice(null)).toBe('');
    expect(formatPrice(undefined)).toBe('');
  });

  it('with an explicit symbol, prefixes it (space-separated) and formats the amount in the locale', () => {
    // Default locale is nl-NL → comma decimal, e.g. "€ 9,50".
    expect(formatPrice(9.5, { symbol: '€' })).toBe('€ 9,50');
    expect(formatPrice(1000, { symbol: '$' })).toBe('$ 1.000,00');
    expect(formatPrice(0, { symbol: '€' })).toBe('€ 0,00');
    // An explicit locale controls the number format.
    expect(formatPrice(9.5, { symbol: '€', locale: 'en-US' })).toBe('€ 9.50');
  });

  it('with an explicit symbol, rounds to 2 decimals', () => {
    expect(formatPrice(9.005, { symbol: '€' })).toBe('€ 9,01');
    expect(formatPrice(9.004, { symbol: '€' })).toBe('€ 9,00');
  });

  it('handles negative amounts with a symbol', () => {
    expect(formatPrice(-5, { symbol: '€' })).toBe('€ -5,00');
  });

  it('without a symbol, uses Intl currency formatting (contains the amount digits)', () => {
    const out = formatPrice(1234.5, { currency: 'EUR', locale: 'en-US' });
    expect(out).toMatch(/1[,.]?234[.,]50/);
    expect(out).not.toBe('');
  });

  it('the symbol branch overrides the currency symbol; locale still drives the number', () => {
    expect(formatPrice(10, { symbol: '£', currency: 'EUR', locale: 'en-US' })).toBe('£ 10.00');
  });

  it('treats an empty-string symbol as a provided symbol (no prefix, locale-formatted number)', () => {
    expect(formatPrice(10, { symbol: '' })).toBe('10,00');
  });

  it('falls back to a plain €-prefixed string when Intl rejects the currency code', () => {
    expect(formatPrice(12.5, { currency: 'NOT_A_CURRENCY' })).toBe('€12.50');
  });
});

describe('formatDate', () => {
  it('returns an empty string for falsy input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('returns an empty string for an unparseable date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('formats a valid ISO date string to a non-empty localised string', () => {
    const out = formatDate('2026-05-21', { locale: 'en-US' });
    expect(out).not.toBe('');
    expect(out).toMatch(/2026/);
  });

  it('accepts a Date object', () => {
    const out = formatDate(new Date('2026-05-21T00:00:00Z'), { locale: 'en-US' });
    expect(out).toMatch(/2026/);
  });

  it('returns an empty string for an invalid Date object', () => {
    expect(formatDate(new Date('invalid'))).toBe('');
  });
});

describe('calcDiscountPercent', () => {
  it('returns 0 when the original price is missing or zero', () => {
    expect(calcDiscountPercent(0, 5)).toBe(0);
    expect(calcDiscountPercent(null, 5)).toBe(0);
    expect(calcDiscountPercent(undefined, 5)).toBe(0);
  });

  it('returns 0 when the discounted price is missing', () => {
    expect(calcDiscountPercent(100, null)).toBe(0);
    expect(calcDiscountPercent(100, undefined)).toBe(0);
  });

  it('computes a straightforward percentage discount', () => {
    expect(calcDiscountPercent(100, 75)).toBe(25);
    expect(calcDiscountPercent(200, 150)).toBe(25);
    expect(calcDiscountPercent(100, 0)).toBe(100);
  });

  it('rounds to the nearest whole percent', () => {
    expect(calcDiscountPercent(100, 66.67)).toBe(33);
    expect(calcDiscountPercent(100, 66.66)).toBe(33);
    expect(calcDiscountPercent(3, 2)).toBe(33);
  });

  it('returns a negative percentage when the "discounted" price is higher', () => {
    expect(calcDiscountPercent(100, 120)).toBe(-20);
  });

  it('returns 0 when both prices are equal', () => {
    expect(calcDiscountPercent(100, 100)).toBe(0);
  });
});
