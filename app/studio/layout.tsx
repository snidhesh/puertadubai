/**
 * Studio bypasses the locale layout — no NextIntlClientProvider, no nav,
 * no footer. Studio ships its own self-contained UI.
 *
 * We still need to provide the html/body shell because the locale layout
 * (which usually does that) lives at /[locale]/layout.tsx and isn't a
 * parent of /studio.
 */
export const metadata = {
  title: 'Puerta Dubai · Studio',
  robots: {index: false, follow: false}
};

export default function StudioLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body style={{margin: 0}}>{children}</body>
    </html>
  );
}
