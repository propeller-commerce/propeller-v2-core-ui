/**
 * propeller-v2-core-ui — public surface.
 *
 * Pure TS. No Vue, no React, no DOM. Safe to import from Node SSR contexts,
 * build scripts, or tests without pulling a framework runtime.
 */

// ── Result<T, E> contract ───────────────────────────────────────────────────
export { ok, err, tryAsync, type Result } from './types/result';

// ── Utilities ───────────────────────────────────────────────────────────────
export {
  attributeNameMatches,
  getAttributeDisplayName,
  extractAttributeValues,
  collectAttributeValues,
  filterProductsBySelections,
} from './utils/attributeExtractor';
export { COUNTRIES, COUNTRIES_MAP, getCountryName, type Country } from './utils/countries';
export {
  formatPrice,
  formatDate,
  formatSurcharge,
  calcDiscountPercent,
} from './utils/formatting';
export { getStockStatus } from './utils/inventoryHelpers';
export { getLabel } from './utils/labelHelpers';
export {
  resolveLanguageEntry,
  getLanguageString,
  getLanguageUri,
  type LocalizedEntry,
} from './utils/languageResolver';
export {
  getProductImageUrl,
  getClusterImageUrl,
  getProductSku,
  getClusterSku,
  getLocalizedValue,
} from './utils/productHelpers';
export { stripHtml, shouldTruncate, truncateAt } from './utils/truncation';
export {
  isContact,
  isCustomer,
  getUserId,
  getCompany,
  getCompanyId,
  getAddresses,
  getDefaultInvoiceAddress,
  getDefaultDeliveryAddress,
  type AnyUser,
} from './utils/userIdentity';
export { isEmbeddable, normalizeVideoUrl } from './utils/videoTransform';
export { isContentHidden } from './utils/visibilityHelpers';
export {
  buildProductJsonLd,
  buildClusterJsonLd,
  buildItemListJsonLd,
  safeJsonStringify,
  type JsonLdContext,
} from './utils/jsonLd';
export { deriveUserMode, type ShopMode, type UserMode } from './utils/userMode';

// ── CMS adapter contract ────────────────────────────────────────────────────
export type {
  CmsAdapter,
  CmsBlock,
  CmsPage,
  CmsMenuItem,
  CmsGlobals,
  CmsFetchOptions,
} from './types/cms';

// ── Services / SDK seam ─────────────────────────────────────────────────────
export { createServices, type Services } from './services/createServices';
export { toPlain } from './services/toPlain';

// ── Domain type re-exports (type-only; no runtime cost) ─────────────────────
export type * from './types/auth.types';
export type * from './types/cart.types';
export type * from './types/company.types';
export type * from './types/favorites.types';
export type * from './types/orders.types';
export type * from './types/pagination.types';
export type * from './types/product.types';
