import {defineField, defineType} from 'sanity';

/**
 * Testimonial — short consented quote with portrait for the home-page
 * carousel. STRICT gates: `consentOnFile === true` AND
 * `editorialApproval === true`. The public GROQ query filters on both;
 * a record missing either flag is invisible. Distinct from `ClientStory`
 * (long-form case study for the deferred /client-stories route).
 *
 * `editorialApprovalBy` is a string (admin email or stable UUID), NOT a
 * Sanity reference — AdminUser is not a Sanity type at portfolio scope.
 */
export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'consent', title: 'Consent + approval'},
    {name: 'seo', title: 'SEO'}
  ],
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      description:
        'Short — designed for a card, not a case study. 1–3 sentences.',
      type: 'internationalizedArrayText',
      group: 'content',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'attributionName',
      title: 'Attribution name',
      description:
        'Render form is controlled by `attributionConsentScope`. Store the full name; the renderer decides how much to show.',
      type: 'string',
      group: 'content',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'attributionRole',
      title: 'Attribution role',
      description: 'Free-form, e.g. "Investor, Singapore" or "Family relocating from EU".',
      type: 'internationalizedArrayString',
      group: 'content'
    }),
    defineField({
      name: 'attributionConsentScope',
      title: 'Attribution consent scope',
      description: 'How much of the name the operator may render publicly.',
      type: 'string',
      group: 'consent',
      options: {
        list: [
          {title: 'Initials only (e.g. "A.D.")', value: 'initials-only'},
          {title: 'First name + last initial', value: 'first-name-last-initial'},
          {title: 'Full name', value: 'full-name'}
        ],
        layout: 'radio'
      },
      initialValue: 'first-name-last-initial',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait (optional)',
      type: 'image',
      options: {hotspot: true},
      group: 'content'
    }),
    defineField({
      name: 'consentOnFile',
      title: 'Signed consent on file',
      description: 'Required true to publish. The signed document is stored OUTSIDE Sanity — see consentReference.',
      type: 'boolean',
      group: 'consent',
      initialValue: false,
      validation: (r) => r.required()
    }),
    defineField({
      name: 'consentReference',
      title: 'Consent document reference (metadata only)',
      description:
        'Pointer to the signed consent file in private blob storage. The file itself is NEVER uploaded to Sanity (Sanity assets default to a public CDN).',
      type: 'object',
      group: 'consent',
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
      title: 'Editorial approval',
      description: 'Required true to publish. Set only after sign-off.',
      type: 'boolean',
      group: 'consent',
      initialValue: false,
      validation: (r) => r.required()
    }),
    defineField({
      name: 'editorialApprovalBy',
      type: 'string',
      group: 'consent',
      description: 'Admin email or stable UUID. (AdminUser is not a Sanity type.)'
    }),
    defineField({
      name: 'editorialApprovalAt',
      type: 'datetime',
      group: 'consent'
    }),
    defineField({name: 'featured', type: 'boolean', group: 'content'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'})
  ],
  preview: {
    select: {
      title: 'attributionName',
      subtitle: 'quote',
      media: 'portrait'
    },
    prepare({title, subtitle, media}) {
      let snippet: string | undefined;
      if (Array.isArray(subtitle)) {
        const en = subtitle.find(
          (entry: {language: string; value: string}) => entry.language === 'en'
        );
        snippet = en?.value;
      }
      return {
        title: title ?? 'Untitled testimonial',
        subtitle: snippet?.slice(0, 80),
        media
      };
    }
  }
});
