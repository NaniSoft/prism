/**
 * A Block renders a control that can be acted on, or it renders a slot, and the
 * failure names the file, the line and what the control was missing.
 *
 * The claim this holds. **A Block never renders a control that cannot do
 * anything.** A Block ships no behaviour, so it cannot own an event handler: a
 * Block is a server Component unless it says `'use client'`, and a server
 * Component cannot be given an `onClick` at all. A `<button>` a Block renders
 * with nothing attached to it is therefore not a control in any sense a reader
 * can act on. It is focusable, it is announced as a button, and activating it
 * does nothing. That is not a subtle defect: it is the one a reader meets first,
 * because the buttons a Block renders from a declared `actions` or `cta` prop
 * are the primary call to action of the section.
 *
 * The hole this closes. Nothing checked it, and four Blocks shipped it. `Hero01`,
 * `Hero02` and `Hero03` each declared an action union whose `href`-less arm
 * rendered a bare `Button`, and each one's own JSDoc called the button "inert by
 * design" and defended that as a Block shipping no behaviour, which is true and
 * is not an answer: a Block that cannot make a control work should not render a
 * control at all. Every one of those compiled, type-checked, passed the token
 * gates, the surface gate, the focus gate, the catalogue gate and the corpus
 * join, because every one of those asks whether something is right and none of
 * them asks whether a control a reader can focus can be activated. Two more
 * shipped a worse shape with no `href` prop to check at all: `PageHeader01`
 * rendered every declared action as a `Button`, and `Pricing01` rendered each
 * plan's required `cta` string as a `Button`.
 *
 * The repository already had the answer four times and wrote it down each time:
 * `Cta01`'s `Cta01Action` requires `href` and has no dead arm; `cta-link.tsx`'s
 * JSDoc names the dead end by name; `hero-01`'s `HeroSlotAction` is the caller's
 * own control placed in the row; and `check-block-imports.mjs` records that "a
 * `ReactNode` slot is allowed, because a slot is how a consumer injects an
 * interactive child without the Block owning any state." What was missing is the
 * failure message, so that the next Block written here meets the rule by tripping
 * it rather than by reading a JSDoc in another Block.
 *
 * ## The hole this widening closes, and why two Components were missing
 *
 * The rule above is about `Button` and `CtaLink`, and those two are the shapes
 * whose dead form shipped. The row action list was not caught, and it was not
 * caught because **this gate did not classify `DropdownMenuItem`.**
 * `DataTable01` takes `rowActions`, a list of action objects whose `onSelect` is
 * optional, and renders each entry as a menu row. So a caller who passes a label
 * and no handler gets a row that is in the menu's keyboard order, is announced
 * as a menu item, and activates to nothing, and every gate in this repository was
 * green while it shipped. The classification was the whole defect: a gate that
 * cannot see a Component cannot fail on it, and the tree being clean was the
 * absence of a check rather than the presence of a correct one.
 *
 * Two Components are added, and each states what makes its control act and why a
 * Block cannot make it act on its own.
 *
 * - **`DropdownMenuItem`.** It acts when it carries its own selection handler,
 *   which for this Component is `onClick`, or when it is written as the `render`
 *   element the Component already takes and that element carries a destination.
 *   A Block cannot make either one arrive on its own: it ships no behaviour, so
 *   it owns no command to select with, and the menu's open state, typeahead,
 *   arrow keys and Escape handling all belong to `DropdownMenu`, which is a
 *   Component and not a Block's. So a menu row a Block renders is either the
 *   caller's own handler or the caller's own anchor, and a third thing is a row
 *   that only looks like it does something. The `render` arm is what the
 *   repository already settled: `blocks/site-navbar/sites-menu.tsx` writes
 *   `render={<a … />}` because a focusable item wrapping a link is two tab stops
 *   for one row, which `check-nested-controls.mjs` holds.
 * - **`Switch`.** It acts when it carries the change handler it is meaningless
 *   without, `onCheckedChange`. There is no destination arm and no form arm worth
 *   naming: a switch does not navigate, and the hidden input it renders submits
 *   with a form rather than acting on the reader's own. A Block cannot supply the
 *   handler, because the state a switch changes is the consumer's setting and a
 *   Block holds no application state. Every `Switch` a Block renders in this
 *   repository passes it, which is the negative control that shows the arm is
 *   live rather than vacuous.
 *
 * ## What counts as an actionable control, and what is declared not to be
 *
 * The rule is read off the attributes of the rendered element rather than off the
 * value of a prop, because a value at runtime is not knowable from a file. An
 * element is actionable when it carries one of:
 *
 *   1. `onClick`             a handler. Legitimate in a Block that declares
 *                             `'use client'` and holds the state that makes the
 *                             handler do something, which this repository ships
 *                             around thirty of. This is the arm for `Button` and
 *                             for `DropdownMenuItem`, because it is what each of
 *                             them forwards to its own element.
 *   2. `type="submit"` or    the form's own activation. A submit button inside a
 *      `type="reset"`        `<form>` is a control that acts, and the action is
 *                             the browser's rather than the Block's.
 *   3. `href`                a destination. `CtaLink` and a router `Link` both
 *                             take a required `href`, and it is also the arm on a
 *                             `DropdownMenuItem` whose `render` element is an
 *                             anchor, so this arm is already held by the compiler
 *                             for both. It is named because a gate that only knew
 *                             the first two rules would read a correctly linked
 *                             control as a finding.
 *   4. `onCheckedChange`     the change handler, for `Switch` alone.
 *
 * Three things are deliberately NOT findings, and all three are stated rather
 * than left to a reader:
 *
 * - **A native `<button>` or a `<a>` in a Block.** The rule is about Prism's own
 *   action Components. A hand-written control in a `'use client'` Block is the
 *   Block's own and this gate has no way to know whether a handler arrived
 *   through a spread, so the rule is held on the Components whose dead form
 *   actually shipped. `Gallery01`'s tile is the case in point: a `<button>` with
 *   an `onClick` opening a lightbox.
 * - **A `ReactNode` slot.** A slot is how a consumer injects a working control,
 *   which is the whole escape this law exists to point at. `About01` renders
 *   `action.slot` and `Hero01` renders `action.slot`, and neither may be
 *   reported for it.
 * - **A Block that holds a disclosure itself.** `Collapsible` and `Accordion`
 *   put no `Button`, no `CtaLink`, no `DropdownMenuItem` and no `Switch` in a
 *   Block's source, so a Block that renders one with a `defaultOpen` and no
 *   change handler is still state a Block holds and this run reads it as clean.
 *   The prohibition on that is a design rule stated in `DESIGN.md` rather than a
 *   finding here, and saying so on every run is why a reader auditing it looks
 *   for the absence rather than for a clean run.
 *
 * ## The honest limits, printed on every run
 *
 * **This reads source, not rendered output.** A control chosen at runtime, a
 * control assembled in a string, and a control whose handler arrives through a
 * spread of unknown shape are all invisible to it. A `{...rest}` inside a
 * rendered `Button` is treated as carrying no handler, so a Block that forwards
 * props onto a button is reported; there is no such Block in the shipped tree,
 * and reporting it is the safe direction, because the alternative is a gate that
 * reads a spread as a pass.
 *
 * **The same limit decides what a forwarded optional handler reads as, and it is
 * why the row action list is a type-level fact rather than a finding here.** The
 * rule reads the presence of an attribute and not the value behind it, so
 * `onClick={action.onSelect}` on a menu row reads as carrying a handler whether
 * or not the `onSelect` behind it is present, and a gate that resolved the
 * optionality would be reading a type rather than a file. What the widening
 * catches is the shape where **no** handler is attached at all, which is what a
 * caller who declares a label and no handler ends up with once the forwarded
 * optional is gone. The declared list of action objects itself is what ticket
 * 176 removes, and the reason this gate is widened now rather than after is that
 * the classification is the defect: until the Component is on this list, nothing
 * here can fail on it.
 *
 * **The rule is about Blocks and Pages, not about Components.** A Component is
 * allowed to render an inert-by-construction button because its caller supplies
 * the handler, and `Button` itself is the clearest case: it is a `<button>` with
 * no handler of its own and it is correct. Only the two layers that ship no
 * behaviour by contract are read.
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's
 * own location and never from `process.cwd()`, a root that resolves to nothing
 * fails the run naming both causes, a run that resolved every root and read no
 * file fails the run, and the closing lines state the roots, the files walked and
 * read, and every element in the table with what it matched. No report-only mode:
 * a gate that reports and passes is a gate nobody runs.
 *
 * **The proof that this gate works is `scripts/__tests__/block-controls.test.mjs`,
 * not this run.** The shipped tree has no genuine finding, and each of the four
 * defects it was written for is planted as a fixture, because the four Blocks
 * that shipped them have since been fixed and a gate whose only evidence is a
 * clean run is a gate nobody has watched fail.
 *
 * Run: node scripts/check-block-controls.mjs
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  assertFilesRead,
  assertRootsResolve,
  coverageOf,
  relativePosix,
  walkRoots,
} from './lib/walk.mjs'

const NAME = 'check-block-controls'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/**
 * The repository root, from this file's own location. Never `process.cwd()`.
 *
 * Overridable so the gate's own test can point it at a fixture tree: a test that
 * had to plant a defect in the real repository to see the gate react would be a
 * test that dirties the tree to prove the gate works.
 */
