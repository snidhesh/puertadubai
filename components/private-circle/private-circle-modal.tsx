'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useQueryStates, parseAsString} from 'nuqs';
import {useLocale, useTranslations} from 'next-intl';
import {submitLead} from '@/lib/leads/adapter';
import {CURRENT_CONSENT_VERSION} from '@/lib/leads/consent';
import {Link} from '@/lib/i18n/navigation';
import {cn} from '@/lib/utils';
import type {Locale} from '@/lib/i18n/routing';

type Stage = 'step1' | 'step2' | 'success' | 'error';

/**
 * Private Circle modal — global top-of-funnel lead capture (~30s).
 *
 * URL state: ONLY `pc=open` and `pc_src=<source>`. Form fields live in
 * React state and are submitted via the server action; nothing PII ever
 * lands in `location.search` or `document.referrer`.
 *
 * Honeypot field is a hidden text input named `company_pref` — bots
 * fill every visible field; real users leave it empty. A non-empty value
 * triggers Zod's `.max(0)` rejection.
 */
export function PrivateCircleModal() {
  const t = useTranslations('PrivateCircle');
  const locale = useLocale() as Locale;
  const [{pc, pc_src}, setState] = useQueryStates({
    pc: parseAsString.withDefault(''),
    pc_src: parseAsString.withDefault('')
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('step1');
  const [pending, setPending] = useState(false);
  const [country, setCountry] = useState('');
  const [interest, setInterest] = useState<'real-estate' | 'business' | 'both' | 'golden-visa'>('real-estate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const open = pc === 'open';

  const closeModal = useCallback(() => {
    setState({pc: '', pc_src: ''});
    // Reset on close so re-opens start fresh.
    setTimeout(() => {
      setStage('step1');
      setCountry('');
      setName('');
      setEmail('');
      setPhone('');
      setConsent(false);
      setMarketingOptIn(false);
    }, 200);
  }, [setState]);

  useEffect(() => {
    if (open) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open, closeModal]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);

    const honeypot = (new FormData(e.currentTarget).get('company_pref') as string) ?? '';
    // Turnstile token is read from the widget if present; the server
    // action's Zod schema requires a non-empty string — wiring the
    // Turnstile widget is a follow-up env step.
    const turnstileToken =
      (new FormData(e.currentTarget).get('cf-turnstile-response') as string) ?? '';

    const result = await submitLead({
      source: 'private-circle',
      country,
      interest,
      name,
      email,
      phone: phone || undefined,
      consent,
      consentVersion: CURRENT_CONSENT_VERSION,
      marketingOptIn,
      honeypot,
      turnstileToken,
      locale
    });
    setPending(false);
    setStage(result.ok ? 'success' : 'error');
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pc-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[520px] bg-[var(--bg)] p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            data-ui-label
          >
            {pc_src ? `Private Circle · ${pc_src}` : 'Private Circle'}
          </p>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="text-2xl leading-none text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            ×
          </button>
        </div>
        <h2 id="pc-title" className="mt-3 font-display text-2xl md:text-3xl text-[var(--text-title)]">
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-body)]">{t('subtitle')}</p>

        {stage === 'success' && (
          <div className="mt-6">
            <p className="font-display text-xl">{t('successTitle')}</p>
            <p className="mt-2 text-sm">{t('successBody')}</p>
            <Link
              href="/investment-readiness"
              className="mt-6 inline-flex h-[45px] items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-6 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-on-dark)] hover:bg-[var(--hover)]"
              data-ui-label
            >
              {t('successCta')}
            </Link>
          </div>
        )}

        {stage === 'error' && (
          <div className="mt-6 border border-[var(--divider)] p-4 text-sm text-[var(--text-body)]">
            Something went wrong. Please try again or use the WhatsApp link.
            <button
              type="button"
              onClick={() => setStage('step1')}
              className="ms-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        {(stage === 'step1' || stage === 'step2') && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Honeypot — hidden from real users, irresistible to bots. */}
            <label className="sr-only" aria-hidden="true">
              <span>Preferred company</span>
              <input type="text" name="company_pref" tabIndex={-1} autoComplete="off" />
            </label>

            {stage === 'step1' && (
              <>
                <Field label={t('country')}>
                  <input
                    type="text"
                    required
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputStyles}
                  />
                </Field>
                <Field label={t('interest')}>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value as typeof interest)}
                    className={inputStyles}
                  >
                    <option value="real-estate">{t('interestRealEstate')}</option>
                    <option value="business">{t('interestBusiness')}</option>
                    <option value="both">{t('interestBoth')}</option>
                    <option value="golden-visa">{t('interestGoldenVisa')}</option>
                  </select>
                </Field>
                <button
                  type="button"
                  disabled={!country}
                  onClick={() => setStage('step2')}
                  className={cn(submitStyles, 'disabled:opacity-50')}
                  data-ui-label
                >
                  {t('submit')}
                </button>
              </>
            )}

            {stage === 'step2' && (
              <>
                <Field label={t('name')}>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputStyles}
                  />
                </Field>
                <Field label={t('email')}>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputStyles}
                  />
                </Field>
                <Field label={t('phone')}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputStyles}
                  />
                </Field>
                <label className="flex gap-2 text-xs text-[var(--text-body)]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                  />
                  <span>{t('consent')}</span>
                </label>
                <label className="flex gap-2 text-xs text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                  />
                  <span>{t('marketingOptIn')}</span>
                </label>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStage('step1')}
                    className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
                    data-ui-label
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !consent}
                    className={cn(submitStyles, 'disabled:opacity-50')}
                    data-ui-label
                  >
                    {pending ? '…' : t('submit')}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyles =
  'block h-[48px] w-full border-b border-[var(--divider)] bg-transparent px-0 text-base text-[var(--text-body)] focus:border-[var(--accent)] focus:outline-none';

const submitStyles =
  'inline-flex h-[45px] items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-8 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-on-dark)] hover:bg-[var(--hover)]';

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
