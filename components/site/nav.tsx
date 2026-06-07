'use client';

import {useSyncExternalStore} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {Link} from '@/lib/i18n/navigation';
import {Container} from '@/components/ui/container';
import {LanguageSwitcher} from './language-switcher';
import {cn} from '@/lib/utils';
import logoBlack from '../../public/brand/logo-black.png';

// Social icons moved to the hero's vertical column on the home page; the
// nav stays focused on navigation + locale switch only.

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

  // Only the homepage starts with a transparent-over-hero nav.
  // Other routes always show the white nav.
  const isHome = pathname === '/' || /^\/(en|fr|es|pt|ar)\/?$/.test(pathname);
  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
        transparent
          ? 'bg-transparent'
          : 'border-b border-[var(--divider)] bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/85'
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-8">
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
        <div className="ms-auto flex items-center gap-4 lg:ms-0">
          <LanguageSwitcher transparent={transparent} />
        </div>
      </Container>
    </header>
  );
}
