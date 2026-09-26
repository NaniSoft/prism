import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * The report-only visual-regression spec (ticket 15 Q11). Every route is
 * screenshotted in every project (three viewports, light and dark, plus the
 * coarse-pointer project). Baselines live in `e2e/__screenshots__/` and are
 * compared with `maxDiffPixelRatio: 0.01`.
 *
 * The axe scan runs in the real browser, which is the only place the
 * `color-contrast` rule can evaluate; it runs in one project so the job stays
 * quick. The 44px check runs only in the coarse-pointer project.
 */
const ROUTES = [
  { path: '/', slug: 'home' },
  { path: '/components', slug: 'components' },
  { path: '/components/button', slug: 'component-button' },
  { path: '/blocks/hero-01', slug: 'block-hero-01' },
  { path: '/themes', slug: 'themes' },
  { path: '/foundations', slug: 'foundations' },
]

test.beforeEach(async ({ page }, testInfo) => {
  const mode = (testInfo.project.metadata as { mode?: string }).mode ?? 'light'
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('ds-theme', JSON.stringify({ id: 'default', mode: value }))
    } catch {
      // A blocked localStorage leaves the default light theme; the shot is
      // still deterministic.
    }
  }, mode)
})

for (const route of ROUTES) {
  test(`screenshot ${route.slug}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(`${route.slug}.png`, { fullPage: true })
  })
}

test('axe scan of the home page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== '1440-light', 'runs in one project')
  await page.goto('/', { waitUntil: 'networkidle' })
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.map((violation) => violation.id)).toEqual([])
})

test('a Prism control meets the 44px coarse-pointer floor', async ({ page }, testInfo) => {
  test.skip(!(testInfo.project.metadata as { coarse?: boolean }).coarse, 'coarse-pointer project only')
  await page.goto('/components/button', { waitUntil: 'networkidle' })
  const heights = await page
    .locator('main button')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
  expect(Math.max(...heights)).toBeGreaterThanOrEqual(44)
})
