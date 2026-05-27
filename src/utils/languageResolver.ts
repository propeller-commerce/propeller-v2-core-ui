/**
 * languageResolver — Resolve localised string/value from SDK objects.
 *
 * Framework-agnostic. Generic over any SDK-shaped object that carries a
 * `language` field — `LocalizedString`, `LocalizedVideo`, `LocalizedSlug`,
 * etc. The host's per-call `T` carries the rest of the shape (`value`,
 * `uri`, …), so we don't redeclare a parallel `LocalizedEntry` here.
 */

/**
 * Structural constraint shared by every SDK "localized X" type: a non-empty
 * language code. The SDK declares `language: string` (required) on
 * `LocalizedString`, `LocalizedVideo`, `LocalizedSlug` and friends — this
 * matches them without importing each one explicitly.
 */
export type LocalizedLike = { language: string };

/**
 * Finds the best matching entry for a given language, with fallback to the
 * first entry in the array.
 */
export function resolveLanguageEntry<T extends LocalizedLike>(
  items: readonly T[] | null | undefined,
  language: string,
): T | undefined {
  if (!items || items.length === 0) return undefined;
  const lang = language.toUpperCase();
  return items.find((item) => item.language?.toUpperCase() === lang) ?? items[0];
}

/**
 * Resolves a localised string value from an array of `LocalizedString`-shaped
 * objects. Returns the `value` field of the matching entry, or fallback.
 */
export function getLanguageString<T extends LocalizedLike & { value?: string }>(
  items: readonly T[] | null | undefined,
  language: string,
  fallback = '',
): string {
  return resolveLanguageEntry(items, language)?.value ?? fallback;
}

/**
 * Resolves a URI from an array of `LocalizedVideo`-shaped objects.
 */
export function getLanguageUri<T extends LocalizedLike & { uri?: string }>(
  items: readonly T[] | null | undefined,
  language: string,
  fallback = '',
): string {
  return resolveLanguageEntry(items, language)?.uri ?? fallback;
}
