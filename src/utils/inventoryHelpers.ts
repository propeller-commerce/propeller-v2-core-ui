import type { ProductSearchInventoryFilterInput } from '@propeller-commerce/propeller-sdk-v2';

export function getStockStatus(quantity: number): { label: string; className: string } {
  if (quantity <= 0) return { label: 'Out of stock', className: 'text-destructive bg-destructive/10' };
  if (quantity <= 5) return { label: 'Low stock', className: 'text-warning bg-warning/10' };
  return { label: 'In stock', className: 'text-success bg-success/10' };
}

/** Shopper-facing stock selection. `undefined` / 'all' means unfiltered. */
export type Availability = 'all' | 'in-stock';

/** Smallest threshold that still means "in stock". */
export const MIN_STOCK_THRESHOLD = 1;

/**
 * Map a stock selection to the server-side filter. `greaterThan` is inclusive
 * despite its name, so `greaterThan: N` matches stock >= N. Never-stocked
 * products have no inventory record and count as 0.
 */
export function buildInventoryFilter(
  sel: Availability | undefined,
  minQuantity?: number
): ProductSearchInventoryFilterInput | undefined {
  if (sel !== 'in-stock') return undefined;
  const n = Math.max(MIN_STOCK_THRESHOLD, Math.floor(minQuantity ?? MIN_STOCK_THRESHOLD));
  return { totalQuantity: { greaterThan: n } };
}
