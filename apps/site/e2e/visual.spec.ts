import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * The report-only visual-regression spec (ticket 15 Q11). Every route is
 * screenshotted in every project (three viewports, light and dark, plus the
 * coarse-pointer project). Baselines live in `e2e/__screenshots__/` and are
 * compared with `maxDiffPixelRatio: 0.01`.
 *
 * The routes are the seven Sections plus the pack reader, sampled the way the
 * set has always sampled them: the landing page, a catalogue index, one Item of
 * each kind, and the two routes the restructure moved. `/foundation` replaced
 * `/foundations` and `/changelogs` joined the set, so the slug a baseline is
 * keyed by is the Section's own segment and a rename can no longer orphan a
 * committed image. `/foundation/themes` keeps the bare `themes` slug: it is a
 * page of the Foundation Section rather than a Section of its own, and the
 * Section prefix is already in the path.
 *
 * The axe scan runs in the real browser, which is the only place the
 * `color-contrast` rule can evaluate; it runs in one project so the job stays
 * quick. The 44px check runs only in the coarse-pointer project.
 *
 * The three widths are all committed now, 768 included. `display.spec.ts` holds
 * the computed values at each project's own width and `header-fit.spec.ts` holds
 * the measured widths, because a rule can compute to exactly the value it should
 * and still render wider than the viewport, which is what the row did at 768.
 */
const ROUTES = [
  { path: '/', slug: 'home' },
  { path: '/components', slug: 'components' },
  { path: '/components/button', slug: 'component-button' },
  { path: '/blocks/hero-01', slug: 'block-hero-01' },
  { path: '/foundation/themes', slug: 'themes' },
  { path: '/foundation', slug: 'foundation' },
  { path: '/changelogs', slug: 'changelogs' },
]

test.beforeEach(async ({ page }, testInfo) => {
  const mode = (testInfo.project.metadata as { mode?: string }).mode ?? 'light'
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('prism-theme', JSON.stringify({ pack: 'default', mode: value }))
    } catch {
      // A blocked localStorage leaves the default light theme; the shot is
      // still deterministic.
    }
  }, mode)
})

for (const route of ROUTES) {
  test(`screenshot ${route.slug}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'networkidle' })
    /*
     * The page is walked to its foot and allowed to settle before it is
     * captured, because an Item page holds its Demos behind showcase frames
     * that are `loading="lazy"`, and a full-page capture that never scrolls
     * leaves a frame below the fold at its declared floor height: the same
     * tree then screenshots at one of several stable heights, none of them
     * wrong on the screen a reader scrolls and every one of them a flake
     * here. The walk loads every frame; the settle then waits, in order, on
     * the page's fonts, every same-origin frame's load, every frame's fonts
     * (the parent's readiness says nothing about a frame's), and two
     * animation frames for the showcase's measured-height commit to land.
     */
    await page.evaluate(async () => {
      const scrollHeight = document.body.scrollHeight
      for (let y = 0; y < scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 16))
      }
      window.scrollTo(0, 0)
      await document.fonts.ready
      const frames = [...document.querySelectorAll<HTMLIFrameElement>('iframe')]
      await Promise.all(
        frames.map(
          (frame) =>
            new Promise<void>((resolve) => {
              if (frame.contentDocument?.readyState === 'complete') resolve()
              else frame.addEventListener('load', () => resolve(), { once: true })
            }),
        ),
      )
      await Promise.all(frames.map(async (frame) => void (await frame.contentDocument?.fonts.ready)))
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
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
  // The Demo renders behind the showcase's scaled iframe, which is the same
  // origin this page is served from, so the controls the floor exists for are in
  // the frame's document rather than in the page's own `main`. This lane queried
  // `main button` for the page's own controls, found none since the showcase
  // gained its toolbar, and `Math.max` over an empty list is `-Infinity`, so the
  // assertion failed on nothing rather than measuring anything. The count is
  // asserted first so the floor can never be held by a selector that quietly
  // went empty a second time.
  const heights = await page
    .locator('main iframe')
    .evaluateAll((frames: HTMLIFrameElement[]) =>
      frames.flatMap((frame) =>
        [...(frame.contentDocument?.querySelectorAll('button') ?? [])].map(
          (button) => button.getBoundingClientRect().height,
        ),
      ),
    )
  expect(heights.length, 'the demo frame holds the controls this lane measures').toBeGreaterThan(0)
  expect(Math.max(...heights)).toBeGreaterThanOrEqual(44)
})
