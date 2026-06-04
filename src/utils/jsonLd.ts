/**
 * jsonLd — schema.org structured-data builders for Product / Cluster / ItemList.
 *
 * Framework-agnostic pure functions. Each `build*` returns a plain JS object
 * (or `null` when the input is unusable) ready to be `JSON.stringify`'d into
 * a `<script type="application/ld+json">` tag.
 *
 * Design notes:
 *   - Price is ALWAYS `product.price.net`. JSON-LD is for crawlers and stays
 *     canonical regardless of the viewer's VAT toggle. Matches the API shape
 *     (`Price.net` is the source of truth; `gross` is derived from it + tax
 *     zone) and the legacy PHP shop's behaviour.
 *   - Offers are OMITTED when `isContentHidden(portalMode, user)` returns true
 *     (semi-closed portals must not leak prices to anonymous visitors / bots).
 *   - Clusters emit `"@type": "Product"` — schema.org has no `Cluster` type.
 *     The legacy PHP shop emits `"@type": "Cluster"`, which is non-standard
 *     and ignored by Google. Don't "fix" this back.
 *   - Currency comes from `JsonLdContext.currencyCode` (ISO 4217). The display
 *     symbol `currency: '€'` in `data/config.ts` is for human-readable price
 *     formatting and is NOT what schema.org's `priceCurrency` expects.
 */

import type {
  Cluster,
  Contact,
  Customer,
  Product,
} from '@propeller-commerce/propeller-sdk-v2';
import { ProductClass } from '@propeller-commerce/propeller-sdk-v2';
import { getLanguageString } from './languageResolver';
import { stripHtml } from './truncation';
import { getProductImageUrl, getClusterImageUrl } from './productHelpers';
import { isContentHidden } from './visibilityHelpers';

/**
 * Request-scoped inputs every builder needs. Construct once per render and
 * pass to all three builders to keep the call sites uniform.
 */
export interface JsonLdContext {
  /** Absolute origin, e.g. `'https://shop.example.com'`. No trailing slash. */
  siteUrl: string;
  /** Active language code (e.g. `'NL'`). Used to pick localized strings + slugs. */
  language: string;
  /** ISO 4217 currency code for offers, e.g. `'EUR'`. Source: `config.currencyCode`. */
  currencyCode: string;
  /** Portal mode — when `'semi-closed'` AND no user, `offers` is omitted. */
  portalMode: string;
  /** Current user (anonymous when null). Decides offer visibility. */
  user: Contact | Customer | null | undefined;
  /** URL builders from the consumer's `data/config.ts`. Return leading-slash paths. */
  urls: {
    getProductUrl(product: Product, language?: string): string;
    getClusterUrl(cluster: Cluster, language?: string): string;
  };
}

/**
 * JSON.stringify wrapper that escapes the `</` sequence so the payload can't
 * accidentally close the surrounding `<script>` tag. Cheap insurance — any
 * description containing the literal text `</script>` would otherwise break
 * the page (and serve as a vector for HTML injection from catalog data).
 */
export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value).replace(/<\//g, '<\\/');
}

/**
 * Returns `true` when the JSON-LD `offers` block should be included for this
 * viewer. Semi-closed portals hide prices from anonymous visitors; we mirror
 * that gate so crawlers don't index a price the same anonymous user can't see
 * on the page itself.
 */
function shouldShowOffers(ctx: JsonLdContext): boolean {
  return !isContentHidden(ctx.portalMode, ctx.user);
}

/** Convert a leading-slash relative URL to an absolute URL using `siteUrl`. */
function toAbsolute(siteUrl: string, pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteUrl.replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return base + path;
}

/** Format a numeric price as a fixed-2-decimal string (schema.org requires string). */
function formatPriceForJsonLd(amount: number | null | undefined): string | undefined {
  if (amount == null || !Number.isFinite(amount)) return undefined;
  return amount.toFixed(2);
}

/** Clean a localized description for crawlers: strip HTML, collapse whitespace. */
function cleanDescription(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const text = stripHtml(value).replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : undefined;
}

/**
 * Build the `offers` sub-object for a product. Returns `undefined` when
 * gated by portal mode OR when no price exists. The returned object always
 * carries `@type`, `url`, `priceCurrency`, `price`, `itemCondition`, and
 * (when inventory is known) `availability`.
 */
function buildOffers(
  product: Product,
  absoluteUrl: string,
  ctx: JsonLdContext,
): Record<string, unknown> | undefined {
  if (!shouldShowOffers(ctx)) return undefined;
  const price = formatPriceForJsonLd(product.price?.net);
  if (price === undefined) return undefined;

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: absoluteUrl,
    priceCurrency: ctx.currencyCode,
    price,
    itemCondition: 'https://schema.org/NewCondition',
  };

  const qty = product.inventory?.totalQuantity;
  if (typeof qty === 'number') {
    offer.availability = qty > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';
  }

  return offer;
}

/**
 * Build a schema.org Product object from an SDK `Product`. Returns `null`
 * when the product has no name AND no URL — at that point there's nothing
 * worth emitting for crawlers.
 */
