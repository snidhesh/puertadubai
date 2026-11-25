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
 * each tile links to the public post. The curated picks always win; the
 * live feed (`INSTAGRAM_ACCESS_TOKEN`) only fills the small tiles if fewer
 * than six are curated.
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
  // Dayan's most-viewed reels on @dayancandamilglobal, by view count on the
  // Reels tab (checked 2026-11-25), keeping only covers with Dayan on camera.
  // Left out despite their views: two collab reels posted by @moza_queiroz
  // (DKxdD9_osj2 15.2K, DMvNl82IF8m), DaSsx5mIQmL (4.8K, cover built around
  // Mohamed Alabbar's portrait), Db_QtNUoMYP (4.2K, developer ad with a QR
  // code), DcrAyRRoeuk (1.9K, cover shows someone else), and covers carrying
  // QR codes or a phone number (DcOH8YMof5d, DYJuHAPI1wA, DYCZRc-oLcx).
  // Hero: crossing the office — "You work in a male dominated industry…" (82.5K, 12 Oct 2026).
  {id: 'DeZmOO2oQYI', image: '/images/instagram/DeZmOO2oQYI.jpg', permalink: 'https://www.instagram.com/reel/DeZmOO2oQYI/', video: true},
  // Ocean-front villas, "with just over a thousand families" (6.2K, 28 May 2026).
  {id: 'DY5HtaJItWd', image: '/images/instagram/DY5HtaJItWd.jpg', permalink: 'https://www.instagram.com/reel/DY5HtaJItWd/', video: true},
  // "Explaining to my client why they should buy from me" (4.0K, 21 Oct 2026).
  {id: 'Dewtyn4o0Ah', image: '/images/instagram/Dewtyn4o0Ah.jpg', permalink: 'https://www.instagram.com/reel/Dewtyn4o0Ah/', video: true},
  // "You're such a strong woman" (3.7K, 19 Oct 2026).
  {id: 'DerhwjIIAHw', image: '/images/instagram/DerhwjIIAHw.jpg', permalink: 'https://www.instagram.com/reel/DerhwjIIAHw/', video: true},
  // "You have so many clients. Where do you find them?" at her desk (1.5K).
  {id: 'DdY3O6SI4GB', image: '/images/instagram/DdY3O6SI4GB.jpg', permalink: 'https://www.instagram.com/reel/DdY3O6SI4GB/', video: true},
  // At the Aldar launch of Marsa Al Saadiyat with BlackOak (1.3K, 21 Aug 2026).
  {id: 'DcT0ukjIq4D', image: '/images/instagram/DcT0ukjIq4D.jpg', permalink: 'https://www.instagram.com/reel/DcT0ukjIq4D/', video: true},
  // "We are here" — touring a villa (1.1K).
  {id: 'DaMzFkSIngp', image: '/images/instagram/DaMzFkSIngp.jpg', permalink: 'https://www.instagram.com/reel/DaMzFkSIngp/', video: true}
];

/** Profile picture saved locally; `undefined` falls back to the Instagram glyph. */
export const INSTAGRAM_AVATAR: string | undefined = '/images/instagram/profile.jpg';

/**
 * International assets featured on the home page (after the International
 * Properties page on blackoak-re.com). Copy lives in messages under
 * `Home.international.properties.<id>`; `focus` is the photo's object-position.
 */
export const INTERNATIONAL_PROPERTIES = [
  {id: 'portugalLand', image: '/images/international/portugal.jpg', focus: '50% 45%'},
  // Facts and render from delanoresidencesmarrakech.com (checked 2026-10-27); the
  // site states no prices, sizes or delivery date, so none are shown.
  {id: 'delanoMarrakech', image: '/images/international/delano-marrakech.jpg', focus: '35% 50%'}
] as const;

export const PORTRAITS = {
  /**
   * Black-and-white seated portrait in a white suit, 1125×1930. She sits on
   * the right of the frame with dark negative space to her left, so the About
   * section places it on the right and feathers that dark edge into the page.
   * Never mirror it. Source: assets/new_pic_2.JPG (swapped in 2026-11-25),
   * cropped 70px at the foot to remove a "Meta AI" watermark.
   */
  about: '/images/dayan/about-white-suit.jpg',
  splash: '/images/dayan/turtleneck.jpg',
  /** Colour editorial shot used by the original Let's Connect band. */
  contact: '/images/dayan/connect.jpg',
  /** Cut-out figure on transparent ground — frames use object-contain
   * (source: assets/dayan_gallery/house of candamil.png, 408×612, swapped in 2026-10-09). */
  atelier: '/images/dayan/house-of-candamil.png',
  /**
   * Black-and-white seated turtleneck portrait, 1080×1819 (source:
   * assets/new_pic_1.JPG, swapped in 2026-11-25). The panel is landscape, so
   * the card crops to the face and lets the black turtleneck run into the
   * card's dark gradient under the copy (crop set at the PanelCard call).
   */
  mandates: '/images/dayan/mandates-portrait.jpg',
  hultPrize: '/images/dayan/bw-white-blazer-profile.jpg',
  elleArabia: '/images/dayan/bw-satin-blouse.jpg',
  uzbek: '/images/dayan/emerald-earrings.jpg'
} as const;

