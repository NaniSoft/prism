/**
 * A control inside a control is a finding, and the failure names the file, the
 * line and both elements.
 *
 * The claim this holds. The HTML content model puts a hard boundary around the
 * interactive content of an anchor and around the content of a button: neither may
 * contain another control. Two things follow, and both are defects a reader meets
 * rather than a validator's opinion. A keyboard reader reaches two tab stops for
 * one action, and hears the pair announced as two things. A pointer reader's press
 * has to be resolved by the browser between two elements whose activation rules
 * disagree, and in the case this repository shipped the destination was on the
 * outer element while the press belonged to the inner one, so the action a reader
 * aimed at and the navigation they got were two separate decisions.
 *
 * The hole this closes. Nothing checked it, and the one occurrence was invisible
 * in every review and every other gate. `apps/site/src/app/(site)/not-found.tsx`
 * wrapped a `Button` in a `next/link`, which emits `<a href><button>…</button></a>`
 * on the page that a reader reaches by following a dead address. It type-checked:
 * both Components take the props they were given. It passed the token gates, the
 * surface gate, the focus gate, the catalogue gate, the corpus join and the
 * rendered-output claim, because every one of those asks whether something is
 * right and none of them asks whether two elements may sit inside each other.
 *
 * The repository already had the answer twice and wrote it down both times, in
 * `dropdown-menu.tsx` and at the `render={<a/>}` call site in
 * `blocks/site-navbar/sites-menu.tsx`: a control that navigates has to BE the
 * link. `Button` has no `render` or `asChild` seam, so a caller cannot express
 * that and the only way to get an anchor in a button's clothes is to nest one
 * inside the other. This gate is what stops the nesting from being the way anyone
 * finds out.
 *
 * ## What counts as a control, and what is declared not to
 *
 * A text scan of a TSX file finds many angle brackets and most of them are not
 * elements. So the rule is a shape read off a tag stack rather than a search for a
 * name, and the name table is short and stated:
 *
 *   1. a native control   `button`, `select`, `textarea` and `summary`, and an
 *                         `a` carrying an `href`.
 *   2. a Prism control    the Components whose element is one of the above, and
 *                         the router links whose element is an anchor. Named
 *                         rather than pattern-matched, so widening the list is a
 *                         decision taken in the open and a typo cannot open a hole.
 *                         `Link` is on the list because `Button` was inside one,
 *                         and a table that only knew the lowercase tags would have
 *                         read that as a nesting of a component inside an anchor
 *                         and found nothing.
 *   3. `label`            counted as a parent ONLY for a descendant that is not a
 *                         labelable control, and the reason is that the two are
 *                         opposites. `<label><input/></label>` is the pattern the
 *                         specification recommends and this repository ships four
 *                         of them; `<label><a/></label>` is invalid. A rule that
 *                         counted every label as interactive reported four
 *                         findings on correct markup on the first run, which is
 *                         the failure a gate nobody has watched fail cannot be
 *                         distinguished from.
 *   4. `a`                counted as a parent only when it carries an `href`,
 *                         because the transparent content model applies only when
 *                         it does not. `<a><button/></a>` is a placeholder and is
 *                         legal; `<a href="…"><button/></a>` is not. The rule is
 *                         applied to parents as well as to children, because a
 *                         gate that is exact in one direction and approximate in
 *                         the other is a gate whose answer depends on which way
 *                         the markup happens to be written.
 *
 * ## The honest limits, printed on every run
 *
 * **This reads source, not rendered output.** A component chosen at runtime, a
 * control composed inside a fragment that this scan does not track, and an element
 * assembled in a string are all invisible to it. What it holds is the shape a
 * later edit changes, which is the same claim
 * `apps/site/test/narrow-viewport-and-type-scale.test.ts` makes for the same
 * reason.
 *
 * **`href` is read from the attribute text.** An anchor written `<a href={url}>`
 * is a control and one written `<a>` is not, and this decides that from the word
 * being present rather than from the value, because a value at runtime is not
 * knowable from a file.
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's own
 * location and never from `process.cwd()`, a root that resolves to nothing fails
 * the run naming both causes, a run that resolved every root and read no file
 * fails the run, and the closing lines state the roots, the files walked and read,
 * and every tag in the table with what it matched. No report-only mode: a gate
 * that reports and passes is a gate nobody runs.
 *
 * **The proof that this gate works is `scripts/__tests__/nested-controls.test.mjs`,
 * not this run.** The shipped tree has no genuine finding; a planted one fires in a
 * Block and in a site route, which is the negative control that makes the clean run
 * mean something.
 *
 * Run: node scripts/check-nested-controls.mjs
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

const NAME = 'check-nested-controls'
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
 * single-line array. `check-dashes.mjs`, `check-motion.mjs` and
 * `check-elevation-layout.mjs` are shaped the same way for the same reason.
 *
 * `apps/site/items` is read because that is where the documentation Demos live and
 * where a Block's real call sites are written, and a Demo that nests a control
 * teaches every reader of the Item to nest one. This gate does not read
 * `apps/site/src/generated`, whose Demos are written from `apps/site/items`.
 */
