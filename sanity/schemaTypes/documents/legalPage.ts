import {defineField, defineType} from 'sanity';

export const legalPageType = defineType({
  name: 'legalPage',
  title: 'Legal page',
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
      name: 'body',
      type: 'internationalizedArrayText'
    }),
    defineField({name: 'seo', type: 'seo'})
  ]
});
