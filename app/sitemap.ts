import type {MetadataRoute} from 'next';
import {routing, type Locale} from '@/lib/i18n/routing';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dayancandamil.com').replace(/\/$/, '');

/**
 * Public routes (locale-prefixed except EN which uses the bare path under
 * `as-needed`). Every entry emits `alternates.languages` so search engines
 * discover the localised variants. The portfolio is a single page plus the
 * two legal pages; legacy routes 301 to anchors via next.config.ts.
 */
const STATIC_PATHS = ['/', '/projects', '/legal-notice', '/privacy'];

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

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map(buildEntry);
}
