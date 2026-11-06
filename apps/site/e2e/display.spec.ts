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
      window.localStorage.setItem('prism-theme', JSON.stringify({ pack: 'default', mode: value }))
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
    /*
     * The trigger is named by its slot rather than by the class that hides it.
     * The old bar wrapped the disclosure in a `div` carrying `lg:hidden` and this
     * query found it; the bar that replaced it is `SiteNavbar`, whose trigger is the
     * control itself and whose panel is a Sheet portalled outside the bar entirely.
     * A selector written against a utility class would keep passing while the
     * element it named stopped existing, which is the shape of a lane that stops
     * testing anything.
     */
    const menuElement = document.querySelector('[data-slot="site-navbar-mobile-trigger"]')
    return [
      navElement ? getComputedStyle(navElement).display : '(absent)',
      menuElement ? getComputedStyle(menuElement).display : '(absent)',
    ]
  })
  // Compared as a boolean rather than against a display value, because the trigger
  // is a flex row of an icon and a sheet trigger is not obliged to compute to
  // `block`. What this lane is about is which of the two affordances is on screen.
  //
  // The comparison is `width >= AT.lg`, and the direction is the whole of what
  // this asserts: the trigger is `lg:hidden`, so it is hidden from `lg` up and on
  // screen below it. This was written `<` when the lane landed, which inverts the
  // claim, and because both sides of the mirror failed at their own widths the
  // lane was red at every project from its first run rather than green at two and
  // red at one, so no passing width ever hid the inversion.
  expect(menu === 'none', `the mobile menu at ${width}px`).toBe(width >= AT.lg)
  // The two are one decision read twice, so they cannot both be on screen.
  expect(nav === 'none').toBe(menu !== 'none')
})

test('every header control carries its name, and the pack name follows sm', async ({
  page,
}, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/', { waitUntil: 'networkidle' })
  const controls = await page.locator('header button').evaluateAll((elements) =>
    elements.map((element) => ({
      name: element.getAttribute('aria-label') ?? (element.textContent ?? '').trim(),
      text: (element.textContent ?? '').trim(),
    })),
  )
  // Every control in the header announces what it is. The search trigger is the
  // one that no longer shows a word beside its icon, which is the trade
  // `SearchEntry` makes for the 55 pixels the row needed at the `lg` threshold,
  // so the assertion that keeps that trade honest is that the name is still
  // there: an icon with no accessible name would have saved the same pixels and
  // told a screen-reader user nothing. The name is the label when the control
  // carries one and its own text when it does not, because the Catalogue group's
  // trigger names itself by its content and a button whose visible word is its
  // accessible name needs no second copy of that word in an attribute.
  for (const control of controls) {
    expect(
      control.name.length,
      `a header control with no accessible name: ${control.text}`,
    ).toBeGreaterThan(0)
  }
  // The one visible label left in the header is the pack name, and it follows
  // `sm`: at 390 the row carries a menu button and a theme swatch, and nine
  // characters of theme name beside them is a label with no room to be read.
  const packName = await page
    .locator('header span[class~="sm:inline"]')
    .evaluate((element) => getComputedStyle(element).display)
  expect(packName === 'none', `the pack name in the header at ${width}px`).toBe(width < AT.sm)
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

test('the demo frame is full-bleed, on one step at every width', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/components/button', { waitUntil: 'networkidle' })
  // The frame this lane used to measure was a padded `div` whose inset stepped
  // at `sm`, and it was retired when the Item showcase became a toolbar and a
  // scaled iframe. The showcase's own record is the decision to hold: one
  // padding step at every width, because this site and the library are two
  // Tailwind builds sharing one `utilities` layer and the library's
  // unconditional padding outranks a stepped variant, so a step would silently
  // never apply. The preview stage is therefore full-bleed and the one step
  // lives on the code panel a reader opens, which is not on the page at first
  // paint; what is, and what this asserts, is the full-bleed stage.
  const padding = await page
    .locator('main [data-preview-stage]')
    .evaluate((element) => getComputedStyle(element).paddingTop)
  expect(padding, `the demo frame inset at ${width}px`).toBe('0px')
})

test('the footer keeps its own rhythm, one step at every width', async ({ page }, testInfo) => {
  const { width } = project(testInfo)
  await page.goto('/', { waitUntil: 'networkidle' })
  const measured = await page.locator('footer > div').evaluate((element) => {
    const style = getComputedStyle(element)
    return { paddingTop: style.paddingTop, rowGap: style.rowGap }
  })
  // `py-12` and `gap-10`: the footer is the library's own `SiteFooter`, and its
  // rhythm is one step at every width, a step tighter than `Section`'s
  // `py-16 sm:py-24`. The footer is the one band on the page that does not take
  // the section rhythm: it marks the end of a document, so it is quieter than a
  // section that is asking to be read, and a footer at the section rhythm reads
  // as a fifth section rather than as the edge of the page. The numbers are the
  // ones the Block is designed to rather than the ones a width would prefer.
  const expected = { paddingTop: '48px', rowGap: '40px' }
  expect(measured, `the footer at ${width}px`).toEqual(expected)
})
