'use client';

import {useSyncExternalStore} from 'react';
import {useTranslations} from 'next-intl';
import {SOCIAL_ICONS} from '@/lib/site/social';
import {cn} from '@/lib/utils';

/**
 * Right-edge social column that begins at the hero and stays sticky
 * through the scroll. Each icon sits inside a small dark glass disc
 * (`bg-black/45 backdrop-blur`) so the white glyph reads cleanly on
 * both the dark hero video and the light cream sections beneath.
 *
 * The column hides once the bottom of the document is within one
 * viewport height — keeps it from sitting on top of the footer.
 */

const HIDE_BUFFER_PX = 320;

function subscribeBottom(cb: () => void) {
  window.addEventListener('scroll', cb, {passive: true});
  window.addEventListener('resize', cb);
  return () => {
    window.removeEventListener('scroll', cb);
    window.removeEventListener('resize', cb);
  };
}

function getSnapshotNearBottom() {
  const docHeight = document.documentElement.scrollHeight;
  return window.scrollY + window.innerHeight >= docHeight - HIDE_BUFFER_PX;
}

function getServerSnapshotNearBottom() {
  // Server render: assume we're not at the bottom (so the column is
  // visible at first paint and hides post-hydration if needed).
  return false;
}

export function StickySocials() {
  const t = useTranslations('Nav');
  const nearBottom = useSyncExternalStore(
    subscribeBottom,
    getSnapshotNearBottom,
    getServerSnapshotNearBottom
  );

  return (
    <ul
      aria-label={t('socialChannels')}
      className={cn(
        'pointer-events-none fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 transition-opacity duration-300 md:flex',
        'end-4 lg:end-6',
        nearBottom ? 'opacity-0' : 'opacity-100'
      )}
      aria-hidden={nearBottom}
    >
      {SOCIAL_ICONS.map((icon) => (
        <li key={icon.href}>
          <a
            href={icon.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={icon.label}
            tabIndex={nearBottom ? -1 : 0}
            className={cn(
              'pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/65 hover:text-white',
              nearBottom && 'pointer-events-none'
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            >
              <path d={icon.path} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
