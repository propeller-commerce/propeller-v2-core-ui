/**
 * Recursively converts an SDK class instance (or any nested object/array) into
 * a plain JSON-safe object, stripping the leading underscore that the SDK uses
 * for private backing fields (`_items` → `items`, `_firstName` → `firstName`,
 * `_purchaseAuthorizationConfigs` → `purchaseAuthorizationConfigs`).
 *
 * Why this exists: the propeller SDK returns class instances whose getters
 * forward to underscore-prefixed properties. Anything that serializes them
 * (JSON.stringify into localStorage, React state diffing, deep-equals checks)
 * sees the underscored shape — which forces consumers to write
 * `(obj as any).items ?? (obj as any)._items` everywhere. Applying `toPlain`
 * once at the boundary (e.g. right after `getViewer`) lets all downstream code
 * use the clean SDK type names and types.
 *
 * Generic preserves the *advertised* shape so consumers don't have to re-cast.
 * The structural conversion is correct at runtime; the type assertion is the
 * honest answer to "I trust the SDK's public types describe the cleaned shape".
 */
export function toPlain<T>(value: T): T {
  return deepPlainInner(value) as T;
}

function deepPlainInner(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(deepPlainInner);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      const cleanKey = key.startsWith('_') ? key.slice(1) : key;
      out[cleanKey] = deepPlainInner((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}
