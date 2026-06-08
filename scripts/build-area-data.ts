/**
 * One-shot builder — port the 13 legacy BlackOak Real Estate
 * neighbourhood guides into static data inside this repo.
 *
 *   pnpm exec tsx scripts/build-area-data.ts
 *
 * Outputs:
 *   lib/areas/data.ts                       — typed AREAS const + helpers
 *   public/images/areas/{slug}.{ext}        — 13 hero images
 *   public/images/attractions/{name}.webp   — categorical attraction images
 *
 * The Sanity equivalent (scripts/seed-area-guides.ts in earlier history) is
 * preserved in git for the day this project does adopt a CMS. The pages
 * read from lib/areas/data.ts directly today.
 *
 * Idempotent: rerunning overwrites the generated data file and copies
 * images with `fs.cpSync` (which overwrites by default).
 *
 * LEGACY_ROOT below is a developer-machine path; the script is one-shot
 * and not meant to run in CI.
 */

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..');
const LEGACY_ROOT = '/Users/blackoak/Documents/GitHub/blackoak-website';
const LEGACY_LOCALES = ['en', 'fr', 'ar'] as const;
type LegacyLocale = (typeof LEGACY_LOCALES)[number];

// ---------------------------------------------------------------------------
// Legacy data shape
// ---------------------------------------------------------------------------

type LegacyAttraction = {name: string; description: string; image: string};
type LegacyHighlight = {title: string; description: string};
type LegacySeo = {title: string; description: string};

type LegacyArea = {
  slug: string;
  name: string;
  heroImage: string;
  tagline: string;
  description: string;
  attractions: LegacyAttraction[];
  whyInvest: LegacyHighlight[];
  seo: LegacySeo;
};

function loadLegacy(locale: LegacyLocale): Map<string, LegacyArea> {
  const file = path.join(LEGACY_ROOT, 'src/content', locale, 'neighbourhoods.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as LegacyArea[];
  return new Map(data.map((entry) => [entry.slug, entry]));
}

// ---------------------------------------------------------------------------
// Anti-fabrication: phrase blocklist applied to ALL imported text
// ---------------------------------------------------------------------------

const BLOCKED_PHRASES: Record<LegacyLocale, RegExp[]> = {
  en: [
    /the world's most (?:iconic|exclusive|prestigious|recognizable)/gi,
    /the most (?:prestigious|iconic|exclusive|sought-after)/gi,
    /one of the most (?:prestigious|iconic|exclusive|sought-after|recognizable)/gi,
    /Beverly Hills of Dubai/gi,
    /ultra-(?:prime|exclusive|luxury)/gi,
    /Dubai's most (?:exclusive|prestigious|iconic|sought-after)/gi,
    /consistently high property values/gi,
    /strong (?:long-term )?(?:value )?appreciation/gi,
    /robust growth/gi,
    /attractive returns/gi,
    /command(?:s|ing)? premium(?: prices| pricing)?/gi,
    /premium pricing/gi,
    /high(?:ly)? coveted/gi,
    /pinnacle of luxury/gi,
    /engineering marvel/gi
  ],
  fr: [
    /la plus (?:prestigieuse|exclusive|iconique|recherchée)/gi,
    /l'un[e]? des plus (?:prestigieux|prestigieuses|exclusi[fv]e?s?|iconiques)/gi,
    /ultra-(?:prime|exclusi[fv]e?|de luxe)/gi,
    /Beverly Hills de Dubaï/gi,
    /forte (?:apprécation|valorisation)/gi,
    /croissance robuste/gi,
    /rendements attractifs/gi,
    /pinacle du luxe/gi
  ],
  ar: [
    /الأكثر (?:تميزاً|تميزا|حصرية|شهرة|طلباً|طلبا)/g,
    /أحد أكثر [^\s]+ تميزاً/g,
    /قيم (?:عقارية )?مرتفعة باستمرار/g,
    /نمو (?:قوي|مطرد)/g,
    /عوائد جذابة/g,
    /قمة الفخامة/g
  ]
};

type Dropped = {phrase: string; field: string};

function neutralise(text: string, locale: LegacyLocale, field: string, log: Dropped[]): string {
  let out = text;
  for (const pattern of BLOCKED_PHRASES[locale]) {
    out = out.replace(pattern, (match) => {
      log.push({phrase: match, field});
      return '';
    });
  }
  out = out.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1');
  return out.trim();
}

// ---------------------------------------------------------------------------
// Per-area editorial decisions
// ---------------------------------------------------------------------------

const DROP_HIGHLIGHTS: Record<string, ReadonlyArray<string>> = {
  'emirates-hills': ['Capital Appreciation'],
  'palm-jumeirah': ['Strong Rental Yields', 'Waterfront Premium'],
  'dubai-hills-estate': ['Strong Appreciation'],
  'al-barari': ['Premium Positioning'],
  'downtown-dubai': ['Strong Rental Yields', 'Capital Growth'],
  difc: ['Premium Tenants', 'Rental Yields'],
  'jumeirah-golf-estates': ['Strong Appreciation'],
  'jumeirah-islands': ['Capital Growth'],
  'dubai-marina': ['Rental Yields', 'Tourist Demand'],
  'mohammed-bin-rashid-city': ['Capital Appreciation'],
  'city-walk': ['Premium Demand'],
  'business-bay': ['Rental Yields', 'Capital Growth'],
  'bluewaters-island': ['Premium Returns']
};

function seoTitleFor(name: string, locale: LegacyLocale): string {
  switch (locale) {
    case 'fr':
      return `${name} — Guide de quartier | Puerta Dubai`;
    case 'ar':
      return `${name} — دليل المنطقة | بويرتا دبي`;
    default:
      return `${name} — Area guide | Puerta Dubai`;
  }
}

function seoDescriptionFor(summary: string): string {
  const max = 155;
  if (summary.length <= max) return summary;
  return summary.slice(0, max - 1).replace(/[\s,;:.]+$/, '') + '…';
}

// ---------------------------------------------------------------------------
// Image copy
// ---------------------------------------------------------------------------

const HERO_DEST = path.join(REPO_ROOT, 'public/images/areas');
const ATTRACTION_DEST = path.join(REPO_ROOT, 'public/images/attractions');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, {recursive: true});
}