const REPO_ROOT = (() => {
  const flag = process.argv.find((argument) => argument.startsWith('--repo='))
  return flag ? path.resolve(flag.slice('--repo='.length)) : path.resolve(HERE, '..')
})()

/**
 * One root per line, because a reader that splits on newlines cannot see a
 * single-line array. `check-nested-controls.mjs`, `check-dashes.mjs`,
 * `check-motion.mjs` and `check-elevation-layout.mjs` are shaped the same way for
 * the same reason.
 *
 * `apps/site/items` is deliberately NOT read, and the reason is that a Demo is
 * documentation rather than a product. The documentation Demo for `Button` itself
 * renders `<Button>Save changes</Button>` with no handler, because showing the
 * control is the whole point of showing it and there is nothing for it to do. A
 * gate that read the Demo tree would report about thirty of those, and a gate with
 * thirty findings it cannot act on is a gate nobody runs. What a Demo *does* teach
 * is held by the TypeScript compiler: a Demo passes a Block's props, so the moment
 * `AboutAction` or `Plan` stops accepting an action with no destination, every
 * Demo that passed one fails to build. The law is about what a Block renders into
 * a consumer's product, and only the two layers that ship no behaviour by contract
 * are read.
 */
const ROOTS = ['packages/ui/src/blocks', 'packages/ui/src/pages']

