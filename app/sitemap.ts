import type {MetadataRoute} from 'next';
import {client} from '@/lib/sanity/client';
import {routing, type Locale} from '@/lib/i18n/routing';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.puertadubai.com').replace(/\/$/, '');

/**
 * Public marketing routes (locale-prefixed except EN which uses the bare
 * path under `as-needed`). Every entry emits `alternates.languages` so
 * search engines discover the localised variants.
 *
 * Sanity-driven slugs (areas, projects, press) are appended dynamically;
 * missing Sanity data degrades to the static set.
 */

const STATIC_PATHS = [
  '/',
  '/about',
  '/founder',
  '/services',
  '/services/off-plan',
  '/services/secondary-market',
  '/services/company-formation',
  '/services/tax',
  '/services/banking',
  '/services/legal-accounting',
  '/services/golden-visa',
  '/services/investments',
  '/projects',
  '/areas',
  '/investment-readiness',
  '/partners',
  '/press',
  '/golden-visa',
  '/contact',
  '/legal-notice',
  '/privacy'
];

function localePath(locale: Locale, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

function buildEntry(path: string): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}${localePath(locale, path)}`;
  }
  languages['x-default'] = `${SITE_URL}${localePath(routing.defaultLocale, path)}`;
  return {
    url: `${SITE_URL}${path}`,
    alternates: {languages},
    lastModified: new Date()
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicSlugs = await client
    .fetch<{
      projects: string[];
      areas: string[];
      press: string[];
    }>(`{
      "projects": *[_type == "project" && defined(slug.current)].slug.current,
      "areas": *[_type == "areaGuide" && defined(slug.current)].slug.current,
      "press": *[_type == "pressArticle" && defined(slug.current)].slug.current
    }`)
    .catch(() => ({projects: [] as string[], areas: [] as string[], press: [] as string[]}));

  const dynamicPaths: string[] = [
    ...dynamicSlugs.projects.map((s) => `/projects/${s}`),
    ...dynamicSlugs.areas.map((s) => `/areas/${s}`),
    ...dynamicSlugs.press.map((s) => `/press/${s}`)
  ];

  return [...STATIC_PATHS, ...dynamicPaths].map(buildEntry);
}
