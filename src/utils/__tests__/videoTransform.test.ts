import { describe, it, expect } from 'vitest';
import { isEmbeddable, normalizeVideoUrl } from '../videoTransform';

describe('isEmbeddable', () => {
  it('recognises a YouTube watch URL', () => {
    expect(isEmbeddable('https://www.youtube.com/watch?v=abc123')).toBe(true);
  });

  it('recognises a youtu.be short URL', () => {
    expect(isEmbeddable('https://youtu.be/abc123')).toBe(true);
  });

  it('recognises a Vimeo URL', () => {
    expect(isEmbeddable('https://vimeo.com/123456')).toBe(true);
  });

  it('rejects an unrelated URL', () => {
    expect(isEmbeddable('https://example.com/video.mp4')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isEmbeddable('')).toBe(false);
  });
});

describe('normalizeVideoUrl', () => {
  it('converts a YouTube watch URL to an embed URL', () => {
    expect(normalizeVideoUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123'
    );
  });

  it('keeps the video id when the watch URL has extra query params', () => {
    expect(normalizeVideoUrl('https://www.youtube.com/watch?v=abc123&t=30s')).toBe(
      'https://www.youtube.com/embed/abc123'
    );
  });

  it('converts a youtu.be short URL to an embed URL', () => {
    expect(normalizeVideoUrl('https://youtu.be/xyz789')).toBe(
      'https://www.youtube.com/embed/xyz789'
    );
  });

  it('strips query params from a youtu.be short URL', () => {
    expect(normalizeVideoUrl('https://youtu.be/xyz789?t=10')).toBe(
      'https://www.youtube.com/embed/xyz789'
    );
  });

  it('converts a Vimeo URL to a player embed URL', () => {
    expect(normalizeVideoUrl('https://vimeo.com/123456')).toBe(
      'https://player.vimeo.com/video/123456'
    );
  });

  it('strips query params from a Vimeo URL', () => {
    expect(normalizeVideoUrl('https://vimeo.com/123456?autoplay=1')).toBe(
      'https://player.vimeo.com/video/123456'
    );
  });

  it('returns a non-embeddable URL unchanged', () => {
    const url = 'https://example.com/video.mp4';
    expect(normalizeVideoUrl(url)).toBe(url);
  });

  it('returns an already-embed YouTube URL unchanged (no /watch segment)', () => {
    const url = 'https://www.youtube.com/embed/abc123';
    expect(normalizeVideoUrl(url)).toBe(url);
  });

  it('returns the input unchanged when a watch-style string is not a parseable URL', () => {
    const malformed = 'youtube.com/watch?v=abc';
    expect(normalizeVideoUrl(malformed)).toBe(malformed);
  });
});
