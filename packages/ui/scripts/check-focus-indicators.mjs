/**
 * The focus-indicator gate.
 *
 * The defect class this exists for is silent. A Component documents itself as
 * reachable by the keyboard, suppresses the browser outline on the element a
 * keyboard user lands on, and draws its own ring at half alpha. Every token gate
 * still passes, because `packages/tokens/scripts/check-contrast.mjs` measures the
 * `ring` TOKEN and the alpha is applied in the component rather than in the
 * token, so that gate cannot see which rule wins. Every other Component here
 * that draws a focus ring draws it at full strength; the Slider did not, and
 * nothing said so. This gate is the thing that says so.
 *
 * The unit of the rule is a class string on one element, not a file. A component
 * may legitimately suppress the outline on a panel it does not own (a Dialog's
 * content, a Tabs panel) or on a slot the consumer fills (a Tooltip's trigger),
 * so the question is never asked of the module. It is asked of the class string
 * the focusable element actually receives.
 *
 * How the table of focusable components is derived. It comes from the
 * component's own JSDoc, which AGENTS.md names as this repository's
 * documentation source and which the declaration build preserves into the
 * emitted `.d.ts` the corpus reads. A module joins the table when any of its
 * JSDoc blocks makes an explicit claim about keyboard reach or operation: a
 * named key, the Tab order, an arrow-key model, a focus ring, a statement of
 * focusability, or a statement that it renders a natively focusable element.
 * That was chosen over a second hand-written roster of component names because a
 * second list drifts, and this one is read from the same text a consumer is
 * given. `CLAIMS` names every phrasing it accepts, so the derivation is
 * arguable rather than implied.
 *
 * The honest cost of that choice, stated rather than hidden: it depends on a
 * JSDoc phrasing, and a component whose JSDoc stops making the claim drops out
 * of the table silently. Two things stop that being a quiet pass. The run FAILS
 * if the table is empty, and the table, its size, and the claim that put each
 * entry in it are printed on every run, so a shrunken table is a line in the log
 * rather than something to infer from a green result.
 *
 * The exclusion list is declared, not discovered. `EXCLUSIONS` is the whole of
 * it. Each entry carries a reason, the reasons are printed on every run with the
 * slots they resolved to, and a declared entry that resolves to nothing is a
 * finding, because an exclusion that fires on nothing is indistinguishable from
 * a rule that found nothing to say. The key is the `data-slot` a class string
 * sits on and never a JSX element name, so a part that has lost its `data-slot`
 * is judged rather than excused.
 *
 * The honest limit. This reads class strings, not a cascade, so it cannot prove
 * which declaration wins, and it reads no consumer stylesheet. What it proves is
 * that no element in this package which claims to be keyboard operable suppresses
 * its own indicator without declaring a full-strength one.
 *
 * Coverage is asserted rather than assumed. The source root is resolved from
 * this file's own location, never `process.cwd()`, so a run from any directory
 * is the same run. A root that resolves to nothing, or that reads no component,
 * fails the run, and the closing lines state how much was read, classified,
 * tabled, judged and excluded.
 *
 * Run: node packages/ui/scripts/check-focus-indicators.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-focus-indicators'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The package root, from this file's own location. Never `process.cwd()`. */
const PKG = path.join(HERE, '..')
const UI = path.join(PKG, 'src', 'components', 'ui')

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * The utilities that remove the browser's own focus indicator. A component that
 * uses one owns the replacement, and the replacement has to clear 3:1.
 */
const SUPPRESSES = new Set([
  'outline-none',
  'focus:outline-none',
  'focus-visible:outline-none',
  'ring-0',
  'focus:ring-0',
  'focus-visible:ring-0',
])

/** The ring colour at full alpha. `ring-ring/50` is not one of these. */
/*
 * A ring at full strength on the focus-visible state.
 *
 * The colour is any of the ring roles rather than `ring-ring` alone, because a
 * surface with its own ink has its own ring: `ring-sidebar-ring` on a navigation
 * rail is a full-strength indicator, and the earlier version reported it as
 * non-compliant, which would have pushed the `Sidebar` into keeping the browser's
 * outline as well as drawing a ring. Two indicators where one is correct is not
 * worse than one indicator on the wrong surface, and it is worse than the
 * alternative of a gate that says a token-driven ring is not a ring.
 */
const FULL_STRENGTH_RING = /^(?:focus-visible:)?ring-(?:ring|sidebar-ring)$/

/** A ring width that attaches to the focus-visible state. */
const FOCUS_RING_WIDTH = /^focus-visible:ring-(?:\d+(?:\.\d+)?|\[[^\]]+\])$/

/**
 * Every JSDoc phrasing this gate reads as a claim that a module owns a focusable
 * control, named so the derivation can be argued with rather than inferred.
 */
