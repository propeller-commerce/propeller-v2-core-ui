import { describe, it, expect } from 'vitest';
import {
  resolveLanguageEntry,
  getLanguageString,
  getLanguageUri,
} from '../languageResolver';

const NAMES = [
  { language: 'NL', value: 'Boormachine' },
  { language: 'EN', value: 'Drill' },
  { language: 'DE', value: 'Bohrmaschine' },
];

describe('resolveLanguageEntry', () => {
  it('finds the entry matching the requested language', () => {
    expect(resolveLanguageEntry(NAMES, 'EN')?.value).toBe('Drill');
  });

  it('matches case-insensitively', () => {
    expect(resolveLanguageEntry(NAMES, 'en')?.value).toBe('Drill');
    expect(resolveLanguageEntry(NAMES, 'nL')?.value).toBe('Boormachine');
  });

  it('falls back to the first entry when the language is not present', () => {
    expect(resolveLanguageEntry(NAMES, 'FR')?.value).toBe('Boormachine');
  });

  it('returns undefined for a null, undefined, or empty list', () => {
    expect(resolveLanguageEntry(null, 'EN')).toBeUndefined();
    expect(resolveLanguageEntry(undefined, 'EN')).toBeUndefined();
    expect(resolveLanguageEntry([], 'EN')).toBeUndefined();
  });
});

describe('getLanguageString', () => {
  it('returns the value for the matching language', () => {
    expect(getLanguageString(NAMES, 'DE')).toBe('Bohrmaschine');
  });

  it('falls back to the first entry when the language is missing', () => {
    expect(getLanguageString(NAMES, 'FR')).toBe('Boormachine');
  });

  it('returns the fallback for a null, undefined, or empty list', () => {
    expect(getLanguageString(null, 'EN', 'n/a')).toBe('n/a');
    expect(getLanguageString([], 'EN', 'n/a')).toBe('n/a');
  });

  it('returns an empty string as the default fallback', () => {
    expect(getLanguageString(null, 'EN')).toBe('');
  });

  it('returns the fallback when the matched entry has no value', () => {
    const entries = [{ language: 'EN' }];
    expect(getLanguageString(entries, 'EN', 'missing')).toBe('missing');
  });
});

describe('getLanguageUri', () => {
  const docs = [
    { language: 'NL', uri: '/nl/manual.pdf' },
    { language: 'EN', uri: '/en/manual.pdf' },
  ];

  it('returns the uri for the matching language', () => {
    expect(getLanguageUri(docs, 'EN')).toBe('/en/manual.pdf');
  });

  it('falls back to the first entry when the language is missing', () => {
    expect(getLanguageUri(docs, 'FR')).toBe('/nl/manual.pdf');
  });

  it('returns the fallback for a null or empty list', () => {
    expect(getLanguageUri(null, 'EN', 'none')).toBe('none');
    expect(getLanguageUri([], 'EN', 'none')).toBe('none');
  });

  it('returns the fallback when the matched entry has no uri', () => {
    expect(getLanguageUri([{ language: 'EN' }], 'EN', 'none')).toBe('none');
  });
});
