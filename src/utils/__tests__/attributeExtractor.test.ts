import { describe, it, expect } from 'vitest';
import type { AttributeResult, Product } from 'propeller-sdk-v2';
import { AttributeType } from 'propeller-sdk-v2';
import {
  attributeNameMatches,
  getAttributeDisplayName,
  extractAttributeValues,
  collectAttributeValues,
  filterProductsBySelections,
} from '../attributeExtractor';

function attr(
  desc: Record<string, unknown> | undefined,
  value?: unknown
): AttributeResult {
  return { attributeDescription: desc, value } as unknown as AttributeResult;
}

describe('attributeNameMatches', () => {
  it('matches on the SDK name field', () => {
    expect(attributeNameMatches(attr({ name: 'Color' }), 'Color')).toBe(true);
  });

  it('matches on a localised description value', () => {
    const a = attr({ name: 'Color', descriptions: [{ value: 'Kleur' }] });
    expect(attributeNameMatches(a, 'Kleur')).toBe(true);
  });

  it('does not match an unrelated name', () => {
    expect(attributeNameMatches(attr({ name: 'Color' }), 'Size')).toBe(false);
  });

  it('returns false when the attribute has no description', () => {
    expect(attributeNameMatches(attr(undefined), 'Color')).toBe(false);
  });
});

describe('getAttributeDisplayName', () => {
  it('returns the localised description for the requested language', () => {
    const a = attr({
      name: 'Color',
      descriptions: [
        { language: 'NL', value: 'Kleur' },
        { language: 'EN', value: 'Colour' },
      ],
    });
    expect(getAttributeDisplayName(a, 'EN')).toBe('Colour');
  });

  it('matches the language case-insensitively', () => {
    const a = attr({ name: 'Color', descriptions: [{ language: 'EN', value: 'Colour' }] });
    expect(getAttributeDisplayName(a, 'en')).toBe('Colour');
  });

  it('falls back to the first description when the language is missing', () => {
    const a = attr({ name: 'Color', descriptions: [{ language: 'NL', value: 'Kleur' }] });
    expect(getAttributeDisplayName(a, 'FR')).toBe('Kleur');
  });

  it('falls back to the SDK name when there are no descriptions', () => {
    expect(getAttributeDisplayName(attr({ name: 'Color' }))).toBe('Color');
  });

  it('returns an empty string when there is no description object', () => {
    expect(getAttributeDisplayName(attr(undefined))).toBe('');
  });
});

describe('extractAttributeValues — legacy SDK format', () => {
  it('extracts a colorValue', () => {
    expect(extractAttributeValues(attr({}, { colorValue: '#ff0000' }))).toEqual(['#ff0000']);
  });

  it('extracts textValues[0].values, filtering falsy entries', () => {
    const v = { textValues: [{ values: ['a', '', 'b'] }] };
    expect(extractAttributeValues(attr({}, v))).toEqual(['a', 'b']);
  });

  it('extracts a single textValue', () => {
    expect(extractAttributeValues(attr({}, { textValue: 'hello' }))).toEqual(['hello']);
  });

  it('extracts a numericValue, coerced to string', () => {
    expect(extractAttributeValues(attr({}, { numericValue: 42 }))).toEqual(['42']);
  });

  it('extracts numericValue 0 (not treated as absent)', () => {
    expect(extractAttributeValues(attr({}, { numericValue: 0 }))).toEqual(['0']);
  });

  it('maps booleanValue to Yes / No', () => {
    expect(extractAttributeValues(attr({}, { booleanValue: true }))).toEqual(['Yes']);
    expect(extractAttributeValues(attr({}, { booleanValue: false }))).toEqual(['No']);
  });
});

