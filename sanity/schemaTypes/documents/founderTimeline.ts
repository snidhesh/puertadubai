import {defineField, defineType} from 'sanity';

export const founderTimelineType = defineType({
  name: 'founderTimeline',
  title: 'Founder timeline entry',
  type: 'document',
  fields: [
    defineField({name: 'year', type: 'number', validation: (r) => r.required()}),
    defineField({
      name: 'headline',
      type: 'internationalizedArrayString'
    }),
    defineField({
      name: 'description',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'mediaMention',
      type: 'string',
      description:
        'Anti-fabrication: only publications with verifiable links/screenshots. The old site listed CNN/Vogue/Harper’s without proof — those need real sources or removal.'
    })
  ]
});
