import {Resend} from 'resend';
import type {LeadCategory} from './score';
import type {LeadInput} from './schemas';

/**
 * Resend ops notification — NO PII in subject or body.
 *
 * Subject: `[<category>] New <source>` — no PII so the line is safe in
 *          mail logs, lock-screen previews, push notifications.
 * Body:    category + source + locale + timestamp + a deep link to
 *          `/internal/leads/<id>` (the password-gated operator viewer).
 *          Operator clicks through to see name/email/phone.
 */

type OpsNotification = {
  source: LeadInput['source'];
  locale: LeadInput['locale'];
  category: LeadCategory;
  leadId: string;
  siteUrlBase: string;
};

export async function sendOpsNotification(opts: {
  apiKey: string;
  from: string;
  to: string;
  notification: OpsNotification;
}): Promise<void> {
  const resend = new Resend(opts.apiKey);
  const {notification} = opts;
  const subject = `[${notification.category}] New ${notification.source}`;
  const internalUrl = `${notification.siteUrlBase}/internal/leads/${notification.leadId}`;
  const ts = new Date().toISOString();

  await resend.emails.send({
    from: opts.from,
    to: opts.to,
    subject,
    text: [
      `Category: ${notification.category}`,
      `Source: ${notification.source}`,
      `Locale: ${notification.locale}`,
      `Submitted: ${ts}`,
      '',
      `Open: ${internalUrl}`,
      '',
      'PII intentionally excluded from this message — view the lead detail.'
    ].join('\n')
  });
}

/**
 * Applicant confirmation. Acknowledges submission without revealing
 * anything sensitive (the form-fill itself was their data).
 */
export async function sendApplicantConfirmation(opts: {
  apiKey: string;
  from: string;
  to: string;
  locale: LeadInput['locale'];
}): Promise<void> {
  const resend = new Resend(opts.apiKey);
  const greetings: Record<LeadInput['locale'], string> = {
    en: 'Thank you for reaching out to Puerta Dubai.',
    fr: 'Merci de votre intérêt pour Puerta Dubai.',
    es: 'Gracias por escribir a Puerta Dubai.',
    pt: 'Obrigado pelo seu contacto com a Puerta Dubai.',
    ar: 'شكراً لتواصلك مع بويرتا دبي.'
  };
  await resend.emails.send({
    from: opts.from,
    to: opts.to,
    subject: greetings[opts.locale],
    text: [
      greetings[opts.locale],
      '',
      opts.locale === 'ar'
        ? 'سنعود إليك خلال 48 ساعة.'
        : "We will be in touch within 48 hours."
    ].join('\n')
  });
}
