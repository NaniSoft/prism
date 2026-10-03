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
 * **The table reports and does not filter.** It used to do both, and the half
 * that filtered was a hole the widening made expensive to leave. A module that
 * made no claim in its JSDoc was skipped before its class strings were read,
 * which is a defensible economy when the scope is one directory of primitives
 * and is not one when the scope is 400 files: 82 of the 132 Components make the
 * claim and 35 of the 268 outside them do, so two thirds of the widened tree was
 * read and never judged, and the "read" on the report was a claim about files
 * opened rather than about rules applied. The cost was measured rather than
 * argued. With the filter in place this gate judges 107 suppressing class
 * strings; with it removed, 121. The fourteen it was not looking at are real
 * class strings on real controls in Blocks, Pages and `live`, and a violation
 * planted in one of them and removed again is judged when the filter is off and
 * passed when it is on, which is the whole of what a pre-filter buys. So the
 * filter is gone and every class string in the scope is judged whether or not
 * its module claims anything. The table is still derived and still printed,
 * because the claim a module makes is a fact a maintainer wants to see, and the
 * run still FAILS if the table empties: that derivation is now a reported fact
 * rather than a load-bearing one, and a broken one is still a broken one.
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
 * that no element in this package suppresses its own indicator without declaring
 * a full-strength one.
 *
 * **Scope is the library's own shipped source, and the line is drawn at the
 * package boundary.** The rule reads `components/`, `blocks/`, `pages/`, `live/`
 * and `provider/` under `src/`, recursively, which is 400 source files. It does
 * not read `apps/site`: that is a different package with a different `check`
 * chain, and a gate that reaches across a package boundary is making a decision
 * about another repository's source that the maintainer of that package has not
 * made. The old scope was `components/ui/*.tsx` and nothing else, which read 132
 * of the 400 and none of the 244 Block files, none of the 18 Pages, neither `live`
 * surface and no provider. Those are not quiet files: a Block is where a shipped
 * screen composes its own controls, and the composition is exactly where a
 * suppression arrives from a slot rather than from the primitive that owns the
 * rule, so the half of the package that draws the most controls was the half
 * nothing read. `ROOTS` is the whole of the scope and every entry is asserted to
 * exist and to hold a file, so widening it is a one-line change and a root that
 * is renamed cannot turn the gate into a clean run by disappearing.
 *
 * Coverage is asserted rather than assumed. The source root is resolved from
 * this file's own location, never `process.cwd()`, so a run from any directory
 * is the same run. A root that resolves to nothing, or that reads no file, fails
 * the run, and the closing lines state how much was read per root, how many
 * modules made the keyboard claim, and how many class strings were judged,
 * excluded and found.
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
const SRC = path.join(PKG, 'src')

/**
 * Every directory the rule reads, in the order the report names them.
 *
 * These are the five trees that carry a focusable element a consumer composes:
 * Components, Blocks, Pages, `live` and the provider. `lib` and `theming` are
 * absent because neither draws a control, which is a fact rather than a
 * convenience: a new tree of drawn surfaces is one line here, and a tree that
 * stopped existing is a failed assertion rather than a silent drop.
 */
const ROOTS = ['components', 'blocks', 'pages', 'live', 'provider']

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * How a file names itself in the report: its path under `src/`, without the
 * extension and without a barrel's own name.
 *
 * The path rather than the basename because `data-table.tsx` is not a module a
 * maintainer can find. `data-table-01/data-table` is, and the same shape works
 * for a Page and for a Component with no directory at all.
 */
