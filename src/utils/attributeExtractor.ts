/**
 * attributeExtractor — Extracts string values from SDK AttributeResult objects.
 *
 * Handles both the legacy Propeller SDK format and the current type-based format.
 * Shared by ClusterConfigurator and ProductSpecifications.
 *
 * Framework-agnostic pure functions.
 */

import type { AttributeResult } from 'propeller-sdk-v2';
import { AttributeType } from 'propeller-sdk-v2';

/**
 * Checks whether an AttributeResult matches a given target attribute name,
 * looking at the SDK name field and all localised descriptions.
 */
export function attributeNameMatches(
  attr: AttributeResult,
  targetName: string
): boolean {
  const desc = attr.attributeDescription;
  if (!desc) return false;
  if (desc.name === targetName) return true;
  if (desc.descriptions?.some((d: { value?: string }) => d.value === targetName)) return true;
  return false;
}

/**
 * Extracts the display name for an attribute from its descriptions array.
 * Falls back to the SDK `name` field, then to attributeName.
 */
export function getAttributeDisplayName(
  attr: AttributeResult,
  language?: string
): string {
  const desc = attr.attributeDescription;
  if (!desc) return '';

  if (language && desc.descriptions?.length) {
    const lang = language.toUpperCase();
    const match = desc.descriptions.find(
      (d: { language?: string; value?: string }) => d.language?.toUpperCase() === lang,
    );
    if (match?.value) return match.value;
  }

  return desc.descriptions?.[0]?.value ?? desc.name ?? '';
}

/**
 * Extracts string values from an AttributeResult.
 *
 * Supports:
 * - Legacy SDK: `colorValue`, `textValues[0].values`, `textValue`, `numericValue`, `booleanValue`
 * - Current SDK (type-based): `COLOR | TEXT | DECIMAL | INT | ENUM`
 * - Fallback: string coercion + object property mining
 */
/**
 * Loose structural type for `attr.value`. The SDK doesn't model the
 * legacy + type-based + fallback variants as a single discriminated union,
 * so every reachable property is declared optional here. Narrowing happens
 * at use-sites via the same checks the original code used.
 */
type AttributeValueShape = {
  colorValue?: string;
  textValues?: Array<{ values?: unknown }>;
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
  type?: AttributeType;
  value?: { textValues?: Array<{ values?: unknown }> } | string;
  values?: unknown[];
};

export function extractAttributeValues(attr: AttributeResult): string[] {
  const values: string[] = [];
  const raw = attr.value as AttributeValueShape | string | null | undefined;

  if (!raw) return values;

  // String values are an SDK fallback shape — handle them up front so the
  // remaining branches can work against the structured `AttributeValueShape`.
  if (typeof raw === 'string') {
    values.push(raw);
    return values;
  }

  const v = raw;

  // ── Legacy SDK format ────────────────────────────────────────────────────
  if (v.colorValue) {
    values.push(v.colorValue);
  } else if (Array.isArray(v.textValues)) {
    // `textValues` is a localized array. The order is server-defined and
    // empty buckets are common (e.g. FR present but unset). Picking
    // `textValues[0]` blindly returned `[]` and silently hid every value
    // for any attribute whose first language slot was empty.
    const firstNonEmpty = (v.textValues as Array<{ values?: unknown }>).find(
      (entry) => Array.isArray(entry?.values) && entry.values.length > 0,
    );
    const list = (firstNonEmpty?.values as string[] | undefined) ?? [];
    return list.filter(Boolean);
  } else if (v.textValue) {
    values.push(v.textValue);
  } else if (v.numericValue !== undefined) {
    values.push(String(v.numericValue));
  } else if (v.booleanValue !== undefined) {
    values.push(v.booleanValue ? 'Yes' : 'No');
  }

  // ── Current SDK format (type-based) ─────────────────────────────────────
  else if (v.type === AttributeType.COLOR) {
    if (typeof v.value === 'string' && v.value) values.push(v.value);
  } else if (v.type === AttributeType.TEXT) {
    // Same first-non-empty pick as the legacy branch above.
    const buckets =
      v.value && typeof v.value === 'object'
        ? ((v.value.textValues ?? []) as Array<{ values?: unknown }>)
        : [];
    const firstNonEmpty = buckets.find(
      (entry) => Array.isArray(entry?.values) && entry.values.length > 0,
    );
    const textVals = (firstNonEmpty?.values as string[] | undefined) ?? [];
    return textVals.filter(Boolean);
  } else if (v.type === AttributeType.DECIMAL) {
    if (v.value !== undefined) values.push(String(v.value));
  } else if (v.type === AttributeType.INT) {
    if (v.value !== undefined) values.push(String(v.value));
  } else if (v.type === AttributeType.ENUM) {
    if (typeof v.value === 'string' && v.value) values.push(v.value);
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  else if (typeof v === 'object') {
    if (Array.isArray(v.values)) {
      return (v.values as unknown[]).filter((x): x is string => typeof x === 'string');
    }
    const strVals = Object.values(v).filter((x): x is string => typeof x === 'string');
    return strVals;
  }

  return values.filter(Boolean);
}

/**
 * Collects all unique values for a named attribute across a list of products.
 */
export function collectAttributeValues(
  products: import('propeller-sdk-v2').Product[],
  attributeName: string
): string[] {
  const set = new Set<string>();
  for (const product of products) {
    const items = product.attributes?.items as AttributeResult[] | undefined;
    if (!Array.isArray(items)) continue;
    for (const attr of items) {
      if (attributeNameMatches(attr, attributeName)) {
        extractAttributeValues(attr).forEach((v) => set.add(v));
      }
    }
  }
  return Array.from(set);
}

/**
 * Filters a product list to those that match ALL given attribute selections.
 */
export function filterProductsBySelections(
  products: import('propeller-sdk-v2').Product[],
  selections: Record<string, string>
): import('propeller-sdk-v2').Product[] {
  const entries = Object.entries(selections);
  if (entries.length === 0) return products;

  return products.filter((product) => {
    const items = product.attributes?.items as AttributeResult[] | undefined;
    if (!Array.isArray(items)) return false;
    return entries.every(([attrName, attrValue]) =>
      items.some(
        (attr) =>
          attributeNameMatches(attr, attrName) &&
          extractAttributeValues(attr).includes(attrValue)
      )
    );
  });
}
