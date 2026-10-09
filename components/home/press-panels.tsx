'use client';

import {useId, useState} from 'react';
import {cn} from '@/lib/utils';

export type PressPanelItem = {
  id: string;
  image?: string;
  /** Where the crop anchors; defaults to the top so magazine mastheads survive. */
  focus?: 'top' | 'center';
  href?: string;
  /** Label for the `href` link, e.g. "Watch on YouTube" / "View on LinkedIn". */
  linkLabel?: string;
  /** Short outlet name: set vertically on a collapsed panel, and on each phone row. */
  label: string;
  kicker: string;
  title: string;
  body: string;
  alt: string;
};

/**
 * Click-to-expand press features, after the "International Properties"
 * band on blackoak-re.com. From `md` up the items sit in one row of image
 * panels: the open one widens (flex-grow 4 against 1) to reveal a frosted
 * caption card, the rest collapse to strips carrying the outlet name set
 * vertically. On phones the same items stack as an accordion of image
 * rows, the open row showing a 16:9 crop above its caption. One panel is
 * always open on the row; phone rows can be closed again.
 *
 * Thin client component: copy is translated by the server page and passed
 * in, so the rest of the home page stays a Server Component.
 */
export function PressPanels({items}: {items: PressPanelItem[]}) {
  const [active, setActive] = useState<number | null>(0);
  const baseId = useId();
  // The row never shows every panel collapsed; fall back to the first.
  const rowActive = active ?? 0;

  return (
    <>
      {/* Tablet and desktop: one row of expanding panels. */}
      <ul className="hidden h-[420px] overflow-hidden md:flex lg:h-[480px]">
        {items.map((item, i) => {
          const open = i === rowActive;
          const panelId = `${baseId}-panel-${i}`;
          return (
            <li
              key={item.id}
              className="relative min-w-0 basis-0 overflow-hidden border-e border-white/15 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] last:border-e-0 motion-reduce:transition-none"
              style={{flexGrow: open ? 4 : 1}}
            >
              <PanelImage item={item} />
              <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

              {/* Collapsed state: the whole strip is the button. */}
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={open}
                aria-controls={panelId}
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-[opacity,visibility] duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white',
                  open ? 'invisible opacity-0' : 'visible opacity-100 delay-200'
                )}
              >
                <span
                  className="-rotate-90 whitespace-nowrap text-base uppercase tracking-[0.4em] !text-white lg:text-lg"
                  style={{color: '#ffffff'}}
                  data-ui-label
                >
                  {item.label}
                </span>
              </button>

              {/* Open state: frosted caption card pinned to the bottom. */}
              <div
                id={panelId}
                className={cn(
                  'absolute inset-0 flex flex-col justify-end p-8 transition-[opacity,visibility] duration-500 lg:p-10',
                  open ? 'visible opacity-100 delay-300' : 'invisible opacity-0'
                )}
              >
                {!item.image && (
                  <p
                    aria-hidden="true"
                    className="absolute start-8 top-8 max-w-sm font-display text-4xl leading-[1.05] text-white/25 lg:start-10 lg:top-10 lg:text-5xl"
                  >
                    {item.title}
                  </p>
                )}
                <div className="relative max-w-md bg-black/65 p-7 backdrop-blur-sm lg:p-8">
                  <h3
                    className="font-display text-2xl leading-tight !text-white lg:text-[28px]"
                    style={{color: '#ffffff'}}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/60"
                    data-ui-label
                  >
                    {item.kicker}
                  </p>
                  <p className="mt-4 text-sm leading-[1.7] text-white/80">{item.body}</p>
                  {item.href && item.linkLabel && <PanelLink href={item.href} label={item.linkLabel} />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Phones: stacked accordion of image rows. */}
      <ul className="md:hidden">
        {items.map((item, i) => {
          const open = i === active;
          const rowId = `${baseId}-row-${i}`;
          return (
            <li key={item.id} className="border-x border-t border-white/10 last:border-b">
              <button
                type="button"
                onClick={() => setActive(open ? null : i)}
                aria-expanded={open}
                aria-controls={rowId}
                className="relative block h-16 w-full overflow-hidden text-start focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
              >
                <PanelImage item={item} decorative />
                <span className="absolute inset-0 bg-black/60" aria-hidden="true" />
                <span className="relative flex h-full items-center justify-between gap-4 px-5">
                  <span className="text-base tracking-wide !text-white" style={{color: '#ffffff'}}>
                    {item.label}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    className={cn(
                      'h-4 w-4 shrink-0 text-white transition-transform duration-300',
                      open && 'rotate-45'
                    )}
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div
                id={rowId}
                inert={!open}
                className={cn(
                  'grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none',
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="bg-black/35">
                    {item.image && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <PanelImage item={item} />
                        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
                      </div>
                    )}
                    <div className="p-5">
                      <p
                        className="text-[11px] uppercase tracking-[0.2em] text-white/60"
                        data-ui-label
                      >
                        {item.kicker}
                      </p>
                      <h3
                        className="mt-2 font-display text-xl leading-tight !text-white"
                        style={{color: '#ffffff'}}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-[1.7] text-white/75">{item.body}</p>
                      {item.href && item.linkLabel && <PanelLink href={item.href} label={item.linkLabel} />}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Fill image, anchored to the top unless the item asks for a centred crop.
 * An item without an image gets a faint tone instead — nothing fabricated. */
function PanelImage({item, decorative = false}: {item: PressPanelItem; decorative?: boolean}) {
  if (!item.image) {
    return <span className="absolute inset-0 bg-white/[0.06]" aria-hidden="true" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.image}
      alt={decorative ? '' : item.alt}
      loading="lazy"
      className={cn(
        'absolute inset-0 h-full w-full object-cover',
        item.focus === 'center' ? 'object-center' : 'object-top'
      )}
    />
  );
}

function PanelLink({href, label}: {href: string; label: string}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative before:absolute before:inset-x-0 before:-inset-y-3 before:content-[''] mt-5 inline-flex w-fit items-center gap-2 border-b border-white/40 pb-1 text-[11px] uppercase tracking-[0.25em] !text-white transition-colors hover:border-white"
      style={{color: '#ffffff'}}
      data-ui-label
    >
      {label}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 rtl:scale-x-[-1]"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </a>
  );
}
