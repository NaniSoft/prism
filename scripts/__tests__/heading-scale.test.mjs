/**
 * `check-heading-scale`, run against staged trees, once per rule.
 *
 * **The defect this gate's proof exists for was invisible to every other gate.**
 * `SectionHeading` wrote one class string for all six levels, so an `h1` and an
 * `h2` came out byte-identical. The outline was right, the alignment was right,
 * every Block forwarded its `headingLevel` faithfully, and the size was a constant
 * inside a Component. Nothing in the tree could see it, which is the same shape of
 * failure as a gate table that names a gate which does not exist: green, believed,
 * and not checking anything.
 *
 * **So every rule is proved against a staged tree rather than asserted.** The gate
 * is copied, not reimplemented, into a directory that is not the repository, with a
 * hand-written token source, `DESIGN.md` and `section.tsx` beside it, so what runs
 * is the shipped file reading a tree this test controls. Each case below stages one
 * defect and asserts the gate is red for the reason that defect implies, and the
 * last case stages the table the Component actually ships and asserts green, so a
 * gate that failed on everything would fail this suite too.
 *
 * Run: node --test "scripts/__tests__/*.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const SCRIPT_DIR = path.join(REPO, 'scripts')
const GATE = path.join(SCRIPT_DIR, 'check-heading-scale.mjs')
const SECTION = path.join(REPO, 'packages', 'ui', 'src', 'components', 'ui', 'section.tsx')
const TOKENS = path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'base.tokens.json')
const DESIGN = path.join(REPO, 'DESIGN.md')
const CTA = path.join(REPO, 'packages', 'ui', 'src', 'blocks', 'cta-01', 'cta.tsx')

/**
 * The token source the gate judges against, read from this repository and copied.
 *
 * Copied rather than restated because the gate's whole claim is that it reads the
 * authored scale, and a fixture that hand-wrote the same numbers would let a gate
 * that stopped reading pass every case below.
 */
const REAL_TOKENS = readFileSync(TOKENS, 'utf8')

/** The table the shipped Component renders, read from the shipped Component. */
const REAL_TABLE = /const HEADING_SIZE[\s\S]*?\n}/.exec(readFileSync(SECTION, 'utf8'))[0]

/** The JSDoc table the shipped Component documents, read from the shipped Component. */
const REAL_DOC = readFileSync(SECTION, 'utf8').slice(
  readFileSync(SECTION, 'utf8').lastIndexOf('/**', readFileSync(SECTION, 'utf8').indexOf('export function SectionHeading')),
)

/** The Hierarchy section `DESIGN.md` ships, read from the shipped document. */
const REAL_HIERARCHY = (() => {
  const markdown = readFileSync(DESIGN, 'utf8')
  const start = markdown.indexOf('### Hierarchy')
  return markdown.slice(start, markdown.indexOf('\n### ', start + 1))
})()

/**
 * The shipped `section.tsx` with one defect staged into it.
 *
 * `section.tsx` is read whole and each substitution is a literal replace of a
 * string read out of the same file, so the staged file is the real Component with
 * one thing wrong rather than a small imitation of it. A fixture that only contained
 * the table would leave the heading element, the JSDoc and the map's own shape
 * untested, which is three of the nine rules.
 */
function sectionWith({ table, doc, heading }) {
  let source = readFileSync(SECTION, 'utf8')
  if (table !== undefined) source = source.replace(REAL_TABLE, table)
  if (doc !== undefined) source = source.replace(REAL_DOC, doc)
  if (heading !== undefined) source = source.replace(REAL_HEADING, heading)
  return source
}

/** The heading element as the shipped Component writes it. */
const REAL_HEADING = /<Heading\n\s+id=\{id\}\n\s+className=\{[^}]*\}\n\s*>/.exec(readFileSync(SECTION, 'utf8'))[0]

/** The heading element with the size and nothing else on it. */
const BARE_HEADING = REAL_HEADING.replace(
  /className=\{[^}]*\}/,
  'className={headingSizeClass(Heading)}',
)

/**
 * Stage a tree the gate can read, and return the gate's path inside it.
 *
 * The gate resolves its roots from its own location rather than the working
 * directory, so staging it under `<dir>/scripts` and running it from `<dir>` is the
 * only way to point it at a tree this test controls.
 */
