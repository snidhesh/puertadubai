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
  const t = await getTranslations({locale, namespace: 'Privacy'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

/**
 * Privacy policy — required to live before any lead form ships. The
 * authored body must document the Airtable storage region (decided at
 * implementation time per workspace plan, not hard-coded to "EU"),
 * retention (24 months from last contact), data-subject rights, cookie
 * inventory, and the v1 accepted vendor risk on Airtable plaintext PII.
 */
export default async function PrivacyPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Privacy'});

  return (
    <Section>
      <Container>
        <h1 className="font-display text-4xl">{t('heading')}</h1>
        <p className="mt-6 max-w-2xl text-[var(--text-body)]">
          {t('body')}
        </p>
        <p className="mt-6 max-w-2xl text-sm text-[var(--text-muted)]">
          {t('required')}
        </p>
      </Container>
    </Section>
  );
}
