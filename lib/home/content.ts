/**
 * Static, non-translatable data for the single-page portfolio: image
 * paths, hrefs, ids. All human-readable copy lives in `messages/*.json`
 * under the `Home` namespace, keyed by the ids declared here.
 *
 * Anti-fabrication: every entry below reflects a real transaction,
 * appearance or role from Dayan's public profile. Images marked
 * `placeholder: true` are stand-in photography until the real asset
 * is supplied — see DAYAN_CANDAMIL_SITE_UPDATE.md §5.
 */

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/dayancandamil/',
  instagram: 'https://www.instagram.com/dayancandamil/',
  youtube: 'https://www.youtube.com/@Dayan.Candamil',
  youtubeVideos: 'https://www.youtube.com/@Dayan.Candamil/videos',
  houseOfCandamil: 'https://www.houseofcandamil.com',
  blackoak: 'https://blackoak-re.com',
  whatsapp: 'https://wa.me/971544402792',
  whatsappDisplay: '+971 54 440 2792',
  email: 'dayan@dayancandamil.com'
} as const;

export const PORTRAITS = {
  /** Existing black-and-white editorial portrait (white trousers / satin blouse). */
  about: '/images/dayan/bw-portrait.jpg',
  splash: '/images/dayan/turtleneck.jpg',
  /** Colour editorial shot used by the original Let's Connect band. */
  contact: '/images/dayan/connect.jpg',
  atelier: '/images/dayan/white-suit-hat.jpg',
  mandates: '/images/dayan/black-blazer.jpg',
  hultPrize: '/images/dayan/bw-white-blazer-profile.jpg',
  elleArabia: '/images/dayan/bw-satin-blouse.jpg',
  uzbek: '/images/dayan/emerald-earrings.jpg'
} as const;

export type ExpertiseTile = {
  id: 'advisory' | 'privateClients' | 'transactions' | 'developers' | 'corridors' | 'creative';
  image: string;
};

export const EXPERTISE: ReadonlyArray<ExpertiseTile> = [
  {id: 'advisory', image: '/images/tiles/tile-01.jpg'},
  {id: 'privateClients', image: '/images/tiles/tile-05.jpg'},
  {id: 'transactions', image: '/images/tiles/tile-06.jpg'},
  {id: 'developers', image: '/images/uae/business-bay.png'},
  {id: 'corridors', image: '/images/uae/bluewaters-island.jpg'},
  {id: 'creative', image: '/images/dayan/bw-studio-satin.jpg'}
];

export const CAREER_IDS = [
  'blackoak',
  'houseOfCandamil',
  'pulse',
  'europeEmirates',
  'fortune',
  'chevre',
  'accessories',
  'retail'
] as const;

export const ENDORSEMENT_IDS = ['blackoakAppointment', 'caviarSpoon', 'blackoakBridge'] as const;

/**
 * Media tiles share one 4:5 frame so the grid reads as a gallery wall.
 * Portrait assets fill the frame (`cover`); landscape assets — a video
 * still, a certificate — are matted on the dark tone (`contain`) like a
 * framed print rather than cropped. An item without an image renders a
 * typographic placard in the same frame.
 */
export type MediaItem = {
  id: 'bazaar' | 'mfw' | 'elle' | 'alanba' | 'hultPrize' | 'top1';
  image?: string;
  /** How the asset sits in the 4:5 frame. Defaults to `cover`. */
  fit?: 'cover' | 'contain';
  href?: string;
  video?: boolean;
  placeholder?: boolean;
};

export const MEDIA: ReadonlyArray<MediaItem> = [
  {id: 'bazaar', image: '/images/press/bazaar-vn-2021.jpg'},
  {
    id: 'mfw',
    image: '/images/press/marrakech-fashion-week-2022.jpg',
    fit: 'contain',
    href: 'https://www.youtube.com/watch?v=b0JG-50XToQ',
    video: true
  },
  {id: 'elle', image: '/images/press/elle-arabia-2021.jpg'},
  {id: 'alanba'},
  {id: 'hultPrize', image: PORTRAITS.hultPrize},
  {id: 'top1', image: '/images/press/top-1-percent-2024.jpg', fit: 'contain'}
];

/**
 * Curated subset of property-tour videos from the @Dayan.Candamil
 * YouTube channel. IDs are public YouTube video IDs; thumbnails come
 * from i.ytimg.com (allowed in next.config.ts CSP + remotePatterns).
 * Edit this list when newer tours land — RSS feed at
 * /feeds/videos.xml?channel_id=UC6N6_LhTHubhvTFsDraO_xA.
 */
export const FEATURED_VIDEOS: ReadonlyArray<{
  id: string;
  title: string;
  published: string;
  blurb?: string;
}> = [
  {
    id: 'gIE6rMgkfUM',
    title: 'Inside Meraas HQ — Exclusive Access',
    published: '2026-06-03',
    blurb:
      "A walkthrough of what's currently available across Meraas's Dubai portfolio, presented from inside their headquarters with the development team. The kind of access a brochure can't substitute for."
  },
  {id: 'Ts_3JFWGKoE', title: 'Ramhan Island by Eagle Hills', published: '2026-05-21'},
  {id: 'cIgil8feeVM', title: 'Four Seasons Private Residences, Saadiyat Island', published: '2026-05-08'},
  {id: 'Fc7rZRUo6OI', title: 'EYWA Residence Tour, Dubai', published: '2026-05-07'},
  {id: 'UZPayy9Nbko', title: 'Omoria, Dubai Islands', published: '2026-05-07'},
  {id: 'QezDyDXecO0', title: 'Yas Park Place by Aldar Properties', published: '2026-05-07'}
];
