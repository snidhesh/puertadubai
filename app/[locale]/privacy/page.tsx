import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Puerta Dubai handles personal data.'
};

type Props = {params: Promise<{locale: Locale}>};

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

  return (
    <Section>
      <Container>
        <h1 className="font-display text-4xl">Privacy policy</h1>
        <p className="mt-6 max-w-2xl text-[var(--text-body)]">
          The privacy body is authored in Sanity (<code>LegalPage</code>{' '}
          singleton referenced by <code>SiteSettings.privacyPage</code>) per
          locale.
        </p>
        <p className="mt-6 max-w-2xl text-sm text-[var(--text-muted)]">
          Required content before any lead form ships: data collected, lawful
          basis (legitimate interest + explicit consent), storage region
          (Airtable; confirm at implementation time per workspace plan),
          retention (24 months from last contact), data-subject rights
          (access, deletion, portability, objection), request contact, cookie
          inventory, and the v1 accepted vendor risk on Airtable plaintext PII.
        </p>
      </Container>
    </Section>
  );
}
