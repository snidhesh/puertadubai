import type {HTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

/**
 * Editorial container — generous side padding, max-width capped at 1280
 * so headlines retain their print-like proportions on wide screens.
 */
export function Container({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-16',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Alternating-band section — Mahsheed-style vertical rhythm. `tone="alt"`
 * paints `--bg-alt` (#f5f5f5); default keeps `--bg` (#ffffff).
 */
type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: 'default' | 'alt' | 'dark';
};

export function Section({
  className,
  tone = 'default',
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        'py-12 md:py-[70px] lg:py-[120px]',
        tone === 'alt' && 'bg-[var(--bg-alt)]',
        tone === 'dark' && 'bg-[var(--bg-dark)] text-[var(--text-on-dark)]',
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
