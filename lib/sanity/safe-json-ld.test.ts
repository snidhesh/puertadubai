import {describe, expect, it} from 'vitest';
import {safeJsonLd} from './safe-json-ld';

const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

describe('safeJsonLd', () => {
  it('escapes </script> sequences', () => {
    const data = {bio: 'Hi </script><script>alert(1)</script>'};
    const out = safeJsonLd(data);
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script');
  });

  it('escapes < and > so HTML parsing cannot break out', () => {
    const out = safeJsonLd({s: '<b>'});
    expect(out).not.toMatch(/<b>/);
    expect(out).toContain('\\u003cb\\u003e');
  });

  it('escapes ampersands', () => {
    const out = safeJsonLd({s: 'a & b'});
    expect(out).toContain('\\u0026');
  });

  it('escapes U+2028 and U+2029 line separators', () => {
    const data = {s: `before${LINE_SEP} middle${PARA_SEP} end`};
    const out = safeJsonLd(data);
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(out).not.toContain(LINE_SEP);
    expect(out).not.toContain(PARA_SEP);
  });

  it('roundtrips a sanitised payload back to the original object', () => {
    const original = {
      '@type': 'Product',
      name: 'Greenside Residence',
      price: 1_400_000,
      currency: 'AED'
    };
    expect(JSON.parse(safeJsonLd(original))).toEqual(original);
  });
});
