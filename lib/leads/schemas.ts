import {z} from 'zod';

/**
 * Zod schemas for every lead form. `consent` is required: false is a
 * hard rejection, not a soft prompt. `marketingOptIn` is default-false
 * (transactional-only by default).
 *
 * Server actions parse the FormData through these before any adapter
 * call. Failed parses never write to Airtable or send mail.
 */

const baseFields = z.object({
  consent: z.literal(true, {message: 'Consent is required'}),
  consentVersion: z.string().min(1),
  marketingOptIn: z.boolean().default(false),
  honeypot: z.string().max(0, {message: 'invalid'}),
  // Empty token is allowed at the schema level — runtime `verifyTurnstile`
  // enforces presence, and in dev (no NEXT_PUBLIC_TURNSTILE_SITE_KEY) the
  // widget is never rendered so the token IS empty by design.
  turnstileToken: z.string(),
  locale: z.enum(['en', 'fr', 'es', 'pt', 'ar'])
});

export const privateCircleSchema = baseFields.extend({
  source: z.literal('private-circle'),
  country: z.string().min(1).max(120),
  interest: z.enum(['real-estate', 'business', 'both', 'golden-visa']),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional()
});

export const goldenVisaInquirySchema = baseFields.extend({
  source: z.literal('golden-visa-inquiry'),
  email: z.string().email().max(254),
  name: z.string().min(1).max(120),
  country: z.string().min(1).max(120)
});

export const contactSchema = baseFields.extend({
  source: z.literal('contact'),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(4000)
});

export const investmentReadinessSchema = baseFields.extend({
  source: z.literal('investment-readiness'),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional(),
  country: z.string().min(1).max(120),
  budgetBand: z.enum(['<500k', '500k-1m', '1m-2.5m', '2.5m-5m', '5m+']),
  targetEmirate: z.string().min(1).max(120),
  timeline: z.enum(['immediate', '3-months', '6-months', '12-months', 'exploring']),
  investmentObjective: z.enum(['residency', 'yield', 'business', 'lifestyle', 'exploratory']),
  residencyGoal: z.enum(['golden-visa-priority', 'eventual', 'none']).optional(),
  servicesNeeded: z.array(z.string()).max(8).default([])
});

export const leadInputSchema = z.discriminatedUnion('source', [
  privateCircleSchema,
  goldenVisaInquirySchema,
  contactSchema,
  investmentReadinessSchema
]);

export type LeadInput = z.infer<typeof leadInputSchema>;
export type PrivateCircleInput = z.infer<typeof privateCircleSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type InvestmentReadinessInput = z.infer<typeof investmentReadinessSchema>;
