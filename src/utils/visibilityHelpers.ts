import type { Contact, Customer } from '@propeller-commerce/propeller-sdk-v2';

export function isContentHidden(
  portalMode: string | undefined,
  user: Contact | Customer | null | undefined
): boolean {
  return portalMode === 'semi-closed' && !user;
}
