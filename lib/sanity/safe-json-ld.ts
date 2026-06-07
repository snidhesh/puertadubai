/**
 * JSON-LD safety helper.
 *
 * Server-rendered JSON-LD lands in the DOM via
 * `dangerouslySetInnerHTML`, which is fine for a fully-controlled object
 * but unsafe if CMS-derived strings leak. Risks:
 *
 *   1. `</script>` inside a string value breaks out of the script tag.
 *   2. HTML special characters (`<`, `>`, `&`) can confuse strict CSP
 *      and some indexers.
 *   3. Line separators (U+2028 / U+2029) end script parsing in some
 *      legacy engines.
 *
 * `safeJsonLd()` serialises and escapes those sequences. Drop any string
 * value derived from Sanity through this helper before stamping it onto
 * `dangerouslySetInnerHTML`.
 *
 * The U+2028 / U+2029 regexes are constructed via `new RegExp` so the
 * source file doesn't contain those literal characters (some editors and
 * tooling stumble on them).
 */
const LINE_SEP_RE = new RegExp('\\u2028', 'g');
const PARA_SEP_RE = new RegExp('\\u2029', 'g');

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEP_RE, '\\u2028')
    .replace(PARA_SEP_RE, '\\u2029');
}
