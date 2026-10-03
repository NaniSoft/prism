/**
 * The pack mark's two halves, and what each of them paints.
 *
 * **The defect this is for shipped, and every gate in this repository passed it.**
 * The mark beside a pack's name is two halves, one per mode, and the second half
 * was written `dark:bg-primary`: a Tailwind *variant*. Both stylesheets declare
 * that variant as `@custom-variant dark (&:is(.dark *))`, which compiles to
 * `:is(.dark *)` and therefore matches only a DESCENDANT of `.dark`. The element
 * carried no `dark` class, so the rule never matched the element itself. In a
 * light document the second half fell through to `bg-background` and the mark
 * showed a pack primary beside a pack background with no second mode in it; in a
 * dark document the variant did match, painted `var(--primary)` in the DOCUMENT's
 * mode, and put the same colour next to the first half.
 *
 * **The fix is the published compound form and nothing else.** The token build
 * emits `[data-pack="<id>"].dark` beside `.dark [data-pack="<id>"]` for exactly
 * this case, an element that must hold a fixed mode. Putting the literal `dark`
 * class on the element makes the first member match IT, so the custom property
 * the half paints with is declared on the element itself. Nothing above it is
 * consulted, which is what makes the claim "this half does not move with the
 * page's mode" a fact about the cascade rather than a hope.
 *
 * **How the paint is resolved here, and why it is not `getComputedStyle`.**
 * jsdom is not a browser and cannot answer this question. Measured rather than
 * assumed: given the shipped stylesheet and a `<span class="bg-primary">`,
 * jsdom's `getComputedStyle` answers `background-color: "rgba(0, 0, 0, 0)"` and
 * `--primary: ""`, because it implements no `@layer` and no `var()`. A test built
 * on that would pass for a reason that has nothing to do with the paint.
 *
 * So the cascade is resolved from the artifact by the resolver below, over the
 * REAL stylesheet the library ships (`packages/ui/dist/styles.css`), and the
 * element is the REAL markup the component emits: `ShowcaseToolbar` is rendered
 * with `renderToStaticMarkup` and the halves are read out of the output, so a
 * change to the component is a change to what this measures rather than something
 * this file has to be told about.
 *
 * **Three primitives are reimplemented here, and each is asserted against known
 * answers before anything depends on it**: the specificity counter, the cascade
 * comparator, and the selector recogniser. A test that reimplements the cascade is
 * only honest if the reimplementation is itself checked against something outside
 * itself, which is what the first `describe` is for.
 *
 * **The sheet, and the one thing it cannot see.** `@nanisoft/site#test` depends on
 * `^build`, so `packages/ui/dist/styles.css` exists when this runs. It is the only
 * stylesheet this lane can have: the site's own Tailwind build writes to
 * `apps/site/.next`, and `pnpm test` runs before `pnpm build`. The library's sheet
 * is sufficient for this element, and the assertions below fail loudly if it stops
 * carrying something the answer depends on, so a thinner sheet cannot quietly make
 * this pass. The shape the `dark` variant compiles to is READ out of it, from a
 * rule this build really emitted (`.dark\:bg-muted:is(.dark *)`), because the whole
 * defect was assuming that shape instead of measuring it.
 *
 * The two stated limits are at the end of the header rather than in a comment at the
 * foot of the file, and neither is a caveat about the answer: this resolver reads
 * the resting paint of a `<span>` in a document at rest, in the two modes, at every
 * width, and it declines to judge any selector shape it cannot read rather than
 * guessing. It resolves over the LIBRARY's stylesheet rather than the composed one,
 * which is what this lane can have without a site build; the composed sheet adds the
 * site's own utilities, and the one that bears on this element is the `dark:` variant
 * whose shape is read out of the artifact above. A browser settles the rest, and it
 * is the lane for anything here is wrong about: `apps/site/e2e/display.spec.ts` reads
 * `getComputedStyle` for the surfaces this file cannot see.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ShowcaseToolbar } from '../src/components/showcase-toolbar'
import { SHOWCASE_PACKS } from '../src/lib/showcase'

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SHEET_PATH = path.join(SITE, '..', '..', 'packages', 'ui', 'dist', 'styles.css')
const SHEET = readFileSync(SHEET_PATH, 'utf8')

// ------------------------------------------------------------------ the sheet

interface Declaration {
  property: string
  value: string
}

interface Rule {
  /** The `@layer` this rule sits in, or null when the rule is unlayered. */
  layer: string | null
  /** The selector text, verbatim, including any comma-separated list. */
  selector: string
  declarations: Declaration[]
  /** Byte offset of the rule's body, which is the position the cascade ties on. */
  offset: number
}

