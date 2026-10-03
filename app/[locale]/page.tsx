import {Suspense} from 'react';
import Image from 'next/image';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {cn} from '@/lib/utils';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {ContactForm} from '@/components/home/contact-form';
import {ExpandableVideoList} from '@/components/home/expandable-video-list';
import {StickySocials} from '@/components/home/sticky-socials';
import {
  CAREER_IDS,
  CASE_STUDIES,
  ENDORSEMENT_IDS,
  EXPERTISE,
  FEATURED_VIDEOS,
  LINKS,
  MEDIA,
  PORTRAITS,
  TRUSTPILOT,
  type MediaItem
} from '@/lib/home/content';
import {DAYAN_AGENT, fetchAgentListings, type StudioListingCard} from '@/lib/studio/properties';
import {PlayGlyph} from '@/components/home/play-glyph';
import {SOCIAL_ICONS} from '@/lib/site/social';
import {fetchLatestReels} from '@/lib/instagram/reels';
import {routing, type Locale} from '@/lib/i18n/routing';

// Featured listings come from the BlackOak Studio CRM feed; ISR every 5 min.
export const revalidate = 300;
// The agent feed walk downloads the whole CRM feed (~37 MB). Give ISR
// regeneration room beyond the platform default so it is not cut off.
export const maxDuration = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

const INSTAGRAM_ICON = SOCIAL_ICONS.find((icon) => icon.label === 'Instagram');

const POSTER = '/video/bg3.poster.jpg';
const VIDEO_AV1 = '/video/bg3.av1.webm';
const VIDEO_H264 = '/video/bg3.h264.mp4';

/**
 * Single-page portfolio. Section order and anchor ids:
 *   #hero → overview → #listings → panels → #about → #expertise →
 *   #case-studies → #experience → endorsements → #reviews → videos →
 *   #atelier → instagram → #media → #data-room → #contact
 * The nav (About · Expertise · Experience · Listings · House of
 * Candamil · International · Media · Contact) links to these anchors;
 * International opens the cross-border expertise page.
 */
