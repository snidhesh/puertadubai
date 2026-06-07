import {defineRouting} from 'next-intl/routing';

/**
 * Five locales — EN is default and serves at /, others prefixed.
 * Slugs are canonical English across all locales (e.g. /ar/projects/costa-mare).
 * Arabic is first-class and uses dir="rtl"; everything else is ltr.
 */
export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'pt', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];

export const RTL_LOCALES = new Set<Locale>(['ar']);

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}
