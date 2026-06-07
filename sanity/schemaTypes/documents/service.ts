import {defineField, defineType} from 'sanity';

const SERVICE_SLUG_OPTIONS = [
  {title: 'Off-plan', value: 'off-plan'},
  {title: 'Secondary market', value: 'secondary-market'},
  {title: 'Company formation', value: 'company-formation'},
  {title: 'Tax', value: 'tax'},
  {title: 'Banking', value: 'banking'},
  {title: 'Legal & accounting', value: 'legal-accounting'},
  {title: 'Golden Visa', value: 'golden-visa'},
  {title: 'Investments', value: 'investments'}
];

export const serviceType = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Canonical English slug. Pick from the documented service set.',
      options: {
        source: () => '',
        // Editors can type, but the documented set acts as guidance.
      },
      validation: (r) => r.required()
    }),
    defineField({
      name: 'serviceKey',
      type: 'string',
      description: 'Maps to the eight documented services for routing.',
      options: {list: SERVICE_SLUG_OPTIONS, layout: 'dropdown'},
      validation: (r) => r.required()
    }),
    defineField({name: 'icon', type: 'string'}),
    defineField({
      name: 'summary',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'body',
      type: 'internationalizedArrayText'
    }),
    defineField({name: 'order', type: 'number'}),
    defineField({name: 'seo', type: 'seo'})
  ],
  orderings: [{title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}]
});
