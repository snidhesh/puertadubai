import 'server-only';
import {unstable_cache} from 'next/cache';
import {z} from 'zod';

/**
 * Server-only fetcher for the BlackOak Studio public listings feed.
 *
 *   GET https://studio.blackoak-re.com/api/v1/public/listings
 *   Headers: X-API-Key: <STUDIO_API_KEY>
 *   Response: { data: Listing[], total, page, limit }
 *
 * Contract verified against the live endpoint on 2026-06-07 — Bearer
 * auth is NOT accepted; the header name is `X-API-Key` (case-insensitive).
 *
 * At portfolio scope we skip the cron-into-Postgres mirror that
 * mustafa_profile uses; direct ISR is sufficient. Cache window matches
 * the rest of the marketing site (5 min). For push-style freshness later,
 * wire a Studio webhook to a small route that calls
 * `revalidateTag('studio-properties')`.
 */

const STUDIO_API_URL =
  process.env.STUDIO_API_URL ?? 'https://studio.blackoak-re.com/api/v1/public/listings';
const REVALIDATE_SECONDS = 300;
// 25s per request — comfortable headroom for Studio cold-starts on the
// paginated agent fetch (8 pages in parallel). Warm requests still
// resolve in ~1s; this only sets the budget for outliers.
const FETCH_TIMEOUT_MS = 25_000;

const StudioListingSchema = z.object({
  id: z.string(),
  titleEn: z.string().optional().nullable(),
  titleAr: z.string().optional().nullable(),
  address: z.string().optional().default(''),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  // Offering: "sale" or "yearly" (rental). The feed uses "yearly" not "rent".
  offering: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  price: z.number().optional().default(0),
  bedrooms: z.number().optional().default(0),
  bathrooms: z.number().optional().default(0),
  area: z.number().optional().default(0),
  locationCity: z.string().optional().nullable(),
  locationCommunity: z.string().optional().nullable(),
  locationBuilding: z.string().optional().nullable(),
  developer: z.string().optional().nullable(),
  projectName: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  agent: z
    .object({
      name: z.string().optional().nullable(),
      email: z.string().optional().nullable()
    })
    .optional()
    .nullable()
});

export type StudioListing = z.infer<typeof StudioListingSchema>;

/**
 * Detail-page shape — every field the public detail endpoint returns,
 * mapped into a flat object ready for the JSX. Price is pre-formatted in
 * the active locale; numbers stay numeric so the page can render `bdi`
 * around them for RTL safety.
 */
export type StudioListingDetail = {
  id: string;
  title: string;
  reference: string | null;
  area: string;
  emirate: string;
  building: string | null;
  address: string;
  priceFrom: string;
  offering: 'sale' | 'rent' | 'unknown';
  type: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  plotSize: number | null;
  parkingSlots: number | null;
  floors: number | null;
  furnishingType: string | null;
  availableFrom: string | null;
  developer: string | null;
  projectName: string | null;
  description: string | null;
  amenities: string[];
  images: string[];
  agentName: string | null;
};

/**
 * Card-shaped view of a Studio listing, ready for the home page.
 * Keeps the home page free of API shape concerns.
 */
export type StudioListingCard = {
  id: string;
  title: string;
  area: string;
  emirate: string;
  priceFrom: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string | null;
  reference: string | null;
};

const ALLOWED_IMAGE_HOSTS = new Set([
  'static.shared.propertyfinder.ae',
  'studio.blackoak-re.com',
  'images.unsplash.com'
]);

function pickFirstAllowedImage(images: string[]): string | null {
  for (const url of images) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) {
        return url;
      }
    } catch {
      // ignore malformed URLs
    }
  }
  return null;
}

function formatPrice(amount: number, offering: string | null | undefined, locale: string): string {
  const isRental = typeof offering === 'string' && /yearly|month|rent/i.test(offering);
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(amount);
    return isRental ? `${formatted}/yr` : formatted;
  } catch {
    const fallback = `AED ${amount.toLocaleString('en')}`;
    return isRental ? `${fallback}/yr` : fallback;
  }
}