/**
 * Parse the sheet into flat rules carrying their layer and their position.
 *
 * Written here rather than imported from `utility-cascade.mjs` because that parser
 * drops custom properties on purpose: for the cascade it measures, `--tw-*` and the
 * semantic tokens are a second question it does not ask. This question is entirely
 * about them.
 *
 * `@media` subtrees are SKIPPED, and that is a stated limit rather than a
 * simplification. A variant-scoped declaration is not what decides the resting
 * paint of a `<span>` in a document at rest, and Tailwind v4 emits range syntax
 * (`(width >= 40rem)`) that a `min-width` reader here would have to reimplement to
 * be right. What is lost is bounded by an assertion below rather than assumed: no
 * media-scoped rule in this sheet declares a `background-color` for a class the mark
 * carries.
 */
function parseSheet(css: string): { rules: Rule[]; layerRanks: Map<string, number> } {
  const rules: Rule[] = []
  const layerRanks = new Map<string, number>()
  const rank = (name: string) => {
    if (!layerRanks.has(name)) layerRanks.set(name, layerRanks.size)
  }

  // The order a browser resolves layers in is first appearance across statements
  // and blocks alike, which is the reading `utility-cascade.mjs` asserts against a
  // minifier that dropped the statements. Same rule, same reason.
  for (const match of css.matchAll(/@layer\s+([^;{]*[;{])/g)) {
    for (const name of match[1].replace(/[;{]\s*$/, '').split(',')) {
      if (name.trim()) rank(name.trim())
    }
  }

  const matchingBrace = (source: string, open: number): number => {
    let depth = 0
    for (let i = open; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1
      else if (source[i] === '}') {
        depth -= 1
        if (depth === 0) return i
      }
    }
    return -1
  }

  const walk = (source: string, layer: string | null, base: number): void => {
    let prelude = ''
    let i = 0
    while (i < source.length) {
      const char = source[i]
      if (char === '{') {
        const head = prelude.trim()
        prelude = ''
        const end = matchingBrace(source, i)
        if (end === -1) return
        const inner = source.slice(i + 1, end)
        const bodyOffset = base + i + 1
        if (head.startsWith('@layer')) {
          walk(inner, head.slice('@layer'.length).trim(), bodyOffset)
        } else if (head.startsWith('@')) {
          // `@media`, `@supports`, `@keyframes`, `@font-face`, `@property`: skipped.
        } else {
          const declarations: Declaration[] = []
          for (const part of inner.split(';')) {
            const colon = part.indexOf(':')
            if (colon === -1) continue
            declarations.push({
              property: part.slice(0, colon).trim(),
              value: part.slice(colon + 1).trim(),
            })
          }
          if (declarations.length > 0) {
            rules.push({ layer, selector: head, declarations, offset: bodyOffset })
          }
        }
        i = end + 1
        continue
      }
      if (char === ';' || char === '}') {
        prelude = ''
        i += 1
        continue
      }
      prelude += char
      i += 1
    }
  }

  walk(css, null, 0)
  return { rules, layerRanks }
}

const { rules: RULES, layerRanks: LAYER_RANKS } = parseSheet(SHEET)

// ------------------------------------------------------------- specificity

type Specificity = readonly [number, number, number]

const compare = (a: Specificity, b: Specificity): number => {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1
  }
  return 0
}

/** The index just past the `)` that closes the paren opened at `open`. */
function closingParen(text: string, open: number): number {
  let depth = 0
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1
    else if (text[i] === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return text.length
}

/** Split on the commas between arguments, ignoring the ones inside brackets. */
function splitTopLevel(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts
}

/**
 * Split a complex selector into its compound selectors, at the spaces BETWEEN them.
 *
 * Depth-aware, and the space inside `:is(.dark *)` is the reason. Splitting on
 * `/\s+/` cuts that variant argument in half, so the recogniser sees a `:is(` that
 * never closes and the specificity counter reads the argument as two type
 * selectors: the same mistake twice, in the two places that decide whether the
 * `dark` variant ties the bare utility it overrides.
 */
function splitLinks(complex: string): string[] {
  const links: string[] = []
  let depth = 0
  let current = ''
  for (const char of complex) {
    if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    if (/\s/.test(char) && depth === 0) {
      if (current !== '') links.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current !== '') links.push(current)
  return links
}

const DELIMITER = /[\s.[\]():>+~]/

/**
 * The specificity of one complex selector, as `[ids, classes, types]`.
 *
 * Four spec rules, each of which decides something in this stylesheet:
 *
 *   - `*` contributes NOTHING, which is why `:is(.dark *)` is worth `(0,1,0)` and
 *     not `(0,2,0)`, and that is the single detail that decides whether the `dark`
 *     variant ties the bare utility it is meant to override;
 *   - `:where()` contributes nothing at all, and `:is()`, `:not()` and `:has()`
 *     contribute their MOST specific argument;
 *   - a pseudo-class counts as a class and a pseudo-element as a type;
 *   - an attribute selector counts as a class, so `[data-pack="mint"].dark` is
 *     `(0,2,0)` against the light block's `(0,1,0)`.
 */
function specificityOf(selector: string): Specificity {
  let ids = 0
  let classes = 0
  let types = 0

  const readLink = (text: string): void => {
    let i = 0
    while (i < text.length) {
      const char = text[i]
      if (char === '.') {
        classes += 1
        i += 1
        // Escape-aware, because Tailwind writes `dark:bg-primary` as
        // `.dark\:bg-primary`: a reader that stops at the backslash and then
        // counts `bg-primary` as a TYPE selector reports (0,2,3) for a selector
        // that is worth (0,2,0), and overstates the `dark` variant by more than it
        // is.
        while (i < text.length) {
          if (text[i] === '\\') {
            i += 2
            continue
          }
          if (DELIMITER.test(text[i])) break
          i += 1
        }
        continue
      }
      if (char === '#') {
        ids += 1
        i += 1
        while (i < text.length && text[i] !== '\\' && !DELIMITER.test(text[i])) i += 1
        continue
      }
      if (char === '[') {
        classes += 1
        const end = text.indexOf(']', i)
        if (end === -1) return
        i = end + 1
        continue
      }
      if (char === ':') {
        const doubled = text[i + 1] === ':'
        const name = /^:{1,2}([-\w]+)/.exec(text.slice(i))?.[1] ?? ''
        i += (doubled ? 2 : 1) + name.length
        if (name === 'where') {
          i = closingParen(text, i) + 1
          continue
        }
        if (name === 'is' || name === 'not' || name === 'has') {
          const end = closingParen(text, i)
          let best: Specificity = [0, 0, 0]
          for (const argument of splitTopLevel(text.slice(i + 1, end))) {
            const value = specificityOf(argument.trim())
            if (compare(value, best) > 0) best = value
          }
          ids += best[0]
          classes += best[1]
          types += best[2]
          i = end + 1
          continue
        }
        if (doubled) types += 1
        else classes += 1
        continue
      }
      if (char === '*') {
        i += 1
        continue
      }
      if (/[-\w\\]/.test(char)) {
        types += 1
        i += 1
        while (i < text.length && (text[i] === '\\' || /[-\w]/.test(text[i]))) i += 1
        continue
      }
      i += 1
    }
  }

  for (const part of splitTopLevel(selector)) {
    for (const link of splitLinks(part)) readLink(link)
  }
  return [ids, classes, types]
}

// --------------------------------------------------------- the cascade order

interface Candidate {
  rule: Rule
  specificity: Specificity
  layerRank: number
}

/**
 * The order a browser resolves normal declarations in: layer, then specificity,
 * then position.
 *
 * Unlayered ranks above EVERY layer, and that half is what the token build relies
 * on: the pack blocks are plain imported CSS while the utilities sit in
 * `@layer utilities`, so a pack block wins a tie it should not need to. The
 * specificity half is what decides between the light block and the dark block,
 * which are both unlayered.
 */
const beats = (a: Candidate, b: Candidate): boolean => {
  if (a.layerRank !== b.layerRank) return a.layerRank > b.layerRank
  const specificity = compare(a.specificity, b.specificity)
  if (specificity !== 0) return specificity > 0
  return a.rule.offset > b.rule.offset
}

const layerRankOf = (rule: Rule): number =>
  rule.layer === null ? Number.POSITIVE_INFINITY : (LAYER_RANKS.get(rule.layer) ?? 0)

// ---------------------------------------------------------- the recogniser

interface Subject {
  /** The class attribute, exactly as the component wrote it. */
  classes: string[]
  /** The `data-pack` value on this element, or null when it carries none. */
  pack: string | null
  /** Whether THIS element carries the `dark` class. */
  dark: boolean
  /** Whether an ancestor of this element carries the `dark` class. */
  underDark: boolean
}

interface Compound {
  classes: string[]
  attributes: { name: string; value: string | null }[]
  /** The `:is(...)` / `:where(...)` argument a variant attached, or null. */
  condition: string | null
}

/**
 * Read one compound selector, or return null for a shape this resolver will not
 * judge.
 *
 * Refusing rather than guessing is the design. A shape the recogniser cannot read
 * must not match, because a false match lets the resolver report a paint the
 * browser does not produce, and that is a test passing for the wrong reason.
 * `:hover`, `::before`, `>` and `+` all land here, and all of them are states or
 * relationships a resting `<span>` in a document at rest is not in.
 */
function readCompound(text: string): Compound | null {
  const compound: Compound = { classes: [], attributes: [], condition: null }
  let i = 0
  while (i < text.length) {
    const char = text[i]
    if (char === '\\') {
      i += 2
      continue
    }
    if (char === '.') {
      let name = ''
      i += 1
      while (i < text.length) {
        if (text[i] === '\\') {
          name += text[i + 1]
          i += 2
          continue
        }
        if (DELIMITER.test(text[i])) break
        name += text[i]
        i += 1
      }
      compound.classes.push(name)
      continue
    }
    if (char === '[') {
      const end = text.indexOf(']', i)
      if (end === -1) return null
      const body = /^([-\w]+)(?:[~|^$*]?="([^"]*)")?$/.exec(text.slice(i + 1, end).trim())
      if (!body) return null
      compound.attributes.push({ name: body[1], value: body[2] ?? null })
      i = end + 1
      continue
    }
    if (char === ':') {
      const doubled = text[i + 1] === ':'
      const name = /^:{1,2}([-\w]+)/.exec(text.slice(i))?.[1]
      if (name !== 'is' && name !== 'where') return null
      const start = i + (doubled ? 2 : 1) + name.length
      const end = closingParen(text, start)
      compound.condition = text.slice(start + 1, end).trim()
      i = end + 1
      continue
    }
    if (char === '*') {
      i += 1
      continue
    }
    if (/[-\w]/.test(char)) {
      // A type selector. This resolver reads none of them, because nothing it
      // judges is written as one, so refusing is the honest answer.
      return null
    }
    return null
  }
  return compound
}

/** Whether the `.dark` half of a `:is(...)` condition is satisfied by the document. */
const conditionHolds = (condition: string | null, subject: Subject): boolean =>
  condition === null || (/(^|\s)\.dark(\s|\*|$)/.test(condition) && subject.underDark)

/** Whether a compound matches the subject itself, ignoring the variant condition. */
function matchesSubject(compound: Compound, subject: Subject): boolean {
  for (const name of compound.classes) {
    if (name !== 'dark' && !subject.classes.includes(name)) return false
  }
  for (const attribute of compound.attributes) {
    if (attribute.name !== 'data-pack') return false
    if (attribute.value === null ? subject.pack === null : subject.pack !== attribute.value) {
      return false
    }
  }
  return true
}

/** Whether one complex selector selects the subject, and nothing else is guessed. */
function selects(complex: string, subject: Subject): boolean {
  if (/[>+~]/.test(complex.replace(/\\[>+~]/g, ''))) return false
  const read = splitLinks(complex).map(readCompound)
  if (read.some((link) => link === null)) return false
  const links = read as Compound[]
  /*
   * The only ancestor this document has is the mode class, because the only
   * descendant chains the token build publishes are `.dark [data-pack="<id>"]`.
   * It is read from the ANCESTOR and never from the element: a compound form
   * carries `dark` on the element that paints, and a descendant combinator is
   * strict about what counts as above it.
   */
  const ancestorHolds = links.slice(0, -1).every(
    (link) =>
      link.classes.length === 1 && link.classes[0] === 'dark' && link.attributes.length === 0,
  )
  if (!ancestorHolds) return false
  if (links.length > 1 && !subject.underDark) return false
  const target = links[links.length - 1]
  if (!matchesSubject(target, subject)) return false
  // `.dark` on the element is the compound form's own half, not a condition.
  if (target.classes.includes('dark') && !subject.dark && target.condition === null) return false
  return conditionHolds(target.condition, subject)
}

/** The comma-separated members of a rule's selector that select this subject. */
function selectingMembers(rule: Rule, subject: Subject): string[] {
  return splitTopLevel(rule.selector)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && selects(part, subject))
}

/** The value `property` takes for this subject, or null when nothing declares it. */
function valueOf(property: string, subject: Subject): string | null {
  const contenders: Candidate[] = []
  for (const rule of RULES) {
    if (!rule.declarations.some((entry) => entry.property === property)) continue
    const members = selectingMembers(rule, subject)
    if (members.length === 0) continue
    contenders.push({
      rule,
      specificity: specificityOf(members[0]),
      layerRank: layerRankOf(rule),
    })
  }
  if (contenders.length === 0) return null
  const winner = contenders.reduce((top, entry) => (beats(entry, top) ? entry : top))
  return winner.rule.declarations.find((entry) => entry.property === property)?.value ?? null
}

/**
 * A custom property's value for this subject, with its own `var()` read followed.
 *
 * A custom property inherits, and a declaration on the element beats anything on
 * an ancestor, which is the whole mechanism of the fix: the second half carries
 * both `data-pack` and `dark`, so the dark block declares `--primary` ON it and no
 * ancestor is consulted.
 */
function tokenValue(name: string, subject: Subject, depth = 0): string | null {
  if (depth > 4) return null
  const value = valueOf(name, subject)
  if (value === null) return null
  return value.replace(/var\((--[\w-]+)\)/g, (_match, referenced: string) => {
    if (referenced === name) return 'initial'
    return tokenValue(referenced, subject, depth + 1) ?? 'initial'
  })
}

/** The painted `background-color`, with the token read resolved to its value. */
const paintedBackground = (subject: Subject): string | null => {
  const value = valueOf('background-color', subject)
  if (value === null) return null
  return value.replace(/var\((--[\w-]+)\)/g, (_match, referenced: string) => {
    if (referenced === 'background-color') return 'initial'
    return tokenValue(referenced, subject) ?? 'initial'
  })
}

// -------------------------------------------------------------- the element

/**
 * The two halves, read out of the markup the component actually emits.
 *
 * The frame is located by its `rounded-full` and the halves are the two spans
 * inside it. Reading the output rather than a copy of the class list is the point:
 * a hand-written list would be a second list that drifts, which is the failure
 * `check-pack-boundary.mjs` exists to prevent on the other side of this.
 */
function halvesOf(markup: string): { pack: string; classes: string[] }[] {
  /*
   * The frame's contents are matched as a RUN of empty spans rather than with a
   * lazy `.*?`, which stops at the first pair of adjacent closing tags and hands
   * back half the second span. The shape written here is the shape the frame has,
   * so a frame that gained a child this file would have to be taught about rather
   * than silently reading one half.
   */
  const frame =
    /<span aria-hidden="true" class="[^"]*rounded-full[^"]*">((?:<span[^>]*><\/span>)+)<\/span>/.exec(
      markup,
    )
  expect(frame, 'the mark is an aria-hidden rounded frame holding two halves').not.toBeNull()
  const found = [
    ...(frame?.[1] ?? '').matchAll(/<span data-pack="([^"]*)" class="([^"]*)"><\/span>/g),
  ]
  expect(found.length, 'the frame holds exactly two halves').toBe(2)
  return found.map((match) => ({ pack: match[1], classes: match[2].split(/\s+/).filter(Boolean) }))
}

const MARKUP = renderToStaticMarkup(
  createElement(ShowcaseToolbar, {
    pack: 'mint',
    onPack: () => {},
    mode: 'light',
    onMode: () => {},
    width: 'auto',
    onWidth: () => {},
    showResolution: false,
  }),
)

const halves = halvesOf(MARKUP)

/**
 * The packs the token build publishes, read out of the artifact rather than listed.
 *
 * `SHOWCASE_PACKS` opens with the base pack, and the base pack is the ABSENCE of
 * `data-pack`, so there is no published `[data-pack="default"]` block for it to
 * match. Reading the published set is what keeps the loop over the five that have
 * one, and it means a sixth pack is picked up here the day the build emits it.
 */
const PUBLISHED = [...new Set(
  RULES.flatMap((rule) =>
    [...rule.selector.matchAll(/\[data-pack="([a-z-]+)"\]\.dark/g)].map((match) => match[1]),
  ),
)].sort()

const subjectOf = (half: { classes: string[] }, pack: string, documentDark: boolean): Subject => ({
  classes: half.classes,
  pack,
  dark: half.classes.includes('dark'),
  underDark: documentDark,
})

/**
 * A subject written in the published compound form, `[data-pack="<id>"].dark`.
 *
 * Used as the EXPECTATION rather than reading it back off the half under test,
 * because an expectation derived from the class list being asserted cannot fail for
 * the reason the assertion exists. This is what the token build publishes, written
 * out, and every dark primary below is what it resolves to.
 */
const compoundSubject = (pack: string): Subject => ({
  classes: ['dark', 'bg-primary'],
  pack,
  dark: true,
  underDark: false,
})

// ----------------------------------------------------- the reimplemented bits

describe('the cascade primitives this file reimplements', () => {
  it('counts specificity the way the specification does', () => {
    const cases: [string, Specificity][] = [
      ['.bg-primary', [0, 1, 0]],
      ['[data-pack="mint"]', [0, 1, 0]],
      ['[data-pack="mint"].dark', [0, 2, 0]],
      ['.dark [data-pack="mint"]', [0, 2, 0]],
      // `*` contributes nothing, so `:is(.dark *)` is worth the `.dark` alone.
      ['.dark\\:bg-primary:is(.dark *)', [0, 2, 0]],
      [':root', [0, 1, 0]],
      ['::before', [0, 0, 1]],
      [':where(.a, #b)', [0, 0, 0]],
      [':is(.a, #b)', [1, 0, 0]],
      ['#a .b c', [1, 1, 1]],
    ]
    for (const [selector, expected] of cases) {
      expect([selector, specificityOf(selector)]).toEqual([selector, expected])
    }
  })

  it('resolves layer, then specificity, then position, and refuses a weaker rule', () => {
    const candidate = (layerRank: number, specificity: Specificity, offset: number): Candidate => ({
      rule: { layer: null, selector: '.a', declarations: [], offset },
      specificity,
      layerRank,
    })
    const unlayered = candidate(Number.POSITIVE_INFINITY, [0, 0, 0], 1)
    const layered = candidate(4, [9, 9, 9], 10_000)
    expect(beats(unlayered, layered)).toBe(true)
    expect(beats(layered, unlayered)).toBe(false)

    const stronger = candidate(4, [0, 2, 0], 1)
    const weaker = candidate(4, [0, 1, 0], 10_000)
    expect(beats(stronger, weaker)).toBe(true)
    expect(beats(weaker, stronger)).toBe(false)

    expect(beats(candidate(4, [0, 1, 0], 10), candidate(4, [0, 1, 0], 9))).toBe(true)
  })

  it('matches the selector shapes it claims to and refuses the ones it does not', () => {
    const bare: Subject = { classes: ['bg-primary'], pack: 'mint', dark: false, underDark: false }
    expect(selects('.bg-primary', bare)).toBe(true)
    expect(selects('.bg-secondary', bare)).toBe(false)
    // The `dark` variant needs a DESCENDANT of `.dark`, which is the defect.
    const variant: Subject = { ...bare, classes: ['dark:bg-primary', 'bg-primary'] }
    expect(selects('.dark\\:bg-primary:is(.dark *)', variant)).toBe(false)
    expect(selects('.dark\\:bg-primary:is(.dark *)', { ...variant, underDark: true })).toBe(true)
    // The compound form matches the element itself, and needs nothing above it.
    expect(selects('[data-pack="mint"].dark', { ...bare, dark: true })).toBe(true)
    expect(selects('[data-pack="mint"].dark', bare)).toBe(false)
    // The descendant form needs a real ancestor, never the element's own class.
    expect(selects('.dark [data-pack="mint"]', { ...bare, dark: true })).toBe(false)
    expect(selects('.dark [data-pack="mint"]', { ...bare, underDark: true })).toBe(true)
    // A shape the recogniser cannot read is refused rather than guessed at.
    expect(selects('.a:hover', bare)).toBe(false)
    expect(selects('.a > .b', bare)).toBe(false)
    expect(selects('span.bg-primary', bare)).toBe(false)
  })
})

// --------------------------------------------------------------- the sheet

describe("the library's shipped stylesheet", () => {
  it('publishes the compound dark form for every pack, unlayered', () => {
    expect(PUBLISHED.length).toBeGreaterThanOrEqual(2)
    for (const pack of PUBLISHED) {
      const blocks = RULES.filter(
        (rule) =>
          rule.selector === `[data-pack="${pack}"].dark, .dark [data-pack="${pack}"]` &&
          rule.declarations.some((entry) => entry.property === '--primary'),
      )
      expect([pack, blocks.length], `${pack} publishes one dark block declaring --primary`).toEqual([
        pack,
        1,
      ])
      // Imported CSS is unlayered, which is what puts it above `@layer utilities`.
      expect([pack, blocks[0].layer]).toEqual([pack, null])
    }
  })

  it('compiles the dark variant to a descendant selector, read out of the artifact', () => {
    // The shape that caused the defect, taken from a rule this build really
    // emitted rather than from the `@custom-variant` line it came from.
    const compiled = RULES.filter((rule) => rule.selector.includes(':is(.dark *)'))
    expect(compiled.length).toBeGreaterThan(0)
    for (const rule of compiled) {
      expect(rule.selector).toMatch(/\\:[\w-]+:is\(\.dark \*\)$/)
    }
  })

  it('has no base pack block, because the base pack is the absence of the attribute', () => {
    for (const pack of SHOWCASE_PACKS.map((entry) => entry.id)) {
      expect([pack, PUBLISHED.includes(pack)]).toEqual([pack, pack !== 'default'])
    }
  })

  it('decides no half on a media-scoped rule, which is the first stated limit', () => {
    // The parser skips `@media` subtrees on purpose. If one of these declared a
    // background for a class the mark carries, the skipped rule would be one that
    // matters and this resolver would be answering a different question. Read as
    // text, because the parser threw the subtree away.
    const blocks = [...SHEET.matchAll(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g)]
    const classes = halves.flatMap((half) => half.classes)
    const offenders = blocks.filter((block) =>
      classes.some((token) => {
        const escaped = token.replace(/[.:/[\]()%,#]/g, '\\$&')
        return new RegExp(`\\\\${escaped}[^{]*\\{[^}]*background-color`).test(block[0])
      }),
    )
    expect(offenders).toEqual([])
  })
})

// ------------------------------------------------------------- the mark

describe('the pack mark', () => {
  it('is two halves in an aria-hidden rounded frame, and neither half carries a radius', () => {
    const frame = /<span aria-hidden="true" class="([^"]*)">/.exec(MARKUP)
    expect(frame?.[1]).toContain('rounded-full')
    // DESIGN.md: a `data-pack` boundary belongs on a fully-rounded element, on an
    // element carrying no radius utility, or on a shape with no radius concept.
    // The frame is fully rounded and each half names no radius, so a pack boundary
    // moves no corner here.
    for (const half of halves) {
      expect([half.pack, half.classes.filter((token) => token.startsWith('rounded'))]).toEqual([
        half.pack,
        [],
      ])
    }
  })

  it('holds the second half in the dark with the compound form rather than a variant', () => {
    const [, second] = halves
    // The published selector is written `[data-pack="<id>"].dark`, so the element
    // has to carry the class. A `dark:` variant compiles to `:is(.dark *)` and asks
    // for an ancestor instead, which is a different element than the one that paints.
    expect(second.classes).toContain('dark')
    expect([second.pack, second.classes.filter((token) => token.startsWith('dark:'))]).toEqual([
      second.pack,
      [],
    ])
  })

  for (const pack of PUBLISHED) {
    it(`paints the second half with ${pack}'s dark primary in a light document`, () => {
      const [, second] = halves.map((half) => paintedBackground(subjectOf(half, pack, false)))
      // The pack's dark primary, read off a subject written in the published form
      // rather than off the half itself, so the expectation cannot be derived from
      // the class list under test. This is the assertion that says the half holds the
      // dark rather than wearing the page's.
      const dark = tokenValue('--primary', compoundSubject(pack))
      // And the pack's light primary, read off the first half, which wears the
      // ancestor's mode and so is in light on a light page.
      const light = tokenValue('--primary', subjectOf(halves[0], pack, false))
      expect([pack, second]).toEqual([pack, dark])
      expect([pack, second !== light]).toEqual([pack, true])
    })

    it(`paints the second half with ${pack}'s dark primary in a dark document too`, () => {
      const [, second] = halves.map((half) => paintedBackground(subjectOf(half, pack, true)))
      expect([pack, second]).toEqual([pack, tokenValue('--primary', compoundSubject(pack))])
    })

    it(`paints the first half in ${pack}'s own mode, light beside dark on a light page`, () => {
      const [light] = halves.map((half) => paintedBackground(subjectOf(half, pack, false)))
      const [dark] = halves.map((half) => paintedBackground(subjectOf(half, pack, true)))
      expect([pack, light]).toEqual([pack, tokenValue('--primary', subjectOf(halves[0], pack, false))])
      expect([pack, dark]).toEqual([pack, tokenValue('--primary', compoundSubject(pack))])
      // A pack is two axes, so the two halves must not be the same value on the
      // page a reader is most likely to be on.
      expect([pack, light !== dark]).toEqual([pack, true])
    })
  }
})