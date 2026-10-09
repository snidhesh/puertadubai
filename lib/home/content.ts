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
  instagram: 'https://www.instagram.com/dayancandamilglobal/',
  instagramHandle: '@dayancandamilglobal',
  youtube: 'https://www.youtube.com/@Dayan.Candamil',
  youtubeVideos: 'https://www.youtube.com/@Dayan.Candamil/videos',
  houseOfCandamil: 'https://www.houseofcandamil.com',
  blackoak: 'https://blackoak-re.com',
  whatsapp: 'https://wa.me/971544402792',
  whatsappDisplay: '+971 54 440 2792',
  email: 'dayan@dayancandamil.com'
} as const;

/**
 * Curated posts for the Instagram mosaic on the home page: the first is
 * the hero tile, the next six fill the small tiles. Images are our own
 * copies of the post media (Instagram's CDN URLs are signed and expire);
 * each tile links to the public post. When the live feed is available
 * (`INSTAGRAM_ACCESS_TOKEN`) the latest posts take the small tiles and the
 * hero stays curated.
 */
export type InstagramPick = {
  /** Post shortcode, e.g. the `Cx…` part of instagram.com/p/Cx…/ */
  id: string;
  image: string;
  permalink: string;
  video?: boolean;
  /** Crop anchor for the square tile; `top` keeps a graphic's headline in frame. */
  focus?: 'top' | 'center';
};

export const INSTAGRAM_POSTS: ReadonlyArray<InstagramPick> = [
  // Hero: walking the pool deck of a waterfront villa (reel cover).
  {id: 'DeHf7KAIjSH', image: '/images/instagram/DeHf7KAIjSH.jpg', permalink: 'https://www.instagram.com/reel/DeHf7KAIjSH/', video: true},
  // "I don't sell homes. I build portfolios." — brand statement.
  {id: 'Dd8p5Y1od00', image: '/images/instagram/Dd8p5Y1od00.jpg', permalink: 'https://www.instagram.com/p/Dd8p5Y1od00/'},
  // MJL Lamaa apartment for sale, Madinat Jumeirah Living (reel cover).
  {id: 'DePzJ-II4HQ', image: '/images/instagram/DePzJ-II4HQ.jpg', permalink: 'https://www.instagram.com/reel/DePzJ-II4HQ/', video: true, focus: 'top'},
  // Dayan against the Dubai skyline at dusk (reel cover).
  {id: 'Dd9Jeg1IkgP', image: '/images/instagram/Dd9Jeg1IkgP.jpg', permalink: 'https://www.instagram.com/reel/Dd9Jeg1IkgP/', video: true},
  // Ramhan Island marina apartments, Abu Dhabi (reel cover).
  {id: 'Dd1VI_Io6ai', image: '/images/instagram/Dd1VI_Io6ai.jpg', permalink: 'https://www.instagram.com/reel/Dd1VI_Io6ai/', video: true, focus: 'top'},
  // Opening the door of a residence (reel cover).
  {id: 'Ddv0Tj0oQwE', image: '/images/instagram/Ddv0Tj0oQwE.jpg', permalink: 'https://www.instagram.com/reel/Ddv0Tj0oQwE/', video: true},
  // Delano Marrakech save-the-date, 30 October 2026 — monochrome sketch.
  {id: 'DeKRlbUIQ2o', image: '/images/instagram/DeKRlbUIQ2o.jpg', permalink: 'https://www.instagram.com/p/DeKRlbUIQ2o/'}
];

/** Profile picture saved locally; `undefined` falls back to the Instagram glyph. */
export const INSTAGRAM_AVATAR: string | undefined = '/images/instagram/profile.jpg';

/**
 * International assets featured on the home page (after the International
 * Properties page on blackoak-re.com). Copy lives in messages under
 * `Home.international.properties.<id>`; `focus` is the photo's object-position.
 */
export const INTERNATIONAL_PROPERTIES = [
  {id: 'portugalLand', image: '/images/international/portugal.jpg', focus: '50% 45%'}
] as const;

export const PORTRAITS = {
  /** Black-and-white editorial portrait, full-frame 2:3 (source: assets/dayan-aboutus.jpeg). */
  about: '/images/dayan/about-portrait.jpg',
  splash: '/images/dayan/turtleneck.jpg',
  /** Colour editorial shot used by the original Let's Connect band. */
  contact: '/images/dayan/connect.jpg',
  /** Cut-out figure on transparent ground — frames use object-contain
   * (source: assets/dayan_gallery/house of candamil.png, 408×612, swapped in 2026-10-09). */
  atelier: '/images/dayan/house-of-candamil.png',
  mandates: '/images/dayan/black-blazer.jpg',
  hultPrize: '/images/dayan/bw-white-blazer-profile.jpg',
  elleArabia: '/images/dayan/bw-satin-blouse.jpg',
  uzbek: '/images/dayan/emerald-earrings.jpg'
} as const;

export type ExpertiseTile = {
  id: 'advisory' | 'privateClients' | 'transactions' | 'developers' | 'marrakech' | 'houseOfCandamil';
  /** URL segment of the detail page at /expertise/[slug]. */
  slug: string;
  image: string;
  /** Optional onward link shown on the detail page. */
  related?: {href: string; label: 'listings' | 'atelier'};
};

