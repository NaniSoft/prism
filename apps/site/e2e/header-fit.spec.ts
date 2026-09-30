import { expect, test, type Page, type TestInfo } from '@playwright/test'

import { TOP_NAV } from '../src/lib/nav'

/**
 * Does the header fit, and is the right affordance on screen.
 *
 * `display.spec.ts` reads `getComputedStyle` once per Playwright project, which is
 * three viewports, and answers "which element is on screen". It cannot answer
 * "does the row fit", because the failure this file exists for was never a
 * computed value: the row computed `display: flex` at 768 exactly as intended, and
 * its content measured 1013 pixels against a 768 pixel viewport, so the document
 * scrolled 245 pixels sideways and the mode toggle sat off screen. A display
 * assertion passed the whole time.
 *
 * So this lane reads the measurements instead. It sweeps the widths rather than
 * taking them from the project, because the defect lived in a width between two of
 * them: 768 and 1024 both reported no overflow at the time, and the row was
 * 1013 wide at 768 and 1013 wide at 1024 with the wordmark folded. Every width
 * the design system authors (`sm`, `md`, `lg`) is swept, plus the two the visual
 * lane screenshots, so a band that is only wrong between two of them is inside
 * this lane too.
 *
 * The claim is per width, per Mode and per route, and it has three parts:
 *
 * 1. The document never scrolls sideways. That is the reader's symptom and it is
 *    the one that produced both the 1013 pixel baselines and the 1081 pixel row
 *    the manifest's ninth Section produced.
 * 2. Every control in the header is inside the viewport, which is the specific
 *    harm: the mode toggle at 768 was the control that fell off the right edge,
 *    and a control a pointer cannot reach is worse than a wide page.
 * 3. The affordance is the one that width is designed for, and it is a peer of the
 *    other one rather than a subset of it: below `lg` the disclosure opens onto
 *    every Section the manifest declares, so moving the row to `lg` moved nothing
 *    out of a reader's reach at the width it moved at.
 */

/** The width and Mode this project runs at, from the config's own metadata. */
function project(testInfo: TestInfo) {
  const metadata = testInfo.project.metadata as { mode?: string; width?: number }
  return {
    mode: metadata.mode ?? 'light',
    width: metadata.width ?? testInfo.project.use.viewport?.width ?? 1440,
  }
}

/** The Tailwind breakpoints, in pixels, so an expectation is a width and not a token. */
const AT = { sm: 640, md: 768, lg: 1024 }

/**
 * The widths swept: every authored threshold and both visual viewports.
 *
 * `390` is a visual viewport and is below `sm`; `640` and `768` are the two
 * thresholds the header's controls switch at; `1024` is the width the row switches
 * at, which is the width a wrong decision about it shows up at; `1440` is the
 * other visual viewport. A width between two of them is where this defect lived,
 * which is why the list is the union rather than the three the gate reads.
 */
const WIDTHS = [390, AT.sm, AT.md, AT.lg, 1440]

/** A documentation route and the landing page, because the header is on both. */
const ROUTES = ['/', '/components/button']

type Measured = {
  clientWidth: number
  scrollWidth: number
  navDisplay: string
  menuDisplay: string
  /** Every header control that is not fully inside the viewport, by its label. */
  offscreen: string[]
}

async function measure(page: Page): Promise<Measured> {
  return page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Main"]')
    const menu = document.querySelector('header div[class~="lg:hidden"]')
    const limit = document.documentElement.clientWidth
    const offscreen: string[] = []
    for (const element of Array.from(document.querySelectorAll('header a, header button'))) {
      const box = element.getBoundingClientRect()
      if (box.width === 0 && box.height === 0) continue
      const label =
        element.getAttribute('aria-label') ??
        (element.textContent ?? '').trim() ??
        ''
      if (box.left < -0.5 || box.right > limit + 0.5) offscreen.push(label || element.tagName)
    }
    return {
      clientWidth: limit,
      scrollWidth: document.documentElement.scrollWidth,
      navDisplay: nav ? getComputedStyle(nav).display : '(absent)',
      menuDisplay: menu ? getComputedStyle(menu).display : '(absent)',
      offscreen,
    }
  })
}

test.beforeEach(async ({ page }, testInfo) => {
  const { mode } = project(testInfo)
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('ds-theme', JSON.stringify({ id: 'default', mode: value }))
    } catch {
      // A blocked localStorage leaves the default light theme; every assertion
      // here is about width, and width does not depend on the Mode.
    }
  }, mode)
})

for (const route of ROUTES) {
  test(`the header fits and carries the right affordance at every width on ${route}`, async ({
    page,
  }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route, { waitUntil: 'networkidle' })
      const measured = await measure(page)
      const where = `${route} at ${width}px`

      expect(measured.scrollWidth, `${where}: the document scrolls sideways`).toBeLessThanOrEqual(
        measured.clientWidth,
      )
      expect(measured.offscreen, `${where}: a header control is off screen`).toEqual([])

      // The row is the `lg` affordance and the disclosure is its mirror, so the two
      // assertions are one decision read twice.
      const fullRow = width >= AT.lg
      expect(measured.navDisplay, `${where}: the navigation row`).toBe(fullRow ? 'flex' : 'none')
      expect(measured.menuDisplay, `${where}: the mobile menu`).toBe(fullRow ? 'none' : 'block')
    }
  })
}

test('the disclosure carries every Section below lg, so the row moving cost no route', async ({
  page,
}) => {
  for (const width of [AT.sm, AT.md]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.locator('header div[class~="lg:hidden"] > button').click()
    const links = await page
      .locator('header div[class~="lg:hidden"] nav[aria-label="Main"] a')
      .evaluateAll((elements) => elements.map((element) => (element.textContent ?? '').trim()))
    // The count is the manifest's, read from the same module the disclosure
    // renders from, rather than a number typed here. It was `7`, and the manifest
    // grew to nine when Patterns and Live joined it, so this assertion had been
    // asserting a roster the site stopped publishing: it would have failed the
    // next time anyone ran this lane, which is the best possible outcome, and
    // would have been a false failure about a regression that never happened. A
    // Section that cannot reach a reader is the harm this lane exists for, so the
    // assertion has to be about the roster rather than about the roster as it was
    // once.
    expect(links, `the disclosure at ${width}px`).toEqual(TOP_NAV.map((item) => item.label))
    // The horizontal row is rendered but not on screen, so a reader is never
    // looking at two lists of Sections at once.
    expect(await page.locator('header nav[aria-label="Main"]').first().isVisible()).toBe(false)
  }
})