function stage({ section, cta, design, tokens }) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-heading-'))
  const scripts = path.join(dir, 'scripts')
  mkdirSync(path.join(scripts, 'lib'), { recursive: true })
  copyFileSync(GATE, path.join(scripts, 'check-heading-scale.mjs'))
  copyFileSync(path.join(SCRIPT_DIR, 'lib', 'walk.mjs'), path.join(scripts, 'lib', 'walk.mjs'))

  const write = (relative, contents) => {
    const file = path.join(dir, relative)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, contents)
  }

  write('packages/ui/src/components/ui/section.tsx', section)
  write('packages/ui/src/blocks/cta-01/cta.tsx', cta ?? readFileSync(CTA, 'utf8'))
  write('packages/tokens/src/foundation/base.tokens.json', tokens ?? REAL_TOKENS)
  write('DESIGN.md', design ?? `## Typography\n\n${REAL_HIERARCHY}\n\n## Layout\n`)

  return { dir, gate: path.join(scripts, 'check-heading-scale.mjs') }
}

const run = (gate, cwd) => spawnSync(process.execPath, [gate], { cwd, encoding: 'utf8' })

test('the shipped Component passes the gate it is the subject of', () => {
  // The control every other case needs. A gate that failed on everything would
  // satisfy "it fires on the defect" and mean nothing.
  const { dir, gate } = stage({ section: readFileSync(SECTION, 'utf8') })

  const result = run(gate, dir)

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /6 level\(s\) in the table, 0 finding\(s\)/)
  assert.match(result.stdout, /largest `4xl`/)
  assert.match(result.stdout, /the JSDoc table on `SectionHeading` states 6 level\(s\)/)
})

