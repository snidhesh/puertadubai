'use client';

import {useQueryStates, parseAsString, parseAsArrayOf} from 'nuqs';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';

/**
 * URL-synced filter facets. Empty string clears that facet so the URL
 * stays clean (`/projects` instead of `/projects?emirate=&status=`).
 *
 * Keys are kept short for shareable URLs and to read cleanly in analytics
 * payloads.
 */
export type ProjectFilters = {
  emirate: string;
  status: string;
  bedrooms: string;
  developers: string[];
};

export function useProjectFilters() {
  return useQueryStates({
    emirate: parseAsString.withDefault(''),
    status: parseAsString.withDefault(''),
    bedrooms: parseAsString.withDefault(''),
    developers: parseAsArrayOf(parseAsString).withDefault([])
  });
}

export function ProjectFiltersBar({className}: {className?: string}) {
  const t = useTranslations('Projects');
  const [filters, setFilters] = useProjectFilters();
  const emirateOptions = [
    {value: '', label: t('filters.allEmirates')},
    {value: 'dubai', label: 'Dubai'},
    {value: 'abu-dhabi', label: 'Abu Dhabi'},
    {value: 'ras-al-khaimah', label: 'Ras Al Khaimah'},
    {value: 'sharjah', label: 'Sharjah'}
  ];
  const statusOptions = [
    {value: '', label: t('filters.anyStatus')},
    {value: 'off-plan', label: t('filters.offPlan')},
    {value: 'ready', label: t('filters.ready')},
    {value: 'secondary', label: t('filters.secondary')}
  ];
  const bedroomOptions = [
    {value: '', label: t('filters.anyBedrooms')},
    {value: '1', label: '1+'},
    {value: '2', label: '2+'},
    {value: '3', label: '3+'},
    {value: '4', label: '4+'}
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 border-y border-[var(--divider)] py-4',
        className
      )}
    >
      <Select
        label={t('filters.emirate')}
        value={filters.emirate}
        onChange={(v) => setFilters({emirate: v})}
        options={emirateOptions}
      />
      <Select
        label={t('filters.status')}
        value={filters.status}
        onChange={(v) => setFilters({status: v})}
        options={statusOptions}
      />
      <Select
        label={t('filters.bedrooms')}
        value={filters.bedrooms}
        onChange={(v) => setFilters({bedrooms: v})}
        options={bedroomOptions}
      />
      <button
        type="button"
        onClick={() =>
          setFilters({emirate: '', status: '', bedrooms: '', developers: []})
        }
        className="ms-auto text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
        data-ui-label
      >
        {t('filters.reset')}
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{value: string; label: string}>;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[40px] min-w-[10rem] border border-[var(--divider)] bg-[var(--bg)] px-3 text-sm tracking-normal text-[var(--text-body)] focus:border-[var(--accent)] focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function applyClientFilters<
  P extends {emirate: string; status: 'off-plan' | 'ready' | 'secondary' | null; bedroomsMin: number | null}
>(projects: P[], filters: ProjectFilters): P[] {
  return projects.filter((p) => {
    if (filters.emirate && p.emirate !== filters.emirate) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.bedrooms) {
      const min = parseInt(filters.bedrooms, 10);
      if (p.bedroomsMin === null || p.bedroomsMin < min) return false;
    }
    return true;
  });
}
