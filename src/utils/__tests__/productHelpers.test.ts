import { describe, it, expect } from 'vitest';
import type { Product, Cluster } from '@propeller-commerce/propeller-sdk-v2';
import {
  getProductImageUrl,
  getClusterImageUrl,
  getProductSku,
  getClusterSku,
  getLocalizedValue,
  resolveOrderableQuantity,
} from '../productHelpers';

const productWithImage = {
  media: { images: { items: [{ imageVariants: [{ url: 'http://img/p.jpg' }] }] } },
} as unknown as Product;

const clusterWithImage = {
  defaultProduct: {
    media: { images: { items: [{ imageVariants: [{ url: 'http://img/c.jpg' }] }] } },
  },
} as unknown as Cluster;

describe('getProductImageUrl', () => {
  it('returns the first image variant url', () => {
    expect(getProductImageUrl(productWithImage)).toBe('http://img/p.jpg');
  });

  it('returns an empty string when the product is null or undefined', () => {
    expect(getProductImageUrl(null)).toBe('');
    expect(getProductImageUrl(undefined)).toBe('');
  });

  it('returns an empty string when the media path is absent', () => {
    expect(getProductImageUrl({} as Product)).toBe('');
  });

  it('returns an empty string when the images list is empty', () => {
    const p = { media: { images: { items: [] } } } as unknown as Product;
    expect(getProductImageUrl(p)).toBe('');
  });
});

describe('getClusterImageUrl', () => {
  it("returns the default product's first image variant url", () => {
    expect(getClusterImageUrl(clusterWithImage)).toBe('http://img/c.jpg');
  });

  it('returns an empty string when the cluster is null or undefined', () => {
    expect(getClusterImageUrl(null)).toBe('');
    expect(getClusterImageUrl(undefined)).toBe('');
  });

  it('returns an empty string when there is no default product', () => {
    expect(getClusterImageUrl({} as Cluster)).toBe('');
  });
});

describe('getProductSku', () => {
  it('returns the product sku', () => {
    expect(getProductSku({ sku: 'SKU-1' } as Product)).toBe('SKU-1');
  });

  it('returns an empty string when the sku or product is missing', () => {
    expect(getProductSku({} as Product)).toBe('');
    expect(getProductSku(null)).toBe('');
  });
});

describe('getClusterSku', () => {
  it("returns the cluster's own sku when present", () => {
    expect(getClusterSku({ sku: 'CL-1' } as Cluster)).toBe('CL-1');
  });

  it("falls back to the default product's sku", () => {
    const c = { defaultProduct: { sku: 'DP-1' } } as unknown as Cluster;
    expect(getClusterSku(c)).toBe('DP-1');
  });

  it('prefers the cluster sku over the default-product sku', () => {
    const c = { sku: 'CL-1', defaultProduct: { sku: 'DP-1' } } as unknown as Cluster;
    expect(getClusterSku(c)).toBe('CL-1');
  });

  it('returns an empty string when neither sku exists', () => {
    expect(getClusterSku({} as Cluster)).toBe('');
    expect(getClusterSku(null)).toBe('');
  });
});

describe('getLocalizedValue', () => {
  const names = [
    { language: 'NL', value: 'Boor' },
    { language: 'EN', value: 'Drill' },
  ];

  it('returns the value for the requested language', () => {
    expect(getLocalizedValue(names, 'EN')).toBe('Drill');
  });

  it('falls back to the first entry when the language is missing', () => {
    expect(getLocalizedValue(names, 'FR')).toBe('Boor');
  });

  it('falls back to the first entry when no language is given', () => {
    expect(getLocalizedValue(names)).toBe('Boor');
  });

  it('returns the fallback for a null or empty list', () => {
    expect(getLocalizedValue(null, 'EN', 'n/a')).toBe('n/a');
    expect(getLocalizedValue([], 'EN', 'n/a')).toBe('n/a');
  });

  it('returns an empty string as the default fallback', () => {
    expect(getLocalizedValue(null)).toBe('');
  });

  it('matches language case-insensitively', () => {
    expect(getLocalizedValue(names, 'en')).toBe('Drill');
  });

  it('returns the fallback when the first entry has no value', () => {
    expect(getLocalizedValue([{ language: 'NL' }], undefined, 'n/a')).toBe('n/a');
  });
});

describe('resolveOrderableQuantity', () => {
  it('floors at the minimum', () => {
    expect(resolveOrderableQuantity(1, 2, 1)).toBe(2);
    expect(resolveOrderableQuantity(0, 5, 5)).toBe(5);
    expect(resolveOrderableQuantity(-3, 1, 1)).toBe(1);
  });

  // min 2, step 6 -> 2, 8, 14, 20
  it('lands on the min + n*step grid', () => {
    expect(resolveOrderableQuantity(8, 2, 6)).toBe(8);
    expect(resolveOrderableQuantity(14, 2, 6)).toBe(14);
  });

  it('rounds to the nearest grid point, not down', () => {
    expect(resolveOrderableQuantity(6, 2, 6)).toBe(8);
    expect(resolveOrderableQuantity(4, 2, 6)).toBe(2);
  });

  it('is a no-op for step 1', () => {
    expect(resolveOrderableQuantity(7, 1, 1)).toBe(7);
  });

  // A zero or absent step must not divide by zero.
  it('treats a zero step as 1', () => {
    expect(resolveOrderableQuantity(7, 1, 0)).toBe(7);
  });

  // The field can be cleared while typing; NaN must resolve to the minimum.
  it('resolves a non-number to the minimum', () => {
    expect(resolveOrderableQuantity(NaN, 3, 2)).toBe(3);
    expect(resolveOrderableQuantity(Infinity, 3, 2)).toBe(3);
  });

  // A cart line already off the grid: min 2, step 3 -> 2, 5, 8, 11
  it('returns an off-grid cart quantity to the grid', () => {
    expect(resolveOrderableQuantity(9, 2, 3)).toBe(8);
    expect(resolveOrderableQuantity(10, 2, 3)).toBe(11);
    expect(resolveOrderableQuantity(4, 2, 3)).toBe(5);
  });
});
