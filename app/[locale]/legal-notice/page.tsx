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
  const t = await getTranslations({locale, namespace: 'LegalNotice'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default async function LegalNoticePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'LegalNotice'});

  return (
    <Section>
      <Container>
        <h1 className="font-display text-4xl">{t('heading')}</h1>
        <p className="mt-6 max-w-2xl text-[var(--text-body)]">
          {t('body')}
        </p>
      </Container>
    </Section>
  );
}
