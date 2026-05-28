import type { Cluster, Product } from 'propeller-sdk-v2';
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
