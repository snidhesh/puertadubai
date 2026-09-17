import {Suspense} from 'react';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {cn} from '@/lib/utils';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {ContactForm} from '@/components/home/contact-form';
import {ExpandableVideoList} from '@/components/home/expandable-video-list';
import {StickySocials} from '@/components/home/sticky-socials';
import {
  CAREER_IDS,
  ENDORSEMENT_IDS,
  EXPERTISE,
  FEATURED_VIDEOS,
  LINKS,
  MEDIA,
  PORTRAITS
} from '@/lib/home/content';
import {DAYAN_AGENT, fetchAgentListings, type StudioListingCard} from '@/lib/studio/properties';
import {MediaCarousel} from '@/components/home/media-carousel';
import {PlayGlyph} from '@/components/home/play-glyph';
import {getDirection, routing, type Locale} from '@/lib/i18n/routing';

// Featured listings come from the BlackOak Studio CRM feed; ISR every 5 min.
export const revalidate = 300;
// The agent feed walk downloads the whole CRM feed (~37 MB). Give ISR
// regeneration room beyond the platform default so it is not cut off.
export const maxDuration = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

const POSTER = '/video/bg3.poster.jpg';
const VIDEO_AV1 = '/video/bg3.av1.webm';
const VIDEO_H264 = '/video/bg3.h264.mp4';

/**
 * Single-page portfolio. Section order and anchor ids:
 *   #hero → overview → #listings → panels → #about → #expertise →
 *   #experience → endorsements → videos → #atelier → #media → #contact
 * The nav (About · Expertise · Experience · Listings · House of
 * Candamil · Media · Contact) links to these anchors.
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
          <div className="grid gap-12 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-16">
            <div className="hidden lg:block">
              <div className="relative h-full min-h-[520px] w-full overflow-hidden bg-[var(--bg-alt)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PORTRAITS.about}
                  alt={tHome('about.imageAlt')}
                  className="absolute inset-0 h-full w-full object-cover object-top"
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
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-alt)]">
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
          {/* Brick grid: tiles alternate tall / short. Greyscale at rest → colour on hover. */}
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
            {EXPERTISE.map((tile, i) => {
              const isTall = i % 2 === 0;
              return (
                <li
                  key={tile.id}
                  className={cn(
                    'group relative block overflow-hidden text-white',
                    isTall ? 'aspect-[493/421]' : 'aspect-[493/301]'
                  )}
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
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10 transition-opacity duration-500 group-hover:from-black/75"
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
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* 7. CAREER TIMELINE */}
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
          <ol className="mt-12 space-y-10 md:space-y-12">
            {CAREER_IDS.map((id) => (
              <li
                key={id}
                className="grid gap-4 border-s-2 border-[var(--divider)] ps-6 md:grid-cols-12 md:gap-8 md:ps-8"
              >
                <div className="md:col-span-3">
                  <p className="font-display text-xl text-[var(--text-title)]">
                    <bdi>{tHome(`career.items.${id}.years`)}</bdi>
                  </p>
                </div>
                <div className="md:col-span-9">
                  <p className="font-display text-lg text-[var(--text-title)]">
                    {tHome(`career.items.${id}.company`)}
                  </p>
                  <p
                    className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {tHome(`career.items.${id}.role`)}
                  </p>
                  <p className="mt-3 max-w-2xl text-base leading-[1.7] text-[var(--text-body)]">
                    {tHome(`career.items.${id}.summary`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 8. ENDORSEMENTS — light-grey, 3 quote cards */}
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

      {/* 9. FEATURED VIDEOS — dark band: writeup + 1 highlighted + 3-then-expand stack */}
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

      {/* 10. HOUSE OF CANDAMIL — copy left, image right */}
      <Section id="atelier" className="scroll-mt-16 py-24 md:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-16">
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
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-alt)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PORTRAITS.atelier}
                    alt={tHome('atelier.imageAlt')}
                    className="absolute inset-0 h-full w-full object-cover object-top"
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
              <div className="relative h-full min-h-[520px] w-full overflow-hidden bg-[var(--bg-alt)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PORTRAITS.atelier}
                  alt={tHome('atelier.imageAlt')}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 11. MEDIA & HONOURS — light newsroom grid + 3-column credentials */}
      {/* overflow-x-clip: the fanned cards may extend past the viewport on
       * small screens; clip them there without creating a horizontal scroll. */}
      <Section id="media" tone="alt" className="scroll-mt-16 overflow-x-clip py-24 md:py-32">
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

          {/* Fanned card deck — the centre story upright, the rest rotated
           * away on either side; click, drag or use the arrows. */}
          <div className="mt-6 md:mt-14 lg:mt-20">
            <MediaCarousel
              dir={getDirection(locale)}
              slides={MEDIA.map((item) => ({
                id: item.id,
                image: item.image,
                fit: item.fit,
                href: item.href,
                video: item.video,
                kicker: tHome(`media.items.${item.id}.kicker`),
                title: tHome(`media.items.${item.id}.title`),
                body: tHome(`media.items.${item.id}.body`),
                alt: tHome(`media.items.${item.id}.alt`)
              }))}
            />
          </div>

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

      {/* 12. CONTACT — same composition as the original Let's Connect band:
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

type VideoData = {
  id: string;
  title: string;
  published: string;
  blurb?: string;
};

function formatVideoDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
          <time dateTime={video.published}>{formatVideoDate(video.published, locale)}</time>
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
          <time dateTime={video.published}>{formatVideoDate(video.published, locale)}</time>
        </p>
      </div>
    </a>
  );
}
