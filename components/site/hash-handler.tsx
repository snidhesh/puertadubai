'use client';

import {useEffect} from 'react';
import {useRouter, usePathname} from '@/lib/i18n/navigation';
import {useLocale} from 'next-intl';
import type {Locale} from '@/lib/i18n/routing';

/**
 * Maps legacy /#dayan, /#about-puerta, /#golden-visa, /#partners-section
 * and /#contact links to their standalone pages. URL fragments are NEVER
 * sent to the server, so this cannot live in `next.config.ts` redirects
 * or `proxy.ts` — it has to run client-side on every navigation.
 *
 * The mapping is locale-aware: `/fr/#dayan` lands on `/fr/founder`, not
 * `/founder`. Hash anchors that still exist on the homepage (e.g.
 * `#hero`) are left alone — the legacy section IDs (`id="dayan"`,
 * `id="about-puerta"`, …) are also kept on `/[locale]/page.tsx` so
 * direct hash links scroll meaningfully even without JS.
 */
const LEGACY_ANCHOR_MAP: Record<string, string> = {
  dayan: '/founder',
  'about-puerta': '/about',
  'golden-visa': '/golden-visa',
  'partners-section': '/partners',
  contact: '/contact'
};

export function HashHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  useEffect(() => {
    function tryMap() {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      const target = LEGACY_ANCHOR_MAP[hash];
      if (!target) return;
      // Only intercept when we're on the home page — every other route
      // can keep its native hash semantics (table-of-contents anchors etc).
      if (pathname !== '/') return;
      // Strip the hash before replacing, so the destination page doesn't
      // try to scroll to a nonexistent anchor.
      router.replace(target, {locale});
    }
    tryMap();
    window.addEventListener('hashchange', tryMap);
    return () => window.removeEventListener('hashchange', tryMap);
  }, [router, pathname, locale]);

  return null;
}
