import {revalidatePath} from 'next/cache';
import {NextResponse, type NextRequest} from 'next/server';
import {parseBody} from 'next-sanity/webhook';
import {sql} from '@/lib/db/client';

export const dynamic = 'force-dynamic';

/**
 * Sanity webhook handler. Verifies the X-Sanity-Signature header via
 * the official `parseBody` helper. Dedupes by Sanity's per-delivery
 * `idempotency-key` request header against the `webhook_deliveries`
 * Postgres table — an INSERT with ON CONFLICT DO NOTHING is atomic and
 * durable across cold starts (in-memory caches are unreliable in
 * serverless).
 *
 * The body documents the affected paths so callers can revalidate
 * granularly.
 */
type SanityWebhookBody = {
  _type?: string;
  slug?: {current?: string} | string;
  tags?: string[];
  paths?: string[];
};

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ok: false, code: 'method'}, {status: 405});
  }

  const idempotencyKey =
    req.headers.get('idempotency-key') ??
    req.headers.get('x-idempotency-key') ??
    null;

  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ok: false, code: 'secret-missing'}, {status: 500});
  }

  const {isValidSignature, body} = await parseBody<SanityWebhookBody>(req, secret);
  if (!isValidSignature) {
    return NextResponse.json({ok: false, code: 'invalid-signature'}, {status: 401});
  }

  if (idempotencyKey) {
    const inserted = await sql<{idempotency_key: string}[]>`
      INSERT INTO webhook_deliveries (idempotency_key)
      VALUES (${idempotencyKey})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING idempotency_key
    `;
    if (inserted.length === 0) {
      return NextResponse.json(
        {ok: true, dedup: true},
        {status: 200, headers: {'Cache-Control': 'no-store'}}
      );
    }
  }

  // Coarse revalidation: invalidate any explicit paths in the webhook
  // body, plus the home page as the catch-all. Body shape is
  // consumer-defined in the Sanity webhook config; the default Sanity
  // webhook does not send `paths`, so the home revalidation covers it.
  for (const path of body?.paths ?? []) {
    if (typeof path === 'string' && path.startsWith('/')) {
      revalidatePath(path, 'page');
    }
  }
  revalidatePath('/', 'page');

  return NextResponse.json(
    {ok: true, dedup: false},
    {status: 200, headers: {'Cache-Control': 'no-store'}}
  );
}
