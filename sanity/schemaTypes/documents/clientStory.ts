import {defineField, defineType} from 'sanity';

/**
 * ClientStory — deferred to v1.1. Hard launch gate: ≥ 2 records where
 * BOTH `consentOnFile === true` AND `editorialApproval === true`. Records
 * missing either flag are filtered at the GROQ layer.
 *
 * Signed consent documents are NOT uploaded to Sanity (assets default to
 * a public CDN). `consentReference` is metadata only; the actual file
 * lives in private blob storage and surfaces via short-lived signed URLs
 * in the admin (phase 6/9).
 *
 * `editorialApprovalBy` is a STRING (admin email or stable UUID), not a
 * Sanity reference, because AdminUser is not a Sanity type — admin auth
 * state lives in Upstash.
 */
export const clientStoryType = defineType({
  name: 'clientStory',
  title: 'Client story',
  type: 'document',
  fields: [
    defineField({name: 'clientProfile', type: 'internationalizedArrayText'}),
    defineField({name: 'objective', type: 'internationalizedArrayText'}),
    defineField({name: 'challenge', type: 'internationalizedArrayText'}),
    defineField({name: 'puertaRole', type: 'internationalizedArrayText'}),
    defineField({
      name: 'result',
      type: 'internationalizedArrayText',
      description: 'Anonymised facts only — no invented specifics.'
    }),
    defineField({
      name: 'servicesUsed',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}]
    }),
    defineField({
      name: 'consentOnFile',
      type: 'boolean',
      description: 'Required true to publish.',
      initialValue: false
    }),
    defineField({
      name: 'consentReference',
      title: 'Consent document reference (metadata only)',
      description:
        'The signed consent file lives in private blob storage. This object holds the pointer + integrity hash; the file is NEVER uploaded to Sanity.',
      type: 'object',
      fields: [
        defineField({
          name: 'storageProvider',
          type: 'string',
          options: {
            list: [
              {title: 'Vercel Blob (private)', value: 'vercel-blob'},
              {title: 'Cloudflare R2', value: 'r2'}
            ]
          }
        }),
        defineField({name: 'objectKey', type: 'string'}),
        defineField({name: 'sha256', type: 'string'}),
        defineField({name: 'signedAt', type: 'datetime'}),
        defineField({name: 'signedByName', type: 'string'})
      ]
    }),
    defineField({
      name: 'editorialApproval',
      type: 'boolean',
      description:
        'Required true to publish — set only after editorial sign-off. Public reads filter on BOTH flags.',
      initialValue: false
    }),
    defineField({
      name: 'editorialApprovalBy',
      type: 'string',
      description: 'Admin email or stable UUID. AdminUser is NOT a Sanity type.'
    }),
    defineField({name: 'editorialApprovalAt', type: 'datetime'}),
    defineField({name: 'seo', type: 'seo'})
  ]
});
