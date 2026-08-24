import { describe, it, expect } from 'vitest';
import { getStockStatus, buildInventoryFilter } from '../inventoryHelpers';

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

describe('buildInventoryFilter', () => {
  it('sends no filter for the all-products selection', () => {
    expect(buildInventoryFilter('all')).toBeUndefined();
  });

  it('sends no filter when the selection is undefined', () => {
    expect(buildInventoryFilter(undefined)).toBeUndefined();
  });

  it('filters to stock >= 1 by default', () => {
    expect(buildInventoryFilter('in-stock')).toEqual({
      totalQuantity: { greaterThan: 1 },
    });
  });

  it('uses the requested threshold', () => {
    expect(buildInventoryFilter('in-stock', 5)).toEqual({
      totalQuantity: { greaterThan: 5 },
    });
  });

  it('ignores the threshold when not filtering by stock', () => {
    expect(buildInventoryFilter('all', 5)).toBeUndefined();
  });

  // A threshold below 1 would match zero-stock products, contradicting the control.
  it('clamps a threshold below the minimum back to 1', () => {
    expect(buildInventoryFilter('in-stock', 0)?.totalQuantity?.greaterThan).toBe(1);
    expect(buildInventoryFilter('in-stock', -3)?.totalQuantity?.greaterThan).toBe(1);
  });

  it('floors a fractional threshold', () => {
    expect(buildInventoryFilter('in-stock', 2.7)?.totalQuantity?.greaterThan).toBe(2);
  });

  // greaterThan is inclusive, so 1 keeps single-unit stock in the results.
  it('keeps single-unit stock at the default threshold', () => {
    expect(buildInventoryFilter('in-stock', 1)?.totalQuantity?.greaterThan).toBe(1);
  });

  it('never emits the other operators', () => {
    const f = buildInventoryFilter('in-stock', 3);
    expect(f?.totalQuantity?.lessThan).toBeUndefined();
    expect(f?.totalQuantity?.equal).toBeUndefined();
  });
});
