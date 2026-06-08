import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {getAreaBySlug, getAllAreaSlugs} from '@/lib/areas/data';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  const slugs = getAllAreaSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({locale, slug})));
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const area = getAreaBySlug(slug, locale);
  if (!area) return {};
  return {
    title: area.seo.metaTitle ?? area.name,
    description: area.seo.metaDescription ?? area.summary ?? undefined
  };
}

export default async function AreaDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Areas.detail'});
  const area = getAreaBySlug(slug, locale);
  if (!area) notFound();

  return (
    <>
      <section
        id="hero"
        className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-[var(--bg-dark)]"
      >
        <Image
          src={area.heroImage}
          alt={area.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        <Container className="absolute inset-x-0 bottom-0 pb-12 md:pb-20">
          <p
            className="text-[11px] uppercase tracking-[0.16em] text-white/80 [text-shadow:0_1px_8px_rgb(0_0_0_/_60%)]"
            data-ui-label
          >
            {area.emirate}
          </p>
          <h1 className="mt-3 font-display text-4xl text-white md:text-6xl [text-shadow:0_2px_24px_rgb(0_0_0_/_55%)]">
            {area.name}
          </h1>
          {area.summary && (
            <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg [text-shadow:0_1px_12px_rgb(0_0_0_/_55%)]">
              {area.summary}
            </p>
          )}
        </Container>
      </section>

      <Section>
        <Container>
          <Link
            href="/areas"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
            data-ui-label
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3 w-3 rtl:scale-x-[-1]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t('backToIndex')}</span>
          </Link>

          {area.lifestyle && (
            <Block heading={t('headings.lifestyle')} body={area.lifestyle} />
          )}

          {area.attractions.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">
                {t('headings.attractions')}
              </h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {area.attractions.map((attraction, i) => (
                  <li key={`${attraction.name}-${i}`}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-alt)]">
                      <Image
                        src={attraction.image}
                        alt={attraction.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <p
                      className="mt-4 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                      data-ui-label
                    >
                      {attraction.name}
                    </p>
                    {attraction.description && (
                      <p className="mt-2 text-sm text-[var(--text-body)]">
                        {attraction.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {area.investmentHighlights.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">
                {t('headings.investmentHighlights')}
              </h2>
              <dl className="mt-8 grid gap-6 md:grid-cols-2 lg:gap-8">
                {area.investmentHighlights.map((highlight, i) => (
                  <div
                    key={`${highlight.title}-${i}`}
                    className="border-s-2 border-[var(--divider)] ps-6"
                  >
                    <dt className="font-display text-lg text-[var(--text-title)]">
                      {highlight.title}
                    </dt>
                    <dd className="mt-3 text-sm text-[var(--text-body)]">
                      {highlight.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </Container>
      </Section>
    </>
  );
}

function Block({heading, body}: {heading: string; body: string}) {
  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">{heading}</h2>
      <p className="mt-4 whitespace-pre-line text-base text-[var(--text-body)]">{body}</p>
    </div>
  );
}