test('it fails on one class string written for all six levels', () => {
  // The defect as it shipped, staged as a table rather than as an absence: a
  // uniform table is flat, and flat is not descending, so the rule that fires here
  // is the top-two one and not the descent rule. That is the whole reason that
  // rule exists and this case is why it is here.
  const { dir, gate } = stage({
    section: sectionWith({
      table: [
        'const HEADING_SIZE: Record<HeadingLevel, string> = {',
        ...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(
          (level) => `  ${level}: 'text-3xl sm:text-4xl',`,
        ),
        '}',
      ].join('\n'),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /renders `h1` and `h2` at one step, 1\.875rem/)
  assert.match(result.stderr, /the defect\s+this gate exists for/)
  assert.doesNotMatch(result.stdout, /0 finding\(s\)/)
})

test('it fails when a step is not one the token source authors', () => {
  const { dir, gate } = stage({
    section: sectionWith({
      table: REAL_TABLE.replace("h3: 'text-xl sm:text-2xl',", "h3: 'text-7xl sm:text-2xl',"),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /naming the size `7xl`, which the token\s+source does not author/)
  assert.match(result.stderr, /Steps this repository authors: mono, xs, sm, base, lg, xl, 2xl, 3xl, 4xl/)
})

test('it fails when a level deeper than the page heading renders above it', () => {
  // The half of the ceiling rule that adding a level could break. No authored step
  // exists above `4xl`, so before this rule a deeper level could only invert the
  // hierarchy by using a step that is already authored, which is exactly what a
  // retune of the table would do.
  const { dir, gate } = stage({
    section: sectionWith({
      table: REAL_TABLE.replace("h3: 'text-xl sm:text-2xl',", "h3: 'text-4xl sm:text-4xl',"),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /renders `h3` at 2\.25rem, above the 1\.875rem it renders `h1` at/)
})

test('it fails when the table stops reaching the largest authored step', () => {
  // The other half: DESIGN.md's ceiling is a fact about the scale, and a heading
  // table that never reaches it has retuned the page heading without anybody asking.
  const { dir, gate } = stage({
    section: sectionWith({
      table: REAL_TABLE.replace("h1: 'text-3xl sm:text-4xl',", "h1: 'text-3xl sm:text-3xl',"),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /never reaches `4xl`, the largest step the token source authors/)
})

test('it fails when the table floors below the step Body is set at', () => {
  const { dir, gate } = stage({
    section: sectionWith({
      table: REAL_TABLE
        .replace("h4: 'text-lg sm:text-xl',", "h4: 'text-base sm:text-lg',")
        .replace("h5: 'text-lg sm:text-xl',", "h5: 'text-base sm:text-lg',")
        .replace("h6: 'text-lg sm:text-xl',", "h6: 'text-base sm:text-lg',"),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /floors at `h5`, which is 1rem, below the 1\.125rem DESIGN\.md\s+gives Body/)
  assert.match(result.stderr, /read as a caption/)
})

test('it fails when the JSDoc table and the code table disagree', () => {
  // The half of the defect that reached a consumer: the Component rendered one
  // thing and its documentation, which the declaration build preserves and the
  // corpus reads, promised another.
  const { dir, gate } = stage({
    section: sectionWith({
      doc: REAL_DOC.replace('| `h3` | `text-xl` |', '| `h3` | `text-2xl` |'),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /renders `h3` at `text-xl sm:text-2xl` and documents it at `text-2xl sm:text-2xl`/)
})

test('it fails when the heading stops carrying its weight, tracking or balance', () => {
  const { dir, gate } = stage({ section: sectionWith({ heading: BARE_HEADING }) })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /no longer puts `font-semibold` on the heading/)
  assert.match(result.stderr, /no longer puts `text-balance` on the heading/)
})

test('it fails when the heading stops reading the table for its size', () => {
  const { dir, gate } = stage({
    section: sectionWith({
      heading: REAL_HEADING.replace(
        /className=\{[^}]*\}/,
        "className={cn('font-semibold tracking-tight text-balance', 'text-3xl sm:text-4xl')}",
      ),
    }),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /className that does not read the table/)
  assert.match(result.stderr, /the level stops being a typographic\s+decision/)
})

test("it fails when DESIGN.md gives Display the section title as well as the h1", () => {
  // The sentence the defect sat in, staged verbatim from the shape the issue
  // reported, so the gate holds the claim rather than the Component.
  const { dir, gate } = stage({
    section: readFileSync(SECTION, 'utf8'),
    design: [
      '## Typography',
      '',
      '### Hierarchy',
      '',
      '- **Display** (600, 1.875rem / 1.2, -0.025em): section titles, the CTA banner',
      '  heading, and every page `h1`. It steps up to 2.25rem at `sm` and carries',
      '  `text-balance`. Nothing in the system goes above `4xl`.',
      '- **Title** (600, 1.5rem / 1.333, -0.025em): a block detail `h1`, stat values',
      '  and plan prices. A card title uses `font-semibold` at the inherited size.',
      '',
      '## Layout',
      '',
    ].join('\n'),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /Display role names a section title/)
  assert.match(result.stderr, /a bullet that gives both to one/)
})

test('it fails when the one Block outside SectionHeading keeps its own literal step', () => {
  const { dir, gate } = stage({
    section: readFileSync(SECTION, 'utf8'),
    cta: readFileSync(CTA, 'utf8').replace(
      "className={cn('max-w-measure font-semibold tracking-tight text-balance', headingSizeClass(headingLevel))}",
      'className="max-w-measure text-3xl font-semibold tracking-tight text-balance sm:text-4xl"',
    ),
  })

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /carries a literal Display step on its heading/)
  assert.match(result.stderr, /a second answer to the same question/)
})

test('it fails when a configured root does not resolve, naming both causes', () => {
  // Habit 2 of `scripts/__tests__/gates.test.mjs`, for this gate. A root that is a
  // file is what makes the claim falsifiable here: rename `section.tsx` and this
  // gate has to say so rather than judge nothing.
  const { dir, gate } = stage({ section: readFileSync(SECTION, 'utf8') })
  const staged = path.join(dir, 'packages', 'ui', 'src', 'components', 'ui', 'section.tsx')
  writeFileSync(staged, readFileSync(staged, 'utf8').replace('HEADING_SIZE', 'renamed'))

  const result = run(gate, dir)

  // The file is still there and the table is now called something else, so the
  // failure is the one about the subject rather than about a missing root. Asserted
  // here so this file's claim about root coverage is not taken on trust below.
  assert.equal(result.status, 1)
  assert.match(result.stderr, /has no `HEADING_SIZE` map/)
})

test('it reads the same coverage from a working directory that is not the root', () => {
  // Habit 1. Roots resolve from the gate's own location, so the caller's working
  // directory cannot change what it reads.
  const fromPackage = run(GATE, path.join(REPO, 'packages', 'ui'))
  const fromRoot = run(GATE, REPO)

  assert.equal(fromPackage.status, 0, fromPackage.stderr)
  assert.equal(fromPackage.stdout, fromRoot.stdout)
  assert.match(fromRoot.stdout, /4 root\(s\), 4 file\(s\) matched, 0 root\(s\) unresolved/)
})