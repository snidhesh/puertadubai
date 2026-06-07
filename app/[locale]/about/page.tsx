import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'What is Puerta Dubai?',
  description: 'A private gateway for global investors entering the UAE market.'
};

type Props = {params: Promise<{locale: Locale}>};

export default async function AboutPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          About
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          One platform. Complete access to the UAE.
        </h1>
        <div className="mt-8 max-w-2xl space-y-6 text-base md:text-lg">
          <p>
            Puerta Dubai is a private investment-concierge gateway for HNW
            foreign investors entering the UAE — combining real-estate
            acquisition, business setup, tax and legal structuring, banking
            coordination, Golden Visa processing, and relocation under one
            roof.
          </p>
          <p>
            Editorial copy in this section is authored in Sanity Studio
            (<code>HomePage</code>/About content) per locale. Until the CMS is
            populated, this English fallback renders unchanged across all
            locales — wire content in Studio and the locale-specific copy
            takes over automatically.
          </p>
        </div>
      </Container>
    </Section>
  );
}