/** Order follows sections 2–7 of the copy document. */
export const EXPERTISE: ReadonlyArray<ExpertiseTile> = [
  {id: 'advisory', slug: 'cross-border-investment', image: '/images/tiles/tile-01.jpg'},
  {id: 'privateClients', slug: 'private-clients', image: '/images/tiles/tile-05.jpg'},
  {
    id: 'transactions',
    slug: 'prime-off-market',
    image: '/images/tiles/tile-06.jpg',
    related: {href: '/projects', label: 'listings'}
  },
  {id: 'developers', slug: 'developer-market-entry', image: '/images/uae/business-bay.png'},
  {id: 'marrakech', slug: 'marrakech-north-africa', image: '/images/uae/bluewaters-island.jpg'},
  {
    id: 'houseOfCandamil',
    slug: 'house-of-candamil',
    image: '/images/dayan/bw-studio-satin.jpg',
    related: {href: '/#atelier', label: 'atelier'}
  }
];

/** Titled items on each expertise detail page (`point<N>Title` / `point<N>Body` in messages). */
export const EXPERTISE_POINTS = [1, 2, 3] as const;

/**
 * Case studies, from section 8 of the copy document. Copy lives in
 * `Home.caseStudies.items.<id>`. Photography is still stand-in (no
 * project imagery supplied); swap `image` when assets land. An entry
 * flagged `placeholder` (dummy copy) renders `noindex` and stays out of
 * the sitemap.
 */
export type CaseStudy = {
  id: 'familyOffice' | 'estateCommission';
  /** URL segment of the detail page at /case-studies/[slug]. */
  slug: string;
  number: number;
  image: string;
  placeholder?: boolean;
};

export const CASE_STUDIES: ReadonlyArray<CaseStudy> = [
  {id: 'familyOffice', slug: '1', number: 1, image: '/images/uae/difc.jpg'},
  {id: 'estateCommission', slug: '2', number: 2, image: '/images/tiles/tile-02.jpg'}
];

/** Body sections of a case-study detail page, in order. */
export const CASE_STUDY_SECTIONS = ['objective', 'approach', 'outcome'] as const;

/** Coming-soon banner for the client Data Room; flip to false to hide it again. */
export const DATA_ROOM_ENABLED = true;
/** The three feature cards (payment plans, returns, project data) are parked until the content is real. */
export const DATA_ROOM_CARDS_ENABLED = false;

/** The career timeline (nav "Experience") is hidden; flip to true to show it again. */
export const CAREER_ENABLED = false;

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
 * Reviews quoted from Dayan's public Trustpilot profile, newest first.
 * Wording lives in `Home.reviews.items.<id>` and must match the profile
 * word for word — a review is never edited, only excerpted (`excerpt`
 * marks one that is cut short and ends in an ellipsis). No aggregate
 * score or review count is shown, so the section cannot drift from what
 * Trustpilot itself displays. Add new reviews here by hand.
 */
export const TRUSTPILOT = {
  profile: 'https://www.trustpilot.com/review/www.dayancandamil.com',
  write: 'https://www.trustpilot.com/evaluate/www.dayancandamil.com',
  reviews: [
    {id: 'terraine', rating: 5, published: '2026-09-23', excerpt: true},
    {id: 'johnPaulo', rating: 5, published: '2026-06-04', excerpt: false},
    {id: 'dave', rating: 5, published: '2025-11-13', excerpt: false}
  ]
} as const;

/**
 * Press features, shown as click-to-expand image panels (see
 * components/home/press-panels.tsx). Images fill their panel, anchored to
 * the top so magazine mastheads survive the crop; an item without an image
 * gets a plain tone and a typographic placard so nothing fabricated is shown.
 */
export type MediaItem = {
  id: 'bazaar' | 'mfw' | 'elle' | 'alanba' | 'hultPrize';
  image?: string;
  /** Where the crop anchors. Defaults to `top` so magazine mastheads survive. */
  focus?: 'top' | 'center';
  href?: string;
  video?: boolean;
  placeholder?: boolean;
};

/**
 * On-page order; the first item is the one open by default. `href` without
 * `video` is Dayan's LinkedIn post about the feature (public, no sign-in).
 */
export const MEDIA: ReadonlyArray<MediaItem> = [
  {
    id: 'elle',
    image: '/images/press/elle-arabia-2021.jpg',
    href: 'https://www.linkedin.com/posts/dayancandamil_ellearabia-dubai-ellemagazine-share-6792989519370096640-mzB4/'
  },
  {id: 'bazaar', image: '/images/press/bazaar-vn-2021.jpg'},
  {
    id: 'mfw',
    image: '/images/press/marrakech-fashion-week-2022.jpg',
    href: 'https://www.youtube.com/watch?v=b0JG-50XToQ',
    video: true
  },
  // Kuwait Towers stand in for the article page (the post itself carries the
  // 4 Aug 2022 clipping); centred so the globes stay in frame.
  {
    id: 'alanba',
    image: '/images/press/alanba-kuwait-towers.jpg',
    focus: 'center',
    href: 'https://www.linkedin.com/posts/dayancandamil_gokuwait-kuwait-gcc-share-7140790163063975936-wZk7/'
  },
  // Speaker portrait from the Hult Prize announcement (photo: Andrés Oyuela, per the post).
  {
    id: 'hultPrize',
    image: '/images/press/hult-prize-settat-2023.jpg',
    href: 'https://www.linkedin.com/posts/dayancandamil_thankyou-settat-hultprizefoundation-ugcPost-7143319611235618816-mxmJ/'
  }
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
