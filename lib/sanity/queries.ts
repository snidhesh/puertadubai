import {client} from './client';
import {localized, localizedSeo} from './i18n';
import type {Locale} from '@/lib/i18n/routing';

/**
 * GROQ projections used across the public pages. Each helper resolves the
 * localised fields up-front via the `localized()` projection so render
 * code never has to walk `internationalizedArray` shapes itself.
 *
 * Every helper takes a {locale} param so a missing translation falls back
 * to English (handled inside `localized()`).
 */

export type SanityImage = {
  asset?: {_ref: string; _type: string};
  alt?: string;
  hotspot?: {x: number; y: number; height: number; width: number};
};

export type ProjectCard = {
  _id: string;
  title: string;
  slug: string;
  emirate: string;
  status: 'off-plan' | 'ready' | 'secondary' | null;
  priceFrom: number | null;
  currency: 'AED' | 'USD' | 'EUR' | null;
  bedroomsMin: number | null;
  bedroomsMax: number | null;
  handoverYear: number | null;
  heroImage: SanityImage | null;
  developer: {name: string; slug: string} | null;
};

const PROJECT_CARD_PROJECTION = `
  _id,
  ${localized('title')},
  "slug": slug.current,
  emirate,
  status,
  priceFrom,
  currency,
  bedroomsMin,
  bedroomsMax,
  handoverYear,
  heroImage,
  "developer": developer->{name, "slug": slug.current}
`;

export async function getFeaturedProjects(locale: Locale): Promise<ProjectCard[]> {
  return client.fetch<ProjectCard[]>(
    `*[_type == "project" && featured == true] | order(_createdAt desc)[0...6]{
      ${PROJECT_CARD_PROJECTION}
    }`,
    {locale}
  );
}

export async function getAllProjects(locale: Locale): Promise<ProjectCard[]> {
  return client.fetch<ProjectCard[]>(
    `*[_type == "project"] | order(_createdAt desc){
      ${PROJECT_CARD_PROJECTION}
    }`,
    {locale}
  );
}

export type AreaGuideCard = {
  _id: string;
  name: string;
  slug: string;
  emirate: string;
  heroImage: SanityImage | null;
  summary: string | null;
};

const AREA_CARD_PROJECTION = `
  _id,
  ${localized('name')},
  "slug": slug.current,
  emirate,
  heroImage,
  ${localized('summary')}
`;

export async function getFeaturedAreas(locale: Locale): Promise<AreaGuideCard[]> {
  return client.fetch<AreaGuideCard[]>(
    `*[_type == "areaGuide" && featured == true] | order(_createdAt desc)[0...4]{
      ${AREA_CARD_PROJECTION}
    }`,
    {locale}
  );
}

export async function getAllAreas(locale: Locale): Promise<AreaGuideCard[]> {
  return client.fetch<AreaGuideCard[]>(
    `*[_type == "areaGuide"] | order(_createdAt asc){
      ${AREA_CARD_PROJECTION}
    }`,
    {locale}
  );
}

export type TestimonialCard = {
  _id: string;
  quote: string;
  attributionName: string;
  attributionRole: string | null;
  attributionConsentScope: 'initials-only' | 'first-name-last-initial' | 'full-name';
  portrait: SanityImage | null;
};

const TESTIMONIAL_PROJECTION = `
  _id,
  ${localized('quote')},
  attributionName,
  ${localized('attributionRole')},
  attributionConsentScope,
  portrait
`;

export type CtaStripLink = {
  label: string | null;
  href: string;
};

export type StatsStripSlot =
  | {kind: 'years'; value: number}
  | {kind: 'volume'; value: string; currency: string | null};

export type StatsStrip = StatsStripSlot[];

export type HomePageContent = {
  heroHeadline: string | null;
  heroSub: string | null;
  heroPrimaryCtaLabel: string | null;
  heroSecondaryCtaLabel: string | null;
  heroBackgroundVideoMode: 'bg-video' | 'poster-only' | null;
  ctaStripLinks: CtaStripLink[];
  founderBlurb: string | null;
  statsStrip: StatsStrip;
  featuredTestimonials: TestimonialCard[];
  privateCircle: {
    heading: string | null;
    body: string | null;
    ctaLabel: string | null;
  } | null;
  featuredProjects: ProjectCard[];
  featuredAreas: AreaGuideCard[];
  partnerLogos: {name: string; slug: string; logo: SanityImage | null}[];
  seo: {metaTitle: string | null; metaDescription: string | null; ogImage: SanityImage | null} | null;
};

type RawStatsStrip = {
  yearsExperience?: {value: number | null; verifiedSource: string | null} | null;
  transactionVolume?: {
    value: string | null;
    currency: string | null;
    verifiedSource: string | null;
  } | null;
} | null;