/** Only the module files that can render an element. `.md` and `.css` cannot. */
const EXT = /\.tsx$/

/**
 * A test is not a consumer's product, so a test may stage a control it is
 * asserting cannot be reached. `check-nested-controls.mjs` excludes test files for
 * the same reason and says so there.
 */
const TEST_FILE = /\.test\.tsx$/

/**
 * This gate's own rule table, and the fixtures that spell the banned shapes on
 * purpose. Matched on the absolute path rather than on a printed string, because a
 * `--repo` run resolves the printed string against the staged tree and the prefix
 * stops meaning anything; the label is for the reader and the path is for the rule.
 */
const EXCLUSIONS = [
  { absolute: path.join(HERE, `${NAME}.mjs`), label: `${NAME}.mjs (this gate's own rule table)` },
  { absolute: path.join(HERE, '__tests__'), label: '__tests__/** (this gate\'s own staged defects)' },
]

/** Whether a file is one of the exclusions, by absolute path rather than by prefix. */
function isExcluded(file) {
  return EXCLUSIONS.some(
    ({ absolute }) => file === absolute || file.startsWith(absolute + path.sep),
  )
}

/**
 * The Components a Block renders an action as, and what makes each one act.
 *
 * Named in full rather than pattern-matched, so widening the list is a decision
 * taken in the open and a typo cannot open a hole. `CtaLink` is on the list
 * because it renders an anchor and `href` is one of the arms that makes a control
 * actionable; `Button` is on it because it renders a `<button>` and carries no
 * handler of its own, which is the whole of the defect. `DropdownMenuItem` and
 * `Switch` are on it for the reason the module header states: the row action list
 * slipped between the first two, because a menu row is neither a button nor a
 * link and a gate that does not classify it cannot fail on it.
 *
 * Adding a Component here is how this gate learns a new one, and it is the only
 * edit that widens the rule. A Component that renders an anchor with a required
 * `href` cannot produce a dead control, so it is listed for the coverage line
 * rather than because it can fail.
 *
 * **`DropdownMenuItem` is deliberately not given the `Button` rule wholesale.** A
 * menu row also sits inside `DropdownMenu`, which owns the open state, the
 * typeahead, the arrow keys and Escape, so a Block that renders one is not in the
 * position `Button` is in: the menu works and the row does not. The two arms it
 * does get are the two the record index section settled, the handler and the
 * `render` element carrying a destination, and a third arm is not invented for it
 * because a reader meets a menu row as a menu row and announces it as one.
 */
