import type {Metadata} from 'next';
import {The_Nautigal} from 'next/font/google';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {SwipeRail} from '@/components/home/swipe-rail';
import {routing, type Locale} from '@/lib/i18n/routing';
import {clip, pageMetadata} from '@/lib/site/seo';
import {LINKS, PORTRAITS} from '@/lib/home/content';

/**
 * The Nautigal is reserved for the Founder signature (AGENTS.md, Brand
 * discipline), so it is loaded here, on the one page that signs off, rather
 * than in the layout. It has no Arabic glyphs: when `ar` is routed, render
 * the signature in the display face there instead.
 */
const nautigal = The_Nautigal({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap'
});

/** Story paragraphs in `Home.atelier.p<N>`, Dayan's own words (first person). */
const LEDE = ['1', '2'] as const;
const STORY = ['3', '4'] as const;
const RECOGNITION = ['5', '6'] as const;
const PROCESS = ['1', '2', '3'] as const;
const NUMERALS = ['I', 'II', 'III'] as const;
const RANGE = ['1', '2', '3', '4'] as const;
const MILESTONES = ['1', '2', '3', '4', '5'] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Home.atelier'});
  return pageMetadata({
    locale,
    path: '/house-of-candamil',
    title: t('heading'),
    description: clip(`${t('tagline')} ${t('p5')}`),
    image: '/images/house-of-candamil/hero.jpg'
  });
}

/**
 * House of Candamil — the full founder's letter behind the home page's
 * Atelier section. Copy is Dayan's text verbatim (`Home.atelier`); the
 * page-only labels in `AtelierPage` restate facts from that text and add
 * nothing new (see Anti-fabrication in AGENTS.md).
 */
