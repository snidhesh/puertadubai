import {defineField, defineType} from 'sanity';

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Meta'},
    {name: 'commercial', title: 'Commercial'},
    {name: 'seo', title: 'SEO'}
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      group: 'content',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Canonical English slug, shared across locales.',
      options: {maxLength: 96},
      group: 'content',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'developer',
      type: 'reference',
      to: [{type: 'developer'}],
      group: 'meta'
    }),
    defineField({
      name: 'location',
      title: 'Location label',
      type: 'internationalizedArrayString',
      group: 'meta'
    }),
    defineField({
      name: 'area',
      type: 'reference',
      to: [{type: 'areaGuide'}],
      group: 'meta'
    }),
    defineField({
      name: 'emirate',
      type: 'string',
      options: {
        list: [
          {title: 'Abu Dhabi', value: 'abu-dhabi'},
          {title: 'Dubai', value: 'dubai'},
          {title: 'Ras Al Khaimah', value: 'ras-al-khaimah'},
          {title: 'Sharjah', value: 'sharjah'}
        ]
      },
      group: 'meta'
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          {title: 'Off-plan', value: 'off-plan'},
          {title: 'Ready', value: 'ready'},
          {title: 'Secondary', value: 'secondary'}
        ],
        layout: 'radio'
      },
      group: 'meta'
    }),
    defineField({
      name: 'priceFrom',
      title: 'Price from',
      type: 'number',
      group: 'commercial'
    }),
    defineField({
      name: 'currency',
      type: 'string',
      options: {
        list: [
          {title: 'AED', value: 'AED'},
          {title: 'USD', value: 'USD'},
          {title: 'EUR', value: 'EUR'}
        ]
      },
      initialValue: 'AED',
      group: 'commercial'
    }),
    defineField({name: 'bedroomsMin', type: 'number', group: 'commercial'}),
    defineField({name: 'bedroomsMax', type: 'number', group: 'commercial'}),
    defineField({name: 'handoverYear', type: 'number', group: 'commercial'}),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: {hotspot: true},
      group: 'content'
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      group: 'content'
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'amenity',
          fields: [
            defineField({name: 'label', type: 'internationalizedArrayString'})
          ]
        }
      ],
      group: 'content'
    }),
    defineField({
      name: 'paymentPlan',
      title: 'Payment plan',
      type: 'internationalizedArrayText',
      group: 'commercial'
    }),
    defineField({
      name: 'roiNotes',
      title: 'ROI notes',
      description:
        'Anti-fabrication: no invented ROI percentages. Tie to verifiable rental data or developer guidance and review before publish.',
      type: 'internationalizedArrayText',
      group: 'commercial'
    }),
    defineField({
      name: 'brochure',
      type: 'file',
      options: {accept: 'application/pdf'},
      group: 'content'
    }),
    defineField({
      name: 'geo',
      type: 'geopoint',
      group: 'meta'
    }),
    defineField({name: 'featured', type: 'boolean', group: 'meta'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'})
  ],
  preview: {
    select: {titleArr: 'title', location: 'emirate', media: 'heroImage'},
    prepare({titleArr, location, media}) {
      const en = Array.isArray(titleArr)
        ? titleArr.find((entry: {language: string; value: string}) => entry.language === 'en')?.value
        : undefined;
      return {title: en ?? 'Untitled project', subtitle: location, media};
    }
  }
});
