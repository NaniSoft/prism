import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  findUtilityCascadeFindings,
  layerRanks,
  parseRules,
  SITE_VARIANT_LAYER,
  UTILITIES_LAYER,
  WIDTHS,
} from '../scripts/utility-cascade.mjs'

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The cascade assertions, over a stylesheet small enough to read.
 *
 * The gate itself runs against the built artifact, which means it needs a build
 * to have happened. This lane cannot have one, so it proves the two things a
 * fixture can prove and a build cannot: that the assertions are not vacuous, in
 * both directions, and that the stylesheet this site actually ships declares the
 * layer the gate then depends on.
 *
 * The second is the reason this file is not only fixtures. `globals.css` is read
 * as source and parsed with the same parser the gate uses, so the assertion that
 * `site-variants` is declared above `utilities` and holds only media-scoped rules
 * is made before anything is built. A stylesheet that dropped the layer fails here
 * rather than at the end of a long build.
 *
 * What a fixture cannot prove is the composed stylesheet: two builds meeting in
 * one layer is a property of the artifact, and the gate is where that is read.
 */

/** The site's build, the library's, and the layer the fix adds. */
const SITE_BUILD = `
@layer utilities {
  .hidden { display: none }
  .p-4 { padding: var(--spacing-4) }
  @media (min-width: 48rem) { .md\\:flex { display: flex } }
  @media (min-width: 40rem) { .sm\\:p-6 { padding: var(--spacing-6) } }
}
`
/** The library's build, which lands after the site's and repeats two utilities. */
const LIBRARY_BUILD = `
@layer utilities {
  .hidden { display: none }
  .p-4 { padding: var(--spacing-4) }
}
`
/** One restatement the colliding class lists do not use, so the layer is not empty. */
const UNRELATED = `@layer site-variants { @media (min-width: 90rem) { .\\32 xl\\:block { display: block } } }\n`
/** The two restatements the collision lost. */
const THE_TWO = `@layer site-variants {
  @media (min-width: 48rem) { .md\\:flex { display: flex } }
  @media (min-width: 40rem) { .sm\\:p-6 { padding: var(--spacing-6) } }
}
`
const ORDER = '@layer properties, theme, base, components, utilities, site-variants;\n'

/** The two builds as they concatenate today, with the layer present and ranked. */
const TWO_BUILDS = `${ORDER}${SITE_BUILD}${LIBRARY_BUILD}${UNRELATED}`
/** The same two builds, with the two variants restated where they can win. */
const RESTATED = `${ORDER}${SITE_BUILD}${LIBRARY_BUILD}${THE_TWO}`
/** No layer anywhere, which is the state before the fix. */
const NO_LAYER = `
@layer properties, theme, base, components, utilities;
${SITE_BUILD}${LIBRARY_BUILD}
`
/** Declared and ranked, and holding nothing. */
const EMPTY_LAYER = `${ORDER}${SITE_BUILD}${LIBRARY_BUILD}@layer site-variants {\n}\n`
/** Holding a bare rule, which would outrank every variant in the layer below. */
const BARE_IN_LAYER = `${ORDER}${SITE_BUILD}${LIBRARY_BUILD}@layer site-variants { .p-4 { padding: 0 } }\n`
/** Declared first, so it ranks below the utilities it exists to beat. */
const DEMOTED_LAYER = `
@layer site-variants, properties, theme, base, components, utilities;
${SITE_BUILD}${LIBRARY_BUILD}${THE_TWO}
`

const SOURCE = `
export function Nav() {
  return <nav className="hidden items-center gap-1 md:flex" />
}
export function Frame() {
  return <div className="bg-background p-4 sm:p-6" />
}
`

const groups = (findings: ReturnType<typeof findUtilityCascadeFindings>['findings']) =>
  findings.map((finding) => finding.group)
const messages = (findings: ReturnType<typeof findUtilityCascadeFindings>['findings']) =>
  findings.map((finding) => finding.message).join('\n')