function toCard(item: StudioListing, locale: string): StudioListingCard {
  const title = item.titleEn?.trim() || item.projectName?.trim() || item.address || 'Listing';
  const area =
    item.locationCommunity?.trim() ||
    item.locationBuilding?.trim() ||
    item.address ||
    '';
  const emirate = item.locationCity?.trim() || 'Dubai';

  return {
    id: item.id,
    title,
    area,
    emirate,
    priceFrom: formatPrice(item.price, item.offering, locale),
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    sqft: item.area,
    image: pickFirstAllowedImage(item.images),
    reference: item.reference ?? null
  };
}

const StudioListingDetailSchema = StudioListingSchema.extend({
  parkingSlots: z.number().optional().nullable(),
  numberOfFloors: z.number().optional().nullable(),
  plotSize: z.number().optional().nullable(),
  furnishingType: z.string().optional().nullable(),
  availableFrom: z.string().optional().nullable()
});

/**
 * Fetch a single listing by UUID from /api/v1/public/listings/{id}.
 * Returns `null` when the endpoint 404s or fails — caller renders a
 * `notFound()`. 8s timeout; cached behind ISR with a longer revalidate
 * because individual listings change less often than the index list.
 */
export async function fetchListingById(
  id: string,
  locale: string
): Promise<StudioListingDetail | null> {
  const apiKey = process.env.STUDIO_API_KEY;
  if (!apiKey) {
    console.warn('[studio] STUDIO_API_KEY not set — detail fetch returns null');
    return null;
  }

  const url = STUDIO_API_URL.replace(/\/+$/, '') + '/' + encodeURIComponent(id);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: {'X-API-Key': apiKey},
      signal: controller.signal,
      next: {revalidate: 900, tags: ['studio-properties', `listing-${id}`]}
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`[studio] detail ${id} returned ${res.status}`);
      return null;
    }
    const raw = await res.json();
    const body = raw?.data ?? raw;
    const parsed = StudioListingDetailSchema.safeParse(body);
    if (!parsed.success) {
      console.warn('[studio] detail parse failed', parsed.error.issues.slice(0, 3));
      return null;
    }
    return toDetail(parsed.data, locale);
  } catch (err) {
    console.warn(
      '[studio] detail fetch failed:',
      err instanceof Error ? err.message : err
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type StudioListingDetailRaw = z.infer<typeof StudioListingDetailSchema>;

function toDetail(item: StudioListingDetailRaw, locale: string): StudioListingDetail {
  const offeringRaw = (item.offering ?? '').toLowerCase();
  const offering: StudioListingDetail['offering'] = /rent|yearly|month/.test(offeringRaw)
    ? 'rent'
    : offeringRaw === 'sale'
      ? 'sale'
      : 'unknown';

  const images = (item.images ?? []).filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(parsed.hostname);
    } catch {
      return false;
    }
  });

  return {
    id: item.id,
    title: item.titleEn?.trim() || item.projectName?.trim() || item.address || 'Listing',
    reference: item.reference ?? null,
    area: item.locationCommunity?.trim() || item.locationBuilding?.trim() || item.address || '',
    emirate: item.locationCity?.trim() || 'Dubai',
    building: item.locationBuilding ?? null,
    address: item.address ?? '',
    priceFrom: formatPrice(item.price, item.offering, locale),
    offering,
    type: item.type ?? null,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    sqft: item.area,
    plotSize: item.plotSize ?? null,
    parkingSlots: item.parkingSlots ?? null,
    floors: item.numberOfFloors ?? null,
    furnishingType: item.furnishingType ?? null,
    availableFrom: item.availableFrom ?? null,
    developer: item.developer ?? null,
    projectName: item.projectName ?? null,
    description: item.descriptionEn?.trim() || null,
    amenities: item.amenities ?? [],
    images,
    agentName: item.agent?.name?.trim() ?? null
  };
}

/** Dayan's identity in the Studio CRM. Email is the primary match; the
 * name is a fallback for records that carry only a display name. */
export const DAYAN_AGENT = {
  email: 'dayan@blackoak-re.com',
  name: 'Dayan Candamil'
} as const;

