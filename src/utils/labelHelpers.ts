/**
 * Resolve a UI string from a label dictionary.
 *
 * `??`, not `||`: an empty string is a deliberate value — the normal way to
 * hide a label — and must survive rather than fall back to the English default.
 *
 * A missing key warns once per key in development. The fallbacks are English,
 * so a key absent from a shipped locale renders English inside an otherwise
 * translated page, which looks like a translation rather than a gap.
 */
export function getLabel(
  labels: Record<string, string> | null | undefined,
  key: string,
  fallback: string
): string {
  const value = labels?.[key];
  if (value !== undefined && value !== null) return value;
  warnMissingLabel(key, fallback);
  return fallback;
}

const warnedKeys = new Set<string>();

function warnMissingLabel(key: string, fallback: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  // eslint-disable-next-line no-console
  console.warn(
    `[propeller] Missing label "${key}" — falling back to "${fallback}". ` +
      `Add it to the locale dictionary for this component's namespace.`
  );
}
