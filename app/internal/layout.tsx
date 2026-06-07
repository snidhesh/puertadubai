import {Arsenal, Roboto_Flex} from 'next/font/google';
import '../globals.css';

const arsenal = Arsenal({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display-latin',
  display: 'swap'
});

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-sans-latin',
  display: 'swap'
});

/**
 * /internal/* is the operator-only surface (lead viewer + login). It
 * bypasses the locale tree (EN-only at v1), supplies its own html/body,
 * and skips every public chrome (nav, footer, WhatsApp FAB, modals).
 *
 * Anti-framing + noindex + CSP `frame-ancestors 'none'` headers are set
 * in `next.config.ts` `headers()` via a dedicated `/internal/:path*`
 * matcher — defence in depth with the `<meta>` here.
 */
export const metadata = {
  title: 'Puerta Dubai · Internal',
  robots: {index: false, follow: false}
};

export default function InternalLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${arsenal.variable} ${robotoFlex.variable} antialiased`}
    >
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-body)]">{children}</body>
    </html>
  );
}
