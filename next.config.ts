import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Static CSP — marketing route group. `'unsafe-inline'` in `script-src`
 * is the documented Next-App-Router tradeoff to preserve ISR / edge
 * cache. Residual XSS risk is mitigated by trusted-dependency posture,
 * Portable-Text sanitisation, `safeJsonLd()`, Turnstile, and
 * `object-src 'none'` / `base-uri 'self'`.
 */
const marketingCsp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ''};
  script-src-attr 'none';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://challenges.cloudflare.com https://va.vercel-scripts.com https://vitals.vercel-insights.com;
  img-src 'self' data: https://cdn.sanity.io https://studio.blackoak-re.com https://static.shared.propertyfinder.ae https://i.ytimg.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-src https://challenges.cloudflare.com;
  frame-ancestors 'none';
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/**
 * Studio CSP — Sanity-specific. Exact project subdomain is pinned at
 * build time from NEXT_PUBLIC_SANITY_PROJECT_ID; wildcards on *.sanity.io
 * are avoided. Studio omits X-Frame-Options because Sanity Studio uses
 * iframes for some internal flows.
 */
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const sanityApiHost = sanityProjectId
  ? `https://${sanityProjectId}.api.sanity.io`
  : 'https://api.sanity.io';
const sanityWssHost = sanityProjectId
  ? `wss://${sanityProjectId}.api.sanity.io`
  : 'wss://api.sanity.io';

const studioCsp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.sanity.io${isDev ? " 'unsafe-eval'" : ''};
  script-src-attr 'none';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' ${sanityApiHost} ${sanityWssHost} https://cdn.sanity.io;
  img-src 'self' data: blob: https://cdn.sanity.io;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'self';
  frame-ancestors 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/**
 * /internal/* CSP — operator-only routes, no third-party assets at all,
 * `frame-ancestors 'none'` for clickjacking defence (anti-framing must
 * not be left to inherit from the marketing matcher; a future narrowing
 * of the marketing matcher could silently strip the protection).
 */
const internalCsp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''};
  script-src-attr 'none';
  style-src 'self' 'unsafe-inline';
  connect-src 'self';
  img-src 'self' data:;
  font-src 'self' https://fonts.gstatic.com;
  frame-src https://challenges.cloudflare.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const commonSecurityHeaders = [
  {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'}
];

const nextConfig: NextConfig = {
  experimental: {
    // Lead forms are tiny — cap the request body to cut abuse surface.
    // `allowedOrigins` is deliberately omitted: Next 16 enforces same-origin
    // for Server Actions by default, and exact preview domains aren't
    // knowable at build time.
    serverActions: {
      bodySizeLimit: '32kb'
    }
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io'},
      {protocol: 'https', hostname: 'studio.blackoak-re.com'},
      {protocol: 'https', hostname: 'static.shared.propertyfinder.ae'},
      {protocol: 'https', hostname: 'i.ytimg.com'}
    ]
  },
  async headers() {
    return [
      // Marketing: every public path EXCEPT /api, /_next, /studio,
      // /internal, and file-like paths. Mirrors proxy.ts's matcher.
      {
        source: '/((?!api|_next|studio|internal|.*\\..*).*)',
        headers: [
          {key: 'Content-Security-Policy', value: marketingCsp},
          {key: 'X-Frame-Options', value: 'DENY'},
          ...commonSecurityHeaders
        ]
      },
      // Studio: its own CSP. X-Frame-Options intentionally omitted.
      {
        source: '/studio/:path*',
        headers: [
          {key: 'Content-Security-Policy', value: studioCsp},
          ...commonSecurityHeaders
        ]
      },
      // /internal/*: dedicated matcher block so anti-framing (XFO + CSP
      // frame-ancestors none) cannot accidentally be stripped by a
      // future narrowing of the marketing matcher. Also noindex.
      {
        source: '/internal/:path*',
        headers: [
          {key: 'Content-Security-Policy', value: internalCsp},
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'X-Robots-Tag', value: 'noindex,nofollow'},
          {key: 'Cache-Control', value: 'no-store, private'},
          ...commonSecurityHeaders
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
