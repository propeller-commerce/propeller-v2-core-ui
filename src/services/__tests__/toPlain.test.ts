import { describe, it, expect } from 'vitest';
import { toPlain } from '../toPlain';

describe('toPlain', () => {
  it('strips a single leading underscore from object keys', () => {
    expect(toPlain({ _firstName: 'Ada' })).toEqual({ firstName: 'Ada' });
  });

  it('leaves keys without a leading underscore untouched', () => {
    expect(toPlain({ firstName: 'Ada' })).toEqual({ firstName: 'Ada' });
  });

  it('strips only the first underscore, not subsequent ones', () => {
    expect(toPlain({ __double: 1 })).toEqual({ _double: 1 });
  });

  it('recurses into nested objects', () => {
    const input = { _company: { _companyId: 7, _name: 'Acme' } };
    expect(toPlain(input)).toEqual({ company: { companyId: 7, name: 'Acme' } });
  });

  it('recurses into arrays of objects', () => {
    const input = { _items: [{ _id: 1 }, { _id: 2 }] };
    expect(toPlain(input)).toEqual({ items: [{ id: 1 }, { id: 2 }] });
  });

  it('preserves primitive array members', () => {
    expect(toPlain({ _tags: ['a', 'b', 'c'] })).toEqual({ tags: ['a', 'b', 'c'] });
  });

  it('returns null and undefined unchanged', () => {
    expect(toPlain(null)).toBeNull();
    expect(toPlain(undefined)).toBeUndefined();
  });

  it('returns primitives unchanged', () => {
    expect(toPlain(42)).toBe(42);
    expect(toPlain('hello')).toBe('hello');
    expect(toPlain(true)).toBe(true);
  });

  it('preserves nested null/undefined values', () => {
    const input = { _a: null, _b: undefined, _c: 0 };
    expect(toPlain(input)).toEqual({ a: null, b: undefined, c: 0 });
  });

  it('handles a realistic SDK-instance shape (underscore backing fields)', () => {
    const sdkLike = {
      _contactId: 100,
      _firstName: 'Grace',
      _company: {
        _companyId: 5,
        _addresses: { _items: [{ _street: 'Main', _isDefault: 'Y' }] },
      },
    };
    expect(toPlain(sdkLike)).toEqual({
      contactId: 100,
      firstName: 'Grace',
      company: {
        companyId: 5,
        addresses: { items: [{ street: 'Main', isDefault: 'Y' }] },
      },
    });
  });

  it('produces a new object, not a mutation of the input', () => {
    const input = { _id: 1 };
    const out = toPlain(input);
    expect(out).not.toBe(input);
    expect(input).toEqual({ _id: 1 });
  });

  it('handles a top-level array', () => {
    expect(toPlain([{ _id: 1 }, { _id: 2 }])).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('handles an empty object and empty array', () => {
    expect(toPlain({})).toEqual({});
    expect(toPlain([])).toEqual([]);
  });
});
