import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {client} from '@/lib/sanity/client';
import {localized} from '@/lib/sanity/i18n';
import {routing, type Locale} from '@/lib/i18n/routing';

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Press releases and editorial coverage from Puerta Dubai.'
};

type PressCard = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  source: 'in-house' | 'external';
  externalUrl: string | null;
  excerpt: string | null;
};

async function getPress(locale: Locale): Promise<PressCard[]> {
  return client
    .fetch<PressCard[]>(
      `*[_type == "pressArticle"] | order(coalesce(publishedAt, _createdAt) desc){
        _id,
        ${localized('title')},
        "slug": slug.current,
        publishedAt,
        source,
        externalUrl,
        ${localized('excerpt')}
      }`,
      {locale}
    )
    .catch(() => []);
}

type Props = {params: Promise<{locale: Locale}>};

export default async function PressIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const articles = await getPress(locale);

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          Editorial
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          Press &amp; perspectives.
        </h1>
        {articles.length === 0 ? (
          <p className="mt-12 max-w-md rounded-sm border border-dashed border-[var(--divider)] p-6 text-sm text-[var(--text-muted)]">
            No press articles have been published yet. Anti-fabrication rule:
            in-house announcements only until third-party coverage is real.
          </p>
        ) : (
          <ul className="mt-12 divide-y divide-[var(--divider)]">
            {articles.map((article) => (
              <li key={article._id} className="py-6">
                <Link
                  href={`/press/${article.slug}`}
                  className="group block"
                >
                  <p
                    className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    data-ui-label
                  >
                    {article.source === 'in-house' ? 'Announcement' : 'External coverage'}
                    {article.publishedAt && (
                      <>
                        {' · '}
                        <time dateTime={article.publishedAt}>
                          {new Date(article.publishedAt).toLocaleDateString(locale)}
                        </time>
                      </>
                    )}
                  </p>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl text-[var(--text-title)] group-hover:text-[var(--accent)]">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-3 max-w-2xl text-sm text-[var(--text-body)]">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
