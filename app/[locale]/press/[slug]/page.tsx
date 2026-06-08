import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/navigation';
import {Container, Section} from '@/components/ui/container';
import {client} from '@/lib/sanity/client';
import {localized, localizedSeo} from '@/lib/sanity/i18n';
import {routing, type Locale} from '@/lib/i18n/routing';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs: Array<{slug: string}> = await client
    .fetch(`*[_type == "pressArticle" && defined(slug.current)]{"slug": slug.current}`)
    .catch(() => []);
  return routing.locales.flatMap((locale) =>
    slugs.map(({slug}) => ({locale, slug}))
  );
}

type Article = {
  title: string;
  publishedAt: string | null;
  source: string;
  externalUrl: string | null;
  excerpt: string | null;
  body: string | null;
  seo: {metaTitle: string | null; metaDescription: string | null} | null;
};

async function getArticle(slug: string, locale: Locale): Promise<Article | null> {
  return client
    .fetch<Article | null>(
      `*[_type == "pressArticle" && slug.current == $slug][0]{
        ${localized('title')},
        publishedAt,
        source,
        externalUrl,
        ${localized('excerpt')},
        ${localized('body')},
        ${localizedSeo()}
      }`,
      {slug, locale}
    )
    .catch(() => null);
}

type Props = {params: Promise<{locale: Locale; slug: string}>};

export async function generateMetadata({params}: Props) {
  const {locale, slug} = await params;
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return {
    title: article.seo?.metaTitle ?? article.title,
    description: article.seo?.metaDescription ?? article.excerpt ?? undefined
  };
}

export default async function PressDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, article] = await Promise.all([
    getTranslations({locale, namespace: 'Press'}),
    getArticle(slug, locale)
  ]);
  if (!article) notFound();

  return (
    <Section>
      <Container>
        <Link
          href="/press"
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--accent)]"
          data-ui-label
        >
          {t('backToIndex')}
        </Link>
        <p
          className="mt-6 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
          data-ui-label
        >
          {article.source === 'in-house' ? t('source.inHouse') : t('source.external')}
          {article.publishedAt && (
            <>
              {' · '}
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString(locale)}
              </time>
            </>
          )}
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">{article.title}</h1>
        {article.excerpt && (
          <p className="mt-6 max-w-2xl text-lg text-[var(--text-body)]">
            {article.excerpt}
          </p>
        )}
        {article.body && (
          <div className="mt-12 max-w-2xl text-base text-[var(--text-body)]">
            {article.body}
          </div>
        )}
        {article.externalUrl && article.source === 'external' && (
          <a
            href={article.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block text-sm underline underline-offset-4"
          >
            {t('readExternal')}
          </a>
        )}
      </Container>
    </Section>
  );
}
