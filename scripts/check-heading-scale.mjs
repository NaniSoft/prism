/**
 * A heading's size follows its level, and the table that decides it is held to
 * the authored scale and to its own documentation.
 *
 * **THE DEFECT THIS EXISTS TO STOP IS A DOCUMENTED CONTRACT AND A RENDERED ONE
 * THAT DISAGREED, WITH NOTHING IN THE TREE TO SEE IT.** `DESIGN.md` under
 * Typography, Hierarchy, gave Display two roles at once: "section titles, the CTA
 * banner heading, and every page `h1`". `SectionHeading` implemented that
 * literally and wrote one class string for all six levels, so an `h1` and an `h2`
 * came out byte-identical. Every other gate was green and correctly so: the
 * outline was right at every level, the alignment was left where the shared rule
 * says it must be, every Block forwarded its `headingLevel` faithfully, and
 * `test/card-title-headings.test.tsx` held the outline. The size was a constant
 * inside a Component, and a Block that forwarded its level perfectly was
 * indistinguishable from one that ignored it, because forwarding it changed
 * nothing a test could observe. This is the house pattern rather than a one-off:
 * a Component's stated behaviour and its rendered output drifted, and the class of
 * defect was invisible to every gate rather than caught by one.
 *
 * **The subject is one file, and the gate reads it twice.** `section.tsx` carries
 * the table in a private map and states the same table in the JSDoc block on the
 * Component, and the JSDoc is the documentation source the declaration build
 * preserves and the corpus reads. Two copies of one table in one file is normally
 * the thing this repository refuses, and it is here on purpose: the second copy is
 * the consumer-facing one, and the gate is what holds them in step. Reading only
 * the map would pass a Component whose documentation promises a size it does not
 * render, which is the exact half of the defect that shipped. Rule 10 is the same
 * argument applied to the third copy, in the one file that holds it.
 *
 * **The steps are read out of the token SOURCE, never listed here.** Same reason
 * `check-elevation-layout.mjs` reads the container names out of `layout.tokens.json`
 * and `check-breakpoint-variants.mjs` reads its screens out of the same file: a
 * gate whose subject is the authored scale cannot be answered by a list kept
 * beside the gate, because that list is the second copy the gate exists to
 * prevent, and it cannot be answered from `dist/` either, because a build output a
 * warm cache left behind is not an authority on what this repository authors. A
 * missing or empty `text` group fails the run for the same reason an empty
 * `container` group does: a gate with no authority would report every step in the
 * table as un-authored, which is a loud failure on the right tree for the wrong
 * reason.
 *
 * **The rules, and what each one is for.**
 *
 *   1. every level in the outline has an entry, so a level added to `HeadingLevel`
 *      cannot be left without a size;
 *   2. every step named is a step the token source authors, so the table cannot
 *      reach a value out of the scale;
 *   3. the top two levels do not share a step, which is the defect itself and the
 *      one rule that has to be here for the gate to be about anything;
 *   4. the steps descend one authored step at a time until they stop, so a table
 *      that jumps, or that rises, is a finding. Both halves are checked, and the
 *      jump half was added after the table was widened: a table that skipped a
 *      rung descended, reached the ceiling and floored at or above Body, so it
 *      passed this gate while rendering the page's `h1` one gap above its own
 *      `h2`, which is the defect this whole rule exists to hold;
 *   5. the largest step the table names is the largest step the token source
 *      authors, and no level renders above the `h1`, which is how "nothing in the
 *      system goes above its largest authored step" is held from the component
 *      side and how adding a level can never invert the hierarchy. The ceiling is
 *      named here as a property rather than as a step, because the step it names
 *      is a fact about the token source and this gate reads that rather than
 *      restating it: a gate whose header said `4xl` would have been describing
 *      the tree it happened to be run against rather than the rule;
 *   6. the floor is at or above the step `DESIGN.md` gives Body, so a heading at
 *      the bottom of the table never renders smaller than the copy it introduces;
 *   7. weight, tracking and balance are on the heading and not in the per-level
 *      strings, so a level that grows a size has not quietly lost the rest of the
 *      heading;
 *   8. the JSDoc table is the code table, cell for cell;
 *   9. `DESIGN.md`'s Hierarchy gives Display one role, and it is not the section
 *      title, which is the sentence the whole defect sat in;
 *  10. the Item document for `section` states the table the Component renders,
 *      row for row, and states it once, so the published documentation site
 *      cannot publish a ladder the library does not render.
 *
 * **Rule 3 is separate from rule 4 because a uniform table passes rule 4.** Every
 * level at one step is flat, and flat is not descending, so a rule that only asked
 * whether the sequence falls would have printed a clean line over the exact defect
 * that shipped: one class string for all six levels, a page `h1` and an `h2` at
 * 36 pixels, and every other gate in this repository green and correctly so. The
 * staged fixture in `scripts/__tests__/heading-scale.test.mjs` is that table, and
 * the gate is asserted to fail on it.
 *
 * **Rule 9 is the only one that reads prose, and it reads a bullet rather than a
 * phrase.** It takes the Hierarchy section, splits it on its own bullets, and
 * refuses the words "section title" inside the Display bullet. That is narrow on
 * purpose: it holds the claim that made the defect possible, and it says nothing
 * about how the rest of the section is worded, so a later rewrite of the Hierarchy
 * prose does not turn this red for a reason that has nothing to do with the rule.
 *
 * **The third copy of the table is the Item document, and it is the copy a reader
 * is looking at.** `apps/site/items/component/layout/section/section.mdx` states
 * the same ladder in its prose, because that is the page someone is on when they
 * ask what `as` resolves to, and neither the declaration build nor the corpus
 * reaches it: the JSDoc is what those two read, so the Item table was a third copy
 * that nothing held in step. That is this gate's own subject one file over, and it
 * shipped the moment the ceiling moved. Rule 10 compares it to the same
 * `HEADING_SIZE` rule 7 compares the JSDoc to, by the same cell-for-cell shape, so
 * the rule names no step and a retune of the ladder is a retune of the table the
 * Item is asked to agree with rather than a second ladder written out in a gate. It
 * also reads the whole Item rather than a slice of it, so a second table appearing
 * anywhere in the prose is a finding: two tables in one document is the thing this
 * repository refuses, and the first version of this rule read one of them and would
 * have passed it.
 *
 * **The one limit, stated rather than hidden.** `BODY_STEP` below is a name this
 * gate holds rather than reads, because "Body is 400 at `lg`" is a sentence in
 * `DESIGN.md` and not a field in the token source; the value is read from the
 * source and printed, so a retune of `lg` shows up in the run's output even though
 * the rule does not follow it. Everything else this gate judges is read from the
 * token source or from the tree it is about.
 *
 * Run: node scripts/check-heading-scale.mjs
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

const NAME = 'check-heading-scale'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository root, from this file's own location. Never `process.cwd()`. */
const REPO_ROOT = path.resolve(HERE, '..')

