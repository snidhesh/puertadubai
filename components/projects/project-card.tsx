import {Link} from '@/lib/i18n/navigation';
import {urlFor} from '@/lib/sanity/image';
import type {ProjectCard as ProjectCardType} from '@/lib/sanity/queries';

function formatPrice(value: number | null, currency: string | null): string | null {
  if (value === null) return null;
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency ?? 'AED',
    maximumFractionDigits: 0
  }).format(value);
}

export function ProjectCard({project}: {project: ProjectCardType}) {
  const price = formatPrice(project.priceFrom, project.currency);
  const imageSrc =
    project.heroImage?.asset && urlFor(project.heroImage).width(800).height(600).fit('crop').url();

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col gap-3 transition-opacity hover:opacity-90"
    >
      <div className="aspect-[4/3] bg-[var(--bg-alt)] overflow-hidden">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Image pending
          </div>
        )}
      </div>
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
          data-ui-label
        >
          {project.emirate}
          {project.developer?.name && <> · {project.developer.name}</>}
        </p>
        <h3 className="mt-2 font-display text-xl md:text-2xl text-[var(--text-title)] group-hover:text-[var(--accent)]">
          {project.title}
        </h3>
        {price && (
          <p className="mt-1 text-sm text-[var(--text-body)]">
            From <bdi>{price}</bdi>
          </p>
        )}
      </div>
    </Link>
  );
}
