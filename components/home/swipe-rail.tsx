'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

/**
 * Phone-only horizontal rail. Below `md` the children sit in a snap row, each
 * ~82% wide so the next card peeks in, with a hairline progress track and an
 * "01 / 05" counter underneath. From `md` up the scroller takes whatever
 * layout `className` gives it (a grid, or `md:contents` so the children join
 * the parent grid) and the progress row disappears.
 *
 * The item count is read from the DOM, so it follows children streamed in
 * through a Suspense boundary as well as plain lists.
 */
export function SwipeRail({
  children,
  as: Tag = 'div',
  className,
  wrapperClassName,
  tone = 'light'
}: {
  children: ReactNode;
  as?: 'div' | 'ul';
  /** Layout from `md` up, e.g. `md:grid md:grid-cols-2 md:gap-6`. */
  className?: string;
  wrapperClassName?: string;
  tone?: 'light' | 'dark';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.children;
    setCount(items.length);
    if (items.length < 2) return setIndex(0);
    // scrollLeft runs negative in RTL, so work with magnitudes throughout.
    const step = Math.abs((items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft) || 1;
    const scrolled = Math.abs(el.scrollLeft);
    // The last card can't reach the snap start, so the end of the track is
    // the last item.
    const atEnd = scrolled + el.clientWidth >= el.scrollWidth - 2;
    setIndex(atEnd ? items.length - 1 : Math.round(scrolled / step));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), measure()));
    };
    schedule();
    el.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(el, {childList: true});
    return () => {
      el.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={cn('min-w-0', wrapperClassName)}>
      <Tag
        ref={(node: HTMLElement | null) => {
          ref.current = node;
        }}
        className={cn(
          '-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-6 px-6',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[&>*]:w-[82%] [&>*]:max-w-[22rem] [&>*]:shrink-0 [&>*]:snap-start',
          'md:mx-0 md:overflow-visible md:px-0 md:[&>*]:w-auto md:[&>*]:max-w-none',
          className
        )}
      >
        {children}
      </Tag>
      {count > 1 && (
        <div
          aria-hidden="true"
          className={cn(
            'mt-6 flex items-center gap-4 md:hidden',
            tone === 'dark' ? 'text-white/70' : 'text-[var(--text-muted)]'
          )}
        >
          <span className="relative h-px flex-1 bg-current opacity-30">
            <span
              className="absolute inset-y-0 bg-current transition-[inset-inline-start] duration-300 ease-out"
              style={{width: `${100 / count}%`, insetInlineStart: `${(index * 100) / count}%`}}
            />
          </span>
          <span className="text-[11px] tabular-nums tracking-[0.18em]">
            {pad(index + 1)} / {pad(count)}
          </span>
        </div>
      )}
    </div>
  );
}
