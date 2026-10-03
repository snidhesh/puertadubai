import 'server-only';
import {unstable_cache} from 'next/cache';
import {z} from 'zod';

/**
 * Server-only fetcher for the latest reels on Dayan's Instagram profile,
 * via the Instagram API with Instagram Login:
 *
 *   GET https://graph.instagram.com/me/media?fields=…&access_token=<token>
 *   Response: { data: Media[], paging }
 *
 * `INSTAGRAM_ACCESS_TOKEN` is a long-lived token for a professional
 * (creator/business) account. It expires 60 days after issue unless it
 * is refreshed, so without it — or once it lapses — the home page simply
 * shows the handle band with no thumbnails.
 *
 * Thumbnail URLs are signed and expire, so they are never stored: the
 * list is cached for a few hours and rendered through `next/image`,
 * which serves the files from our own origin (no CSP change, no
 * third-party request from the visitor's browser).
 */

const INSTAGRAM_API_URL = process.env.INSTAGRAM_API_URL ?? 'https://graph.instagram.com/me/media';
const REVALIDATE_SECONDS = 6 * 60 * 60;
const FETCH_TIMEOUT_MS = 8_000;
/** Reels are interleaved with posts, so read a page deep enough to find six. */
const PAGE_SIZE = 30;

/** CDN hosts Instagram serves thumbnails from; mirrors `images.remotePatterns`. */
const ALLOWED_IMAGE_HOST = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/;

const MediaSchema = z.object({
  id: z.string(),
  media_type: z.string().optional().nullable(),
  media_product_type: z.string().optional().nullable(),
  permalink: z.string().optional().nullable(),
  thumbnail_url: z.string().optional().nullable(),
  timestamp: z.string().optional().nullable()
});

const ResponseSchema = z.object({data: z.array(MediaSchema)});

export type InstagramReel = {
  id: string;
  permalink: string;
  thumbnail: string;
};

function isAllowedUrl(value: string, host: RegExp): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && host.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** Newest-first reels with a usable thumbnail, from a raw API response. */
export function parseReels(json: unknown, limit: number): InstagramReel[] {
  const {data} = ResponseSchema.parse(json);
  const reels: InstagramReel[] = [];
  for (const item of data) {
    if (item.media_product_type !== 'REELS') continue;
    if (!item.permalink || !isAllowedUrl(item.permalink, /^(www\.)?instagram\.com$/)) continue;
    if (!item.thumbnail_url || !isAllowedUrl(item.thumbnail_url, ALLOWED_IMAGE_HOST)) continue;
    reels.push({id: item.id, permalink: item.permalink, thumbnail: item.thumbnail_url});
    if (reels.length === limit) break;
  }
  return reels;
}

// Throws on any failure so the data cache keeps the last good list
// instead of caching an empty one.
const getReels = unstable_cache(
  async (limit: number): Promise<InstagramReel[]> => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return [];
    const url = new URL(INSTAGRAM_API_URL);
    url.searchParams.set('fields', 'id,media_type,media_product_type,permalink,thumbnail_url,timestamp');
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('access_token', token);
    const res = await fetch(url, {cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)});
    if (!res.ok) throw new Error(`Instagram API responded ${res.status}`);
    return parseReels(await res.json(), limit);
  },
  ['instagram-reels'],
  {revalidate: REVALIDATE_SECONDS, tags: ['instagram-reels']}
);

/** Latest reels, or `[]` when the token is missing or the API fails. */
export async function fetchLatestReels(limit = 6): Promise<InstagramReel[]> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.warn('[instagram] INSTAGRAM_ACCESS_TOKEN not set — reels strip is hidden');
    return [];
  }
  try {
    return await getReels(limit);
  } catch (err) {
    // The message never includes the request URL, which carries the token.
    console.warn('[instagram] reels fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