const labelOf = (file) =>
  rel(file).replace(/^src\//, '').replace(/\.tsx$/, '').replace(/\/index$/, '')

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
 * The whole exclusion list. A panel, a menu or listbox option, and a slot the
 * consumer fills are not controls that carry a ring; everything else that
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
    /*
     * A menu or listbox option, named slot by slot.
     *
     * This was `/(?:-item|-sub-trigger)$/`, and the suffix is the reason it had to
     * be rewritten rather than kept. A suffix match is not a statement about menu
     * options, it is a statement about spelling: over the 244 Block files it
     * swallowed `radio-group-item`, `toggle-group-item`, `accordion-item`,
     * `breadcrumb-item`, `tree-item`, `pagination-item`, `command-palette-item`,
     * `navigation-menu-item`, `shortlist-01-item`, `team-item` and about thirty
     * more, every one of which is an ordinary focusable control that is either
     * reached by Tab or reached by an arrow key the reader can see. A control that
     * suppresses its own indicator must never be excused because its name happens
     * to end in a word, so the list is spelled out and a slot added to it has to be
     * added by a hand that says which menu it belongs to.
     *
     * The reason is also rewritten, because the old one was half wrong. It said
     * Base UI moves a highlighted state "rather than a DOM focus ring", which read
     * as a claim that these elements take no focus at all. They do: Base UI
     * focuses the option as the arrow keys move, and `outline-none` is real, so
     * this slot is suppressing a real indicator. What replaces it is the point:
     * `ITEM` draws `focus:bg-accent` and `data-[highlighted]:bg-accent`, so the
     * option states its indicator as a fill on the two states the platform and
     * this package both put it in, and WCAG 2.4.7 is answered by a visible change
     * rather than by a ring. This gate asks a narrower question than 2.4.7 does,
     * which is why the answer is an exclusion rather than a second rule: the
     * narrow question is whether a replacement ring is drawn at full alpha, and a
     * control that answers with a fill has no ring to draw at any alpha.
     */
    name: 'a menu or listbox option',
    match: new RegExp(
      `^(?:${[
        'context-menu-(?:item|link-item|sub-trigger)',
        'dropdown-menu-(?:item|checkbox-item|radio-item|sub-trigger)',
        'menubar-(?:item|link-item|checkbox-item|sub-trigger)',
        'select-item',
      ].join('|')})$`,
    ),
    reason:
      'an option in a menu or a listbox: it declares its indicator as a fill on `focus:` and `data-[highlighted:]` rather than as a ring, so there is no ring for this rule to hold at full strength',
  },
  {
    name: 'a slot the consumer fills',
    match: /^tooltip-trigger$/,
    reason:
      'the trigger wraps the control the consumer composed, and that control is what draws the ring; this only removes the outline the wrapper would otherwise show',
  },
]

/**
 * Every `.tsx` under a directory, deepest last, skipping test files.
 *
 * Recursive because the tree it has to read is nested: a Block's source is
 * `blocks/<slug>/<slug>.tsx` and a Page's is `pages/<slug>/<slug>.tsx`, so a
 * non-recursive read of `blocks/` would have read nothing at all. Test files are
 * skipped because a spec asserts about a component rather than drawing one, and a
 * fixture string in a spec is not a class string a consumer ever receives.
 */
function sourcesUnder(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...sourcesUnder(full))
      continue
    }
    if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) found.push(full)
  }
  return found.sort()
}

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

/**
 * The index just past the comment that starts at `i`, or `i` when there is none.
 *
 * A `className` expression in this package is written by a hand and carries the
 * reasoning for the classes it holds, which means a block comment can sit between
 * two arguments, and an apostrophe in that comment is the ordinary way to write a
 * sentence here: `Base UI's own box` is how this repository talks. A scanner that
 * reads `'` as a string opener reads the rest of the comment as a string, so it
 * consumes the class string that follows as code and the site is judged on the
 * fragment in front of the comment.
 *
 * That is not a hypothetical. The first time a comment was put inside a `cn()` call
 * in `checkbox.tsx`, `dialog.tsx` and `slider.tsx`, this gate reported all three as
 * suppressing their own indicator with no replacement, which is the finding this
 * file exists to raise and which none of the three had earned: each of them declares
 * `focus-visible:ring-ring` with `focus-visible:ring-[3px]`, on a line the scanner
 * never reached. A gate that cannot read the package's own comments is not judging
 * the package, so comments are skipped here rather than banned from the source. The
 * two callers that read raw text, `stringLiterals` and `balancedEnd`, both ask this
 * before they ask about a quote, and a `//` line comment is handled for the same
 * reason a `/* *\/` one is.
 */
