import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright config — e2e specs land in `e2e/` and exercise the build
 * (locale routing, RTL snapshots for AR, hash handler, CSP duplicate-
 * header counts, ops-email payload assertions with mocked adapters).
 *
 * `pnpm e2e` starts `next start` against the production build so we
 * exercise the same CSP / static-rendering path as production. The dev
 * server is intentionally NOT used here — its lazy-compile behaviour
 * masks real prerender errors.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  reporter: [['list'], ['html', {open: 'never'}]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'mobile-safari', use: {...devices['iPhone 14']}}
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000
      }
});
