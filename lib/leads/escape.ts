/**
 * CSV / spreadsheet formula-injection escape.
 *
 * Excel and Google Sheets execute a cell starting with `=`, `+`, `-`, or
 * `@` as a formula — even when the trigger character is preceded by
 * whitespace or a Unicode control / zero-width character (`\t`, `\r`,
 * `\n`, U+200B, U+FEFF, etc.). Strip those invisibles, inspect the first
 * remaining character, then prepend a single-quote if it is a trigger.
 *
 * The escape is applied at the Airtable adapter boundary AND again at
 * CSV export time (cells may have been edited in Airtable in between).
 */

const TRIGGER_CHARS = new Set(['=', '+', '-', '@']);
// Matches leading whitespace (incl. tab, CR, LF, NBSP) and the common
// zero-width chars used to slip past naive escapes.
const LEADING_INVISIBLES = /^[\s​‌‍﻿]+/;

export function escapeFormula(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stripped = String(value).replace(LEADING_INVISIBLES, '');
  if (stripped.length === 0) return String(value);
  if (TRIGGER_CHARS.has(stripped[0])) {
    return `'${String(value)}`;
  }
  return String(value);
}
