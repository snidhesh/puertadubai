import {createHmac, createHash} from 'node:crypto';

/**
 * Throttle-key HMAC. Email is canonicalised to lowercase/trimmed BEFORE
 * the HMAC so `Alice@Example.com` and ` alice@example.com ` collapse
 * to a single bucket. IP is the first comma-separated entry of
 * `x-forwarded-for` (Vercel sanitises this).
 *
 * The HMAC value is the only form persisted to `lead_submission_limits`;
 * raw email/IP never reach Postgres.
 */
export function hmacEmail(email: string): string {
  const secret = process.env.LIMIT_HMAC_SECRET;
  if (!secret) throw new Error('LIMIT_HMAC_SECRET missing — refuse to start');
  const canonical = email.trim().toLowerCase();
  return createHmac('sha256', secret).update(canonical).digest('hex');
}

export function hmacIp(rawIp: string): string {
  const secret = process.env.LIMIT_HMAC_SECRET;
  if (!secret) throw new Error('LIMIT_HMAC_SECRET missing — refuse to start');
  return createHmac('sha256', secret).update(rawIp.trim()).digest('hex');
}

/**
 * Trusted client IP from Vercel's `x-forwarded-for` (first comma entry).
 * Vercel sanitises this header and overwrites externally-supplied
 * forwards, so the first entry is the trusted client IP.
 */
export function pickClientIp(forwardedFor: string | null | undefined): string {
  if (!forwardedFor) return '0.0.0.0';
  const first = forwardedFor.split(',')[0]?.trim();
  return first || '0.0.0.0';
}

/**
 * Fixed-length digest for bearer-token comparison. Hashing both sides
 * to 32 bytes lets `crypto.timingSafeEqual` run safely regardless of
 * raw bearer length (it throws on mismatched lengths, so any length
 * guard would leak length).
 */
export function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}