function skipComment(text, i) {
  if (text[i] === '/' && text[i + 1] === '*') {
    const end = text.indexOf('*/', i + 2)
    return end === -1 ? text.length : end + 2
  }
  if (text[i] === '/' && text[i + 1] === '/') {
    const end = text.indexOf('\n', i + 2)
    return end === -1 ? text.length : end
  }
  return i
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
 * judged on the literals it wrote. Comments are stepped over first, for the reason
 * `skipComment` states.
 */
function stringLiterals(text) {
  const found = []
  let i = 0
  while (i < text.length) {
    const comment = skipComment(text, i)
    if (comment !== i) {
      i = comment
      continue
    }
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

/**
 * The index just past a balanced expression that starts at `i`.
 *
 * A newline is a terminator only when the expression has not opened anything. The
 * shape this has to read is
 *
 * ```tsx
 * className={cn(
 *   'border-border rounded-md',
 *   condition && 'p-2',
 * )}
 * ```
 *
 * and a newline at depth zero in that expression is a line break rather than the
 * end of it. Treating every newline as the end meant the commonest shape in the
 * package read as an empty class string: the slice stopped at the newline directly
 * after the brace, no class was read, no suppression was found, and the site was
 * skipped before it was ever judged. The gate was reading a minority of the class
 * strings in the repository it exists to judge and printing a clean run for it.
 *
 * A comment is stepped over for the reason `skipComment` states, and it matters
 * here as well as in `stringLiterals`: a block comment between two arguments
 * contains an apostrophe far more often than it contains a bracket, and one
 * unterminated string hides every class after it from the scanner that walks this
 * span looking for where the expression ends.
 */
function balancedEnd(text, i) {
  let depth = 0
  let j = i
  while (j < text.length) {
    const comment = skipComment(text, j)
    if (comment !== j) {
      j = comment
      continue
    }
    const ch = text[j]
    if (ch === "'" || ch === '"' || ch === '`') {
      j = skipString(text, j)
      continue
    }
    if (ch === '(' || ch === '[' || ch === '{') depth += 1
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (depth === 0) return j
      depth -= 1
    } else if (depth === 0 && ch === ';') return j
    j += 1
  }
  return j
}

/**
 * The index just past the bracket that closes the one at `i`.
 *
 * `balancedEnd` is the wrong function for this and using it was a second quiet
 * defect in the same place. `balancedEnd` is written to be called one character
 * after an opening brace, so that the brace is the terminator it returns; called on
 * the brace itself, that brace raises the depth and the walk carries on past the
 * object it opened into everything after it. The objects this file reads are the
 * variant maps, and `VIEWPORT` in `dialog.tsx` therefore arrived holding the rest
 * of the module: the close button's `focus-visible:ring-ring`, every later
 * `data-slot`, and the string `Close` from a default parameter. A panel then read as
 * carrying a full-strength ring it does not carry, which is the one thing this gate
 * is about, and it read as compliant because the ring was real even though the class
 * string it was read from was not.
 */
function closeOfBracket(text, i) {
  let depth = 0
  let j = i
  while (j < text.length) {
    const comment = skipComment(text, j)
    if (comment !== j) {
      j = comment
      continue
    }
    const ch = text[j]
    if (ch === "'" || ch === '"' || ch === '`') {
      j = skipString(text, j)
      continue
    }
    if (ch === '(' || ch === '[' || ch === '{') depth += 1
    else if (ch === ')' || ch === ']' || ch === '}') {
      depth -= 1
      if (depth === 0) return j + 1
    }
    j += 1
  }
  return text.length
}

/**
 * The index just past the initialiser of a module-level `const` that starts at `i`.
 *
 * This is not `balancedEnd`, and using that function here was a quiet defect worth
 * more than the two bugs this file has already recorded. A class constant is almost
 * always a bare string and `balancedEnd` stops only at a `;` at depth zero, which a
 * semicolon-free `const X = '...'` never has, so the slice ran to the end of the
 * file. Every `className` expression that named the constant then collected every
 * string literal from that point to the end of the module, and a menu item read as
 * compliant on a ring belonging to some component further down the file.
 *
 * Three shapes, read separately because they end in three different ways: a bare
 * string ends at its closing quote, a bracketed literal or a call ends at the
 * bracket that closes it, and anything else ends at the first `;`, `,` or line break
 * that cannot continue the expression.
 */
function initializerEnd(text, i) {
  const open = text[i]
  if (open === "'" || open === '"' || open === '`') return skipString(text, i)
  if (open === '(' || open === '[' || open === '{') return closeOfBracket(text, i)

  let j = i
  while (j < text.length) {
    const comment = skipComment(text, j)
    if (comment !== j) {
      j = comment
      continue
    }
    const ch = text[j]
    if (ch === "'" || ch === '"' || ch === '`') {
      j = skipString(text, j)
      continue
    }
    if (ch === '(') return closeOfBracket(text, j)
    if (ch === '[' || ch === '{') {
      j = closeOfBracket(text, j)
      continue
    }
    if (ch === ';' || ch === ',') return j
    if (ch === '\n') {
      // A newline ends the initialiser only when what follows cannot continue it, so
      // a call whose arguments are one per line is read whole.
      const next = j + (text.slice(j).match(/^\s*/)[0].length)
      if (next < text.length && !/[,.[({=]/.test(text[next])) return j
    }
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
    consts.set(match[1], source.slice(value, initializerEnd(source, value)))
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
      // `end` is already one past the closing quote, and the slice deliberately
      // starts ON the opening quote so `stringLiterals` reads the literal rather
      // than the characters around it. Ending the slice at `end - 1` therefore
      // dropped the last character of the class string, which is how
      // `outline-none` was read as `outline-non` and `focus-visible:ring-[3px]` as
      // `focus-visible:ring-[3p]`: the gate saw neither the suppression it exists
      // to catch nor the ring that replaces it. It reported a field that
      // suppressed its own indicator and drew no replacement as compliant, and it
      // reported a field that drew a correct ring as non-compliant. Both halves of
      // this gate were decided by a slice bound.
      const end = skipString(source, at + match[0].length)
      sites.push(makeSite(source, at, stringLiterals(source.slice(at + match[0].length, end))))
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
const perRoot = []
let files = 0
let sitesJudged = 0
let excluded = 0
let nonCompliant = 0

// The scope is asserted root by root rather than as one directory. A single
// `existsSync` over `src` would pass on a tree that had lost its Blocks, which is
// the failure the widening exists to prevent: the gate going green on a narrower
// read than it printed last time. So every declared root must be a directory, must
// hold at least one source file, and the count of each is printed on every run.
for (const root of ROOTS) {
  const dir = path.join(SRC, root)
  if (!existsSync(dir)) {
    console.error(`error ${NAME}: ${rel(dir)} is not a directory, so the gate read no ${root} source`)
    process.exit(1)
  }

  const found = sourcesUnder(dir)
  if (found.length === 0) {
    console.error(`error ${NAME}: ${rel(dir)} holds no source file, so the ${root} side of the scope is empty`)
    process.exit(1)
  }

  files += found.length
  perRoot.push([root, found.length])
}

for (const root of ROOTS) {
  for (const file of sourcesUnder(path.join(SRC, root))) {
    const source = readFileSync(file, 'utf8')

    const prose = jsdocProse(source)
    const claims = CLAIMS.filter(([, pattern]) => pattern.test(prose)).map(([label]) => label)
    if (claims.length > 0) table.push({ file: rel(file), label: labelOf(file), claims })

    // Judged whether or not the module joined the table. See the header: the table
    // reports a claim and no longer decides what is read.
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
}

if (table.length === 0) {
  errors.push(
    'no source in the table claims to be keyboard operable, so the claim derivation has read ' +
      'nothing across the whole scope. Either the JSDoc that makes the claim was rewritten or ' +
      'the derivation is broken; both are failures rather than a clean run. Note that the ' +
      'judgement below no longer depends on this table, so a run can be clean while this is ' +
      'wrong, which is why it is still a failure.',
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
  `focus: ${files} source file(s) read and classified across ${ROOTS.length} roots ` +
    `(${perRoot.map(([root, count]) => `${root} ${count}`).join(', ')}), ` +
    `${table.length} of them claim a focusable control`,
)
const widest = Math.max(24, ...table.map((entry) => entry.label.length))
for (const entry of table) {
  report(`  . ${entry.label.padEnd(widest)} ${entry.claims.join(', ')}`)
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
  report(`focus: ${errors.length} finding(s) across ${files} source file(s) in scope`)
  process.exit(1)
}

report('')
report('focus: every suppressing class string in the scope draws its ring at full strength')
