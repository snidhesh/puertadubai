'use client';

import {useEffect, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/lib/i18n/navigation';
import {routing, type Locale} from '@/lib/i18n/routing';
import {cn} from '@/lib/utils';

const LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  pt: 'PT',
  ar: 'AR'
};

const LONG_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  ar: 'العربية'
};

type Props = {
  className?: string;
  /** Render light variant when sitting over the transparent hero nav. */
  transparent?: boolean;
};

export function LanguageSwitcher({className, transparent = false}: Props) {
  const t = useTranslations('Nav');
  const router = useRouter();
  const pathname = usePathname();
  const active = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click + escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerColor = transparent
    ? 'text-white hover:text-white/85'
    : 'text-[var(--text-title)] hover:text-[var(--accent)]';

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', className)}
      data-ui-label
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('changeLanguage')}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] transition-colors',
          triggerColor
        )}
      >
        <span>{LABELS[active]}</span>
        <svg
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={cn('h-2.5 w-3 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        >
          <path d="M1 1.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t('languageList')}
          className="absolute end-0 top-[calc(100%+12px)] z-50 min-w-[11rem] border border-[var(--divider)] bg-[var(--bg)] py-2 shadow-lg"
        >
          {routing.locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === active}
                onClick={() => {
                  setOpen(false);
                  if (locale !== active) router.replace(pathname, {locale});
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-6 px-4 py-2 text-left text-[12px] transition-colors',
                  locale === active
                    ? 'bg-[var(--bg-alt)] text-[var(--accent)]'
                    : 'text-[var(--text-title)] hover:bg-[var(--bg-alt)]'
                )}
              >
                <span className="font-medium normal-case tracking-normal">
                  {LONG_LABELS[locale]}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  {LABELS[locale]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
