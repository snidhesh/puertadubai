import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'About'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default async function AboutPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'About'});

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          {t('heading')}
        </h1>
        <div className="mt-8 max-w-2xl space-y-6 text-base md:text-lg">
          <p>{t('body1')}</p>
          <p>{t('body2')}</p>
        </div>
      </Container>
    </Section>
  );
}
