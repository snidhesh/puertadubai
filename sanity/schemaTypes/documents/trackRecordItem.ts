import {defineField, defineType} from 'sanity';

/**
 * TrackRecordItem — deferred to v1.1. Sanity type ships so editors can
 * begin authoring, but the public /track-record route is gated on
 * `hasPublishedItems >= 3` per the IA. Anti-fabrication: no invented
 * specifics; anonymised summaries only.
 */
export const trackRecordItemType = defineType({
  name: 'trackRecordItem',
  title: 'Track record item',
  type: 'document',
  fields: [
    defineField({
      name: 'outcomeType',
      type: 'string',
      options: {
        list: [
          {title: 'Acquired', value: 'acquired'},
          {title: 'Sold', value: 'sold'},
          {title: 'Structured', value: 'structured'},
          {title: 'Relocated', value: 'relocated'}
        ]
      },
      validation: (r) => r.required()
    }),
    defineField({name: 'emirate', type: 'string'}),
    defineField({name: 'areaRef', type: 'reference', to: [{type: 'areaGuide'}]}),
    defineField({
      name: 'investorObjective',
      type: 'internationalizedArrayString'
    }),
    defineField({
      name: 'serviceMix',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}]
    }),
    defineField({name: 'timelineWeeks', type: 'number'}),
    defineField({
      name: 'anonymisedResult',
      type: 'internationalizedArrayText',
      description: 'No fabricated specifics. Anonymised facts only.'
    }),
    defineField({name: 'publishedAt', type: 'datetime'}),
    defineField({name: 'seo', type: 'seo'})
  ]
});