function copyHero(slug: string): string {
  const baseDir = path.join(LEGACY_ROOT, 'public/images/neighbourhoods');
  for (const ext of ['.jpg', '.png', '.webp', '.jpeg']) {
    const src = path.join(baseDir, `${slug}${ext}`);
    if (fs.existsSync(src)) {
      const filename = `${slug}${ext}`;
      const dest = path.join(HERO_DEST, filename);
      fs.copyFileSync(src, dest);
      return `/images/areas/${filename}`;
    }
  }
  throw new Error(`Missing hero image for slug "${slug}" under ${baseDir}`);
}

const copiedAttractionImages = new Set<string>();

function copyAttraction(legacyImagePath: string): string {
  const basename = path.basename(legacyImagePath);
  const src = path.join(LEGACY_ROOT, 'public/images/attractions', basename);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing attraction image: ${src}`);
  }
  if (!copiedAttractionImages.has(basename)) {
    const dest = path.join(ATTRACTION_DEST, basename);
    fs.copyFileSync(src, dest);
    copiedAttractionImages.add(basename);
  }
  return `/images/attractions/${basename}`;
}

// ---------------------------------------------------------------------------
// Build the typed data file
// ---------------------------------------------------------------------------

type LocaleMap = Partial<Record<LegacyLocale, string>>;
type BuiltAttraction = {name: LocaleMap; description: LocaleMap; image: string};
type BuiltHighlight = {title: LocaleMap; description: LocaleMap};
type BuiltArea = {
  slug: string;
  emirate: string;
  name: LocaleMap;
  summary: LocaleMap;
  lifestyle: LocaleMap;
  heroImage: string;
  attractions: BuiltAttraction[];
  investmentHighlights: BuiltHighlight[];
  seo: {metaTitle: LocaleMap; metaDescription: LocaleMap};
};

function localiseInto(
  target: LocaleMap,
  sources: Partial<Record<LegacyLocale, string | undefined>>
) {
  for (const locale of LEGACY_LOCALES) {
    const value = sources[locale]?.trim();
    if (value) target[locale] = value;
  }
}

function buildArea(
  slug: string,
  sources: Record<LegacyLocale, LegacyArea | undefined>
): {area: BuiltArea; droppedPhrases: number; droppedHighlightTitles: string[]} {
  const log: Dropped[] = [];

  const en = sources.en;
  if (!en) throw new Error(`Missing EN source for slug ${slug}`);

  const heroPath = copyHero(slug);

  const name: LocaleMap = {};
  const summary: LocaleMap = {};
  const lifestyle: LocaleMap = {};
  const metaTitle: LocaleMap = {};
  const metaDescription: LocaleMap = {};

  for (const locale of LEGACY_LOCALES) {
    const src = sources[locale];
    if (!src) continue;
    const cleanTagline = neutralise(src.tagline, locale, 'tagline', log);
    const cleanDescription = neutralise(src.description, locale, 'description', log);
    name[locale] = src.name;
    summary[locale] = cleanTagline;
    lifestyle[locale] = cleanDescription;
    metaTitle[locale] = seoTitleFor(src.name, locale);
    metaDescription[locale] = seoDescriptionFor(cleanTagline || cleanDescription);
  }

  const attractions: BuiltAttraction[] = en.attractions.map((enAttr, i) => {
    const attrName: LocaleMap = {};
    const attrDescription: LocaleMap = {};
    localiseInto(attrName, {
      en: enAttr.name,
      fr: sources.fr?.attractions[i]?.name,
      ar: sources.ar?.attractions[i]?.name
    });
    localiseInto(attrDescription, {
      en: neutralise(enAttr.description, 'en', 'attraction.description', log),
      fr: sources.fr?.attractions[i]?.description
        ? neutralise(sources.fr.attractions[i].description, 'fr', 'attraction.description', log)
        : undefined,
      ar: sources.ar?.attractions[i]?.description
        ? neutralise(sources.ar.attractions[i].description, 'ar', 'attraction.description', log)
        : undefined
    });
    return {name: attrName, description: attrDescription, image: copyAttraction(enAttr.image)};
  });

  const dropTitles = new Set(DROP_HIGHLIGHTS[slug] ?? []);
  const droppedHighlightTitles: string[] = [];
  const investmentHighlights: BuiltHighlight[] = [];
  for (let i = 0; i < en.whyInvest.length; i++) {
    const enItem = en.whyInvest[i];
    if (dropTitles.has(enItem.title)) {
      droppedHighlightTitles.push(enItem.title);
      continue;
    }
    const title: LocaleMap = {};
    const description: LocaleMap = {};
    localiseInto(title, {
      en: enItem.title,
      fr: sources.fr?.whyInvest[i]?.title,
      ar: sources.ar?.whyInvest[i]?.title
    });
    localiseInto(description, {
      en: neutralise(enItem.description, 'en', 'highlight.description', log),
      fr: sources.fr?.whyInvest[i]?.description
        ? neutralise(sources.fr.whyInvest[i].description, 'fr', 'highlight.description', log)
        : undefined,
      ar: sources.ar?.whyInvest[i]?.description
        ? neutralise(sources.ar.whyInvest[i].description, 'ar', 'highlight.description', log)
        : undefined
    });
    investmentHighlights.push({title, description});
  }

  if (investmentHighlights.length < 2) {
    console.warn(
      `  ⚠ ${slug}: only ${investmentHighlights.length} highlight(s) survived — section will be hidden.`
    );
  }
  if (log.length > 0) {
    console.log(`  • ${slug}: ${log.length} phrase(s) neutralised`);
    for (const entry of log) {
      console.log(`      [${entry.field}] "${entry.phrase}"`);
    }
  }
  if (droppedHighlightTitles.length > 0) {
    console.log(`  • ${slug}: dropped highlight(s): ${droppedHighlightTitles.join(', ')}`);
  }
  console.log(`  ✓ ${slug}`);

  return {
    area: {
      slug,
      emirate: 'dubai',
      name,
      summary,
      lifestyle,
      heroImage: heroPath,
      attractions,
      investmentHighlights,
      seo: {metaTitle, metaDescription}
    },
    droppedPhrases: log.length,
    droppedHighlightTitles
  };
}

// ---------------------------------------------------------------------------
// Emit lib/areas/data.ts
// ---------------------------------------------------------------------------

const DATA_HEADER = `// AUTO-GENERATED by scripts/build-area-data.ts — do not edit by hand.
// Regenerate with: pnpm build:areas
//
// Marketing claims have been neutralised against an anti-fabrication
// blocklist before this file was emitted. See the build script for the
// exact phrase rules. Unsourced yield / appreciation language has been
// stripped; Golden Visa relevance is intentionally NOT populated (legal
// review gate, per CLAUDE.md).

import type {Locale} from '@/lib/i18n/routing';

type LocaleMap = Partial<Record<Locale, string>>;

export type AreaAttraction = {
  name: LocaleMap;
  description: LocaleMap;
  image: string;
};

export type AreaHighlight = {
  title: LocaleMap;
  description: LocaleMap;
};

export type AreaContent = {
  slug: string;
  emirate: string;
  name: LocaleMap;
  summary: LocaleMap;
  lifestyle: LocaleMap;
  heroImage: string;
  attractions: AreaAttraction[];
  investmentHighlights: AreaHighlight[];
  seo: {metaTitle: LocaleMap; metaDescription: LocaleMap};
};

const FALLBACK: Locale = 'en';

function pick(field: LocaleMap, locale: Locale): string | null {
  return field[locale] ?? field[FALLBACK] ?? null;
}

export type AreaCard = {
  slug: string;
  emirate: string;
  name: string;
  summary: string | null;
  heroImage: string;
};

export type AreaDetail = {
  slug: string;
  emirate: string;
  name: string;
  summary: string | null;
  lifestyle: string | null;
  heroImage: string;
  attractions: Array<{name: string; description: string | null; image: string}>;
  investmentHighlights: Array<{title: string; description: string}>;
  seo: {metaTitle: string | null; metaDescription: string | null};
};

export function getAllAreas(locale: Locale): AreaCard[] {
  return AREAS.map((a) => ({
    slug: a.slug,
    emirate: a.emirate,
    name: pick(a.name, locale) ?? a.slug,
    summary: pick(a.summary, locale),
    heroImage: a.heroImage
  }));
}

export function getAreaBySlug(slug: string, locale: Locale): AreaDetail | null {
  const a = AREAS.find((entry) => entry.slug === slug);
  if (!a) return null;
  return {
    slug: a.slug,
    emirate: a.emirate,
    name: pick(a.name, locale) ?? a.slug,
    summary: pick(a.summary, locale),
    lifestyle: pick(a.lifestyle, locale),
    heroImage: a.heroImage,
    attractions: a.attractions.map((at) => ({
      name: pick(at.name, locale) ?? '',
      description: pick(at.description, locale),
      image: at.image
    })),
    investmentHighlights: a.investmentHighlights
      .map((h) => ({
        title: pick(h.title, locale) ?? '',
        description: pick(h.description, locale) ?? ''
      }))
      .filter((h) => h.title && h.description),
    seo: {
      metaTitle: pick(a.seo.metaTitle, locale),
      metaDescription: pick(a.seo.metaDescription, locale)
    }
  };
}

export function getAllAreaSlugs(): string[] {
  return AREAS.map((a) => a.slug);
}

const AREAS: readonly AreaContent[] = `;

function emitDataFile(areas: BuiltArea[]) {
  const dest = path.join(REPO_ROOT, 'lib/areas/data.ts');
  ensureDir(path.dirname(dest));
  const json = JSON.stringify(areas, null, 2);
  const body = `${DATA_HEADER}${json};\n`;
  fs.writeFileSync(dest, body, 'utf8');
  console.log(`\nWrote ${dest} (${areas.length} areas, ${body.length} bytes)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Reading legacy content…');
  const enMap = loadLegacy('en');
  const frMap = loadLegacy('fr');
  const arMap = loadLegacy('ar');

  const slugs = Array.from(enMap.keys());
  console.log(`Found ${slugs.length} areas in EN; ${frMap.size} in FR; ${arMap.size} in AR.\n`);

  ensureDir(HERO_DEST);
  ensureDir(ATTRACTION_DEST);

  const built: BuiltArea[] = [];
  let totalPhrases = 0;
  let totalHighlightsDropped = 0;
  for (const slug of slugs) {
    const result = buildArea(slug, {
      en: enMap.get(slug),
      fr: frMap.get(slug),
      ar: arMap.get(slug)
    });
    built.push(result.area);
    totalPhrases += result.droppedPhrases;
    totalHighlightsDropped += result.droppedHighlightTitles.length;
  }

  emitDataFile(built);

  console.log('\n— Summary —');
  console.log(`Areas built:          ${built.length}`);
  console.log(`Hero images copied:   ${built.length}`);
  console.log(`Attraction images:    ${copiedAttractionImages.size}`);
  console.log(`Phrases neutralised:  ${totalPhrases}`);
  console.log(`Highlights dropped:   ${totalHighlightsDropped}`);
}

main();
