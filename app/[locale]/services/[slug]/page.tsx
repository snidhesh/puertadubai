import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {Button} from '@/components/ui/button';
import {routing, type Locale} from '@/lib/i18n/routing';

const SERVICE_SLUGS = [
  'off-plan',
  'secondary-market',
  'company-formation',
  'tax',
  'banking',
  'legal-accounting',
  'golden-visa',
  'investments'
] as const;

type ServiceSlug = (typeof SERVICE_SLUGS)[number];

const SERVICE_COPY: Record<ServiceSlug, {title: string; summary: string}> = {
  'off-plan': {
    title: 'How to buy off-plan',
    summary:
      'Pre-launch real estate with priority pricing, developer due diligence and ongoing escrow oversight.'
  },
  'secondary-market': {
    title: 'How to buy secondary market',
    summary:
      'Mature assets with proven rental yields — valuation through Land Department transfer.'
  },
  'company-formation': {
    title: 'Open your company in the Emirates',
    summary:
      'Mainland licenses and free zones, shareholder agreements, visa processing, banking coordination.'
  },
  tax: {
    title: 'Tax in the Emirates',
    summary:
      'Corporate registration, VAT planning, treaty analysis and expatriate fiscal strategy.'
  },
  banking: {
    title: 'Bank accounts',
    summary:
      'Personal and corporate accounts, multi-currency facilities, compliance pre-verification.'
  },
  'legal-accounting': {
    title: 'Accounting & legal',
    summary:
      'Bookkeeping, auditing, contract review, shareholder agreements, dispute resolution.'
  },
  'golden-visa': {
    title: 'Golden Visa',
    summary:
      'Eligibility verification through issuance — copy gated on legal review (AED 2M canonical threshold).'
  },
  investments: {
    title: 'Investments — Gulf & international',
    summary:
      'Curated access across real estate, hospitality and private equity with cross-border due diligence.'
  }
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((slug) => ({locale, slug}))
  );
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;
  const copy = SERVICE_COPY[slug as ServiceSlug];
  return copy ? {title: copy.title, description: copy.summary} : {};
}

export default async function ServiceDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const copy = SERVICE_COPY[slug as ServiceSlug];
  if (!copy) notFound();

  return (
    <Section>
      <Container>
        <Link
          href="/services"
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
          data-ui-label
        >
          ← Services
        </Link>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">{copy.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--text-body)]">
          {copy.summary}
        </p>
        {slug === 'golden-visa' && (
          <p className="mt-6 max-w-2xl text-sm text-[var(--text-muted)]">
            Golden Visa thresholds and timelines are governed by UAE federal
            and GDRFA Dubai guidance. Public copy here is gated on legal
            review and tied to the canonical AED 2,000,000 real-estate
            threshold.
          </p>
        )}
        <div className="mt-12 max-w-2xl text-base text-[var(--text-body)]">
          <p>
            Service detail body is authored in Sanity Studio
            (<code>Service</code> documents) per locale.
          </p>
        </div>
        <div className="mt-12 flex gap-3">
          <Button variant="solid">Book a call</Button>
          <Link
            href="/investment-readiness"
            className="inline-flex h-[45px] items-center justify-center border border-[var(--accent)] bg-transparent px-8 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]"
            data-ui-label
          >
            Investment readiness
          </Link>
        </div>
      </Container>
    </Section>
  );
}
