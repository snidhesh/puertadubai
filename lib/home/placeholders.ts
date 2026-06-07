/**
 * Placeholder content for the home page when Sanity hasn't been seeded
 * yet. Used to render the Mahsheed-style layout so the page reads
 * complete in dev / first-load preview.
 *
 * Anti-fabrication carve-outs (deliberately empty until counsel +
 * verifiable sources land):
 *   - No press / media-mention logos (CNN, Vogue, Harper's, etc.).
 *   - No invented dollar transaction volumes.
 *   - Testimonial attributions are clearly anonymised initials.
 */

export type FeaturedListingPlaceholder = {
  id: string;
  title: string;
  area: string;
  emirate: string;
  developer: string;
  priceFrom: string;
  image: string;
};

export const FEATURED_LISTING_PLACEHOLDERS: ReadonlyArray<FeaturedListingPlaceholder> = [
  {
    id: 'p-costa-mare',
    title: 'Costa Mare',
    area: 'Al Marjan Island',
    emirate: 'Ras Al Khaimah',
    developer: 'Costa Mare Developments',
    priceFrom: 'USD 270,000',
    image: '/dummy/listing-1.jpg'
  },
  {
    id: 'p-saadiyat-grove',
    title: 'Saadiyat Grove',
    area: 'Saadiyat Island',
    emirate: 'Abu Dhabi',
    developer: 'Aldar',
    priceFrom: 'AED 1.29M',
    image: '/dummy/listing-2.jpg'
  },
  {
    id: 'p-binghatti-house',
    title: 'Binghatti House',
    area: 'Jumeirah Village Circle',
    emirate: 'Dubai',
    developer: 'Binghatti',
    priceFrom: 'AED 950,000',
    image: '/dummy/listing-3.jpg'
  },
  {
    id: 'p-ir1dian',
    title: 'IR1DIAN Park',
    area: 'Jumeirah Village Circle',
    emirate: 'Dubai',
    developer: 'Object 1',
    priceFrom: 'AED 772,000',
    image: '/dummy/listing-4.jpg'
  },
  {
    id: 'p-creek-blue',
    title: 'Palace Residences Creek Blue',
    area: 'Dubai Creek Harbour',
    emirate: 'Dubai',
    developer: 'Emaar',
    priceFrom: 'AED 1.87M',
    image: '/dummy/listing-5.jpg'
  },
  {
    id: 'p-greenside',
    title: 'Greenside Residence',
    area: 'Dubai Hills Estate',
    emirate: 'Dubai',
    developer: 'Emaar',
    priceFrom: 'AED 1.4M',
    image: '/dummy/listing-6.jpg'
  },
  {
    id: 'p-ellington',
    title: 'Ellington House II',
    area: 'Dubai Hills Estate',
    emirate: 'Dubai',
    developer: 'Ellington',
    priceFrom: 'On request',
    image: '/dummy/listing-7.jpg'
  }
];

export type CtaCard = {
  href: string;
  label: string;
  sublabel: string;
  image: string;
};

export const CTA_CARDS: ReadonlyArray<CtaCard> = [
  {href: '/projects?emirate=dubai', label: 'Dubai', sublabel: 'By emirate', image: '/dummy/mh/cta-01.jpg'},
  {href: '/projects?emirate=abu-dhabi', label: 'Abu Dhabi', sublabel: 'By emirate', image: '/dummy/mh/cta-02.jpg'},
  {href: '/projects?status=off-plan', label: 'Off-plan launches', sublabel: 'By status', image: '/dummy/mh/cta-03.jpg'},
  {href: '/projects?status=ready', label: 'Ready properties', sublabel: 'By status', image: '/dummy/mh/cta-04.jpg'},
  {href: '/areas', label: 'Investment areas', sublabel: 'Guides', image: '/dummy/mh/cta-05.jpg'},
  {href: '/golden-visa', label: 'Golden Visa', sublabel: 'Residency', image: '/dummy/mh/cta-06.jpg'}
];

export type TestimonialPlaceholder = {
  id: string;
  quote: string;
  attribution: string;
  role: string;
  portrait: string;
};

export const TESTIMONIAL_PLACEHOLDERS: ReadonlyArray<TestimonialPlaceholder> = [
  {
    id: 't-1',
    quote:
      'They walked me through every step — off-plan diligence, banking, residency — without a single dropped ball. The most efficient HNW concierge experience I have had in the region.',
    attribution: 'A. D.',
    role: 'Investor, Singapore',
    portrait: '/dummy/testimonial-1.jpg'
  },
  {
    id: 't-2',
    quote:
      'I was relocating with my family from Madrid and the team handled school placements, the Golden Visa application, and our first property purchase in parallel. Everything happened on time.',
    attribution: 'M. R.',
    role: 'Family relocation, Spain',
    portrait: '/dummy/testimonial-2.jpg'
  },
  {
    id: 't-3',
    quote:
      'Their knowledge of secondary-market pricing across Dubai Hills and Saadiyat was the reason we did not overpay. A real fiduciary, not a sales channel.',
    attribution: 'J. K.',
    role: 'Yield-led investor, UK',
    portrait: '/dummy/testimonial-3.jpg'
  }
];

export type FeaturedVideoPlaceholder = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export const FEATURED_VIDEO_PLACEHOLDER: FeaturedVideoPlaceholder = {
  id: 'v-1',
  title: 'A founder note on the UAE investment landscape',
  description:
    'Dayan opens the year with the desk’s read on Dubai, Abu Dhabi and Ras Al Khaimah — where capital is moving, where it is staying, and what to avoid.',
  category: 'Founder message'
};
