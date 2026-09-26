import { defineConfig, devices } from '@playwright/test'

/**
 * Report-only visual regression for the site's rendered demos (ticket 15 Q11).
 *
 * Tool: Playwright's `toHaveScreenshot()`. The built `out/` is served statically
 * by `e2e/serve.mjs`, so the screenshots are of exactly what deploys.
 *
 * Viewports: 390x844, 768x1024, 1440x900, each in light and dark. A seventh
 * project (`coarse-390`) runs with `hasTouch`, which is the only place
 * `@media (pointer: coarse)` resolves and therefore the only real browser check
 * of the 44px target floor that jsdom cannot evaluate.
 *
 * Determinism controls: a fixed runner, the site's self-hosted Inter (no
 * network font), `reducedMotion: 'reduce'` and `animations: 'disabled'`, and a
 * committed baseline with `maxDiffPixelRatio: 0.01`.
 *
 * This job is `continue-on-error: true` in `ci.yml`. Promotion rule, written
 * down here so it is an operational step and not a new decision ticket: once
 * the baseline has been stable for two consecutive weeks with no unexplained
 * diff (target: ten consecutive merges), remove `continue-on-error` and make the
 * job required. Any unexplained diff resets the clock.
 */
const PORT = 4321
const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
]
const MODES = ['light', 'dark']

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  snapshotDir: './e2e/__screenshots__',
  // One committed baseline set for every runner: the platform suffix is omitted
  // so the ubuntu CI job reads the same PNGs this repo commits. The site
  // self-hosts Inter and animations are disabled, which is what keeps the
  // rasterisation close enough for the 0.01 diff ratio.
  snapshotPathTemplate: '{snapshotDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'node e2e/serve.mjs',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    ...VIEWPORTS.flatMap((viewport) =>
      MODES.map((mode) => ({
        name: `${viewport.name}-${mode}`,
        metadata: { mode },
        use: {
          ...devices['Desktop Chrome'],
          viewport: { width: viewport.width, height: viewport.height },
        },
      })),
    ),
    {
      name: 'coarse-390',
      metadata: { mode: 'light', coarse: true },
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
})
