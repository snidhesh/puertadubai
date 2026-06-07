import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {SESSION_COOKIE_NAME, verifySession} from './session';

/**
 * Server-side guard for /internal/* pages. Redirects unauthenticated
 * requests to /internal/login (rather than 401-ing, which would confirm
 * the route exists). Use at the top of every internal page.
 */
export async function requireInternalSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySession(token)) {
    redirect('/internal/login');
  }
}
