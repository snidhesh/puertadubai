'use client';

import {useId, useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

/**
 * Phone-only accordion row. Below `md` the heading becomes a full-width
 * button (with the same plus glyph as the press accordion) and the content
 * stays folded until tapped; from `md` up the plain heading and the content
 * render as they always did. Each viewport only ever sees one of the two
 * headings, so assistive tech never hears it twice.
 */
export function MobileDisclosure({
  heading,
  as: Heading = 'h3',
  headingClassName,
  buttonClassName,
  className,
  contentClassName,
  uiLabel = false,
  children
}: {
  heading: ReactNode;
  /** Small-caps UI label heading: opts into the Arabic no-case/no-tracking rule. */
  uiLabel?: boolean;
  as?: 'h3' | 'p';
  /** Desktop heading styles (also the base for the phone button). */
  headingClassName?: string;
  /** Phone-only additions for the button, e.g. its text colour on dark bands. */
  buttonClassName?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={className}>
      <Heading className={cn(headingClassName, 'max-md:hidden')} data-ui-label={uiLabel || undefined}>
        {heading}
      </Heading>
      <Heading className="md:hidden">
        <button
          type="button"
          data-ui-label={uiLabel || undefined}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            headingClassName,
            'flex w-full items-center justify-between gap-4 py-4 text-start',
            buttonClassName
          )}
        >
          <span>{heading}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className={cn('h-4 w-4 shrink-0 transition-transform duration-300', open && 'rotate-45')}
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </Heading>
      <div id={id} className={cn(contentClassName, !open && 'max-md:hidden')}>
        {children}
      </div>
    </div>
  );
}
