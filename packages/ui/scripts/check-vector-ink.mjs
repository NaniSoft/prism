/**
 * The vector-ink gate: a Component that draws may only draw with the contract.
 *
 * The defect class this exists for is invisible in review and invisible in every
 * other gate. A drawing Component resolves a colour once, at mount, from one
 * element's computed style, and paints it. A scoped `data-pack` boundary is an
 * attribute on an ANCESTOR, so a value resolved below it never moves when a
 * boundary lands above it: the hand re-inks, the pack does not, and the drawing
 * shows the pack's light values on a dark page. Every token gate passes, because
 * the value it would have caught is a legal token value - it is simply the wrong
 * one for the pack in force. The only thing that catches it is a rule that says
 * a drawing may not hold a value at all.
 *
 * So this gate reads the EMITTED token contract, `packages/tokens/dist/light.css`
 * and `dark.css`, and fails a literal colour, a gradient whose stops are not
 * contract references, a `var(--x)` naming a property the contract does not
 * publish, or a paint utility whose suffix is not a contract role. It is scoped to
 * the vector Components on purpose. It is a narrow, loud rule, not a system
 * rule: a page that wants a brand gradient has a business writing one, and a
 * library Component that wants one is a second source of truth.
 *
 * Where it is scoped is declared below, in `SCANNED`, as a list of file names
 * rather than a directory, so adding a drawing Component is a decision a reader
 * can see rather than a pattern that widens by itself.
 *
 * The four rules, and why each is separate rather than one colour regex:
 *
 *   1. a literal colour        a hex, a colour function, or a CSS named colour,
 *                              anywhere in the file. This is the strictest rule
 *                              and the one that cannot be argued with.
 *   2. an unresolved gradient   a `-gradient(` whose stops are not all
 *                              `var(--<contract>)`. A gradient built from
 *                              contract stops is allowed, and is listed on every
 *                              run, because "no gradients" would forbid the one
 *                              a decision asked for.
 *   3. an unpublished property  any `var(--x)` where `x` is not emitted. A
 *                              resolved value and a token reference look the same
 *                              in source and are not the same thing, and this is
 *                              the rule that tells them apart.
 *   4. an unnamed paint         a `fill-`/`stroke-`/`bg-`/`text-`/... class whose
 *                              suffix is neither a contract role nor a declared
 *                              exclusion. This is the rule that catches
 *                              `stroke-red-500`, which rules 1 to 3 cannot see
 *                              because a Tailwind class is a name and not a value.
 *
 * The honest limit, printed on every run. Rules 1 to 3 read text, and a value
 * computed at runtime from a token name assembled in pieces would pass. Rule 4
 * reads class strings and not a cascade, so it can say a class names no role and
 * cannot say which declaration wins. Neither rule reads a consumer stylesheet,
 * and a consumer that writes its own CSS over a drawing is outside the contract
 * this gate holds.
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's
 * own location, a root that resolves to nothing fails the run naming both
 * causes, a contract that reads as empty fails the run, and the closing lines
 * state the files read, the contract size, how many class names and custom
 * properties were classified, and every exclusion with the class strings it
 * resolved to. A declared exclusion that resolves to nothing is a finding, the
 * same rule `check-focus-indicators.mjs` holds its list to, because an exclusion
 * that fires on nothing is indistinguishable from a rule that found nothing.
 *
 * Run: node packages/ui/scripts/check-vector-ink.mjs
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-vector-ink'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const REPO = path.join(HERE, '..', '..', '..')

/**
 * The drawing Components this gate holds to the contract.
 *
 * A file name, not a pattern. A pattern over `src/components/ui` would take the
 * whole Component set with it the moment a Component gained a `<rect>`, and the
 * rule is narrow enough that widening it by accident is the way it would be
 * switched off.
 */
const SCANNED = [
  'chart.tsx',
  'contribution-graph.tsx',
  'diagram.tsx',
  'pack-swatch.tsx',
  'product-mark.tsx',
  'pulse-graph.tsx',
  'pulse-series.tsx',
  'signal-field.tsx',
  'sparkline.tsx',
]

