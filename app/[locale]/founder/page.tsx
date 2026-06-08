import type {Metadata} from 'next';
import Image from 'next/image';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {PrivateCircleTrigger} from '@/components/private-circle/private-circle-trigger';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Founder'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

const journey = [1, 2, 3, 4, 5, 6, 7] as const;
const press = [
  {
    n: 1,
    src: '/dummy/press-bazaar-vn.jpg',
    fit: 'object-cover'
  },
  {
    n: 2,
    src: '/dummy/press-mfw.jpg',
    fit: 'object-contain'
  },
  {
    n: 3,
    src: '/dummy/press-certificate.jpg',
    fit: 'object-contain'
  }
] as const;

export default async function FounderPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Founder'});

  return (
    <>
      {/* 1. Hero — portrait + intro */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[var(--bg-alt)]">
                <Image
                  src="/dummy/founder.jpg"
                  alt="Dayan Candamil"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <p
                className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                data-ui-label
              >
                {t('eyebrow')}
              </p>
              <h1 className="mt-4 font-display text-4xl text-[var(--text-title)] md:text-6xl">
                Dayan Candamil
              </h1>
              <p className="mt-3 font-display text-xl italic text-[var(--text-muted)] md:text-2xl">
                {t('role')}
              </p>
              <div className="mt-8 max-w-2xl space-y-6 text-base text-[var(--text-body)] md:text-lg">
                <p>{t('bio1')}</p>
                <p>{t('bio2')}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Positioning band — full-bleed dark.
       * relative+overflow-hidden goes on the Section so <Image fill> covers
       * the full padded band (including the top/bottom Section padding),
       * not just an inner wrapper. */}
      <Section tone="dark" className="relative overflow-hidden">
        <Image
          src="/dummy/dubai-skyline.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <Container className="relative text-center">
          <p className="mx-auto max-w-4xl font-display text-3xl text-[var(--text-on-dark)] md:text-5xl">
            {t.rich('positioningQuote', {
              n: (chunks) => <bdi>{chunks}</bdi>
            })}
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-base text-[var(--text-on-dark)] opacity-80 md:text-lg">
            {t('positioningBody')}
          </p>
        </Container>
      </Section>

      {/* 3. Cross-border strategist — text + secondary photo */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7 lg:order-1">
              <h2 className="font-display text-2xl text-[var(--text-title)] md:text-3xl">
                {t('strategistHeading')}
              </h2>
              <p className="mt-6 max-w-2xl text-base text-[var(--text-body)] md:text-lg">
                {t('strategistBody')}
              </p>
            </div>
            <div className="lg:col-span-5 lg:order-2">
              <div className="relative aspect-[5/4] overflow-hidden rounded-sm bg-[var(--bg-alt)]">
                <Image
                  src="/dummy/dayan-connect.jpg"
                  alt="Dayan Candamil"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. Career Journey — two-column timeline */}
      <Section tone="alt">
        <Container>
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            data-ui-label
          >
            {t('journeyEyebrow')}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl text-[var(--text-title)] md:text-4xl">
            {t('journeyHeading')}
          </h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--text-body)] md:text-lg">
            {t('journeyIntro')}
          </p>
          <ol className="mt-12 space-y-10 md:space-y-12">
            {journey.map((n) => (
              <li
                key={n}
                className="grid gap-4 border-s-2 border-[var(--divider)] ps-6 md:grid-cols-12 md:gap-8 md:ps-8"
              >
                <div className="md:col-span-3">
                  <p className="font-display text-xl text-[var(--text-title)]">
                    <bdi>{t(`journey${n}Years` as 'journey1Years')}</bdi>
                  </p>
                </div>
                <div className="md:col-span-9">
                  <p className="font-display text-lg text-[var(--text-title)]">
                    {t(`journey${n}Company` as 'journey1Company')}
                  </p>
                  <p
                    className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {t(`journey${n}Title` as 'journey1Title')} ·{' '}
                    {t(`journey${n}Location` as 'journey1Location')}
                  </p>
                  <p className="mt-3 max-w-2xl text-base text-[var(--text-body)]">
                    {t(`journey${n}Summary` as 'journey1Summary')}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 5. Featured In — press strip.
       * Per-asset object-fit: cover for the BAZAAR portrait cover,
       * contain for the MFW runway and the certificate so award text
       * and runway composition are never cropped. */}
      <Section>
        <Container>
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            data-ui-label
          >
            {t('pressEyebrow')}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl text-[var(--text-title)] md:text-4xl">
            {t('pressHeading')}
          </h2>
          <div className="mt-12 grid items-stretch gap-6 sm:grid-cols-3">
            {press.map(({n, src, fit}) => (
              <figure key={n} className="flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-alt)]">
                  <Image
                    src={src}
                    alt={t(`press${n}Alt` as 'press1Alt')}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className={fit}
                  />
                </div>
                <figcaption className="mt-4">
                  <p
                    className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {t(`press${n}Source` as 'press1Source')} ·{' '}
                    <bdi>{t(`press${n}Date` as 'press1Date')}</bdi>
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-body)]">
                    {t(`press${n}Title` as 'press1Title')}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-sm italic text-[var(--text-muted)]">
            {t('alsoFeaturedIn')}
          </p>
        </Container>
      </Section>

      {/* 6. Languages · Honors · Education */}
      <Section tone="alt">
        <Container>
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="font-display text-xl text-[var(--text-title)]">
                {t('languagesHeading')}
              </h3>
              <ul className="mt-4 divide-y divide-[var(--divider)] border-t border-[var(--divider)]">
                <li className="py-3 text-base text-[var(--text-body)]">{t('language1')}</li>
                <li className="py-3 text-base text-[var(--text-body)]">{t('language2')}</li>
                <li className="py-3 text-base text-[var(--text-body)]">{t('language3')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-xl text-[var(--text-title)]">
                {t('honorsHeading')}
              </h3>
              <ul className="mt-4 divide-y divide-[var(--divider)] border-t border-[var(--divider)]">
                <li className="py-3 text-base text-[var(--text-body)]">{t('honor1')}</li>
                <li className="py-3 text-base text-[var(--text-body)]">{t('honor2')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-xl text-[var(--text-title)]">
                {t('educationHeading')}
              </h3>
              <ul className="mt-4 divide-y divide-[var(--divider)] border-t border-[var(--divider)]">
                <li className="py-3 text-base text-[var(--text-body)]">{t('education1')}</li>
                <li className="py-3 text-base text-[var(--text-body)]">{t('education2')}</li>
                <li className="py-3 text-base text-[var(--text-body)]">{t('education3')}</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. Connect CTA */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-[var(--text-title)] md:text-4xl">
              {t('ctaHeading')}
            </h2>
            <p className="mt-6 text-base text-[var(--text-body)] md:text-lg">
              {t('ctaBody')}
            </p>
            <div className="mt-10 flex justify-center">
              <PrivateCircleTrigger source="founder" variant="solid">
                {t('ctaButton')}
              </PrivateCircleTrigger>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
