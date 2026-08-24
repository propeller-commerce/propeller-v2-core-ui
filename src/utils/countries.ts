export interface Country {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

/**
 * Same data as COUNTRIES, in `{ code: name }` map form. RegisterForm's
 * `countries` prop is typed as `Record<string, string>` (matches the React
 * counterpart's contract), so consumers that pass to RegisterForm should use
 * this export. Order is preserved from COUNTRIES — modern JS object literals
 * keep insertion order for string keys.
 */
export const COUNTRIES_MAP: Record<string, string> = COUNTRIES.reduce(
  (acc, c) => {
    acc[c.code] = c.name;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Resolve an ISO country code to a display name.
 * @param code   The country code (e.g. 'NL').
 * @param list   Optional caller-supplied list (e.g. a localized list).
 *               Falls back to the built-in COUNTRIES when omitted/empty.
 */
export function getCountryName(
  code: string | null | undefined,
  list?: Country[] | null,
): string {
  if (!code) return '';
  const effective = list && list.length > 0 ? list : COUNTRIES;
  const match = effective.find((c) => c.code === code);
  return match?.name ?? code;
}
