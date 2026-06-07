import {defineField, defineType} from 'sanity';

/**
 * VideoItem — deferred to v1.1 (route gated on ≥ 6 published items).
 * Embed via YouTube / Vimeo / Mux ID; we never proxy video bytes.
 */
export const videoItemType = defineType({
  name: 'videoItem',
  title: 'Video',
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
      validation: (r) => r.required()
    }),
    defineField({
      name: 'embedProvider',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube', value: 'youtube'},
          {title: 'Vimeo', value: 'vimeo'},
          {title: 'Mux', value: 'mux'}
        ],
        layout: 'radio'
      },
      validation: (r) => r.required()
    }),
    defineField({name: 'embedId', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'thumbnail', type: 'image', options: {hotspot: true}}),
    defineField({name: 'summary', type: 'internationalizedArrayText'}),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Market briefing', value: 'market-briefing'},
          {title: 'Founder message', value: 'founder-message'},
          {title: 'Project walkthrough', value: 'project-walkthrough'},
          {title: 'Golden Visa explainer', value: 'golden-visa'},
          {title: 'Due diligence', value: 'due-diligence'}
        ]
      }
    }),
    defineField({name: 'relatedArea', type: 'reference', to: [{type: 'areaGuide'}]}),
    defineField({name: 'relatedProject', type: 'reference', to: [{type: 'project'}]}),
    defineField({name: 'relatedService', type: 'reference', to: [{type: 'service'}]}),
    defineField({name: 'publishedAt', type: 'datetime'}),
    defineField({name: 'featured', type: 'boolean'}),
    defineField({name: 'seo', type: 'seo'})
  ]
});
