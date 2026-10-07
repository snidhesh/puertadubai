import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';
import {EXPERTISE, EXPERTISE_POINTS} from '@/lib/home/content';

// The six expertise pages are fully static; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => EXPERTISE.map((tile) => ({locale, slug: tile.slug})));
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const tile = EXPERTISE.find((item) => item.slug === slug);
  if (!tile) return {};
  const t = await getTranslations({locale, namespace: 'Home.expertise.items'});
  return {
    title: t(`${tile.id}.title`),
    description: t(`${tile.id}.body`)
  };
}

/**
 * Expertise detail — one page per tile in the home page's Expertise grid.
 * Copy lives beside the tile copy in `Home.expertise.items.<id>` and is
 * drawn from the content spec only (see Anti-fabrication in AGENTS.md).
 */
export default async function ExpertiseDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const tile = EXPERTISE.find((item) => item.slug === slug);
  if (!tile) notFound();

  const [t, tItems] = await Promise.all([
    getTranslations({locale, namespace: 'ExpertiseDetail'}),
    getTranslations({locale, namespace: 'Home.expertise.items'})
  ]);
  const others = EXPERTISE.filter((item) => item.id !== tile.id);

  return (
    <>
      {/* Hero — the tile's image, greyscale, with eyebrow + title overlay */}
      <section className="relative isolate flex min-h-[52vh] flex-col justify-end overflow-hidden bg-[var(--bg-dark)] py-12 text-white md:min-h-[60vh] md:py-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.image}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover grayscale"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/50 to-black/30"
        />
        <Container>
          <Link
            href="/#expertise"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] !text-white/75 hover:!text-white"
            style={{color: 'rgba(255,255,255,0.75)'}}
            data-ui-label
          >
            <span aria-hidden="true" className="rtl:scale-x-[-1]">
              ←
            </span>{' '}
            {t('back')}
          </Link>
          <p
            className="mt-8 text-[11px] uppercase tracking-[0.32em] !text-white/75"
            style={{color: 'rgba(255,255,255,0.75)'}}
            data-ui-label
          >
            {tItems(`${tile.id}.eyebrow`)}
          </p>
          <h1
            className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] !text-white md:text-6xl"
            style={{color: '#ffffff'}}
          >
            {tItems(`${tile.id}.title`)}
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-[1.7] !text-white/85 md:text-lg"
            style={{color: 'rgba(255,255,255,0.85)'}}
          >
            {tItems(`${tile.id}.body`)}
          </p>
        </Container>
      </section>

      {/* Body — standfirst left, scope list right */}
      <Section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <p className="font-display text-2xl leading-[1.35] text-[var(--text-title)] md:text-3xl">
              {tItems(`${tile.id}.intro`)}
            </p>
            <div>
              <h2
                className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
                data-ui-label
              >
                {t('coversHeading')}
              </h2>
              <dl className="mt-6 border-t border-[var(--divider)]">
                {EXPERTISE_POINTS.map((n) => (
                  <div key={n} className="border-b border-[var(--divider)] py-6">
                    <dt className="font-display text-xl leading-[1.2] text-[var(--text-title)] md:text-2xl">
                      {tItems(`${tile.id}.point${n}Title`)}
                    </dt>
                    <dd className="mt-2 text-base leading-[1.7] text-[var(--text-body)]">
                      {tItems(`${tile.id}.point${n}Body`)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center bg-[var(--text-title)] px-7 py-4 text-[11px] uppercase tracking-[0.22em] !text-white transition-opacity hover:opacity-85"
                  style={{color: '#ffffff'}}
                  data-ui-label
                >
                  {t('cta')}
                </Link>
                {tile.related && (
                  <Link
                    href={tile.related.href}
                    className="inline-flex items-center gap-2 border-b border-[var(--text-title)]/40 pb-1 text-[11px] uppercase tracking-[0.22em] text-[var(--text-title)] transition-colors hover:border-[var(--text-title)]"
                    data-ui-label
                  >
                    {t(`related.${tile.related.label}`)}{' '}
                    <span aria-hidden="true" className="rtl:scale-x-[-1]">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* More expertise — the other five as a text index */}
      <Section tone="alt" className="py-16 md:py-20">
        <Container>
          <h2
            className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
            data-ui-label
          >
            {t('moreHeading')}
          </h2>
          <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((item) => (
              <li key={item.id}>
                <Link href={`/expertise/${item.slug}`} className="group block">
                  <span
                    className="block text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {tItems(`${item.id}.eyebrow`)}
                  </span>
                  <span className="mt-2 block font-display text-xl leading-[1.2] text-[var(--text-title)] group-hover:underline">
                    {tItems(`${item.id}.title`)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
