import {setRequestLocale, getTranslations} from 'next-intl/server';
import {cn} from '@/lib/utils';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {ProjectCard} from '@/components/projects/project-card';
import {PrivateCircleTrigger} from '@/components/private-circle/private-circle-trigger';
import {PlaceholderImage} from '@/components/home/placeholder-image';
import {ContactForm} from '@/components/home/contact-form';
import {ExpandableVideoList} from '@/components/home/expandable-video-list';
import {StickySocials} from '@/components/home/sticky-socials';
import {urlFor} from '@/lib/sanity/image';
import {
  getHomePage,
  getRecentPress,
  getCoverageStats,
  type TestimonialCard
} from '@/lib/sanity/queries';
import {
  FEATURED_LISTING_PLACEHOLDERS,
  CTA_CARDS,
  TESTIMONIAL_PLACEHOLDERS
} from '@/lib/home/placeholders';
import {fetchStudioListings, type StudioListingCard} from '@/lib/studio/properties';
import {routing, type Locale} from '@/lib/i18n/routing';

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

const POSTER = '/video/bg3.poster.jpg';
const VIDEO_AV1 = '/video/bg3.av1.webm';
const VIDEO_H264 = '/video/bg3.h264.mp4';

/**
 * Curated subset of property-tour videos from the @Dayan.Candamil
 * YouTube channel. IDs are public YouTube video IDs; thumbnails come
 * from i.ytimg.com (allowed in next.config.ts CSP + remotePatterns).
 * Edit this list when newer tours land — RSS feed at
 * /feeds/videos.xml?channel_id=UC6N6_LhTHubhvTFsDraO_xA.
 */
