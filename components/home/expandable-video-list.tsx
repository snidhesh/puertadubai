'use client';

import {Children, useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

/**
 * Wraps a stacked list of video cards and reveals the remaining items
 * behind a "Show more" toggle. Kept as a thin client wrapper so the rest
 * of the home page stays a Server Component.
 */
export function ExpandableVideoList({
  children,
  initialCount = 3
}: {
  children: ReactNode;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const childArray = Children.toArray(children);
  const total = childArray.length;
  const visible = expanded ? childArray : childArray.slice(0, initialCount);
  const hiddenCount = Math.max(0, total - initialCount);

  return (
    <div>
      <ul className="flex flex-col divide-y divide-white/15">
        {visible.map((child, i) => (
          <li key={i} className={i === 0 ? 'pb-5' : 'py-5'}>
            {child}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 flex w-full items-center justify-center gap-3 border border-white/30 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-white/75 transition-colors hover:border-white hover:text-white"
          data-ui-label
        >
          {expanded ? 'Show fewer' : `Show ${hiddenCount} more`}
          <svg
            viewBox="0 0 12 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={cn('h-2 w-3 transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          >
            <path
              d="M1 1.5l5 5 5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
