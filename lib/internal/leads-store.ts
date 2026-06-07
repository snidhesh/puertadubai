import {sql} from '@/lib/db/client';

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type LeadRow = {
  id: string;
  source: string;
  locale: string;
  lead_category: string | null;
  stage: LeadStage;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  interest: string | null;
  message: string | null;
  budget_band: string | null;
  target_emirate: string | null;
  timeline: string | null;
  investment_obj: string | null;
  residency_goal: string | null;
  services_needed: string[] | null;
  consent_version: string;
  marketing_opt_in: boolean;
  notes: string | null;
  created_at: Date;
  last_interaction_at: Date;
};

export type LeadListItem = Pick<
  LeadRow,
  'id' | 'source' | 'locale' | 'lead_category' | 'stage' | 'name' | 'email' | 'country' | 'created_at'
>;

export async function listLeads(opts: {
  source?: string | null;
  category?: string | null;
  stage?: LeadStage | null;
  limit: number;
  offset: number;
}): Promise<{items: LeadListItem[]; total: number}> {
  const source = opts.source && opts.source !== 'all' ? opts.source : null;
  const category = opts.category && opts.category !== 'all' ? opts.category : null;
  const stage = opts.stage && opts.stage !== ('all' as LeadStage) ? opts.stage : null;

  const items = await sql<LeadListItem[]>`
    SELECT id, source, locale, lead_category, stage, name, email, country, created_at
    FROM leads
    WHERE (${source}::text IS NULL OR source = ${source})
      AND (${category}::text IS NULL OR lead_category = ${category})
      AND (${stage}::text IS NULL OR stage = ${stage})
    ORDER BY created_at DESC
    LIMIT ${opts.limit} OFFSET ${opts.offset}
  `;
  const [{count}] = await sql<{count: number}[]>`
    SELECT count(*)::int AS count
    FROM leads
    WHERE (${source}::text IS NULL OR source = ${source})
      AND (${category}::text IS NULL OR lead_category = ${category})
      AND (${stage}::text IS NULL OR stage = ${stage})
  `;
  return {items, total: Number(count)};
}

export async function getLead(id: string): Promise<LeadRow | null> {
  const rows = await sql<LeadRow[]>`SELECT * FROM leads WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<void> {
  await sql`
    UPDATE leads
    SET stage = ${stage}, last_interaction_at = NOW()
    WHERE id = ${id}
  `;
}
