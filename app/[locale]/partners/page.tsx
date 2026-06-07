import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Aldar, Binghatti, Dubai Properties, Ellington, Emaar, Meraas, Sobha — and other developer partners.'
};

const PARTNERS = ['Aldar', 'Binghatti', 'Dubai Properties', 'Ellington', 'Emaar', 'Meraas', 'Sobha'];

type Props = {params: Promise<{locale: Locale}>};

export default async function PartnersPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
          Partners
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl">
          Developer partners.
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--text-body)]">
          Direct access across the major UAE developers. Logos are
          rights-cleared in Sanity before display; pending that, names render
          as text.
        </p>
        <ul className="mt-12 grid gap-px bg-[var(--divider)] sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((name) => (
            <li
              key={name}
              className="flex items-center justify-center bg-[var(--bg)] p-12 font-display text-2xl text-[var(--text-title)]"
            >
              {name}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
