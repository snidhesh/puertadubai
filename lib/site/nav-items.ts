import {CAREER_ENABLED} from '@/lib/home/content';

/**
 * Single-page anchors shared by the header nav, the mobile drawer and the
 * footer's "Explore" list. `/#about` (not `#about`) so the links also work
 * from /privacy and /legal-notice; next-intl's Link prefixes the locale.
 *
 * The order mirrors the home page's section order (see the header comment
 * in app/[locale]/page.tsx) so the nav reads as a table of contents and the
 * active-section marker moves left to right as the visitor scrolls.
 *
 * Plain module (no 'use client') so Server Components can read the array.
 */
export const NAV_ITEMS = [
  {key: 'listings', href: '/#listings'},
  {key: 'international', href: '/#international'},
  {key: 'about', href: '/#about'},
  {key: 'expertise', href: '/#expertise'},
  {key: 'experience', href: '/#experience'},
  {key: 'atelier', href: '/#atelier'},
  {key: 'media', href: '/#media'},
  {key: 'contact', href: '/#contact'}
] as const;

/** Experience only has an anchor while the career section is rendered. */
export const VISIBLE_NAV_ITEMS = NAV_ITEMS.filter((item) => CAREER_ENABLED || item.key !== 'experience');

/** `/#about` → `about` */
export const anchorId = (href: string) => href.split('#')[1];
