'use client';

import {useState} from 'react';
import {submitLead} from '@/lib/leads/adapter';
import {CURRENT_CONSENT_VERSION} from '@/lib/leads/consent';
import type {Locale} from '@/lib/i18n/routing';
import {cn} from '@/lib/utils';

type Stage = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Inline contact form on the home page. Posts through the same
 * `submitLead` Server Action with `source: 'contact'` so it goes through
 * Turnstile + the Postgres throttle + Resend + Postgres insert, same as
 * every other surface.
 *
 * Honeypot field (`company_pref`) is hidden from users; bots that fill
 * it get rejected at the Zod layer.
 *
 * Pass `onDark` when rendering over a dark band — flips field colours,
 * borders, button, success/error states, and consent copy to white-friendly.
 */
export function ContactForm({
  locale,
  onDark = false
}: {
  locale: Locale;
  onDark?: boolean;
}) {
  const [stage, setStage] = useState<Stage>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stage === 'submitting') return;
    setStage('submitting');

    const fd = new FormData(e.currentTarget);
    const result = await submitLead({
      source: 'contact',
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? '') || undefined,
      message: String(fd.get('message') ?? ''),
      consent: fd.get('consent') === 'on',
      consentVersion: CURRENT_CONSENT_VERSION,
      marketingOptIn: false,
      honeypot: String(fd.get('company_pref') ?? ''),
      turnstileToken: String(fd.get('cf-turnstile-response') ?? ''),
      locale
    });
    setStage(result.ok ? 'success' : 'error');
  }

  if (stage === 'success') {
    return (
      <div
        className={cn(
          'border p-8',
          onDark
            ? 'border-white/20 bg-white/5 text-white'
            : 'border-[var(--divider)] bg-[var(--bg)]'
        )}
      >
        <p
          className={cn(
            'font-display text-xl',
            onDark ? 'text-white' : 'text-[var(--text-title)]'
          )}
        >
          Message received.
        </p>
        <p
          className={cn(
            'mt-2 text-sm',
            onDark ? 'text-white/75' : 'text-[var(--text-body)]'
          )}
        >
          We&apos;ll be in touch within 48 hours.
        </p>
      </div>
    );
  }

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const inputCls = cn(
    'block h-[48px] w-full border-b bg-transparent px-0 text-base focus:outline-none',
    onDark
      ? 'border-white/25 text-white placeholder:text-white/40 focus:border-white'
      : 'border-[var(--divider)] text-[var(--text-body)] focus:border-[var(--accent)]'
  );
  const textareaCls = `${inputCls} h-auto resize-y py-2`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot — sr-only for real users, irresistible for naive bots. */}
      <label className="sr-only" aria-hidden="true">
        Preferred company
        <input type="text" name="company_pref" tabIndex={-1} autoComplete="off" />
      </label>

      <Field label="Name" onDark={onDark}>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="Name"
          className={inputCls}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" onDark={onDark}>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="Phone"
            className={inputCls}
          />
        </Field>
        <Field label="Email" onDark={onDark}>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Email"
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Message" onDark={onDark}>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Message"
          className={textareaCls}
        />
      </Field>

      <label
        className={cn(
          'flex gap-2 text-xs',
          onDark ? 'text-white/70' : 'text-[var(--text-body)]'
        )}
      >
        <input type="checkbox" name="consent" required />
        <span>
          I agree to Puerta Dubai contacting me about UAE investment
          opportunities and have read the Privacy Policy.
        </span>
      </label>

      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-action="contact"
          data-theme={onDark ? 'dark' : 'light'}
        />
      ) : null}

      {stage === 'error' && (
        <p
          className={cn(
            'text-sm',
            onDark ? 'text-white/80' : 'text-[var(--text-body)]'
          )}
          role="alert"
        >
          Something went wrong. Please try again or use the WhatsApp link.
        </p>
      )}

      <button
        type="submit"
        disabled={stage === 'submitting'}
        className={cn(
          'inline-flex h-[50px] items-center justify-center px-10 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors disabled:opacity-50',
          onDark
            ? 'bg-white text-[var(--text-title)] hover:bg-white/85'
            : 'border border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-dark)] hover:bg-[var(--hover)]'
        )}
        data-ui-label
      >
        {stage === 'submitting' ? '…' : 'Send message'}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  onDark = false
}: {
  label: string;
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={cn(
          'text-[10px] uppercase tracking-[0.22em]',
          onDark ? 'text-white/55' : 'text-[var(--text-muted)]'
        )}
        data-ui-label
      >
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
