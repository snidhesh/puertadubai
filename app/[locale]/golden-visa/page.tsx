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
  const t = await getTranslations({locale, namespace: 'GoldenVisa'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

/**
 * Golden Visa page — COPY GATED ON LEGAL REVIEW.
 *
 * Per the plan's legal & compliance constraints: every monetary threshold,
 * validity term, or processing claim must reference AED 2,000,000 (UAE
 * federal portal + GDRFA Dubai) and be signed off by counsel before going
 * to production. The old site's "USD 550,000 / 10% deposit" language is
 * NOT used.
 */
export default async function GoldenVisaPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'GoldenVisa'});

  return (
    <>
      <Section tone="dark">
        <Container>
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-white/70"
            data-ui-label
          >
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl text-[var(--text-on-dark)]">
            {t('heading')}
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-white/85">
            {t('body')}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            {t('legalNote')}
          </p>
          <div className="mt-10">
            <Button variant="solid" className="bg-white text-[var(--accent)] border-white hover:bg-[var(--bg-alt)]">
              {t('cta')}
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">
                {t('eligibilityHeading')}
              </h2>
              <p className="mt-4 text-base text-[var(--text-body)]">
                {t('eligibilityBody')}
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl">
                {t('renewalHeading')}
              </h2>
              <p className="mt-4 text-base text-[var(--text-body)]">
                {t('renewalBody')}
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
