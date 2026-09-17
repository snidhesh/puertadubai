'use client';

import {useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';
import {PlayGlyph} from '@/components/home/play-glyph';

/**
 * Card deck for the Media section — a "2D rotation" carousel.
 *
 * Two compositions, chosen purely in CSS (see `.media-deck` in
 * globals.css), so the server render is exact at any width:
 *
 * - Tablet and up: a fan. The front card stands upright at full size and
 *   every card beside it is rotated, dropped, scaled down and faded a
 *   little more per step, two visible on each side.
 * - Phone: a stacked pile. The front card fills the width; the next
 *   three rise behind it with alternating tilts. A swipe throws the
 *   front card off to the side and the pile steps forward.
 *
 * The ring is continuous. Interaction: tap a side card, drag or swipe
 * (the front card follows the finger), the arrow buttons, and arrow keys
 * once the deck has focus. A gentle auto-advance runs until the visitor
 * touches the deck, pauses on hover, and is off under reduced motion.
 *
 * This file only decides each card's ring position; every pose,
 * transition and mirror for RTL lives in the stylesheet.
 */

export type MediaSlide = {
  id: string;
  image?: string;
  fit?: 'cover' | 'contain';
  href?: string;
  video?: boolean;
  kicker: string;
  title: string;
  body: string;
  alt: string;
};

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 48;
/** Drag distance that reads as "intent", below which a press is a click. */
const DRAG_SLOP_PX = 6;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Signed distance from the front card on a ring of `total` cards. */
function ringOffset(index: number, active: number, total: number) {
  const half = Math.floor(total / 2);
  return ((index - active + total + half) % total) - half;
}

export function MediaCarousel({slides, dir = 'ltr'}: {slides: MediaSlide[]; dir?: 'ltr' | 'rtl'}) {
  const t = useTranslations('Home.media');
  const total = slides.length;
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLElement | null)[]>([]);
  const drag = useRef<{x: number; y: number; moved: boolean} | null>(null);
  const suppressClick = useRef(false);
  const mirror = dir === 'rtl' ? -1 : 1;

  const goTo = useCallback((index: number) => setActive(((index % total) + total) % total), [total]);
  const next = useCallback(() => goTo(active + 1), [goTo, active]);
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);

  // Auto-advance until the visitor engages; never under reduced motion.
  useEffect(() => {
    if (touched || hovering || reducedMotion()) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setActive((a) => (a + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [touched, hovering, total]);

  const engage = () => setTouched(true);

  // ── Drag: the front card follows the pointer, then either flies on or
  //    settles back. Direct DOM writes keep this off the render path.
  const frontEl = () => cardEls.current[active];
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = {x: e.clientX, y: e.clientY, moved: false};
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_SLOP_PX || Math.abs(dx) < Math.abs(dy)) return;
      d.moved = true;
      stageRef.current?.setAttribute('data-dragging', '');
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const el = frontEl();
    if (el) {
      el.style.transform = `translateX(calc(-50% * var(--m))) translateX(${dx}px) rotate(${dx / 18}deg)`;
    }
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = cancelled ? 0 : e.clientX - d.x;
    stageRef.current?.removeAttribute('data-dragging');
    const el = frontEl();
    if (el) el.style.transform = '';
    if (!d.moved) return;
    suppressClick.current = true;
    engage();
    if (Math.abs(dx) < SWIPE_PX) return;
    // Pulling toward the start of the reading direction reveals the next
    // card (mirrored on RTL pages).
    if (dx * mirror < 0) next();
    else prev();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === forward) next();
    else if (e.key === back) prev();
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(total - 1);
    else return;
    e.preventDefault();
    engage();
  };

  const current = slides[active];

  return (
    <section aria-roledescription="carousel" aria-label={t('carouselLabel')}>
      {/* Stage. Room above for the phone pile, below for the fan's drop. */}
      <div
        ref={stageRef}
        className="media-deck group/stage relative mx-auto h-[calc(var(--card-w)*1.25+3.5rem)] w-full touch-pan-y select-none [--card-w:min(100vw_-_3rem,340px)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--text-title)] md:h-[calc(var(--card-w)*1.25+2.5rem)] md:[--card-w:340px] lg:[--card-w:380px]"
        tabIndex={0}
        aria-label={t('carouselLabel')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e)}
        onPointerCancel={(e) => endDrag(e, true)}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {slides.map((slide, i) => {
          const r = (i - active + total) % total;
          return (
            <Card
              key={slide.id}
              ref={(el) => {
                cardEls.current[i] = el;
              }}
              slide={slide}
              index={i}
              ring={r}
              offset={ringOffset(i, active, total)}
              isPrev={r === total - 1}
              slideLabel={t('slideOf', {index: i + 1, total})}
              watchLabel={t('watchOnYouTube')}
              onFocusCard={() => {
                if (suppressClick.current) {
                  suppressClick.current = false;
                  return true;
                }
                engage();
                goTo(i);
                return false;
              }}
            />
          );
        })}
      </div>

      {/* Caption for the front card. Left-set under a hairline on phones,
       * centred on wider screens. Re-keyed so it fades in on change. */}
      <div
        className="mt-8 border-t border-[var(--divider)] pt-6 md:mx-auto md:mt-12 md:max-w-xl md:border-0 md:pt-0 md:text-center"
        aria-live="polite"
      >
        <div key={current.id} className="motion-safe:animate-[mediaCaptionIn_600ms_ease-out_both]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]" data-ui-label>
            {current.kicker}
          </p>
          <h3 className="mt-3 font-display text-[1.75rem] leading-[1.1] text-[var(--text-title)] md:mt-4 md:text-3xl md:leading-[1.15] lg:text-4xl">
            {current.title}
          </h3>
          <p className="mt-4 text-sm leading-[1.7] text-[var(--text-body)] md:text-base">{current.body}</p>
          {current.href && (
            <a
              href={current.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-[var(--text-title)]/40 pb-1 text-[11px] uppercase tracking-[0.22em] text-[var(--text-title)] transition-colors hover:border-[var(--text-title)] md:mt-6"
              data-ui-label
            >
              {t('watchOnYouTube')}
              <Arrow className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Controls. Phone: counter and swipe hint start, arrows end.
       * Wider: one centred row. */}
      <div className="mt-8 flex items-center justify-between gap-6 md:mt-12 md:justify-center md:gap-8">
        <p className="flex items-baseline gap-4 font-display text-sm tracking-[0.22em] text-[var(--text-title)] md:order-2">
          {/* Direction-isolated so "01 / 06" keeps its order on Arabic pages. */}
          <bdi dir="ltr">
            {pad(active + 1)}
            <span className="mx-2 text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-muted)]">{pad(total)}</span>
          </bdi>
          <span
            className={cn(
              'font-sans text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] transition-opacity duration-500 md:hidden',
              touched && 'opacity-0'
            )}
            aria-hidden="true"
            data-ui-label
          >
            {t('swipeHint')}
          </span>
        </p>
        <div className="flex gap-3 md:contents">
          <CarouselButton label={t('previous')} onClick={() => { engage(); prev(); }} direction="prev" className="md:order-1" />
          <CarouselButton label={t('next')} onClick={() => { engage(); next(); }} direction="next" className="md:order-3" />
        </div>
      </div>

      <style>{`
        @keyframes mediaCaptionIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function Card({
  ref,
  slide,
  index,
  ring,
  offset,
  isPrev,
  slideLabel,
  watchLabel,
  onFocusCard
}: {
  ref: (el: HTMLElement | null) => void;
  slide: MediaSlide;
  index: number;
  /** Position in the ring counted from the front card (0 = front). */
  ring: number;
  /** Signed distance from the front card (fan layout). */
  offset: number;
  /** The card we just came from — waits off-stage in the pile layout. */
  isPrev: boolean;
  slideLabel: string;
  watchLabel: string;
  /** Returns true when the click should be swallowed (it ended a drag). */
  onFocusCard: () => boolean;
}) {
  const isActive = ring === 0;
  const matted = slide.fit === 'contain';
  const shell = cn(
    'absolute start-1/2 top-14 block w-[var(--card-w)] overflow-hidden bg-[var(--bg-dark)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] will-change-transform md:top-0',
    !isActive && 'cursor-pointer',
    isActive && slide.href && 'group cursor-pointer'
  );

  const face = (
    <div className="relative aspect-[4/5] w-full">
      {slide.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.image}
          alt={isActive ? slide.alt : ''}
          loading={index < 3 ? 'eager' : 'lazy'}
          draggable={false}
          className={cn('absolute inset-0 h-full w-full', matted ? 'object-contain p-5 md:p-8' : 'object-cover object-top')}
        />
      ) : (
        // No visual asset yet — a typographic placard so nothing fabricated is shown.
        <p
          className="absolute inset-x-0 bottom-0 p-6 font-display text-2xl leading-[1.15] !text-white md:p-8 md:text-3xl"
          style={{color: '#ffffff'}}
        >
          {slide.title}
        </p>
      )}
      {/* Index (and, with room, the kicker) on the card face. */}
      <div
        className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/55 to-transparent p-5 md:p-6"
        aria-hidden="true"
      >
        <span
          className="hidden text-[11px] uppercase tracking-[0.22em] !text-white/80 sm:inline"
          style={{color: 'rgba(255,255,255,0.8)'}}
          data-ui-label
        >
          {slide.kicker}
        </span>
        <span
          className="ms-auto shrink-0 font-display text-[11px] tracking-[0.22em] !text-white/80"
          style={{color: 'rgba(255,255,255,0.8)'}}
        >
          <bdi>{pad(index + 1)}</bdi>
        </span>
      </div>
      {slide.video && isActive && <PlayGlyph />}
    </div>
  );

  const shared = {
    ref,
    className: shell,
    role: 'group' as const,
    'aria-roledescription': 'slide',
    'aria-label': slide.href ? `${slideLabel} — ${watchLabel}: ${slide.title}` : slideLabel,
    'aria-hidden': !isActive || undefined,
    'data-slide': '',
    'data-r': ring,
    'data-o': offset,
    'data-prev': isPrev || undefined,
    'data-active': isActive || undefined
  };

  // The front card links out when it has a destination; any other card
  // brings itself to the front instead.
  if (slide.href) {
    return (
      <a
        {...shared}
        ref={ref as (el: HTMLAnchorElement | null) => void}
        href={slide.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={isActive ? 0 : -1}
        draggable={false}
        onClick={(e) => {
          const swallow = onFocusCard();
          if (swallow || !isActive) e.preventDefault();
        }}
      >
        {face}
      </a>
    );
  }
  return (
    <div
      {...shared}
      ref={ref as (el: HTMLDivElement | null) => void}
      onClick={() => {
        if (!isActive) onFocusCard();
      }}
    >
      {face}
    </div>
  );
}

function Arrow({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('rtl:scale-x-[-1]', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h17M14 6l6 6-6 6" />
    </svg>
  );
}

function CarouselButton({
  label,
  onClick,
  direction,
  className
}: {
  label: string;
  onClick: () => void;
  direction: 'prev' | 'next';
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full border border-[var(--text-title)]/30 text-[var(--text-title)] transition-[border-color,background-color,color] duration-300 hover:border-[var(--text-title)] hover:bg-[var(--text-title)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-title)]',
        className
      )}
    >
      <Arrow className={cn('h-4 w-4', direction === 'prev' && 'scale-x-[-1] rtl:scale-x-100')} />
    </button>
  );
}