const ROOTS = [
  'apps/site/src',
  'apps/site/items',
  'packages/ui/src',
]

/** Only the module files that can render an element. `.md` and `.css` cannot. */
const EXT = /\.tsx$/

/**
 * A test is not a consumer's product, so a test may stage a shape it is asserting
 * is absent. A Component test that renders `<a><button/></a>` to prove the page no
 * longer does is writing the defect down on purpose, and a rule that could not see
 * the difference would forbid the only way to assert against it. `check-block-copy`
 * excludes test files for the same reason and says so there.
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
 * The elements the HTML content model treats as interactive content, and the
 * Components in this repository that render one.
 *
 * The native set is read from the specification rather than from taste. `a` is
 * absent from it and handled by the `href` rule below, because an anchor without a
 * destination is not a link: it is a slot, and this repository has Blocks whose
 * whole claim is that a mark with no `href` is a label rather than a gap.
 *
* The Prism names are the Components whose element is a `button` or an `a`, and
 * they are here because the defect was a nesting of two of them and a gate that
 * only knew the lowercase tags would have read it as a nesting of a Component in
 * an anchor. `Link` and `NavLink` are on it for the same reason from the other
 * side: a router link renders an anchor, so a control inside one is the shipped
 * defect. Adding a Component to this table is how this gate learns a new one.
 */
const CONTROL_TAGS = new Set(['button', 'input', 'select', 'textarea', 'summary'])

const CONTROL_COMPONENTS = new Set([
  'Button',
  'CtaLink',
  'DropdownMenuItem',
  'Link',
  'NavLink',
  'Toggle',
])

/**
 * What a `label` may contain.
 *
 * A labelable control is the whole point of a label, so a label wrapping one is
 * correct markup and this repository ships four of them. Anything else inside a
 * label is a second interactive control in a row that already has one.
 */
const LABELABLE = new Set([
  'button',
  'input',
  'meter',
  'output',
  'progress',
  'select',
  'textarea',
])

/**
 * Elements with no closing tag, so the stack does not wait for one and report every
 * later element as nested inside them.
 */
const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/** One tag at a time, with the attribute text and whether it closed itself. */
const TAG = /<(\/)?([A-Za-z][\w.]*)([^>]*?)(\/?)>/g

/** Comments carry no markup, and a name inside one is prose. Blanked, not cut. */
function blankComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/** Whether a tag is a control in its own right. */
function isControl(tag, attrs) {
  if (CONTROL_COMPONENTS.has(tag)) return true
  if (tag === 'a') return /\bhref\b/.test(attrs)
  return CONTROL_TAGS.has(tag)
}

/**
 * Whether an open ancestor forbids a control inside it.
 *
 * `label` is the one element whose answer depends on its descendant, and the
 * dependency is the whole reason it is written as a function rather than a set
 * membership. An `a` is the other: the transparent content model applies only when
 * there is no `href`, so `<a><button/></a>` is a placeholder and is legal, while
 * `<a href="…"><button/></a>` is not. Reading the parent rather than the child is
 * the same rule the child side uses, applied in the other direction.
 */
function forbidsControl(parent, child) {
  if (parent.tag === 'label') return !LABELABLE.has(child)
  if (parent.tag === 'a') return /\bhref\b/.test(parent.attrs)
  return CONTROL_COMPONENTS.has(parent.tag) || CONTROL_TAGS.has(parent.tag)
}

/**
 * The controls nested inside another control in one file, and every control the
 * scan saw whether or not it was nested.
 *
 * The stack is structural rather than a search, so a control three levels down
 * inside a link is found and a control beside one is not. A closing tag pops to
 * its own name and drops whatever was left open inside it, so one unbalanced tag
 * in a file cannot make every later element look nested.
 *
 * Both lists are returned because a rule table that can only print the controls it
 * rejected cannot be told apart from a rule table whose patterns stopped matching.
 */
