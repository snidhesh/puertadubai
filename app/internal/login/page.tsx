import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {SESSION_COOKIE_NAME, verifySession} from '@/lib/internal/session';
import {attemptLogin} from './actions';

export const dynamic = 'force-dynamic';

/**
 * Sparse login surface. Identical UI is rendered regardless of whether
 * the user is already authenticated (already-signed-in users get
 * redirected before this renders) — no copy that confirms "this is the
 * admin door."
 */
type Props = {searchParams: Promise<{err?: string}>};

export default async function InternalLoginPage({searchParams}: Props) {
  const sp = await searchParams;
  const showError = sp?.err === '1';
  const cookieStore = await cookies();
  if (verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    redirect('/internal/leads');
  }

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-sm">
        <p
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
          data-ui-label
        >
          Restricted
        </p>
        <h1 className="mt-4 font-display text-3xl">Sign in</h1>
        <form action={attemptLogin} className="mt-8 space-y-4">
          <label className="block">
            <span
              className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
              data-ui-label
            >
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="mt-1 block h-[48px] w-full border-b border-[var(--divider)] bg-transparent px-0 text-base text-[var(--text-body)] focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
          {turnstileSiteKey ? (
            <div
              className="cf-turnstile"
              data-sitekey={turnstileSiteKey}
              data-action="internal-login"
            />
          ) : null}
          <button
            type="submit"
            className="inline-flex h-[45px] w-full items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-8 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-on-dark)] transition-colors hover:bg-[var(--hover)]"
            data-ui-label
          >
            Continue
          </button>
        </form>
        {showError && (
          <p className="mt-4 text-sm text-[var(--text-body)]" role="alert">
            Sign-in failed.
          </p>
        )}
        <p className="mt-6 text-xs text-[var(--text-muted)]">
          Operator-only. Repeated failures throttle the source IP for 15
          minutes.
        </p>
      </div>
    </main>
  );
}
