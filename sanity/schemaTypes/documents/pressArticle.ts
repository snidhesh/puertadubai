import {defineField, defineType} from 'sanity';

export const pressArticleType = defineType({
  name: 'pressArticle',
  title: 'Press article',
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
      options: {maxLength: 96},
      validation: (r) => r.required()
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      description: 'Anti-fabrication: real publish date. Empty if not yet approved.'
    }),
    defineField({
      name: 'source',
      type: 'string',
      description: 'In-house announcement vs. third-party coverage. The old site had none of the latter — call this out honestly.',
      options: {
        list: [
          {title: 'In-house announcement', value: 'in-house'},
          {title: 'External publication', value: 'external'}
        ]
      },
      validation: (r) => r.required()
    }),
    defineField({
      name: 'externalUrl',
      type: 'url',
      description: 'Required for external sources. Anti-fabrication: never fake.'
    }),
    defineField({
      name: 'excerpt',
      type: 'internationalizedArrayText'
    }),
    defineField({name: 'coverImage', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'body',
      type: 'internationalizedArrayText'
    }),
    defineField({name: 'seo', type: 'seo'})
  ]
});
