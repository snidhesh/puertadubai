'use client';

import {useEffect, useState, useSyncExternalStore} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Link} from '@/lib/i18n/navigation';
import {Container} from '@/components/ui/container';
import {SOCIAL_ICONS} from '@/lib/site/social';
import {LINKS} from '@/lib/home/content';
import {VISIBLE_NAV_ITEMS, anchorId} from '@/lib/site/nav-items';
import {cn} from '@/lib/utils';
import logoMark from '../../public/brand/logo-mark.png';

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


export function SiteNav() {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getSnapshotScrolled,
    getServerSnapshotScrolled
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  // Anchor id of the home section currently under the reading line, or null.
  const [active, setActive] = useState<string | null>(null);

  // Only the homepage starts with a transparent-over-hero nav.
  // Other routes always show the white nav.
  const isHome = pathname === '/' || /^\/(en|fr|es|pt|ar)\/?$/.test(pathname);
  const transparent = isHome && !scrolled && !mobileOpen;

  // Scroll-spy: the nav item whose section contains the reading line (about
  // a third of the way down the viewport) is marked `aria-current`. Only
  // sections that are nav targets count, so the marker clears while the
  // visitor is in a band without its own nav entry instead of sticking to
  // the last one passed. rAF-throttled; all setState calls happen inside
  // the frame callback, never synchronously in the effect body.
  useEffect(() => {
    if (!isHome) {
      queueMicrotask(() => setActive(null));
      return;
    }
    const ids = VISIBLE_NAV_ITEMS.map((item) => anchorId(item.href));
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = Math.max(SCROLL_THRESHOLD, window.innerHeight * 0.35);
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          current = id;
          break;
        }
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isHome, pathname]);

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
          {/* Stacked lockup: DC monogram centred above DAYAN CANDAMIL (Arsenal,
           * 0.28em) and DUBAI · MIAMI · BOGOTÁ (Roboto Flex, 0.32em). */}
          <Link
            href="/"
            aria-label={t('logoAria')}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-colors duration-300',
              transparent ? 'text-white' : 'text-[var(--text-title)]'
            )}
          >
            <Image
              src={logoMark}
              alt=""
              height={20}
              width={Math.round((20 * 616) / 100)}
              priority
              className={cn(
                'h-4 w-auto transition-[filter] duration-300 sm:h-5',
                transparent && '[filter:invert(1)]'
              )}
            />
            <span className="flex flex-col items-center leading-none">
              <span
                className="whitespace-nowrap font-display text-[12px] uppercase tracking-[0.2em] sm:text-[15px] sm:tracking-[0.28em]"
                data-ui-label
              >
                {t('wordmark')}
              </span>
              <span
                className={cn(
                  'mt-1 whitespace-nowrap text-[8px] uppercase tracking-[0.18em] sm:text-[9px] sm:tracking-[0.24em]',
                  transparent ? 'text-white/70' : 'text-[var(--text-muted)]'
                )}
                data-ui-label
              >
                {t('wordmarkLine')}
              </span>
            </span>
          </Link>
          <nav
            aria-label={t('siteNavAria')}
            className="hidden items-center gap-4 text-[11px] uppercase tracking-[0.1em] lg:flex xl:gap-6 xl:tracking-[0.14em]"
            data-ui-label
          >
            {VISIBLE_NAV_ITEMS.map((item) => {
              const current = active === anchorId(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={current ? 'location' : undefined}
                  className={cn(
                    // Hairline under the current section's item; fades in/out.
                    'relative py-1 transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current after:opacity-0 after:transition-opacity after:duration-300 after:content-[\'\']',
                    current && 'after:opacity-100',
                    transparent
                      ? 'text-white/85 hover:text-white'
                      : current
                        ? 'text-[var(--text-title)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--accent)]'
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
          <div className="ms-auto flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center transition-colors',
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
        aria-label={t('siteNavAria')}
        className={cn(
          'fixed inset-0 z-30 flex flex-col bg-[var(--bg-dark)] text-white transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {/* Spacer so content sits below the fixed header (h-16) */}
        <div className="h-16 shrink-0" aria-hidden="true" />

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-10 md:px-10">
          <nav aria-label={t('siteNavAria')}>
            <ul className="space-y-5">
              {VISIBLE_NAV_ITEMS.map((item) => {
                const current = active === anchorId(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={current ? 'location' : undefined}
                      className="flex items-center font-display text-3xl !text-white hover:!text-white/70 md:text-4xl"
                      style={{color: '#ffffff'}}
                    >
                      {/* Short rule indents only the section the visitor is in;
                       * the others stay flush with the drawer's text edge. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-px bg-white transition-[width,margin] duration-300',
                          current ? 'me-4 w-6' : 'me-0 w-0'
                        )}
                      />
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-12 border-t border-white/15 pt-8">
            <p
              className="text-[10px] uppercase tracking-[0.32em] !text-white/55"
              style={{color: 'rgba(255,255,255,0.55)'}}
              data-ui-label
            >
              {t('follow')}
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
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
                      <path d={icon.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-3 text-sm">
              <a href={`mailto:${LINKS.email}`} className="py-1 !text-white hover:underline" style={{color: '#ffffff'}}>
                {LINKS.email}
              </a>
              <a href={LINKS.whatsapp} className="py-1 !text-white hover:underline" style={{color: '#ffffff'}}>
                <bdi>{LINKS.whatsappDisplay}</bdi>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
