import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({unstable_cache: (fn: unknown) => fn}));

import {parsePosts} from './posts';

const cdn = (id: string) => `https://scontent-fra3-1.cdninstagram.com/v/t51/${id}.jpg?oh=abc&oe=123`;

const photo = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  media_type: 'IMAGE',
  media_product_type: 'FEED',
  permalink: `https://www.instagram.com/p/${id}/`,
  media_url: cdn(id),
  timestamp: '2026-09-30T10:00:00+0000',
  ...overrides
});

const reel = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  media_type: 'VIDEO',
  media_product_type: 'REELS',
  permalink: `https://www.instagram.com/reel/${id}/`,
  media_url: `https://scontent-fra3-1.cdninstagram.com/v/${id}.mp4`,
  thumbnail_url: cdn(`${id}-thumb`),
  timestamp: '2026-09-30T10:00:00+0000',
  ...overrides
});

describe('parsePosts', () => {
  it('keeps photos, carousels and reels in feed order, up to the limit', () => {
    const json = {data: [photo('a'), reel('b'), photo('c', {media_type: 'CAROUSEL_ALBUM'}), photo('d')]};
    expect(parsePosts(json, 3).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('uses the still for a video and flags it, and the media file for a photo', () => {
    const [a, b] = parsePosts({data: [photo('a'), reel('b')]}, 6);
    expect(a).toMatchObject({image: cdn('a'), video: false});
    expect(b).toMatchObject({image: cdn('b-thumb'), video: true});
  });

  it('drops posts with no image or with one on an unexpected host', () => {
    const json = {
      data: [
        reel('a', {thumbnail_url: null}),
        photo('b', {media_url: 'https://evil.example/x.jpg'}),
        photo('c', {media_url: 'http://scontent.cdninstagram.com/x.jpg'}),
        photo('d', {media_url: 'https://notcdninstagram.com/x.jpg'}),
        photo('e', {media_url: 'https://scontent.xx.fbcdn.net/x.jpg'})
      ]
    };
    expect(parsePosts(json, 6).map((p) => p.id)).toEqual(['e']);
  });

  it('drops posts whose permalink is not on instagram.com', () => {
    const json = {data: [photo('a', {permalink: 'https://example.com/p/a/'}), photo('b')]};
    expect(parsePosts(json, 6).map((p) => p.id)).toEqual(['b']);
  });

  it('throws on a malformed response so the cache keeps the last good list', () => {
    expect(() => parsePosts({error: {message: 'Invalid OAuth access token'}}, 6)).toThrow();
  });
});
