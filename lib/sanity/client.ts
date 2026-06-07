import {createClient} from 'next-sanity';
import {apiVersion, dataset, projectId, readToken} from '@/sanity/env';

/**
 * Public read client — used in RSC for marketing pages and the catalog.
 * Uses the CDN by default (`useCdn: true`); on-demand revalidation lands
 * through `/api/revalidate` (phase 8), driven by Sanity webhooks.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: false
});

/**
 * Tokened client — bypasses CDN for fresh reads (preview, draft mode).
 * Never used in build-time / public render paths.
 */
export const draftClient = readToken
  ? client.withConfig({
      useCdn: false,
      token: readToken,
      perspective: 'previewDrafts'
    })
  : null;
