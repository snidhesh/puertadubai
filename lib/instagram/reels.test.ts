import {describe, expect, it, vi} from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({unstable_cache: (fn: unknown) => fn}));

import {parseReels} from './reels';

const reel = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  media_type: 'VIDEO',
  media_product_type: 'REELS',
  permalink: `https://www.instagram.com/reel/${id}/`,
  thumbnail_url: `https://scontent-fra3-1.cdninstagram.com/v/t51/${id}.jpg?oh=abc&oe=123`,
  timestamp: '2026-09-30T10:00:00+0000',
  ...overrides
});

describe('parseReels', () => {
  it('keeps reels only, newest first, up to the limit', () => {
    const json = {
      data: [
        reel('a'),
        {id: 'post', media_type: 'IMAGE', media_product_type: 'FEED', permalink: 'https://www.instagram.com/p/post/'},
        reel('b'),
        reel('c')
      ]
    };
    expect(parseReels(json, 2).map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('drops reels without a thumbnail or with one on an unexpected host', () => {
    const json = {
      data: [
        reel('a', {thumbnail_url: null}),
        reel('b', {thumbnail_url: 'https://evil.example/x.jpg'}),
        reel('c', {thumbnail_url: 'http://scontent.cdninstagram.com/x.jpg'}),
        reel('d', {thumbnail_url: 'https://notcdninstagram.com/x.jpg'}),
        reel('e', {thumbnail_url: 'https://scontent.xx.fbcdn.net/x.jpg'})
      ]
    };
    expect(parseReels(json, 6).map((r) => r.id)).toEqual(['e']);
  });

  it('drops reels whose permalink is not on instagram.com', () => {
    const json = {data: [reel('a', {permalink: 'https://example.com/reel/a/'}), reel('b')]};
    expect(parseReels(json, 6).map((r) => r.id)).toEqual(['b']);
  });

  it('throws on a malformed response so the cache keeps the last good list', () => {
    expect(() => parseReels({error: {message: 'Invalid OAuth access token'}}, 6)).toThrow();
  });
});
