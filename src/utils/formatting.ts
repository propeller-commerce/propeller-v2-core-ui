/**
 * formatting — Price and date formatting helpers.
 *
 * Framework-agnostic pure functions.
 */

/**
 * Maps a storefront language code ('EN', 'NL', …) to the BCP-47 locale used to
 * format numbers and dates for it.
 *
 * Number formatting and the currency are two independent decisions, and only
 * the currency was ever reachable: prices on an English storefront came out
 * with Dutch separators because every caller left the locale at its `nl-NL`
 * default. Pass `localeForLanguage(language)` and the separators follow the
 * language the shopper is reading.
 *
 * An explicit BCP-47 tag (one containing a `-`) is returned unchanged, so a
 * shop can pin `en-US` vs `en-GB` itself.
 */
export function localeForLanguage(language?: string | null): string {
  if (!language) return 'nl-NL';
  if (language.includes('-')) return language;
  const known: Record<string, string> = {
    NL: 'nl-NL',
    EN: 'en-GB',
    DE: 'de-DE',
    FR: 'fr-FR',
    ES: 'es-ES',
    IT: 'it-IT',
    BE: 'nl-BE',
  };
  return known[language.toUpperCase()] ?? 'nl-NL';
}

/**
 * Formats a numeric price to a localised currency string.
 * Defaults to EUR (€) with 2 decimal places.
 */
export function formatPrice(
  amount: number | null | undefined,
  options: {
    currency?: string;
    locale?: string;
    symbol?: string;
  } = {}
): string {
  if (amount === null || amount === undefined) return '';
  const { currency = 'EUR', locale = 'nl-NL', symbol } = options;

  // With an explicit symbol, still format the NUMBER with the locale (so a
  // Dutch locale yields `9,50`, not `9.50`) and prefix the symbol. Previously
  // this branch did `${symbol}${toFixed(2)}`, which always emitted a
  // period-decimal, English-style amount (`€9.50`) regardless of locale.
  if (symbol !== undefined) {
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
    if (!symbol) return formattedNumber;
    // Where the symbol sits, and whether a space follows it, is part of the
    // locale — `€ 9,50` in nl-NL but `£3.45` in en-GB. Hardcoding
    // `${symbol} ${number}` made every non-Dutch shop render `£ 3,45`: right
    // glyph, Dutch spacing, Dutch separators. Ask Intl to lay out a currency
    // amount in this locale and swap its symbol for ours.
    // Intl separates the two with U+00A0; normalise it so callers comparing
    // against a plain space keep matching.
    try {
      const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).formatToParts(Number(amount));
      if (parts.some((part) => part.type === 'currency')) {
        return parts
          .map((part) => (part.type === 'currency' ? symbol : part.value))
          .join('')
          .replace(/ /g, ' ');
      }
    } catch {
      /* Unknown currency code — fall through to the simple prefix below. */
    }
    return `${symbol} ${formattedNumber}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `€${Number(amount).toFixed(2)}`;
  }
}

/**
 * Formats a date string or Date object to a localised date string.
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: {
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
  } = {}
): string {
  if (!date) return '';
  const { locale = 'nl-NL', dateStyle = 'medium' } = options;

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(locale, { dateStyle }).format(d);
  } catch {
    return String(date);
  }
}

/**
 * Formats a single product/cart surcharge line, mirroring playground-v2's
 * `propeller-product-surcharges.php`:
 *   - `FlatFee`     → `{qty} x {symbol} {value} ({name})`  e.g. `1 x € 0,25 (Statiegeld S)`
 *   - `Percentage`  → `{qty} x {value}% ({name})`          e.g. `1 x 5% (Handling)`
 *
 * Works for both shapes the backend returns:
 *   - `Surcharge` (product) — localized name under `name`
 *   - `CartItemSurcharge` (cart line) — localized name under `names`
 */
export function formatSurcharge(
  surcharge: {
    name?: { value?: string; language?: string }[];
    names?: { value?: string; language?: string }[];
    type?: string;
    value?: number;
  },
  options: {
    quantity?: number;
    language?: string;
    currency?: string;
    locale?: string;
  } = {}
): string {
  if (!surcharge) return '';
  const { quantity = 1, language, currency = '€', locale = 'nl-NL' } = options;

  const localized = surcharge.names ?? surcharge.name ?? [];
  const name =
    localized.find((n) => n.language === language)?.value ?? localized[0]?.value ?? '';

  const value = Number(surcharge.value ?? 0);
  const isPercentage = String(surcharge.type ?? '').toLowerCase() === 'percentage';

  if (isPercentage) {
    return `${quantity} x ${value}% (${name})`;
  }
  return `${quantity} x ${formatPrice(value, { symbol: currency, locale })} (${name})`;
}

/**
 * Calculates the percentage discount between original and discounted price.
 * Returns 0 if original is 0 or undefined.
 */
export function calcDiscountPercent(
  original: number | null | undefined,
  discounted: number | null | undefined
): number {
  if (!original || original === 0) return 0;
  if (discounted === null || discounted === undefined) return 0;
  return Math.round(((original - discounted) / original) * 100);
}
