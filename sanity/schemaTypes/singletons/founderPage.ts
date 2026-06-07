import {defineField, defineType} from 'sanity';

/**
 * FounderPage — gated content. Credentials & Recognition and the Impact
 * block are BOTH content-review-gated: every claim needs a verifiable
 * source on file before publish. No placeholder media logos.
 */
export const founderPageType = defineType({
  name: 'founderPage',
  title: 'Founder page',
  type: 'document',
  fields: [
    defineField({
      name: 'bio',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'signatureImage',
      title: 'Handwritten signature (Latin pages only)',
      description:
        'The Nautigal script accent is reserved for this signature on Latin pages. Arabic pages omit script accents entirely.',
      type: 'image'
    }),
    defineField({
      name: 'timelineEntries',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'founderTimeline'}]}]
    }),
    defineField({
      name: 'credentialsAndRecognition',
      title: 'Credentials & Recognition (CONTENT-REVIEW GATED)',
      description:
        'Anti-fabrication: every claim (CNN/Vogue/Harper’s/awards) needs a verifiable link or screenshot on file. Empty until reviewed.',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'impactBlock',
      title: 'Impact / Responsible advisory (CONTENT-REVIEW GATED)',
      description:
        'Investor-education / cross-border-trust framing only. Avoid unverified philanthropy claims.',
      type: 'internationalizedArrayText'
    }),
    defineField({name: 'seo', type: 'seo'})
  ]
});
