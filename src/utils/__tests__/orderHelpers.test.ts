import { describe, expect, it } from 'vitest';
import { OrderItemClass, TaxCode, YesNo, type OrderItem } from '@propeller-commerce/propeller-sdk-v2';
import { getNettedBonusItems } from '../orderHelpers';

function item(partial: Partial<OrderItem>): OrderItem {
  return {
    id: 0,
    orderId: 1,
    uuid: 'u',
    class: OrderItemClass.product,
    quantity: 1,
    sku: 'sku',
    name: 'name',
    price: 0,
    priceTotal: 0,
    taxPercentage: 21,
    taxCode: TaxCode.H,
    isBonus: YesNo.N,
    ...partial,
  } as OrderItem;
}

describe('getNettedBonusItems', () => {
  // Order 281: a 100%-discount bonus split across a product + incentive line.
  it('nets a fully discounted bonus to zero', () => {
    const items = [
      item({ id: 401748, class: OrderItemClass.product, isBonus: YesNo.Y, sku: '950869', priceTotal: 2.77 }),
      item({
        id: 401749,
        class: OrderItemClass.incentive,
        isBonus: YesNo.Y,
        sku: 'discount_percentage',
        priceTotal: -2.77,
        parentOrderItemId: 401748,
      }),
    ];

    const result = getNettedBonusItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(401748);
    expect(result[0].priceTotal).toBe(0);
  });

  // Order 282: a partial discount must keep the remainder, not collapse to zero.
  it('keeps the remainder of a partially discounted bonus', () => {
    const items = [
      item({ id: 402533, class: OrderItemClass.product, isBonus: YesNo.Y, priceTotal: 10.34, priceTotalNet: 12.5114 }),
      item({
        id: 402534,
        class: OrderItemClass.incentive,
        isBonus: YesNo.Y,
        priceTotal: -3,
        priceTotalNet: -3.63,
        parentOrderItemId: 402533,
      }),
    ];

    const result = getNettedBonusItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].priceTotal).toBeCloseTo(7.34, 5);
    expect(result[0].priceTotalNet).toBeCloseTo(8.8814, 5);
  });

  // Order 282 in full: two bonuses alongside regular items.
  it('nets each bonus independently and ignores non-bonus lines', () => {
    const items = [
      item({ id: 402531, isBonus: YesNo.N, priceTotal: 817.2, priceTotalNet: 890.748 }),
      item({ id: 402532, isBonus: YesNo.N, priceTotal: 520.2, priceTotalNet: 629.442, parentOrderItemId: 402531 }),
      item({ id: 402533, isBonus: YesNo.Y, priceTotal: 10.34, priceTotalNet: 12.5114 }),
      item({ id: 402534, class: OrderItemClass.incentive, isBonus: YesNo.Y, priceTotal: -3, priceTotalNet: -3.63, parentOrderItemId: 402533 }),
      item({ id: 402535, isBonus: YesNo.Y, priceTotal: 7.69, priceTotalNet: 9.3049 }),
      item({ id: 402536, class: OrderItemClass.incentive, isBonus: YesNo.Y, priceTotal: -7.69, priceTotalNet: -9.3049, parentOrderItemId: 402535 }),
    ];

    const result = getNettedBonusItems(items);

    expect(result.map((i) => i.id)).toEqual([402533, 402535]);
    expect(result[0].priceTotal).toBeCloseTo(7.34, 5);
    expect(result[1].priceTotal).toBeCloseTo(0, 5);
  });

  it('leaves a bonus without an incentive sibling untouched', () => {
    const items = [item({ id: 1, isBonus: YesNo.Y, priceTotal: 5 })];
    expect(getNettedBonusItems(items)[0].priceTotal).toBe(5);
  });

  it('sums multiple incentive siblings on one bonus', () => {
    const items = [
      item({ id: 1, isBonus: YesNo.Y, priceTotal: 10 }),
      item({ id: 2, class: OrderItemClass.incentive, isBonus: YesNo.Y, priceTotal: -3, parentOrderItemId: 1 }),
      item({ id: 3, class: OrderItemClass.incentive, isBonus: YesNo.Y, priceTotal: -2, parentOrderItemId: 1 }),
    ];
    expect(getNettedBonusItems(items)[0].priceTotal).toBeCloseTo(5, 5);
  });

  it('returns an empty array for missing or bonus-free input', () => {
    expect(getNettedBonusItems(null)).toEqual([]);
    expect(getNettedBonusItems([item({ id: 1, isBonus: YesNo.N, priceTotal: 9 })])).toEqual([]);
  });
});