/**
 * The public feed has no agent filter, so an agent's listings can only be
 * found by walking the whole feed — ~460 rows, ~37 MB, ~14 s. That body is
 * far over Next's 2 MB per-entry data-cache limit, so the *response* is
 * never cached (`cache: 'no-store'` below keeps Next from trying and
 * logging a failure on every walk). What we cache instead, via
 * `unstable_cache`, is the tiny locale-independent projection of the
 * agent's own rows — a few KB — for 15 min. Price formatting is applied
 * per locale after the cache read.
 *
 * Studio accepts large page sizes and returns the whole feed in one
 * response; oddly a *partial* last page costs as much as the full feed,
 * so paging in 100s only multiplies the wait. We still loop in case the
 * feed outgrows the page size.
 */
const FEED_PAGE_SIZE = 500;
const FEED_TIMEOUT_MS = 60_000;
const AGENT_CACHE_SECONDS = 900;

/** Locale-independent card data, small enough to live in the data cache. */
type SlimListing = {
  id: string;
  title: string;
  area: string;
  emirate: string;
  price: number;
  offering: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string | null;
  reference: string | null;
};

function toSlim(item: StudioListing): SlimListing {
  return {
    id: item.id,
    title: item.titleEn?.trim() || item.projectName?.trim() || item.address || 'Listing',
    area: item.locationCommunity?.trim() || item.locationBuilding?.trim() || item.address || '',
    emirate: item.locationCity?.trim() || 'Dubai',
    price: item.price,
    offering: item.offering ?? null,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    sqft: item.area,
    image: pickFirstAllowedImage(item.images),
    reference: item.reference ?? null
  };
}

function slimToCard(item: SlimListing, locale: string): StudioListingCard {
  return {
    id: item.id,
    title: item.title,
    area: item.area,
    emirate: item.emirate,
    priceFrom: formatPrice(item.price, item.offering, locale),
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    sqft: item.sqft,
    image: item.image,
    reference: item.reference
  };
}