/**
 * One root per line, for the reason `check-elevation-layout.mjs` states: two
 * suites read these arrays out of their gates rather than typing a copy.
 *
 * All five are files rather than trees, which `walkRoot` accepts and which is what
 * makes this gate's coverage claim falsifiable: a root that is a file that was
 * renamed resolves to nothing and fails the run rather than emptying it.
 *
 * There is deliberately no tree here, and `docs/quality-gates.md` records why. The
 * ladder cannot be applied to a Block or a Page by reading its source, because a
 * heading a surface draws inside itself is a caption at the scale of that surface
 * rather than a rung of the page ladder, and nothing in the source says which is
 * which: forty-eight headings name a step of their own and thirty-seven of them are
 * captions. `cta-01` is named because it is the one Block that cannot compose
 * `SectionHeading` at all, not because it is the only one that resolves its own
 * heading, and that is a narrower claim than it looks. A root that listed the rest
 * of the rungs would be a list somebody maintains, which is the failure this gate's
 * own subject is about.
 *
 * **The count above is a measurement and not an invariant, and the reason is worth
 * more than the number.** It was taken by a scan that looks for a literal size
 * utility beside a heading tag, and a heading whose size it inherits names nothing:
 * no `text-*` in its class string is the same source text as a heading at exactly
 * the step the surface it sits in happens to set. Five theme names on
 * `/foundation/themes` carried no size at all, rendered at 16 pixels and 500 under a
 * 60 pixel `h1`, and two scans of this kind passed them, because "no literal" is
 * invisible to a scan that looks for literals. So a scan of this shape can only ever
 * report headings that name a step, and a heading it reports is a rung or a caption
 * by arithmetic: at or above the step Body is set at is a rung, below it is a
 * caption. That is the whole of what this count is good for, and the remedy for what
 * it cannot see is on the other side of it, in the surfaces: a caption names its own
 * step, so it is visible to the scan and it is below the floor by definition.
 */
