import { describe, it, expect } from 'vitest';
import { getStockStatus } from '../inventoryHelpers';

describe('getStockStatus', () => {
  it('reports "Out of stock" for zero quantity', () => {
    const s = getStockStatus(0);
    expect(s.label).toBe('Out of stock');
    expect(s.className).toContain('destructive');
  });

  it('reports "Out of stock" for negative quantity', () => {
    expect(getStockStatus(-3).label).toBe('Out of stock');
  });

  it('reports "Low stock" at the lower boundary (1)', () => {
    const s = getStockStatus(1);
    expect(s.label).toBe('Low stock');
    expect(s.className).toContain('warning');
  });

  it('reports "Low stock" at the upper boundary (5)', () => {
    expect(getStockStatus(5).label).toBe('Low stock');
  });

  it('reports "In stock" just above the low-stock threshold (6)', () => {
    const s = getStockStatus(6);
    expect(s.label).toBe('In stock');
    expect(s.className).toContain('success');
  });

  it('reports "In stock" for a large quantity', () => {
    expect(getStockStatus(1000).label).toBe('In stock');
  });

  it('always returns both a label and a className', () => {
    for (const q of [-1, 0, 1, 5, 6, 99]) {
      const s = getStockStatus(q);
      expect(typeof s.label).toBe('string');
      expect(s.label.length).toBeGreaterThan(0);
      expect(typeof s.className).toBe('string');
      expect(s.className.length).toBeGreaterThan(0);
    }
  });
});
