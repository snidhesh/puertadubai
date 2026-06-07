'use client';

import {useQueryStates, parseAsString} from 'nuqs';
import {forwardRef, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

type Source = 'hero' | 'gv' | 'sticky' | 'areas-cta' | 'nav' | 'footer';

/**
 * Button that opens the Private Circle modal. URL state holds ONLY
 * `pc=open` and `pc_src=<source>`. Name / email / phone / country are
 * NEVER reflected to the URL (would leak via history, referrer headers,
 * server logs, share buttons, analytics).
 */
export const PrivateCircleTrigger = forwardRef<
  HTMLButtonElement,
  {
    source: Source;
    children: ReactNode;
    className?: string;
    variant?: 'solid' | 'ghost' | 'link';
  }
>(function PrivateCircleTrigger({source, children, className, variant = 'solid'}, ref) {
  const [, setState] = useQueryStates({
    pc: parseAsString.withDefault(''),
    pc_src: parseAsString.withDefault('')
  });

  const styles = cn(
    'inline-flex h-[45px] items-center justify-center px-8',
    'text-[12px] font-medium uppercase tracking-[0.08em]',
    'transition-colors duration-200 ease-out',
    variant === 'solid' &&
      'border border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-dark)] hover:bg-[var(--hover)]',
    variant === 'ghost' &&
      'border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--text-on-dark)]',
    variant === 'link' && 'border-0 px-0 text-[var(--accent)] hover:underline',
    className
  );

  return (
    <button
      ref={ref}
      type="button"
      className={styles}
      data-ui-label
      onClick={() => setState({pc: 'open', pc_src: source})}
    >
      {children}
    </button>
  );
});
