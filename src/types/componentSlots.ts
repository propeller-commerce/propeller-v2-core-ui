// src/types/componentSlots.ts
import type {
  Cart,
  CartMainItem,
  Cluster,
  Inventory,
  Product,
  ProductInventory,
  ProductPrice as SdkProductPrice,
} from '@propeller-commerce/propeller-sdk-v2';
import type { AnyUser } from '../utils/userIdentity';

/**
 * Shared contract types for component injection across React and Vue UI packages.
 *
 * Each interface defines the props a partner-provided replacement component
 * must accept. Host components pass these props through to whatever component
 * the partner injects via `priceComponent`, `stockComponent`, etc.
 *
 * Runtime-free: this file ships only TypeScript types.
 */

/** Contract for a partner-provided price block. */
export interface PriceComponentProps {
  price?: SdkProductPrice;
  includeTax?: boolean;
  currency?: string;
  taxZone?: string;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided stock/availability block. */
export interface StockComponentProps {
  inventory?: ProductInventory | Inventory;
  showStock?: boolean;
  showAvailability?: boolean;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided add-to-cart block. */
export interface AddToCartComponentProps {
  product: Product;
  cartId?: string;
  quantity?: number;
  allowIncrDecr?: boolean;
  showModal?: boolean;
  enableStockValidation?: boolean;
  beforeAddToCart?: () => boolean;
  onAddToCart?: (
    product: Product,
    quantity?: number,
    notes?: string,
  ) => Cart | Promise<Cart>;
  afterAddToCart?: (cart: Cart, item?: CartMainItem) => void;
  onProceedToCheckout?: () => void;
  onRequestQuoteClick?: (cart: Cart) => void;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided product/cluster image block. */
export interface ImageComponentProps {
  product?: Product;
  cluster?: Cluster;
  /**
   * Target language for picking a localized variant of the image
   * (alt text, language-specific transformations). Falls back to the SDK
   * default ('NL') when omitted.
   */
  language?: string;
  imageSearchFilters?: unknown;
  imageVariantFilters?: unknown;
  className?: string;
}

/** Contract for a partner-provided badges block. */
export interface BadgesComponentProps {
  product?: Product;
  cluster?: Cluster;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided favorite-toggle block. */
export interface FavoriteComponentProps {
  product?: Product;
  cluster?: Cluster;
  user?: AnyUser | null;
  onToggleFavorite?: (
    item: Product | Cluster,
    isFavorite: boolean,
  ) => void;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided bundles block on a PDP. */
export interface ProductBundlesComponentProps {
  product: Product;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided bulk-prices block on a PDP. */
export interface ProductBulkPricesComponentProps {
  product: Product;
  includeTax?: boolean;
  labels?: Record<string, string>;
  className?: string;
}

/** Contract for a partner-provided surcharges block on a PDP / cart row. */
export interface ProductSurchargesComponentProps {
  product?: Product;
  cartItem?: CartMainItem;
  includeTax?: boolean;
  labels?: Record<string, string>;
  className?: string;
}