describe('the utility-cascade assertions', () => {
  it('finds the collision a bare utility in the second build causes', () => {
    const { findings } = findUtilityCascadeFindings({
      css: TWO_BUILDS,
      classLists: SOURCE,
      widths: WIDTHS,
    })
    expect(groups(findings)).toEqual(['variant-lost', 'variant-lost'])
    const [first, second] = findings
    expect(first.message).toContain('at 768px')
    expect(first.message).toContain('.md\\:flex')
    expect(first.message).toContain('.hidden')
    expect(second.message).toContain('at 768px')
    expect(second.message).toContain('.sm\\:p-6')
  })

  it('does not report the collision at a width where the variant does not apply', () => {
    const { findings } = findUtilityCascadeFindings({
      css: TWO_BUILDS,
      classLists: SOURCE,
      widths: [390],
    })
    expect(findings).toEqual([])
  })

  it('finds nothing once the variants are restated above the shared layer', () => {
    const { findings } = findUtilityCascadeFindings({
      css: RESTATED,
      classLists: SOURCE,
      widths: WIDTHS,
    })
    expect(findings).toEqual([])
  })

  it('reads a layer statement and a layer block as the same order the browser does', () => {
    // The library's empty `@layer components;` is all that survives minification,
    // so an implementation that read statements before blocks would rank
    // `components` first and pass the collision by accident.
    const onlyBlocks = `
      @layer utilities { .hidden { display: none } }
      @layer components; @layer utilities { .p-4 { padding: 0 } }
    `
    expect([...layerRanks(onlyBlocks).keys()]).toEqual(['utilities', 'components'])
    expect([...layerRanks(RESTATED).keys()]).toEqual([
      'properties',
      'theme',
      'base',
      'components',
      'utilities',
      'site-variants',
    ])
  })

  it('reports a stylesheet with no variant layer at all', () => {
    const { findings } = findUtilityCascadeFindings({
      css: NO_LAYER,
      classLists: SOURCE,
      widths: WIDTHS,
    })
    expect(groups(findings)).toContain('layer')
    expect(messages(findings)).toContain('declares no @layer site-variants')
  })

  it('reports a layer that is declared, ranked and empty', () => {
    const { findings } = findUtilityCascadeFindings({
      css: EMPTY_LAYER,
      classLists: SOURCE,
      widths: WIDTHS,
    })
    expect(groups(findings)).toContain('layer')
    expect(messages(findings)).toContain('decoration')
  })

  it('reports a bare rule put in the variant layer, which would outrank every variant', () => {
    const { findings } = findUtilityCascadeFindings({
      css: BARE_IN_LAYER,
      classLists: SOURCE,
      widths: WIDTHS,
    })
    expect(groups(findings)).toContain('layer')
    expect(messages(findings)).toContain('outside any media query')
  })

  it('reports a layer that lost its rank', () => {
    const { findings } = findUtilityCascadeFindings({
      css: DEMOTED_LAYER,
      classLists: SOURCE,
      widths: WIDTHS,
    })
    expect(groups(findings)).toContain('layer')
    expect(messages(findings)).toContain('does not outrank')
  })
})

describe("the site's own stylesheet", () => {
  const css = readFileSync(path.join(SITE, 'src', 'app', 'globals.css'), 'utf8')
  const ranks = layerRanks(css)
  const rules = parseRules(css)

  it('declares the layer above the utilities it exists to beat', () => {
    expect(ranks.has(SITE_VARIANT_LAYER)).toBe(true)
    expect(ranks.get(SITE_VARIANT_LAYER)).toBeGreaterThan(ranks.get(UTILITIES_LAYER) as number)
  })

  it('holds only restated variants in that layer', () => {
    const held = rules.filter((rule) => rule.layer === SITE_VARIANT_LAYER)
    expect(held.length).toBeGreaterThan(0)
    for (const rule of held) {
      expect(rule.media.length, `${rule.selector} is not inside a media query`).toBeGreaterThan(0)
    }
  })

  it('restates every variant a bare utility would otherwise beat, which is the collision list', () => {
    // The class lists that collide, and the utilities they need restated. Written
    // out rather than derived, so a new collision in the source is a diff here
    // rather than a silent gap: `check-utility-cascade.mjs` is what finds the new
    // one, and this is what it will find.
    const colliding = [
      { className: 'hidden items-center gap-1 md:flex', restated: 'md\\:flex' },
      { className: 'hidden w-60 shrink-0 lg:block', restated: 'lg\\:block' },
      { className: 'hidden sm:inline', restated: 'sm\\:inline' },
      { className: 'bg-background p-4 sm:p-6', restated: 'sm\\:p-6' },
      { className: 'mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 sm:gap-16', restated: 'sm\\:gap-16' },
    ]
    const selectors = new Set(
      rules
        .filter((rule) => rule.layer === SITE_VARIANT_LAYER)
        .flatMap((rule) => rule.selector.split(',').map((part: string) => part.trim())),
    )
    for (const entry of colliding) {
      expect(selectors.has(`.${entry.restated}`), `${entry.className} has no restated variant`).toBe(true)
    }
  })
})
