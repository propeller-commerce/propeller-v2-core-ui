import { describe, it, expect } from 'vitest';
import type { Contact, Customer, Address } from 'propeller-sdk-v2';
import {
  isContact,
  isCustomer,
  getUserId,
  getCompany,
  getCompanyId,
  getAddresses,
  getDefaultInvoiceAddress,
  getDefaultDeliveryAddress,
} from '../userIdentity';

const invoiceAddr = { type: 'invoice', isDefault: 'Y', street: 'Invoice St' } as Address;
const deliveryAddr = { type: 'delivery', isDefault: 'Y', street: 'Delivery St' } as Address;
const nonDefaultAddr = { type: 'invoice', isDefault: 'N', street: 'Other St' } as Address;

const contact = {
  contactId: 42,
  company: {
    companyId: 7,
    addresses: [invoiceAddr, deliveryAddr, nonDefaultAddr],
  },
} as unknown as Contact;

const customer = {
  customerId: 99,
  addresses: [invoiceAddr, deliveryAddr],
} as unknown as Customer;

describe('isContact', () => {
  it('is true for an object with a contactId', () => {
    expect(isContact(contact)).toBe(true);
  });

  it('is false for a customer and for null', () => {
    expect(isContact(customer)).toBe(false);
    expect(isContact(null)).toBe(false);
  });
});

describe('isCustomer', () => {
  it('is true for an object with a customerId and no contactId', () => {
    expect(isCustomer(customer)).toBe(true);
  });

  it('is false for a contact and for null', () => {
    expect(isCustomer(contact)).toBe(false);
    expect(isCustomer(null)).toBe(false);
  });

  it('is false for an object carrying both ids (treated as a contact)', () => {
    const hybrid = { contactId: 1, customerId: 2 } as unknown as Customer;
    expect(isCustomer(hybrid)).toBe(false);
    expect(isContact(hybrid)).toBe(true);
  });
});

describe('getUserId', () => {
  it('returns the contactId for a contact', () => {
    expect(getUserId(contact)).toBe(42);
  });

  it('returns the customerId for a customer', () => {
    expect(getUserId(customer)).toBe(99);
  });

  it('returns null for a null user', () => {
    expect(getUserId(null)).toBeNull();
  });

  it('returns null for a contact whose contactId is absent', () => {
    const c = { contactId: undefined, company: {} } as unknown as Contact;
    expect(getUserId(c)).toBeNull();
  });

  it('returns null for a customer whose customerId is absent', () => {
    const c = { customerId: undefined } as unknown as Customer;
    expect(getUserId(c)).toBeNull();
  });
});

describe('getCompany / getCompanyId', () => {
  it("returns a contact's company and companyId", () => {
    expect(getCompany(contact)?.companyId).toBe(7);
    expect(getCompanyId(contact)).toBe(7);
  });

  it('returns null for a customer (customers have no company in this model)', () => {
    expect(getCompany(customer)).toBeNull();
    expect(getCompanyId(customer)).toBeNull();
  });

  it('returns null for a null user', () => {
    expect(getCompany(null)).toBeNull();
    expect(getCompanyId(null)).toBeNull();
  });
});

describe('getAddresses', () => {
  it("returns the contact's company addresses", () => {
    expect(getAddresses(contact)).toHaveLength(3);
  });

  it("returns the customer's own addresses", () => {
    expect(getAddresses(customer)).toHaveLength(2);
  });

  it('returns an empty array for a null user', () => {
    expect(getAddresses(null)).toEqual([]);
  });

  it('returns an empty array when the address list is absent', () => {
    expect(getAddresses({ contactId: 1 } as Contact)).toEqual([]);
    expect(getAddresses({ customerId: 1 } as Customer)).toEqual([]);
  });
});

describe('getDefaultInvoiceAddress / getDefaultDeliveryAddress', () => {
  it('finds the default invoice address', () => {
    expect(getDefaultInvoiceAddress(contact)?.street).toBe('Invoice St');
  });

  it('finds the default delivery address', () => {
    expect(getDefaultDeliveryAddress(contact)?.street).toBe('Delivery St');
  });

  it('ignores non-default addresses of the right type', () => {
    const onlyNonDefault = {
      contactId: 1,
      company: { addresses: [nonDefaultAddr] },
    } as unknown as Contact;
    expect(getDefaultInvoiceAddress(onlyNonDefault)).toBeUndefined();
  });

  it('returns undefined when no matching address exists', () => {
    expect(getDefaultDeliveryAddress(null)).toBeUndefined();
    expect(getDefaultInvoiceAddress({ contactId: 1 } as Contact)).toBeUndefined();
  });
});
