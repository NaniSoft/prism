/**
 * The utility-cascade assertions, over the built stylesheet and the site's source.
 *
 * This site is two Tailwind builds: its own, over `src`/`items`/`content`, and the
 * library's, prebuilt into `@nanisoft/prism-ui/styles.css`. Each emits its own
 * `@layer utilities`, and the bundler concatenates them, so the reader gets ONE
 * `utilities` layer holding both builds' rules in import order. Inside one layer
 * the only thing left deciding a tie is position, and a `@media` block adds no
 * specificity, so a bare utility in the second stylesheet silently outranks a
 * breakpoint variant in the first.
 *
 * That is the shape of the defect this gate holds shut. It reads the shipped CSS
 * rather than a stylesheet source, because the two builds only meet in the
 * artifact, and it reads the site's own class lists rather than a hand-kept list,
 * because the thing that breaks is a class list nobody wrote down.
 *
 * THE INVARIANT
 *
 * Inside a single Tailwind build, a variant's rule is always emitted after the
 * bare rule it overrides, so a bare rule never outranks a media-scoped one for the
 * same property. That is not a convention, it is the property the framework
 * guarantees and everything responsive in this system depends on. Two builds
 * concatenated into one layer do not have it, and nothing else in the cascade
 * restores it: layer rank cannot, because both builds share the layer, and
 * specificity cannot, because a media query adds none.
 *
 * So the gate asserts the guarantee the composed stylesheet has to keep:
 *
 *   1. `@layer site-variants` exists, ranks above `utilities`, holds at least one
 *      rule, and holds only media-scoped rules. A layer that lost its rank, that a
 *      minifier dropped, that is empty, or that acquired a bare rule, stops being
 *      the thing it is for, and every other assertion here would then be measuring
 *      a stylesheet the site no longer ships.
 *
 *   2. At each of the three widths the site is held to, on every class list the
 *      site writes down, a property that some media-scoped rule also declares is
 *      decided by the media-scoped rule that applies from the latest threshold.
 *      Where it is not, the finding names the width, the rule that took the win,
 *      and the rule that lost, because that is the line to add to the layer. It
 *      fires in two shapes and reports them as two groups: a bare rule winning
 *      over a variant (`variant-lost`), and a variant at a narrower breakpoint
 *      winning over one at a wider breakpoint (`variant-order`).
 *
 * The widths are the visual lane's, not a range, because the cascade is evaluated
 * at the widths the site is screenshotted at rather than continuously. A defect
 * that only appears between two of them is outside this gate and inside the
 * browser one.
 *
 * THE HONEST LIMIT
 *
 * Only class lists written in the site's own source are checked. An element whose
 * classes the library composes at runtime, which is every Prism Component and
 * Block rendered in a Demo, is not in this lane: nothing in the site's source
 * states its class list, so there is nothing here to read. That is the case
 * assertion 1 exists to protect, since the alternative fix (raising the whole of
 * the site's utility layer) displaces exactly those, and the outcome is asserted
 * in the browser lane instead (`e2e/display.spec.ts`, and the 44px coarse-pointer
 * check). Neither lane sees what the other cannot.
 *
 * No filesystem, no browser: the driver reads, this asserts.
 */

/** The breakpoint prefixes a responsive variant can carry, and nothing else. */
export const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl']

/** The layer the site's own restated variants live in. Named by the stylesheet. */
export const SITE_VARIANT_LAYER = 'site-variants'

/** The Tailwind layer the two builds share, and the one the site layer must beat. */
export const UTILITIES_LAYER = 'utilities'

/**
 * The widths the site is held to, in CSS pixels.
 *
 * The visual lane's three viewports, and the reason the cascade is evaluated at
 * three points rather than continuously: a rule that only wins between two of them
 * is a defect the browser lane sees and this one does not, which is recorded in
 * `docs/quality-gates.md` rather than left to be found.
 */
export const WIDTHS = [390, 768, 1440]

/** A CSS custom property is a declaration to be read, not a cascade decision. */
const isDeclaration = (property) => !property.startsWith('--')

function matchingBrace(source, open) {
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Comments out, keeping every byte position.
 *
 * A stylesheet's own prose is not CSS, and this parser reads preludes, so a
 * comment naming an at-rule would otherwise register as that at-rule. The minified
 * stylesheet has no comments, which is why the built artifact parses correctly
 * while the authored source does not. Replaced by spaces rather than removed, so
 * every offset, which is what the cascade is compared on, still means the same
 * place in the text it came from.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
}

/** `48rem` or `768px` in a media condition, in pixels. Null when there is none. */
function minWidthOf(condition) {
  const match = /min-width:\s*([\d.]+)(rem|px)/.exec(condition)
  if (!match) return null
  const value = Number(match[1])
  return match[2] === 'rem' ? value * 16 : value
}

