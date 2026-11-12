import type {Metadata} from 'next';
import {Arsenal, Roboto_Flex} from 'next/font/google';
import en from '@/messages/en.json';
import './globals.css';

/**
 * 404 for URLs that match no route at all. Such a request never reaches the
 * `[locale]` segment, so `app/[locale]/not-found.tsx` cannot render and Next
 * would otherwise serve its bare default page (no `lang`, no way home).
 *
 * Deliberately NOT done with an `app/[locale]/[...rest]` catch-all calling
 * `notFound()`: the locale layout wraps the page in <Suspense>, so the shell
 * is already streaming and that route answers 200 — a soft 404. This file is
 * served with a real 404 status.
 *
 * It bypasses the locale layout, hence its own <html>, fonts and stylesheet,
 * and English copy only (there is no locale to read here). Font options
 * mirror app/[locale]/layout.tsx so the same files are reused.
 */
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

export const metadata: Metadata = {
  title: `${en.NotFound.heading} · ${en.Meta.siteName}`,
  description: en.NotFound.body,
  robots: {index: false, follow: false}
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={`${arsenal.variable} ${robotoFlex.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text-body)]">
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <div className="max-w-md text-center">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
              404
            </p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{en.NotFound.heading}</h1>
            <p className="mt-4 text-[var(--text-body)]">{en.NotFound.body}</p>
            {/* Plain anchor: next-intl's Link needs the locale provider. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="mt-8 inline-flex h-[45px] items-center justify-center border border-[var(--accent)] px-8 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]"
              data-ui-label
            >
              {en.NotFound.returnHome}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
