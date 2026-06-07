import {routing, type Locale} from '@/lib/i18n/routing';

/**
 * GROQ projection helper for `internationalizedArray` fields.
 *
 * The `sanity-plugin-internationalized-array` stores localised entries as
 * `[{language: 'en', value: '…'}, {language: 'fr', value: '…'}, …]` —
 * the locale key is `language`, NOT `_key` (`_key` is Sanity's internal
 * array-item key and would not match the configured locale codes).
 *
 * Use as:
 *
 *   const q = `*[_type == "project" && slug.current == $slug][0]{
 *     ${localized('title')},
 *     ${localized('summary')}
 *   }`;
 *
 * The result has each localised field already resolved to a plain string,
 * with English as the fallback when the active locale is missing.
 */
export function localized(field: string): string {
  return `"${field}": coalesce(${field}[language == $locale][0].value, ${field}[language == "en"][0].value)`;
}

/**
 * Same idea for a nested SEO sub-object — assumes the document has a
 * `seo` field whose `metaTitle` / `metaDescription` etc. are
 * `internationalizedArray`.
 */
export function localizedSeo(): string {
  return `"seo": {
    "metaTitle": coalesce(seo.metaTitle[language == $locale][0].value, seo.metaTitle[language == "en"][0].value),
    "metaDescription": coalesce(seo.metaDescription[language == $locale][0].value, seo.metaDescription[language == "en"][0].value),
    "ogImage": seo.ogImage
  }`;
}

export function isSanityLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export const SANITY_LANGUAGES = routing.locales.map((id) => ({
  id,
  title: ((): string => {
    switch (id) {
      case 'en':
        return 'English';
      case 'fr':
        return 'Français';
      case 'es':
        return 'Español';
      case 'pt':
        return 'Português';
      case 'ar':
        return 'العربية';
    }
  })()
}));
