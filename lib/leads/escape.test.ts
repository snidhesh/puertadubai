import {describe, expect, it} from 'vitest';
import {escapeFormula} from './escape';

describe('escapeFormula', () => {
  it('prefixes raw formula triggers', () => {
    for (const v of ['=cmd', '+SUM(1,1)', '-1', '@cmd']) {
      expect(escapeFormula(v)).toBe(`'${v}`);
    }
  });

  it('does not escape benign values', () => {
    // Note: leading '+' is itself a formula trigger, so a phone number
    // like '+971 …' MUST be escaped. The benign set here intentionally
    // omits anything starting with =/+/-/@.
    for (const v of ['Dubai', 'investor@example.com', '971 50 12 34 56']) {
      expect(escapeFormula(v).startsWith("'")).toBe(false);
    }
  });

  it('escapes trigger preceded by ASCII whitespace', () => {
    for (const v of [' =cmd', '\t=cmd', '\r\n+1', '   @cmd']) {
      expect(escapeFormula(v)).toBe(`'${v}`);
    }
  });

  it('escapes trigger preceded by Unicode zero-width / BOM', () => {
    // U+200B zero-width space
    expect(escapeFormula('​=cmd')).toBe(`'​=cmd`);
    // U+FEFF BOM
    expect(escapeFormula('﻿=cmd')).toBe(`'﻿=cmd`);
    // U+200C zero-width non-joiner
    expect(escapeFormula('‌-1')).toBe(`'‌-1`);
  });

  it('handles null and undefined safely', () => {
    expect(escapeFormula(null)).toBe('');
    expect(escapeFormula(undefined)).toBe('');
    expect(escapeFormula('')).toBe('');
  });

  it("a value that's purely whitespace stays untouched (no leading char to escape)", () => {
    expect(escapeFormula('   ')).toBe('   ');
  });
});
