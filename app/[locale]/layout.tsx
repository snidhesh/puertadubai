import type {Metadata} from 'next';
import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {Analytics} from '@vercel/analytics/next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {Arsenal, Roboto_Flex, El_Messiri, IBM_Plex_Sans_Arabic} from 'next/font/google';
import {SiteNav} from '@/components/site/nav';
import {SiteFooter} from '@/components/site/footer';
import {SplashScreen} from '@/components/site/splash-screen';
import {getDirection, routing, type Locale} from '@/lib/i18n/routing';
import '../globals.css';

// Latin stack (EN/FR/ES/PT) — Mahsheed-inspired pairing.
const arsenal = Arsenal({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-latin',
  display: 'swap'
});

const robotoFlex = Roboto_Flex({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans-latin',
  display: 'swap'
});

// Arabic stack. The Nautigal script accent is intentionally NOT loaded —
// it has no Arabic glyphs and would never render on AR pages.
const elMessiri = El_Messiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-display-arabic',
  display: 'swap'
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans-arabic',
  display: 'swap'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const safeLocale = routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const t = await getTranslations({locale: safeLocale, namespace: 'Meta'});

  return {
    title: {
      default: t('title'),
      template: `%s · ${t('title')}`
    },
    description: t('description'),
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [messages, tNav] = await Promise.all([
    getMessages(),
    getTranslations({locale, namespace: 'Nav'})
  ]);

  return (
    // suppressHydrationWarning: the splash gate script toggles a class on
    // <html> before hydration (components/site/splash-screen.tsx).
    <html
      lang={locale}
      dir={getDirection(locale as Locale)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${arsenal.variable} ${robotoFlex.variable} ${elMessiri.variable} ${ibmPlexArabic.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text-body)]">
        {/* Keyboard users: first Tab stop jumps past the fixed nav and the
         * sticky socials straight to the page content. Visible only on focus. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[110] focus:bg-white focus:px-5 focus:py-3 focus:text-[11px] focus:uppercase focus:tracking-[0.22em] focus:text-[var(--text-title)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--text-title)]"
          data-ui-label
        >
          {tNav('skipToContent')}
        </a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Suspense so the shell can statically prerender while the
           * client-only splash / nav scroll state hydrate. */}
          <Suspense>
            <SplashScreen />
            <SiteNav />
            <main id="main" tabIndex={-1} className="flex-1 pt-16 [&>section:first-child#hero]:-mt-16 [&>section:first-child#hero]:pt-16">
              {children}
            </main>
            <SiteFooter />
          </Suspense>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