const ROOTS = [
  'packages/ui/src/components/ui/section.tsx',
  'packages/tokens/src/foundation/base.tokens.json',
  'DESIGN.md',
  'apps/site/items/component/layout/section/section.mdx',
  'packages/ui/src/blocks/cta-01/cta.tsx',
]
const EXT = /\.(tsx|json|md|mdx)$/

/** Where each root is in `ROOTS`, named rather than indexed. */
const SECTION_ROOT = ROOTS[0]
const TOKENS_ROOT = ROOTS[1]
const ITEM_ROOT = ROOTS[3]
const CTA_ROOT = ROOTS[4]

/** The document whose Hierarchy section is one of the things under test. */
const DESIGN = path.join(REPO_ROOT, 'DESIGN.md')

/** The Item page that documents the ladder in its own prose. */
const SECTION_ITEM = path.join(REPO_ROOT, ITEM_ROOT)

/** The authored text steps, read from the token source rather than listed here. */
const BASE_TOKENS = path.join(REPO_ROOT, TOKENS_ROOT)

/**
 * The step `DESIGN.md` gives Body, held rather than read.
 *
 * Named for the reason the header gives: it is a sentence in the Hierarchy
 * section and not a field in the token source, so there is nothing here to read it
 * out of. Its value IS read out of the source and printed on every run, so a
 * retune of `lg` is visible in the output even though this rule does not follow it.
 * Body is 400 at 1.125rem, and a heading below that renders smaller than the copy
 * it introduces.
 */
const BODY_STEP = 'lg'

/** The six levels in outline order, matching `HeadingLevel` in the component. */
const LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/**
 * The table as the component writes it.
 *
 * Read from the private map rather than imported, for two reasons. The map is
 * private, and a gate that imported the thing it is judging would judge the
 * implementation against itself. And the shape read here is the shape a reader
 * sees: one entry per level, a level, a colon and a string of class names.
 */
function codeTable(source, shown) {
  const start = source.indexOf('const HEADING_SIZE')
  if (start === -1) {
    fail(`${shown} has no \`HEADING_SIZE\` map, so there is no level-to-size table to judge.\n` +
      '  A Component whose size no longer comes from a table would render one size at every level\n' +
      '  again, which is the defect this gate exists for, so the map is the subject and its absence\n' +
      '  is a finding rather than a smaller run.')
  }
  const open = source.indexOf('{', start)
  const close = source.indexOf('\n}', open)
  if (open === -1 || close === -1) {
    fail(`${shown} declares \`HEADING_SIZE\` and this gate could not read its body. The brace\n` +
      '  structure it reads is a level, a colon and a quoted string per line; a table written any\n' +
      '  other way is a change to this gate as well as to the Component.')
  }
  const table = new Map()
  for (const [, level, classes] of source.slice(open, close).matchAll(/^\s*(h[1-6]):\s*'([^']+)'/gm)) {
    table.set(level, classes.trim().split(/\s+/))
  }
  if (table.size === 0) {
    fail(`${shown} declares \`HEADING_SIZE\` and it yielded no entry this gate could read.`)
  }
  return table
}

