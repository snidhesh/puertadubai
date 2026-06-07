/**
 * Next 16 proxy (formerly middleware). Runs next-intl's locale negotiation
 * for the public marketing route group only.
 *
 * Excluded entirely from the matcher (so they get neither locale
 * negotiation nor any proxy logic): `/api/*`, `/_next/*`, `/studio/*`,
 * `/internal/*`, and any file-like path (anything containing a dot —
 * covers `/favicon.ico`, `/sitemap.xml`, `/robots.txt` and every static
 * asset in one rule).
 *
 * The marketing + Studio + `/internal/*` security headers (including CSP,
 * X-Frame-Options, X-Robots-Tag) are emitted by `next.config.ts`
 * `headers()` per-route-group — never combined.
 */
import type {NextRequest, NextResponse} from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import {routing} from '@/lib/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export function proxy(request: NextRequest): NextResponse {
  return intlMiddleware(request) as NextResponse;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next|studio|internal|.*\\..*).*)',
      missing: [
        {type: 'header', key: 'next-router-prefetch'},
        {type: 'header', key: 'purpose', value: 'prefetch'}
      ]
    }
  ]
};