export default async function HouseOfCandamilPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, tPage] = await Promise.all([
    getTranslations({locale, namespace: 'Home.atelier'}),
    getTranslations({locale, namespace: 'AtelierPage'})
  ]);

  // Global `h1–h6` rules are unlayered and beat utilities, so a heading's
  // label styling goes on an inner span (same pattern as the home page).
  const labelClass = 'text-[11px] uppercase tracking-[0.32em] text-[var(--text-muted)]';
  const bodyClass = 'text-base leading-[1.7] text-[var(--text-body)] md:text-[17px]';

  // The masthead breaks before the last word on phones ("House of" / "Candamil").
  const heading = t('heading');
  const split = heading.lastIndexOf(' ');
  const mastheadLead = split > 0 ? heading.slice(0, split) : heading;
  const mastheadLast = split > 0 ? heading.slice(split + 1) : '';

  return (
    <>
      {/* 1. Hero — a cover in the language of the House of Candamil campaign:
       * the studio-grey backdrop becomes the page, the name is set as a
       * tracked masthead, and Dayan stands in front of it.
       *
       * Three layers share one frame: the full photo (backdrop included), the
       * masthead, then a cut-out of the same photo on top, so her hair
       * overlaps the lower edge of the letters. Both images are cropped so
       * the crown of her hair sits on the frame's top edge; the frame's top
       * is then placed from the masthead's own size (`--mast`), which keeps
       * the overlap identical at every viewport height. */}
      <section
        className={[
          'relative isolate overflow-hidden',
          'h-[calc(100svh-4rem)] min-h-[600px] max-h-[1040px]',
          // Masthead size, its top, and where the photo frame starts. Phones
          // stack the name on two lines, so the frame starts under line two.
          '[--mast:14.5vw] [--mast-top:7vw] [--frame-top:calc(var(--mast-top)+var(--mast)*1.46)]',
          'md:[--mast:7.4vw] md:[--mast-top:2.4vw] md:[--frame-top:calc(var(--mast-top)+var(--mast)*0.66)]'
        ].join(' ')}
        // Sampled from the photo's backdrop (≈ #929292 at the top, #9a9a9a at the foot).
        style={{background: 'linear-gradient(180deg, #929292 0%, #969696 50%, #9a9a9a 100%)'}}
      >
        {/* Layer 1 — the photograph, edges feathered into the backdrop */}
        <div className="hoc-rise absolute inset-x-0 bottom-0 top-[var(--frame-top)] flex justify-center">
          <div className="relative aspect-[1200/1764] h-full shrink-0 [mask-image:linear-gradient(90deg,transparent,#000_17%,#000_83%,transparent)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/house-of-candamil/hero.jpg"
              alt={tPage('portraitAlt')}
              width={1200}
              height={1764}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Layer 2 — the masthead (the page's h1) */}
        <h1 className="absolute inset-x-0 top-[var(--mast-top)] z-10 text-center">
          <span
            className="hoc-track block font-display text-[length:var(--mast)] uppercase leading-[0.9]"
            style={{color: '#ffffff', letterSpacing: '0.1em', textIndent: '0.1em'}}
          >
            <span className="block md:inline">{mastheadLead}</span>{' '}
            <span className="block md:inline">{mastheadLast}</span>
          </span>
        </h1>

        {/* Layer 3 — the same frame again as a cut-out, in front of the name */}
        <div
          aria-hidden="true"
          className="hoc-rise pointer-events-none absolute inset-x-0 bottom-0 top-[var(--frame-top)] z-20 flex justify-center"
        >
          <div className="relative aspect-[1200/1764] h-full shrink-0 [mask-image:linear-gradient(90deg,transparent,#000_17%,#000_83%,transparent)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/house-of-candamil/hero-cutout.webp"
              alt=""
              width={1200}
              height={1764}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Layer 4 — cover lines. Below lg they sit on her black dress, so
         * they turn white over a soft shade; from lg they sit on the grey. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-30 h-2/5 bg-gradient-to-t from-black/60 to-transparent lg:hidden"
        />
        <div className="absolute inset-x-0 bottom-0 z-40 pb-8 md:pb-10">
          <Container className="flex items-end justify-between gap-8">
            <div className="hoc-fade max-w-[19rem] text-white lg:max-w-[17rem] lg:text-[var(--text-title)] xl:max-w-[20rem]">
              <p className="text-[11px] uppercase tracking-[0.32em] opacity-80" data-ui-label>
                {t('eyebrow')}
              </p>
              <p className="mt-3 font-display text-xl italic leading-[1.35] md:text-2xl">
                {t('tagline')}
              </p>
            </div>
            <p
              className="hoc-fade hidden shrink-0 text-[11px] uppercase tracking-[0.32em] text-white sm:block lg:text-[var(--text-title)]"
              data-ui-label
            >
              {tPage('heroPlaces')}
            </p>
            {/* Phones: where the places line would sit, a quiet scroll cue —
             * a hairline with a light running down it. */}
            <span aria-hidden="true" className="hoc-fade relative mb-1 block h-14 w-px shrink-0 overflow-hidden bg-white/30 sm:hidden">
              <span className="hoc-cue absolute inset-x-0 top-0 h-1/2 bg-white" />
            </span>
          </Container>
        </div>
      </section>

      {/* Phones: a reading-progress hairline under the fixed header, driven
       * by the page's scroll position in CSS alone (see `.hoc-progress`). */}
      <div aria-hidden="true" className="hoc-progress pointer-events-none fixed inset-x-0 top-16 z-40 h-[2px] bg-[var(--text-title)] md:hidden" />

      {/* 2. Lede — the opening two paragraphs, set large */}
      <Section className="pt-14 pb-14 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="hoc-reveal font-display text-[1.7rem] leading-[1.35] text-[var(--text-title)] md:text-[2.15rem]">
              {t(`p${LEDE[0]}`)}
            </p>
            <p className="hoc-reveal mt-6 max-w-2xl text-lg leading-[1.7] text-[var(--text-body)] md:mt-8 md:text-xl">
              {t(`p${LEDE[1]}`)}
            </p>
          </div>
        </Container>
      </Section>

      {/* 3. Story — from lg the pull quote is held (sticky) beside the two long
       * paragraphs. Below lg the quote moves between them, where it is said,
       * set as a centred statement between hairlines; the paragraphs' wrapper
       * dissolves (`contents`) so all three can be ordered in one column. */}
      <Section className="pt-0 pb-14 md:pt-0 md:pb-28">
        <Container>
          <div className="flex flex-col gap-10 border-t border-[var(--divider)] pt-12 md:pt-20 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div className="order-2 lg:order-none">
              <blockquote className="hoc-reveal border-y border-[var(--divider)] py-10 text-center lg:sticky lg:top-28 lg:border-0 lg:py-0 lg:text-start">
                <span aria-hidden="true" className="hidden font-display text-7xl leading-[0.6] text-[var(--divider)] md:text-8xl lg:block">
                  “
                </span>
                <p className="font-display text-[2rem] italic leading-[1.2] text-[var(--text-title)] md:text-5xl lg:mt-2">
                  {tPage('pullQuote')}
                </p>
              </blockquote>
            </div>
            <div className="contents lg:block lg:max-w-xl lg:space-y-6">
              {STORY.map((n, i) => (
                <p
                  key={n}
                  className={[
                    bodyClass,
                    'hoc-reveal',
                    i === 0 ? 'order-1 lg:order-none' : 'order-3 lg:order-none',
                    // Phones open the chapter with a drop cap.
                    i === 0 &&
                      'max-lg:first-letter:float-start max-lg:first-letter:me-3 max-lg:first-letter:mt-1.5 max-lg:first-letter:font-display max-lg:first-letter:text-[3.6rem] max-lg:first-letter:leading-[0.8] max-lg:first-letter:text-[var(--text-title)]'
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {t(`p${n}`)}
                </p>
              ))}
            </div>
          </div>

          {/* The range — handbags first, then what it grew into (from p4) */}
          <div className="mt-14 md:mt-28">
            <h2>
              <span className={`${labelClass} block font-sans`} data-ui-label>
                {tPage('rangeHeading')}
              </span>
            </h2>
            <div className="hoc-reveal mt-6 grid border-y border-[var(--divider)] md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
              <div className="border-b border-[var(--divider)] py-6 md:border-e md:border-b-0 md:py-10 md:pe-10">
                <p className={labelClass} data-ui-label>
                  {tPage('rangeBeganLabel')}
                </p>
                <p className="mt-3 font-display text-3xl text-[var(--text-title)] md:text-4xl">
                  {tPage('rangeBegan')}
                </p>
              </div>
              <div className="py-6 md:py-10 md:ps-10">
                <p className={labelClass} data-ui-label>
                  {tPage('rangeTodayLabel')}
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 font-display text-3xl text-[var(--text-title)] md:text-4xl lg:flex lg:flex-wrap lg:items-baseline lg:gap-x-7">
                  {RANGE.map((n, i) => (
                    <li key={n} className="flex items-baseline gap-x-5 lg:gap-x-7">
                      {i > 0 && (
                        <span aria-hidden="true" className="hidden text-xl text-[var(--text-muted)] lg:inline">
                          ·
                        </span>
                      )}
                      {tPage(`range${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. Recognition — from lg, the prose beside the milestones it names
       * as a ledger. Below lg the milestones lead, as a grid of fact tiles
       * (the long first one spanning both columns), and the prose follows. */}
      <Section tone="alt" className="py-14 md:py-28">
        <Container>
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-20">
            <div className="contents lg:block">
              <h2 className="order-1 lg:order-none">
                <span className={`${labelClass} block font-sans`} data-ui-label>
                  {tPage('recognitionEyebrow')}
                </span>
              </h2>
              <div className="order-3 max-w-xl space-y-6 lg:order-none lg:mt-6">
                {RECOGNITION.map((n) => (
                  <p key={n} className={`${bodyClass} hoc-reveal`}>
                    {t(`p${n}`)}
                  </p>
                ))}
              </div>
            </div>
            <ol className="hoc-reveal order-2 -mt-4 grid grid-cols-2 gap-x-6 border-t border-[var(--text-title)]/15 md:block lg:order-none lg:mt-0">
              {MILESTONES.map((n) => (
                <li
                  key={n}
                  className="border-b border-[var(--text-title)]/15 py-5 first:col-span-2 md:grid md:grid-cols-[9rem_minmax(0,1fr)] md:items-baseline md:gap-4 md:py-6"
                >
                  <span className="block text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]" data-ui-label>
                    {tPage(`m${n}Label`)}
                  </span>
                  <span className="mt-2 block font-display text-[1.3rem] leading-[1.25] text-[var(--text-title)] md:mt-0 md:text-2xl">
                    {tPage(`m${n}Title`)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* 5. Process — Materials → Journey → Destination, on the dark band.
       * Phones get a swipe rail of cards (next one peeking, progress line and
       * "01 / 03" counter); from md the three sit side by side as before. */}
      <Section tone="dark" className="py-14 md:py-28">
        <Container>
          <h2>
            <span className="block font-sans text-[11px] uppercase tracking-[0.32em]" style={{color: 'rgba(255,255,255,0.6)'}} data-ui-label>
              {tPage('processEyebrow')}
            </span>
          </h2>
          <SwipeRail
            as="ul"
            tone="dark"
            wrapperClassName="mt-8 md:mt-12"
            className="md:grid md:grid-cols-3 md:gap-10 lg:gap-16"
          >
            {PROCESS.map((n, i) => (
              <li
                key={n}
                className="relative overflow-hidden border border-white/15 bg-white/[0.03] p-6 pt-7 md:overflow-visible md:border-0 md:border-t md:border-white/20 md:bg-transparent md:p-0 md:pt-8"
              >
                <span aria-hidden="true" className="absolute -top-px start-0 h-px w-12 bg-white" />
                {/* Phones: the step number as a large watermark in the card's corner. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-1 -bottom-5 font-display text-[7.5rem] leading-none tracking-[-0.02em] md:hidden"
                  style={{color: 'rgba(255,255,255,0.06)'}}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="block font-display text-sm tracking-[0.2em]" style={{color: 'rgba(255,255,255,0.5)'}}>
                  {NUMERALS[i]}
                </span>
                <h3 className="mt-4 font-display text-2xl md:text-3xl" style={{color: '#ffffff'}}>
                  {t(`h${n}`)}
                </h3>
                <p className="relative mt-4 text-[15px] leading-[1.7] md:text-base" style={{color: 'rgba(255,255,255,0.75)'}}>
                  {t(`body${n}`)}
                </p>
              </li>
            ))}
          </SwipeRail>
        </Container>
      </Section>

      {/* 6. Sign-off — the closing lines, signed, beside the atelier cut-out */}
      <Section className="pt-14 pb-0 md:pt-28">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div className="max-w-xl lg:pb-28">
              <p className="hoc-reveal font-display text-[1.6rem] leading-[1.45] text-[var(--text-title)] md:text-3xl">
                {t('outro')}
              </p>
              <p className="hoc-reveal mt-8 font-display text-2xl italic text-[var(--text-muted)] md:text-3xl">
                {t('closing')}
              </p>
              <p
                className={`${nautigal.className} hoc-reveal mt-4 text-[4.2rem] leading-none text-[var(--text-title)] md:mt-6 md:text-7xl`}
                lang="en"
              >
                {tPage('signature')}
              </p>
              {/* Phones: two full-width, thumb-sized buttons; from md the
               * primary button sits beside an underlined text link. */}
              <div className="mt-10 grid gap-3 md:mt-12 md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-5">
                <a
                  href={LINKS.houseOfCandamil}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[var(--text-title)] px-7 py-[1.15rem] text-[11px] uppercase tracking-[0.22em] !text-white transition-opacity hover:opacity-85 md:py-4"
                  style={{color: '#ffffff'}}
                  data-ui-label
                >
                  {t('cta')}
                </a>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 border border-[var(--text-title)] py-[1.1rem] text-[11px] uppercase tracking-[0.22em] text-[var(--text-title)] transition-colors hover:border-[var(--text-title)] md:justify-start md:border-0 md:border-b md:border-[var(--text-title)]/40 md:py-0 md:pb-1"
                  data-ui-label
                >
                  {tPage('contactCta')}{' '}
                  <span aria-hidden="true" className="rtl:scale-x-[-1]">
                    →
                  </span>
                </Link>
              </div>
            </div>
            {/* Native size is 408×612; never render it wider than that. */}
            <div className="mx-auto mt-6 w-full max-w-[280px] md:mt-10 md:max-w-[340px] lg:mx-0 lg:mt-0 lg:w-[408px] lg:max-w-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PORTRAITS.atelier}
                alt={t('imageAlt')}
                width={408}
                height={612}
                className="block h-auto w-full"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