/**
 * The width at which a rule starts to apply, which is the highest threshold any
 * of its conditions names.
 *
 * A rule nested in two media queries has to satisfy both, so the later of the two
 * is the width it begins at, and reading only the first would say a rule starts
 * applying before it can. Null when no condition names a width, which is a rule
 * with no width condition at all: a bare rule, or one wrapped in a condition this
 * parser does not treat as a variant.
 */
function thresholdOf(rule) {
  const widths = rule.media.map(minWidthOf).filter((value) => value !== null)
  return widths.length === 0 ? null : Math.max(...widths)
}

/**
 * Every layer the stylesheet declares, in the order the cascade resolves them.
 *
 * The order is first appearance, in one pass, whether the name arrives in a
 * statement (`@layer a, b;`) or at a block (`@layer a {`). That is the rule a
 * browser applies, and reading the two separately is wrong in a way that would
 * have passed here: a minifier drops a layer statement the surviving blocks
 * already imply, so the only statement left in the shipped stylesheet is the
 * library's empty `@layer components;`, and reading statements before blocks
 * would have ranked `components` first.
 */
export function layerRanks(css) {
  const ranks = new Map()
  const rank = (name) => {
    if (!ranks.has(name)) ranks.set(name, ranks.size)
  }
  for (const match of stripComments(css).matchAll(/@layer\s+([^;{]*[;{])/g)) {
    const names = match[1].replace(/[;{]\s*$/, '')
    if (names.trim() === '') continue
    for (const name of names.split(',').map((entry) => entry.trim()).filter(Boolean)) rank(name)
  }
  return ranks
}

/**
 * Every style rule in the stylesheet, flattened, with its layer and its media.
 *
 * A small recursive walk rather than a real CSS parser, because the input is one
 * file this project produced and the only nesting that carries meaning here is
 * `@layer` (which layer) and `@media` (is this a variant, and at which widths).
 * Anything else is walked through and, for a condition, treated as satisfied:
 * `@supports` is a fallback wrapper around an opacity modifier rather than a
 * variant, and treating it as one would make assertion 2 fire on rules that are
 * not variants of anything.
 */
export function parseRules(css) {
  const rules = []

  /**
   * `base` is where `source` starts in the stylesheet, so every offset recorded is
   * a position in the one document rather than in the block being walked. It has
   * to be, because the whole comparison is "which of these two rules comes later",
   * and a position relative to a nested block cannot answer that across two
   * `@layer utilities` blocks.
   */
  const walk = (source, layer, media, base) => {
    let i = 0
    let prelude = ''
    while (i < source.length) {
      const char = source[i]
      if (char === '{') {
        const head = prelude.trim()
        prelude = ''
        const end = matchingBrace(source, i)
        if (end === -1) return
        const inner = source.slice(i + 1, end)
        const bodyOffset = base + i + 1
        if (head.startsWith('@layer')) walk(inner, head.slice('@layer'.length).trim(), media, bodyOffset)
        else if (head.startsWith('@media')) walk(inner, layer, [...media, head], bodyOffset)
        else if (head.startsWith('@')) walk(inner, layer, media, bodyOffset)
        else {
          const declarations = []
          let cursor = 0
          for (const part of inner.split(';')) {
            const colon = part.indexOf(':')
            if (colon === -1) continue
            const property = part.slice(0, colon).trim()
            if (!isDeclaration(property)) continue
            declarations.push({
              property,
              value: part.slice(colon + 1).trim(),
              offset: bodyOffset + cursor,
            })
            cursor += part.length + 1
          }
          if (declarations.length > 0) {
            rules.push({ layer, media, selector: head, declarations, offset: bodyOffset })
          }
        }
        i = end + 1
        continue
      }
      if (char === ';' || char === '}') {
        prelude = ''
        i++
        continue
      }
      prelude += char
      i++
    }
  }

  walk(stripComments(css), null, [], 0)
  return rules
}

/** The class name a single-class selector declares, unescaped, or null. */
function classNameOf(selector) {
  const match = /^\.((?:\\.|[^\s:{])+)$/.exec(selector.trim())
  return match ? match[1].replace(/\\(.)/g, '$1') : null
}

/**
 * Index the rules by class name, so a class list resolves without re-reading the
 * stylesheet per element.
 *
 * `names` is every class name the stylesheet declares, which is what keeps a
 * sentence in an MDX paragraph from being read as a class list.
 */
export function indexRules(rules) {
  const byClass = new Map()
  const names = new Set()
  for (const rule of rules) {
    for (const part of rule.selector.split(',')) {
      const name = classNameOf(part)
      if (name === null) continue
      names.add(name)
      const list = byClass.get(name) ?? []
      list.push(rule)
      byClass.set(name, list)
    }
  }
  return { byClass, names }
}

/**
 * The class lists the site's own source states, one entry per string literal
 * inside a `className` expression.
 *
 * The expression is read to its matching brace rather than to the next quote,
 * because a class list is as often a conditional as it is a literal and a
 * conditional has a different string in each arm. The literals are then filtered
 * against the names the stylesheet actually declares.
 */
export function classListsIn(source, names) {
  const found = []
  const CLASS_NAME = /\bclassName\s*=\s*/g
  let match
  while ((match = CLASS_NAME.exec(source)) !== null) {
    const start = match.index + match[0].length
    if (source[start] === '{') {
      const end = matchingBrace(source, start)
      if (end === -1) continue
      for (const literal of source.slice(start + 1, end).matchAll(/`([^`]*)`|"([^"]*)"|'([^']*)'/g)) {
        add(literal[1] ?? literal[2] ?? literal[3] ?? '')
      }
      continue
    }
    const quote = source[start]
    if (quote !== '"' && quote !== "'") continue
    const close = source.indexOf(quote, start + 1)
    if (close === -1) continue
    add(source.slice(start + 1, close))
  }

  function add(raw) {
    const tokens = raw.split(/\s+/).filter(Boolean)
    const known = tokens.filter((token) => names.has(token))
    if (known.length < 2) return
    if (!known.some((token) => isBreakpointVariant(token))) return
    found.push(known)
  }

  return found
}

/** A responsive variant, by the prefix it carries rather than by a table. */
export function isBreakpointVariant(token) {
  return BREAKPOINTS.includes(token.split(':')[0])
}

/**
 * @typedef {{ property: string, value: string, offset: number }} Declaration
 * @typedef {{ layer: string | null, media: string[], selector: string, declarations: Declaration[], offset: number }} Rule
 * @typedef {{ group: string, message: string }} Finding
 * @typedef {{ findings: Finding[], ranks: string[], ruleCount: number, listCount: number }} CascadeReport
 */

/** Whether a rule's media conditions are all satisfied at `width`. */
function appliesAt(rule, width) {
  return rule.media.every((condition) => {
    const min = minWidthOf(condition)
    return min === null || width >= min
  })
}

/** The comparison the cascade actually performs: layer first, then position. */
function beats(candidate, incumbent) {
  if (candidate.layerRank !== incumbent.layerRank) return candidate.layerRank > incumbent.layerRank
  return candidate.offset > incumbent.offset
}

/**
 * Run the assertions. Returns findings rather than throwing, so the driver
 * prints all of them and the test lane can assert on the shape.
 *
 * @param {{ css: string, classLists: string, widths?: number[] }} input
 * @returns {CascadeReport}
 */
export function findUtilityCascadeFindings({ css, classLists, widths = WIDTHS }) {
  const findings = []
  const ranks = layerRanks(css)
  const rules = parseRules(css).map((rule) => ({ ...rule, layerRank: ranks.get(rule.layer) ?? 0 }))
  const { byClass, names } = indexRules(rules)
  const lists = classListsIn(classLists, names)
  /** The cascade comparison, as the browser applies it to one rule. */
  const rank = (entry) => ({ layerRank: entry.rule.layerRank, offset: entry.rule.offset })

  /* Assertion 1: the layer exists, ranks where it is meant to, and holds only
     variants. */
  if (!ranks.has(SITE_VARIANT_LAYER)) {
    findings.push({
      group: 'layer',
      message:
        `the built stylesheet declares no @layer ${SITE_VARIANT_LAYER}, so the site's responsive ` +
        `variants have no rank above the library's utility layer and are decided by import order again`,
    })
  } else {
    const siteRank = ranks.get(SITE_VARIANT_LAYER)
    const utilitiesRank = ranks.get(UTILITIES_LAYER)
    if (utilitiesRank !== undefined && siteRank <= utilitiesRank) {
      findings.push({
        group: 'layer',
        message:
          `@layer ${SITE_VARIANT_LAYER} ranks at ${siteRank} and @layer ${UTILITIES_LAYER} at ` +
          `${utilitiesRank}, so the layer does not outrank the utilities it exists to beat`,
      })
    }
    const held = rules.filter((rule) => rule.layer === SITE_VARIANT_LAYER)
    if (held.length === 0) {
      findings.push({
        group: 'layer',
        message: `@layer ${SITE_VARIANT_LAYER} is declared and ranked but holds no rule, so it is decoration`,
      })
    }
    for (const rule of held) {
      if (rule.media.length > 0) continue
      findings.push({
        group: 'layer',
        message:
          `${rule.selector} sits in @layer ${SITE_VARIANT_LAYER} outside any media query, so it ` +
          `outranks the library's variants on every width. Only restated variants belong there`,
      })
    }
  }

  /* Assertion 2: at each width, a property a media-scoped rule declares is
     decided by the media-scoped rule that starts applying latest.

     Two shapes fail, and they are separate findings because the fix is the same
     one line and the reasons are not the same:

       - a bare rule wins, which is the shape the first five restatements exist
         for: the library repeats the utility bare and its copy lands later in
         the one shared `utilities` layer, so position decides and a variant in
         the first build loses to a base class in the second.
       - a variant at a narrower breakpoint wins over a variant at a wider one,
         which is the same defect one step along and the first five restatements
         could never have caught, because both sides are media-scoped and the
         original assertion only asked whether the winner had a media query.

     The second shape is the library's own `sm:` and `lg:` grid utilities landing
     after the site's `lg:` ones, and it is invisible to the first assertion by
     construction: both contenders satisfy it. It is worth its own group because
     a reader who sees only `variant-lost` has been told the site's variants are
     outranked by base classes, which was not what happened.
  */
  const seen = new Map()
  for (const width of widths) {
    for (const tokens of lists) {
      const properties = new Set()
      for (const token of tokens) {
        for (const rule of byClass.get(token) ?? []) {
          if (!appliesAt(rule, width)) continue
          for (const declaration of rule.declarations) properties.add(declaration.property)
        }
      }
      for (const property of properties) {
        const contenders = []
        for (const token of tokens) {
          for (const rule of byClass.get(token) ?? []) {
            if (!appliesAt(rule, width)) continue
            const declaration = rule.declarations.find((entry) => entry.property === property)
            if (declaration) contenders.push({ rule, declaration })
          }
        }
        const winner = contenders.reduce((top, entry) => (beats(rank(entry), rank(top)) ? entry : top))
        const displaced = contenders.filter((entry) => beats(rank(winner), rank(entry)))
        if (displaced.length === 0) continue

        // One finding per distinct collision rather than per element, because the
        // fix is one line and two asides carrying the same pair are the same
        // mistake written twice. The class lists are all listed, so the number of
        // elements a single finding covers is visible rather than implied.
        const record = (group, reason) => {
          const key = `${group}:${property}:${winner.rule.selector}:${reason}`
          const existing = seen.get(key)
          if (existing) {
            if (!existing.lists.includes(tokens.join(' '))) existing.lists.push(tokens.join(' '))
            return
          }
          seen.set(key, {
            group,
            lists: [tokens.join(' ')],
            width,
            property,
            winner,
            displaced: displaced
              .map((entry) => `${entry.rule.selector} (${entry.declaration.value})`)
              .sort(),
            reason,
          })
        }

        if (winner.rule.media.length === 0) {
          // The bare rule won. A media-scoped rule for the same property that it
          // outranks is the variant that lost, and naming it is the whole finding.
          const variants = displaced.filter((entry) => entry.rule.media.length > 0)
          if (variants.length === 0) continue
          record(
            'variant-lost',
            variants.map((entry) => entry.rule.selector).sort().join(','),
          )
          continue
        }

        // The winner is a variant. The defect is a variant that starts applying
        // later losing to the one that starts applying earlier, which is what
        // position inside one shared layer decides once the two builds are
        // concatenated.
        const at = thresholdOf(winner.rule)
        const wider = displaced.filter(
          (entry) => entry.rule.media.length > 0 && (thresholdOf(entry.rule) ?? 0) > (at ?? 0),
        )
        if (wider.length === 0) continue
        record(
          'variant-order',
          wider.map((entry) => entry.rule.selector).sort().join(','),
        )
      }
    }
  }

  for (const [, entry] of seen) {
    const displaced = entry.displaced.join(' and ')
    const verdict =
      entry.group === 'variant-lost'
        ? `the unconditional ${entry.winner.rule.selector} (${entry.winner.declaration.value}), which outranks ${displaced}`
        : `${entry.winner.rule.selector} (${entry.winner.declaration.value}), which applies from ${
            thresholdOf(entry.winner.rule) ?? 0
          }px and outranks ${displaced}`
    findings.push({
      group: entry.group,
      message:
        `at ${entry.width}px, ${entry.lists.length} class list(s) take ${entry.property} from ${verdict}. ` +
        `Restate it in @layer ${SITE_VARIANT_LAYER}: ` +
        entry.lists.map((list) => `"${list}"`).join(', '),
    })
  }

  return { findings, ranks: [...ranks], ruleCount: rules.length, listCount: lists.length }
}
