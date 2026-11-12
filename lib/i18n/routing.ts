import {defineRouting} from 'next-intl/routing';

/**
 * Routed locales — EN is default and serves at /, others prefixed.
 * Slugs are canonical English across all locales (e.g. /pt/projects/…).
 *
 * Only locales with a real translation are routed. A routed locale is
 * indexable, listed in hreflang and the sitemap, and a target of next-intl's
 * Accept-Language redirect, so an untranslated one ships English copy as a
 * duplicate page under a foreign-language URL.
 */
export const routing = defineRouting({
  locales: ['en', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];

/**
 * Planned locales whose `messages/*.json` still mirror `en.json`. Their URLs
 * redirect to the English page (next.config.ts) until the copy lands. To
 * launch one: translate its file, move it into `routing.locales`, and add it
 * to the `Locale`-keyed maps TypeScript then flags.
 */
export const PENDING_LOCALES = ['fr', 'es', 'ar'] as const;

/** Locales offered in the header switcher. */
export const SWITCHER_LOCALES: readonly Locale[] = ['en', 'pt'];

/** Arabic is RTL once it is routed; kept so the layout's `dir` is ready. */
export const RTL_LOCALES: ReadonlySet<string> = new Set(['ar']);

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}
