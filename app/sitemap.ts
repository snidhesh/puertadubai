import type {MetadataRoute} from 'next';
import {routing} from '@/lib/i18n/routing';
import {CASE_STUDIES, EXPERTISE} from '@/lib/home/content';
import {absoluteUrl, languageAlternates} from '@/lib/site/seo';
import {DAYAN_AGENT, fetchAgentListings} from '@/lib/studio/properties';

// Listings come and go in the CRM; rebuild the sitemap hourly.
export const revalidate = 3600;

/**
 * Every indexable route, once per routed locale, each carrying the full
 * hreflang set (itself included) so the sitemap agrees with the page-level
 * `<link rel="alternate">` tags. Legacy routes 301 to anchors via
 * next.config.ts and are deliberately absent.
 *
 * No `lastModified`: the copy is static, so the only honest date would be the
 * deploy time, and a date that changes on every build teaches crawlers to
 * ignore the field.
 */
const STATIC_PATHS = [
  '/',
  '/projects',
  '/house-of-candamil',
  ...EXPERTISE.map((tile) => `/expertise/${tile.slug}`),
  ...CASE_STUDIES.filter((study) => !study.placeholder).map((study) => `/case-studies/${study.slug}`),
  '/legal-notice',
  '/privacy'
];

function buildEntries(path: string): MetadataRoute.Sitemap {
  const languages = languageAlternates(path);
  return routing.locales.map((locale) => ({
    url: absoluteUrl(locale, path),
    alternates: {languages}
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Without the CRM feed (no API key, or the feed is down) the sitemap still
  // ships the static routes.
  const listings = await fetchAgentListings(DAYAN_AGENT, routing.defaultLocale).catch(() => []);
  const paths = [...STATIC_PATHS, ...listings.map((listing) => `/projects/${listing.id}`)];
  return paths.flatMap(buildEntries);
}
