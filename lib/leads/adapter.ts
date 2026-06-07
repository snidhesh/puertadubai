'use server';

import {headers} from 'next/headers';
import {CURRENT_CONSENT_VERSION} from './consent';
import {pickClientIp} from './hash';
import {verifyTurnstile} from './turnstile';
import {recordSubmissionAttempt, ThrottleReject} from './throttle';
import {categoriseLead, type LeadCategory} from './score';
import {insertLead} from './db';
import {sendApplicantConfirmation, sendOpsNotification} from './resend';
import {leadInputSchema, type LeadInput} from './schemas';

type SubmitLeadResult =
  | {ok: true; id: string; category: LeadCategory}
  | {ok: false; code: 'validation' | 'consent' | 'rate-limit' | 'turnstile' | 'storage'};

export async function submitLead(rawInput: unknown): Promise<SubmitLeadResult> {
  const parsed = leadInputSchema.safeParse(rawInput);
  if (!parsed.success) return {ok: false, code: 'validation'};
  const input = parsed.data;

  if (!input.consent) return {ok: false, code: 'consent'};
  if (input.consentVersion !== CURRENT_CONSENT_VERSION) {
    return {ok: false, code: 'consent'};
  }

  // Dev-mode no-op: when we're not in production and the backend
  // services aren't configured yet (Turnstile + Postgres + Resend),
  // log the submission and return success so the UX is testable locally
  // without standing up the whole infrastructure. Production behaviour
  // (every var set) takes the normal path below.
  if (
    process.env.NODE_ENV !== 'production' &&
    (!process.env.TURNSTILE_SECRET_KEY || !process.env.DATABASE_URL)
  ) {
    const fakeId =
      `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const category = deriveCategory(input);
    const phone = 'phone' in input ? input.phone : undefined;
    const message = 'message' in input ? input.message : undefined;
    console.warn(
      '[lead][DEV-NOOP] form submission accepted without persistence — set TURNSTILE_SECRET_KEY + DATABASE_URL to run the real pipeline.\n',
      {
        id: fakeId,
        source: input.source,
        locale: input.locale,
        category,
        name: input.name,
        email: input.email,
        phone,
        message
      }
    );
    return {ok: true, id: fakeId, category};
  }

  // Server Actions don't receive a `req`. `headers()` is async in Next 16.
  const headerList = await headers();
  const rawIp = pickClientIp(headerList.get('x-forwarded-for'));

  // Turnstile first — fast-reject on garbage before any DB touch.
  const turnstile = await verifyTurnstile({
    token: input.turnstileToken,
    action: input.source,
    remoteIp: rawIp
  });
  if (!turnstile.ok) return {ok: false, code: 'turnstile'};

  // Atomic throttle (email + ip, single transaction, capped attempts
  // insert no rows so the sliding window decays naturally).
  try {
    await recordSubmissionAttempt({email: input.email, rawIp});
  } catch (err) {
    if (err instanceof ThrottleReject) return {ok: false, code: 'rate-limit'};
    throw err;
  }

  const category = deriveCategory(input);

  let id: string;
  try {
    const inserted = await insertLead({
      source: input.source,
      locale: input.locale,
      category,
      consentVersion: input.consentVersion,
      marketingOptIn: input.marketingOptIn ?? false,
      payload: input
    });
    id = inserted.id;
  } catch (err) {
    console.error('[lead] postgres insert failed', err);
    return {ok: false, code: 'storage'};
  }

  // Email is best-effort — the lead is persisted regardless.
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const to = process.env.LEADS_NOTIFICATION_EMAIL;
    const siteUrlBase =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';
    if (apiKey && from && to) {
      await sendOpsNotification({
        apiKey,
        from,
        to,
        notification: {
          source: input.source,
          locale: input.locale,
          category,
          leadId: id,
          siteUrlBase
        }
      });
      if (input.email) {
        await sendApplicantConfirmation({
          apiKey,
          from,
          to: input.email,
          locale: input.locale
        });
      }
    }
  } catch (err) {
    console.error('[lead] notification email failed', err);
  }

  return {ok: true, id, category};
}

function deriveCategory(input: LeadInput): LeadCategory {
  if (input.source === 'investment-readiness') {
    return categoriseLead({
      residencyGoal: input.residencyGoal,
      investmentObjective: input.investmentObjective,
      servicesNeeded: input.servicesNeeded
    });
  }
  // Top-of-funnel surfaces default to exploratory until a later submission
  // with the same email upgrades the category.
  return 'exploratory';
}
