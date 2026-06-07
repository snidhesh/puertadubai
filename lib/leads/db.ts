import {sql} from '@/lib/db/client';
import {escapeFormula} from './escape';
import type {LeadCategory} from './score';
import type {LeadInput} from './schemas';

/**
 * Insert a lead into Postgres. Every string field passes through
 * `escapeFormula()` at the adapter boundary so a CSV export later
 * never executes an injected `=cmd()` formula. The `payload` column
 * holds the raw submission for forensic reference.
 */

type LeadRow = {
  source: LeadInput['source'];
  locale: LeadInput['locale'];
  category: LeadCategory;
  consentVersion: string;
  marketingOptIn: boolean;
  payload: LeadInput;
};

export async function insertLead(row: LeadRow): Promise<{id: string}> {
  const p = row.payload as Record<string, unknown>;

  const [inserted] = await sql<{id: string}[]>`
    INSERT INTO leads (
      source, locale, lead_category, consent_version, marketing_opt_in,
      name, email, phone, country, interest, message,
      budget_band, target_emirate, timeline, investment_obj, residency_goal,
      services_needed
    ) VALUES (
      ${row.source},
      ${row.locale},
      ${row.category},
      ${row.consentVersion},
      ${row.marketingOptIn},
      ${escapeFormula(String(p.name ?? ''))},
      ${escapeFormula(String(p.email ?? ''))},
      ${p.phone ? escapeFormula(String(p.phone)) : null},
      ${p.country ? escapeFormula(String(p.country)) : null},
      ${p.interest ? escapeFormula(String(p.interest)) : null},
      ${p.message ? escapeFormula(String(p.message)) : null},
      ${p.budgetBand ? escapeFormula(String(p.budgetBand)) : null},
      ${p.targetEmirate ? escapeFormula(String(p.targetEmirate)) : null},
      ${p.timeline ? escapeFormula(String(p.timeline)) : null},
      ${p.investmentObjective ? escapeFormula(String(p.investmentObjective)) : null},
      ${p.residencyGoal ? escapeFormula(String(p.residencyGoal)) : null},
      ${Array.isArray(p.servicesNeeded) ? (p.servicesNeeded as string[]).map(escapeFormula) : null}
    )
    RETURNING id
  `;
  return {id: inserted.id};
}

export async function purgeOldLeads(): Promise<{
  leadsPurged: number;
  webhookDedupePruned: number;
  throttlePruned: number;
}> {
  const leads = await sql`
    DELETE FROM leads
    WHERE last_interaction_at < NOW() - INTERVAL '24 months'
  `;
  const webhooks = await sql`
    DELETE FROM webhook_deliveries
    WHERE received_at < NOW() - INTERVAL '7 days'
  `;
  const throttle = await sql`
    DELETE FROM lead_submission_limits
    WHERE submitted_at < NOW() - INTERVAL '24 hours'
  `;
  return {
    leadsPurged: leads.count ?? 0,
    webhookDedupePruned: webhooks.count ?? 0,
    throttlePruned: throttle.count ?? 0
  };
}
