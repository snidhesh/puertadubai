import 'server-only';
import {unstable_cache} from 'next/cache';
import {z} from 'zod';

/**
 * Server-only fetcher for the latest posts on Dayan's Instagram profile
 * (photos, carousels and reels), via the Instagram API with Instagram
 * Login:
 *
 *   GET https://graph.instagram.com/me/media?fields=…&access_token=<token>
 *   Response: { data: Media[], paging }
 *
 * `INSTAGRAM_ACCESS_TOKEN` is a long-lived token for a professional
 * (creator/business) account. It expires 60 days after issue unless it
 * is refreshed, so without it — or once it lapses — the home page simply
 * shows the handle band with no posts.
 *
 * Image URLs are signed and expire, so they are never stored: the list
 * is cached for a few hours and rendered through `next/image`, which
 * serves the files from our own origin (no CSP change, no third-party
 * request from the visitor's browser).
 */

const INSTAGRAM_API_URL = process.env.INSTAGRAM_API_URL ?? 'https://graph.instagram.com/me/media';
const REVALIDATE_SECONDS = 6 * 60 * 60;
const FETCH_TIMEOUT_MS = 8_000;
/** Read a few more than we show, in case some carry no usable image. */
const PAGE_SIZE = 18;

/** CDN hosts Instagram serves images from; mirrors `images.remotePatterns`. */
const ALLOWED_IMAGE_HOST = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/;

const MediaSchema = z.object({
  id: z.string(),
  media_type: z.string().optional().nullable(),
  media_product_type: z.string().optional().nullable(),
  permalink: z.string().optional().nullable(),
  media_url: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  timestamp: z.string().optional().nullable()
});

const ResponseSchema = z.object({data: z.array(MediaSchema)});

export type InstagramPost = {
  id: string;
  permalink: string;
  image: string;
  /** Reels and other videos get a play glyph on the tile. */
  video: boolean;
};

function isAllowedUrl(value: string, host: RegExp): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && host.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** Newest-first posts with a usable image, from a raw API response. */
export function parsePosts(json: unknown, limit: number): InstagramPost[] {
  const {data} = ResponseSchema.parse(json);
  const posts: InstagramPost[] = [];
  for (const item of data) {
    const video = item.media_type === 'VIDEO';
    // A video's `media_url` is the video file; its still is `thumbnail_url`.
    const image = video ? item.thumbnail_url : item.media_url;
    if (!item.permalink || !isAllowedUrl(item.permalink, /^(www\.)?instagram\.com$/)) continue;
    if (!image || !isAllowedUrl(image, ALLOWED_IMAGE_HOST)) continue;
    posts.push({id: item.id, permalink: item.permalink, image, video});
    if (posts.length === limit) break;
  }
  return posts;
}

// Throws on any failure so the data cache keeps the last good list
// instead of caching an empty one.
const getPosts = unstable_cache(
  async (limit: number): Promise<InstagramPost[]> => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return [];
    const url = new URL(INSTAGRAM_API_URL);
    url.searchParams.set(
      'fields',
      'id,media_type,media_product_type,permalink,media_url,thumbnail_url,timestamp'
    );
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('access_token', token);
    const res = await fetch(url, {cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)});
    if (!res.ok) throw new Error(`Instagram API responded ${res.status}`);
    return parsePosts(await res.json(), limit);
  },
  ['instagram-posts'],
  {revalidate: REVALIDATE_SECONDS, tags: ['instagram-posts']}
);

/** Latest posts, or `[]` when the token is missing or the API fails. */
export async function fetchLatestPosts(limit = 6): Promise<InstagramPost[]> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.warn('[instagram] INSTAGRAM_ACCESS_TOKEN not set — posts grid is hidden');
    return [];
  }
  try {
    return await getPosts(limit);
  } catch (err) {
    // The message never includes the request URL, which carries the token.
    console.warn('[instagram] posts fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