/**
 * The same table as the JSDoc block on the Component states it.
 *
 * The block is found by the declaration it documents rather than by a line count,
 * so a JSDoc block added above it moves neither. The rows are the markdown table
 * rows the Component's documentation carries, one per level, and they are compared
 * cell for cell rather than by presence, because "the prose mentions `text-2xl`"
 * is satisfied by a sentence about a retired value and says nothing about whether
 * the row for `h3` is right.
 */
function docTable(source, shown) {
  const declaration = source.indexOf('export function SectionHeading')
  if (declaration === -1) {
    fail(`${shown} does not declare \`SectionHeading\`, so the documentation this gate reads\n` +
      '  beside the table is not there.')
  }
  const open = source.lastIndexOf('/**', declaration)
  if (open === -1) {
    fail(`${shown} has no JSDoc block on \`SectionHeading\`. The block is the documentation source the\n` +
      '  declaration build preserves and the corpus reads, so a Component without one has no stated\n' +
      '  contract for this gate to hold.')
  }
  const block = source.slice(open, declaration)
  const table = new Map()
  for (const [, level, base, at] of block.matchAll(/\|\s*`(h[1-6])`\s*\|\s*`([^`]+)`\s*\|[^|]*\|\s*`([^`]+)`\s*\|/g)) {
    table.set(level, `${base} ${at}`.trim().split(/\s+/))
  }
  return { table, block }
}

/** The Hierarchy section of `DESIGN.md`, which is what rule 8 reads. */
function hierarchy(markdown) {
  const start = markdown.indexOf('### Hierarchy')
  if (start === -1) {
    fail(`${relativePosix(REPO_ROOT, DESIGN)} has no \`### Hierarchy\` section, so the roles this gate\n` +
      '  reads the Display bullet out of are not there to read.')
  }
  const end = markdown.indexOf('\n### ', start + 1)
  return markdown.slice(start, end === -1 ? markdown.length : end)
}

function fail(message) {
  console.error(`\n${NAME}: ${message}`)
  process.exit(1)
}

/**
 * The authored text steps, smallest first.
 *
 * Read rather than listed, for the reason the header gives. `$description` and
 * `$type` are filtered because they are the group's own metadata and not steps,
 * and `mono` is kept rather than filtered: it is an authored size, so dropping it
 * would make the largest and smallest steps a judgement rather than a read, and
 * the rules only ever ask whether a named step is in the set and how two steps
 * compare.
 */
function authoredSteps() {
  const group = JSON.parse(readFileSync(BASE_TOKENS, 'utf8')).text ?? {}
  const steps = []
  for (const [name, entry] of Object.entries(group)) {
    if (name.startsWith('$')) continue
    steps.push({ name, rem: entry.$value.value })
  }
  if (steps.length === 0) {
    fail(
      `the authored \`text\` group in ${relativePosix(REPO_ROOT, BASE_TOKENS)} is empty, so every step in\n` +
        '  the table would read as un-authored. This run has no authority to judge a size against, so\n' +
        '  it fails rather than reporting every step it reads.',
    )
  }
  steps.sort((a, b) => a.rem - b.rem)
  return steps
}

const failures = []

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })
try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { scriptName: NAME, extensions: EXT })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

const STEPS = authoredSteps()
const BY_NAME = new Map(STEPS.map((step) => [step.name, step]))
const LARGEST = STEPS[STEPS.length - 1]
const BODY = BY_NAME.get(BODY_STEP)

if (BODY === undefined) {
  fail(
    `the token source authors no \`text\` step named \`${BODY_STEP}\`, which is the step this gate holds\n` +
      '  the heading floor against. Either the step was renamed or the name in this gate is wrong, and\n' +
      '  the rule below has no authority without it.',
  )
}

const sectionSource = readFileSync(path.join(REPO_ROOT, SECTION_ROOT), 'utf8')
const TABLE = codeTable(sectionSource, SECTION_ROOT)
const { table: DOC, block: DOC_BLOCK } = docTable(sectionSource, SECTION_ROOT)

