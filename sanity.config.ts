import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {internationalizedArray} from 'sanity-plugin-internationalized-array';

import {apiVersion, dataset, projectId} from './sanity/env';
import {schema} from './sanity/schemaTypes';
import {structure, singletonActionFilter} from './sanity/structure';
import {SANITY_LANGUAGES} from './lib/sanity/i18n';

/**
 * Studio mounted at /studio (App Router) per the embedded-Studio pattern.
 * The Studio CSP and noindex headers live in next.config.ts; locale
 * routing is bypassed for /studio in proxy.ts.
 *
 * Languages drive the `internationalizedArray` plugin — every localised
 * field is automatically generated for these locale codes.
 */
export default defineConfig({
  name: 'puerta-dubai',
  title: 'Puerta Dubai',
  projectId,
  dataset,
  basePath: '/studio',
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
    internationalizedArray({
      languages: SANITY_LANGUAGES,
      defaultLanguages: ['en'],
      fieldTypes: ['string', 'text']
    })
  ],
  document: {
    actions: singletonActionFilter
  }
});
