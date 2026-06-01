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
