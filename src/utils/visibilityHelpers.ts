import type { Contact, Customer } from '@propeller-commerce/propeller-sdk-v2';

/**
 * Whether semi-closed content should be hidden from this viewer.
 *
 * `isAuthenticated` closes a hydration window: hosts paint from a thin cached
 * hint before the full profile arrives, so `user` is null for an authenticated
 * visitor for the first frames. Without the flag, a signed-in shopper sees
 * "Log in to order" and blanked prices until `getViewer()` resolves. Note the
 * host's `isLoading` is already false by then, so it cannot serve this purpose.
 *
 * Optional, and omitting it preserves the previous behaviour — server renders
 * (which have no such window) pass two arguments as before.
 */
export function isContentHidden(
  portalMode: string | undefined,
  user: Contact | Customer | null | undefined,
  isAuthenticated?: boolean
): boolean {
  return portalMode === 'semi-closed' && !user && !isAuthenticated;
}
