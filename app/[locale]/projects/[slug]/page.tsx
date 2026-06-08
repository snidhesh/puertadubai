import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {fetchListingById, type StudioListingDetail} from '@/lib/studio/properties';
import {routing, type Locale} from '@/lib/i18n/routing';

export const revalidate = 300;

// Studio UUIDs aren't statically enumerable cheaply (199 listings × 5 locales
// = 995 paths plus pagination). Generate on-demand and rely on ISR.
export const dynamicParams = true;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale, slug: '__placeholder'}));
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const [t, listing] = await Promise.all([
    getTranslations({locale, namespace: 'ProjectDetail'}),
    fetchListingById(slug, locale).catch(() => null)
  ]);
  if (!listing) return {title: t('metaFallback')};
  return {
    title: listing.title,
    description:
      listing.description?.slice(0, 160) ??
      `${listing.title} — ${listing.area}, ${listing.emirate}.`
  };
}

export default async function ListingDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  if (slug === '__placeholder') notFound();
  const [t, listing] = await Promise.all([
    getTranslations({locale, namespace: 'ProjectDetail'}),
    fetchListingById(slug, locale)
  ]);
  if (!listing) notFound();

  const [heroImage, ...galleryImages] = listing.images;
  const offeringLabel =
    listing.offering === 'rent'
      ? t('forRent')
      : listing.offering === 'sale'
        ? t('forSale')
        : t('listed');

  return (
    <>
      {/* Hero — large image with title + price overlay */}
      <section className="relative isolate flex min-h-[60vh] flex-col justify-end overflow-hidden bg-[var(--bg-dark)] px-6 py-12 text-white md:min-h-[68vh] md:px-12 md:py-16 lg:px-20">
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={listing.title}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/30"
        />
        <Container className="!px-0">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] !text-white/75 hover:!text-white"
            style={{color: 'rgba(255,255,255,0.75)'}}
            data-ui-label
          >
            <span aria-hidden="true">←</span> {t('backToProjects')}
          </Link>
          <p
            className="mt-6 text-[11px] uppercase tracking-[0.32em] !text-white/75"
            style={{color: 'rgba(255,255,255,0.75)'}}
            data-ui-label
          >
            {offeringLabel}
            {listing.reference && (
              <>
                <span className="mx-2">·</span>{t('refPrefix')} {listing.reference}
              </>
            )}
          </p>
          <h1
            className="mt-3 max-w-3xl font-display text-3xl leading-[1.1] !text-white md:text-5xl lg:text-6xl"
            style={{color: '#ffffff'}}
          >
            {listing.title}
          </h1>
          <p
            className="mt-4 max-w-2xl text-sm uppercase tracking-[0.22em] !text-white/80 md:text-base"
            style={{color: 'rgba(255,255,255,0.80)'}}
            data-ui-label
          >
            {listing.area}
            <span className="mx-2">·</span>
            {listing.emirate}
          </p>
          <p
            className="mt-6 font-display text-3xl !text-white md:text-5xl"
            style={{color: '#ffffff'}}
          >
            <bdi>{listing.priceFrom}</bdi>
          </p>
        </Container>
      </section>

      {/* Quick facts strip */}
      <QuickFacts listing={listing} labels={{
        beds: t('facts.beds'),
        baths: t('facts.baths'),
        sqft: t('facts.sqft'),
        type: t('facts.type'),
        furnishing: t('facts.furnishing'),
        parking: t('facts.parking')
      }} />

      {/* Description + amenities + side card */}
      <Section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
            <div>
              {listing.description && (
                <section>
                  <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">
                    {t('aboutHeading')}
                  </h2>
                  <div className="mt-6 space-y-4 text-base leading-[1.7] text-[var(--text-body)]">
                    {listing.description
                      .split(/\n+/)
                      .filter((p) => p.trim().length > 0)
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                  </div>
                </section>
              )}

              {listing.amenities.length > 0 && (
                <section className="mt-12">
                  <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">
                    {t('amenitiesHeading')}
                  </h2>
                  <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                    {listing.amenities.map((a) => (
                      <li
                        key={a}
                        className="flex items-center gap-2 text-sm text-[var(--text-body)]"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1 w-1 rounded-full bg-[var(--text-muted)]"
                        />
                        <span className="capitalize">{a.replace(/-/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Side card — sticky CTA */}
            <aside>
              <div className="sticky top-24 border border-[var(--divider)] bg-[var(--bg-alt)] p-8">
                <p
                  className="text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  {offeringLabel}
                </p>
                <p className="mt-2 font-display text-3xl text-[var(--text-title)]">
                  <bdi>{listing.priceFrom}</bdi>
                </p>
                <dl className="mt-6 space-y-3 border-t border-[var(--divider)] pt-6 text-sm">
                  {listing.agentName && (
                    <div className="flex justify-between gap-4">
                      <dt
                        className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                        data-ui-label
                      >
                        {t('agent')}
                      </dt>
                      <dd className="text-[var(--text-title)]">
                        {listing.agentName}
                      </dd>
                    </div>
                  )}
                  {listing.reference && (
                    <div className="flex justify-between gap-4">
                      <dt
                        className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                        data-ui-label
                      >
                        {t('reference')}
                      </dt>
                      <dd className="text-[var(--text-title)]">
                        {listing.reference}
                      </dd>
                    </div>
                  )}
                </dl>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex h-[50px] w-full items-center justify-center bg-[var(--text-title)] px-8 text-[11px] uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--accent)]"
                  data-ui-label
                >
                  {t('inquire')}
                </Link>
                <a
                  href="https://wa.me/971544402792"
                  className="mt-3 inline-flex h-[50px] w-full items-center justify-center border border-[var(--text-title)] px-8 text-[11px] uppercase tracking-[0.22em] text-[var(--text-title)] transition-colors hover:bg-[var(--text-title)] hover:text-white"
                  data-ui-label
                >
                  {t('whatsapp')}
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <Section tone="alt" className="py-16 md:py-24">
          <Container>
            <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">
              {t('gallery')}
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((src, i) => (
                <li key={src + i} className="relative aspect-[4/3] overflow-hidden bg-[var(--bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={t('imageAlt', {title: listing.title, number: i + 2})}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}

function QuickFacts({
  listing,
  labels
}: {
  listing: StudioListingDetail;
  labels: {
    beds: string;
    baths: string;
    sqft: string;
    type: string;
    furnishing: string;
    parking: string;
  };
}) {
  const facts: Array<{label: string; value: string}> = [];
  if (listing.bedrooms > 0)
    facts.push({label: labels.beds, value: String(listing.bedrooms)});
  if (listing.bathrooms > 0)
    facts.push({label: labels.baths, value: String(listing.bathrooms)});
  if (listing.sqft > 0)
    facts.push({label: labels.sqft, value: listing.sqft.toLocaleString()});
  if (listing.type)
    facts.push({label: labels.type, value: listing.type.replace(/-/g, ' ')});
  if (listing.furnishingType)
    facts.push({
      label: labels.furnishing,
      value: listing.furnishingType.replace(/-/g, ' ')
    });
  if (listing.parkingSlots && listing.parkingSlots > 0)
    facts.push({label: labels.parking, value: String(listing.parkingSlots)});
  if (facts.length === 0) return null;
  return (
    <Section className="border-b border-[var(--divider)] py-8 md:py-10">
      <Container>
        <ul className="grid grid-cols-2 gap-y-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((f) => (
            <li key={f.label} className="flex flex-col">
              <span
                className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                data-ui-label
              >
                {f.label}
              </span>
              <span className="mt-1 font-display text-xl text-[var(--text-title)] md:text-2xl capitalize">
                <bdi>{f.value}</bdi>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
