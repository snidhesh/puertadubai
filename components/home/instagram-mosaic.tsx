import Image from 'next/image';
import {cn} from '@/lib/utils';
import {PlayGlyph} from '@/components/home/play-glyph';

export type MosaicTile = {
  id: string;
  image: string;
  permalink: string;
  video?: boolean;
  focus?: 'top' | 'center';
};

/**
 * Editorial mosaic of Instagram posts: the first tile is the hero (full
 * width on phones, a 2×2 block from `md`), the next six are small squares
 * that complete a 5-column, 2-row grid. Each tile links to its post.
 * Server Component — works for both the curated set (local images) and
 * the live feed (CDN images through next/image).
 */
export function InstagramMosaic({
  tiles,
  labelFor
}: {
  tiles: ReadonlyArray<MosaicTile>;
  /** Accessible name for the n-th tile, e.g. "View post 3 on Instagram". */
  labelFor: (n: number) => string;
}) {
  if (tiles.length === 0) return null;
  return (
    <ul className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 md:mt-12 md:grid-cols-5 md:gap-4">
      {tiles.slice(0, 7).map((post, i) => {
        const hero = i === 0;
        return (
          <li key={post.id} className={cn(hero && 'col-span-3 md:col-span-2 md:row-span-2')}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={labelFor(i + 1)}
              className="group relative block aspect-square overflow-hidden bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Image
                src={post.image}
                alt=""
                fill
                sizes={
                  hero
                    ? '(min-width: 1280px) 480px, (min-width: 768px) 40vw, 100vw'
                    : '(min-width: 1280px) 220px, (min-width: 768px) 20vw, 33vw'
                }
                className={cn(
                  'object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]',
                  post.focus === 'top' && 'object-top'
                )}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20"
              />
              {post.video && <PlayGlyph size={hero ? 'md' : 'sm'} />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
