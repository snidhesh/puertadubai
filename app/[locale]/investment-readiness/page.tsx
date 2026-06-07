import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {Button} from '@/components/ui/button';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Investment readiness',
  description:
    'A 3-minute qualification — tell us your budget, target emirate, residency goal and timeline.'
};

type Props = {params: Promise<{locale: Locale}>};

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

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          Investment readiness
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          Three minutes. One curated plan.
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--text-body)]">
          Tell us your budget band, target emirate, timeline and residency
          goal. We categorise your enquiry deterministically (residency-led,
          yield-led, business-setup-led, or exploratory) and route to the
          right desk within 48 hours.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
          The form, Turnstile bot-protection, consent gate, and Resend +
          Airtable wiring land in phase 6.
        </p>
        <div className="mt-10">
          <Button variant="solid" disabled>
            Form coming online
          </Button>
        </div>
      </Container>
    </Section>
  );
}
