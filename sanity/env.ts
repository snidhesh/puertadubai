/**
 * Centralised env access for everything Sanity-related.
 *
 * Missing vars no longer throw at module-init — the previous behaviour
 * blocked `next build` (and any route that statically imports Sanity,
 * e.g. /sitemap.xml) when the Vercel project hadn't been linked yet.
 * Now we fall back to benign placeholders so the build completes; any
 * actual Sanity query at runtime returns an empty result, and every
 * page that consumes Sanity already wraps the call in `.catch()`.
 *
 * Set NEXT_PUBLIC_SANITY_PROJECT_ID + NEXT_PUBLIC_SANITY_DATASET in
 * Vercel project settings to wire the real CMS.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-01-01';

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder';

export const readToken = process.env.SANITY_API_READ_TOKEN;

/** True only when the real Sanity project is configured. Use as a guard
 * before issuing actual queries if the failure mode matters. */
export const isSanityConfigured =
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder' &&
  !!process.env.NEXT_PUBLIC_SANITY_DATASET;
