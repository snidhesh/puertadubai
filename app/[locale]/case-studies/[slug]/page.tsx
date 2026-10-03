import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';
import {CASE_STUDIES, CASE_STUDY_SECTIONS} from '@/lib/home/content';
import {cn} from '@/lib/utils';

// The case-study pages are fully static; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CASE_STUDIES.map((study) => ({locale, slug: study.slug})));
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const study = CASE_STUDIES.find((item) => item.slug === slug);
  if (!study) return {};
  const t = await getTranslations({locale, namespace: 'Home.caseStudies.items'});
  return {
    title: t(`${study.id}.title`),
    description: t(`${study.id}.summary`),
    // Dummy entries must not be indexed.
    ...(study.placeholder && {robots: {index: false, follow: false}})
  };
}

/**
 * Case-study detail — one page per card in the home page's Case Studies
 * section. Copy lives in `Home.caseStudies.items.<id>`; entries flagged
 * `placeholder` carry dummy copy and say so on the page.
 */
export default async function CaseStudyPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const study = CASE_STUDIES.find((item) => item.slug === slug);
  if (!study) notFound();

  const [t, tItems] = await Promise.all([
    getTranslations({locale, namespace: 'CaseStudyDetail'}),
    getTranslations({locale, namespace: 'Home.caseStudies.items'})
  ]);

  return (
    <>
      {/* Hero — the card's image, greyscale, with number + title overlay */}
      <section className="relative isolate flex min-h-[52vh] flex-col justify-end overflow-hidden bg-[var(--bg-dark)] py-12 text-white md:min-h-[60vh] md:py-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={study.image}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover grayscale"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/50 to-black/30"
        />
        <Container>
          <Link
            href="/#case-studies"
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
            {t('eyebrow')} · <bdi>{String(study.number).padStart(2, '0')}</bdi>
          </p>
          <h1
            className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] !text-white md:text-6xl"
            style={{color: '#ffffff'}}
          >
            {tItems(`${study.id}.title`)}
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-[1.7] !text-white/85 md:text-lg"
            style={{color: 'rgba(255,255,255,0.85)'}}
          >
            {tItems(`${study.id}.summary`)}
          </p>
        </Container>
      </section>

      {/* Body — one row per section: label left, copy right */}
      <Section className="py-20 md:py-28">
        <Container>
          {study.placeholder && (
            <p
              className="mb-10 inline-block border border-[var(--divider)] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
              data-ui-label
            >
              {t('placeholderNote')}
            </p>
          )}
          <dl className="border-t border-[var(--divider)]">
            {CASE_STUDY_SECTIONS.map((section) => (
              <div
                key={section}
                className="grid gap-4 border-b border-[var(--divider)] py-10 md:grid-cols-[1fr_2fr] md:gap-16 md:py-12"
              >
                <dt className="font-display text-2xl leading-[1.2] text-[var(--text-title)] md:text-3xl">
                  {t(`sections.${section}`)}
                </dt>
                <dd className="max-w-2xl text-base leading-[1.7] text-[var(--text-body)] md:text-lg">
                  {tItems(`${study.id}.${section}`)}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/#contact"
            className="mt-12 inline-flex items-center justify-center bg-[var(--text-title)] px-7 py-4 text-[11px] uppercase tracking-[0.22em] !text-white transition-opacity hover:opacity-85"
            style={{color: '#ffffff'}}
            data-ui-label
          >
            {t('cta')}
          </Link>
        </Container>
      </Section>

      {/* Pager — 1 · 2 · 3 */}
      <Section tone="alt" className="py-12 md:py-16">
        <Container>
          <nav aria-label={t('pagerLabel')}>
            <ul className="flex items-center justify-center gap-3">
              {CASE_STUDIES.map((item) => {
                const current = item.id === study.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/case-studies/${item.slug}`}
                      aria-label={t('pagerItem', {number: item.number})}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full border font-display text-base transition-[border-color,background-color,color] duration-300',
                        current
                          ? 'border-[var(--text-title)] bg-[var(--text-title)] !text-white'
                          : 'border-[var(--text-title)]/30 text-[var(--text-title)] hover:border-[var(--text-title)]'
                      )}
                      style={current ? {color: '#ffffff'} : undefined}
                    >
                      <bdi>{item.number}</bdi>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>
      </Section>
    </>
  );
}
