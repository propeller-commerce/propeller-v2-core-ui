import type { Cluster, Product } from '@propeller-commerce/propeller-sdk-v2';
import { getLanguageString } from './languageResolver';

export function getProductImageUrl(product: Product | null | undefined): string {
  return product?.media?.images?.items?.[0]?.imageVariants?.[0]?.url || '';
}

export function getClusterImageUrl(cluster: Cluster | null | undefined): string {
  return cluster?.defaultProduct?.media?.images?.items?.[0]?.imageVariants?.[0]?.url || '';
}

export function getProductSku(product: Product | null | undefined): string {
  return product?.sku || '';
}

export function getClusterSku(cluster: Cluster | null | undefined): string {
  return cluster?.sku || cluster?.defaultProduct?.sku || '';
}

export function getLocalizedValue(
  items: Array<{ language?: string; value?: string }> | null | undefined,
  language?: string,
  fallback = ''
): string {
  return getLanguageString(items as any, language || 'NL', fallback);
}

/**
 * Resolve a requested quantity to one the customer may actually order: at
 * least `min`, on the `min + n*step` grid, rounded to the nearest point.
 * A zero/absent step means every quantity at or above `min` is orderable; a
 * non-finite value (a cleared input) resolves to `min`.
 */
export function resolveOrderableQuantity(value: number, min: number, step: number): number {
  if (!Number.isFinite(value) || value <= min) return min;
  return Math.round((value - min) / (step || 1)) * (step || 1) + min;
}
