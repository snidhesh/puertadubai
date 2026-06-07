import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Off-plan, secondary market, company formation, tax, banking, legal, Golden Visa, and curated investments.'
};

const SERVICES: Array<{slug: string; title: string; summary: string}> = [
  {
    slug: 'off-plan',
    title: 'How to buy off-plan',
    summary:
      'Pre-launch real estate with priority pricing, developer due diligence and ongoing escrow oversight.'
  },
  {
    slug: 'secondary-market',
    title: 'How to buy secondary market',
    summary:
      'Mature assets with proven rental yields — valuation through Land Department transfer.'
  },
  {
    slug: 'company-formation',
    title: 'Open your company in the Emirates',
    summary:
      'Mainland licenses and free zones, shareholder agreements, visa processing, banking coordination.'
  },
  {
    slug: 'tax',
    title: 'Tax in the Emirates',
    summary:
      'Corporate registration, VAT planning, treaty analysis and expatriate fiscal strategy.'
  },
  {
    slug: 'banking',
    title: 'Bank accounts',
    summary:
      'Personal and corporate accounts, multi-currency facilities, compliance pre-verification.'
  },
  {
    slug: 'legal-accounting',
    title: 'Accounting & legal',
    summary:
      'Bookkeeping, auditing, contract review, shareholder agreements, dispute resolution.'
  },
  {
    slug: 'golden-visa',
    title: 'Golden Visa',
    summary:
      'Eligibility verification through issuance — copy gated on legal review (AED 2M canonical threshold).'
  },
  {
    slug: 'investments',
    title: 'Investments — Gulf & international',
    summary:
      'Curated access across real estate, hospitality and private equity with cross-border due diligence.'
  }
];

type Props = {params: Promise<{locale: Locale}>};

export default async function ServicesPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          Services
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          Eight services. One concierge desk.
        </h1>
        <ul className="mt-12 grid gap-px bg-[var(--divider)] sm:grid-cols-2">
          {SERVICES.map((service) => (
            <li key={service.slug} className="bg-[var(--bg)]">
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col gap-3 p-8 transition-colors hover:bg-[var(--bg-alt)]"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  0{SERVICES.indexOf(service) + 1}
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-[var(--text-title)] group-hover:text-[var(--accent)]">
                  {service.title}
                </h2>
                <p className="text-sm md:text-base text-[var(--text-body)]">
                  {service.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