export type ExpertiseTile = {
  id: 'advisory' | 'privateClients' | 'transactions' | 'developers' | 'marrakech' | 'houseOfCandamil';
  /** URL segment of the detail page at /expertise/[slug]. */
  slug: string;
  image: string;
  /**
   * CSS `object-position` for the photo. The home tile is square and the
   * detail hero is a wide band, so a full-length portrait needs its focus
   * pulled up to the face; landscape photos crop fine from the centre.
   */
  focus?: string;
  /**
   * Where the tile links instead of its /expertise/[slug] page. House of
   * Candamil goes to the home page's Atelier section, which leads on to the
   * full /house-of-candamil page.
   */
  href?: string;
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
  {id: 'developers', slug: 'developer-market-entry', image: '/images/uae/business-bay.jpg'},
  {id: 'marrakech', slug: 'marrakech-north-africa', image: '/images/uae/bluewaters-island.jpg'},
  {
    id: 'houseOfCandamil',
    slug: 'house-of-candamil',
    href: '/#atelier',
    image: '/images/dayan/bw-studio-satin.jpg',
    focus: '50% 8%',
    related: {href: '/house-of-candamil', label: 'atelier'}
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
  /** A single review's page is `${reviewBase}${reviewId}`. */
  reviewBase: 'https://www.trustpilot.com/reviews/',
  /**
   * TrustScore as displayed on the profile page when it was last checked
   * (2026-10-13: 4.0 "Great", 3 reviews). It is Trustpilot's weighted figure,
   * not an average of the cards below, so it must be refreshed by hand when
   * the profile changes; the band word lives in `Home.reviews.scoreBand`.
   */
  trustScore: 4.0,
  /**
   * Every review on the public profile, verbatim, newest first (checked
   * 2026-10-13). `published` and `experienced` are the dates Trustpilot
   * shows; `country` and `reviewCount` are the reviewer line it prints.
   */
  reviews: [
    {
      id: 'antonio',
      reviewId: '6acce4919159cb7a3d559ba2',
      rating: 5,
      country: 'AE',
      reviewCount: 1,
      published: '2026-10-12',
      experienced: '2026-10-03'
    },
    {
      id: 'riad',
      reviewId: '6ac3ecda1b0e60d8ba3a84e8',
      rating: 5,
      country: 'AE',
      reviewCount: 1,
      published: '2026-10-05',
      experienced: '2026-10-05'
    },
    {
      id: 'dave',
      reviewId: '6abe4fc62be7ce232f80a83a',
      rating: 5,
      country: 'UZ',
      reviewCount: 2,
      published: '2026-10-01',
      experienced: '2025-11-13'
    }
  ]
} as const;

/**
 * Press features, shown as click-to-expand image panels (see
 * components/home/press-panels.tsx). Images fill their panel, anchored to
 * the top so magazine mastheads survive the crop; an item without an image
 * gets a plain tone and a typographic placard so nothing fabricated is shown.
 */
export type MediaItem = {
  id: 'bazaar' | 'mfw' | 'elle' | 'alanba' | 'hultPrize' | 'coctelBlogger' | 'coctelAsia';
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
  },
  // Two Spanish-language magazine pages ("coctel de noticias" column) supplied by
  // the user 2026-10-27 (assets/IMG_8984.JPG, IMG_8985.JPG), cropped to Dayan's
  // story only. Outlet and issue date unknown, so the copy names neither.
  {id: 'coctelBlogger', image: '/images/press/coctel-mundo-blogger.jpg', focus: 'center'},
  {id: 'coctelAsia', image: '/images/press/coctel-elefantes-asia.jpg', focus: 'center'}
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
  /** Key under `Home.videos.blurbs` in messages/*.json. */
  blurbKey?: 'meraasHq';
}> = [
  {
    id: 'gIE6rMgkfUM',
    title: 'Inside Meraas HQ — Exclusive Access',
    published: '2026-06-03',
    blurbKey: 'meraasHq'
  },
  {id: 'Ts_3JFWGKoE', title: 'Ramhan Island by Eagle Hills', published: '2026-05-21'},
  {id: 'cIgil8feeVM', title: 'Four Seasons Private Residences, Saadiyat Island', published: '2026-05-08'},
  {id: 'Fc7rZRUo6OI', title: 'EYWA Residence Tour, Dubai', published: '2026-05-07'},
  {id: 'UZPayy9Nbko', title: 'Omoria, Dubai Islands', published: '2026-05-07'},
  {id: 'QezDyDXecO0', title: 'Yas Park Place by Aldar Properties', published: '2026-05-07'}
];
