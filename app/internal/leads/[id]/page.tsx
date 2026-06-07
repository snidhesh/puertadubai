import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireInternalSession} from '@/lib/internal/require-session';
import {getLead} from '@/lib/internal/leads-store';
import {updateStage} from './actions';

export const dynamic = 'force-dynamic';

const STAGES = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const;

type Props = {params: Promise<{id: string}>};

export default async function InternalLeadDetailPage({params}: Props) {
  await requireInternalSession();
  const {id} = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const updateStageBoundToId = updateStage.bind(null, id);

  return (
    <main className="mx-auto max-w-[800px] px-6 py-10 md:px-10">
      <Link
        href="/internal/leads"
        className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
        data-ui-label
      >
        ← All leads
      </Link>

      <header className="mt-6 border-b border-[var(--divider)] pb-6">
        <p
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
          data-ui-label
        >
          {lead.source} · {lead.locale}
        </p>
        <h1 className="mt-2 font-display text-3xl">{lead.name}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Submitted <time dateTime={lead.created_at.toISOString()}>{lead.created_at.toLocaleString('en')}</time>
        </p>
      </header>

      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Email" value={
          <a href={`mailto:${lead.email}`} className="hover:text-[var(--accent)]">
            {lead.email}
          </a>
        } />
        <Field label="Phone" value={lead.phone ?? '—'} />
        <Field label="Country" value={lead.country ?? '—'} />
        <Field label="Category" value={lead.lead_category ?? '—'} />
        {lead.interest && <Field label="Interest" value={lead.interest} />}
        {lead.budget_band && <Field label="Budget" value={lead.budget_band} />}
        {lead.target_emirate && <Field label="Target emirate" value={lead.target_emirate} />}
        {lead.timeline && <Field label="Timeline" value={lead.timeline} />}
        {lead.investment_obj && <Field label="Objective" value={lead.investment_obj} />}
        {lead.residency_goal && <Field label="Residency goal" value={lead.residency_goal} />}
        {lead.services_needed && lead.services_needed.length > 0 && (
          <Field label="Services" value={lead.services_needed.join(', ')} />
        )}
        <Field
          label="Consent"
          value={`${lead.consent_version} · marketing opt-in: ${lead.marketing_opt_in ? 'yes' : 'no'}`}
        />
      </dl>

      {lead.message && (
        <section className="mt-8">
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            data-ui-label
          >
            Message
          </p>
          <p className="mt-2 whitespace-pre-wrap text-base text-[var(--text-body)]">
            {lead.message}
          </p>
        </section>
      )}

      <form action={updateStageBoundToId} className="mt-10 flex flex-wrap items-end gap-3 border-t border-[var(--divider)] pt-6">
        <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          <span>Stage</span>
          <select
            name="stage"
            defaultValue={lead.stage}
            className="h-[40px] min-w-[10rem] border border-[var(--divider)] bg-[var(--bg)] px-3 text-sm tracking-normal text-[var(--text-body)] focus:border-[var(--accent)] focus:outline-none"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-[40px] border border-[var(--accent)] bg-[var(--accent)] px-5 text-[11px] uppercase tracking-[0.12em] text-[var(--text-on-dark)] hover:bg-[var(--hover)]"
          data-ui-label
        >
          Update stage
        </button>
      </form>

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Stage history isn&apos;t persisted (the schema stores the current
        stage only). Add a `lead_stage_events` table later if history
        becomes needed.
      </p>
    </main>
  );
}

function Field({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <div>
      <dt
        className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
        data-ui-label
      >
        {label}
      </dt>
      <dd className="mt-1 text-base text-[var(--text-body)]">{value}</dd>
    </div>
  );
}
