import {setRequestLocale} from 'next-intl/server';
import {Button} from '@/components/ui/button';
import {Container, Section} from '@/components/ui/container';
import {routing, type Locale} from '@/lib/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  params: Promise<{locale: Locale}>;
};

/**
 * Internal QA route — exercises the primitives at every size + variant in
 * both LTR and RTL. Not linked from the public nav; reachable at
 * `/{locale}/_dev/showcase` during development. Drop or gate before launch.
 */
export default async function ShowcasePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Section>
        <Container>
          <h1 className="font-display text-4xl md:text-5xl">Design showcase</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Locale: <code>{locale}</code> · check both LTR and an RTL locale
            (<code>/ar/_dev/showcase</code>) to confirm logical-property
            layout and Arabic-specific overrides.
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Typography
          </p>
          <h2 className="mt-4 font-display text-5xl md:text-7xl">
            Headline display
          </h2>
          <p className="mt-4 italic font-display text-2xl md:text-3xl">
            Editorial italic accent (Arsenal italic; Arabic falls back to
            El&nbsp;Messiri).
          </p>
          <p className="mt-6 max-w-2xl">
            Body copy in Roboto&nbsp;Flex on Latin pages and IBM&nbsp;Plex&nbsp;Sans
            Arabic on Arabic pages. Line-height is 1.7 on Latin, 1.85 on Arabic
            — the global CSS swaps the <code>--line-height-body</code> token
            per <code>:root[lang=&quot;ar&quot;]</code>.
          </p>
          <p className="mt-3 text-[var(--text-muted)]">
            Muted body uses <code>--text-muted</code> for utility copy.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Buttons
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="solid">Solid default</Button>
            <Button variant="ghost">Ghost default</Button>
            <Button variant="solid" size="sm">
              Solid small
            </Button>
            <Button variant="ghost" size="lg">
              Ghost large
            </Button>
            <Button variant="link">Link</Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Arabic pages drop uppercase + tracking on every UI label via the
            global <code>:root[lang=&quot;ar&quot;] button</code> CSS rule.
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Numerals + RTL isolation
          </p>
          <p className="mt-4 max-w-2xl">
            Prices and currency wrap in{' '}
            <code>&lt;bdi&gt;</code>: <bdi>AED 2,000,000</bdi> remains LTR
            inside an RTL paragraph, so the comma grouping never reorders.
          </p>
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]" data-ui-label>
            Dark band
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl text-[var(--text-on-dark)]">
            Reverse-out section for hero video and editorial moments.
          </h2>
        </Container>
      </Section>
    </>
  );
}
