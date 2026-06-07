<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Puerta Dubai — project conventions

## Source of truth
Implementation plan: `~/.claude/plans/analyse-the-old-website-idempotent-lemon.md`.
When making non-trivial decisions, re-read the relevant section.

## Stack
- Next.js 16 (App Router, TypeScript strict, RSC). `proxy.ts` replaces `middleware.ts` and uses a *named* export `proxy`.
- pnpm 10.x, Node >= 20.9 (`.nvmrc` + `engines`).
- next-intl 4.x with `localePrefix: 'as-needed'`; locales `en` (default at `/`), `fr`, `es`, `pt`, `ar`.
- Tailwind CSS v4 + (later) shadcn/ui primitives.
- Sanity v3 as the headless CMS (phase 3+).
- Auth.js v5 + Upstash adapter wrapped with `withTokenHashing()` for the admin (phase 9).

## Brand discipline
- Pure monochrome palette. **No chromatic accent.** Photography carries the colour. If you reach for a hue, the answer is better photography or more whitespace.
- Typography: **Arsenal** (display, Latin) + **Roboto Flex** (body, Latin) + **The Nautigal** (script accent, Founder signature only). Arabic stack: **El Messiri** (display) + **IBM Plex Sans Arabic** (body). The Nautigal is *never* rendered on Arabic pages.
- Body line-height **1.7** on Latin, **1.85** on Arabic. Title colour `#1a1a1a` (not pure black). Body `#545454`.

## RTL discipline
- Use Tailwind logical-property utilities only: `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`. The ESLint config blocks `pl-`/`pr-`/`ml-`/`mr-`/`left-`/`right-` with a `no-restricted-syntax` rule.
- Arabic UI labels: no uppercase, `letter-spacing: 0`. The global `:root[lang="ar"]` CSS rule enforces this — don't override per-component.
- Numbers/currency wrap in `<bdi>` so `AED 2,000,000` stays LTR-isolated inside Arabic paragraphs.
- Directional icons flip via `rtl:scale-x-[-1]`.

## CSP routing — never combine policies
- **Marketing routes**: static CSP in `next.config.ts` `headers()`. `'unsafe-inline'` in `script-src` is the accepted tradeoff for ISR.
- **`/studio/**`**: separate static CSP in `next.config.ts` with exact project-pinned Sanity API host (no `*.sanity.io` wildcards).
- **`/admin/**`**: nonce CSP emitted by `proxy.ts` on **both request and response** headers (Next's framework reads the request CSP to nonce-bind RSC bootstrap). `next.config.ts` `headers()` deliberately does NOT match `/admin/*`.
- Sanity Presentation Tool is disabled at v1 (would require dropping marketing's `frame-ancestors 'none'`).

## Anti-fabrication
- No fabricated numbers, transaction amounts, ROI claims, client names, testimonials, awards, or media mentions.
- Golden Visa copy is **gated on legal review**; tied to the AED 2M canonical threshold (UAE federal portal + GDRFA Dubai), not the old site's USD 550,000 figure.
- Founder Credentials & Recognition (CNN/Vogue/Harper's) needs verifiable links/screenshots or removal — no placeholder logos.
- Anonymised content is acceptable where the underlying facts are real.

## Audit chain (when you reach phase 9)
- One **global** chain across all event classes. `seq = prevSeq + 1` assigned **under a Redis lock** (NOT `INCR`). Lock release is a compare-and-delete Lua script (TTL-expiry safety).
- Every event has **two** Ed25519 signatures: `prevSig` (chain link) and `sig` (over current event minus sig). RFC 8785 canonical JSON.
- Three-state event model: `<action>.attempted` → `<action>.committed` or `<action>.failed`. Reconciliation cron writes `<action>.failed-reconciled` for orphans.
- Three R2 buckets (`HI`, `ROUTINE`, `DAILY`) with bucket-scoped tokens (no per-prefix scoping on long-lived R2 tokens). `DAILY` is a **manifest**, not a copy of events.
- AdminUser, AuditLog, sessions, MFA secrets, recovery hashes — none of these live in Sanity. They live in Upstash + R2.

## When in doubt
Read `docs/asset-audit.md`, the plan file, and Next 16 docs in `node_modules/next/dist/docs/` *before* writing code. The plan answers most "should I do X" questions; the Next docs answer most "how do I do X in Next 16" questions.
