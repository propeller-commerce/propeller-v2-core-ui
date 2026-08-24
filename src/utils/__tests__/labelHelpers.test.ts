import { describe, it, expect } from 'vitest';
import { getLabel } from '../labelHelpers';

describe('getLabel', () => {
  it('returns the label value when the key is present', () => {
    expect(getLabel({ addToCart: 'Add to basket' }, 'addToCart', 'Add to cart')).toBe(
      'Add to basket'
    );
  });

  it('returns the fallback when the key is missing', () => {
    expect(getLabel({ other: 'x' }, 'addToCart', 'Add to cart')).toBe('Add to cart');
  });

  it('returns the fallback when the labels object is null or undefined', () => {
    expect(getLabel(null, 'addToCart', 'Add to cart')).toBe('Add to cart');
    expect(getLabel(undefined, 'addToCart', 'Add to cart')).toBe('Add to cart');
  });

  it('returns the fallback when the key maps to an empty string', () => {
    expect(getLabel({ addToCart: '' }, 'addToCart', 'Add to cart')).toBe('Add to cart');
  });

  it('returns the fallback for an empty labels object', () => {
    expect(getLabel({}, 'anyKey', 'Fallback')).toBe('Fallback');
  });

  it('handles an empty-string fallback', () => {
    expect(getLabel(null, 'missing', '')).toBe('');
  });
});
