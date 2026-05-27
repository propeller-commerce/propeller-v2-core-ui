import { describe, it, expect } from 'vitest';
import { stripHtml, shouldTruncate, truncateAt } from '../truncation';

describe('stripHtml', () => {
  it('removes simple tags, keeping the text content', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('removes nested and multiple tags', () => {
    expect(stripHtml('<div><strong>Bold</strong> and <em>italic</em></div>')).toBe(
      'Bold and italic'
    );
  });

  it('removes tags with attributes', () => {
    expect(stripHtml('<a href="http://x.com" class="link">link</a>')).toBe('link');
  });

  it('removes self-closing and void tags', () => {
    expect(stripHtml('line one<br/>line two')).toBe('line oneline two');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('no tags here')).toBe('no tags here');
  });

  it('returns an empty string for an empty input', () => {
    expect(stripHtml('')).toBe('');
  });
});

describe('shouldTruncate', () => {
  it('returns true when the plain-text length exceeds maxLength', () => {
    expect(shouldTruncate('<p>abcdefghij</p>', 5)).toBe(true);
  });

  it('returns false when the plain-text length is within maxLength', () => {
    expect(shouldTruncate('<p>abc</p>', 5)).toBe(false);
  });

  it('returns false when length exactly equals maxLength (strictly greater required)', () => {
    expect(shouldTruncate('abcde', 5)).toBe(false);
  });

  it('measures the stripped text, not the raw HTML length', () => {
    expect(shouldTruncate('<div class="very-long-attribute-here">abc</div>', 5)).toBe(false);
  });

  it('returns false for a zero or negative maxLength', () => {
    expect(shouldTruncate('any text at all', 0)).toBe(false);
    expect(shouldTruncate('any text at all', -1)).toBe(false);
  });
});

describe('truncateAt', () => {
  it('returns the original HTML unchanged when text is within maxLength', () => {
    const html = '<p>short</p>';
    expect(truncateAt(html, 100)).toBe(html);
  });

  it('returns the original HTML unchanged for a zero or negative maxLength', () => {
    const html = '<p>anything</p>';
    expect(truncateAt(html, 0)).toBe(html);
    expect(truncateAt(html, -5)).toBe(html);
  });

  it('truncates at the last word boundary before maxLength and appends an ellipsis', () => {
    const out = truncateAt('the quick brown fox', 12);
    expect(out).toBe('the quick…');
  });

  it('strips HTML before truncating', () => {
    const out = truncateAt('<p>the quick brown fox</p>', 12);
    expect(out).toBe('the quick…');
  });

  it('hard-cuts (no word boundary) when there is no space before maxLength', () => {
    const out = truncateAt('supercalifragilistic', 5);
    expect(out).toBe('super…');
  });

  it('appends only an ellipsis worth of extra length', () => {
    const out = truncateAt('aaaa bbbb cccc dddd', 10);
    expect(out.endsWith('…')).toBe(true);
  });
});
