import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Founder · Dayan Candamil',
  description: 'Cultural entrepreneur and founder of Puerta Dubai.'
};

type Props = {params: Promise<{locale: Locale}>};

export default async function FounderPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Section>
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Founder
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl">
            Dayan Candamil
          </h1>
          <p className="mt-2 font-display italic text-2xl text-[var(--text-muted)]">
            Cultural entrepreneur
          </p>
          <div className="mt-8 max-w-2xl space-y-6 text-base md:text-lg">
            <p>
              Bio copy is authored in Sanity Studio (<code>FounderPage</code>
              singleton) per locale, with a Latin-only handwritten
              signature image rendered through The Nautigal stack on
              non-Arabic pages.
            </p>
          </div>
        </Container>
      </Section>

      {/* Credentials & Recognition — content-review gated per the plan.
       * The old site claimed CNN / Vogue / Harper’s without proof. This
       * section stays empty until every claim has a verifiable link or
       * screenshot on file. No placeholder media logos. */}
      <Section tone="alt">
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Credentials &amp; Recognition
          </p>
          <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
            Content-review gated. Awaiting verifiable sources before publish.
          </p>
        </Container>
      </Section>

      {/* Impact / Responsible advisory — same gate. Investor-education
       * framing only, no unverified philanthropy claims. */}
      <Section>
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Responsible advisory
          </p>
          <p className="mt-4 max-w-2xl text-[var(--text-muted)]">
            Content-review gated. Cross-border-trust and investor-education
            framing only — no donation or social-impact claims until verified.
          </p>
        </Container>
      </Section>
    </>
  );
}
