/**
 * Cloudflare Turnstile server-side verification.
 *
 * Server-verify enforces: hostname allowlist, expected action per form,
 * sane token length (max 2048; no documented minimum so we don't impose
 * one), a 5-second timeout (fail-closed on Cloudflare outage), and a
 * structured log line we can drive an ops alert from.
 *
 * The `remoteip` is the raw forwarded IP — used ONLY here and discarded.
 */

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN_LENGTH = 2048;
const TIMEOUT_MS = 5000;

export type TurnstileSource =
  | 'private-circle'
  | 'golden-visa-inquiry'
  | 'internal-login'
  | 'contact'
  | 'investment-readiness';

export type TurnstileResult =
  | {ok: true}
  | {ok: false; reason: 'empty' | 'oversized' | 'invalid' | 'wrong-action' | 'wrong-host' | 'timeout' | 'no-secret'};

const ALLOWED_HOSTS = new Set<string>([
  // Populated at runtime via NEXT_PUBLIC_SITE_URL's hostname; this set
  // exists for forward-compat when more origins (preview, staging) get
  // explicitly listed.
]);

function expectedHost(): string | null {
  if (!process.env.NEXT_PUBLIC_SITE_URL) return null;
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
  } catch {
    return null;
  }
}

export async function verifyTurnstile(opts: {
  token: string;
  action: TurnstileSource;
  remoteIp: string;
}): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return {ok: false, reason: 'no-secret'};

  if (!opts.token) return {ok: false, reason: 'empty'};
  if (opts.token.length > MAX_TOKEN_LENGTH) return {ok: false, reason: 'oversized'};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = new URLSearchParams({
      secret,
      response: opts.token,
      remoteip: opts.remoteIp
    });
    const res = await fetch(SITEVERIFY, {
      method: 'POST',
      body,
      signal: controller.signal
    });
    const data = (await res.json()) as {
      success: boolean;
      hostname?: string;
      action?: string;
      'error-codes'?: string[];
    };
    if (!data.success) return {ok: false, reason: 'invalid'};
    if (data.action && data.action !== opts.action) {
      return {ok: false, reason: 'wrong-action'};
    }
    const host = expectedHost();
    if (host && data.hostname && data.hostname !== host && !ALLOWED_HOSTS.has(data.hostname)) {
      return {ok: false, reason: 'wrong-host'};
    }
    return {ok: true};
  } catch (err) {
    if ((err as Error).name === 'AbortError') return {ok: false, reason: 'timeout'};
    return {ok: false, reason: 'invalid'};
  } finally {
    clearTimeout(timer);
  }
}
