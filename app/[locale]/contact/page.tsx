import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ContactForm} from '@/components/home/contact-form';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Contact'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default async function ContactPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'Contact'});

  // Same image+form composition as the home page's Let's Connect section,
  // so the contact route and the homepage band share one visual treatment.
  return (
    <section
      aria-label={t('ariaLabel')}
      className="grid bg-[var(--bg-dark)] md:grid-cols-2"
    >
      {/* Image — Dayan, full bleed left */}
      <div className="relative min-h-[420px] md:min-h-[720px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dummy/dayan-connect.jpg"
          alt="Dayan Candamil"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
      </div>

      {/* Form right */}
      <div className="flex items-center px-6 py-16 md:px-12 md:py-24 lg:px-20">
        <div className="w-full max-w-md">
          <h1 className="font-display">
            <span
              className="block text-sm uppercase tracking-[0.32em] !text-white/65"
              style={{color: 'rgba(255,255,255,0.65)'}}
              data-ui-label
            >
              {t('eyebrow')}
            </span>
            <span
              className="mt-3 block text-3xl leading-[1.05] !text-white md:text-5xl lg:text-6xl"
              style={{color: '#ffffff'}}
            >
              {t('heading')}
            </span>
          </h1>
          <p
            className="mt-6 max-w-sm text-sm leading-[1.7] !text-white/75 md:text-base"
            style={{color: 'rgba(255,255,255,0.75)'}}
          >
            {t('body')}
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
                {t('email')}
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
                {t('whatsApp')}
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
  );
}