/**
 * Anti-fabrication filter for the stats strip — each slot survives only
 * when BOTH `value` and `verifiedSource` are populated. Empty slots
 * collapse cleanly rather than rendering a placeholder.
 */
function filterStats(raw: RawStatsStrip): StatsStrip {
  const out: StatsStrip = [];
  if (
    raw?.yearsExperience?.value !== null &&
    raw?.yearsExperience?.value !== undefined &&
    raw?.yearsExperience?.verifiedSource
  ) {
    out.push({kind: 'years', value: Number(raw.yearsExperience.value)});
  }
  if (
    raw?.transactionVolume?.value &&
    raw?.transactionVolume?.verifiedSource
  ) {
    out.push({
      kind: 'volume',
      value: String(raw.transactionVolume.value),
      currency: raw.transactionVolume.currency ?? null
    });
  }
  return out;
}

type HomePageRaw = Omit<HomePageContent, 'statsStrip'> & {statsStrip: RawStatsStrip};

export async function getHomePage(locale: Locale): Promise<HomePageContent | null> {
  const raw = await client.fetch<HomePageRaw | null>(
    `*[_type == "homePage"][0]{
      ${localized('heroHeadline')},
      ${localized('heroSub')},
      ${localized('heroPrimaryCtaLabel')},
      ${localized('heroSecondaryCtaLabel')},
      heroBackgroundVideoMode,
      "ctaStripLinks": ctaStripLinks[]{
        ${localized('label')},
        href
      },
      ${localized('founderBlurb')},
      statsStrip,
      "featuredTestimonials": featuredTestimonials[]->{ ${TESTIMONIAL_PROJECTION} }
        [@.consentOnFile == true && @.editorialApproval == true],
      "privateCircle": privateCircleBlock{
        ${localized('heading')},
        ${localized('body')},
        ${localized('ctaLabel')}
      },
      "featuredProjects": featuredProjects[]->{ ${PROJECT_CARD_PROJECTION} },
      "featuredAreas": featuredAreas[]->{ ${AREA_CARD_PROJECTION} },
      "partnerLogos": partnerLogos[]->{name, "slug": slug.current, logo},
      ${localizedSeo()}
    }`,
    {locale}
  );
  if (!raw) return null;
  return {
    ...raw,
    statsStrip: filterStats(raw.statsStrip),
    ctaStripLinks: raw.ctaStripLinks ?? [],
    featuredTestimonials: raw.featuredTestimonials ?? [],
    featuredProjects: raw.featuredProjects ?? [],
    featuredAreas: raw.featuredAreas ?? [],
    partnerLogos: raw.partnerLogos ?? []
  };
}

/**
 * Threshold helpers for the v1.1 deferred sections — the public route /
 * home-page section must be hidden until the launch-quality threshold is
 * met (≥ 6 videos, ≥ 3 track record items, ≥ 2 fully-consented client
 * stories). These power the empty-section gates in phase 4.
 */
export async function getVideoCount(): Promise<number> {
  return client.fetch<number>(`count(*[_type == "videoItem"])`);
}

export async function getTrackRecordCount(): Promise<number> {
  return client.fetch<number>(`count(*[_type == "trackRecordItem"])`);
}

export async function getClientStoryCount(): Promise<number> {
  return client.fetch<number>(
    `count(*[_type == "clientStory" && consentOnFile == true && editorialApproval == true])`
  );
}

export type PressSnippet = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  source: 'in-house' | 'external';
};

export async function getRecentPress(locale: Locale, limit = 3): Promise<PressSnippet[]> {
  return client.fetch<PressSnippet[]>(
    `*[_type == "pressArticle"] | order(coalesce(publishedAt, _createdAt) desc)[0...${limit}]{
      _id,
      ${localized('title')},
      "slug": slug.current,
      publishedAt,
      source
    }`,
    {locale}
  );
}

/**
 * Service tiles for the home preview. Counts the eight documented
 * services from Sanity; the `auto` stats-strip metrics use these too.
 */
export type ServiceTile = {
  _id: string;
  title: string;
  slug: string;
  summary: string | null;
};

export async function getServiceTiles(locale: Locale): Promise<ServiceTile[]> {
  return client.fetch<ServiceTile[]>(
    `*[_type == "service"] | order(order asc, _createdAt asc){
      _id,
      ${localized('title')},
      "slug": slug.current,
      ${localized('summary')}
    }`,
    {locale}
  );
}

/**
 * Auto-computed coverage metrics — verifiable structural facts pulled
 * straight from Sanity. Safe to render because the source IS Sanity.
 */
export type CoverageStats = {
  emirates: number;
  developers: number;
  services: number;
};

export async function getCoverageStats(): Promise<CoverageStats> {
  return client.fetch<CoverageStats>(`{
    "emirates": count(array::unique(*[_type == "project" && defined(emirate)].emirate)),
    "developers": count(*[_type == "developer"]),
    "services": count(*[_type == "service"])
  }`);
}
