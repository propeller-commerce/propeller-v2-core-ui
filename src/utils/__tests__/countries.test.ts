import { describe, it, expect } from 'vitest';
import { getCountryName, COUNTRIES, type Country } from '../countries';

describe('COUNTRIES', () => {
  it('is a non-empty list', () => {
    expect(Array.isArray(COUNTRIES)).toBe(true);
    expect(COUNTRIES.length).toBeGreaterThan(0);
  });

  it('every entry has a code and a name', () => {
    for (const c of COUNTRIES) {
      expect(typeof c.code).toBe('string');
      expect(c.code.length).toBeGreaterThan(0);
      expect(typeof c.name).toBe('string');
      expect(c.name.length).toBeGreaterThan(0);
    }
  });

  it('includes the Netherlands (the default storefront locale)', () => {
    expect(COUNTRIES.some((c) => c.code === 'NL')).toBe(true);
  });
});

describe('getCountryName', () => {
  it('resolves a known code to its name from the default list', () => {
    expect(getCountryName('NL')).toBe('Netherlands');
  });

  it('returns an empty string for null or undefined', () => {
    expect(getCountryName(null)).toBe('');
    expect(getCountryName(undefined)).toBe('');
    expect(getCountryName('')).toBe('');
  });

  it('falls back to the code itself when the code is unknown', () => {
    expect(getCountryName('ZZ')).toBe('ZZ');
  });

  it('uses a caller-supplied list when one is provided', () => {
    const custom: Country[] = [{ code: 'XX', name: 'Examplestan' }];
    expect(getCountryName('XX', custom)).toBe('Examplestan');
  });

  it('falls back to the default list when the supplied list is empty', () => {
    expect(getCountryName('NL', [])).toBe('Netherlands');
  });

  it('falls back to the default list when the supplied list is null', () => {
    expect(getCountryName('NL', null)).toBe('Netherlands');
  });

  it('returns the code when it is absent from a non-empty custom list', () => {
    const custom: Country[] = [{ code: 'XX', name: 'Examplestan' }];
    expect(getCountryName('NL', custom)).toBe('NL');
  });
});