const CLAIMS = [
  ['the keyboard', /\bkeyboard\b/i],
  ['the Tab order', /\bTab\b/],
  ['an arrow-key model', /arrow[- ]key/i],
  ['a named key', /\b(?:Enter|Space|Escape|Home|End)\b/],
  ['a focus ring', /focus ring/i],
  ['focusability', /\bfocus(?:able|ed|s)\b/i],
  ['a native focusable element', /Renders? a native `<(?:button|a|input|textarea|select)>`/],
]

/**
 * The whole exclusion list. A panel, a listbox or menu option, and a slot the
 * consumer fills are not controls this package can ring; everything else that
 * suppresses the outline is a finding.
 */
const EXCLUSIONS = [
  {
    name: 'a composite widget panel',
    match: /^(?:dialog-content|popover-content|select-content|dropdown-menu-(?:sub-)?content|tabs-content)$/,
    reason:
      'the panel itself, not a control: the control that opens it and the controls inside it carry their own ring',
  },
  {
    name: 'a composite widget option',
    match: /(?:-item|-sub-trigger)$/,
    reason:
      'an option in a menu or a listbox: Base UI moves a highlighted state with the arrow keys rather than a DOM focus ring',
  },
  {
    name: 'a slot the consumer fills',
    match: /^tooltip-trigger$/,
    reason:
      'the trigger wraps the control the consumer composed, and that control is what draws the ring; this only removes the outline the wrapper would otherwise show',
  },
]

/** The JSDoc prose of a source file, as one string. */
function jsdocProse(source) {
  const blocks = []
  for (const match of source.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    blocks.push(
      match[1]
        .split('\n')
        .map((line) => line.replace(/^\s*\*?[ \t]?/, '').trim())
        .filter(Boolean)
        .join(' '),
    )
  }
  return blocks.join(' ')
}

/** The index just past the string literal that starts at `i`. */
function skipString(text, i) {
  const quote = text[i]
  let j = i + 1
  while (j < text.length) {
    if (text[j] === '\\') {
      j += 2
      continue
    }
    if (text[j] === quote) return j + 1
    j += 1
  }
  return j
}

/**
 * Every string literal in a span, which is how a class string is read out of
 * source. A template literal is read as one span and its interpolations are not
 * followed; no shipped class string uses one, and a component that starts is
 * judged on the literals it wrote.
 */
function stringLiterals(text) {
  const found = []
  let i = 0
  while (i < text.length) {
    if (text[i] === "'" || text[i] === '"' || text[i] === '`') {
      const end = skipString(text, i)
      found.push(text.slice(i + 1, end - 1))
      i = end
      continue
    }
    i += 1
  }
  return found
}

/** The index just past a balanced expression that starts at `i`. */
function balancedEnd(text, i) {
  let depth = 0
  let j = i
  while (j < text.length) {
    const ch = text[j]
    if (ch === "'" || ch === '"' || ch === '`') {
      j = skipString(text, j)
      continue
    }
    if (ch === '(' || ch === '[' || ch === '{') depth += 1
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (depth === 0) return j
      depth -= 1
    } else if (depth === 0 && (ch === '\n' || ch === ';')) return j
    j += 1
  }
  return j
}

/**
 * Every module-level `const` and the source of its initialiser, so a class
 * string held in a named constant is read from where it is written rather than
 * missed where it is used.
 */
function moduleConsts(source) {
  const consts = new Map()
  const declared = /^const ([A-Za-z_$][\w$]*)(?:\s*:[^=\n]+)?\s*=/gm
  for (const match of source.matchAll(declared)) {
    const start = match.index + match[0].length
    const value = start + (source.slice(start).match(/^\s*/)[0].length)
    consts.set(match[1], source.slice(value, balancedEnd(source, value)))
  }
  return consts
}

/**
 * The classes one `className` prop receives, and the element it sits on. The
 * label is the element's `data-slot` when it declares one and the JSX element
 * name when it does not, and the line is the line the prop is on, so a finding
 * points at a place a maintainer can edit.
 */
function classSites(source) {
  const consts = moduleConsts(source)
  const sites = []

  for (const match of source.matchAll(/className=/g)) {
    const at = match.index
    const next = source[at + match[0].length]

    if (next === '"' || next === "'") {
      const end = skipString(source, at + match[0].length)
      sites.push(makeSite(source, at, stringLiterals(source.slice(at + match[0].length, end - 1))))
      continue
    }

    if (next !== '{') continue
    const open = at + match[0].length
    const close = balancedEnd(source, open + 1)
    const expression = source.slice(open + 1, close - 1)

    const classes = stringLiterals(expression)
    for (const [name, value] of consts) {
      if (!new RegExp(`\\b${name}\\b`).test(expression)) continue
      classes.push(...stringLiterals(value))
    }
    sites.push(makeSite(source, at, classes))
  }

  return sites
}

