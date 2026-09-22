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
  const items = ((user as Contact).purchaseAuthorizationConfigs?.items ?? []) as PacLike[];
  return items.find(
    (pac) =>
      pac?.purchaseRole === PURCHASER && Number(pac?.company?.companyId) === Number(companyId)
  );
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
  return (cart.total?.totalGross ?? 0) > (pac.authorizationLimit ?? 0);
}

/** Inverse of {@link isOverAuthorizationLimit} — reads better at a checkout gate. */
export function isCheckoutAllowed(
  user: Contact | Customer | null | undefined,
  companyId: number | string | null | undefined,
  cart: CartLike | null | undefined
): boolean {
  return !isOverAuthorizationLimit(user, companyId, cart);
}