function nestedIn(source) {
  const found = []
  const seen = []
  const openedAround = []
  const stack = []
  let at = 0
  let match

  while ((match = TAG.exec(source)) !== null) {
    at = match.index
    const [, closing, name, attrs, selfClose] = match
    const tag = name

    if (closing) {
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        if (stack[i].tag === tag) {
          stack.length = i
          break
        }
      }
      continue
    }

    if (isControl(tag, attrs)) {
      seen.push(tag)
      // Walk outwards to the nearest ancestor that forbids a control, and stop at
      // the first ancestor that does not, because a `label` that admits this
      // child admits anything below it too. Every ancestor passed over is tallied,
      // so the parents the rule watches are counted on every run whether or not
      // they rejected anything: the four `label` wrapping an `input` in this
      // repository are the negative control that shows the label rule is live.
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const parent = stack[i]
        openedAround.push(parent.tag)
        if (forbidsControl(parent, tag)) {
          found.push({
            line: source.slice(0, at).split('\n').length,
            child: tag,
            parent: parent.tag,
          })
          break
        }
        if (parent.tag === 'label') break
      }
    }

    if (!selfClose && !VOID.has(tag)) stack.push({ tag, attrs })
  }

  return { found, seen, openedAround }
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })
assertRootsResolve(results, { scriptName: NAME })
assertFilesRead(results, { scriptName: NAME, extensions: EXT })

/**
 * Every element the run classified as a control, and every element it classified
 * one as being inside. Both tallies are printed on every run, so a table entry
 * that stopped matching is visible rather than silent.
 */
const matched = new Map()
const openedAround = new Map()
const tally = (into, tag) => into.set(tag, (into.get(tag) ?? 0) + 1)

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
    const { found, seen, openedAround: around } = nestedIn(blankComments(readFileSync(file, 'utf8')))
    for (const tag of seen) {
      controlsSeen += 1
      tally(matched, tag)
    }
    for (const tag of around) tally(openedAround, tag)
    for (const hit of found) {
      findings.push(
        `${shown}:${hit.line}  [nested-control]  <${hit.child}> is inside <${hit.parent}>, which ` +
          'the HTML content model does not allow. A reader reaches two tab stops for one action and hears ' +
          'two things, and a press is resolved between two elements whose activation rules disagree. The ' +
          'control that navigates has to BE the link: compose it, or use the Component that renders the ' +
          'element you mean. `DropdownMenuItem` takes a `render` element for exactly this reason.',
      )
    }
  }
}

for (const finding of findings) console.error(`error ${finding}`)

const coverage = coverageOf(results)
console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${filesRead} TSX module(s) read; ` +
    `${controlsSeen} control(s) seen; ${filesSkipped} excluded file(s)`,
)
console.log(
  `${NAME}: coverage ${coverage.roots} root(s) resolved, ${coverage.unresolved} unresolved; ` +
    `${coverage.files} file(s) walked, ${filesRead} read`,
)
const shown = (into, tag) => {
  const count = into.get(tag) ?? 0
  const note = CONTROL_COMPONENTS.has(tag)
    ? ' (a Prism Component whose element is a control)'
    : tag === 'label'
      ? ' (a parent only for a descendant that is not a labelable control)'
      : ''
  return `${tag}: ${count}${note}`
}

const UNUSED = [...CONTROL_TAGS, 'a', ...CONTROL_COMPONENTS].filter((tag) => !matched.has(tag))
for (const [tag] of matched) console.log(`${NAME}: classified a control, ${shown(matched, tag)}`)
for (const tag of UNUSED) {
  console.log(
    `${NAME}: classified a control, ${tag}: 0\n` +
      `          this tree uses no <${tag}>, so the pattern is stated and unused rather than removed. A\n` +
      `          rule that stopped matching and a rule that was deleted print the same, which is why this does.`,
  )
}
for (const tag of new Set([...CONTROL_TAGS, 'label', ...CONTROL_COMPONENTS])) {
  if (!openedAround.has(tag)) continue
  console.log(`${NAME}: watched as a parent, ${shown(openedAround, tag)}`)
}
console.log(`${NAME}: excluded from every rule: ${EXCLUSIONS.map((entry) => entry.label).join(', ')}`)
console.log(
  `${NAME}: this reads source, not rendered output. A control chosen at runtime, one composed inside a\n` +
    '  fragment this scan does not track, and one assembled in a string are all invisible to it, and an\n' +
    '  anchor is a control here on the word `href` being present rather than on its value.',
)

if (findings.length > 0) {
  console.error(
    `\nA control inside a control is invalid markup, and it is two tab stops for one action. The one this\n` +
      'repository shipped was a Button inside a Link on the 404 route, so a reader who pressed the page\'s one\n' +
      'action reached two controls and the destination and the press belonged to two different elements.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: no control in packages/ui or on the documentation site sits inside another control, so every\n` +
    '  action a reader can reach is one element with one name and one activation.',
)