async function fetchWholeFeed(apiKey: string): Promise<StudioListing[]> {
  const fetchPageOnce = async (page: number): Promise<unknown> => {
    const url = new URL(STUDIO_API_URL);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(FEED_PAGE_SIZE));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
    try {
      const res = await fetch(url.toString(), {
        headers: {'X-API-Key': apiKey},
        signal: controller.signal,
        cache: 'no-store'
      });
      if (!res.ok) {
        console.warn(`[studio] feed page ${page} returned ${res.status}`);
        return null;
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  // One retry on transient errors (abort / network).
  const fetchPage = async (page: number): Promise<unknown> => {
    try {
      return await fetchPageOnce(page);
    } catch (err) {
      console.warn(
        `[studio] feed page ${page} attempt 1 failed, retrying:`,
        err instanceof Error ? err.message : err
      );
      try {
        return await fetchPageOnce(page);
      } catch (err2) {
        console.warn(
          `[studio] feed page ${page} retry also failed:`,
          err2 instanceof Error ? err2.message : err2
        );
        return null;
      }
    }
  };

  const extractItems = (payload: unknown): unknown[] => {
    if (Array.isArray(payload)) return payload;
    const obj = (payload ?? {}) as Record<string, unknown>;
    const items = obj.data ?? obj.properties ?? obj.listings;
    return Array.isArray(items) ? items : [];
  };

  const first = await fetchPage(1);
  // Throw rather than return [] so `unstable_cache` keeps the last good
  // projection instead of caching an empty list for 15 min.
  if (!first) throw new Error('[studio] feed page 1 unavailable');
  const total = Number((first as Record<string, unknown>).total ?? 0);
  const all: unknown[] = extractItems(first);
  let page = 1;
  while (all.length < total && page < 20) {
    page += 1;
    const payload = await fetchPage(page);
    if (!payload) break;
    const items = extractItems(payload);
    if (items.length === 0) break;
    all.push(...items);
  }

  const parsed: StudioListing[] = [];
  for (const item of all) {
    const result = StudioListingSchema.safeParse(item);
    if (result.success) parsed.push(result.data);
  }
  if (parsed.length === 0 && total > 0) {
    throw new Error(`[studio] feed returned ${all.length} rows but none parsed (total=${total})`);
  }
  return parsed;
}

/**
 * Walk the feed and keep only one agent's rows, slimmed. Cached in Next's
 * data cache for 15 min under `agent-feed` — `revalidateTag('agent-feed')`
 * (or `studio-properties`) forces a fresh walk. Serves stale while
 * revalidating, so a slow CRM never blocks a request once warm.
 */
const getAgentSlimListings = unstable_cache(
  async (email: string, name: string): Promise<SlimListing[]> => {
    const apiKey = process.env.STUDIO_API_KEY;
    if (!apiKey) return [];
    const targetEmail = email.trim().toLowerCase();
    const targetName = name.trim().toLowerCase();
    const feed = await fetchWholeFeed(apiKey);
    const mine: SlimListing[] = [];
    for (const item of feed) {
      const agentEmail = (item.agent?.email ?? '').trim().toLowerCase();
      const agentName = (item.agent?.name ?? '').trim().toLowerCase();
      const matches = agentEmail ? agentEmail === targetEmail : agentName === targetName;
      if (matches) mine.push(toSlim(item));
    }
    return mine;
  },
  ['studio-agent-listings'],
  {revalidate: AGENT_CACHE_SECONDS, tags: ['studio-properties', 'agent-feed']}
);

/**
 * Every listing for a single agent, matched on `agent.email` with
 * `agent.name` as a fallback for records that carry no email.
 */
export async function fetchAgentListings(
  agent: {email: string; name: string},
  locale: string
): Promise<StudioListingCard[]> {
  if (!process.env.STUDIO_API_KEY) {
    console.warn('[studio] STUDIO_API_KEY not set — agent feed returns []');
    return [];
  }
  let slim: SlimListing[];
  try {
    slim = await getAgentSlimListings(agent.email, agent.name);
  } catch (err) {
    console.warn('[studio] agent feed walk failed:', err instanceof Error ? err.message : err);
    return [];
  }
  return slim.map((item) => slimToCard(item, locale));
}

/**
 * Fetch featured listings from Studio. Returns `[]` on any failure — the
 * caller falls back to placeholders. 8s timeout so a slow Studio doesn't
 * block ISR rebuilds beyond the Vercel function budget.
 */
export async function fetchStudioListings(
  locale: string,
  limit = 7
): Promise<StudioListingCard[]> {
  const apiKey = process.env.STUDIO_API_KEY;
  if (!apiKey) {
    console.warn('[studio] STUDIO_API_KEY not set — falling back to placeholders');
    return [];
  }

  // One retry on transient network errors / aborts — Studio cold-starts
  // can drop a request without notice; a second attempt usually succeeds
  // within the warm-up window.
  const fetchOnce = async (): Promise<unknown> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(STUDIO_API_URL, {
        headers: {'X-API-Key': apiKey},
        signal: controller.signal,
        next: {revalidate: REVALIDATE_SECONDS, tags: ['studio-properties']}
      });
      if (!res.ok) {
        console.warn(`[studio] API returned ${res.status}`);
        return null;
      }
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  let raw: unknown;
  try {
    raw = await fetchOnce();
  } catch (err) {
    console.warn(
      '[studio] featured fetch attempt 1 failed, retrying:',
      err instanceof Error ? err.message : err
    );
    try {
      raw = await fetchOnce();
    } catch (err2) {
      console.warn(
        '[studio] featured retry also failed:',
        err2 instanceof Error ? err2.message : err2
      );
      return [];
    }
  }
  if (!raw) return [];

  const obj = raw as Record<string, unknown>;
  const items: unknown[] = Array.isArray(raw)
    ? raw
    : ((obj.data ?? obj.properties ?? obj.listings) as unknown[] | undefined) ?? [];

  const cards: StudioListingCard[] = [];
  for (const item of items) {
    const parsed = StudioListingSchema.safeParse(item);
    if (!parsed.success) continue;
    cards.push(toCard(parsed.data, locale));
    if (cards.length >= limit) break;
  }
  return cards;
}
