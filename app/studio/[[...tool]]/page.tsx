'use client';

import {NextStudio} from 'next-sanity/studio';
import config from '@/sanity.config';

/**
 * Embedded Sanity Studio at /studio. The 'use client' boundary is
 * mandatory because Sanity Studio uses React contexts at module eval —
 * server rendering it would throw `createContext is not a function`.
 *
 * Studio CSP (allowing Sanity API + CDN with project-exact hosts) and
 * noindex robots tags are set in next.config.ts `headers()`. The
 * marketing CSP deliberately does NOT match /studio/* so its restrictive
 * policy never combines.
 */
export default function StudioPage() {
  return <NextStudio config={config} />;
}
