import { describe, it, expect } from 'vitest';
import { isContentHidden } from '../visibilityHelpers';
import type { Contact } from '@propeller-commerce/propeller-sdk-v2';

const someUser = { contactId: 1 } as Contact;

describe('isContentHidden', () => {
  it('hides content in semi-closed mode for an anonymous visitor', () => {
    expect(isContentHidden('semi-closed', null)).toBe(true);
    expect(isContentHidden('semi-closed', undefined)).toBe(true);
  });

  it('does NOT hide content in semi-closed mode for a logged-in user', () => {
    expect(isContentHidden('semi-closed', someUser)).toBe(false);
  });

  it('never hides content in open mode, logged in or not', () => {
    expect(isContentHidden('open', null)).toBe(false);
    expect(isContentHidden('open', someUser)).toBe(false);
  });

  it('never hides content in closed mode (closed gates at the route level, not here)', () => {
    expect(isContentHidden('closed', null)).toBe(false);
  });

  it('does not hide content when portalMode is undefined', () => {
    expect(isContentHidden(undefined, null)).toBe(false);
  });

  it('only the exact string "semi-closed" triggers hiding', () => {
    expect(isContentHidden('Semi-Closed', null)).toBe(false);
    expect(isContentHidden('semiclosed', null)).toBe(false);
  });

  describe('auth hydration window', () => {
    // Hosts paint from a thin cached hint before the full profile arrives, so
    // `user` is null for an authenticated visitor for the first frames.
    it('does not hide from an authenticated viewer whose profile is still loading', () => {
      expect(isContentHidden('semi-closed', null, true)).toBe(false);
    });

    it('still hides from a genuinely anonymous viewer', () => {
      expect(isContentHidden('semi-closed', null, false)).toBe(true);
    });

    it('omitting the flag preserves the previous behaviour', () => {
      expect(isContentHidden('semi-closed', null)).toBe(true);
    });

    it('a resolved user is never hidden, flag or not', () => {
      const user = { contactId: 1 } as never;
      expect(isContentHidden('semi-closed', user, false)).toBe(false);
      expect(isContentHidden('semi-closed', user, true)).toBe(false);
    });
  });
});
