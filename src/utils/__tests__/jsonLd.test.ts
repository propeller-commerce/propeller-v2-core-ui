import { describe, it, expect } from 'vitest';
import { safeJsonStringify } from '../jsonLd';

describe('safeJsonStringify', () => {
  const value = {
    description: 'a </script><script>alert(1)</script> <!-- x --> & b',
    sep: 'line\u2028para\u2029end',
  };

  it('leaves no character that can end the script block or a JS line', () => {
    const out = safeJsonStringify(value);
    expect(out).not.toMatch(/[<>&\u2028\u2029]/);
    expect(out).toContain('\\u003c/script\\u003e');
    expect(out).toContain('\\u003c!--');
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
  });

  it('is still JSON that parses back to the same value', () => {
    expect(JSON.parse(safeJsonStringify(value))).toEqual(value);
  });
});
