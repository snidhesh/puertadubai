import {cn} from '@/lib/utils';

/**
 * Editorial image surface with caption overlay. When `src` is a local
 * path under `public/dummy/`, this renders the actual photo behind a
 * subtle gradient so the caption stays readable. When `src` is absent,
 * falls back to a stylised monochrome SVG keyed on `seed`.
 *
 * Stays within the marketing CSP (`img-src 'self' data: https://cdn.sanity.io`).
 */

const PALETTES: ReadonlyArray<readonly [string, string, string]> = [
  ['#0f0f10', '#2a2a2c', '#545458'],
  ['#1a1a1a', '#3a3a3c', '#5e5e62'],
  ['#101012', '#26262a', '#4a4a4e'],
  ['#0a0a0c', '#222228', '#454550'],
  ['#1d1d20', '#33333a', '#54545c'],
  ['#0e0e10', '#28282d', '#4f4f56'],
  ['#15151a', '#2e2e36', '#52525c']
];

type Props = {
  seed: number;
  /** Optional path under /public — when set, renders the real photo. */
  src?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  /** Tailwind aspect class — defaults to `aspect-[4/3]` */
  aspect?: string;
  /** When true, render a stylised "play" glyph for video thumbnails. */
  video?: boolean;
};

export function PlaceholderImage({
  seed,
  src,
  label,
  sublabel,
  className,
  aspect = 'aspect-[4/3]',
  video = false
}: Props) {
  const palette = PALETTES[Math.abs(seed) % PALETTES.length];
  const angle = 35 + ((Math.abs(seed) * 23) % 110);
  const gradId = `g-${seed}`;
  const lineSeed = (Math.abs(seed) * 7) % 360;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-[var(--bg-alt)]',
        aspect,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label ?? ''}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <svg
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} gradientTransform={`rotate(${angle})`}>
              <stop offset="0%" stopColor={palette[0]} />
              <stop offset="60%" stopColor={palette[1]} />
              <stop offset="100%" stopColor={palette[2]} />
            </linearGradient>
            <pattern
              id={`p-${seed}`}
              width="160"
              height="160"
              patternUnits="userSpaceOnUse"
              patternTransform={`rotate(${lineSeed % 180})`}
            >
              <line
                x1="0"
                y1="0"
                x2="160"
                y2="0"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="800" height="600" fill={`url(#${gradId})`} />
          <rect width="800" height="600" fill={`url(#p-${seed})`} />
        </svg>
      )}

      {/* Bottom-half gradient overlay for caption legibility on real photos. */}
      {src && (label || sublabel) && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/40 to-transparent"
          aria-hidden="true"
        />
      )}

      {video && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-black/40 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="ms-1 h-6 w-6 fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      )}

      {(label || sublabel) && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-white">
          {sublabel && (
            <p
              className="text-[10px] uppercase tracking-[0.18em] text-white/70"
              data-ui-label
            >
              {sublabel}
            </p>
          )}
          {label && (
            <p className="font-display text-lg leading-tight md:text-xl drop-shadow">
              {label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
