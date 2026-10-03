/**
 * Reading the stylesheet the package actually ships.
 *
 * **jsdom resolves none of this.** It implements neither `@layer` nor `var()`, so
 * `getComputedStyle` on an element in this repository answers nothing about what
 * is painted, and a test built on it would pass for a reason that has nothing to
 * do with the paint. What is left is the artifact: `dist/styles.css` is a file on
 * disk that the build wrote from the same source the Components are written in,
 * and a question about the cascade over that file has an answer that can be read
 * rather than asserted.
 *
 * **THE PARSER IS HERE, AND `apps/site/test/pack-dot.test.ts` HOLDS ITS OWN.**
 * That file is the reason this module exists, and the two are deliberately not
 * one module: they are two separately published packages, so a helper shared
 * between them would be either a new package or a file inside a published path,
 * which is a larger decision than either fix. What is shared inside
 * `packages/ui/test/` is the other half. `progress-origin.test.tsx` was holding
 * this parser inline, and a second test in this package needed the same four
 * things, so the primitives moved here rather than being written again.
 *
 * What is shared is the shape, and the shape is: parse the sheet into flat rules
 * carrying their layer, their media condition and their position; count
 * specificity; compare layer, then specificity, then position; and assert each of
 * those three primitives against known answers before anything depends on them.
 * That last part is what makes a reimplementation honest, and it is why
 * `sheet-reader.test.tsx` exists.
 *
 * **The limit is here rather than in a comment at the foot of a caller.** This
 * reads the resting cascade of the rules the build emitted. It does no layout, it
 * composites nothing, and it declines to judge a selector shape it cannot
 * recognise rather than guessing, because a guess here reports a cascade the
 * browser does not produce.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ------------------------------------------------------------------ the sheet

export interface Declaration {
  property: string
  value: string
}

export interface Rule {
  /** The `@layer` the rule sits in, or `null` for an unlayered one. */
  layer: string | null
  /** The `@media` condition the rule sits in, or `null` for an unconditional one. */
  media: string | null
  selector: string
  declarations: Declaration[]
  /** Byte offset of the rule's body, which is the position the cascade ties on. */
  offset: number
}

/**
 * Collapse the whitespace a hand-written rule is allowed to carry.
 *
 * The build writes the shipped policy across four lines, so a rule read straight
 * out of the file names `*,\n  ::before,\n  ::after`, and a reader that compared
 * that to the three selectors it means would report a difference that is not one.
 * Collapsing is done with bracket depth and quote state tracked rather than with a
 * regex, because an attribute selector may carry a quoted value with a space in it
 * and `[class="a  b"]` is not `[class="a b"]`.
 */
function collapseSelector(text: string): string {
  let out = ''
  let depth = 0
  let quote: string | null = null
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quote !== null) {
      out += char
      if (char === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      out += char
      continue
    }
    if (char === '[' || char === '(') depth += 1
    else if (char === ']' || char === ')') depth -= 1
    if (/\s/.test(char) && depth === 0) {
      if (out !== '' && !out.endsWith(' ')) out += ' '
      continue
    }
    out += char
  }
  return out.trim()
}

/**
 * Parse the sheet into flat rules carrying their layer, their condition and their
 * position.
 *
 * Two at-rules are descended into and the rest are skipped, and the split is
 * where the two callers' interests differ. `@layer` is descended because layer
 * order is half of the cascade. `@media` is descended because a reduced-motion
 * rule only exists inside one, and a parser that dropped every conditional rule
 * could not see the policy this package ships at all. `@supports`, `@keyframes`,
 * `@font-face` and `@property` are skipped: they either do not hold ordinary
 * declarations or hold ones no cascade comparison here is about.
 *
 * Comments are blanked rather than removed so every offset still names the same
 * place in the text it came from.
 */
