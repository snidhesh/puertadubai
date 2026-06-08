'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';
import logoBlack from '../../public/brand/logo-black.png';

/**
 * Initial-load splash overlay — fixed full-viewport, fades out after
 * a fixed 5-second display window. Only shows on the homepage and
 * gated to once per 24 hours via localStorage so returning visitors
 * the same day skip it.
 *
 * - z-[100] sits above the fixed nav (z-40) and the sticky socials (z-30).
 * - Body scroll is locked while visible so users don't scroll behind it.
 * - Server render returns null; the splash is purely client-side, layered
 *   on top of the SSR'd page.
 */

const DISPLAY_MS = 5000;
const FADE_MS = 600;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'puerta:splash-last-shown';

function isHomePath(path: string) {
  if (path === '/') return true;
  return /^\/(en|fr|es|pt|ar)\/?$/.test(path);
}

export function SplashScreen() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const onHome = isHomePath(pathname);
  // Conservative SSR / first-paint default: 'mounting' on home so the
  // overlay is in the DOM before hydration runs; the effect immediately
  // demotes it to 'gone' if we showed it in the last 24 h.
  const [phase, setPhase] = useState<'mounting' | 'visible' | 'fading' | 'gone'>(
    onHome ? 'mounting' : 'gone'
  );

  useEffect(() => {
    // All setPhase() calls in this body are deferred via queueMicrotask
    // so they don't fire synchronously inside the effect (React 19
    // cascading-render lint rule). Timer-scheduled setPhase() calls are
    // already asynchronous and don't need to be wrapped.
    if (!onHome) {
      queueMicrotask(() => setPhase('gone'));
      return;
    }

    // Once-per-day gate. localStorage persists across tabs and sessions,
    // so the user only sees the splash on the first homepage landing of
    // each calendar day (rolling 24 h window).
    let lastShown = 0;
    try {
      lastShown = Number(localStorage.getItem(STORAGE_KEY) ?? '0');
    } catch {
      // localStorage can throw in private / sandbox modes — we just
      // proceed without the gate; splash will show every time there.
    }
    const now = Date.now();
    if (Number.isFinite(lastShown) && now - lastShown < ONE_DAY_MS) {
      queueMicrotask(() => setPhase('gone'));
      return;
    }

    // Each qualifying landing replays from the top.
    queueMicrotask(() => setPhase('mounting'));

    // Lock scroll while visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Trigger the entrance opacity transition on the next tick.
    const enterTimer = window.setTimeout(() => setPhase('visible'), 16);

    // Start fade-out after the display window.
    const fadeTimer = window.setTimeout(() => {
      setPhase('fading');
      window.setTimeout(() => {
        document.body.style.overflow = prevOverflow;
        setPhase('gone');
      }, FADE_MS);
    }, DISPLAY_MS);

    // Mark "shown today" the moment the splash actually becomes visible,
    // so a reload mid-display still respects the once-per-day gate.
    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      // ignored — see localStorage note above
    }

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(fadeTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [onHome, pathname]);

  if (phase === 'gone') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('loading')}
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-dark)] transition-opacity duration-[600ms] ease-out',
        phase === 'mounting' && 'opacity-0',
        phase === 'visible' && 'opacity-100',
        phase === 'fading' && 'pointer-events-none opacity-0'
      )}
    >
      {/* Logo (inverted to white via filter) */}
      <Image
        src={logoBlack}
        alt="Puerta Dubai"
        height={96}
        width={Math.round((96 * 2842) / 3781)}
        priority
        className="h-16 w-auto [filter:invert(1)] md:h-24"
      />

      {/* Dayan portrait */}
      <div className="relative mt-8 h-32 w-32 overflow-hidden rounded-full border border-white/20 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] md:mt-10 md:h-40 md:w-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dummy/founder.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>

      {/* Brand description */}
      <p
        className="mt-8 max-w-md px-6 text-center font-display text-lg leading-[1.5] !text-white md:mt-10 md:text-2xl"
        style={{color: '#ffffff'}}
      >
        A private gateway for global investors entering the UAE market.
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
  );
}
