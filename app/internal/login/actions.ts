'use server';

import {cookies, headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {pickClientIp} from '@/lib/leads/hash';
import {recordLoginAttempt, ThrottleReject} from '@/lib/leads/throttle';
import {verifyTurnstile} from '@/lib/leads/turnstile';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  issueSession,
  verifyViewerPassword
} from '@/lib/internal/session';

/**
 * Login order matters: Turnstile → throttle (atomic, capped attempts
 * insert no rows) → scrypt OUTSIDE the throttle transaction so DB locks
 * don't serialise behind ~100 ms of CPU work.
 *
 * Response-shape equivalence: wrong-password, throttled, and
 * turnstile-failed all redirect back to `/internal/login?err=1` — same
 * status, same body, same rendered HTML. Wall-clock latency differs
 * (throttled paths skip scrypt), which is the accepted residual
 * disclosure documented in the plan.
 */
export async function attemptLogin(formData: FormData): Promise<void> {
  const turnstileToken = String(formData.get('cf-turnstile-response') ?? '');
  const password = String(formData.get('password') ?? '');

  const headerList = await headers();
  const rawIp = pickClientIp(headerList.get('x-forwarded-for'));

  const turnstile = await verifyTurnstile({
    token: turnstileToken,
    action: 'internal-login',
    remoteIp: rawIp
  });
  if (!turnstile.ok) {
    redirect('/internal/login?err=1');
  }

  try {
    await recordLoginAttempt({rawIp});
  } catch (err) {
    if (err instanceof ThrottleReject) {
      redirect('/internal/login?err=1');
    }
    throw err;
  }

  const match = await verifyViewerPassword(password);
  if (!match) {
    redirect('/internal/login?err=1');
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: issueSession(),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
    // No `domain` set — required by the __Host- cookie prefix.
  });

  redirect('/internal/leads');
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  redirect('/internal/login');
}
