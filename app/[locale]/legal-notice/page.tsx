import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Legal notice',
  description: 'Legal notice for Puerta Dubai.'
};

type Props = {params: Promise<{locale: Locale}>};

export default async function LegalNoticePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container>
        <h1 className="font-display text-4xl">Legal notice</h1>
        <p className="mt-6 max-w-2xl text-[var(--text-body)]">
          The legal notice body is authored in Sanity (<code>LegalPage</code>{' '}
          singleton referenced by <code>SiteSettings.legalNoticePage</code>)
          per locale. Editorial / counsel review required before publish.
        </p>
      </Container>
    </Section>
  );
}
