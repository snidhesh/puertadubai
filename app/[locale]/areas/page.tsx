import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {getAllAreas} from '@/lib/sanity/queries';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Area guides',
  description:
    'Investment areas across the UAE — Downtown Dubai, Marina, Palm Jumeirah, Saadiyat, Al Marjan and more.'
};

type Props = {params: Promise<{locale: Locale}>};

export default async function AreasIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const areas = await getAllAreas(locale).catch(() => []);

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          Area guides
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          Where you invest matters more than what.
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--text-body)]">
          Investor briefings per area — transit, ownership rules, yield bands,
          Golden Visa relevance and related projects. Authored in Sanity per
          locale.
        </p>

        {areas.length === 0 ? (
          <p className="mt-12 max-w-md rounded-sm border border-dashed border-[var(--divider)] p-6 text-sm text-[var(--text-muted)]">
            No area guides have been published yet. Add them in Sanity Studio
            (<code>AreaGuide</code> document type) to populate this index.
          </p>
        ) : (
          <ul className="mt-12 grid gap-px bg-[var(--divider)] sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area._id} className="bg-[var(--bg)]">
                <Link
                  href={`/areas/${area.slug}`}
                  className="group flex h-full flex-col gap-3 p-8 transition-colors hover:bg-[var(--bg-alt)]"
                >
                  <p
                    className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {area.emirate}
                  </p>
                  <h2 className="font-display text-2xl text-[var(--text-title)] group-hover:text-[var(--accent)]">
                    {area.name}
                  </h2>
                  {area.summary && (
                    <p className="text-sm text-[var(--text-body)]">
                      {area.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
