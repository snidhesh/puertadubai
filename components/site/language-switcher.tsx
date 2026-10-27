'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/lib/i18n/navigation';
import {SWITCHER_LOCALES, type Locale} from '@/lib/i18n/routing';
import {cn} from '@/lib/utils';

const LABELS: Record<Locale, {short: string; long: string}> = {
  en: {short: 'EN', long: 'English'},
  fr: {short: 'FR', long: 'Français'},
  es: {short: 'ES', long: 'Español'},
  pt: {short: 'PT', long: 'Português'},
  ar: {short: 'AR', long: 'العربية'}
};

type Props = {
  className?: string;
  /** Light variant for the transparent nav over the hero. */
  transparent?: boolean;
};

/**
 * Inline EN · PT toggle. Each option is a plain link to the same path in the
 * other locale; next-intl's Link writes the locale cookie on click so the
 * choice sticks on the next visit to `/`.
 */
export function LanguageSwitcher({className, transparent = false}: Props) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const active = useLocale() as Locale;

  return (
    <nav
      aria-label={t('languageAria')}
      className={cn('flex items-center text-[11px] uppercase tracking-[0.14em]', className)}
      data-ui-label
    >
      {SWITCHER_LOCALES.map((locale, i) => {
        const current = locale === active;
        return (
          <span key={locale} className="flex items-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn('px-1.5', transparent ? 'text-white/50' : 'text-[var(--text-muted)]')}
              >
                ·
              </span>
            )}
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              aria-label={LABELS[locale].long}
              aria-current={current ? 'true' : undefined}
              className={cn(
                'relative py-1 transition-colors duration-200 before:absolute before:-inset-x-1.5 before:-inset-y-3 before:content-[\'\'] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-current after:opacity-0 after:transition-opacity after:content-[\'\']',
                current && 'after:opacity-100',
                transparent
                  ? current
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                  : current
                    ? 'text-[var(--text-title)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--accent)]'
              )}
            >
              {LABELS[locale].short}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
