import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {fetchListingsByAgent, type StudioListingCard} from '@/lib/studio/properties';
import {cn} from '@/lib/utils';
import {routing, type Locale} from '@/lib/i18n/routing';

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Projects',
  description:
    "Dayan Candamil's active UAE real-estate listings, sourced live from the BlackOak Studio CRM."
};

type Props = {params: Promise<{locale: Locale}>};

export default async function ProjectsIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const listings = await fetchListingsByAgent('Dayan Candamil', locale);

  return (
    <Section className="py-20 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <h1 className="font-display">
            <span
              className="block text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]"
              data-ui-label
            >
              Projects
            </span>
            <span className="mt-3 block text-4xl leading-[1] text-[var(--text-title)] md:text-5xl lg:text-6xl">
              Active listings
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-[1.7] text-[var(--text-body)] md:text-base">
            UAE real-estate listings personally represented by Dayan, sourced
            live from the BlackOak Studio CRM. Inventory updates automatically;
            click any listing to inquire directly.
          </p>
          <p
            className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
            data-ui-label
          >
            <bdi>{listings.length}</bdi>
            {listings.length === 1 ? ' active listing' : ' active listings'}
          </p>
        </div>

        {listings.length === 0 ? (
          <p className="mt-16 max-w-xl text-sm text-[var(--text-body)]">
            No active listings at the moment. New inventory is added regularly —
            check back soon, or send an inquiry via the contact page.
          </p>
        ) : (
          <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Link href={`/projects/${listing.id}`} className="block">
                  <ProjectListingCard listing={listing} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}

function ProjectListingCard({listing}: {listing: StudioListingCard}) {
  return (
    <article className="group flex flex-col gap-5">
      <div className={cn('relative aspect-[7/5] w-full overflow-hidden bg-[var(--bg-alt)]')}>
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--bg-alt)]" aria-hidden="true" />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-snug text-[var(--text-title)] md:text-xl">
            {listing.title}
          </p>
          <p
            className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
            data-ui-label
          >
            {listing.area}
            <span className="mx-1">·</span>
            {listing.emirate}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--text-body)]">
            {listing.bedrooms > 0 && (
              <span>
                <bdi>{listing.bedrooms}</bdi> Beds
              </span>
            )}
            {listing.bathrooms > 0 && (
              <span>
                <bdi>{listing.bathrooms}</bdi> Baths
              </span>
            )}
            {listing.sqft > 0 && (
              <span>
                <bdi>{listing.sqft.toLocaleString()}</bdi> Sq.Ft.
              </span>
            )}
          </p>
          {listing.reference && (
            <p
              className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
              data-ui-label
            >
              Ref {listing.reference}
            </p>
          )}
        </div>
        <div className="shrink-0 text-end">
          <p className="font-display text-lg leading-snug text-[var(--text-title)] md:text-xl">
            <bdi>{listing.priceFrom}</bdi>
          </p>
        </div>
      </div>
    </article>
  );
}
