/**
 * CMS adapter contract — framework-agnostic.
 *
 * Adapter packages (e.g. propeller-cms-adapter-strapi) implement CmsAdapter
 * against a specific CMS backend. Consumers receive an adapter via
 * PropellerProvider's `cms` prop and call it from server-side data fetchers
 * (RSC, getServerSideProps, Vite SSR entry) — never from interactive
 * components directly.
 *
 * Shape is intentionally minimal. Pages, menus, and globals are the only
 * primitives the shop UI needs from the CMS today. Add more methods to the
 * interface (with a major bump) only when a real consumer needs them.
 */

export interface CmsBlock {
  /**
   * Discriminator used by <CmsBlock> to pick a renderer.
   * Adapter implementations populate this — use the same string across
   * Strapi / Sanity / Prepr so block components stay reusable.
   */
  type: string;
  /** Free-form block payload. Renderer is responsible for the shape. */
  data: Record<string, unknown>;
}

export interface CmsPage {
  /** CMS-side identifier (numeric or string id). */
  id: string | number;
  /** URL slug, without leading slash. Homepage uses '' or '/'. */
  slug: string;
  /** Page title — used for <title>, OG, JSON-LD breadcrumb. */
  title: string;
  /** Ordered list of blocks to render. */
  blocks: CmsBlock[];
  /** Optional SEO overrides; falls back to defaults when absent. */
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface CmsMenuItem {
  label: string;
  href: string;
  children?: CmsMenuItem[];
}

export interface CmsGlobals {
  /** Site-wide settings the CMS owns (e.g. footer columns, social links). */
  footer?: Record<string, unknown>;
  header?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CmsFetchOptions {
  locale?: string;
  preview?: boolean;
}

export interface CmsAdapter {
  /**
   * Resolve a slug to a page. Return `null` for missing slugs — the consumer
   * decides whether to 404 or fall back to a static surface.
   */
  getPage(slug: string, opts?: CmsFetchOptions): Promise<CmsPage | null>;

  /** Fetch a named menu tree (e.g. 'main', 'footer'). */
  getMenu(name: string, opts?: CmsFetchOptions): Promise<CmsMenuItem[]>;

