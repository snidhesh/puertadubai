import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container} from '@/components/ui/container';
import {LINKS} from '@/lib/home/content';
import logoLockup from '../../public/brand/logo-lockup.png';

const EXPLORE = [
  {key: 'about', href: '/#about'},
  {key: 'expertise', href: '/#expertise'},
  {key: 'experience', href: '/#experience'},
  {key: 'listings', href: '/#listings'},
  {key: 'media', href: '/#media'}
] as const;

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');
  const year = new Date().getFullYear();

  const elsewhere = [
    {label: t('linkedin'), href: LINKS.linkedin},
    {label: t('instagram'), href: LINKS.instagram},
    {label: t('youtube'), href: LINKS.youtube},
    {label: t('houseOfCandamil'), href: LINKS.houseOfCandamil},
    {label: t('blackoak'), href: LINKS.blackoak}
  ];

  return (
    <footer className="mt-auto border-t border-[var(--divider)] bg-[var(--bg)] py-12">
      <Container className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Image
            src={logoLockup}
            alt={tNav('wordmark')}
            height={56}
            width={Math.round((56 * 616) / 168)}
            className="h-14 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm leading-[1.7] text-[var(--text-muted)]">{t('brandLine')}</p>
        </div>
        <nav aria-label={t('ariaLabel')} className="text-sm">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            {t('exploreHeading')}
          </p>
          <ul className="mt-3 space-y-2">
            {EXPLORE.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="hover:text-[var(--accent)]">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            {t('elsewhereHeading')}
          </p>
          <ul className="mt-3 space-y-2">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            {t('legalHeading')}
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/legal-notice" className="hover:text-[var(--accent)]">
                {t('legalNotice')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[var(--accent)]">
                {t('privacy')}
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <Container className="mt-10 flex flex-col items-start gap-2 border-t border-[var(--divider)] pt-6 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
        <p>
          © {tNav('wordmark')} {year}. {t('rights')}
        </p>
      </Container>
    </footer>
  );
}
