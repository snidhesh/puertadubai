import Link from 'next/link';
import {requireInternalSession} from '@/lib/internal/require-session';
import {listLeads, type LeadStage} from '@/lib/internal/leads-store';
import {endSession} from '../login/actions';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const STAGES: ReadonlyArray<LeadStage | 'all'> = [
  'all',
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost'
];
const SOURCES = [
  'all',
  'private-circle',
  'golden-visa-inquiry',
  'contact',
  'investment-readiness'
] as const;

type SearchParams = {
  source?: string;
  category?: string;
  stage?: string;
  page?: string;
};

export default async function InternalLeadsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireInternalSession();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1') | 0);
  const offset = (page - 1) * PAGE_SIZE;
  const {items, total} = await listLeads({
    source: params.source ?? null,
    category: params.category ?? null,
    stage: (params.stage as LeadStage) ?? null,
    limit: PAGE_SIZE,
    offset
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--divider)] pb-6">
        <div>
          <p
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
            data-ui-label
          >
            Operator
          </p>
          <h1 className="mt-2 font-display text-3xl">Leads</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {total} record{total === 1 ? '' : 's'} · page {page} of {totalPages}
          </p>
        </div>
        <form action={endSession}>
          <button
            type="submit"
            className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
            data-ui-label
          >
            Sign out
          </button>
        </form>
      </header>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <FilterSelect name="source" label="Source" value={params.source} options={SOURCES} />
        <FilterSelect name="stage" label="Stage" value={params.stage} options={STAGES} />
        <FilterSelect
          name="category"
          label="Category"
          value={params.category}
          options={['all', 'residency-led', 'yield-led', 'business-setup-led', 'exploratory']}
        />
        <button
          type="submit"
          className="h-[40px] border border-[var(--accent)] px-5 text-[11px] uppercase tracking-[0.12em] hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]"
          data-ui-label
        >
          Apply
        </button>
      </form>

      <div className="mt-8 overflow-x-auto border border-[var(--divider)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg-alt)] text-left">
            <tr>
              <Th>When</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Country</Th>
              <Th>Source</Th>
              <Th>Category</Th>
              <Th>Stage</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--text-muted)]">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              items.map((lead) => (
                <tr key={lead.id} className="border-t border-[var(--divider)]">
                  <Td>
                    <time dateTime={lead.created_at.toISOString()}>
                      {lead.created_at.toLocaleString('en')}
                    </time>
                  </Td>
                  <Td>{lead.name}</Td>
                  <Td className="text-[var(--text-muted)]">{lead.email}</Td>
                  <Td>{lead.country ?? '—'}</Td>
                  <Td>{lead.source}</Td>
                  <Td>{lead.lead_category ?? '—'}</Td>
                  <Td>{lead.stage}</Td>
                  <Td>
                    <Link
                      href={`/internal/leads/${lead.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      View
                    </Link>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em]" data-ui-label>
          {page > 1 && (
            <Link
              href={`/internal/leads?${new URLSearchParams({...stringifyParams(params), page: String(page - 1)})}`}
              className="hover:text-[var(--accent)]"
            >
              ← Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/internal/leads?${new URLSearchParams({...stringifyParams(params), page: String(page + 1)})}`}
              className="ms-auto hover:text-[var(--accent)]"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}

function stringifyParams(params: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) out[k] = String(v);
  }
  return out;
}

function FilterSelect({
  name,
  label,
  value,
  options
}: {
  name: string;
  label: string;
  value: string | undefined;
  options: readonly string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
      <span>{label}</span>
      <select
        name={name}
        defaultValue={value ?? 'all'}
        className="h-[40px] min-w-[10rem] border border-[var(--divider)] bg-[var(--bg)] px-3 text-sm tracking-normal text-[var(--text-body)] focus:border-[var(--accent)] focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Th({children}: {children?: React.ReactNode}) {
  return (
    <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
      {children}
    </th>
  );
}

function Td({children, className}: {children?: React.ReactNode; className?: string}) {
  return <td className={`px-4 py-3 align-top ${className ?? ''}`}>{children}</td>;
}
