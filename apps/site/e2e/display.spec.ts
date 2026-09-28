import { expect, test, type TestInfo } from '@playwright/test'

/**
 * The computed outcome of the utility cascade, in the browser.
 *
 * `scripts/check-utility-cascade.mjs` reads the built stylesheet and reasons about
 * the cascade over the class lists the site's own source states. This lane reads
 * the computed style, which is the only place the composed result exists, so it
 * covers the half the gate states it cannot see and, in the other direction, the
 * half the gate has to be trusted on.
 *
 * The gate reads declarations; this reads used values, so it also settles the two
 * things a declaration-level reading cannot: what a blockified flex item computes
 * to, and whether a width in between the three the gate evaluates at is wrong.
 *
 * The coarse-pointer floor is not repeated here. It lives in `visual.spec.ts` and
 * it is the assertion that covers the other limit: a Button rendered by a Demo
 * carries `h-9` and `pointer-coarse:h-11`, both generated from the library's own
 * source, so neither string appears in anything this site's Tailwind build scans
 * and the fix had to leave the library's utility layer on top to keep it.
 *
 * One expectation per project, at the width the project already runs, in both
 * Modes and at the coarse pointer. The numbers are the ones the site is designed
 * to rather than the ones it currently has, so a regression is a red line at the
 * width it broke instead of a pixel diff in a report nobody reads.
 *
 * The header's navigation row and the documentation sidebars are the headline:
 * both are `hidden` plus a breakpoint variant, and both were invisible at every
 * width in both Modes for as long as the site has existed.
 *
 * The row follows `lg` and not `md`, and `header-fit.spec.ts` is where that is
 * measured rather than asserted: this spec states which affordance is on screen at
 * a project's width, and the other one proves the row fits at the width it claims
 * and that a reader below it can still reach every Section.
 */

/** The width and Mode this project runs at, from the config's own metadata. */
function project(testInfo: TestInfo) {
  const metadata = testInfo.project.metadata as { mode?: string; width?: number }
  return { mode: metadata.mode ?? 'light', width: metadata.width ?? testInfo.project.use.viewport?.width ?? 1440 }
}

/** The Tailwind breakpoints, in pixels, so an expectation is a width and not a token. */
const AT = { sm: 640, md: 768, lg: 1024 }

test.beforeEach(async ({ page }, testInfo) => {
  const { mode } = project(testInfo)
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('ds-theme', JSON.stringify({ id: 'default', mode: value }))
    } catch {
      // A blocked localStorage leaves the default light theme; the assertions are
      // about the cascade, which does not depend on the Mode.
    }
  }, mode)
})

test('the header navigation row follows lg', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/', { waitUntil: 'networkidle' })
  const display = await page
    .locator('nav[aria-label="Main"]')
    .evaluate((element) => getComputedStyle(element).display)
  expect(display, `nav[aria-label="Main"] at ${width}px`).toBe(width >= AT.lg ? 'flex' : 'none')
})

test('the mobile menu is the mirror of it, and never both', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/', { waitUntil: 'networkidle' })
  const [nav, menu] = await page.evaluate(() => {
    const navElement = document.querySelector('nav[aria-label="Main"]')
    const menuElement = document.querySelector('header div[class~="lg:hidden"]')
    return [
      navElement ? getComputedStyle(navElement).display : '(absent)',
      menuElement ? getComputedStyle(menuElement).display : '(absent)',
    ]
  })
  expect(menu, `the mobile menu at ${width}px`).toBe(width >= AT.lg ? 'none' : 'block')
  // The two are one decision read twice, so they cannot both be on screen.
  expect(nav === 'none').toBe(menu !== 'none')
})

test('the header labels follow sm', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/', { waitUntil: 'networkidle' })
  const measured = await page.locator('header span.sm\\:inline').evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  )
  expect(measured.length, 'the header has both labels').toBe(2)
  if (width >= AT.sm) {
    for (const value of measured) expect(value, 'a header label has no width').toBeGreaterThan(0)
  } else {
    for (const value of measured) expect(value, 'a header label is visible below sm').toBe(0)
  }
})

test('the documentation sidebars follow lg', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/components/button', { waitUntil: 'networkidle' })
  const displays = await page
    .locator('main aside')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).display))
  expect(displays.length, 'the documentation shell has both asides').toBe(2)
  const expected = width >= AT.lg ? 'block' : 'none'
  expect(displays, `the asides at ${width}px`).toEqual([expected, expected])
})

test('the demo frame padding follows sm', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/components/button', { waitUntil: 'networkidle' })
  const padding = await page
    .locator('main .p-4')
    .first()
    .evaluate((element) => getComputedStyle(element).paddingTop)
  expect(padding, `the demo frame padding at ${width}px`).toBe(width >= AT.sm ? '24px' : '16px')
})

test('the footer follows sm, and the column gap follows with it', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/', { waitUntil: 'networkidle' })
  const measured = await page.locator('footer > div').evaluate((element) => {
    const style = getComputedStyle(element)
    return { paddingTop: style.paddingTop, rowGap: style.rowGap }
  })
  const expected =
    width >= AT.sm ? { paddingTop: '96px', rowGap: '64px' } : { paddingTop: '64px', rowGap: '24px' }
  expect(measured, `the footer at ${width}px`).toEqual(expected)
})