const ACTION_COMPONENTS = new Map([
  [
    'Button',
    {
      // Each of these is a substring match against the attribute text of the
      // rendered element, and each is stated rather than inferred: `onClick` may be
      // written `onClick={x}` or `onClick`, and the second is a handler too.
      // Each arm is a list of patterns that must ALL match, and each arm is stated
      // rather than inferred. One arm is `onClick`, which may be written `onClick={x}`
      // or bare `onClick`, and the second is a handler too. The other is the form's
      // own activation, and it is deliberately narrowed to `submit` and `reset`:
      // naming the type is not a behaviour, and a rule that accepted any `type` would
      // have passed both of the shipped defects.
      actionable: [
        [/\bonClick\b/],
        [/\btype\b\s*=\s*(?:"(?:submit|reset)"|'(?:submit|reset)'|{(?:"(?:submit|reset)"|'(?:submit|reset)')})/],
      ],
      why: 'a Block ships no behaviour, so a Button it renders has no handler unless one is passed to it, and a server Component cannot be given one at all',
    },
  ],
  [
    'CtaLink',
    {
      actionable: [[/\bhref\b/]],
      why: "a CtaLink's `href` is required, so this is the compiler's arm rather than this gate's; it is listed so the coverage line can say what was read",
    },
  ],
  [
    'DropdownMenuItem',
    {
      // Two arms, and the second is a pair rather than a single word, which is the
      // only difference in shape in this table and it is deliberate.
      //
      // `DropdownMenuItem` takes no `href` of its own: it renders a `<div role>` and
      // forwards `render`, so the only way a destination reaches a menu row is inside
      // the element passed to `render`. One arm of `render` alone would accept
      // `render={<span />}`, which navigates to nothing; one arm of `href` alone would
      // accept an `href` written on the item, which is not a prop it declares and the
      // compiler already refuses, and would accept `data-href` as a destination because
      // the hyphen is a word boundary. The pair reads as the thing it means: the row is
      // rendered as an element that carries a destination.
      actionable: [[/\bonClick\b/], [/\brender\b/, /\bhref\b/]],
      why: 'a menu row acts on its own selection handler or on the destination carried by the element it renders as, and a Block can supply neither: it ships no behaviour to select with, and the menu around the row belongs to DropdownMenu rather than to the Block',
    },
  ],
  [
    'Switch',
    {
      // The one arm, and it is the Component's whole reason for existing. There is no
      // destination arm, because a switch does not navigate, and no form arm beyond
      // the handler, because the hidden input it renders submits with the form rather
      // than acting on the reader's own.
      actionable: [[/\bonCheckedChange\b/]],
      why: 'a switch is meaningless without the change handler, and the state it changes is the consumer\'s own setting rather than anything a Block holds, so a Switch a Block renders with no `onCheckedChange` is a control a reader can flip and nothing reports',
    },
  ],
])

/**
 * Blanks comments and string bodies without moving a line, so a rule about a
 * rendered element does not fire on a name inside a JSDoc block, and so the line
 * number a finding prints is the line the reader sees.
 *
 * Newlines survive, which is the whole reason this is not `replace(/…/g, '')`.
 * Deleting a block comment deletes the newlines inside it, every offset after it
 * is then measured against a shorter string, and every finding below the first
 * JSDoc block in a file is reported on the wrong line. The first version of this
 * gate did exactly that and reported `offering-categories-01.tsx:191` and
 * `waitlist-01.tsx:184` for lines that are prose. `check-block-imports.mjs` masks
 * the same way for the same reason.
 */
function maskProse(source) {
  const out = source.split('')
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k += 1) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
    }
  }
  let i = 0
  while (i < source.length) {
    const next = source.indexOf('/*', i)
    const line = source.indexOf('//', i)
    if (next !== -1 && (line === -1 || next < line)) {
      const close = source.indexOf('*/', next + 2)
      const end = close === -1 ? source.length : close + 2
      blank(next + 2, close === -1 ? source.length : close)
      i = end
      continue
    }
    if (line !== -1) {
      let end = source.indexOf('\n', line)
      if (end === -1) end = source.length
      blank(line, end)
      i = end
      continue
    }
    break
  }
  return out.join('')
}

