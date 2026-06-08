import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {Button} from '@/components/ui/button';
import {routing, type Locale} from '@/lib/i18n/routing';

const SERVICE_SLUGS = [
  'off-plan',
  'secondary-market',
  'company-formation',
  'tax',
  'banking',
  'legal-accounting',
  'golden-visa',
  'investments'
] as const;

type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((slug) => ({locale, slug}))
  );
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!SERVICE_SLUGS.includes(slug as ServiceSlug)) return {};
  const t = await getTranslations({locale, namespace: 'Services'});
  return {
    title: t(`items.${slug}.title`),
    description: t(`items.${slug}.summary`)
  };
}

export default async function ServiceDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  if (!SERVICE_SLUGS.includes(slug as ServiceSlug)) notFound();
  const t = await getTranslations({locale, namespace: 'Services'});

  return (
    <Section>
      <Container>
        <Link
          href="/services"
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
          data-ui-label
        >
          {t('backToIndex')}
        </Link>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">{t(`items.${slug}.title`)}</h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--text-body)]">
          {t(`items.${slug}.summary`)}
        </p>
        {slug === 'golden-visa' && (
          <p className="mt-6 max-w-2xl text-sm text-[var(--text-muted)]">
            {t('goldenVisaLegalNote')}
          </p>
        )}
        <div className="mt-12 max-w-2xl text-base text-[var(--text-body)]">
          <p>{t('detailPlaceholder')}</p>
        </div>
        <div className="mt-12 flex gap-3">
          <Button variant="solid">{t('bookCall')}</Button>
          <Link
            href="/investment-readiness"
            className="inline-flex h-[45px] items-center justify-center border border-[var(--accent)] bg-transparent px-8 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]"
            data-ui-label
          >
            {t('investmentReadiness')}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
