/**
 * Elevation / layout grep gate.
 *
 * Ticket 18 makes shadows, breakpoints and container widths authored tokens. This
 * gate fails the build when a second source of truth appears: a raw `box-shadow`,
 * an arbitrary `shadow-[...]` or `max-w-[...]` utility, a `--shadow-` /
 * `--breakpoint-` / `--container-` custom-property declaration outside the token
 * package and the `Section` primitive, a width utility naming a container this
 * repository did not author, or a `shadow-*` utility naming an elevation step the
 * token source did not author.
 *
 * Allowed everywhere: `shadow-xs|sm|md`, `shadow-none`, a `max-w-*` or `w-*` naming
 * one of the container names the token source authors or naming no name at all, the
 * `sm:`/`md:`/`lg:` variants, and `var(--shadow-*)`/`var(--container-*)` reads.
 *
 * **THE DOCS-ONLY `shadow-lg` EXCEPTION WAS HERE AND IT WAS FALSE.** The header used
 * to say the docs-only floating panel "is deliberately allowed", and `DESIGN.md`
 * said no shipped component uses one. Both were wrong: `SearchDialog` shipped
 * `shadow-lg` on its panel, and the site's skip link shipped `focus:shadow-lg`.
 * Nothing here had a rule that could see either, so the sentence described an
 * exemption the gate did not implement. There is no exception now: the elevation
 * scale is authored or it is not used, site apparatus included, because the site's
 * own Tailwind build is a second consumer of the same token package and a skip link
 * resolving `--shadow-lg` out of Tailwind's stock theme is the second source of
 * truth this gate exists to refuse. `SearchDialog` no longer overrides the
 * `shadow-md` its own `DialogContent` already draws, and the skip link draws an
 * authored step.
 *
 * **THE ELEVATION RULE IS THE WIDTH RULE WITH ANOTHER AUTHORITY, AND IT IS
 * STRUCTURED THE SAME WAY ON PURPOSE.** A `shadow-*` step is a name somebody
 * decided, `shadow-md` is authored and `shadow-lg` is not, and the only file that
 * can tell them apart is the token source. So the steps are read from
 * `shadow.tokens.json` rather than listed here, exactly as the container names are
 * read from `layout.tokens.json`, and an empty group fails the run for the same
 * reason: a gate with no authority would report every shadow in the tree.
 *
 * `shadow-none` is allowed and `shadow-inner` is not, and the line between them is
 * the reason `WIDTH_KEYWORDS` exists: `none` is the absence of a shadow and not one
 * more step of it, so a Component that removes an inherited shadow is asking for
 * nothing rather than for a value out of the scale. `inner` is a shadow the token
 * source does not author, so it is a finding, and a Component that wants an inset
 * edge has to ask upstream for one.
 *
 * **THE WIDTH RULE IS THE ONE THIS FILE DID NOT HAVE, AND THE DESCRIPTION ABOVE
 * ALREADY CLAIMED IT.** `DESIGN.md` has said for a while that this gate fails on
 * "the old container literals", and there was no rule that could: the table below
 * had an arbitrary width and a re-declared property and nothing else. So the claim
 * described a protection nobody was checking, which is the same shape of failure as
 * the one `check-breakpoint-variants.mjs` was written for on the other axis. The
 * rule now exists and names every case it fires on.
 *
 * **THE NAMESPACE IT HOLDS CLASSES TO IS CLOSED IN THE TOKEN BUILD.** Tailwind
 * ships thirteen `--container-*` steps of its own and the token build empties the
 * namespace with `--container-*: initial`, so `max-w-6xl` compiles to nothing at all
 * in the shipped stylesheet. Three of those steps were numerically identical to an
 * authored width, which is what made the defect latent rather than visible: nothing
 * rendered differently, so a retune of `--container-page` would have moved every
 * surface reaching the page column by one spelling and left every surface reaching
 * it by the other exactly where it was, with no gate firing. The other half of that
 * pair is checked on the built artefact, in
 * `packages/ui/scripts/check-container-namespace.mjs`, because no source scan can
 * see what a framework did or did not resolve.
 *
 * **A NAME AND AN ARITHMETIC ARE DIFFERENT THINGS, and the rule knows which is
 * which.** `max-w-page` is a width somebody decided and the token source says so.
 * `max-w-96` is `calc(var(--spacing) * 96)`: a multiple of the base unit, used by a
 * chart's axis band, a token table's column and a documentation Demo's frame,
 * where nobody took a decision and naming one would invent it. Tailwind resolves
 * both through the same utility, and the rule judges the shape rather than the
 * spelling: a bare number or a fraction is arithmetic, a word is a name, and a word
 * has to be one this repository authors. The keyword widths (`full`, `fit`, `max`,
 * `min`, `none`, `auto`, `screen`, `prose`, `px`) are declared rather than inferred
 * for the reason `check-typeface.mjs` gives about generics: they are a request to
 * the reader's own box rather than a value out of a scale, so treating them as
 * un-authored names would report ordinary composition as a defect.
 *
 * **Comments are blanked before the width rule reads, and this file's own comment
 * is why.** A JSDoc block that explains that the container namespace is closed, or
 * that quotes the class that was retired, is a record of the retired line and not a
 * class anybody renders. `scripts/check-motion.mjs` blanks comments for the same
 * reason, and `check-breakpoint-variants.mjs` skips them outright; blanking rather
 * than skipping is what keeps the byte offsets in a finding pointing at the line a
 * reader will open. The rule reads a whole line's tokens rather than only a
 * `className=`, because a width held in a `Record` beside the overlays is as much a
 * class as one written inline, which is how `dialog.tsx` and `drawer.tsx` carry
 * theirs.
 *
 * Coverage is asserted, not assumed. ROOTS is resolved against `REPO_ROOT`, which is
 * derived from this file's own location rather than `process.cwd()`, and the two
 * exclusions are absolute paths compared against the walked files rather than
 * normalised relative strings compared against the working directory. A run from
 * the wrong directory used to read 12 files instead of 135 and print a success line
 * no reader could tell from a real one. A root that resolves to nothing fails the
 * run, a run that reads no file fails the run, and the final line states the coverage
 * achieved and names both exclusions, so the scope of a pass is on the line rather
 * than in a comment.
 *
 * `apps/site/items` is a root because that is where the documentation Demos live and
 * where the site's own Tailwind build scans, so a width nobody reads a gate about is
 * a width a reader of a Component page is looking at. `.mdx` is in the extension
 * filter for the same reason: an Item's documentation states class names in prose
 * and code fences, and those reach the shipped sheet.
 *
 * `apps/site/src/generated/**` is written by `generate-demos.mjs` from the Demos in
 * `apps/site/items`, which ARE read. Reading the generated copy would report every
 * Demo's widths twice, at a path nobody edits, and inside a string literal whose
 * escapes make a class name read as `measure-narrow\`. `scripts/check-motion.mjs`
 * excludes the same directory for the same reason and prints how many files it
 * skipped.
 *
 * `scripts/__tests__/**` is this gate's own fixture tree. `packages/ui/test/**` and
 * `scripts/__tests__/**` hold the staged defects every rule here is proved against,
 * and a fixture that spells a retired container name is the fixture's job rather
 * than a defect in the tree. `scripts/check-motion.mjs` excludes
 * `packages/ui/gates/__tests__` for exactly this reason and says so in its own
 * header.
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

const NAME = 'check-elevation-layout'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository root, from this file's own location. Never `process.cwd()`. */
const REPO_ROOT = path.resolve(HERE, '..')

