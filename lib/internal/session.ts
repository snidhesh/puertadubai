import {createHmac, randomBytes, timingSafeEqual, scrypt as scryptCb} from 'node:crypto';
import {promisify} from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: Buffer | string,
  salt: Buffer | string,
  keylen: number,
  options: {N?: number; r?: number; p?: number; maxmem?: number}
) => Promise<Buffer>;

/**
 * Session cookie + scrypt password verifier for /internal/*.
 *
 * The cookie is signed (HMAC-SHA256) with INTERNAL_SESSION_SECRET; the
 * payload carries an issuance timestamp and a random nonce so each
 * sign-in produces a distinct value. The browser never sees anything
 * about the password itself.
 *
 * Password verification: parse the stored hash
 *   `scrypt$N$r$p$base64salt$base64hash`
 * derive bytes from the submitted password with the same parameters,
 * then `timingSafeEqual` on the derived bytes (always same length).
 */

const COOKIE_NAME = '__Host-internal-session';
const COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours absolute.
const SCRYPT_MAX_MEM = 64 * 1024 * 1024; // 64 MB ceiling — N=16384 fits.

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = COOKIE_MAX_AGE_SECONDS;

function getSessionSecret(): Buffer {
  const secret = process.env.INTERNAL_SESSION_SECRET;
  if (!secret) throw new Error('INTERNAL_SESSION_SECRET missing');
  return Buffer.from(secret, 'base64');
}

/**
 * Issue a signed session cookie value. The body is `iat.nonce` and the
 * tag is `HMAC-SHA256(secret, body)`; the full cookie is `body.tag`.
 */
export function issueSession(): string {
  const iat = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(16).toString('base64url');
  const body = `${iat}.${nonce}`;
  const tag = createHmac('sha256', getSessionSecret())
    .update(body)
    .digest('base64url');
  return `${body}.${tag}`;
}

/**
 * Verify a session cookie. Returns `true` only when the signature checks
 * out AND the issued-at timestamp is within the 12-hour window.
 */
export function verifySession(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 3) return false;
  const [iatStr, nonce, tag] = parts;
  const body = `${iatStr}.${nonce}`;
  const expected = createHmac('sha256', getSessionSecret())
    .update(body)
    .digest('base64url');
  const a = Buffer.from(tag);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  const iat = Number(iatStr);
  if (!Number.isFinite(iat)) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - iat <= COOKIE_MAX_AGE_SECONDS;
}

type ScryptParams = {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
};

function parseScryptHash(stored: string): ScryptParams | null {
  // Format: scrypt$N$r$p$base64salt$base64hash
  const parts = stored.split('$');
  if (parts.length !== 6) return null;
  if (parts[0] !== 'scrypt') return null;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(N) || N <= 0 || (N & (N - 1)) !== 0) return null;
  if (!Number.isInteger(r) || r <= 0) return null;
  if (!Number.isInteger(p) || p <= 0) return null;
  let salt: Buffer;
  let hash: Buffer;
  try {
    salt = Buffer.from(parts[4], 'base64');
    hash = Buffer.from(parts[5], 'base64');
  } catch {
    return null;
  }
  if (salt.length === 0 || hash.length === 0) return null;
  return {N, r, p, salt, hash};
}

/**
 * Boot-time assertion. Boot fails if LEADS_VIEWER_PASSWORD_HASH is
 * absent or malformed — better to refuse to start than to serve a
 * /internal/login that silently authorises nobody.
 */
export function assertViewerPasswordHashValid(): void {
  const stored = process.env.LEADS_VIEWER_PASSWORD_HASH;
  if (!stored) {
    throw new Error('LEADS_VIEWER_PASSWORD_HASH missing — refuse to start');
  }
  if (!parseScryptHash(stored)) {
    throw new Error('LEADS_VIEWER_PASSWORD_HASH malformed — expected scrypt$N$r$p$base64salt$base64hash');
  }
}

/**
 * Constant-time scrypt verification. Returns `true` iff the submitted
 * password derives to the stored hash bytes under the stored parameters.
 *
 * NEVER pass raw bearer-style strings to timingSafeEqual — it throws on
 * mismatched lengths and any guard would leak length. Here both sides
 * are derived to exactly `parsed.hash.length` bytes.
 */
export async function verifyViewerPassword(submitted: string): Promise<boolean> {
  const stored = process.env.LEADS_VIEWER_PASSWORD_HASH;
  if (!stored) return false;
  const parsed = parseScryptHash(stored);
  if (!parsed) return false;
  const derived = await scrypt(submitted, parsed.salt, parsed.hash.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
    maxmem: SCRYPT_MAX_MEM
  });
  if (derived.length !== parsed.hash.length) return false;
  return timingSafeEqual(derived, parsed.hash);
}
