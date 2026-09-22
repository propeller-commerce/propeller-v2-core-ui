import { describe, it, expect } from 'vitest';
import {
  findPurchaserPac,
  isOverAuthorizationLimit,
  isCheckoutAllowed,
} from '../purchaseAuthorization';

const contact = (limit: number, companyId: number = 11, role = 'PURCHASER') =>
  ({
    contactId: 19,
    purchaseAuthorizationConfigs: {
      items: [{ purchaseRole: role, authorizationLimit: limit, company: { companyId } }],
    },
  }) as never;

const cart = (totalGross: number) => ({ total: { totalGross } });

describe('findPurchaserPac', () => {
  it('finds the config for the company the contact acts for', () => {
    expect(findPurchaserPac(contact(500), 11)?.authorizationLimit).toBe(500);
  });

  it('ignores a config for another company', () => {
    expect(findPurchaserPac(contact(500, 11), 12)).toBeUndefined();
  });

  it('ignores a non-PURCHASER role', () => {
    expect(findPurchaserPac(contact(500, 11, 'AUTHORIZATION_MANAGER'), 11)).toBeUndefined();
  });

  it('matches a companyId that arrives as a string', () => {
    expect(findPurchaserPac(contact(500, 11), '11')?.authorizationLimit).toBe(500);
  });

  it('returns undefined for a customer, and with no company', () => {
    expect(findPurchaserPac({ customerId: 3 } as never, 11)).toBeUndefined();
    expect(findPurchaserPac(contact(500), null)).toBeUndefined();
  });
});

describe('isOverAuthorizationLimit', () => {
  it('is true only above the limit', () => {
    expect(isOverAuthorizationLimit(contact(500), 11, cart(600))).toBe(true);
    expect(isOverAuthorizationLimit(contact(500), 11, cart(500))).toBe(false);
    expect(isOverAuthorizationLimit(contact(500), 11, cart(400))).toBe(false);
  });

  it('treats a zero limit as authorising nothing', () => {
    expect(isOverAuthorizationLimit(contact(0), 11, cart(1))).toBe(true);
  });

  it('does not limit customers or contacts without a PURCHASER config', () => {
    expect(isOverAuthorizationLimit({ customerId: 3 } as never, 11, cart(9999))).toBe(false);
    expect(isOverAuthorizationLimit(contact(500, 11, 'BUYER'), 11, cart(9999))).toBe(false);
  });

  it('reports not-over when there is no cart to measure', () => {
    // The caller must not read this as "checkout is allowed" — there is simply
    // nothing to compare. Callers gate on having a cart first.
    expect(isOverAuthorizationLimit(contact(500), 11, null)).toBe(false);
  });
});

describe('underscored SDK shapes', () => {
  // The SDK can serialize class instances with leading underscores on private
  // fields. A plain read finds nothing and reports every cart as within limit.
  const underscored = {
    contactId: 19,
    _purchaseAuthorizationConfigs: {
      _items: [
        { _purchaseRole: 'PURCHASER', _authorizationLimit: 500, _company: { _companyId: 11 } },
      ],
    },
  } as never;

  it('finds a PAC on a fully underscored user', () => {
    expect(findPurchaserPac(underscored, 11)).toBeDefined();
  });

  it('enforces the limit on an underscored user and cart', () => {
    expect(isOverAuthorizationLimit(underscored, 11, { _total: { _totalGross: 600 } } as never)).toBe(true);
    expect(isOverAuthorizationLimit(underscored, 11, { _total: { _totalGross: 400 } } as never)).toBe(false);
  });

  it('handles a mixed shape', () => {
    const mixed = {
      contactId: 19,
      purchaseAuthorizationConfigs: {
        items: [{ purchaseRole: 'PURCHASER', _authorizationLimit: 500, company: { _companyId: 11 } }],
      },
    } as never;
    expect(isOverAuthorizationLimit(mixed, 11, cart(600))).toBe(true);
  });
});

describe('isCheckoutAllowed', () => {
  it('is the inverse, and blocks an over-limit cart', () => {
    expect(isCheckoutAllowed(contact(500), 11, cart(600))).toBe(false);
    expect(isCheckoutAllowed(contact(500), 11, cart(400))).toBe(true);
  });
});
