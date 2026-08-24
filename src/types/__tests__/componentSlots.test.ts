import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  PriceComponentProps,
  StockComponentProps,
  AddToCartComponentProps,
  ImageComponentProps,
  BadgesComponentProps,
  FavoriteComponentProps,
  ProductBundlesComponentProps,
  ProductBulkPricesComponentProps,
  ProductSurchargesComponentProps,
} from '../componentSlots';

/**
 * Type-shape assertions for the extension API contract types.
 *
 * Catches drift in the shared *ComponentProps interfaces — these are imported
 * directly by propeller-v2-react-ui and propeller-v2-vue-ui to type injected
 * sub-components, so any unintentional shape change is a downstream
 * compile break.
 */
describe('componentSlots contracts', () => {
  it('PriceComponentProps is all-optional and accepts an empty object', () => {
    const props: PriceComponentProps = {};
    expect(props).toEqual({});
    expectTypeOf<PriceComponentProps>().toMatchTypeOf<{
      includeTax?: boolean;
      currency?: string;
      labels?: Record<string, string>;
      className?: string;
    }>();
  });

  it('StockComponentProps is all-optional and accepts an empty object', () => {
    const props: StockComponentProps = {};
    expect(props).toEqual({});
  });

  it('AddToCartComponentProps requires `product`', () => {
    expectTypeOf<AddToCartComponentProps>().toHaveProperty('product');
    // `product` must be present — the empty object should NOT satisfy the type.
    // @ts-expect-error — `product` is required.
    const invalid: AddToCartComponentProps = {};
    expect(invalid).toBeDefined();
  });

  it('ImageComponentProps allows product or cluster (both optional)', () => {
    const a: ImageComponentProps = {};
    const b: ImageComponentProps = { className: 'x' };
    expect([a, b]).toBeDefined();
  });

  it('BadgesComponentProps allows product or cluster (both optional)', () => {
    const props: BadgesComponentProps = {};
    expect(props).toEqual({});
  });

  it('FavoriteComponentProps allows product or cluster (both optional)', () => {
    const props: FavoriteComponentProps = {};
    expect(props).toEqual({});
  });

  it('ProductBundlesComponentProps requires `product`', () => {
    expectTypeOf<ProductBundlesComponentProps>().toHaveProperty('product');
    // @ts-expect-error — `product` is required.
    const invalid: ProductBundlesComponentProps = {};
    expect(invalid).toBeDefined();
  });

  it('ProductBulkPricesComponentProps requires `product`', () => {
    expectTypeOf<ProductBulkPricesComponentProps>().toHaveProperty('product');
    // @ts-expect-error — `product` is required.
    const invalid: ProductBulkPricesComponentProps = {};
    expect(invalid).toBeDefined();
  });

  it('ProductSurchargesComponentProps allows product OR cartItem (both optional)', () => {
    const a: ProductSurchargesComponentProps = {};
    const b: ProductSurchargesComponentProps = { includeTax: false };
    expect([a, b]).toBeDefined();
  });
});
