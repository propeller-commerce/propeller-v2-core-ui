import { describe, it, expect } from 'vitest';
import { GraphQLClient } from '@propeller-commerce/propeller-sdk-v2';
import { createServices, type Services } from '../createServices';

/**
 * `createServices` is a pure factory: it wraps a GraphQLClient in a typed
 * bundle of SDK service instances and memoizes the result per client via a
 * WeakMap. Constructing a GraphQLClient with a dummy endpoint makes no
 * network call, so this is fully unit-testable.
 */
function makeClient(): GraphQLClient {
  return new GraphQLClient({ endpoint: 'http://test.local/graphql', apiKey: '' });
}

const EXPECTED_SERVICE_KEYS: (keyof Services)[] = [
  'product',
  'cart',
  'user',
  'category',
  'order',
  'payMethod',
  'login',
  'address',
  'company',
  'crossupsell',
  'bundle',
  'favoriteList',
  'purchaseAuthConfig',
  'cluster',
  'orderlist',
];

describe('createServices', () => {
  it('returns a bundle with every expected service key', () => {
    const services = createServices(makeClient());
    for (const key of EXPECTED_SERVICE_KEYS) {
      expect(services[key], `missing service: ${key}`).toBeDefined();
    }
  });

  it('returns exactly the expected set of keys (no extras, no gaps)', () => {
    const services = createServices(makeClient());
    expect(Object.keys(services).sort()).toEqual([...EXPECTED_SERVICE_KEYS].sort());
  });

  it('every service entry is an object instance', () => {
    const services = createServices(makeClient());
    for (const key of EXPECTED_SERVICE_KEYS) {
      expect(typeof services[key]).toBe('object');
      expect(services[key]).not.toBeNull();
    }
  });

  it('memoizes per client — same client returns the identical bundle', () => {
    const client = makeClient();
    const first = createServices(client);
    const second = createServices(client);
    expect(second).toBe(first);
  });

  it('memoizes per client — service instances are reused, not rebuilt', () => {
    const client = makeClient();
    const first = createServices(client);
    const second = createServices(client);
    expect(second.cart).toBe(first.cart);
    expect(second.product).toBe(first.product);
  });

  it('a different client gets its own distinct bundle', () => {
    const a = createServices(makeClient());
    const b = createServices(makeClient());
    expect(b).not.toBe(a);
    expect(b.cart).not.toBe(a.cart);
  });
});