const FEATURED_VIDEOS: ReadonlyArray<{
  id: string;
  title: string;
  published: string;
  blurb?: string;
}> = [
  {
    id: 'gIE6rMgkfUM',
    title: 'Inside Meraas HQ — Exclusive Access',
    published: '2026-06-03',
    blurb:
      "A walkthrough of what's currently available across Meraas's Dubai portfolio, presented from inside their headquarters with the development team. The kind of access a brochure can't substitute for."
  },
  {
    id: 'Ts_3JFWGKoE',
    title: 'Ramhan Island by Eagle Hills',
    published: '2026-05-21'
  },
  {
    id: 'cIgil8feeVM',
    title: 'Four Seasons Private Residences, Saadiyat Island',
    published: '2026-05-08'
  },
  {
    id: 'Fc7rZRUo6OI',
    title: 'EYWA Residence Tour, Dubai',
    published: '2026-05-07'
  },
  {
    id: 'UZPayy9Nbko',
    title: 'Omoria, Dubai Islands',
    published: '2026-05-07'
  },
  {
    id: 'QezDyDXecO0',
    title: 'Yas Park Place by Aldar Properties',
    published: '2026-05-07'
  }
];

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, home, press, coverage, studioListings] = await Promise.all([
    getTranslations('Hero'),
    getHomePage(locale).catch(() => null),
    getRecentPress(locale, 3).catch(() => []),
    getCoverageStats().catch(() => ({emirates: 0, developers: 0, services: 0})),
    fetchStudioListings(locale, 7)
  ]);

  const headline = home?.heroHeadline ?? t('headline');
  const subhead = home?.heroSub ?? t('subhead');
  const primaryCta = home?.heroPrimaryCtaLabel ?? 'Explore Properties';
  const secondaryCta = home?.heroSecondaryCtaLabel ?? 'Early Access';
  const showVideo = (home?.heroBackgroundVideoMode ?? 'bg-video') === 'bg-video';
  const featuredProjects = home?.featuredProjects ?? [];
  const realTestimonials = home?.featuredTestimonials ?? [];
  const partners = home?.partnerLogos ?? [];

  // Listings precedence:
  //   1. Sanity `featuredProjects` if curated (editorial override),
  //   2. Studio API live feed (CRM source of truth),
  //   3. Placeholder cards (no API key in dev / first run).
  const useStudioListings = featuredProjects.length === 0 && studioListings.length > 0;
  const showListingsDummies = featuredProjects.length === 0 && studioListings.length === 0;
  const showTestimonialsDummies = realTestimonials.length === 0;
  const showPressDummies = press.length === 0;

  return (
    <>
      {/* 1. HERO — full-bleed, video covers viewport behind fixed nav */}
      <section
        id="hero"
        className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      >
        {showVideo ? (
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
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={POSTER} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        )}
        {/* Solid dark dim behind the whole hero — strong enough that pure
         * white text reads cleanly on any video frame without needing a
         * soft text-shadow halo (which was bleeding into the letters). */}
        <div
          className="absolute inset-0 -z-10 bg-black/65"
          aria-hidden="true"
        />
        <h1
          className="font-display text-3xl leading-[1.15] !text-white md:text-5xl lg:text-6xl"
          style={{color: '#ffffff'}}
        >
          {headline}
        </h1>
        <p
          className="mt-5 max-w-xl text-sm !text-white md:text-base lg:text-lg"
          style={{color: '#ffffff'}}
        >
          {subhead}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/projects"
            className="inline-flex h-[50px] items-center justify-center bg-white px-10 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--text-title)] transition-colors hover:bg-[var(--bg-alt)]"
            data-ui-label
          >
            {primaryCta}
          </Link>
          <PrivateCircleTrigger
            source="hero"
            variant="ghost"
            className="!h-[50px] border-white text-white hover:bg-white hover:text-[var(--text-title)] hover:border-white"
          >
            {secondaryCta}
          </PrivateCircleTrigger>
        </div>

      </section>

      {/* Sticky social column — stays right-edge through scroll, fades near footer */}
      <StickySocials />

      {/* 2. OVERVIEW STRIP — image | editorial | stats, split-color bg */}
      <section
        aria-label="Puerta Dubai at a glance"
        className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        {/* Left: full-bleed Dubai skyline */}
        <div className="relative min-h-[260px] bg-[var(--bg-alt)] md:min-h-[440px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dummy/dubai-skyline.jpg"
            alt="Burj Al Arab and Palm Jumeirah, Dubai"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Middle: cream — editorial intro */}
        <div className="flex items-center justify-center bg-[var(--bg-alt)] px-6 py-14 md:px-10 md:py-20 lg:px-16">
          <div className="md:max-w-md">
            <p
              className="text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
              data-ui-label
            >
              A private investment desk
            </p>
            <p className="mt-5 font-display text-2xl leading-[1.35] text-[var(--text-title)] md:text-3xl">
              Real estate, residency, banking, relocation.
              <span className="italic text-[var(--text-muted)]"> One desk. </span>
              Five emirates.
            </p>
            <span
              aria-hidden="true"
              className="mt-8 block h-px w-12 bg-[var(--divider)]"
            />
            <p className="mt-6 max-w-sm text-sm leading-[1.7] text-[var(--text-muted)]">
              A buyer-side concierge for global families entering the UAE —
              founder-led, small by design, deliberately limited in mandates.
            </p>
          </div>
        </div>

        {/* Right: white — coverage at a glance */}
        <div className="flex items-center justify-center bg-[var(--bg)] px-6 py-14 md:px-10 md:py-20 lg:px-16">
          <ul className="w-full max-w-sm space-y-7 md:space-y-9">
            <li className="flex items-baseline justify-between gap-6 border-b border-[var(--divider)] pb-5">
              <span className="font-display text-5xl leading-none text-[var(--text-title)] md:text-6xl">
                <bdi>{coverage.emirates || 5}</bdi>
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                data-ui-label
              >
                Emirates
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-6 border-b border-[var(--divider)] pb-5">
              <span className="font-display text-5xl leading-none text-[var(--text-title)] md:text-6xl">
                <bdi>{coverage.developers || 7}+</bdi>
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                data-ui-label
              >
                Developer partners
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-6">
              <span className="font-display text-5xl leading-none text-[var(--text-title)] md:text-6xl">
                <bdi>5</bdi>
              </span>
              <span
                className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                data-ui-label
              >
                Languages
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS — title cell + asymmetric photo grid */}
      <Section tone="dark">
        <Container>
          {useStudioListings ? (
            <StudioListingsGridWithTitleCell listings={studioListings} />
          ) : showListingsDummies ? (
            <PlaceholderListingsGridWithTitleCell />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <FeaturedListingsTitleCell />
              {featuredProjects.slice(0, 5).map((project) => (
                <div key={project._id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* 4. CTA ROW — image-backed editorial cards */}
      <section
        aria-label="Quick paths"
        className="grid bg-[var(--bg-dark)] md:grid-cols-3"
      >
        {/* Card 1: Priority Access — opens the Private Circle modal */}
        <PrivateCircleTrigger
          source="hero"
          variant="ghost"
          className="group relative isolate !block !h-auto overflow-hidden border-0 !p-0 !text-left text-white aspect-[5/4] md:aspect-[4/3] lg:aspect-[5/4]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dummy/mh/cta-01.jpg"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
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
              Private Circle
            </p>
            <p
              className="mt-3 font-display text-2xl leading-[1.1] !text-white md:text-3xl"
              style={{color: '#ffffff'}}
            >
              Get Priority Access
            </p>
            <p
              className="mt-2 max-w-xs text-sm !text-white/80"
              style={{color: 'rgba(255,255,255,0.8)'}}
            >
              By invitation. The desk takes a limited number of mandates each year.
            </p>
            <span
              className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] !text-white"
              style={{color: '#ffffff'}}
              data-ui-label
            >
              Request access
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-2"
              >
                →
              </span>
            </span>
          </div>
        </PrivateCircleTrigger>

        {/* Card 2: Luxury High-Rises */}
        <CtaImageCard
          href="/projects?status=ready"
          eyebrow="By property type"
          title="Luxury High-Rises"
          sublabel="Marina · Downtown · Creek"
          cta="Browse high-rises"
          image="/dummy/dubai-skyline.jpg"
        />

        {/* Card 3: Luxury Communities */}
        <CtaImageCard
          href="/areas"
          eyebrow="By community"
          title="Luxury Communities"
          sublabel="Saadiyat · Hills · Palm"
          cta="Browse communities"
          image="/dummy/mh/cta-05.jpg"
        />
      </section>

      {/* 5. ABOUT FOUNDER — tall portrait left + stacked content right */}
      <Section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-16">
            <div className="hidden lg:block">
              <div className="relative h-full min-h-[520px] w-full overflow-hidden bg-[var(--bg-alt)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dummy/founder.jpg"
                  alt="Dayan Candamil, founder of Puerta Dubai"
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
                  About
                </span>
                <span className="mt-2 block text-4xl leading-[1.05] md:text-6xl">
                  Dayan Candamil
                </span>
              </h2>
              <div className="mt-8 lg:hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--bg-alt)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/dummy/founder.jpg"
                    alt="Dayan Candamil, founder of Puerta Dubai"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-10 space-y-10">
                <div>
                  <h3 className="font-display text-xl text-[var(--text-title)] md:text-2xl">
                    A private gateway to the UAE.
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                    {home?.founderBlurb ??
                      'Puerta Dubai is a buyer-side investment concierge for global HNW families entering the UAE — real estate, business setup, banking, tax, Golden Visa and relocation handled under one desk. Founder-led, small by design, the desk takes a limited number of mandates each year so every relationship runs in person.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-xl text-[var(--text-title)] md:text-2xl">
                    Background that travels.
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                    Dayan&apos;s background spans law, branding and luxury cultural
                    ventures across Europe, Latin America and the Gulf. The desk
                    works in five languages and routinely coordinates with
                    international counsel, family offices and developer principals
                    on behalf of clients who do not live in the region full-time.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-xl text-[var(--text-title)] md:text-2xl">
                    One conversation, end-to-end.
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--text-body)]">
                    Sourcing off-plan and secondary inventory, due diligence,
                    payment plans, escrow, mortgage introductions, company
                    formation, residency, banking — the same point of contact
                    walks each step. No handoffs, no junior account managers.
                  </p>
                </div>
              </div>
              <Link
                href="/founder"
                className="mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--accent)] hover:underline"
                data-ui-label
              >
                Founder profile <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. EXPLORE THE DESK — dark band, centered title, 6 image cards */}
      <Section tone="dark" className="py-24 md:py-32">
        <Container>
          <div className="text-center">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] !text-white/70"
                style={{color: 'rgba(255,255,255,0.7)'}}
                data-ui-label
              >
                Explore the desk
              </span>
              <span
                className="mt-4 block text-4xl leading-[1] !text-white md:text-6xl lg:text-7xl"
                style={{color: '#ffffff'}}
              >
                Browse by what matters to you
              </span>
            </h2>
          </div>
          {/* Mahsheed-style brick grid: cards alternate tall (493×421) and
           * short (493×301). Greyscale at rest → full colour on hover. */}
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
            {CTA_CARDS.map((card, i) => {
              const isTall = i % 2 === 0;
              return (
                <li key={card.href}>
                  <Link
                    href={card.href}
                    className={cn(
                      'group relative block overflow-hidden text-white',
                      isTall ? 'aspect-[493/421]' : 'aspect-[493/301]'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt=""
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
                        {card.sublabel}
                      </p>
                      <p
                        className="mt-2 font-display text-2xl leading-[1.1] !text-white md:text-3xl"
                        style={{color: '#ffffff'}}
                      >
                        {card.label}
                      </p>
                      <span
                        className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] !text-white"
                        style={{color: '#ffffff'}}
                        data-ui-label
                      >
                        Browse
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* 8. TESTIMONIALS — Pinterest-style card mockup, refined */}
      <Section tone="alt" className="py-24 md:py-32">
        <Container>
          <div className="text-center">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]"
                data-ui-label
              >
                Testimonials
              </span>
              <span className="mt-4 block text-4xl leading-[1] text-[var(--text-title)] md:text-6xl lg:text-7xl">
                What investors say
              </span>
            </h2>
          </div>
          {showTestimonialsDummies ? (
            <ul className="mt-16 grid gap-8 md:grid-cols-3 md:mt-20">
              {TESTIMONIAL_PLACEHOLDERS.map((item, i) => (
                <li
                  key={item.id}
                  className="relative flex flex-col gap-6 rounded-xl bg-[var(--bg)] p-8 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] md:p-10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 left-6 font-display text-[88px] leading-[1] text-[var(--text-title)] opacity-15"
                  >
                    &ldquo;
                  </span>
                  <p className="relative pt-6 font-display text-lg italic leading-[1.5] text-[var(--text-title)] md:text-xl">
                    {item.quote}
                  </p>
                  <div className="mt-auto flex items-center gap-4 border-t border-[var(--divider)] pt-6">
                    <PlaceholderImage
                      seed={300 + i}
                      src={item.portrait}
                      aspect="aspect-square"
                      className="!h-14 !w-14 shrink-0 rounded-full"
                    />
                    <div>
                      <p className="font-display text-base text-[var(--text-title)]">
                        {item.attribution}
                      </p>
                      <p
                        className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                        data-ui-label
                      >
                        {item.role}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <TestimonialsCarousel items={realTestimonials} />
          )}
        </Container>
      </Section>

      {/* 9. FEATURED VIDEOS — dark band: writeup + 1 highlighted + 3-then-expand stack */}
      <Section tone="dark" className="py-24 md:py-32">
        <Container>
          {/* Writeup — title + description stacked, left-aligned */}
          <div className="max-w-2xl">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] !text-white/65"
                style={{color: 'rgba(255,255,255,0.65)'}}
                data-ui-label
              >
                Featured
              </span>
              <span
                className="mt-3 block text-4xl leading-[1] !text-white md:text-5xl lg:text-6xl"
                style={{color: '#ffffff'}}
              >
                Videos
              </span>
            </h2>
            <p
              className="mt-6 max-w-xl text-sm leading-[1.7] !text-white/80 md:mt-7 md:text-base"
              style={{color: 'rgba(255,255,255,0.8)'}}
            >
              Property tours and walkthroughs from across the UAE, presented in
              person by Dayan. Each visit gives a clearer sense of the listing —
              the building, the developer, the context — than a brochure ever
              could.
            </p>
          </div>

          {/* Highlighted + stacked */}
          <div className="mt-14 grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12 md:mt-16">
            {/* Highlighted video (large) */}
            <FeaturedVideoHero video={FEATURED_VIDEOS[0]} locale={locale} onDark />

            {/* 3 visible → expand to 5 secondaries */}
            <ExpandableVideoList initialCount={3}>
              {FEATURED_VIDEOS.slice(1, 6).map((video) => (
                <StackedVideoCard
                  key={video.id}
                  video={video}
                  locale={locale}
                  onDark
                />
              ))}
            </ExpandableVideoList>
          </div>

          {/* View all CTA */}
          <div className="mt-14 text-center md:mt-16">
            <a
              href="https://www.youtube.com/@Dayan.Candamil/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[50px] items-center justify-center border border-white px-10 text-[11px] uppercase tracking-[0.22em] !text-white transition-colors hover:bg-white hover:!text-[var(--text-title)]"
              style={{color: '#ffffff'}}
              data-ui-label
            >
              View all videos on YouTube
            </a>
          </div>
        </Container>
      </Section>

      {/* 10. IN THE MEDIA — light newsroom showcase, real press items */}
      <Section tone="alt" className="py-24 md:py-32">
        <Container>
          {/* Writeup */}
          <div className="max-w-2xl">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]"
                data-ui-label
              >
                In the
              </span>
              <span className="mt-3 block text-4xl leading-[1] text-[var(--text-title)] md:text-5xl lg:text-6xl">
                Media
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-[1.7] text-[var(--text-body)] md:mt-7 md:text-base">
              Selected appearances and coverage spanning real estate and design.
              Dayan is also the Creative Director of House of Candamil — a
              Bogotá-based atelier known for couture-quality accessories and
              ready-to-wear.
            </p>
          </div>

          {/* Press cards — Bazaar on left, MFW + Certificate stacked on right */}
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-12 md:mt-16">
            {/* Card 1: Harper's Bazaar Vietnam cover (left, tall) */}
            <article className="flex flex-col">
              <div className="relative aspect-[1000/1279] w-full overflow-hidden bg-[var(--bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dummy/press-bazaar-vn.jpg"
                  alt="Harper's Bazaar Vietnam cover, August 2021, featuring Dayan Candamil"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="mt-6">
                <p
                  className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                  data-ui-label
                >
                  Harper&apos;s Bazaar Vietnam
                  <span className="mx-2">·</span>
                  August 2021
                </p>
                <p className="mt-3 max-w-md text-sm leading-[1.7] text-[var(--text-body)] md:text-base">
                  Cover and feature profile of Dayan Candamil for the August
                  2021 issue, on the design ethos behind House of Candamil.
                </p>
              </div>
            </article>

            {/* Right column: MFW above Certificate */}
            <div className="flex flex-col gap-10 md:gap-12">
              {/* Card 2: Marrakech Fashion Week 2022 */}
              <a
                href="https://www.youtube.com/watch?v=b0JG-50XToQ"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col"
                aria-label="Watch House of Candamil at Marrakech Fashion Week 2022 on YouTube"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/dummy/press-mfw.jpg"
                    alt="House of Candamil runway at Marrakech Fashion Week 2022"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      aria-hidden="true"
                      className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-black/45 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="ms-1 h-5 w-5 fill-white md:h-6 md:w-6"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <p
                    className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    Marrakech Fashion Week
                    <span className="mx-2">·</span>
                    2022
                  </p>
                  <p className="mt-3 font-display text-xl leading-snug text-[var(--text-title)] group-hover:underline md:text-2xl">
                    House of Candamil — Runway show
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-[1.7] text-[var(--text-body)]">
                    Full runway presentation of the House of Candamil collection
                    at Marrakech Fashion Week 2022.
                  </p>
                </div>
              </a>

              {/* Card 3: Certificate of Achievement */}
              <article className="flex flex-col">
                <div className="relative aspect-[2816/1536] w-full overflow-hidden bg-[var(--bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/dummy/press-certificate.jpg"
                    alt="Certificate of Achievement: Top 1% Dubai Real Estate Professional 2024 awarded to Dayan Candamil"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6">
                  <p
                    className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    Industry recognition
                    <span className="mx-2">·</span>
                    2024
                  </p>
                  <p className="mt-3 font-display text-xl leading-snug text-[var(--text-title)] md:text-2xl">
                    Top 1% Dubai Real Estate Professional
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-[1.7] text-[var(--text-body)]">
                    Certificate of Achievement awarded to Dayan Candamil for
                    outstanding achievement in the Dubai real estate market.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </Container>
      </Section>

      {/* 11. LET'S CONNECT — image (left) + contact form (right) */}
      <section
        aria-label="Let's connect"
        className="grid bg-[var(--bg-dark)] md:grid-cols-2"
      >
        {/* Image — Dayan, full bleed left */}
        <div className="relative min-h-[420px] md:min-h-[640px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dummy/dayan-connect.jpg"
            alt="Dayan Candamil"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
        </div>

        {/* Form right */}
        <div className="flex items-center px-6 py-16 md:px-12 md:py-20 lg:px-20">
          <div className="w-full max-w-md">
            <h2 className="font-display">
              <span
                className="block text-sm uppercase tracking-[0.32em] !text-white/65"
                style={{color: 'rgba(255,255,255,0.65)'}}
                data-ui-label
              >
                Let&apos;s Connect
              </span>
              <span
                className="mt-3 block text-3xl leading-[1.05] !text-white md:text-5xl lg:text-6xl"
                style={{color: '#ffffff'}}
              >
                Contact the desk
              </span>
            </h2>
            <p
              className="mt-6 max-w-sm text-sm leading-[1.7] !text-white/75 md:text-base"
              style={{color: 'rgba(255,255,255,0.75)'}}
            >
              A short, no-commitment conversation about your move into the
              UAE. We respond within 48 hours, in your preferred language.
            </p>

            <div className="mt-10">
              <ContactForm locale={locale} onDark />
            </div>

            <dl className="mt-10 grid gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8">
              <div>
                <dt
                  className="text-[10px] uppercase tracking-[0.22em] !text-white/55"
                  style={{color: 'rgba(255,255,255,0.55)'}}
                  data-ui-label
                >
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href="mailto:hello@puertadubai.com"
                    className="!text-white hover:underline"
                    style={{color: '#ffffff'}}
                  >
                    hello@puertadubai.com
                  </a>
                </dd>
              </div>
              <div>
                <dt
                  className="text-[10px] uppercase tracking-[0.22em] !text-white/55"
                  style={{color: 'rgba(255,255,255,0.55)'}}
                  data-ui-label
                >
                  WhatsApp
                </dt>
                <dd className="mt-1">
                  <a
                    href="https://wa.me/971544402792"
                    className="!text-white hover:underline"
                    style={{color: '#ffffff'}}
                  >
                    <bdi>+971 54 440 2792</bdi>
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* PARTNERS — Sanity-driven, hidden if empty */}
      {partners.length > 0 && (
        <Section>
          <Container>
            <p
              className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
              data-ui-label
            >
              Developer partners
            </p>
            <ul className="mt-8 grid gap-px bg-[var(--divider)] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {partners.map((partner) => (
                <li
                  key={partner.slug}
                  className="flex h-24 items-center justify-center bg-[var(--bg)] p-6 text-center"
                >
                  {partner.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlFor(partner.logo).width(280).fit('max').url()}
                      alt={partner.name}
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-display text-lg text-[var(--text-title)]">
                      {partner.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* Legacy anchor IDs preserved for the HashHandler. */}
      <span id="dayan" className="block" aria-hidden="true" />
      <span id="about-puerta" className="block" aria-hidden="true" />
      <span id="golden-visa" className="block" aria-hidden="true" />
      <span id="partners-section" className="block" aria-hidden="true" />
      <span id="contact" className="block" aria-hidden="true" />
    </>
  );
}

const PRESS_PLACEHOLDERS = [
  {
    label: 'Announcement',
    title: 'Puerta Dubai launches a next-generation global platform for UAE investment.'
  },
  {
    label: 'Announcement',
    title: 'A new generation of global entrepreneurs is choosing Dubai.'
  },
  {
    label: 'Announcement',
    title: 'A fully integrated investment and relocation experience in the UAE.'
  }
];

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

function FeaturedVideoHero({
  video,
  locale,
  onDark = false
}: {
  video: VideoData;
  locale: string;
  onDark?: boolean;
}) {
  const dateColor = onDark ? 'text-white/65' : 'text-[var(--text-muted)]';
  const titleColor = onDark ? 'text-white' : 'text-[var(--text-title)]';
  const bodyColor = onDark ? 'text-white/80' : 'text-[var(--text-body)]';
  const imgBg = onDark ? 'bg-white/5' : 'bg-[var(--bg-alt)]';
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      aria-label={`Watch on YouTube: ${video.title}`}
    >
      <div className={cn('relative aspect-video w-full overflow-hidden', imgBg)}>
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-black/45 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20"
          >
            <svg
              viewBox="0 0 24 24"
              className="ms-1 h-6 w-6 fill-white md:h-8 md:w-8"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="mt-6">
        <p
          className={cn('text-[11px] uppercase tracking-[0.22em]', dateColor)}
          data-ui-label
        >
          <time dateTime={video.published}>
            {formatVideoDate(video.published, locale)}
          </time>
        </p>
        <p
          className={cn(
            'mt-3 font-display text-2xl leading-snug group-hover:underline md:text-3xl',
            titleColor
          )}
        >
          {video.title}
        </p>
        {video.blurb && (
          <p
            className={cn(
              'mt-4 max-w-lg text-sm leading-[1.7] md:text-base',
              bodyColor
            )}
          >
            {video.blurb}
          </p>
        )}
      </div>
    </a>
  );
}

function StackedVideoCard({
  video,
  locale,
  onDark = false
}: {
  video: VideoData;
  locale: string;
  onDark?: boolean;
}) {
  const titleColor = onDark ? 'text-white' : 'text-[var(--text-title)]';
  const dateColor = onDark ? 'text-white/65' : 'text-[var(--text-muted)]';
  const imgBg = onDark ? 'bg-white/5' : 'bg-[var(--bg-alt)]';
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4"
      aria-label={`Watch on YouTube: ${video.title}`}
    >
      <div
        className={cn(
          'relative aspect-video w-32 shrink-0 overflow-hidden md:w-40',
          imgBg
        )}
      >
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              className="ms-0.5 h-3 w-3 fill-white"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-display text-base leading-snug group-hover:underline md:text-lg',
            titleColor
          )}
        >
          {video.title}
        </p>
        <p
          className={cn(
            'mt-2 text-[10px] uppercase tracking-[0.22em]',
            dateColor
          )}
          data-ui-label
        >
          <time dateTime={video.published}>
            {formatVideoDate(video.published, locale)}
          </time>
        </p>
      </div>
    </a>
  );
}

