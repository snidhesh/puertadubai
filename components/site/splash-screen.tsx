'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';
import {PORTRAITS} from '@/lib/home/content';
import logoLockup from '../../public/brand/logo-lockup.png';

/**
 * Initial-load splash overlay — fixed full-viewport, fades out after
 * a fixed 5-second display window. Shows on every full page load of the
 * homepage (reload included). It does not replay on client-side
 * navigation back to home within the same document.
 *
 * - z-[100] sits above the fixed nav (z-40) and the sticky socials (z-30).
 * - Scroll is locked (via `html.dc-splash-open`) while visible.
 * - Server-rendered at full opacity so it covers the page from the very
 *   first paint, before any JavaScript runs. A one-line inline script
 *   ahead of it locks scroll pre-hydration; the effect below takes over
 *   once React hydrates. (The marketing CSP allows 'unsafe-inline'
 *   scripts; see next.config.ts.)
 */

const DISPLAY_MS = 5000;
const FADE_MS = 600;
/** Set on <html> while the overlay is up; locks scroll (globals.css). */
const OPEN_CLASS = 'dc-splash-open';
// Module-scoped: survives client-side navigation, resets on a full load.
// `initialPath` is the route this document was loaded on; once the splash
// has completed, or the user has navigated client-side to another route,
// `initialLoadDone` blocks any replay. Keyed on the path (rather than a
// simple "shown" flag set at mount) so React Strict Mode's double effect
// run in development doesn't count as a navigation.
let initialPath: string | null = null;
let initialLoadDone = false;

// Runs inline, synchronously, at its position in the HTML — i.e. before
// the overlay element below is parsed and before React hydrates.
const PRE_HYDRATION_SCRIPT = `document.documentElement.classList.add('${OPEN_CLASS}')`;

function isHomePath(path: string) {
  if (path === '/') return true;
  return /^\/(en|fr|es|pt|ar)\/?$/.test(path);
}

export function SplashScreen() {
  const t = useTranslations('Nav');
  const tSplash = useTranslations('Splash');
  const pathname = usePathname();
  const onHome = isHomePath(pathname);
  // SSR / first-paint default: fully visible on home so the overlay covers
  // the page before hydration.
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>(
    onHome ? 'visible' : 'gone'
  );

  useEffect(() => {
    const root = document.documentElement;
    // All setPhase() calls in this body are deferred via queueMicrotask
    // so they don't fire synchronously inside the effect (React 19
    // cascading-render lint rule). Timer-scheduled setPhase() calls are
    // already asynchronous and don't need to be wrapped.
    if (initialPath === null) initialPath = pathname;
    // Any client-side navigation ends the "initial load" for good.
    if (pathname !== initialPath) initialLoadDone = true;
    if (!onHome || initialLoadDone) {
      root.classList.remove(OPEN_CLASS);
      queueMicrotask(() => setPhase('gone'));
      return;
    }

    root.classList.add(OPEN_CLASS);
    queueMicrotask(() => setPhase('visible'));

    // Start fade-out after the display window.
    const fadeTimer = window.setTimeout(() => {
      initialLoadDone = true;
      setPhase('fading');
      window.setTimeout(() => {
        root.classList.remove(OPEN_CLASS);
        setPhase('gone');
      }, FADE_MS);
    }, DISPLAY_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      root.classList.remove(OPEN_CLASS);
    };
  }, [onHome, pathname]);

  if (phase === 'gone') return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{__html: PRE_HYDRATION_SCRIPT}} />
      <div
        data-splash=""
        role="status"
        aria-live="polite"
        aria-label={t('loading')}
        className={cn(
          'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-dark)] transition-opacity duration-[600ms] ease-out',
          phase === 'visible' && 'opacity-100',
          phase === 'fading' && 'pointer-events-none opacity-0'
        )}
      >
        {/* Logo (inverted to white via filter) */}
        <Image
          src={logoLockup}
          alt={t('wordmark')}
          height={96}
          width={Math.round((96 * 616) / 168)}
          priority
          className="h-16 w-auto [filter:invert(1)] md:h-24"
        />

        {/* Dayan portrait */}
        <div className="relative mt-8 h-32 w-32 overflow-hidden rounded-full border border-white/20 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] md:mt-10 md:h-40 md:w-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PORTRAITS.splash}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </div>

        {/* Brand description */}
        <p
          className="mt-8 max-w-md px-6 text-center font-display text-lg leading-[1.5] !text-white md:mt-10 md:text-2xl"
          style={{color: '#ffffff'}}
        >
          {tSplash('tagline')}
        </p>

        {/* Indeterminate loading bar */}
        <div className="mt-10 h-px w-32 overflow-hidden bg-white/15 md:mt-12">
          <span
            aria-hidden="true"
            className="block h-full w-1/3 animate-[splashSlide_1400ms_ease-in-out_infinite] bg-white/80"
          />
        </div>

        <style>{`
          @keyframes splashSlide {
            0%   { transform: translateX(-100%); }
            50%  { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    </>
  );
}