/** Rule 1: every level in the outline has an entry. */
for (const level of LEVELS) {
  if (TABLE.has(level)) continue
  failures.push(
    `${SECTION_ROOT} has no size for \`${level}\`. \`HeadingLevel\` has ${LEVELS.length} levels and the\n` +
      `    table has ${TABLE.size}, so a level can be composed and render at nothing. Every level is a row.`,
  )
}

/** Rule 2: every step named is a step the token source authors. */
for (const [level, classes] of TABLE) {
  for (const utility of classes) {
    const step = utility.replace(/^sm:/, '')
    if (step.startsWith('text-') === false) {
      failures.push(
        `${SECTION_ROOT} renders \`${level}\` at \`${utility}\`, which is not a size utility.\n` +
          "    The table holds sizes and nothing else; weight, tracking and balance are the heading's.",
      )
      continue
    }
    const name = step.slice('text-'.length)
    if (BY_NAME.has(name) === false) {
      failures.push(
        `${SECTION_ROOT} renders \`${level}\` at \`${utility}\`, naming the size \`${name}\`, which the token\n` +
          `    source does not author. Steps this repository authors: ${[...BY_NAME.keys()].join(', ')}.`,
      )
    }
  }
}

/** The levels the table actually names, in outline order. */
const ordered = LEVELS.filter((level) => TABLE.has(level))

/**
 * Rule 5: the table reaches the ceiling and nothing in it is above it, and nothing
 * in it is above the `h1`.
 *
 * Both halves matter and they are different claims. The first is DESIGN.md's "nothing
 * in the system goes above its largest authored step" read from the component side,
 * and the second is the rule that makes adding a level safe: a level that asks for a
 * step above the page's own `h1` is a level that has inverted the hierarchy, and no
 * authored step existing above the ceiling is what used to make that unreachable by
 * accident rather than by rule.
 */
let tableMax = -Infinity
for (const classes of TABLE.values()) {
  for (const utility of classes) {
    const rem = BY_NAME.get(utility.replace(/^sm:/, '').replace(/^text-/, ''))?.rem
    if (rem !== undefined && rem > tableMax) tableMax = rem
  }
}
if (tableMax < LARGEST.rem) {
  failures.push(
    `${SECTION_ROOT} never reaches \`${LARGEST.name}\`, the largest step the token source authors, so\n` +
      "  the page's own `h1` no longer grows at `sm`. The ceiling is a fact about the scale rather than\n" +
      '  a target, and a heading table that stops a step short of it is a retune nobody asked for.',
  )
}
const topLevel = remOf('h1')
for (const level of ordered) {
  const rem = remOf(level)
  if (rem === undefined || topLevel === undefined) continue
  if (rem <= topLevel) continue
  failures.push(
    `${SECTION_ROOT} renders \`${level}\` at ${rem}rem, above the ${topLevel}rem it renders \`h1\` at.\n` +
      `    A level deeper than the page heading cannot be a bigger one, and nothing above \`${LARGEST.name}\`\n` +
      '    exists to make that mistake silently.',
  )
}

/** Rule 3: the top two levels do not share a step. The defect, in one comparison. */
const topStep = remOf('h1')
const secondStep = remOf('h2')
if (topStep !== undefined && secondStep !== undefined && topStep === secondStep) {
  failures.push(
    `${SECTION_ROOT} renders \`h1\` and \`h2\` at one step, ${topStep}rem.\n` +
      '    A page h1 and the h2 sections under it would come out byte-identical, which is the defect\n' +
      '    this gate exists for and the reason the two roles were one bullet in DESIGN.md. The table has\n' +
      '    to step, and it has to step at the top rather than somewhere further down.',
  )
}

