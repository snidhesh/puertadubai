import {defineField, defineType} from 'sanity';

/**
 * AreaGuide — investment area pages. v1 launch route.
 *
 * `investorObjectives` REPLACES an earlier `buyerProfileMix` (by nationality)
 * which carried discriminatory-targeting and fabrication risk. Objectives
 * are factual and brand-safe.
 */
export const areaGuideType = defineType({
  name: 'areaGuide',
  title: 'Area guide',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Meta'},
    {name: 'seo', title: 'SEO'}
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Area name',
      type: 'internationalizedArrayString',
      group: 'content',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Canonical English slug, shared across locales.',
      group: 'content',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'emirate',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'Abu Dhabi', value: 'abu-dhabi'},
          {title: 'Dubai', value: 'dubai'},
          {title: 'Ras Al Khaimah', value: 'ras-al-khaimah'},
          {title: 'Sharjah', value: 'sharjah'},
          {title: 'Ajman', value: 'ajman'},
          {title: 'Fujairah', value: 'fujairah'},
          {title: 'Umm Al Quwain', value: 'umm-al-quwain'}
        ]
      },
      validation: (r) => r.required()
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: {hotspot: true},
      group: 'content'
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'internationalizedArrayText',
      group: 'content'
    }),
    defineField({
      name: 'investorProfile',
      title: 'Investor profile',
      type: 'internationalizedArrayText',
      group: 'content'
    }),
    defineField({
      name: 'lifestyle',
      title: 'Lifestyle',
      type: 'internationalizedArrayText',
      group: 'content'
    }),
    defineField({
      name: 'priceBand',
      title: 'Price band (free-form, e.g. "AED 1.2M–3.5M")',
      type: 'internationalizedArrayString',
      group: 'meta'
    }),
    defineField({
      name: 'yieldRange',
      title: 'Yield range (free-form)',
      type: 'internationalizedArrayString',
      group: 'meta'
    }),
    defineField({
      name: 'goldenVisaRelevance',
      title: 'Golden Visa relevance',
      description: 'Gated on legal review — tie to AED 2M canonical threshold.',
      type: 'internationalizedArrayText',
      group: 'content'
    }),
    defineField({
      name: 'transit',
      title: 'Transit times (e.g. "30 min to DIFC")',
      type: 'internationalizedArrayText',
      group: 'meta'
    }),
    defineField({
      name: 'ownership',
      title: 'Ownership notes (freehold / leasehold)',
      type: 'internationalizedArrayText',
      group: 'meta'
    }),
    defineField({
      name: 'investorObjectives',
      title: 'Investor objectives',
      description:
        'Factual, brand-safe enum — REPLACES the earlier nationality mix to avoid discriminatory targeting / fabrication risk.',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Yield-focused', value: 'yield-focused'},
          {title: 'Residency-led', value: 'residency-led'},
          {title: 'Family relocation', value: 'family-relocation'},
          {title: 'Business base', value: 'business-base'},
          {title: 'Lifestyle second home', value: 'lifestyle-second-home'}
        ]
      },
      group: 'meta'
    }),
    defineField({
      name: 'relatedAreas',
      title: 'Related areas',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'areaGuide'}]}],
      group: 'meta'
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related projects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      group: 'meta'
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      description: 'Renders as FAQPage JSON-LD on the public page.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({name: 'question', type: 'internationalizedArrayString'}),
            defineField({name: 'answer', type: 'internationalizedArrayText'})
          ]
        }
      ],
      group: 'content'
    }),
    defineField({name: 'featured', type: 'boolean', group: 'meta'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'})
  ],
  preview: {
    select: {nameArr: 'name', emirate: 'emirate', media: 'heroImage'},
    prepare({nameArr, emirate, media}) {
      const en = Array.isArray(nameArr)
        ? nameArr.find((entry: {language: string; value: string}) => entry.language === 'en')?.value
        : undefined;
      return {title: en ?? 'Untitled area', subtitle: emirate, media};
    }
  }
});
