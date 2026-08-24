import { OrderItemClass, YesNo, type OrderItem } from '@propeller-commerce/propeller-sdk-v2';

/**
 * Nets an order's bonus items against their incentive siblings.
 *
 * The API models a bonus as two lines: the product line at its list price, and
 * a sibling `incentive` line carrying the negative delta and pointing back via
 * `parentOrderItemId`. Rendering the product line alone therefore shows the
 * undiscounted price. This folds each discount into its parent so a fully
 * discounted item reaches 0 and a partially discounted one keeps the remainder.
 *
 * Returns the bonus product lines only, with `priceTotal` / `priceTotalNet`
 * adjusted. Non-bonus and incentive lines are dropped.
 */
export function getNettedBonusItems(items: OrderItem[] | null | undefined): OrderItem[] {
  const all = items || [];

  const discountsByParent = new Map<number, { total: number; totalNet: number }>();
  for (const item of all) {
    if (item.class !== OrderItemClass.incentive || !item.parentOrderItemId) continue;
    const acc = discountsByParent.get(item.parentOrderItemId) || { total: 0, totalNet: 0 };
    acc.total += item.priceTotal || 0;
    acc.totalNet += item.priceTotalNet ?? item.priceTotal ?? 0;
    discountsByParent.set(item.parentOrderItemId, acc);
  }

  return all
    .filter((item) => item.class === OrderItemClass.product && item.isBonus === YesNo.Y)
    .map((item) => {
      const discount = discountsByParent.get(item.id);
      if (!discount) return item;
      const netted: OrderItem = { ...item, priceTotal: (item.priceTotal || 0) + discount.total };
      if (item.priceTotalNet !== undefined && item.priceTotalNet !== null) {
        netted.priceTotalNet = item.priceTotalNet + discount.totalNet;
      }
      return netted;
    });
}