/**
 * Where a JSX opening tag ends, given the index just after its name.
 *
 * **A regular expression cannot do this, and the first version of this gate tried
 * and reported three findings that were not there.** The naive shape is
 * `<Name([^<>]*)>`, and it stops at the first `<` or `>` in the attribute text,
 * which in JSX is very often not the end of the tag: `onClick={() => step(-1)}`
 * contains `=>`, `disabled={position <= 0}` contains `<=`, and
 * `disabled={currentPage >= pageCount}` contains `>=`. Each of those truncated the
 * attributes before the `onClick` that was two lines further down, so three Blocks
 * with working handlers were reported as shipping dead buttons.
 *
 * So the end is found by balance rather than by pattern. Braces and parentheses
 * are counted, a quoted string is skipped whole, and a `>` immediately preceded by
 * `=` is an arrow or a comparison and never the end of a tag. Every `>` inside an
 * expression container is inside a brace, so it is passed over by the depth check
 * and only a `>` at depth zero can end the tag.
 *
 * Returns `-1` for an unterminated tag, which a masked comment or a genuinely
 * broken file can produce, and the caller skips rather than reporting a truncated
 * read as a finding.
 */
function endOfTag(source, from) {
  let braces = 0
  let parens = 0
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      const close = source.indexOf(ch, i + 1)
      // An unterminated string means the rest of the file is not readable as JSX,
      // and guessing where it ended would invent attributes.
      if (close === -1) return -1
      i = close
      continue
    }
    if (ch === '{') braces += 1
    else if (ch === '}') braces -= 1
    else if (ch === '(') parens += 1
    else if (ch === ')') parens -= 1
    else if (ch === '>' && braces === 0 && parens === 0 && source[i - 1] !== '=') return i
  }
  return -1
}

/** An opening tag, its name and its attribute text, and where the tag ended. */
const OPENING = /<([A-Za-z][\w.]*)(?=[\s/>])/g

/**
 * Every action Component in one file, and which of them carried nothing that makes
 * them act.
 *
 * The attribute text of the opening tag is the whole of what this can know: a
 * control with children is `<Button …>` followed by content and then `</Button>`,
 * so nothing after the opening tag can add a handler to it. Children are therefore
 * not walked, which is also why a `Button` written inside another `Button`'s
 * children is read once, at its own opening tag, rather than twice.
 */
function inertActions(source) {
  const found = []
  const seen = []
  let match

  while ((match = OPENING.exec(source)) !== null) {
    const name = match[1]
    const rule = ACTION_COMPONENTS.get(name)
    if (rule === undefined) continue

    const end = endOfTag(source, match.index + 1 + name.length)
    if (end === -1) continue
    const attrs = source.slice(match.index + 1 + name.length, end)

    seen.push(name)
    // An arm is a list of patterns and all of them must match, so one arm can state a
    // shape that takes more than one word to say, such as a menu row rendered as an
    // element that carries a destination.
    if (rule.actionable.some((arm) => arm.every((pattern) => pattern.test(attrs)))) continue

    found.push({
      line: source.slice(0, match.index).split('\n').length,
      component: name,
      whole: source.slice(match.index, end + 1).replace(/\s+/g, ' ').trim(),
      why: rule.why,
    })
  }

  return { found, seen }
}

/**
 * What a screen reader calls each classified control, and where the way out is.
 *
 * Stated per Component rather than in one sentence for all of them, because the
 * finding is the only thing a reader of a failure gets and a menu row is not a
 * button. Getting this wrong in a finding is the same defect the gate exists for:
 * a message that describes the wrong control sends the next author to the wrong
 * escape. `CtaLink` has no entry because its `href` is required and it cannot be
 * reported; the entry is absent rather than written for the symmetry.
 */
const ANNOUNCED_AS = {
  Button: 'a button',
  DropdownMenuItem: 'a menu item',
  Switch: 'a switch, on or off',
}