/**
 * Rule 4: the steps descend one authored step at a time, then stop.
 *
 * Both halves of "one at a time" are checked, and the jump half is the one this
 * rule did not check for its whole first life. It only asked whether the sequence
 * fell, so a table that skipped a rung passed it: `h1` at `4xl`, `h2` at `2xl` and
 * the rest descending one step at a time is descending, it reaches whatever the
 * ceiling is, and it floors wherever it lands. That is the exact shape a page `h1`
 * and its own `h2` at one fifth more apart renders, which is the defect the display
 * steps were authored to remove, and it was reachable because the first version of
 * this rule described the jump without testing for it. A position is an index into
 * the authored steps rather than a rem, because the scale's gaps are a fifth, a
 * quarter and a third in three different places and subtracting two rems is not a
 * step.
 */
let flooredAt = null
for (let i = 1; i < ordered.length; i += 1) {
  const above = remOf(ordered[i - 1])
  const below = remOf(ordered[i])
  if (below === undefined || above === undefined) continue
  if (below > above) {
    failures.push(
      `${SECTION_ROOT} renders \`${ordered[i]}\` larger than \`${ordered[i - 1]}\`, so a deeper heading is a\n` +
        '    bigger one. A step-down table that rises is a table whose order is a typo rather than a\n' +
        '    decision, and nothing else in the tree would report it.',
    )
  }
  const skipped = STEPS.filter((step) => step.rem > below && step.rem < above)
  if (skipped.length > 0) {
    failures.push(
      `${SECTION_ROOT} renders \`${ordered[i]}\` at ${below}rem and \`${ordered[i - 1]}\` at ${above}rem, which\n` +
        `    skips ${skipped.length} authored step(s) between them: ${skipped.map((s) => `\`${s.name}\``).join(', ')}.\n` +
        '    A descending table is not the same table as a ladder, and the difference is what a reader\n' +
        '    sees between the top two rungs. Every level steps down one authored step or holds at the\n' +
        '    floor; nothing jumps.',
    )
  }
  if (below === above && flooredAt === null) flooredAt = ordered[i]
}

/** Rule 6: the floor is not below the step Body is set at. */
if (flooredAt !== null) {
  const floor = remOf(ordered[ordered.length - 1])
  if (floor !== undefined && floor < BODY.rem) {
    failures.push(
      `${SECTION_ROOT} floors at \`${flooredAt}\`, which is ${floor}rem, below the ${BODY.rem}rem DESIGN.md\n` +
        `    gives Body. A heading at the bottom of the table would render smaller than the copy it\n` +
        '    introduces and read as a caption. Raise the floor or shorten the table.',
    )
  }
}

/** Rule 6: the heading's own decisions are on the heading, not in the table. */
const headingTag = /<Heading[\s\S]{0,400}?className=\{([^}]*)\}/.exec(sectionSource)
if (headingTag === null) {
  failures.push(
    `${SECTION_ROOT} does not give its heading a className this gate can read, so the rule about weight,\n` +
      '  tracking and balance could not be applied.',
  )
} else {
  const expression = headingTag[1]
  for (const shared of ['font-semibold', 'tracking-tight', 'text-balance']) {
    if (expression.includes(shared) === false) {
      failures.push(
        `${SECTION_ROOT} no longer puts \`${shared}\` on the heading.\n` +
          '    It is one of the three things that survive every step of the table, and at the floor it is\n' +
          '    weight and tracking rather than size that tell a heading from body copy.',
      )
    }
  }
  if (expression.includes('headingSizeClass') === false) {
    failures.push(
      `${SECTION_ROOT} gives its heading a className that does not read the table.\n` +
        '    The size has to come from the level it was passed, or the level stops being a typographic\n' +
        '    decision and the page is back to one size at every level.',
    )
  }
}

/** Rule 7: the documentation table is the code table, cell for cell. */
for (const level of LEVELS) {
  const code = TABLE.get(level)
  const doc = DOC.get(level)
  if (doc === undefined) {
    failures.push(
      `${SECTION_ROOT} states no size for \`${level}\` in the JSDoc table on \`SectionHeading\`. The block is\n` +
        '    the documentation source the declaration build preserves and the corpus reads, so a level\n' +
        '    the code sizes and the prose does not is a level a consumer is told nothing about.',
    )
    continue
  }
  if (code === undefined) continue
  if (code.join(' ') === doc.join(' ')) continue
  failures.push(
    `${SECTION_ROOT} renders \`${level}\` at \`${code.join(' ')}\` and documents it at \`${doc.join(' ')}\`.\n` +
      '    The two are the same table written twice and this gate is what holds them in step.',
  )
}