/** The emitted token CSS the contract is read from, in both modes. */
const CONTRACT = [
  path.join(REPO, 'packages', 'tokens', 'dist', 'light.css'),
  path.join(REPO, 'packages', 'tokens', 'dist', 'dark.css'),
]

/** `src/components/ui`, resolved once so a missing Component is a named failure. */
const COMPONENTS = path.join(PKG, 'src', 'components', 'ui')

/**
 * The utility prefixes whose suffix is a colour.
 *
 * `shadow-` is deliberately absent: a shadow is an elevation token and lives in
 * the static theme block rather than in the colour contract, so a rule that read
 * it here would report `shadow-sm` as an unknown paint. Sizing (`size-`), spacing
 * (`p-`) and type (`text-xs` needs an exclusion below) are not colour utilities
 * either, and the exclusions say so with reasons.
 */
const PAINT_PREFIXES = [
  'fill',
  'stroke',
  'bg',
  'text',
  'border',
  'ring',
  'outline',
  'decoration',
  'accent',
  'caret',
]

/**
 * The whole exclusion list, each entry with the reason it is not a colour.
 *
 * A key on a closed list rather than a pattern, so widening what is allowed is a
 * decision to take in the open. Every entry is printed on every run with the
 * class strings it resolved to, and an entry that resolves to nothing is a
 * finding.
 */
const EXCLUSIONS = [
  {
    name: 'no paint',
    match: /^fill-none$/,
    reason:
      "an SVG path with no paint. This is the one absence that has to be named: a shape with no fill and no `fill: none` paints opaque black.",
  },
  {
    name: 'a type-scale step on a name',
    match: /^text-(?:xs|sm|base)$/,
    reason:
      "a step of the authored type scale, set on a word beside a mark. The scale is a `rem` token and lives in the static theme block, not in the colour contract.",
  },
  {
    name: 'a text alignment',
    match: /^text-(?:left|center|right|justify|start|end)$/,
    reason:
      "an alignment, set on a label inside a figure or on a numeric column in a table. The rule reads the `text-` prefix and cannot tell an alignment from a colour, and excluding the attribute would have exempted `text-red-500`; so this is a closed set of the six words CSS defines, matched by shape, which is the same treatment `text-xs` gets for the type scale. `chart.tsx` and `chart-frame.tsx` both set one, in a donut centre and in a numeric table cell.",
  },
  {
    name: 'a border edge or width',
    match: /^border-[xystblrse](?:-[0-9]+)?$/,
    reason:
      "which edges a border is on, or how wide it is, on an element that already carries its colour from `border-border`. The rule reads the `border-` prefix and reads the direction as a colour role, which it is not: `border-e` narrows a border to the inline-end edge and `border-e-0` removes it, and neither names a colour. It is a closed set of the eight direction words plus an optional numeric width, matched by shape, so `border-red-500` is still a finding. `pack-swatch.tsx` sets one to separate the two halves of a swatch with a rule that inherits the surface's own border colour.",
  },
]

/** A hex literal in any of the four CSS lengths. */
const HEX = /#[0-9a-fA-F]{3,8}\b/g