const ESCAPE = {
  Button:
    'The escape is a slot: give the action a destination on the arm that navigates and require it, and give ' +
    "the other arm the caller's own control as a `ReactNode` the Block places without styling. See `hero-01`'s " +
    '`HeroLinkAction` and `HeroSlotAction`.',
  DropdownMenuItem:
    'The escape is a node the caller wrote: the Block draws the menu and the trailing cell and places a ' +
    '`ReactNode` per row inside it, and a row that navigates is written `render={<a href=... />}` because a ' +
    'link inside a focusable item is two tab stops for one row. See `sites-menu.tsx`.',
  Switch:
    'The escape is the change handler as a declared fact: either the field or the setting that owns it carries ' +
    'the handler and the Block passes it, or the caller\'s own control goes into a `ReactNode` the Block places ' +
    'without styling. See `SettingsPanel01` and the settings panel section of DESIGN.md.',
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })
assertRootsResolve(results, { scriptName: NAME })
assertFilesRead(results, { scriptName: NAME, extensions: EXT })

const matched = new Map()
const findings = []
let filesRead = 0
let filesSkipped = 0
let controlsSeen = 0

for (const result of results) {
  for (const file of result.files) {
    const shown = relativePosix(REPO_ROOT, file)
    if (isExcluded(file) || TEST_FILE.test(path.basename(file))) {
      filesSkipped += 1
      continue
    }
    filesRead += 1
    const { found, seen } = inertActions(maskProse(readFileSync(file, 'utf8')))
    for (const name of seen) {
      controlsSeen += 1
      matched.set(name, (matched.get(name) ?? 0) + 1)
    }
    for (const hit of found) {
      findings.push(
        `${shown}:${hit.line}  [inert-control]  <${hit.component}> is rendered with nothing that makes it ` +
          `act: ${hit.why}. A reader can focus it, a screen reader announces it as ${ANNOUNCED_AS[hit.component]}, ` +
          'and activating it does nothing. ' + ESCAPE[hit.component],
      )
    }
  }
}

for (const finding of findings) console.error(`error ${finding}`)

const coverage = coverageOf(results)
console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${filesRead} TSX module(s) read; ` +
    `${controlsSeen} action control(s) seen; ${filesSkipped} excluded file(s)`,
)
console.log(
  `${NAME}: coverage ${coverage.roots} root(s) resolved, ${coverage.unresolved} unresolved; ` +
    `${coverage.files} file(s) walked, ${filesRead} read`,
)
for (const [name, rule] of ACTION_COMPONENTS) {
  const count = matched.get(name) ?? 0
  console.log(`${NAME}: classified an action control, ${name}: ${count}`)
  const arms = rule.actionable.map((arm) => arm.map((p) => p.source).join(' and ')).join('; or ')
  console.log(`          actionable on ${arms}`)
  console.log(`          because ${rule.why}`)
  if (count === 0) {
    console.log(
      '          this tree renders none of them, so the pattern is stated and unused rather than removed. A\n' +
        '          rule that stopped matching and a rule that was deleted print the same, which is why this does.',
    )
  }
}
console.log(`${NAME}: excluded from every rule: ${EXCLUSIONS.map((entry) => entry.label).join(', ')}`)
console.log(
  `${NAME}: not a finding, and said here so a reader does not have to guess: a ReactNode slot, because a slot is\n` +
    "  how a consumer injects a working control without the Block owning any state; a hand-written <button>\n" +
    "  or <a> in a 'use client' Block, because that control is the Block's own and this gate reads the Prism\n" +
    '  action Components whose dead form actually shipped; and a Block that holds a disclosure itself, because\n' +
    '  Collapsible and Accordion put none of the four classified Components in its source, so that one is a\n' +
    '  design rule stated in DESIGN.md and an auditor checks it by looking for the absence. This reads source,\n' +
    '  not rendered output, so a control',
)
console.log(
  `${NAME}: chosen at runtime, one assembled in a string, and one whose handler arrives through a spread of unknown\n` +
    '  shape are all invisible to it. A spread inside a rendered control is read as carrying no handler, and a\n' +
    '  handler forwarded from a declared optional prop reads as present, because resolving it is reading a type.',
)

if (findings.length > 0) {
  console.error(
    `\nA Block ships no behaviour, so a control it renders can only act on a destination it was given, on a\n` +
      'form the browser submits, or on a handler it was handed. One with none of the three is focusable,\n' +
      'announced, and inert. Give the action a destination and require it, pass the handler the control is\n' +
      'meaningless without, and make the arm that is not a control a slot for the caller\'s own node.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every action control a Block or a Page renders carries a destination, a handler, or the form's own\n` +
    '  activation, so a reader who focuses one can act on it.',
)