/**
 * One root per line, because two suites read this array out of this file rather
 * than typing a copy of it, and a reader that splits on newlines cannot see a
 * single-line array. `check-dashes.mjs` and `check-motion.mjs` are shaped the same
 * way for the same reason.
 */
const ROOTS = [
  'apps/site/src',
  'apps/site/items',
  'packages/ui/src',
  'scripts',
]
const EXT = /\.(tsx?|jsx?|mjs|css|mdx)$/

/**
 * This file necessarily contains the patterns it searches for. Absolute, because
 * a relative comparison depends on the working directory and a gate that stops
 * excluding itself is a gate nobody notices failing.
 */
const SELF = path.join(REPO_ROOT, 'scripts', 'check-elevation-layout.mjs')

/** `Section` owns the container contract; the ticket exempts it explicitly. */
const SECTION = path.join(REPO_ROOT, 'packages', 'ui', 'src', 'components', 'ui', 'section.tsx')

/** Generated, never authored. Written from the Demos in `apps/site/items`, which is read. */
const GENERATED = path.join(REPO_ROOT, 'apps', 'site', 'src', 'generated')

/** This gate's own fixtures, which spell the banned patterns on purpose. */
const FIXTURES = path.join(HERE, '__tests__')

const EXCLUSIONS = [
  `${relativePosix(REPO_ROOT, SELF)} (this gate's own rule table)`,
  `${relativePosix(REPO_ROOT, SECTION)} (owns the container contract)`,
  `${relativePosix(REPO_ROOT, GENERATED)}/** (written by generate-demos.mjs from apps/site/items, which is read)`,
  `${relativePosix(REPO_ROOT, FIXTURES)}/** (this gate's own staged defects, which spell the retired names on purpose)`,
]

