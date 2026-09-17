import {cn} from '@/lib/utils';

/** Circular play affordance layered over a video still. Hooks-free so it
 * renders in both Server and Client Components. */
export function PlayGlyph({size = 'md'}: {size?: 'sm' | 'md' | 'lg'}) {
  const ring = {
    sm: 'h-8 w-8',
    md: 'h-14 w-14 md:h-16 md:w-16',
    lg: 'h-16 w-16 md:h-20 md:w-20'
  }[size];
  const glyph = {sm: 'ms-0.5 h-3 w-3', md: 'ms-1 h-5 w-5 md:h-6 md:w-6', lg: 'ms-1 h-6 w-6 md:h-8 md:w-8'}[size];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center rounded-full border border-white/80 bg-black/45 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110',
          ring
        )}
      >
        <svg viewBox="0 0 24 24" className={cn('fill-white', glyph)} aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}
