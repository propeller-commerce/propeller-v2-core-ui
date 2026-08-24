/**
 * formatting — Price and date formatting helpers.
 *
 * Framework-agnostic pure functions.
 */

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
    return symbol ? `${symbol} ${formattedNumber}` : formattedNumber;
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