/** Rule 8: `DESIGN.md` gives Display one role, and the section title is not it. */
const roles = hierarchy(readFileSync(DESIGN, 'utf8'))
const display = /- \*\*Display\*\*[\s\S]*?(?=\n- \*\*|\n\n|\n###|$)/.exec(roles)
if (display === null) {
  failures.push(
    `${relativePosix(REPO_ROOT, DESIGN)}'s Hierarchy section has no \`**Display**\` role, so the rule that\n` +
      '    Display holds one role cannot be applied.',
  )
} else if (/section title/i.test(display[0])) {
  failures.push(
    `${relativePosix(REPO_ROOT, DESIGN)}'s Display role names a section title:\n` +
      `      ${display[0].trim()}\n` +
      '    Display is the `h1` and the `h2` is the step below it, so a bullet that gives both to one\n' +
      '    role is the sentence a Component reading one size for every level was written from.',
  )
}

/**
 * Rule 10: the Item document states the ladder the Component renders, once.
 *
 * Read from the whole Item rather than from a slice of it, so a second table in
 * the prose is a finding rather than a row this gate happens to read second, and
 * compared to `HEADING_SIZE` by the same shape rule 7 compares the JSDoc by. The
 * step it expects is never written here: it is the table the Component renders, so
 * a retune of the ladder is a retune of the thing the Item is asked to agree with.
 *
 * The zero-row case fails rather than passing. A rule that only compares rows finds
 * nothing to disagree with in an Item that documents no ladder at all, which is the
 * state a later edit reaches by deleting the table rather than by editing it.
 */
const itemSource = readFileSync(SECTION_ITEM, 'utf8')
const ITEM_ROW = /\|\s*`(h[1-6])`\s*\|\s*`([^`]+)`\s*\|[^|]*\|\s*`([^`]+)`\s*\|/g
const ITEM = new Map()
for (const [, level, base, at] of itemSource.matchAll(ITEM_ROW)) {
  const classes = `${base} ${at}`.trim().split(/\s+/)
  const seen = ITEM.get(level)
  if (seen !== undefined && seen.join(' ') !== classes.join(' ')) {
    failures.push(
      `${ITEM_ROOT} states two different ladders for \`${level}\`: \`${seen.join(' ')}\` and\n` +
        `    \`${classes.join(' ')}\`. A table written twice in one document is the thing this gate\n` +
        '    exists to prevent, and it is the state a reader cannot tell apart from a correct one.',
    )
    continue
  }
  ITEM.set(level, classes)
}
if (ITEM.size === 0) {
  failures.push(
    `${ITEM_ROOT} states no ladder table, so the page a reader reaches to find out what \`as\`\n` +
      '  resolves to documents nothing. A comparison with no rows finds nothing to disagree with,\n' +
      '  which is how an Item reaches this state by deleting the table rather than by editing it.',
  )
} else {
  for (const level of LEVELS) {
    const code = TABLE.get(level)
    const doc = ITEM.get(level)
    if (doc === undefined) {
      failures.push(
        `${ITEM_ROOT} documents no size for \`${level}\`, and the Component renders it at\n` +
          `    \`${(code ?? []).join(' ')}\`. This is the page \`/components/section\` is read on, so a level the\n` +
          '    code sizes and the prose does not is a level a consumer is told nothing about.',
      )
      continue
    }
    if (code === undefined || code.join(' ') === doc.join(' ')) continue
    failures.push(
      `${ITEM_ROOT} documents \`${level}\` at \`${doc.join(' ')}\` and the Component renders it at\n` +
        `    \`${code.join(' ')}\`. The Item is a third copy of the table, and this rule is what holds it in\n` +
        '    step with the other two rather than leaving a reader to spot the difference.',
    )
  }
}

/**
 * The one Block that cannot compose `SectionHeading`, which resolves its own tag.
 *
 * It draws its heading on a filled panel, where this Component's muted description
 * colour and `gap-4` are wrong, so it writes the element and used to write the size
 * with it. The step it may not carry is read out of the table rather than written
 * here, for the reason the whole gate reads the token source rather than listing
 * it: a literal named in a gate is a copy of the scale, and the first version of
 * this check named `text-3xl` and `sm:text-4xl`, which were the Display pair when
 * it was written and are the `h3` pair now that Display has moved. It would have
 * gone on passing over a Block that wrote the current Display step out by hand,
 * which is the exact finding it exists for.
 *
 * **This is a list of one file and it is not the whole population, which is stated
 * rather than implied.** Every Block that resolves its own heading is a candidate
 * and most of them are captions rather than rungs, so the population cannot be
 * read from source. What makes this one holdable is narrower than "the only one":
 * it is the one Block whose heading cannot be composed from `SectionHeading` at
 * all, so there is nothing for it to fall back to and its size has to come from
 * the table. The count of Blocks that resolve a *page-level* heading and have no
 * such excuse is in `docs/quality-gates.md`, and the limit of the scan that took
 * that count is stated in the header above rather than here, because it is a
 * limit of the measurement and not of this rule.
 */
const ctaSource = readFileSync(path.join(REPO_ROOT, CTA_ROOT), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const DISPLAY_STEP = (TABLE.get('h1') ?? []).filter((utility) => utility.startsWith('text-'))
const displayLiteral = DISPLAY_STEP.find((utility) => ctaSource.includes(utility))
if (displayLiteral !== undefined) {
  failures.push(
    `${CTA_ROOT} carries a literal Display step (\`${displayLiteral}\`) on its heading.\n` +
      '  It draws its heading on a filled panel and cannot compose `SectionHeading`, so it asks\n' +
      '  `headingSizeClass` for the size. A second literal here is a second answer to the same question,\n' +
      '  which is how one size reached two surfaces.',
  )
}

const coverage = coverageOf(results)

console.log(
  `\n${NAME}: ${TABLE.size} level(s) in the table, ${failures.length} finding(s), read from ` +
    `${coverage.roots} root(s), ${coverage.files} file(s) matched, ${coverage.unresolved} root(s) unresolved`,
)
console.log(
  `${NAME}: steps judged against the \`text\` group in ${relativePosix(REPO_ROOT, BASE_TOKENS)}: ` +
    `${STEPS.map((step) => `${step.name} ${step.rem}`).join(', ')}; largest \`${LARGEST.name}\`, ` +
    `floor compared against Body at \`${BODY_STEP}\` ${BODY.rem}rem`,
)
console.log(
  `${NAME}: the JSDoc table on \`SectionHeading\` states ${DOC.size} level(s), ${ITEM_ROOT} states ` +
    `${ITEM.size}, and\n  ${relativePosix(REPO_ROOT, DESIGN)} states the roles; all three are read rather than assumed.`,
)
console.log()

if (failures.length > 0) {
  console.error(`\n${NAME}: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error(
    '\nA heading level decides a heading size, the size is a step of the authored scale, and the table is\n' +
      "written three times: the code, the Component's own JSDoc, and the Item that documents it. Fix the\n" +
      'table rather than the gate.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every level has a step, the steps descend to a floor at or above Body, nothing is above\n` +
    `  ${LARGEST.name}, the heading keeps its weight, tracking and balance at every level, the JSDoc and\n` +
    '  the Item both state the table the code renders, and Display holds one role.',
)

/** The smallest authored size a level's base step resolves to, or undefined. */
function remOf(level) {
  const base = (TABLE.get(level) ?? []).find((utility) => utility.startsWith('text-'))
  if (base === undefined) return undefined
  return BY_NAME.get(base.slice('text-'.length))?.rem
}
