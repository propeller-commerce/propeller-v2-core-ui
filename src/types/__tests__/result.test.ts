import { describe, it, expect } from 'vitest';
import { ok, err, tryAsync, type Result } from '../result';

describe('ok / err', () => {
  it('ok produces a success Result carrying the data', () => {
    const r: Result<number> = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe(42);
  });

  it('err produces a failure Result carrying the error', () => {
    const r: Result<number, string> = err('boom');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('boom');
  });

  it('discriminated union narrows correctly', () => {
    const r: Result<number, string> = Math.random() > 2 ? ok(1) : err('no');
    if (r.ok) {
      // TS knows `data` exists here
      expect(typeof r.data).toBe('number');
    } else {
      expect(typeof r.error).toBe('string');
    }
  });
});

describe('tryAsync', () => {
  it('wraps a resolved promise as ok', async () => {
    const r = await tryAsync(async () => 7);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe(7);
  });

  it('wraps a thrown Error as err with message', async () => {
    const r = await tryAsync(async () => {
      throw new Error('nope');
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('nope');
  });

  it('wraps a thrown non-Error as err with stringified value', async () => {
    const r = await tryAsync(async () => {
      throw 'just a string';
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('just a string');
  });
});