export function parseSheet(css: string): {
  rules: Rule[]
  layerRanks: Map<string, number>
} {
  const rules: Rule[] = []
  const layerRanks = new Map<string, number>()
  const rank = (name: string) => {
    if (!layerRanks.has(name)) layerRanks.set(name, layerRanks.size)
  }

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

  const walk = (source: string, layer: string | null, media: string | null, base: number): void => {
    let prelude = ''
    let i = 0
    while (i < source.length) {
      const char = source[i]
      if (char === '{') {
        const head = collapseSelector(prelude)
        prelude = ''
        const end = matchingBrace(source, i)
        if (end === -1) return
        const inner = source.slice(i + 1, end)
        const bodyOffset = base + i + 1
        if (head.startsWith('@layer')) {
          walk(inner, head.slice('@layer'.length).trim(), media, bodyOffset)
        } else if (head.startsWith('@media')) {
          walk(inner, layer, collapseSelector(head.slice('@media'.length)), bodyOffset)
        } else if (head.startsWith('@')) {
          // `@supports`, `@keyframes`, `@font-face`, `@property`: skipped.
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
            rules.push({ layer, media, selector: head, declarations, offset: bodyOffset })
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

  walk(
    css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' ')),
    null,
    null,
    0,
  )
  return { rules, layerRanks }
}

// --------------------------------------------------------------- specificity

export type Specificity = readonly [number, number, number]

export const compareSpecificity = (a: Specificity, b: Specificity): number => {
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
export function splitTopLevel(text: string): string[] {
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
 * Depth-aware, and the space inside `:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`
 * is the reason. Splitting on whitespace cuts that argument in half, and a reader
 * that does it then counts each half as a compound of its own: the two halves of
 * `[dir="rtl"] *` are an attribute selector and a universal selector worth (0,1,0)
 * between them, so the variant scores three classes where it is worth one, and a
 * tie this module is about stops being a tie and is handed to the wrong rule.
 */
export function splitLinks(complex: string): string[] {
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

/**
 * The specificity of one complex selector, as `[ids, classes, types]`.
 *
 * The four rules that decide the selectors this module is asked about:
 *
 *   - `*` contributes NOTHING, which is what keeps a variant's argument cheap and
 *     which is also why the reduced-motion rule in the shipped sheet needs the
 *     layer it sits in rather than the specificity it carries;
 *   - `:where()` contributes nothing at all, and `:is()`, `:not()` and `:has()`
 *     contribute their MOST specific argument;
 *   - a pseudo-class counts as a class and a pseudo-element as a type;
 *   - an attribute selector counts as a class.
 *
 * A class name is read escape-aware, because Tailwind writes `rtl:origin-right` as
 * `.rtl\:origin-right` and a reader that stopped at the backslash counted the
 * `origin-right` after it as a type selector, which would put the variant at
 * (0,1,2) and hand a bare-utility tie to the rule that is supposed to lose it.
 *
 * **A selector LIST is read as its most specific part, not as their sum.** A
 * browser matches each selector in a list separately and compares using the one
 * that matched, so `*, ::before, ::after` is worth (0,0,1) and not (0,0,2), and a
 * reader that summed the parts would score the reduced-motion rule as carrying two
 * pseudo-elements when it carries none for the element being styled. Summing is the
 * wrong answer in both directions: it can only ever overstate a rule's rank, and an
 * overstated rank is a rule that appears to win a comparison it would lose.
 */
export function specificityOf(selector: string): Specificity {
  let best: Specificity = [0, 0, 0]
  for (const part of splitTopLevel(selector)) {
    const value = specificityOfCompound(part)
    if (compareSpecificity(value, best) > 0) best = value
  }
  return best
}

/** The specificity of one complex selector, read left to right. */
function specificityOfCompound(selector: string): Specificity {
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
        while (i < text.length) {
          if (text[i] === '\\') {
            i += 2
            continue
          }
          if (/[\s.[\]():>+~]/.test(text[i])) break
          i += 1
        }
        continue
      }
      if (char === '#') {
        ids += 1
        i += 1
        while (i < text.length && text[i] !== '\\' && !/[\s.[\]():>+~]/.test(text[i])) i += 1
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
            if (compareSpecificity(value, best) > 0) best = value
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
    /*
     * A descendant combinator is a relationship this module does not model, so a
     * compound carrying one is read as the sum of its parts and nothing more.
     * Neither of the two selectors `progress-origin.test.tsx` is about has one, and
     * the sum is the right answer for the ones that do, because a descendant
     * combinator adds no specificity of its own.
     */
    for (const link of splitLinks(part)) readLink(link)
  }
  return [ids, classes, types]
}

/**
 * The class names a selector names, unescaped.
 *
 * Unescaping rather than pattern-matching is the point. A class name is written in
 * CSS with a backslash before every character that is not a word character, so
 * `rtl:origin-right` arrives as `rtl\:origin-right`, and a reader that builds a
 * pattern out of the unescaped name and does not escape the backslash it inserted
 * matches a string the browser never sees.
 */
export function classesOf(selector: string): string[] {
  const found: string[] = []
  for (const part of splitTopLevel(selector)) {
    for (const link of splitLinks(part)) {
      let i = 0
      while (i < link.length) {
        if (link[i] !== '.') {
          i += 1
          continue
        }
        i += 1
        let name = ''
        while (i < link.length) {
          if (link[i] === '\\') {
            name += link[i + 1]
            i += 2
            continue
          }
          if (/[\s.[\]():>+~]/.test(link[i])) break
          name += link[i]
          i += 1
        }
        if (name !== '') found.push(name)
      }
    }
  }
  return found
}

// ---------------------------------------------------------------- the cascade

export interface Candidate {
  rule: Rule
  specificity: Specificity
  layerRank: number
}

/**
 * Layer, then specificity, then position, which is the order a browser resolves
 * normal declarations in.
 *
 * **Unlayered ranks above every layer, and that half is what this package's
 * reduced-motion rule relies on.** The pack blocks are plain imported CSS while
 * the utilities sit in `@layer utilities`, so an unlayered declaration wins a tie
 * it should not need to, and it wins it at `*` where the specificity is the lowest
 * there is. A reader who had layer last would conclude the rule in
 * `styles.css` loses to `.duration-slow`, which is the opposite of what a browser
 * does and the whole reason the policy is written in one unlayered block.
 */
export const beats = (a: Candidate, b: Candidate): boolean => {
  if (a.layerRank !== b.layerRank) return a.layerRank > b.layerRank
  const specificity = compareSpecificity(a.specificity, b.specificity)
  if (specificity !== 0) return specificity > 0
  return a.rule.offset > b.rule.offset
}

export const layerRankOf = (rule: Rule, layerRanks: Map<string, number>): number =>
  rule.layer === null ? Number.POSITIVE_INFINITY : (layerRanks.get(rule.layer) ?? 0)

/** The value a rule gives a property, or `''` when it does not declare one. */
export const valueOf = (rule: Rule, property: string): string =>
  rule.declarations.find((entry) => entry.property === property)?.value ?? ''

// ------------------------------------------------------------- the artifact

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

/**
 * The stylesheet this package publishes, read from `dist/`.
 *
 * `turbo.json` gives `@nanisoft/prism-ui#test` a `dependsOn` on this package's
 * own `build`, so the artifact exists whenever this runs. The read is unguarded on
 * purpose: a missing file is a build that did not run, and a test that quietly
 * skipped would report the cascade as unreadable when it is merely absent.
 */
export const SHIPPED_SHEET: string = readFileSync(path.join(PKG, 'dist', 'styles.css'), 'utf8')

export const shippedSheet = parseSheet(SHIPPED_SHEET)
