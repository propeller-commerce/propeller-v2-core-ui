/**
 * languageResolver — Resolve localised string/value from SDK objects.
 *
 * Framework-agnostic. Works with any object that has a `language` field
 * and a `value` field (or `uri`, `name`, etc).
 */

export interface LocalizedEntry {
  language?: string;
  value?: string;
  [key: string]: any;
}

/**
 * Finds the best matching entry for a given language, with fallback to the
 * first entry in the array.
 */
export function resolveLanguageEntry<T extends LocalizedEntry>(
  items: T[] | null | undefined,
  language: string,
  fallback?: string
): T | undefined {
  if (!items || items.length === 0) return undefined;
  const lang = language.toUpperCase();
  return items.find((item) => item.language?.toUpperCase() === lang) ?? items[0];
}

/**
 * Resolves a localised string value from an array of LocalizedString objects.
 * Returns the `value` field of the matching entry, or fallback.
 *
 * Empty strings ARE treated as missing — the SDK can return entries with
 * `value: ''` for languages the data team has marked the language column
 * as supported but never filled in. Returning `''` here would render an
 * invisible product name (no fallback "Product"), which looks like a layout
 * bug. Trying the other entries before giving up matches what humans expect
 * from "localised value missing → use any available translation".
 */
export function getLanguageString(
  items: LocalizedEntry[] | null | undefined,
  language: string,
  fallback = ''
): string {
  if (!items || items.length === 0) return fallback;
  const lang = language.toUpperCase();
  const direct = items.find((item) => item.language?.toUpperCase() === lang);
  if (direct?.value) return direct.value;
  // Direct match has no value — scan the other entries for any non-empty one
  // before giving up to the fallback.
  for (const item of items) {
    if (item.value) return item.value;
  }
  return fallback;
}

/**
 * Resolves a URI from an array of objects with `language` and `uri` fields.
 */
export function getLanguageUri(
  items: (LocalizedEntry & { uri?: string })[] | null | undefined,
  language: string,
  fallback = ''
): string {
  const entry = resolveLanguageEntry(items, language);
  return entry?.uri ?? fallback;
}
