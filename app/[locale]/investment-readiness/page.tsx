import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {Button} from '@/components/ui/button';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'InvestmentReadiness'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

/**
 * Long-form qualification route — ~3 minutes, 12 fields, qualified lead.
 * Distinct from the Private Circle modal (top-of-funnel, ~30s, 4 fields).
 * The Private Circle modal success state CTAs into THIS page; this page
 * is never the first touch on hero.
 *
 * The actual form + categoriseLead() scoring lands in phase 6 with the
 * server action and adapters wired.
 */
export default async function InvestmentReadinessPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'InvestmentReadiness'});

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          {t('heading')}
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--text-body)]">
          {t('body')}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
          {t('note')}
        </p>
        <div className="mt-10">
          <Button variant="solid" disabled>
            {t('button')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