describe('extractAttributeValues — current type-based format', () => {
  it('extracts a COLOR value', () => {
    const v = { type: AttributeType.COLOR, value: '#00ff00' };
    expect(extractAttributeValues(attr({}, v))).toEqual(['#00ff00']);
  });

  it('extracts TEXT values from nested textValues', () => {
    const v = { type: AttributeType.TEXT, value: { textValues: [{ values: ['x', 'y'] }] } };
    expect(extractAttributeValues(attr({}, v))).toEqual(['x', 'y']);
  });

  it('extracts a DECIMAL value as a string', () => {
    expect(extractAttributeValues(attr({}, { type: AttributeType.DECIMAL, value: 3.5 }))).toEqual([
      '3.5',
    ]);
  });

  it('extracts an INT value as a string', () => {
    expect(extractAttributeValues(attr({}, { type: AttributeType.INT, value: 7 }))).toEqual(['7']);
  });

  it('extracts an ENUM value', () => {
    expect(extractAttributeValues(attr({}, { type: AttributeType.ENUM, value: 'Large' }))).toEqual([
      'Large',
    ]);
  });
});

describe('extractAttributeValues — edge cases', () => {
  it('returns an empty array when value is null or undefined', () => {
    expect(extractAttributeValues(attr({}, null))).toEqual([]);
    expect(extractAttributeValues(attr({}, undefined))).toEqual([]);
  });

  it('handles a bare string value via the fallback branch', () => {
    expect(extractAttributeValues(attr({}, 'plain'))).toEqual(['plain']);
  });

  it('mines string values from an arbitrary object via the fallback branch', () => {
    expect(extractAttributeValues(attr({}, { a: 'one', b: 2, c: 'three' }))).toEqual([
      'one',
      'three',
    ]);
  });

  it('reads a values[] array on an otherwise-unrecognised object, keeping only strings', () => {
    expect(extractAttributeValues(attr({}, { values: ['a', 1, 'b', null] }))).toEqual(['a', 'b']);
  });
});

describe('collectAttributeValues', () => {
  function productWith(attrs: AttributeResult[]): Product {
    return { attributes: { items: attrs } } as unknown as Product;
  }

  it('collects unique values for a named attribute across products', () => {
    const products = [
      productWith([attr({ name: 'Color' }, { textValue: 'Red' })]),
      productWith([attr({ name: 'Color' }, { textValue: 'Blue' })]),
      productWith([attr({ name: 'Color' }, { textValue: 'Red' })]),
    ];
    expect(collectAttributeValues(products, 'Color').sort()).toEqual(['Blue', 'Red']);
  });

  it('ignores products whose attributes are absent', () => {
    const products = [
      productWith([attr({ name: 'Color' }, { textValue: 'Red' })]),
      {} as Product,
    ];
    expect(collectAttributeValues(products, 'Color')).toEqual(['Red']);
  });

  it('returns an empty array when no product has the attribute', () => {
    const products = [productWith([attr({ name: 'Size' }, { textValue: 'L' })])];
    expect(collectAttributeValues(products, 'Color')).toEqual([]);
  });
});

describe('filterProductsBySelections', () => {
  function productWith(attrs: AttributeResult[]): Product {
    return { attributes: { items: attrs } } as unknown as Product;
  }

  const red = productWith([
    attr({ name: 'Color' }, { textValue: 'Red' }),
    attr({ name: 'Size' }, { textValue: 'M' }),
  ]);
  const blue = productWith([
    attr({ name: 'Color' }, { textValue: 'Blue' }),
    attr({ name: 'Size' }, { textValue: 'M' }),
  ]);

  it('returns all products when there are no selections', () => {
    expect(filterProductsBySelections([red, blue], {})).toEqual([red, blue]);
  });

  it('filters to products matching a single selection', () => {
    expect(filterProductsBySelections([red, blue], { Color: 'Red' })).toEqual([red]);
  });

  it('requires ALL selections to match (AND semantics)', () => {
    expect(filterProductsBySelections([red, blue], { Color: 'Red', Size: 'M' })).toEqual([red]);
    expect(filterProductsBySelections([red, blue], { Color: 'Red', Size: 'L' })).toEqual([]);
  });

  it('excludes products whose attributes list is absent', () => {
    expect(filterProductsBySelections([{} as Product], { Color: 'Red' })).toEqual([]);
  });
});
