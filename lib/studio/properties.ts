import 'server-only';
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
    .object({name: z.string().optional().nullable()})
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
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[studio] STUDIO_API_KEY not set — detail fetch returns null');
    }
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

/**
 * Fetch every listing for a single agent (by exact name match on
 * `agent.name`). Studio doesn't expose an agent query parameter, so we
 * paginate through all pages and filter server-side. Pages are fetched
 * in parallel after the first request reveals `total`. Cached behind
 * ISR + a longer `revalidate` than the featured-listings call because
 * the agent's catalogue churns less than the curated home-page set.
 */
export async function fetchListingsByAgent(
  agentName: string,
  locale: string
): Promise<StudioListingCard[]> {
  const apiKey = process.env.STUDIO_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[studio] STUDIO_API_KEY not set — agent feed returns []');
    }
    return [];
  }

  const target = agentName.trim().toLowerCase();
  const apiKeyStr: string = apiKey;

  // Single-attempt fetch with timeout. Returns parsed JSON, `null` on
  // HTTP error, or throws a tagged error on abort/network failure so
  // the caller can decide whether to retry.
  const fetchPageOnce = async (page: number) => {
    const url = new URL(STUDIO_API_URL);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', '25');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url.toString(), {
        headers: {'X-API-Key': apiKeyStr},
        signal: controller.signal,
        next: {revalidate: 900, tags: ['studio-properties', 'agent-feed']}
      });
      if (!res.ok) {
        console.warn(`[studio] page ${page} returned ${res.status}`);
        return null;
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  // Fetch with one retry on transient errors (abort, network). Studio
  // cold-starts sometimes drop specific pages — a single retry catches
  // those without cascading to multiple attempts.
  const fetchPage = async (page: number) => {
    try {
      return await fetchPageOnce(page);
    } catch (err) {
      console.warn(
        `[studio] page ${page} attempt 1 failed, retrying:`,
        err instanceof Error ? err.message : err
      );
      try {
        return await fetchPageOnce(page);
      } catch (err2) {
        console.warn(
          `[studio] page ${page} retry also failed:`,
          err2 instanceof Error ? err2.message : err2
        );
        return null;
      }
    }
  };

  const first = await fetchPage(1);
  if (!first) return [];
  const total = Number(first?.total ?? 0);
  const limit = Number(first?.limit ?? 25);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const rest =
    totalPages > 1
      ? await Promise.all(
          Array.from({length: totalPages - 1}, (_, i) => fetchPage(i + 2))
        )
      : [];

  const all: unknown[] = [];
  for (const payload of [first, ...rest]) {
    const items = Array.isArray(payload)
      ? payload
      : (payload?.data ?? payload?.properties ?? payload?.listings ?? []);
    if (Array.isArray(items)) all.push(...items);
  }

  const cards: StudioListingCard[] = [];
  for (const item of all) {
    const parsed = StudioListingSchema.safeParse(item);
    if (!parsed.success) continue;
    const name = (parsed.data.agent?.name ?? '').trim().toLowerCase();
    if (name === target) {
      cards.push(toCard(parsed.data, locale));
    }
  }
  return cards;
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
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[studio] STUDIO_API_KEY not set — falling back to placeholders');
    }
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
