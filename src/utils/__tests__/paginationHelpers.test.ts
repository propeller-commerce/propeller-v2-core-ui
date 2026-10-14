import { describe, it, expect } from 'vitest';
import { shouldHandlePaginationClick, paginationRel } from '../paginationHelpers';

describe('shouldHandlePaginationClick', () => {
  it('handles a plain left click', () => {
    expect(shouldHandlePaginationClick({ button: 0 })).toBe(true);
    expect(shouldHandlePaginationClick({})).toBe(true);
    expect(shouldHandlePaginationClick()).toBe(true);
  });

  // These must reach the browser or open-in-new-tab stops working.
  it('leaves a modified click to the browser', () => {
    expect(shouldHandlePaginationClick({ button: 0, metaKey: true })).toBe(false);
    expect(shouldHandlePaginationClick({ button: 0, ctrlKey: true })).toBe(false);
    expect(shouldHandlePaginationClick({ button: 0, shiftKey: true })).toBe(false);
    expect(shouldHandlePaginationClick({ button: 0, altKey: true })).toBe(false);
  });

  it('leaves a middle or right click to the browser', () => {
    expect(shouldHandlePaginationClick({ button: 1 })).toBe(false);
    expect(shouldHandlePaginationClick({ button: 2 })).toBe(false);
  });

  it('does not re-handle an already handled event', () => {
    expect(shouldHandlePaginationClick({ button: 0, defaultPrevented: true })).toBe(false);
  });
});

describe('paginationRel', () => {
  it('marks only the adjacent pages', () => {
    expect(paginationRel(2, 3)).toBe('prev');
    expect(paginationRel(4, 3)).toBe('next');
    expect(paginationRel(3, 3)).toBeUndefined();
    expect(paginationRel(1, 3)).toBeUndefined();
    expect(paginationRel(5, 3)).toBeUndefined();
  });
});