export function buildProductJsonLd(
  product: Product,
  ctx: JsonLdContext,
): Record<string, unknown> | null {
  if (!product) return null;

  const name = getLanguageString(product.names, ctx.language, '').trim();
  const relativeUrl = ctx.urls.getProductUrl(product, ctx.language);
  const absoluteUrl = toAbsolute(ctx.siteUrl, relativeUrl);
  if (!name && !absoluteUrl) return null;

  const description = cleanDescription(
    getLanguageString(product.descriptions, ctx.language, '')
      || getLanguageString(product.shortDescriptions, ctx.language, ''),
  );
  const imageUrl = getProductImageUrl(product);
  const absoluteImage = imageUrl ? toAbsolute(ctx.siteUrl, imageUrl) : undefined;
  // Category.name is the localized array (singular field, plural-shaped value).
  const categoryName = getLanguageString(product.category?.name, ctx.language, '').trim();

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
  };
  if (name) data.name = name;
  if (absoluteUrl) data.url = absoluteUrl;
  if (absoluteImage) data.image = absoluteImage;
  if (description) data.description = description;
  if (product.manufacturerCode) data.mpn = product.manufacturerCode;
  if (product.sku) data.sku = product.sku;
  if (product.productId != null) data.productID = String(product.productId);
  if (categoryName) data.category = categoryName;
  if (product.manufacturer) {
    data.brand = { '@type': 'Brand', name: product.manufacturer };
  }

  const offers = buildOffers(product, absoluteUrl, ctx);
  if (offers) data.offers = offers;

  return data;
}

/**
 * Build a schema.org Product object representing a Cluster. The cluster's
 * `defaultProduct` supplies brand / SKU / price / image; the cluster itself
 * supplies the identity (URL, name, clusterId, category).
 *
 * Emits `"@type": "Product"` — schema.org has no `Cluster` type. The legacy
 * PHP uses `"@type": "Cluster"` which is non-standard.
 */
export function buildClusterJsonLd(
  cluster: Cluster,
  ctx: JsonLdContext,
): Record<string, unknown> | null {
  if (!cluster) return null;
  const defaultProduct = cluster.defaultProduct as Product | undefined;

  const name = getLanguageString(cluster.names, ctx.language, '').trim();
  const relativeUrl = ctx.urls.getClusterUrl(cluster, ctx.language);
  const absoluteUrl = toAbsolute(ctx.siteUrl, relativeUrl);
  if (!name && !absoluteUrl) return null;

  const description = cleanDescription(
    getLanguageString(cluster.descriptions, ctx.language, ''),
  );
  const imageUrl = getClusterImageUrl(cluster);
  const absoluteImage = imageUrl ? toAbsolute(ctx.siteUrl, imageUrl) : undefined;
  const categoryName = getLanguageString(cluster.category?.name, ctx.language, '').trim();

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
  };
  if (name) data.name = name;
  if (absoluteUrl) data.url = absoluteUrl;
  if (absoluteImage) data.image = absoluteImage;
  if (description) data.description = description;
  if (defaultProduct?.manufacturerCode) data.mpn = defaultProduct.manufacturerCode;
  const sku = cluster.sku || defaultProduct?.sku;
  if (sku) data.sku = sku;
  if (cluster.clusterId != null) data.productID = String(cluster.clusterId);
  if (categoryName) data.category = categoryName;
  if (defaultProduct?.manufacturer) {
    data.brand = { '@type': 'Brand', name: defaultProduct.manufacturer };
  }

  if (defaultProduct) {
    const offers = buildOffers(defaultProduct, absoluteUrl, ctx);
    if (offers) data.offers = offers;
  }

  return data;
}

/**
 * Build a schema.org ItemList of Product items from a paginated server
 * response. Clusters are unwrapped to their `defaultProduct` (matching the
 * PHP behaviour) so the ListItem URL points to the buyable cluster page but
 * the embedded Product carries default-product SKU/price.
 *
 * Scope is intentionally first-page only: this builder takes whatever
 * `products` array the caller provides (typically the SSR-rendered first
 * page) and emits one ItemList for it. Client-side filter/sort/page
 * navigation does NOT update the JSON-LD — bots see the SSR snapshot only.
 *
 * Returns `null` when the list is empty.
 */
export function buildItemListJsonLd(
  products: ReadonlyArray<Product>,
  ctx: JsonLdContext,
): Record<string, unknown> | null {
  if (!products || products.length === 0) return null;

  const itemListElement: Record<string, unknown>[] = [];
  products.forEach((item, index) => {
    // Clusters in the response have class==='CLUSTER' and carry a defaultProduct.
    // Unwrap to the default product for the embedded Product node, but keep the
    // cluster URL — that's the page a click would actually land on.
    const isCluster = item.class === ProductClass.CLUSTER;
    const productForFields: Product | undefined = isCluster
      ? ((item as unknown as Cluster).defaultProduct as Product | undefined)
      : item;
    if (!productForFields) return;

    const cluster = isCluster ? (item as unknown as Cluster) : undefined;
    const relativeUrl = cluster
      ? ctx.urls.getClusterUrl(cluster, ctx.language)
      : ctx.urls.getProductUrl(item, ctx.language);
    const absoluteUrl = toAbsolute(ctx.siteUrl, relativeUrl);

    const productNode = buildProductJsonLd(productForFields, ctx);
    if (!productNode) return;
    // Override URL on the embedded Product node to match the ListItem URL — for
    // clusters this points to the cluster page, not the default-product page.
    if (absoluteUrl) productNode.url = absoluteUrl;
    if (productNode.offers && typeof productNode.offers === 'object') {
      (productNode.offers as Record<string, unknown>).url = absoluteUrl;
    }
    // Drop the inner @context — only the outer ItemList carries it.
    delete productNode['@context'];

    itemListElement.push({
      '@type': 'ListItem',
      position: index + 1,
      item: productNode,
    });
  });

  if (itemListElement.length === 0) return null;

  return {
    '@context': 'https://schema.org/',
    '@type': 'ItemList',
    numberOfItems: itemListElement.length,
    itemListElement,
  };
}
