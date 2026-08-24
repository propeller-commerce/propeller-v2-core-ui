/**
 * Translation provider contract — framework-agnostic.
 *
 * Apps implement this against their own locale source (JSON files, CMS, TMS,
 * etc.) and consume translations through the UI packages' `labels?: Record<string, string>`
 * props. Per-component returns mean one call per `<Component>`, not one per string.
 *
 * Sync by design — runtime providers (CMS, Tolgee) cache internally and expose
 * a sync `getNamespace()` once the cache is warm. Keeps the React Server
 * Component story trivial and avoids forcing `await` at every read site.
 *
 * Shape is intentionally minimal. Locale + namespace → flat string map is the
 * smallest contract that lets every consumer plug a different source in. Add
 * methods only when a real consumer needs them, with a major bump.
 */
export type Locale = string;    // 'en' | 'nl' | future additions
export type Namespace = string; // 'OrderList' | 'UserDetails' | ...

export interface TranslationProvider {
  /**
   * Return all key→value pairs for a namespace in a locale.
   * Missing locale or namespace returns {} — components fall back to
   * their English defaults via getLabel(labels, key, fallback).
   */
  getNamespace(locale: Locale, namespace: Namespace): Record<string, string>;
}
