import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {Button} from '@/components/ui/button';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Golden Visa',
  description:
    'UAE Golden Visa overview — eligibility, real-estate thresholds, residency benefits. Copy is gated on legal review.'
};

type Props = {params: Promise<{locale: Locale}>};

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

  return (
    <>
      <Section tone="dark">
        <Container>
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-white/70"
            data-ui-label
          >
            Golden Visa
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl text-[var(--text-on-dark)]">
            Long-term UAE residency, structured properly.
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-white/85">
            The UAE Golden Visa grants 5- or 10-year renewable residency to
            qualifying investors, entrepreneurs, and specialists. Real-estate
            investors qualify at AED 2,000,000 in property ownership per UAE
            federal portal and GDRFA Dubai guidance.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            Public copy on this page is gated on counsel review before
            production. Numbers shown here are the canonical UAE references —
            any concierge offer must be reviewed independently.
          </p>
          <div className="mt-10">
            <Button variant="solid" className="bg-white text-[var(--accent)] border-white hover:bg-[var(--bg-alt)]">
              Request private guidance
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">
                Eligibility routes
              </h2>
              <p className="mt-4 text-base text-[var(--text-body)]">
                Real-estate investor (≥ AED 2M), entrepreneur, specialised
                talent, executive, scientist, outstanding student. Each route
                has documentation and processing differences. We confirm fit
                before any commercial conversation.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl">
                Renewal, travel, tax
              </h2>
              <p className="mt-4 text-base text-[var(--text-body)]">
                Five- and ten-year terms, sponsor independence, household
                inclusion, tax-residency planning, and cross-border
                considerations are covered in the private brief — content is
                authored in Sanity per locale and gated on legal sign-off.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