/** Every CSS colour function, so a colour cannot be spelled as a call instead. */
const COLOUR_FUNCTION =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|device-cmyk|color-contrast)\s*\(/g

/**
 * The CSS named colours a drawing Component could reach for.
 *
 * Closed, and short on purpose: this is not a re-implementation of the CSS colour
 * list, it is the set of words that appear in a design file and mean a colour. A
 * word that is missing from it is a gap this gate states rather than hides.
 */
const NAMED_COLOURS = [
  'aqua',
  'black',
  'blue',
  'brown',
  'cyan',
  'fuchsia',
  'gold',
  'gray',
  'green',
  'grey',
  'indigo',
  'lime',
  'magenta',
  'maroon',
  'navy',
  'olive',
  'orange',
  'pink',
  'purple',
  'red',
  'salmon',
  'silver',
  'teal',
  'tomato',
  'transparent',
  'turquoise',
  'violet',
  'white',
  'yellow',
]

const NAMED = new RegExp(`\\b(?:${NAMED_COLOURS.join('|')})\\b`, 'g')

/** A gradient, in any of its three geometries. */
const GRADIENT = /(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/g

/** A custom property read. */
const VAR = /var\(\s*(--[a-zA-Z0-9-]+)/g

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

const rel = (file) => path.relative(REPO, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * Blanks comments without moving a single line, so a line number in a finding
 * still points at the line a reader has to edit.
 *
 * Not optional politeness. A text scan reads prose, and both of these files
 * document the very tokens and shapes they are forbidden from using: a JSDoc
 * block that says `stroke="var(--foreground)"` in order to explain why it is
 * wrong is a description, not a defect. `check-pack-boundary.mjs` masks for the
 * same reason and for the same reason it keeps the line count intact.
 */
function maskComments(source) {
  const out = source.split('')
  let i = 0
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k += 1) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
    }
  }

  while (i < source.length) {
    const next = source.indexOf('/*', i)
    const line = source.indexOf('//', i)
    if (next === -1 && line === -1) break
    if (next !== -1 && (line === -1 || next < line)) {
      const close = source.indexOf('*/', next + 2)
      const end = close === -1 ? source.length : close + 2
      blank(next, end)
      i = end
      continue
    }
    if (isInString(source, line)) {
      i = line + 2
      continue
    }
    let end = source.indexOf('\n', line)
    if (end === -1) end = source.length
    blank(line, end)
    i = end
  }
  return out.join('')
}

/** Whether `index` sits inside a single or double quoted string. */
function isInString(source, index) {
  let quote = null
  for (let k = index - 1; k >= 0 && k > index - 4000; k -= 1) {
    const ch = source[k]
    if (ch === '\n') return false
    if (quote === null && (ch === '"' || ch === "'")) quote = ch
    else if (ch === quote) quote = null
  }
  return quote !== null
}

/** Every custom property an emitted mode block declares, `--name` included. */
function propertiesIn(css) {
  const body = css.slice(css.indexOf('{') + 1)
  return [...body.matchAll(/^\s*(--[a-zA-Z0-9-]+):/gm)].map((match) => match[1])
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const findings = []
const resolved = new Map(EXCLUSIONS.map((rule) => [rule, []]))
const gradients = []
let filesRead = 0
let classNames = 0
let properties = 0

// Roots first: a gate that read nothing must fail rather than report a clean
// contract, and a Component that is not on disk must be a named failure.
const missing = SCANNED.filter((name) => !existsSync(path.join(COMPONENTS, name)))
if (missing.length > 0) {
  console.error(
    `\n${NAME}: ${missing.length} of ${SCANNED.length} configured Components do not resolve: ` +
      missing.map((name) => `"src/components/ui/${name}"`).join(', ') +
      '\n  Two causes, and this run cannot tell them apart:' +
      '\n  (1) the gate was run from the wrong working directory, or the script being run is' +
      '\n      not this repository\'s copy - run it from the repository root;' +
      '\n  (2) the Component was renamed or removed and SCANNED in this gate was not updated,' +
      '\n      so the rule stopped reading it and would report a clean contract while reading less.' +
      '\n  A gate that read nothing and reported zero findings is the failure this replaces, so an' +
      '\n  unresolved root fails the run rather than emptying it.',
  )
  process.exit(1)
}

const absent = CONTRACT.filter((file) => !existsSync(file))
if (absent.length > 0) {
  console.error(
    `\n${NAME}: the emitted token contract is missing ${absent.map(rel).join(', ')}, so there is no` +
      '\n  set of published names for a drawing to be measured against and every judgement below' +
      '\n  would be a guess. Run `pnpm --filter @nanisoft/prism-tokens build` first.',
  )
  process.exit(1)
}

const contract = new Set()
for (const file of CONTRACT) {
  for (const property of propertiesIn(readFileSync(file, 'utf8'))) contract.add(property)
}
if (contract.size === 0) {
  console.error(
    `\n${NAME}: the emitted token CSS declares no custom property, so the contract this gate measures` +
      '\n  against is empty and a `var(--anything)` would pass. That is a pass having read nothing.',
  )
  process.exit(1)
}

/** The contract names without the `--`, which is what a Tailwind class suffix is. */
const roles = new Set([...contract].map((property) => property.slice(2)))

/**
 * A class suffix split into its role and its alpha modifier.
 *
 * `fill-brand-ink/45` is the `brand-ink` role at 45% and nothing else, and a
 * role inside a shape that also holds an arbitrary value is left whole so that
 * the arbitrary-value branch still sees it: splitting on every `/` would turn
 * `bg-[color:var(--x)]/50` into a role this gate cannot judge.
 */
function splitAlpha(suffix) {
  const at = suffix.indexOf('/')
  if (at === -1) return [suffix, null]
  return [suffix.slice(0, at), suffix.slice(at + 1)]
}

for (const name of SCANNED) {
  const file = path.join(COMPONENTS, name)
  const source = maskComments(readFileSync(file, 'utf8'))
  filesRead += 1
  const shown = rel(file)

  /* Rule 1: a literal colour, anywhere. */
  for (const match of source.matchAll(HEX)) {
    findings.push(
      `${shown}:${lineOf(source, match.index)}  [literal-colour]  ${match[0]} is a resolved colour.` +
        ' A drawing that holds a value does not move when a pack boundary lands above it, which is the' +
        ' defect this gate exists for. Name the semantic token instead.',
    )
  }
  for (const match of source.matchAll(COLOUR_FUNCTION)) {
    findings.push(
      `${shown}:${lineOf(source, match.index)}  [literal-colour]  ${match[0]} computes a colour from` +
        ' parts. Name the semantic token.',
    )
  }
  for (const match of source.matchAll(NAMED)) {
    findings.push(
      `${shown}:${lineOf(source, match.index)}  [literal-colour]  "${match[0]}" is a CSS named colour.` +
        ' Name the semantic token.',
    )
  }

  /* Rule 2: a gradient whose stops are not all contract references. */
  for (const match of source.matchAll(GRADIENT)) {
    // Take the argument list, so the stops of one gradient are judged with that
    // gradient rather than with the next one on the line.
    let depth = 0
    let end = match.index + match[0].length
    for (let k = match.index + match[0].length - 1; k < source.length; k += 1) {
      if (source[k] === '(') depth += 1
      else if (source[k] === ')') {
        depth -= 1
        if (depth === 0) {
          end = k + 1
          break
        }
      }
    }
    const body = source.slice(match.index, end)
    const stops = [...body.matchAll(VAR)].map((stop) => stop[1])
    const foreign = stops.filter((stop) => !contract.has(stop))
    gradients.push({ file: shown, line: lineOf(source, match.index), stops: stops.length })
    if (stops.length === 0 || foreign.length > 0) {
      findings.push(
        `${shown}:${lineOf(source, match.index)}  [unresolved-gradient]  this gradient has ${stops.length}` +
          ` contract stop(s)${foreign.length > 0 ? ` and names ${foreign.join(', ')}, which the contract does not publish` : ' and names no token at all'}.` +
          ' A gradient of semantic stops is allowed; a gradient of anything else resolves a colour and' +
          ' stops moving when the pack does.',
      )
    }
  }

  /* Rule 3: a custom property the contract does not publish. */
  for (const match of source.matchAll(VAR)) {
    properties += 1
    if (contract.has(match[1])) continue
    findings.push(
      `${shown}:${lineOf(source, match.index)}  [unpublished-property]  var(${match[1]}) is not a name` +
        ' the emitted token contract publishes, so a browser resolves it to nothing and the drawing' +
        ' loses that ink rather than inheriting the pack.',
    )
  }

  /* Rule 4: a paint utility that names no contract role. */
  const classes = source.match(/[A-Za-z0-9_[\]#().,%/-]+/g) ?? []
  for (const raw of classes) {
    // A class inside an arbitrary value is a fragment, not a utility: judge the
    // value as text by rules 1 to 3 rather than by the name of a fragment.
    if (raw.includes('[') || raw.includes(']')) continue
    if (!PAINT_PREFIXES.some((prefix) => raw.startsWith(`${prefix}-`))) continue
    classNames += 1
    /*
     * The alpha modifier is split off before the role is read, and the reason is
     * a line in DESIGN.md rather than a convenience: "Opacity and alpha
     * modifiers. The colour is a token; the multiplier is Tailwind's." So
     * `stroke-muted-foreground/50` names the `muted-foreground` role and a
     * half-transparent version of it, and the role is the part this gate is
     * about. Judging the whole suffix meant `fill-brand-ink/45` reported as a
     * paint naming no role, which is the opposite of true: it names a role and
     * asks the browser for less of it.
     *
     * A modifier that is not a plain number still fails below, because
     * `fill-brand-ink/[0.4]` is caught by the arbitrary-value branch and a
     * modifier spelled as a variable is a value the drawing is holding, which is
     * what this gate is for.
     */
    const [role, alpha] = splitAlpha(raw.slice(raw.indexOf('-') + 1))
    if (alpha !== null && !/^\d+(?:\.\d+)?$/.test(alpha)) {
      findings.push(
        `${shown}  [unnamed-paint]  "${raw}" carries an alpha modifier of "${alpha}", which is not a` +
          ' plain percentage. The colour is a token and the multiplier is Tailwind\'s, so a multiplier spelled as' +
          ' anything else is a value the drawing holds rather than a token it inherits, and a resolved value does' +
          ' not move when a pack boundary lands above it.',
      )
      continue
    }
    if (roles.has(role)) continue
    if (/^(?:\d+(?:\.\d+)?|\[[^\]]*\])$/.test(role)) continue
    const exclusion = EXCLUSIONS.find((rule) => rule.match.test(raw))
    if (exclusion) {
      resolved.get(exclusion).push(`${raw} (${shown})`)
      continue
    }
    findings.push(
      `${shown}  [unnamed-paint]  "${raw}" is a paint utility whose colour is not a contract role.` +
        ' Every fill and stroke in a drawing is a semantic utility so that a scoped pack boundary restyles' +
        ' it through the cascade. If this one is genuinely not a colour, add it to EXCLUSIONS in this gate' +
        ' with the reason.',
    )
  }
}

for (const rule of EXCLUSIONS) {
  if (resolved.get(rule).length === 0) {
    findings.push(
      `  [unnamed-paint]  the declared exclusion "${rule.name}" resolved to no class string, so it is a` +
        ' rule that fires on nothing. Remove it or say what it now covers.',
    )
  }
}

for (const finding of findings) console.error(`error ${finding}`)

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${filesRead} of ${SCANNED.length} Component(s) read`,
)
console.log(
  `${NAME}: contract read from ${CONTRACT.length} emitted mode file(s): ${contract.size} custom` +
    ` propert(ies), ${roles.size} role(s); ${classNames} paint class name(s) and ${properties}` +
    ' custom-property read(s) classified',
)
for (const gradient of gradients) {
  console.log(
    `${NAME}: gradient at ${gradient.file}:${gradient.line} read, ${gradient.stops} contract stop(s)`,
  )
}
for (const rule of EXCLUSIONS) {
  const hit = resolved.get(rule)
  console.log(`${NAME}: excluded, ${rule.name}: ${hit.length ? hit.join(', ') : 'nothing'}`)
  console.log(`          because ${rule.reason}`)
}
console.log(
  `${NAME}: the scanned set is declared, not discovered: ${SCANNED.map((name) => `src/components/ui/${name}`).join(', ')}`,
)
console.log(
  `${NAME}: rules 1 to 3 read text and rule 4 reads class strings. Neither reads a cascade, and a` +
    ' colour assembled at runtime from a token name would pass rules 1 to 3.',
)

if (findings.length > 0) {
  console.error(
    `\nA drawing holds no colour of its own. A canvas reads one element's computed style while the pack is\n` +
      'an attribute on an ancestor, so a scoped boundary hands it the wrong pack values and nothing in the\n' +
      'rendered result says why. Name the semantic token and let the cascade carry it.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every stroke and fill in the scanned set names the emitted contract, so a scoped pack\n` +
    '  boundary restyles them all.',
)
