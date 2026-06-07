import {defineField, defineType} from 'sanity';

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeadline',
      type: 'internationalizedArrayString'
    }),
    defineField({
      name: 'heroSub',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'heroPrimaryCtaLabel',
      title: 'Hero primary CTA label',
      description: 'Routes to /projects. Default: "Explore Projects".',
      type: 'internationalizedArrayString'
    }),
    defineField({
      name: 'heroSecondaryCtaLabel',
      title: 'Hero secondary CTA label',
      description: 'Opens the Private Circle modal. Default: "Speak with the Desk".',
      type: 'internationalizedArrayString'
    }),
    defineField({
      name: 'heroBackgroundVideoMode',
      title: 'Hero background mode',
      description: 'Production default: bg-video (uses the re-encoded bg3.av1.webm + bg3.h264.mp4 + poster). Switch to poster-only on very low-spec networks.',
      type: 'string',
      options: {
        list: [
          {title: 'Video', value: 'bg-video'},
          {title: 'Poster only', value: 'poster-only'}
        ],
        layout: 'radio'
      },
      initialValue: 'bg-video'
    }),
    defineField({
      name: 'ctaStripLinks',
      title: 'Hero CTA strip — 3 deep links into /projects',
      description: 'Defaults: /projects?status=off-plan / =ready / =secondary. URL-synced filters power these.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'ctaStripLink',
          fields: [
            defineField({name: 'label', type: 'internationalizedArrayString'}),
            defineField({name: 'href', type: 'string', validation: (r) => r.required()})
          ]
        }
      ],
      validation: (r) => r.max(4)
    }),
    defineField({
      name: 'featuredProjects',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}]
    }),
    defineField({
      name: 'featuredAreas',
      title: 'Featured area guides',
      description: '3–4 cards on the home page.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'areaGuide'}]}],
      validation: (r) => r.max(4)
    }),
    defineField({
      name: 'privateCircleBlock',
      title: 'Private Circle CTA block',
      description:
        'Brand-voice consistency rule: use the phrase "Private Circle" everywhere — hero CTA, modal title, sticky bar, messages JSON. Old site mixed "Pre-Registration Priority Access" and "Founding Circle" — pick one.',
      type: 'object',
      fields: [
        defineField({name: 'heading', type: 'internationalizedArrayString'}),
        defineField({name: 'body', type: 'internationalizedArrayText'}),
        defineField({name: 'ctaLabel', type: 'internationalizedArrayString'})
      ]
    }),
    defineField({
      name: 'whyUAEPillars',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'pillar',
          fields: [
            defineField({name: 'title', type: 'internationalizedArrayString'}),
            defineField({name: 'body', type: 'internationalizedArrayText'})
          ]
        }
      ]
    }),
    defineField({
      name: 'founderBlurb',
      type: 'internationalizedArrayText'
    }),
    defineField({
      name: 'partnerLogos',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'developer'}]}]
    }),
    defineField({
      name: 'statsStrip',
      title: 'Stats strip',
      description: 'Verified-only metrics. Each slot renders only when value+verifiedSource are both populated. Missing slots collapse cleanly — never replaced with a placeholder.',
      type: 'object',
      fields: [
        defineField({
          name: 'yearsExperience',
          type: 'object',
          fields: [
            defineField({name: 'value', type: 'number'}),
            defineField({
              name: 'verifiedSource',
              type: 'string',
              description: 'EMPTY hides the metric. Anti-fabrication contract.'
            })
          ]
        }),
        defineField({
          name: 'transactionVolume',
          type: 'object',
          fields: [
            defineField({name: 'value', type: 'string', description: 'Free-form, e.g. "AED 1.2B+"'}),
            defineField({name: 'currency', type: 'string'}),
            defineField({
              name: 'verifiedSource',
              type: 'string',
              description: 'EMPTY hides the metric. Anti-fabrication contract.'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'featuredTestimonials',
      title: 'Featured testimonials',
      description: '3–4 testimonial cards for the carousel. Section auto-hides when zero records satisfy consent + editorial-approval gates.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'testimonial'}]}],
      validation: (r) => r.max(6)
    }),
    defineField({
      name: 'featuredVideos',
      description: 'v1.1 deferred. Empty unless ≥ 6 published VideoItems exist.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'videoItem'}]}]
    }),
    defineField({
      name: 'selectedTrackRecord',
      description: 'v1.1 deferred. Empty unless ≥ 3 published TrackRecordItems exist.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'trackRecordItem'}]}]
    }),
    defineField({name: 'seo', type: 'seo'})
  ]
});
