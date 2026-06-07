import {NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {purgeOldLeads} from '@/lib/leads/db';
import {sha256} from '@/lib/leads/hash';

export const dynamic = 'force-dynamic';

/**
 * Daily Vercel Cron — mandatory because Privacy promises 24-month
 * retention. Hobby tier is daily-only, which is fine for the
 * retention window.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. The comparison hashes
 * both bearers to 32-byte SHA-256 digests then calls
 * `crypto.timingSafeEqual` on the digests — never directly on raw
 * bearer strings, because `timingSafeEqual` throws on mismatched
 * lengths and any length-checking guard would leak bearer length.
 *
 * Vercel Cron invokes routes via GET and does not follow redirects.
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      {ok: false, code: 'secret-missing'},
      {status: 500, headers: {'Cache-Control': 'no-store'}}
    );
  }
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  const providedDigest = sha256(provided);
  const expectedDigest = sha256(expected);
  if (!timingSafeEqual(providedDigest, expectedDigest)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {'Cache-Control': 'no-store'}
    });
  }

  try {
    const result = await purgeOldLeads();
    return NextResponse.json(
      {ok: true, ...result},
      {status: 200, headers: {'Cache-Control': 'no-store'}}
    );
  } catch (err) {
    return NextResponse.json(
      {ok: false, error: (err as Error).message},
      {status: 500, headers: {'Cache-Control': 'no-store'}}
    );
  }
}
