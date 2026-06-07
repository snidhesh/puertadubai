import type {MetadataRoute} from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.puertadubai.com').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/internal', '/api']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
