import type {Metadata} from 'next';
import Image from 'next/image';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {getAllAreas} from '@/lib/areas/data';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {params: Promise<{locale: Locale}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Areas.index'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default async function AreasIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Areas.index'});
  const areas = getAllAreas(locale);

  return (
    <Section>
      <Container>
        <p
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
          data-ui-label
        >
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">{t('heading')}</h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--text-body)]">
          {t('subtitle')}
        </p>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {areas.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/areas/${area.slug}`}
                className="group flex h-full flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-alt)]">
                  <Image
                    src={area.heroImage}
                    alt={area.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 pt-6">
                  <p
                    className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {area.emirate}
                  </p>
                  <h2 className="font-display text-2xl text-[var(--text-title)] transition-colors group-hover:text-[var(--accent)]">
                    {area.name}
                  </h2>
                  {area.summary && (
                    <p className="text-sm text-[var(--text-body)]">{area.summary}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
