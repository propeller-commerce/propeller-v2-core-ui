/**
 * userMode — derive the active interaction mode for a session.
 *
 * Three values, one for each runtime branch the UI needs to take:
 *   - 'anonymous' — no user logged in
 *   - 'b2b'       — Contact logged in (company account, B2B feature surface)
 *   - 'b2c'       — Customer logged in (individual account, B2C surface)
 *
 * Shop mode shapes the result:
 *   - 'b2b'    shop → any logged-in user is treated as b2b (b2b-only shops
 *                     never accept Customer logins; this is defensive).
 *   - 'b2c'    shop → any logged-in user is treated as b2c.
 *   - 'hybrid' shop → branch on SDK user type (Contact vs Customer).
 */

import { isContact } from './userIdentity';
import type { AnyUser } from './userIdentity';

export type ShopMode = 'b2b' | 'b2c' | 'hybrid';
export type UserMode = 'anonymous' | 'b2b' | 'b2c';

export function deriveUserMode(user: AnyUser, shopMode: ShopMode): UserMode {
  if (!user) return 'anonymous';
  if (shopMode === 'b2b') return 'b2b';
  if (shopMode === 'b2c') return 'b2c';
  return isContact(user) ? 'b2b' : 'b2c';
}