function makeSite(source, at, classes) {
  const before = source.slice(0, at)
  const slot = [...before.matchAll(/data-slot="([^"]+)"/g)].pop()
  const element = [...before.matchAll(/<([A-Za-z][\w.]*)/g)].pop()
  const slotAt = slot ? slot.index + slot[0].length : -1
  const elementAt = element ? element.index + element[0].length : -1

  // Whichever of the two was written last belongs to this element, so a
  // `data-slot` on the opening tag beats an ancestor element name.
  const slotName = slotAt > elementAt ? slot[1] : null
  return {
    label: slotName ?? element?.[1] ?? '(unlabelled element)',
    slot: slotName,
    line: lineOf(source, at),
    classes: new Set(classes.flatMap((value) => value.split(/\s+/)).filter(Boolean)),
  }
}

/** The utilities in a site that remove the browser's own indicator. */
const suppressionOf = (site) => [...site.classes].filter((name) => SUPPRESSES.has(name)).sort()

/** Whether a site declares the full-strength ring that replaces the outline. */
const ringsAtFullStrength = (site) =>
  [...site.classes].some((name) => FULL_STRENGTH_RING.test(name)) &&
  [...site.classes].some((name) => FOCUS_RING_WIDTH.test(name))

/** The exclusion a slot falls under, or nothing. */
const exclusionFor = (slot) =>
  slot ? EXCLUSIONS.find((rule) => rule.match.test(slot)) : undefined

const errors = []
const table = []
const resolved = new Map(EXCLUSIONS.map((rule) => [rule, []]))
let files = 0
let sitesJudged = 0
let excluded = 0
let nonCompliant = 0

if (!existsSync(UI)) {
  console.error(`error ${NAME}: ${UI} does not exist, so the gate read no Component source`)
  process.exit(1)
}

const names = readdirSync(UI)
  .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
  .sort()

if (names.length === 0) {
  console.error(`error ${NAME}: ${UI} holds no Component source, so the table is empty`)
  process.exit(1)
}

for (const name of names) {
  files += 1
  const file = path.join(UI, name)
  const source = readFileSync(file, 'utf8')

  const prose = jsdocProse(source)
  const claims = CLAIMS.filter(([, pattern]) => pattern.test(prose)).map(([label]) => label)
  if (claims.length === 0) continue

  table.push({ file: rel(file), claims })

  for (const site of classSites(source)) {
    const suppressed = suppressionOf(site)
    if (suppressed.length === 0) continue

    sitesJudged += 1

    // The ring is read before the exclusion, so a slot that is excluded AND rings
    // correctly is reported as compliant rather than quietly excused by the list.
    if (ringsAtFullStrength(site)) continue

    const exclusion = exclusionFor(site.slot)
    if (exclusion) {
      excluded += 1
      resolved.get(exclusion).push(`${site.slot} (${rel(file)}:${site.line})`)
      continue
    }

    nonCompliant += 1
    errors.push(
      `${rel(file)}:${site.line} ${site.label}: suppresses ${suppressed.join(', ')} and ` +
        'declares no full-strength focus-visible ring (a `ring-ring` colour at full alpha ' +
        'alongside a `focus-visible:ring-N` width). The contrast gate measures the `ring` ' +
        'token, not the alpha this class applies, so it reports this compliant.',
    )
  }
}

if (table.length === 0) {
  errors.push(
    'no Component in the table claims to be keyboard operable, so no rule fired on anything. ' +
      'Either the JSDoc that makes the claim was rewritten or the derivation is broken; both ' +
      'are failures rather than a clean run.',
  )
}

for (const rule of EXCLUSIONS) {
  if (resolved.get(rule).length === 0) {
    errors.push(
      `the declared exclusion "${rule.name}" resolved to no class string, so it is a rule that ` +
        'fires on nothing. Remove it or say what it now covers.',
    )
  }
}

const report = errors.length ? console.error : console.log

if (errors.length) {
  for (const error of errors) console.error(`error ${error}`)
  report('')
}

report(
  `focus: ${files} Component source(s) read and classified, ${table.length} of them claim a focusable control`,
)
for (const entry of table) {
  const module = entry.file.replace('src/components/ui/', '').replace(/\.tsx$/, '')
  report(`  . ${module.padEnd(14)} ${entry.claims.join(', ')}`)
}

report('')
report(
  `focus: ${sitesJudged} suppressing class string(s) judged, ${sitesJudged - nonCompliant - excluded} at full strength, ` +
    `${excluded} excluded, ${nonCompliant} non-compliant`,
)
for (const rule of EXCLUSIONS) {
  const hit = resolved.get(rule)
  report(`focus: excluded, ${rule.name}: ${hit.length ? hit.join(', ') : 'nothing'}`)
  report(`          because ${rule.reason}`)
}

if (errors.length) {
  report('')
  report(`focus: ${errors.length} finding(s) across ${table.length} focusable component(s)`)
  process.exit(1)
}

report('')
report('focus: every focusable claim in the table draws its ring at full strength')
