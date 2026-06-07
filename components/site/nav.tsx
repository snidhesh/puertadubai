'use client';

import {useEffect, useState, useSyncExternalStore} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Link} from '@/lib/i18n/navigation';
import {Container} from '@/components/ui/container';
import {LanguageSwitcher} from './language-switcher';
import {SOCIAL_ICONS} from '@/lib/site/social';
import {cn} from '@/lib/utils';
import logoBlack from '../../public/brand/logo-black.png';

const SCROLL_THRESHOLD = 80;

function subscribeScroll(cb: () => void) {
  window.addEventListener('scroll', cb, {passive: true});
  return () => window.removeEventListener('scroll', cb);
}

function getSnapshotScrolled() {
  return window.scrollY > SCROLL_THRESHOLD;
}

function getServerSnapshotScrolled() {
  // On the server we render the "scrolled = false" state. The hero
  // bootstraps under a transparent nav; if the user has scrolled
  // before hydration completes the post-mount value corrects it.
  return false;
}

const NAV_ITEMS = [
  {key: 'home', href: '/'},
  {key: 'about', href: '/about'},
  {key: 'projects', href: '/projects'},
  {key: 'areas', href: '/areas'},
  {key: 'services', href: '/services'},
  {key: 'founder', href: '/founder'},
  {key: 'goldenVisa', href: '/golden-visa'},
  {key: 'contact', href: '/contact'}
] as const;

export function SiteNav() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getSnapshotScrolled,
    getServerSnapshotScrolled
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Only the homepage starts with a transparent-over-hero nav.
  // Other routes always show the white nav.
  const isHome = pathname === '/' || /^\/(en|fr|es|pt|ar)\/?$/.test(pathname);
  const transparent = isHome && !scrolled && !mobileOpen;

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  // Close the drawer whenever the route changes (e.g. after a link tap).
  // Microtask-deferred so it doesn't fire synchronously during the effect
  // body (React 19 cascading-render lint rule).
  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
          transparent
            ? 'bg-transparent'
            : 'border-b border-[var(--divider)] bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/85'
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4 md:gap-8">
          <Link
            href="/"
            aria-label="Puerta Dubai — home"
            className="flex items-center"
          >
            <Image
              src={logoBlack}
              alt="Puerta Dubai"
              height={40}
              width={Math.round((40 * 2842) / 3781)}
              priority
              className={cn(
                'h-10 w-auto transition-[filter] duration-300',
                transparent && 'invert brightness-0 [filter:invert(1)]'
              )}
            />
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.12em] lg:flex"
            data-ui-label
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'transition-colors duration-200',
                  transparent
                    ? 'text-white/85 hover:text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--accent)]'
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-3 lg:ms-0 lg:gap-4">
            <LanguageSwitcher transparent={transparent} />
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center transition-colors lg:hidden',
                transparent
                  ? 'text-white hover:text-white/85'
                  : 'text-[var(--text-title)] hover:text-[var(--accent)]'
              )}
            >
              {mobileOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile drawer — fullscreen overlay, lg:hidden */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          'fixed inset-0 z-30 flex flex-col bg-[var(--bg-dark)] text-white transition-opacity duration-300 lg:hidden',
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      >
        {/* Spacer so content sits below the fixed header (h-16) */}
        <div className="h-16 shrink-0" aria-hidden="true" />

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-10 md:px-10">
          <nav aria-label="Mobile primary">
            <ul className="space-y-5">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block font-display text-3xl !text-white hover:!text-white/70 md:text-4xl"
                    style={{color: '#ffffff'}}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 border-t border-white/15 pt-8">
            <p
              className="text-[10px] uppercase tracking-[0.32em] !text-white/55"
              style={{color: 'rgba(255,255,255,0.55)'}}
              data-ui-label
            >
              Follow
            </p>
            <ul className="mt-4 flex items-center gap-3">
              {SOCIAL_ICONS.map((icon) => (
                <li key={icon.href}>
                  <a
                    href={icon.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={icon.label}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 !text-white transition-colors hover:bg-white/20"
                    style={{color: '#ffffff'}}
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

            <div className="mt-8 grid gap-3 text-sm">
              <a
                href="mailto:hello@puertadubai.com"
                className="!text-white hover:underline"
                style={{color: '#ffffff'}}
              >
                hello@puertadubai.com
              </a>
              <a
                href="https://wa.me/971544402792"
                className="!text-white hover:underline"
                style={{color: '#ffffff'}}
              >
                <bdi>+971 54 440 2792</bdi>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