function CtaImageCard({
  href,
  eyebrow,
  title,
  sublabel,
  cta,
  image
}: {
  href: string;
  eyebrow: string;
  title: string;
  sublabel: string;
  cta: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group relative isolate block overflow-hidden text-white aspect-[5/4] md:aspect-[4/3] lg:aspect-[5/4]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
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
        <p
          className="mt-3 font-display text-2xl leading-[1.1] !text-white md:text-3xl"
          style={{color: '#ffffff'}}
        >
          {title}
        </p>
        <p
          className="mt-2 max-w-xs text-sm !text-white/80"
          style={{color: 'rgba(255,255,255,0.8)'}}
        >
          {sublabel}
        </p>
        <span
          className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] !text-white"
          style={{color: '#ffffff'}}
          data-ui-label
        >
          {cta}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-2"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function TestimonialsCarousel({items}: {items: TestimonialCard[]}) {
  return (
    <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 6).map((item) => (
        <li
          key={item._id}
          className="flex flex-col gap-4 border border-[var(--divider)] bg-[var(--bg)] p-8"
        >
          <p className="font-display text-lg italic text-[var(--text-title)]">
            “{item.quote}”
          </p>
          <div className="mt-auto flex items-center gap-3">
            {item.portrait && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlFor(item.portrait).width(96).height(96).fit('crop').url()}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-medium text-[var(--text-title)]">
                {renderAttribution(item)}
              </p>
              {item.attributionRole && (
                <p className="text-xs text-[var(--text-muted)]">
                  {item.attributionRole}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function renderAttribution(t: TestimonialCard): string {
  const name = t.attributionName?.trim() ?? '';
  if (!name) return '';
  if (t.attributionConsentScope === 'full-name') return name;
  if (t.attributionConsentScope === 'first-name-last-initial') {
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }
  return name
    .split(/\s+/)
    .map((p) => `${p[0]}.`)
    .join(' ');
}

/**
 * Reusable title cell that lives inside the featured-listings grid as its
 * own first card — matches Mahsheed's pattern where the section title sits
 * flush with the listing cards rather than floating above them.
 */
function FeaturedListingsTitleCell() {
  return (
    <div className="flex flex-col items-start justify-center gap-8 py-8">
      <h2 className="font-display">
        <span
          className="block text-sm uppercase tracking-[0.24em] !text-white/75"
          style={{color: 'rgba(255,255,255,0.75)'}}
          data-ui-label
        >
          Featured
        </span>
        <span
          className="mt-3 block text-5xl leading-[1] !text-white md:text-6xl lg:text-7xl"
          style={{color: '#ffffff'}}
        >
          Listings
        </span>
      </h2>
      <span aria-hidden="true" className="block h-px w-12 bg-white/40" />
      <Link
        href="/projects"
        className="inline-flex h-[45px] items-center justify-center border border-white px-8 text-[11px] uppercase tracking-[0.22em] !text-white transition-colors hover:bg-white hover:!text-[var(--text-title)]"
        style={{color: '#ffffff'}}
        data-ui-label
      >
        View all
      </Link>
    </div>
  );
}

function StudioListingsGridWithTitleCell({listings}: {listings: StudioListingCard[]}) {
  // Title cell + up to 5 listing cards in a 3-col grid (1 + 5 = 6 cells).
  // Landscape image aspect (~7:5) matches the Mahsheed listings rhythm.
  const cards = listings.slice(0, 5);
  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      <FeaturedListingsTitleCell />
      {cards.map((listing) => (
        <StudioListingCardView
          key={listing.id}
          listing={listing}
          aspect="aspect-[7/5]"
          size="small"
          onDark
        />
      ))}
    </div>
  );
}

function PlaceholderListingsGridWithTitleCell() {
  const cards = FEATURED_LISTING_PLACEHOLDERS.slice(0, 5);
  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      <FeaturedListingsTitleCell />
      {cards.map((listing, i) => (
        <PlaceholderListingCard
          key={listing.id}
          listing={listing}
          seed={100 + i}
          aspect="aspect-[7/5]"
          size="small"
          onDark
        />
      ))}
    </div>
  );
}

function StudioListingCardView({
  listing,
  aspect,
  onDark = false
}: {
  listing: StudioListingCard;
  aspect: string;
  size?: 'large' | 'small';
  onDark?: boolean;
}) {
  // Mahsheed-style caption: clean photo on top, structured caption below.
  // Left column = address + city + specs; right column = price + CTA.
  const titleColor = onDark ? 'text-white' : 'text-[var(--text-title)]';
  const subColor = onDark ? 'text-white/65' : 'text-[var(--text-muted)]';
  const specColor = onDark ? 'text-white/85' : 'text-[var(--text-body)]';
  const ctaColor = onDark ? 'text-white/65 group-hover:text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]';

  return (
    <article className="group flex flex-col gap-5">
      <div className={cn('relative w-full overflow-hidden bg-[var(--bg-alt)]', aspect)}>
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
        {/* Subtle dark veil that intensifies on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={cn('font-display text-lg leading-snug md:text-xl', titleColor)}>
            {listing.title}
          </p>
          <p
            className={cn(
              'mt-1 text-[11px] uppercase tracking-[0.18em]',
              subColor
            )}
            data-ui-label
          >
            {listing.area}
            <span className="mx-1">·</span>
            {listing.emirate}
          </p>
          <p className={cn('mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]', specColor)}>
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
        </div>
        <div className="shrink-0 text-end">
          <p className={cn('font-display text-lg leading-snug md:text-xl', titleColor)}>
            <bdi>{listing.priceFrom}</bdi>
          </p>
          <p
            className={cn(
              'mt-1 text-[10px] uppercase tracking-[0.22em] transition-colors duration-200',
              ctaColor
            )}
            data-ui-label
          >
            View details
          </p>
        </div>
      </div>
    </article>
  );
}

type ListingPlaceholder = (typeof FEATURED_LISTING_PLACEHOLDERS)[number];

function PlaceholderListingCard({
  listing,
  seed,
  aspect,
  onDark = false
}: {
  listing: ListingPlaceholder;
  seed: number;
  aspect: string;
  size?: 'large' | 'small';
  onDark?: boolean;
}) {
  const titleColor = onDark ? 'text-white' : 'text-[var(--text-title)]';
  const subColor = onDark ? 'text-white/65' : 'text-[var(--text-muted)]';
  const ctaColor = onDark
    ? 'text-white/65 group-hover:text-white'
    : 'text-[var(--text-muted)] group-hover:text-[var(--accent)]';

  return (
    <article className="group flex flex-col gap-5">
      <div className={cn('relative w-full overflow-hidden', aspect)}>
        <PlaceholderImage seed={seed} src={listing.image} aspect={aspect} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20"
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={cn('font-display text-lg leading-snug md:text-xl', titleColor)}>
            {listing.title}
          </p>
          <p
            className={cn(
              'mt-1 text-[11px] uppercase tracking-[0.18em]',
              subColor
            )}
            data-ui-label
          >
            {listing.area}
            <span className="mx-1">·</span>
            {listing.emirate}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <p className={cn('font-display text-lg leading-snug md:text-xl', titleColor)}>
            From <bdi>{listing.priceFrom}</bdi>
          </p>
          <p
            className={cn(
              'mt-1 text-[10px] uppercase tracking-[0.22em] transition-colors duration-200',
              ctaColor
            )}
            data-ui-label
          >
            View details
          </p>
        </div>
      </div>
    </article>
  );
}
