import {defineField, defineType} from 'sanity';

export const developerType = defineType({
  name: 'developer',
  title: 'Developer',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Canonical English slug, shared across locales.',
      options: {source: 'name', maxLength: 96},
      validation: (r) => r.required()
    }),
    defineField({name: 'logo', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayText'
    }),
    defineField({name: 'website', type: 'url'}),
    defineField({name: 'seo', type: 'seo'})
  ],
  preview: {
    select: {title: 'name', media: 'logo'}
  }
});
