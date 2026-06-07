import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {client} from '@/lib/sanity/client';
import {localized, localizedSeo} from '@/lib/sanity/i18n';
import {routing, type Locale} from '@/lib/i18n/routing';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs: Array<{slug: string}> = await client.fetch(
    `*[_type == "areaGuide" && defined(slug.current)]{"slug": slug.current}`
  ).catch(() => []);
  return routing.locales.flatMap((locale) =>
    slugs.map(({slug}) => ({locale, slug}))
  );
}

type AreaDetail = {
  name: string;
  emirate: string;
  summary: string | null;
  investorProfile: string | null;
  lifestyle: string | null;
  priceBand: string | null;
  yieldRange: string | null;
  goldenVisaRelevance: string | null;
  transit: string | null;
  ownership: string | null;
  seo: {metaTitle: string | null; metaDescription: string | null} | null;
};

async function getArea(slug: string, locale: Locale): Promise<AreaDetail | null> {
  return client
    .fetch<AreaDetail | null>(
      `*[_type == "areaGuide" && slug.current == $slug][0]{
        ${localized('name')},
        emirate,
        ${localized('summary')},
        ${localized('investorProfile')},
        ${localized('lifestyle')},
        ${localized('priceBand')},
        ${localized('yieldRange')},
        ${localized('goldenVisaRelevance')},
        ${localized('transit')},
        ${localized('ownership')},
        ${localizedSeo()}
      }`,
      {slug, locale}
    )
    .catch(() => null);
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props) {
  const {locale, slug} = await params;
  const area = await getArea(slug, locale);
  if (!area) return {};
  return {
    title: area.seo?.metaTitle ?? area.name,
    description: area.seo?.metaDescription ?? area.summary ?? undefined
  };
}

export default async function AreaDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const area = await getArea(slug, locale);
  if (!area) notFound();

  return (
    <Section>
      <Container>
        <Link
          href="/areas"
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
          data-ui-label
        >
          ← Area guides
        </Link>
        <p
          className="mt-4 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
          data-ui-label
        >
          {area.emirate}
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">{area.name}</h1>
        {area.summary && (
          <p className="mt-6 max-w-2xl text-lg text-[var(--text-body)]">
            {area.summary}
          </p>
        )}

        <dl className="mt-12 grid gap-px bg-[var(--divider)] sm:grid-cols-2">
          {area.priceBand && (
            <Stat label="Price band" value={area.priceBand} />
          )}
          {area.yieldRange && (
            <Stat label="Yield range" value={area.yieldRange} />
          )}
          {area.transit && <Stat label="Transit" value={area.transit} />}
          {area.ownership && <Stat label="Ownership" value={area.ownership} />}
        </dl>

        {area.investorProfile && (
          <Block heading="Investor profile" body={area.investorProfile} />
        )}
        {area.lifestyle && <Block heading="Lifestyle" body={area.lifestyle} />}
        {area.goldenVisaRelevance && (
          <Block
            heading="Golden Visa relevance"
            body={area.goldenVisaRelevance}
          />
        )}
      </Container>
    </Section>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  return (
    <div className="bg-[var(--bg)] p-6">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
        {label}
      </dt>
      <dd className="mt-2 font-display text-lg text-[var(--text-title)]">
        <bdi>{value}</bdi>
      </dd>
    </div>
  );
}

function Block({heading, body}: {heading: string; body: string}) {
  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="font-display text-2xl md:text-3xl text-[var(--text-title)]">
        {heading}
      </h2>
      <p className="mt-4 text-base text-[var(--text-body)]">{body}</p>
    </div>
  );
}