  /** Site-wide CMS-owned settings. */
  getGlobals(opts?: CmsFetchOptions): Promise<CmsGlobals>;
}

// ───────────────────────────────────────────────────────────────────────────
// Rich CMS model + provider contract.
//
// `CmsAdapter` above is the minimal, opaque-block contract used by the generic
// `cms-react` / `cms-vue` renderers (dispatch on `CmsBlock.type`, payload is
// owned by the renderer). It stays the lowest common denominator.
//
// What follows is the *richer* model promoted from the in-production Next
// boilerplate (`propeller-next/lib/cms`). It carries fully-typed blocks,
// articles/blog, category banners, a typed global, and image-URL resolution —
// everything a real storefront actually renders. Names are kept verbatim from
// the boilerplate (`_type` discriminator, `getGlobal` singular, etc.) so the
// boilerplate can consume these types with no churn.
//
// `CmsProvider` is the canonical, full-fidelity contract; real adapters
// (Strapi, Prepr, …) should implement it. It is a strict superset of
// `CmsAdapter`: `getMenu` is included (optional) so a `CmsProvider` can be
// passed anywhere a `CmsAdapter` is expected.
// ───────────────────────────────────────────────────────────────────────────

/** A resolved media asset. */
export interface CmsImage {
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
}

/** Typed SEO block (richer than `CmsPage.seo`). */
export interface CmsSeo {
  metaTitle: string;
  metaDescription: string;
  shareImage: CmsImage | null;
}

// ── Typed blocks ──
// A fixed catalog of named blocks the boilerplate renders. Discriminated by
// `_type`. This is an *alternative* to the opaque `CmsBlock` above — consumers
// that want full typing use `CmsTypedBlock`; the generic renderers keep using
// `CmsBlock`.

export interface CmsHeroBanner {
  _type: 'hero-banner';
  title: string;
  subtitle: string | null;
  image: CmsImage | null;
  ctaText: string | null;
  ctaUrl: string | null;
  secondaryCtaText: string | null;
  secondaryCtaUrl: string | null;
}

export interface CmsRichText {
  _type: 'rich-text';
  body: string;
}

export interface CmsMedia {
  _type: 'media';
  file: CmsImage | null;
}

export interface CmsQuote {
  _type: 'quote';
  title: string | null;
  body: string;
}

export interface CmsValuePropItem {
  icon: string;
  title: string;
  text: string;
}

export interface CmsValueProps {
  _type: 'value-props';
  items: CmsValuePropItem[];
}

export interface CmsCallToAction {
  _type: 'call-to-action';
  title: string;
  description: string | null;
  buttonText: string;
  buttonUrl: string;
  variant: 'primary' | 'secondary';
}

export interface CmsProductCarousel {
  _type: 'product-carousel';
  title: string;
  categoryId: string;
  limit: number;
}

export interface CmsContactForm {
  _type: 'contact-form';
  title: string | null;
  description: string | null;
  successMessage: string;
  phone: string | null;
  email: string | null;
  formTitle: string | null;
}

export interface CmsSlider {
  _type: 'slider';
  files: CmsImage[];
}

export interface CmsProductSlider {
  _type: 'product-slider';
  title: string;
  productIds: number[];
  clusterIds: number[];
}

export interface CmsFeature {
  _type: 'feature';
  title: string;
  description: string | null;
  image: CmsImage | null;
  imagePosition: 'left' | 'right';
  buttonText: string | null;
  buttonUrl: string | null;
}

export interface CmsFaq {
  _type: 'faq';
  title: string;
  questions: { question: string; answer: string }[];
}

export interface CmsProductCard {
  productId: number | null;
  slug: string;
  name: string;
  image: CmsImage | null;
  price: number | null;
  priceSuffix: string | null;
}

export interface CmsProductCards {
  _type: 'product-cards';
  title: string;
  subtitle: string | null;
  products: CmsProductCard[];
  buttonText: string | null;
  buttonUrl: string | null;
}

export interface CmsPostCards {
  _type: 'post-cards';
  title: string;
  subtitle: string | null;
  posts: {
    title: string;
    slug: string;
    cover: CmsImage | null;
    excerpt: string | null;
    readTime: number | null;
    author: { name: string; avatar: CmsImage | null } | null;
    category: string | null;
  }[];
}

export interface CmsStatic {
  _type: 'static';
  staticType: string;
  title: string | null;
}

/** The fixed catalog of typed blocks, discriminated by `_type`. */
export type CmsTypedBlock =
  | CmsHeroBanner
  | CmsRichText
  | CmsMedia
  | CmsQuote
  | CmsValueProps
  | CmsCallToAction
  | CmsProductCarousel
  | CmsContactForm
  | CmsSlider
  | CmsProductSlider
  | CmsFeature
  | CmsFaq
  | CmsProductCards
  | CmsPostCards
  | CmsStatic;

// ── Article / Blog ──

export interface CmsAuthor {
  name: string;
  avatar: CmsImage | null;
  email: string | null;
}

export interface CmsArticle {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  cover: CmsImage | null;
  author: CmsAuthor | null;
  category: { name: string; slug: string } | null;
  blocks: CmsTypedBlock[];
  publishedAt: string | null;
}

// ── Rich page ──
// A fuller page than the minimal `CmsPage`: carries a template, description,
// typed SEO, and the typed block catalog.

export interface CmsRichPage {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  template: 'default' | 'landing-page' | 'editorial';
  seo: CmsSeo | null;
  blocks: CmsTypedBlock[];
}

// ── Category banner ──

export interface CmsCategoryBanner {
  categoryId: string;
  title: string | null;
  subtitle: string | null;
  image: CmsImage | null;
  ctaText: string | null;
  ctaUrl: string | null;
}

// ── Global (header + footer), fully typed ──

export interface CmsNavLink {
  label: string;
  url: string;
  highlight: boolean;
}

export interface CmsFooterColumn {
  title: string;
  links: CmsNavLink[];
}

export interface CmsGlobal {
  siteName: string;
  siteDescription: string;
  favicon: CmsImage | null;
  defaultSeo: CmsSeo | null;
  // Header — branding
  logo: CmsImage | null;
  logoAlt: string | null;
  // Header — top bar
  topBarEnabled: boolean;
  topBarPhone: string | null;
  topBarAnnouncement: string | null;
  topBarAnnouncementEnabled: boolean;
  showVatToggle: boolean;
  showLanguageSwitcher: boolean;
  availableLanguages: string[];
  // Header — functional components
  showSearch: boolean;
  showAccount: boolean;
  showCart: boolean;
  showCategoriesMenu: boolean;
  categoriesMenuLabel: string | null;
  // Header — navigation
  navLinks: CmsNavLink[];
  // Footer
  footerDescription: string | null;
  footerColumns: CmsFooterColumn[];
  footerEmail: string | null;
  footerPhone: string | null;
  copyrightText: string | null;
}

/** Per-page fetch options for the rich provider (e.g. personalization). */
export interface CmsPageOptions {
  /** Personalization segments to pass to the CMS (e.g. user group tags). */
  segments?: string[];
}

/**
 * Canonical, full-fidelity CMS contract — promoted from the in-production Next
 * boilerplate. Real adapters (Strapi, Prepr, generic Propeller CMS) implement
 * this. A `CmsProvider` is a strict superset of `CmsAdapter`: it adds blog
 * articles, category banners, static-slug enumeration (for SSG), a typed
 * global, and image-URL resolution. `getMenu` is included (optional) so a
 * `CmsProvider` satisfies anything typed against `CmsAdapter`.
 *
 * Note `getPage` here returns the richer `CmsRichPage` (typed blocks +
 * template), and `getGlobal` (singular) returns the typed `CmsGlobal`.
 */
export interface CmsProvider {
  /** Resolve a slug to a fully-typed page. `null` when missing. */
  getPage(slug: string, options?: CmsPageOptions): Promise<CmsRichPage | null>;
  /** Every page slug the CMS knows — used by static-site generation. */
  getAllPageSlugs(): Promise<string[]>;
  /** Site-wide header/footer settings, fully typed. */
  getGlobal(): Promise<CmsGlobal | null>;
  /** Per-category hero banner, if the CMS has one. */
  getCategoryBanner(categoryId: string): Promise<CmsCategoryBanner | null>;
  /** Blog index. */
  getArticles(): Promise<CmsArticle[]>;
  /** Single blog article by slug. `null` when missing. */
  getArticle(slug: string): Promise<CmsArticle | null>;
  /** Every article slug — used by static-site generation. */
  getAllArticleSlugs(): Promise<string[]>;
  /** Turn a CMS-relative media path into an absolute URL. */
  resolveImageUrl(path: string): string;
  /**
   * Optional named-menu fetch, for parity with the minimal `CmsAdapter`.
   * The boilerplate sources its menu from the Propeller catalog API rather
   * than the CMS, so most providers leave this undefined.
   */
  getMenu?(name: string, opts?: CmsFetchOptions): Promise<CmsMenuItem[]>;
}
