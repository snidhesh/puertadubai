import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container} from '@/components/ui/container';
import logoBlack from '../../public/brand/logo-black.png';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--divider)] bg-[var(--bg)] py-12">
      <Container className="grid gap-10 md:grid-cols-3">
        <div>
          <Image
            src={logoBlack}
            alt="Puerta Dubai"
            height={48}
            width={Math.round((48 * 2842) / 3781)}
            className="h-12 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-[var(--text-muted)]">
            {t('brandLine')}
          </p>
        </div>
        <nav aria-label={t('ariaLabel')} className="text-sm">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            {t('exploreHeading')}
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/projects" className="hover:text-[var(--accent)]">
                {tNav('projects')}
              </Link>
            </li>
            <li>
              <Link href="/areas" className="hover:text-[var(--accent)]">
                {tNav('areas')}
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-[var(--accent)]">
                {tNav('services')}
              </Link>
            </li>
            <li>
              <Link href="/golden-visa" className="hover:text-[var(--accent)]">
                {tNav('goldenVisa')}
              </Link>
            </li>
          </ul>
        </nav>
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
          © Puerta Dubai {year}. {t('rights')}
        </p>
      </Container>
    </footer>
  );
}
