import {defineField, defineType} from 'sanity';

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'contactEmail',
      type: 'string',
      description: 'Use a branded inbox (e.g. hello@puertadubai.com). Personal Gmail is a trust risk for a luxury concierge brand.'
    }),
    defineField({name: 'phone', type: 'string'}),
    defineField({name: 'whatsapp', type: 'string'}),
    defineField({
      name: 'socials',
      type: 'object',
      fields: [
        defineField({name: 'instagram', type: 'url'}),
        defineField({name: 'facebook', type: 'url'}),
        defineField({name: 'linkedin', type: 'url'}),
        defineField({name: 'youtube', type: 'url'})
      ]
    }),
    defineField({
      name: 'footerCopy',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'legalNoticePage',
      type: 'reference',
      to: [{type: 'legalPage'}]
    }),
    defineField({
      name: 'privacyPage',
      type: 'reference',
      to: [{type: 'legalPage'}]
    })
  ]
});
