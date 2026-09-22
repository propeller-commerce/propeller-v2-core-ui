import type { Contact, Customer } from '@propeller-commerce/propeller-sdk-v2';

/** A cart total shape — only the field the limit is compared against. */
interface CartLike {
  total?: { totalGross?: number | null } | null;
}

/** Minimal PAC shape, so callers need not import the SDK enum. */
interface PacLike {
  purchaseRole?: string | null;
  authorizationLimit?: number | null;
  company?: { companyId?: number | string | null } | null;
}

const PURCHASER = 'PURCHASER';

/**
 * Read a field that may arrive under its own name or underscore-prefixed.
 *
 * The SDK can serialize class instances with leading underscores on private
 * fields. Hosts normally sanitize on login, but any path that bypasses that —
 * or stale storage from a previous session — leaves the underscored shape, and
 * a plain read then silently finds nothing.
 */
function field<T>(source: unknown, name: string): T | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const bag = source as Record<string, unknown>;
  return (bag[name] ?? bag[`_${name}`]) as T | undefined;
}

/**
 * The PURCHASER purchase-authorization config that applies to a contact
 * acting for a company, or `undefined` when there is none.
 *
 * `companyId` is compared numerically: it reaches components as a number from
 * the provider but can arrive as a string from a cookie or a URL.
 */
export function findPurchaserPac(
  user: Contact | Customer | null | undefined,
  companyId: number | string | null | undefined
): PacLike | undefined {
  if (!user || !('contactId' in user) || companyId == null) return undefined;
  const configs = field<{ items?: PacLike[] }>(user, 'purchaseAuthorizationConfigs');
  const items = field<PacLike[]>(configs, 'items') ?? [];
  return items.find((pac) => {
    if (field<string>(pac, 'purchaseRole') !== PURCHASER) return false;
    const company = field<Record<string, unknown>>(pac, 'company');
    return Number(field<number | string>(company, 'companyId')) === Number(companyId);
  });
}

/**
 * Whether a cart exceeds the contact's purchase-authorization limit, i.e.
 * whether it needs an authorization request instead of a checkout.
 *
 * `cart` is a required argument rather than ambient state: the limit cannot be
 * evaluated without a total, and a version of this that defaulted a missing
 * cart to "allowed" reported over-limit carts as checkout-able wherever the
 * caller had not separately loaded one.
 *
 * Returns `false` for customers, for contacts acting for no company, and for
 * contacts with no PURCHASER config — none of them are limited.
 */
export function isOverAuthorizationLimit(
  user: Contact | Customer | null | undefined,
  companyId: number | string | null | undefined,
  cart: CartLike | null | undefined
): boolean {
  if (!cart) return false;
  const pac = findPurchaserPac(user, companyId);
  if (!pac) return false;
  const limit = field<number>(pac, 'authorizationLimit') ?? 0;
  const total = field<Record<string, unknown>>(cart, 'total');
  const totalGross = field<number>(total, 'totalGross') ?? 0;
  return totalGross > limit;
}

/** Inverse of {@link isOverAuthorizationLimit} — reads better at a checkout gate. */
export function isCheckoutAllowed(
  user: Contact | Customer | null | undefined,
  companyId: number | string | null | undefined,
  cart: CartLike | null | undefined
): boolean {
  return !isOverAuthorizationLimit(user, companyId, cart);
}