export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, tHome, tForm, tProjects] = await Promise.all([
    getTranslations({locale, namespace: 'Hero'}),
    getTranslations({locale, namespace: 'Home'}),
    getTranslations({locale, namespace: 'ContactForm'}),
    getTranslations({locale, namespace: 'Projects'})
  ]);

  const listingLabels = {
    beds: tProjects('beds'),
    baths: tProjects('baths'),
    sqft: tProjects('sqft'),
    viewDetails: tProjects('viewDetails')
  };

  const formLabels = {
    name: tForm('name'),
    phone: tForm('phone'),
    email: tForm('email'),
    message: tForm('message'),
    consent: tForm('consent'),
    submit: tForm('submit'),
    successTitle: tForm('successTitle'),
    successBody: tForm('successBody'),
    error: tForm('error')
  };

  return (
    <>
      {/* 1. HERO — full-bleed, video covers viewport behind fixed nav */}
      <section
        id="hero"
        className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          preload="metadata"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src={VIDEO_AV1} type="video/webm" />
          <source src={VIDEO_H264} type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-black/65" aria-hidden="true" />
        <p
          className="text-[11px] uppercase tracking-[0.32em] !text-white/75"
          style={{color: 'rgba(255,255,255,0.75)'}}
          data-ui-label
        >
          {t('kicker')}
        </p>
        <h1
          className="mt-6 font-display text-4xl leading-[1.1] !text-white md:text-6xl lg:text-7xl"
          style={{color: '#ffffff'}}
        >
          {t('headline')}
        </h1>
        <p
          className="mt-6 max-w-2xl text-sm leading-[1.7] !text-white md:text-base lg:text-lg"
          style={{color: '#ffffff'}}
        >
          {t('subhead')}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex h-[50px] items-center justify-center bg-white px-10 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--text-title)] transition-colors hover:bg-[var(--bg-alt)]"
            data-ui-label
          >
            {t('primaryCta')}
          </a>
          <a
            href="#experience"
            className="inline-flex h-[50px] items-center justify-center border border-white bg-transparent px-10 text-[12px] font-medium uppercase tracking-[0.18em] !text-white transition-colors hover:bg-white hover:!text-[var(--text-title)]"
            style={{color: '#ffffff'}}
            data-ui-label
          >
            {t('secondaryCta')}
          </a>
        </div>
      </section>

      {/* Sticky social column — stays right-edge through scroll, fades near footer */}
      <StickySocials />

      {/* 2. OVERVIEW STRIP — image | editorial | stats, split-color bg */}
      <section
        aria-label={tHome('overview.ariaLabel')}
        className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        <div className="relative min-h-[260px] bg-[var(--bg-alt)] md:min-h-[440px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/uae/difc.jpg"
            alt={tHome('overview.imageAlt')}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center bg-[var(--bg-alt)] px-6 py-14 md:px-10 md:py-20 lg:px-16">
          <div className="md:max-w-md">
            <p
              className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
              data-ui-label
            >
              {tHome('overview.eyebrow')}
            </p>
            <p className="mt-5 font-display text-2xl leading-[1.35] text-[var(--text-title)] md:text-3xl">
              {tHome('overview.headingPart1')}
              <span className="italic text-[var(--text-muted)]"> {tHome('overview.headingItalic')} </span>
              {tHome('overview.headingPart2')}
            </p>
            <span aria-hidden="true" className="mt-8 block h-px w-12 bg-[var(--divider)]" />
            <p className="mt-6 max-w-sm text-sm leading-[1.7] text-[var(--text-muted)]">
              {tHome('overview.body')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[var(--bg)] px-6 py-14 md:px-10 md:py-20 lg:px-16">
          <ul className="w-full max-w-sm space-y-7 md:space-y-9">
            <Stat value="14" label={tHome('overview.statYears')} />
            <Stat value="5" label={tHome('overview.statMarkets')} />
            <Stat value="3" label={tHome('overview.statLanguages')} last />
          </ul>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS — dark band, title cell + live Studio CRM cards */}
      <Section id="listings" tone="dark" className="scroll-mt-16">
        <Container>
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-start justify-center gap-8 py-8">
              <h2 className="font-display">
                <span
                  className="block text-sm uppercase tracking-[0.24em] !text-white/75"
                  style={{color: 'rgba(255,255,255,0.75)'}}
                  data-ui-label
                >
                  {tHome('featuredListings.eyebrow')}
                </span>
                <span
                  className="mt-3 block text-5xl leading-[1] !text-white md:text-6xl lg:text-7xl"
                  style={{color: '#ffffff'}}
                >
                  {tHome('featuredListings.heading')}
                </span>
              </h2>
              <p
                className="max-w-sm text-sm leading-[1.7] !text-white/75"
                style={{color: 'rgba(255,255,255,0.75)'}}
              >
                {tHome('featuredListings.intro')}
              </p>
              <span aria-hidden="true" className="block h-px w-12 bg-white/40" />
              <Link
                href="/projects"
                className="inline-flex h-[45px] items-center justify-center border border-white px-8 text-[11px] uppercase tracking-[0.22em] !text-white transition-colors hover:bg-white hover:!text-[var(--text-title)]"
                style={{color: '#ffffff'}}
                data-ui-label
              >
                {tHome('featuredListings.viewAll')}
              </Link>
            </div>
            {/* Streams in behind a skeleton so a cold CRM walk never blocks
             * the page shell; warm reads come from the data cache. */}
            <Suspense fallback={<ListingCardSkeletons count={5} />}>
              <FeaturedListingCards
                locale={locale}
                labels={listingLabels}
                emptyLabel={tHome('featuredListings.empty')}
              />
            </Suspense>
          </div>
        </Container>
      </Section>

      {/* 4. THREE-PANEL BAND — mobile snap carousel, md+ 3-col grid */}
      <section
        aria-label={tHome('panels.ariaLabel')}
        className={[
          'flex snap-x snap-mandatory overflow-x-auto scroll-smooth',
          '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          'md:grid md:grid-cols-3 md:overflow-visible',
          'bg-[var(--bg-dark)]'
        ].join(' ')}
      >
        <PanelCard
          href="#contact"
          eyebrow={tHome('panels.mandatesEyebrow')}
          title={tHome('panels.mandatesTitle')}
          body={tHome('panels.mandatesBody')}
          cta={tHome('panels.mandatesCta')}
          image={PORTRAITS.mandates}
          imagePosition="top"
        />
        <PanelCard
          href={LINKS.blackoak}
          external
          eyebrow={tHome('panels.blackoakEyebrow')}
          title={tHome('panels.blackoakTitle')}
          body={tHome('panels.blackoakBody')}
          cta={tHome('panels.blackoakCta')}
          image="/images/uae/dubai-skyline.jpg"
        />
        <PanelCard
          href="#atelier"
          eyebrow={tHome('panels.atelierEyebrow')}
          title={tHome('panels.atelierTitle')}
          body={tHome('panels.atelierBody')}
          cta={tHome('panels.atelierCta')}
          image="/images/dayan/bw-floral-dress.jpg"
          imagePosition="top"
        />
      </section>

      {/* 5. ABOUT — tall portrait left + stacked content right */}
      <Section id="about" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          {/* Portrait column hugs the copy measure (36rem) so the two read as
           * one composition rather than sitting at opposite edges. */}
          <div className="grid gap-12 lg:grid-cols-[auto_minmax(0,36rem)] lg:gap-8">
            {/* Sized to the portrait and sticky, so it stays level with the
             * copy as the long biography scrolls instead of sinking below it. */}
            <div className="hidden lg:block lg:self-start lg:justify-self-end lg:sticky lg:top-24">
              {/* Capped to the viewport so the whole figure stays in view while
               * stuck; flush to the copy side. */}
              <div className="flex w-[440px] justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PORTRAITS.about}
                  alt={tHome('about.imageAlt')}
                  className="block h-auto max-h-[calc(100vh-5.5rem)] w-auto max-w-full"
                />
              </div>
            </div>
            <div>
              <h2 className="font-display text-[var(--text-title)]">
                <span
                  className="block text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  {tHome('about.eyebrow')}
                </span>
                <span className="mt-2 block text-4xl leading-[1.05] md:text-6xl">
                  {tHome('about.name')}
                </span>
              </h2>
              <p className="mt-3 font-display text-xl italic text-[var(--text-muted)] md:text-2xl">
                {tHome('about.tagline')}
              </p>
              <div className="mt-8 lg:hidden">
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PORTRAITS.about}
                    alt={tHome('about.imageAlt')}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
              <p className="mt-8 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                {tHome('about.intro')}
              </p>
              <div className="mt-10 space-y-10">
                {(['1', '2', '3'] as const).map((n) => (
                  <div key={n}>
                    <h3 className="font-display text-xl text-[var(--text-title)] md:text-2xl">
                      {tHome(`about.h${n}`)}
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                      {tHome(`about.body${n}`)}
                    </p>
                  </div>
                ))}
              </div>
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] hover:underline"
                data-ui-label
              >
                {tHome('about.linkedinCta')} <span aria-hidden="true" className="rtl:scale-x-[-1]">→</span>
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. EXPERTISE — dark band, centered title, 6 image tiles */}
      <Section id="expertise" tone="dark" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          <div className="text-center">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] !text-white/70"
                style={{color: 'rgba(255,255,255,0.7)'}}
                data-ui-label
              >
                {tHome('expertise.eyebrow')}
              </span>
              <span
                className="mt-4 block text-4xl leading-[1] !text-white md:text-6xl lg:text-7xl"
                style={{color: '#ffffff'}}
              >
                {tHome('expertise.heading')}
              </span>
            </h2>
          </div>
          {/* Uniform grid: every tile is one square linking to its detail page.
           * Greyscale at rest → colour on hover. */}
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
            {EXPERTISE.map((tile) => (
              <li key={tile.id}>
                <Link
                  href={`/expertise/${tile.slug}`}
                  className="group relative block aspect-square overflow-hidden text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover grayscale transition-[transform,filter] duration-[800ms] ease-out group-hover:scale-[1.06] group-hover:grayscale-0"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/15 transition-opacity duration-500 group-hover:from-black/80"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <p
                      className="text-[10px] uppercase tracking-[0.32em] !text-white/70"
                      style={{color: 'rgba(255,255,255,0.7)'}}
                      data-ui-label
                    >
                      {tHome(`expertise.items.${tile.id}.eyebrow`)}
                    </p>
                    <p
                      className="mt-2 font-display text-2xl leading-[1.1] !text-white md:text-3xl"
                      style={{color: '#ffffff'}}
                    >
                      {tHome(`expertise.items.${tile.id}.title`)}
                    </p>
                    <p
                      className="mt-3 max-w-xs text-sm leading-[1.6] !text-white/80"
                      style={{color: 'rgba(255,255,255,0.8)'}}
                    >
                      {tHome(`expertise.items.${tile.id}.body`)}
                    </p>
                    <p
                      className="mt-5 inline-flex items-center gap-2 self-start border-b border-white/40 pb-1 text-[10px] uppercase tracking-[0.32em] !text-white transition-colors group-hover:border-white"
                      style={{color: '#ffffff'}}
                      data-ui-label
                    >
                      {tHome('expertise.explore')}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1 rtl:scale-x-[-1]"
                      >
                        →
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 7. CASE STUDIES — title banner + three cards ahead of the career timeline */}
      <section
        id="case-studies"
        aria-labelledby="case-studies-heading"
        className="scroll-mt-16 bg-[var(--bg-alt)] py-16 md:py-24"
      >
        <Container>
          <div className="flex items-center gap-6 md:gap-10">
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--text-title)]/20" />
            <h2
              id="case-studies-heading"
              className="font-display text-2xl leading-[1.1] text-[var(--text-title)] md:text-4xl"
            >
              {tHome('caseStudies.heading')}
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--text-title)]/20" />
          </div>
          {/* Phones: thumbnail beside the text so three cards stay compact.
           * sm and up: square image above the caption, three across. */}
          <ul className="mt-10 grid gap-x-6 gap-y-8 sm:mt-12 sm:grid-cols-3 sm:gap-y-12 md:mt-16">
            {CASE_STUDIES.map((study) => (
              <li key={study.id}>
                <Link href={`/case-studies/${study.slug}`} className="group flex gap-5 sm:block">
                  <div className="relative aspect-square w-24 shrink-0 self-start overflow-hidden bg-[var(--bg-dark)] sm:w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover grayscale transition-[transform,filter] duration-[800ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm tracking-[0.22em] text-[var(--text-muted)] sm:mt-5">
                      <bdi>{String(study.number).padStart(2, '0')}</bdi>
                    </p>
                    <h3 className="mt-1 font-display text-xl leading-[1.15] text-[var(--text-title)] sm:mt-2 sm:text-2xl">
                      {tHome(`caseStudies.items.${study.id}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.7] text-[var(--text-body)] sm:mt-3">
                      {tHome(`caseStudies.items.${study.id}.summary`)}
                    </p>
                    <p
                      className="mt-3 inline-flex items-center gap-2 whitespace-nowrap border-b border-[var(--text-title)]/40 pb-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-title)] transition-colors group-hover:border-[var(--text-title)] sm:mt-5 sm:tracking-[0.32em]"
                      data-ui-label
                    >
                      {tHome('caseStudies.view')}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1 rtl:scale-x-[-1]"
                      >
                        →
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 8. CAREER — stacked show/hide rows */}
      <Section id="experience" className="scroll-mt-16">
        <Container>
          <p
            className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
            data-ui-label
          >
            {tHome('career.eyebrow')}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl text-[var(--text-title)] md:text-5xl">
            {tHome('career.heading')}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] md:text-lg">
            {tHome('career.intro')}
          </p>
          {/* Stacked rows; each opens to show its summary (native <details>,
           * no client JS). The current role starts open. */}
          <ul className="mt-12 border-t border-[var(--divider)] md:mt-16">
            {CAREER_IDS.map((id, i) => (
              <li key={id} className="border-b border-[var(--divider)]">
                <details className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center gap-6 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-title)] md:py-7 [&::-webkit-details-marker]:hidden">
                    <span className="block flex-1 md:grid md:grid-cols-[180px_1fr] md:items-baseline md:gap-8">
                      <span
                        className="block text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                        data-ui-label
                      >
                        <bdi>{tHome(`career.items.${id}.years`)}</bdi>
                      </span>
                      <span className="mt-2 block md:mt-0">
                        <span className="block font-display text-2xl leading-[1.15] text-[var(--text-title)] md:text-3xl">
                          {tHome(`career.items.${id}.company`)}
                        </span>
                        <span className="mt-1 block font-display text-base italic text-[var(--text-muted)] md:text-lg">
                          {tHome(`career.items.${id}.role`)}
                        </span>
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="h-6 w-6 shrink-0 text-[var(--text-title)] transition-transform duration-300 group-open:rotate-45"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </summary>
                  <div className="pb-8 md:ps-[212px]">
                    <p className="max-w-2xl text-base leading-[1.7] text-[var(--text-body)]">
                      {tHome(`career.items.${id}.summary`)}
                    </p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 9. ENDORSEMENTS — light-grey, 3 quote cards */}
      <Section tone="alt" className="py-24 md:py-32">
        <Container>
          <div className="text-center">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]"
                data-ui-label
              >
                {tHome('endorsements.eyebrow')}
              </span>
              <span className="mt-4 block text-4xl leading-[1] text-[var(--text-title)] md:text-6xl lg:text-7xl">
                {tHome('endorsements.heading')}
              </span>
            </h2>
          </div>
          <ul className="mt-16 grid gap-8 md:grid-cols-3 md:mt-20">
            {ENDORSEMENT_IDS.map((id) => (
              <li
                key={id}
                className="relative flex flex-col gap-6 rounded-xl bg-[var(--bg)] p-8 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] md:p-10"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-1 start-6 font-display text-[88px] leading-[1] text-[var(--text-title)] opacity-15"
                >
                  &ldquo;
                </span>
                <p className="relative pt-6 font-display text-lg italic leading-[1.5] text-[var(--text-title)] md:text-xl">
                  {tHome(`endorsements.items.${id}.quote`)}
                </p>
                <div className="mt-auto flex items-center gap-4 border-t border-[var(--divider)] pt-6">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--bg-dark)] font-display text-lg text-[var(--text-on-dark)]"
                  >
                    {tHome(`endorsements.items.${id}.initials`)}
                  </span>
                  <div>
                    <p className="font-display text-base text-[var(--text-title)]">
                      {tHome(`endorsements.items.${id}.name`)}
                    </p>
                    <p
                      className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      data-ui-label
                    >
                      {tHome(`endorsements.items.${id}.sub`)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 10. TRUSTPILOT REVIEWS — verbatim quotes from the public profile */}
      <Section id="reviews" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          <div className="border-b border-[var(--divider)] pb-10 lg:flex lg:items-end lg:justify-between lg:gap-16 lg:pb-12">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]"
                data-ui-label
              >
                {tHome('reviews.eyebrow')}
              </span>
              <span className="mt-3 block text-4xl leading-[1] text-[var(--text-title)] md:text-5xl lg:text-6xl">
                {tHome('reviews.heading')}
              </span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-[1.7] text-[var(--text-body)] md:text-base lg:mt-0 lg:pb-1 lg:text-end">
              {tHome('reviews.body')}
            </p>
          </div>
          <ul className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3">
            {TRUSTPILOT.reviews.map((review) => (
              <li key={review.id} className="flex flex-col bg-[var(--bg-alt)] p-8 md:p-10">
                <StarRating
                  rating={review.rating}
                  label={tHome('reviews.ratingLabel', {rating: review.rating})}
                />
                <blockquote className="mt-6 flex-1">
                  {tHome.has(`reviews.items.${review.id}.title`) ? (
                    <>
                      <p className="font-display text-xl leading-[1.3] text-[var(--text-title)] md:text-2xl">
                        {tHome(`reviews.items.${review.id}.title`)}
                      </p>
                      <p className="mt-4 whitespace-pre-line text-base leading-[1.7] text-[var(--text-body)]">
                        {tHome(`reviews.items.${review.id}.text`)}
                        {review.excerpt && ' …'}
                      </p>
                    </>
                  ) : (
                    // A one-line review with no title carries the display type itself.
                    <p className="whitespace-pre-line font-display text-xl leading-[1.3] text-[var(--text-title)] md:text-2xl">
                      {tHome(`reviews.items.${review.id}.text`)}
                      {review.excerpt && ' …'}
                    </p>
                  )}
                </blockquote>
                <div className="mt-8 border-t border-[var(--divider)] pt-6">
                  <p className="font-display text-base text-[var(--text-title)]">
                    {tHome(`reviews.items.${review.id}.name`)}
                  </p>
                  <p
                    className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {tHome('reviews.source')} · <bdi>{formatLongDate(review.published, locale)}</bdi>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <a
              href={TRUSTPILOT.profile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-[var(--text-title)]/40 pb-1 text-[11px] uppercase tracking-[0.22em] text-[var(--text-title)] transition-colors hover:border-[var(--text-title)]"
              data-ui-label
            >
              {tHome('reviews.readAll')} <span aria-hidden="true" className="rtl:scale-x-[-1]">→</span>
            </a>
            <a
              href={TRUSTPILOT.write}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)] transition-colors hover:border-[var(--text-muted)]"
              data-ui-label
            >
              {tHome('reviews.write')}
            </a>
          </div>
        </Container>
      </Section>

      {/* 11. FEATURED VIDEOS — dark band: writeup + 1 highlighted + 3-then-expand stack */}
      <Section tone="dark" className="py-24 md:py-32">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] !text-white/65"
                style={{color: 'rgba(255,255,255,0.65)'}}
                data-ui-label
              >
                {tHome('videos.eyebrow')}
              </span>
              <span
                className="mt-3 block text-4xl leading-[1] !text-white md:text-5xl lg:text-6xl"
                style={{color: '#ffffff'}}
              >
                {tHome('videos.heading')}
              </span>
            </h2>
            <p
              className="mt-6 max-w-xl text-sm leading-[1.7] !text-white/80 md:mt-7 md:text-base"
              style={{color: 'rgba(255,255,255,0.8)'}}
            >
              {tHome('videos.body')}
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12 md:mt-16">
            <FeaturedVideoHero video={FEATURED_VIDEOS[0]} locale={locale} />
            <ExpandableVideoList initialCount={3}>
              {FEATURED_VIDEOS.slice(1, 6).map((video) => (
                <StackedVideoCard key={video.id} video={video} locale={locale} />
              ))}
            </ExpandableVideoList>
          </div>

          <div className="mt-14 text-center md:mt-16">
            <a
              href={LINKS.youtubeVideos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[50px] items-center justify-center border border-white px-10 text-[11px] uppercase tracking-[0.22em] !text-white transition-colors hover:bg-white hover:!text-[var(--text-title)]"
              style={{color: '#ffffff'}}
              data-ui-label
            >
              {tHome('videos.viewAll')}
            </a>
          </div>
        </Container>
      </Section>

      {/* 12. HOUSE OF CANDAMIL — copy left, image right */}
      <Section id="atelier" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          {/* Text column matches the copy measure (36rem); the portrait column
           * hugs it rather than the far edge so the two read as one composition. */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,36rem)_auto] lg:gap-12">
            <div>
              <h2 className="font-display text-[var(--text-title)]">
                <span
                  className="block text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  {tHome('atelier.eyebrow')}
                </span>
                <span className="mt-2 block text-4xl leading-[1.05] md:text-6xl">
                  {tHome('atelier.heading')}
                </span>
              </h2>
              <p className="mt-3 font-display text-xl italic text-[var(--text-muted)] md:text-2xl">
                {tHome('atelier.tagline')}
              </p>
              <div className="mt-8 lg:hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PORTRAITS.atelier}
                    alt={tHome('atelier.imageAlt')}
                    className="absolute inset-0 h-full w-full object-contain object-bottom"
                  />
                </div>
              </div>
              <p className="mt-8 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                {tHome('atelier.intro')}
              </p>
              <div className="mt-10 space-y-10">
                {(['1', '2'] as const).map((n) => (
                  <div key={n}>
                    <h3 className="font-display text-xl text-[var(--text-title)] md:text-2xl">
                      {tHome(`atelier.h${n}`)}
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                      {tHome(`atelier.body${n}`)}
                    </p>
                  </div>
                ))}
              </div>
              <a
                href={LINKS.houseOfCandamil}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] hover:underline"
                data-ui-label
              >
                {tHome('atelier.cta')} <span aria-hidden="true" className="rtl:scale-x-[-1]">→</span>
              </a>
            </div>
            <div className="hidden lg:block">
              <div className="relative h-full min-h-[520px] w-[400px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PORTRAITS.atelier}
                  alt={tHome('atelier.imageAlt')}
                  className="absolute inset-0 h-full w-full object-contain [object-position:0%_100%] rtl:[object-position:100%_100%]"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 13. INSTAGRAM — dark band: handle + follow link, latest reels beneath */}
      <section aria-label={tHome('instagram.ariaLabel')} className="bg-[var(--bg-dark)] py-12 md:py-16">
        <Container>
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-start"
          >
            <span className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              {INSTAGRAM_ICON && (
                <svg viewBox="0 0 24 24" fill="#ffffff" className="h-8 w-8 shrink-0 md:h-10 md:w-10" aria-hidden="true">
                  <path d={INSTAGRAM_ICON.path} />
                </svg>
              )}
              <span className="block">
                <span
                  className="block text-[11px] uppercase tracking-[0.32em] !text-white/70"
                  style={{color: 'rgba(255,255,255,0.7)'}}
                  data-ui-label
                >
                  {tHome('instagram.eyebrow')}
                </span>
                <span
                  className="mt-2 block break-all font-display text-2xl leading-[1.1] !text-white sm:text-3xl md:text-4xl"
                  style={{color: '#ffffff'}}
                >
                  <bdi dir="ltr">{LINKS.instagramHandle}</bdi>
                </span>
              </span>
            </span>
            <span
              className="inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[11px] uppercase tracking-[0.22em] !text-white transition-colors group-hover:border-white"
              style={{color: '#ffffff'}}
              data-ui-label
            >
              {tHome('instagram.cta')}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:scale-x-[-1]"
              >
                →
              </span>
            </span>
          </a>
          <Suspense fallback={null}>
            <InstagramReels locale={locale} />
          </Suspense>
        </Container>
      </section>

      {/* 14. MEDIA & HONOURS — square tile grid + 3-column credentials */}
      <Section id="media" tone="alt" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          {/* Editorial header: title left, standfirst right, sharing a baseline
           * with a hairline underneath — the same rule the tiles use. */}
          <div className="border-b border-[var(--divider)] pb-10 lg:flex lg:items-end lg:justify-between lg:gap-16 lg:pb-12">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]"
                data-ui-label
              >
                {tHome('media.eyebrowLine1')}
              </span>
              <span className="mt-3 block text-4xl leading-[1] text-[var(--text-title)] md:text-5xl lg:text-6xl">
                {tHome('media.eyebrowLine2')}
              </span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-[1.7] text-[var(--text-body)] md:text-base lg:mt-0 lg:pb-1 lg:text-end">
              {tHome('media.body')}
            </p>
          </div>

          {/* Square tiles, caption beneath each: two to a row on phones and
           * tablets, four on desktop. */}
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:mt-16 lg:grid-cols-4">
            {MEDIA.map((item) => (
              <li key={item.id}>
                <MediaTile
                  item={item}
                  kicker={tHome(`media.items.${item.id}.kicker`)}
                  title={tHome(`media.items.${item.id}.title`)}
                  body={tHome(`media.items.${item.id}.body`)}
                  alt={tHome(`media.items.${item.id}.alt`)}
                  watchLabel={tHome('media.watchOnYouTube')}
                />
              </li>
            ))}
          </ul>

          <div className="mt-20 grid gap-12 border-t border-[var(--divider)] pt-14 md:grid-cols-3 md:mt-24">
            <CredentialList
              heading={tHome('media.alsoHeading')}
              items={[1, 2, 3, 4, 5].map((n) => tHome(`media.also${n}`))}
            />
            <CredentialList
              heading={tHome('media.honoursHeading')}
              items={[1, 2].map((n) => tHome(`media.honour${n}`))}
            />
            <CredentialList
              heading={tHome('media.educationHeading')}
              items={[1, 2, 3, 4].map((n) => tHome(`media.education${n}`))}
            />
          </div>
        </Container>
      </Section>

      {/* 15. DATA ROOM — coming-soon banner for the future client login area.
       * Placeholder copy only: no project figures until the real area ships. */}
      <Section id="data-room" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          <div className="text-center">
            <p
              className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
              data-ui-label
            >
              {tHome('dataRoom.eyebrow')}
            </p>
            <h2 className="mt-6 font-display text-5xl uppercase leading-[0.95] tracking-[0.06em] text-[var(--text-title)] sm:text-7xl lg:text-9xl">
              {tHome('dataRoom.heading')}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-base leading-[1.7] text-[var(--text-body)] md:text-lg">
              {tHome('dataRoom.body')}
            </p>
          </div>
          <ul className="mt-14 grid border-t border-[var(--divider)] md:mt-20 md:grid-cols-3 md:border-t-0">
            {(['plans', 'returns', 'details'] as const).map((item) => (
              <li
                key={item}
                className="flex gap-5 border-b border-[var(--divider)] py-8 md:border-b-0 md:border-s md:px-8 md:py-2 md:first:border-s-0 md:first:ps-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  className="mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                >
                  <rect x="5" y="10.5" width="14" height="9.5" rx="1" />
                  <path d="M8 10.5V7.5a4 4 0 018 0v3" strokeLinecap="round" />
                </svg>
                <div>
                  <h3 className="font-display text-xl leading-[1.2] text-[var(--text-title)] md:text-2xl">
                    {tHome(`dataRoom.items.${item}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.7] text-[var(--text-body)]">
                    {tHome(`dataRoom.items.${item}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-14 text-center md:mt-20">
            <span
              className="inline-block border border-[var(--text-title)]/30 px-4 py-4 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] sm:px-7 sm:tracking-[0.22em]"
              data-ui-label
            >
              {tHome('dataRoom.login')}
            </span>
          </p>
        </Container>
      </Section>

      {/* 16. CONTACT — same composition as the original Let's Connect band:
       * full-bleed portrait left, dark form + details right. */}
      <section
        id="contact"
        aria-label={tHome('contact.ariaLabel')}
        className="grid scroll-mt-16 bg-[var(--bg-dark)] md:grid-cols-2"
      >
        <div className="relative min-h-[420px] md:min-h-[720px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PORTRAITS.contact}
            alt={tHome('contact.imageAlt')}
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
        </div>

        <div className="flex items-center px-6 py-16 md:px-12 md:py-24 lg:px-20">
          <div className="w-full max-w-md">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] !text-white/65"
                style={{color: 'rgba(255,255,255,0.65)'}}
                data-ui-label
              >
                {tHome('contact.eyebrow')}
              </span>
              <span
                className="mt-3 block text-3xl leading-[1.05] !text-white md:text-5xl lg:text-6xl"
                style={{color: '#ffffff'}}
              >
                {tHome('contact.heading')}
              </span>
            </h2>
            <p
              className="mt-6 max-w-sm text-sm leading-[1.7] !text-white/75 md:text-base"
              style={{color: 'rgba(255,255,255,0.75)'}}
            >
              {tHome('contact.body')}
            </p>

            <div className="mt-10">
              <ContactForm locale={locale} labels={formLabels} onDark />
            </div>

            <dl className="mt-10 grid gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8">
              <ContactDetail label={tHome('contact.email')}>
                <a href={`mailto:${LINKS.email}`} className="!text-white hover:underline" style={{color: '#ffffff'}}>
                  {LINKS.email}
                </a>
              </ContactDetail>
              <ContactDetail label={tHome('contact.whatsApp')}>
                <a href={LINKS.whatsapp} className="!text-white hover:underline" style={{color: '#ffffff'}}>
                  <bdi>{LINKS.whatsappDisplay}</bdi>
                </a>
              </ContactDetail>
              <ContactDetail label={tHome('contact.office')}>
                <span className="!text-white" style={{color: '#ffffff'}}>
                  {tHome('contact.officeValue')}
                </span>
              </ContactDetail>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function Stat({value, label, last = false}: {value: string; label: string; last?: boolean}) {
  return (
    <li
      className={cn(
        'flex items-baseline justify-between gap-6',
        !last && 'border-b border-[var(--divider)] pb-5'
      )}
    >
      <span className="font-display text-5xl leading-none text-[var(--text-title)] md:text-6xl">
        <bdi>{value}</bdi>
      </span>
      <span
        className="max-w-[14rem] text-end text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
        data-ui-label
      >
        {label}
      </span>
    </li>
  );
}

async function FeaturedListingCards({
  locale,
  labels,
  emptyLabel
}: {
  locale: Locale;
  labels: ListingLabels;
  emptyLabel: string;
}) {
  // Dayan's own inventory from the Studio CRM; first five on the home page.
  const listings: StudioListingCard[] = await fetchAgentListings(DAYAN_AGENT, locale)
    .then((all) => all.slice(0, 5))
    .catch(() => []);
  if (listings.length === 0) {
    return (
      <p
        className="self-center text-sm leading-[1.7] !text-white/60 md:col-span-1 lg:col-span-2"
        style={{color: 'rgba(255,255,255,0.6)'}}
      >
        {emptyLabel}
      </p>
    );
  }
  return listings.map((listing) => (
    <Link key={listing.id} href={`/projects/${listing.id}`} aria-label={listing.title} className="block">
      <StudioListingCardView listing={listing} labels={labels} />
    </Link>
  ));
}

function ListingCardSkeletons({count}: {count: number}) {
  return Array.from({length: count}, (_, i) => (
    <div key={i} className="flex animate-pulse flex-col gap-5" aria-hidden="true">
      <div className="aspect-[7/5] w-full bg-white/5" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-white/10" />
        <div className="h-3 w-1/2 bg-white/5" />
      </div>
    </div>
  ));
}

type ListingLabels = {beds: string; baths: string; sqft: string; viewDetails: string};

/** Listing card: clean photo on top, structured caption below (address + specs | price + CTA). */
function StudioListingCardView({listing, labels}: {listing: StudioListingCard; labels: ListingLabels}) {
  return (
    <article className="group flex flex-col gap-5">
      <div className="relative aspect-[7/5] w-full overflow-hidden bg-white/5">
        {listing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-white/5" aria-hidden="true" />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-snug !text-white md:text-xl" style={{color: '#ffffff'}}>
            {listing.title}
          </p>
          <p
            className="mt-1 text-[11px] uppercase tracking-[0.18em] !text-white/65"
            style={{color: 'rgba(255,255,255,0.65)'}}
            data-ui-label
          >
            {listing.area}
            <span className="mx-1">·</span>
            {listing.emirate}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] !text-white/85" style={{color: 'rgba(255,255,255,0.85)'}}>
            {listing.bedrooms > 0 && (
              <span>
                <bdi>{listing.bedrooms}</bdi> {labels.beds}
              </span>
            )}
            {listing.bathrooms > 0 && (
              <span>
                <bdi>{listing.bathrooms}</bdi> {labels.baths}
              </span>
            )}
            {listing.sqft > 0 && (
              <span>
                <bdi>{listing.sqft.toLocaleString()}</bdi> {labels.sqft}
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <p className="font-display text-lg leading-snug !text-white md:text-xl" style={{color: '#ffffff'}}>
            <bdi>{listing.priceFrom}</bdi>
          </p>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.22em] !text-white/65 transition-colors duration-200 group-hover:!text-white"
            style={{color: 'rgba(255,255,255,0.65)'}}
            data-ui-label
          >
            {labels.viewDetails}
          </p>
        </div>
      </div>
    </article>
  );
}

function ContactDetail({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div>
      <dt
        className="text-[10px] uppercase tracking-[0.22em] !text-white/55"
        style={{color: 'rgba(255,255,255,0.55)'}}
        data-ui-label
      >
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function CredentialList({heading, items}: {heading: string; items: string[]}) {
  return (
    <div>
      <h3
        className="font-sans text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
        data-ui-label
      >
        {heading}
      </h3>
      <ul className="mt-4 divide-y divide-[var(--divider)] border-t border-[var(--divider)]">
        {items.map((item) => (
          <li key={item} className="py-3 text-sm leading-[1.7] text-[var(--text-body)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelCard({
  href,
  external = false,
  eyebrow,
  title,
  body,
  cta,
  image,
  imagePosition = 'center'
}: {
  href: string;
  external?: boolean;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  image: string;
  imagePosition?: 'top' | 'center';
}) {
  return (
    <a
      href={href}
      {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
      className="group relative isolate block w-[85vw] shrink-0 snap-start overflow-hidden text-white aspect-[5/4] md:w-auto md:aspect-[4/3] lg:aspect-[5/4]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        loading="lazy"
        className={cn(
          'absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]',
          imagePosition === 'top' && 'object-top'
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/15 transition-opacity duration-500 group-hover:opacity-90"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
        <p
          className="text-[10px] uppercase tracking-[0.32em] !text-white/70"
          style={{color: 'rgba(255,255,255,0.7)'}}
          data-ui-label
        >
          {eyebrow}
        </p>
        <p className="mt-3 font-display text-2xl leading-[1.1] !text-white md:text-3xl" style={{color: '#ffffff'}}>
          {title}
        </p>
        <p className="mt-2 max-w-xs text-sm !text-white/80" style={{color: 'rgba(255,255,255,0.8)'}}>
          {body}
        </p>
        <span
          className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] !text-white"
          style={{color: '#ffffff'}}
          data-ui-label
        >
          {cta}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-2 rtl:scale-x-[-1]"
          >
            →
          </span>
        </span>
      </div>
    </a>
  );
}

/** Monochrome star row; the rating is announced once via `label`. */
function StarRating({rating, label}: {rating: number; label: string}) {
  return (
    <div className="flex gap-1" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={cn('h-4 w-4', n <= rating ? 'fill-[var(--text-title)]' : 'fill-[var(--divider)]')}
          aria-hidden="true"
        >
          <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </div>
  );
}

/** Latest reels as a strip of 9:16 thumbnails, each linking to the reel on
 * Instagram. Renders nothing when the feed is unavailable. */
async function InstagramReels({locale}: {locale: Locale}) {
  const reels = await fetchLatestReels(6);
  if (reels.length === 0) return null;
  const t = await getTranslations({locale, namespace: 'Home.instagram'});
  return (
    <ul className="mt-10 grid grid-cols-3 gap-3 md:mt-12 md:grid-cols-6 md:gap-4">
      {reels.map((reel, i) => (
        <li key={reel.id}>
          <a
            href={reel.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('reelLabel', {number: i + 1})}
            className="group relative block aspect-[9/16] overflow-hidden bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Image
              src={reel.thumbnail}
              alt=""
              fill
              sizes="(min-width: 1280px) 180px, (min-width: 768px) 15vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <PlayGlyph size="sm" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One square media tile with its caption beneath. Portrait assets fill
 * the frame; landscape ones are matted on the dark tone; an item without
 * an image renders a typographic placard so nothing fabricated is shown. */
function MediaTile({
  item,
  kicker,
  title,
  body,
  alt,
  watchLabel
}: {
  item: MediaItem;
  kicker: string;
  title: string;
  body: string;
  alt: string;
  watchLabel: string;
}) {
  const frame = (
    <div className="relative aspect-square w-full overflow-hidden bg-[var(--bg-dark)]">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={alt}
          loading="lazy"
          className={cn(
            'absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]',
            item.fit === 'contain' ? 'object-contain p-3 sm:p-5' : 'object-cover object-top'
          )}
        />
      ) : (
        <p
          className="absolute inset-x-0 bottom-0 p-4 font-display text-lg leading-[1.15] !text-white sm:p-6 sm:text-2xl"
          style={{color: '#ffffff'}}
          aria-hidden="true"
        >
          {title}
        </p>
      )}
      {item.video && <PlayGlyph />}
    </div>
  );

  const caption = (
    <div className="mt-4 sm:mt-5">
      <p
        className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] sm:text-[11px] sm:tracking-[0.22em]"
        data-ui-label
      >
        {kicker}
      </p>
      <h3
        className={cn(
          'mt-2 font-display text-base leading-snug text-[var(--text-title)] sm:mt-3 sm:text-xl',
          item.href && 'group-hover:underline'
        )}
      >
        {title}
      </h3>
      {/* Too narrow a measure at half a phone screen; shown from sm up. */}
      <p className="mt-3 hidden text-sm leading-[1.7] text-[var(--text-body)] sm:block">{body}</p>
    </div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
        aria-label={`${watchLabel}: ${title}`}
      >
        {frame}
        {caption}
      </a>
    );
  }
  return (
    <article className="group">
      {frame}
      {caption}
    </article>
  );
}

type VideoData = {
  id: string;
  title: string;
  published: string;
  blurb?: string;
};

function formatLongDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function FeaturedVideoHero({video, locale}: {video: VideoData; locale: string}) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      aria-label={`Watch on YouTube: ${video.title}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/5"
        />
        <PlayGlyph size="lg" />
      </div>
      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/65" data-ui-label>
          <time dateTime={video.published}>{formatLongDate(video.published, locale)}</time>
        </p>
        <p className="mt-3 font-display text-2xl leading-snug text-white group-hover:underline md:text-3xl">
          {video.title}
        </p>
        {video.blurb && (
          <p className="mt-4 max-w-lg text-sm leading-[1.7] text-white/80 md:text-base">{video.blurb}</p>
        )}
      </div>
    </a>
  );
}

function StackedVideoCard({video, locale}: {video: VideoData; locale: string}) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4"
      aria-label={`Watch on YouTube: ${video.title}`}
    >
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden bg-white/5 md:w-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/0"
        />
        <PlayGlyph size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base leading-snug text-white group-hover:underline md:text-lg">
          {video.title}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/65" data-ui-label>
          <time dateTime={video.published}>{formatLongDate(video.published, locale)}</time>
        </p>
      </div>
    </a>
  );
}
