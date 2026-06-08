import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

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

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Services'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default async function ServicesPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Services'});

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          {t('heading')}
        </h1>
        <ul className="mt-12 grid gap-px bg-[var(--divider)] sm:grid-cols-2">
          {SERVICE_SLUGS.map((slug, index) => (
            <li key={slug} className="bg-[var(--bg)]">
              <Link
                href={`/services/${slug}`}
                className="group flex h-full flex-col gap-3 p-8 transition-colors hover:bg-[var(--bg-alt)]"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  0{index + 1}
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-[var(--text-title)] group-hover:text-[var(--accent)]">
                  {t(`items.${slug}.title`)}
                </h2>
                <p className="text-sm md:text-base text-[var(--text-body)]">
                  {t(`items.${slug}.summary`)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
