import {expect, test} from '@playwright/test';

/**
 * Route smoke + locale routing + html dir per locale + internal
 * route group anti-framing + robots.
 *
 * Extended over time with the home composition / lead form / throttle
 * matrix from the plan's Verification section.
 */

const PUBLIC_LOCALES = ['en', 'fr', 'es', 'pt', 'ar'] as const;

test.describe('locale routing', () => {
  test('EN serves at /, not /en (localePrefix: as-needed)', async ({page}) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  for (const locale of PUBLIC_LOCALES.filter((l) => l !== 'en')) {
    test(`/${locale} renders with correct lang attribute`, async ({page}) => {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveAttribute(
        'dir',
        locale === 'ar' ? 'rtl' : 'ltr'
      );
    });
  }
});

test.describe('security headers', () => {
  test('marketing routes return exactly one Content-Security-Policy header', async ({request}) => {
    const response = await request.get('/');
    const headers = response.headersArray().filter(
      (h) => h.name.toLowerCase() === 'content-security-policy'
    );
    expect(headers.length).toBe(1);
  });

  test('marketing CSP contains object-src none, base-uri self, frame-ancestors none', async ({request}) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('marketing routes set X-Frame-Options: DENY', async ({request}) => {
    const response = await request.get('/');
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('/internal/* responses include anti-framing + noindex headers', async ({request}) => {
    const response = await request.get('/internal/login');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-robots-tag']).toContain('noindex');
    const csp = response.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('robots.txt disallows /studio, /internal, and /api', async ({request}) => {
    const response = await request.get('/robots.txt');
    const body = await response.text();
    expect(body).toMatch(/Disallow:\s*\/studio/);
    expect(body).toMatch(/Disallow:\s*\/internal/);
    expect(body).toMatch(/Disallow:\s*\/api/);
  });

  test('/internal/* not in sitemap', async ({request}) => {
    const response = await request.get('/sitemap.xml');
    const body = await response.text();
    expect(body).not.toContain('/internal');
  });
});