/** The authored container names, read from the token source rather than listed here. */
const LAYOUT_TOKENS = path.join(REPO_ROOT, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json')

/** The authored shadow steps, read from the same tier's other file. */
const SHADOW_TOKENS = path.join(REPO_ROOT, 'packages', 'tokens', 'src', 'foundation', 'shadow.tokens.json')

/**
 * The keyword widths `w-*` and `max-w-*` accept, declared.
 *
 * Each names a property of the reader's own box rather than a value out of a scale:
 * `full` is the containing block, `fit` is the content, `max-content` and
 * `min-content` are the two intrinsic sizes, `none` removes the cap, `screen` is the
 * viewport and `px` is a single pixel. A rule that treated any of them as an
 * un-authored container name would report ordinary composition as a defect, and a
 * rule with no list at all would report all eight.
 */
const WIDTH_KEYWORDS = new Set([
  'auto',
  'fit',
  'full',
  'max',
  'min',
  'none',
  'prose',
  'px',
  'screen',
])

/**
 * The container names this repository authors, from the token source.
 *
 * Read rather than listed, for the reason `check-breakpoint-variants.mjs` reads its
 * screens from `layout.tokens.json`: a gate whose subject is the authored scale
 * cannot be answered by a list kept beside the gate, because that list is the second
 * copy the gate exists to prevent. It also means adding a container to the token
 * source widens this rule without editing this file.
 *
 * A missing or empty group fails the run rather than emptying the rule. A gate that
 * read nothing would judge every width name in the tree as un-authored, which is a
 * loud failure rather than a quiet pass, but a loud failure on a missing authority
 * is still the wrong reason to be red.
 */
function authoredContainers() {
  const group = JSON.parse(readFileSync(LAYOUT_TOKENS, 'utf8')).container ?? {}
  const names = Object.keys(group).filter((name) => !name.startsWith('$'))
  if (names.length === 0) {
    console.error(
      `\n${NAME}: the authored \`container\` group in ${relativePosix(REPO_ROOT, LAYOUT_TOKENS)} is empty, so ` +
        'every width name in the tree would read as un-authored. This run has no authority to judge a ' +
        'width against, so it fails rather than reporting every class it reads.',
    )
    process.exit(1)
  }
  return new Set(names)
}

/**
 * The authored shadow steps, read from the token source rather than listed here.
 *
 * Same reasoning as `authoredContainers()`, and the same reason it is a separate
 * read rather than one more entry in the width rule: the question is whether a
 * `shadow-*` name is a step this repository authored, and only the token source
 * can answer that. Adding a fourth step to `shadow.tokens.json` widens the rule
 * without editing this file.
 *
 * A missing or empty group fails the run for the same reason the container group
 * does: a gate with no authority would judge every shadow in the tree as
 * un-authored, which is a loud failure on the right tree for the wrong reason.
 */
function authoredShadows() {
  const group = JSON.parse(readFileSync(SHADOW_TOKENS, 'utf8')).shadow ?? {}
  const names = Object.keys(group).filter((name) => !name.startsWith('$'))
  if (names.length === 0) {
    console.error(
      `\n${NAME}: the authored \`shadow\` group in ${relativePosix(REPO_ROOT, SHADOW_TOKENS)} is empty, so ` +
        'every shadow step in the tree would read as un-authored. This run has no authority to judge a ' +
        'shadow against, so it fails rather than reporting every class it reads.',
    )
    process.exit(1)
  }
  return new Set(names)
}

/**
 * The shadow names that are a reset rather than a step.
 *
 * `none` is the absence of a shadow and is not a value out of the elevation scale,
 * which is the same distinction `WIDTH_KEYWORDS` draws for `full` and `auto`: a
 * request to draw nothing is not a request for one more step. `input-group.tsx`
 * ships `shadow-none` and would be reported as a defect without this line.
 *
 * `inner` is NOT here. It is a shadow, it is not authored, and a Component that
 * wants an inset edge has no authored way to ask for one, so it is a finding. That
 * is the honest direction: the rule names what it would take to make it not one.
 */
const SHADOW_KEYWORDS = new Set(['none'])

/**
 * Every `shadow-<name>` on one line, with the utility it was read from.
 *
 * The boundary is the width rule's, for the width rule's reasons: `scripts/` is a
 * root and its own rule tables carry a `shadow-` inside regular expressions and
 * inside quoted prose, and a boundary of "any character" would read all of it. A
 * colon is a separator as well as a boundary so `focus:shadow-lg` is read as the
 * utility it is.
 */
const SHADOW_UTILITY = /(?:^|[\s"'`:])((?:[a-z][\w-]*:)*!?)shadow-([^\s"'`]+)/g

/** A bare number, an arbitrary or property-shaped value, or a glob. */
const isShape = (name) => /^[[(*#]/.test(name)

function shadowNames(line) {
  const found = []
  for (const match of line.matchAll(SHADOW_UTILITY)) {
    const utility = `${match[1]}shadow-${match[2]}`.replace(/^!/, '')
    // The trailing punctuation of a sentence in a comment, and the closing
    // bracket of a call, are not part of the utility and would make an authored
    // name read as an un-authored one.
    const name = match[2].replace(/[),.;:'"`]+$/, '')
    found.push({ name, utility: lastSegment(utility).replace(/^shadow-/, '') })
  }
  return found
}

/**
 * Replace every comment with spaces, keeping every byte position.
 *
 * Spaces rather than removal so a finding's column still names the same place in
 * the text a reader opens, and because the other rules read raw lines where a
 * comment is a legitimate place to state a banned pattern as a matter of course.
 */
function blankComments(source) {
  let out = ''
  let i = 0
  while (i < source.length) {
    if (source[i] === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      const stop = end === -1 ? source.length : end
      out += ' '.repeat(stop - i)
      i = stop
      continue
    }
    if (source[i] === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      const stop = end === -1 ? source.length : end + 2
      out += source.slice(i, stop).replace(/[^\n]/g, ' ')
      i = stop
      continue
    }
    out += source[i]
    i += 1
  }
  return out
}

/** The colons between variant segments, ignoring the ones brackets and parens carry. */
function lastSegment(utility) {
  let depth = 0
  let cut = -1
  for (let i = 0; i < utility.length; i += 1) {
    const char = utility[i]
    if (char === '[' || char === '(') depth += 1
    else if (char === ']' || char === ')') depth -= 1
    else if (char === ':' && depth === 0) cut = i
  }
  return cut === -1 ? utility : utility.slice(cut + 1)
}

/** A bare number, a fraction, an arbitrary or property-shaped value, or a glob. */
const isArithmetic = (name) =>
  /^\d+(\.\d+)?$/.test(name) || /^\d+\/\d+$/.test(name) || /^[[(*]/.test(name)

/**
 * Every `max-w-*` and bare `w-*` name on one line.
 *
 * The boundary before the utility is whitespace, a quote or a colon, and the only
 * thing allowed between the boundary and the utility is a chain of variant segments
 * spelled as words. Both halves are load-bearing and the obvious wider version of
 * this is wrong in a way that has already shown up here:
 *
 *   - A boundary of "any character" would read `scripts/check-motion.mjs`'s own rule
 *     table, where a banned pattern is spelled out as a regular expression and a
 *     `w-` sits inside `(?:...|motion-reduce)` with a `)` in front of it.
 *   - A boundary of `\b` would read `min-w-48` and `grow-w-full`, because the hyphen
 *     in front of the `w` is a word boundary.
 *
 * A colon is a boundary as well as a separator so a `data-[state=open]:max-w-sm`
 * variant is read as the utility it is, with its name off the last segment. The
 * important modifier is part of the utility rather than a separate token, so
 * `!max-w-6xl` is read as `max-w-6xl` and judged the same way.
 */
const WIDTH_UTILITY = /(?:^|[\s"'`:])((?:[a-z][\w-]*:)*!?(?:max-)?w-)([^\s"'`]+)/g

/**
 * The width names a line carries, with the utility each was read from.
 *
 * Returned rather than reported so the caller decides which of them is a finding,
 * and so the count of names read is a number the run can print: a tree with no
 * `w-` or `max-w-` in it is a tree this rule cannot see, and a run that judged
 * nothing has to say so rather than print a clean line.
 */
function widthNames(line) {
  const found = []
  for (const match of line.matchAll(WIDTH_UTILITY)) {
    const utility = `${match[1]}${match[2]}`.replace(/^!/, '')
    found.push({ name: lastSegment(utility).replace(/^(?:max-)?w-/, ''), utility })
  }
  return found
}

const RULES = [
  {
    pattern: /box-shadow\s*:/,
    message: 'raw `box-shadow:` — author or consume a --shadow-* token instead',
  },
  {
    pattern: /\b(?:drop-)?shadow-\[/,
    message: 'arbitrary shadow utility `shadow-[...]` / `drop-shadow-[...]` — author a shadow token instead',
  },
  {
    pattern: /max-w-\[/,
    message: 'arbitrary `max-w-[...]` — name a container this repository authors instead',
  },
  {
    pattern: /--(?:shadow|breakpoint|container)-[^\s:;]+\s*:/,
    message: 'a second source of truth for --shadow-/--breakpoint-/--container-',
    except: SECTION,
  },
]

let violations = 0
let scanned = 0
let widthsRead = 0
let shadowsRead = 0
let generated = 0
let fixtures = 0

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })

try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { scriptName: NAME, extensions: EXT })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

const CONTAINERS = authoredContainers()
const SHADOWS = authoredShadows()

for (const result of results) {
  for (const file of result.files) {
    if (file === SELF) continue
    if (file.startsWith(GENERATED + path.sep)) {
      generated += 1
      continue
    }
    if (file.startsWith(FIXTURES + path.sep)) {
      fixtures += 1
      continue
    }
    scanned += 1
    const shown = relativePosix(REPO_ROOT, file)
    const source = readFileSync(file, 'utf8')
    const lines = source.split('\n')
    const readable = blankComments(source).split('\n')
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.except && file === rule.except) continue
        if (!rule.pattern.test(line)) continue
        violations += 1
        console.error(`  ${shown}:${index + 1}  ${rule.message}`)
        console.error(`      ${line.trim()}`)
      }

      for (const { name, utility } of widthNames(readable[index])) {
        widthsRead += 1
        if (isArithmetic(name) || WIDTH_KEYWORDS.has(name) || CONTAINERS.has(name)) continue
        violations += 1
        console.error(`  ${shown}:${index + 1}  \`${utility}\` names the width \`${name}\`, which the token package does not author`)
        console.error(
          `      Tailwind's own container namespace is closed in the token build, so this utility compiles to ` +
            `nothing and the element takes no cap at all. Containers this repository authors: ` +
            `${[...CONTAINERS].sort().join(', ')}; a bare number is arithmetic on --spacing and is not a name.`,
        )
      }

      for (const { name, utility } of shadowNames(readable[index])) {
        shadowsRead += 1
        if (isShape(name) || SHADOW_KEYWORDS.has(name) || SHADOWS.has(name)) continue
        violations += 1
        console.error(
          `  ${shown}:${index + 1}  \`shadow-${utility}\` names an elevation step the token package does not author`,
        )
        console.error(
          `      The token package emits --shadow-md and not --shadow-${utility}, so this utility resolves ` +
            `against Tailwind's own theme: the elevation a reader sees is a value the token source does not ` +
            `own and a retune of the shadow scale will not move it. Shadow steps this repository authors: ` +
            `${[...SHADOWS].sort().join(', ')}; and \`shadow-none\`, which is a reset rather than a step.`,
        )
      }
    })
  }
}

const coverage = coverageOf(results)
const containers = [...CONTAINERS].sort().join(', ')

console.log(
  `\nelevation-layout: ${violations} violation(s) in ${scanned} file(s) read from ` +
    `${coverage.roots} root(s), ${coverage.files} file(s) matched, ` +
    `${coverage.unresolved} root(s) unresolved`,
)
console.log(
  `elevation-layout: ${widthsRead} width name(s) judged against the container group in ` +
    `${relativePosix(REPO_ROOT, LAYOUT_TOKENS)}: ${containers}`,
)
console.log(
  `elevation-layout: ${shadowsRead} shadow name(s) judged against the shadow group in ` +
    `${relativePosix(REPO_ROOT, SHADOW_TOKENS)}: ${[...SHADOWS].sort().join(', ')}`,
)
console.log(`elevation-layout: excluded from every rule: ${EXCLUSIONS.join(', ')}`)
console.log(
  `elevation-layout: ${generated} generated file(s) skipped under ${relativePosix(REPO_ROOT, GENERATED)}, ` +
    `${fixtures} fixture file(s) skipped under ${relativePosix(REPO_ROOT, FIXTURES)}`,
)

if (widthsRead === 0) {
  violations += 1
  console.error(
    `\n  no \`w-*\` or \`max-w-*\` name was read in ${scanned} file(s), so this run has judged nothing. ` +
      'A tree that carries no width at all is a tree this rule cannot see, and printing a clean line over ' +
      'it is the failure this replaces.',
  )
}

if (shadowsRead === 0) {
  violations += 1
  console.error(
    `\n  no \`shadow-*\` name was read in ${scanned} file(s), so the elevation rule judged nothing. ` +
      'A tree that draws no elevation at all is a tree this rule cannot see, and the rule above reports ' +
      'nothing because there was nothing to report rather than because the rule is satisfied.',
  )
}

if (violations > 0) {
  console.error(
    '\nElevation, breakpoints and containers are authored in packages/tokens. ' +
      'Consume the bound utilities or the var(--shadow-*)/var(--container-*) tokens.',
  )
  process.exit(1)
}
