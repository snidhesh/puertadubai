import {defineField, defineType} from 'sanity';

/**
 * SEO group shared across every public document type. Localised via
 * internationalised-array so each locale has its own title/description.
 * The image is intentionally NOT localised — one OG asset per document.
 */
export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'internationalizedArrayString'
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      options: {hotspot: true}
    })
  ]
});
