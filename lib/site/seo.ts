import type {Metadata} from 'next';
import {routing, type Locale} from '@/lib/i18n/routing';

/**
 * Shared SEO plumbing: the canonical origin, locale-aware URLs, and one
 * metadata builder so every page emits a self-referencing canonical, the
 * hreflang set, and Open Graph / Twitter tags.
 *
 * Next merges metadata *shallowly* across segments, so a page that sets
 * `openGraph` or `alternates` replaces the layout's whole object. That is why
 * `pageMetadata()` always returns both in full rather than partial overrides.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dayancandamil.com').replace(/\/$/, '');

export const SITE_NAME = 'Dayan Candamil';

/** 1200×630 crop of the Let's Connect portrait; the default share image. */
export const OG_IMAGE = {url: '/images/og.jpg', width: 1200, height: 630, alt: SITE_NAME};

const OG_LOCALES: Record<Locale, string> = {en: 'en_US', pt: 'pt_BR'};

/** Path as served: the default locale is unprefixed (`localePrefix: 'as-needed'`). */
export function localePath(locale: Locale, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** hreflang map for one route: every routed locale plus `x-default` (English). */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(locale, path);
  }
  languages['x-default'] = absoluteUrl(routing.defaultLocale, path);
  return languages;
}

/**
 * Collapse whitespace and trim to a meta-description length on a word
 * boundary, so CRM text with line breaks never ends mid-word.
 */
export function clip(text: string, max = 158): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—–-]+$/, '')}…`;
}

type PageMetadataInput = {
  locale: Locale;
  /** Locale-less path, e.g. `/` or `/expertise/private-clients`. */
  path: string;
  title: string;
  description: string;
  /** Skip the layout's `%s · Dayan Candamil` template. */
  absoluteTitle?: boolean;
  /** Absolute or root-relative image; defaults to the site share image. */
  image?: string;
  index?: boolean;
};

export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  image,
  index = true
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(locale, path);
  const images = image ? [{url: image, alt: title}] : [OG_IMAGE];
  return {
    title: absoluteTitle ? {absolute: title} : title,
    description,
    alternates: {canonical: url, languages: languageAlternates(path)},
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      url,
      title,
      description,
      images
    },
    twitter: {card: 'summary_large_image', title, description, images},
    ...(index ? {} : {robots: {index: false, follow: false}})
  };
}
