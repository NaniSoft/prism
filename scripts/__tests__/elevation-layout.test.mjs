/**
 * The elevation and layout gate, run as a process over the real tree and over staged
 * defects.
 *
 * **The property under test is not "the gate passes".** It is that every shape the
 * gate is supposed to catch still fires, and that every shape it is supposed to leave
 * alone still passes, INCLUDING the pairs that are one edit away from each other. A
 * gate proven only on the clean repository has been shown to read nothing, because
 * reading nothing and finding nothing print the same line.
 *
 * **The width rule is the one this gate did not have until now, and it is the one
 * with a shape it must not report.** `DESIGN.md` has claimed for a while that this
 * gate fails on "the old container literals"; there was no rule that could, and the
 * three that did exist were about shadows, arbitrary values and re-declared
 * properties. The new rule has to tell four things apart on one line: a width
 * somebody decided (`max-w-page`), an arithmetic multiple of the base unit
 * (`max-w-96`), a keyword that names the reader's own box (`max-w-full`), and a
 * retired name that now resolves to nothing (`max-w-6xl`). The passing cases below
 * are as load-bearing as the failing ones, because a rule too wide reports ordinary
 * composition as a defect and gets switched off within a week.
 *
 * **The gate is spawned, never imported**, for the reason `scripts/__tests__/motion.test.mjs`
 * gives: a test that imports a script whose whole body is its run would run it at
 * import time and then assert on the module it got back. It resolves its roots from
 * its own location, so a case is a temporary directory rather than a mutation of this
 * repository, and a case that drops a root cannot damage the checkout.
 *
 * **The roots the staged trees are built from are read out of the gate**, by the same
 * reasoning `motion.test.mjs` gives for `check-motion`: a hard-coded root list in a
 * test about coverage is a second list that drifts, and adding a root to the gate
 * would leave every case here failing on a missing directory rather than on the rule
 * it exists to prove. The token source is staged beside them because the width rule
 * reads the authored container names from it, and a gate whose subject is the
 * authored scale must not be handed that scale by the test.
 *
 * Run: node --test "scripts/__tests__/elevation-layout.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const SCRIPT_DIR = path.join(REPO, 'scripts')
const GATE = path.join(SCRIPT_DIR, 'check-elevation-layout.mjs')

const relative = (file) => path.relative(REPO, file).split(path.sep).join('/')

/**
 * Every root the gate declares, read out of the gate rather than typed here.
 *
 * The array literal is sliced between its own two neighbouring declarations, because
 * the gate declares `ROOTS` immediately above `EXT` and a slice bounded on `ROOTS`
 * alone would run off the end of the file.
 */
function declaredRoots() {
  const source = readFileSync(GATE, 'utf8')
  const block = source.slice(source.indexOf('const ROOTS = ['), source.indexOf('const EXT ='))
  return block
    .split('\n')
    .filter((line) => /^ {2}'[a-zA-Z]/.test(line))
    .map((line) => line.trim().replace(/'/g, '').replace(/,$/, ''))
}

/** The container names the gate judges against, so a case cannot drift from them. */
const CONTAINERS = Object.keys(
  JSON.parse(
    readFileSync(path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json'), 'utf8'),
  ).container,
).filter((name) => !name.startsWith('$'))

/** The shadow steps the gate judges against, read from the same tier's other file. */
const SHADOWS = Object.keys(
  JSON.parse(
    readFileSync(path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'shadow.tokens.json'), 'utf8'),
  ).shadow,
).filter((name) => !name.startsWith('$'))

const SECTION = 'packages/ui/src/components/ui/section.tsx'

/**
 * A temporary repository holding the gate, every declared root, the authored token
 * source, and one case file per root.
 *
 * Each root gets a clean file carrying a width this gate accepts, so a case fails
 * because of the one class string it changed rather than because the root it changed
 * was the only file there. The files are created rather than left empty because a
 * run that read no file fails on its own assertions, which is right and is not what
 * these cases are about.
 */
function stage(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-elevation-'))
  mkdirSync(path.join(dir, 'scripts', 'lib'), { recursive: true })
  cpSync(GATE, path.join(dir, 'scripts', 'check-elevation-layout.mjs'))
  cpSync(path.join(SCRIPT_DIR, 'lib', 'walk.mjs'), path.join(dir, 'scripts', 'lib', 'walk.mjs'))
  mkdirSync(path.join(dir, 'packages', 'tokens', 'src', 'foundation'), { recursive: true })
  cpSync(
    path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json'),
    path.join(dir, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json'),
  )
  // The elevation rule reads its authority from the shadow group, and a gate whose
  // subject is the authored scale must not be handed that scale by the test.
  cpSync(
    path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'shadow.tokens.json'),
    path.join(dir, 'packages', 'tokens', 'src', 'foundation', 'shadow.tokens.json'),
  )
  mkdirSync(path.join(dir, 'packages', 'ui', 'src', 'components', 'ui'), { recursive: true })
  mkdirSync(path.join(dir, 'apps', 'site', 'items'), { recursive: true })
  mkdirSync(path.join(dir, 'apps', 'site', 'src'), { recursive: true })
  mkdirSync(path.join(dir, 'scripts'), { recursive: true })

  const write = (to, text) => {
    const full = path.join(dir, to)
    mkdirSync(path.dirname(full), { recursive: true })
    writeFileSync(full, text)
  }
  // Each probe carries one authored width and one authored shadow step, so a case
  // fails because of the one class string it changed rather than because the rule
  // it is about had nothing to read. The gate fails a run that judged nothing on
  // either axis, so a staged tree with only widths in it is a tree every case in
  // this file would fail for a reason of its own making. The files are created
  // rather than left empty because a run that read no file fails on its own
  // assertions, which is right and is not what these cases are about.
  write(
    'packages/ui/src/probe.tsx',
    "export const PROBE = 'flex max-w-page shadow-sm items-center gap-2'\n",
  )
  write(
    'apps/site/src/probe.tsx',
    "export const SITE = 'flex max-w-measure shadow-sm flex-col gap-4'\n",
  )
  write(
    'apps/site/items/probe.tsx',
    "export const DEMO = 'flex max-w-overlay-dialog shadow-sm flex-col gap-4'\n",
  )
  write(
    'scripts/probe.mjs',
    "export const GATE_SCRIPT = 'w-full max-w-measure-narrow shadow-xs'\n",
  )

  for (const [to, text] of Object.entries(files)) write(to, text)
  return dir
}

/**
 * Run the gate INSIDE a staged tree.
 *
 * The staged copy, never this repository's, and the working directory set to the
 * staged root. The gate resolves `REPO_ROOT` from its own location, so running this
 * repository's copy with a different working directory would read this repository
 * and judge a tree nobody staged, which is how a suite of cases can all pass while
 * proving nothing.
 */
const runOver = (dir) =>
  spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-elevation-layout.mjs')], {
    cwd: dir,
    encoding: 'utf8',
  })


const CLASS = (classes) => [
  "import { cn } from '../../lib/utils'",
  '',
  'export function UnderTest({ className }: { className?: string }) {',
  `  return <div className={cn('flex flex-col', '${classes}', className)} />`,
  '}',
  '',
].join('\n')

const underTest = (classes) => ({ 'packages/ui/src/components/ui/under-test.tsx': CLASS(classes) })

/* ── Cases that must FAIL ───────────────────────────────────────────────────── */

const WIDTH_CASES = [
  ['the step that spelled the page column', 'max-w-6xl'],
  ['a step whose value is the reading measure', 'max-w-2xl'],
  ['a step whose value is the narrow measure', 'max-w-xl'],
  ['an overlay width the token source never authored', 'max-w-md'],
  ['a container name this repository invented', 'max-w-measure-wide'],
  ['a container name one word away from an authored one', 'max-w-measure-narrows'],
  ['the same name under a responsive variant', 'lg:max-w-6xl'],
  ['the same name under a state variant', 'data-[state=open]:max-w-3xl'],
  ['the same name marked important', '!max-w-7xl'],
  ['a bare `w-` naming a retired step', 'w-5xl'],
  ['a name that is a Tailwind step this Tailwind has dropped', 'max-w-8xl'],
]

for (const [what, classes] of WIDTH_CASES) {
  test(`elevation-layout fails ${what}: ${classes}`, () => {
    const result = runOver(stage(underTest(classes)))

    assert.equal(result.status, 1)
    assert.match(result.stderr, /under-test\.tsx:\d+ {2}`[^`]*` names the width/)
    assert.match(result.stderr, /which the token package does not author/)
    // The message has to name both answers, or a reader cannot act on it: what to
    // use instead, and what a bare number is.
    assert.match(result.stderr, /Containers this repository authors: measure, measure-narrow/)
    assert.match(result.stderr, /a bare number is arithmetic on --spacing and is not a name/)
    assert.match(result.stdout, /elevation-layout: \d+ violation\(s\)/)
  })
}

test('elevation-layout names the retired name rather than a phrase about it', () => {
  const result = runOver(stage(underTest('max-w-6xl')))

  // The class the shipped sheet used to carry, named exactly, so a reader can grep
  // for it. A message that said "a Tailwind container step" would leave the search
  // to whoever had to do it.
  assert.match(result.stderr, /names the width `6xl`/)
})

test('elevation-layout fails an arbitrary width it already refused', () => {
  const result = runOver(stage(underTest('max-w-[28rem]')))

  assert.equal(result.status, 1)
  assert.match(result.stderr, /arbitrary `max-w-\[\.\.\.\]`/)
})

test('elevation-layout fails a re-declared container property outside the token package', () => {
  const result = runOver(
    stage({ 'packages/ui/src/components/ui/under-test.css': '.probe { --container-page: 80rem; }\n' }),
  )

  assert.equal(result.status, 1)
  assert.match(result.stderr, /a second source of truth for --shadow-\/--breakpoint-\/--container-/)
})

test('elevation-layout fails a raw box-shadow and an arbitrary shadow utility', () => {
  const result = runOver(
    stage({
      'packages/ui/src/components/ui/under-test.css':
        '.a { box-shadow: 0 1px 2px red; }\n.b { box-shadow: var(--shadow-sm); }\n',
      'apps/site/src/probe.tsx': "export const SHADOW = 'shadow-[0_1px_2px_red]'\n",
    }),
  )

  assert.equal(result.status, 1)
  assert.match(result.stderr, /raw `box-shadow:`/)
  assert.match(result.stderr, /arbitrary shadow utility `shadow-\[\.\.\.\]`/)
})

/* ── The elevation-step rule ────────────────────────────────────────────────── */

test('elevation-layout fails every shadow step the token source does not author', () => {
  // The rule this file did not have, over the exact cases that shipped. `lg` is the
  // one `SearchDialog` and the site's skip link carried; the rest are Tailwind's
  // other stock steps, and a rule written only for the case that was found is a
  // rule that will find the next one by luck.
  for (const step of ['2xs', 'lg', 'xl', '2xl', 'inner']) {
    const result = runOver(stage(underTest(`shadow-${step}`)))

    assert.equal(result.status, 1, `shadow-${step} is not an authored step`)
    assert.match(result.stderr, /names an elevation step the token package does not author/)
    assert.match(result.stderr, /Shadow steps this repository authors: md, sm, xs/)
  }
})

test('elevation-layout reports the shadow step and where it is, not a phrase about it', () => {
  const result = runOver(stage(underTest('lg:shadow-lg')))

  assert.equal(result.status, 1)
  assert.match(result.stderr, /under-test\.tsx:\d+ {2}`shadow-lg`/)
  // The message has to say what the value resolves to instead, or a reader cannot
  // act on it: the whole point is that this utility is silently reading Tailwind's
  // theme rather than the token source.
  assert.match(result.stderr, /resolves\s+against Tailwind's own theme/)
  assert.match(result.stderr, /a retune of the shadow scale will not move it/)
})

test('elevation-layout holds the rule in the site as well as the library', () => {
  // There used to be a docs-only `shadow-lg` exception for site apparatus, and the
  // site was using it. The site's own Tailwind build is a second consumer of the
  // same token source, so an exception for the site is an exception for every
  // consumer that copies this pattern, and the exception is the defect.
  const result = runOver(stage({ 'apps/site/src/probe.tsx': "export const S = 'focus:shadow-lg'\n" }))

  assert.equal(result.status, 1)
  assert.match(result.stderr, /apps\/site\/src\/probe\.tsx:\d+/)
  assert.match(result.stderr, /names an elevation step the token package does not author/)
})

test('elevation-layout passes every shadow step the token source authors, and `shadow-none`', () => {
  // The passing cases are as load-bearing as the failing ones. A rule too wide gets
  // switched off within a week, and `input-group.tsx` ships `shadow-none`, so the
  // keyword has to be there or the rule is red on the shipped tree.
  for (const step of ['xs', 'sm', 'md', 'none']) {
    const result = runOver(stage(underTest(`shadow-${step}`)))

    assert.equal(result.stderr, '', `shadow-${step} is allowed and must not be reported`)
    assert.equal(result.status, 0)
  }
  // The three steps read back out of the token source, so a fourth step added
  // there widens this suite's passing set without editing the test.
  assert.deepEqual([...SHADOWS].sort(), ['md', 'sm', 'xs'])
  for (const step of SHADOWS) {
    assert.equal(runOver(stage(underTest(`shadow-${step}`))).status, 0)
  }
})

test('elevation-layout does not read a retired shadow named in a comment as a class', () => {
  // The reason this rule reads the blanked line rather than the raw one. A JSDoc
  // block that explains why an un-authored step is wrong is a record of the retired
  // line, and the gate's own header now spells the retired name as a matter of
  // course.
  const result = runOver(
    stage({
      'packages/ui/src/components/ui/under-test.tsx': [
        '/**',
        ' * A control under test.',
        ' *',
        ' * This used to carry shadow-lg, which resolved against Tailwind\'s own theme',
        ' * rather than against --shadow-md, and therefore never moved.',
        ' */',
        'export function UnderTest() {',
        "  return <div className='flex shadow-md' />",
        '}',
        '',
      ].join('\n'),
    }),
  )

  assert.equal(result.stderr, '')
  assert.equal(result.status, 0)
})

test('elevation-layout fails rather than judging every shadow when the token source has none', () => {
  // The empty-authority case, and the reason the rule reads the token source
  // instead of carrying a list: a missing or empty group is a loud failure on a
  // missing authority rather than a silent pass.
  const dir = stage({})
  writeFileSync(
    path.join(dir, 'packages', 'tokens', 'src', 'foundation', 'shadow.tokens.json'),
    JSON.stringify({ shadow: { $type: 'shadow' } }, null, 2),
  )
  const result = runOver(dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /the authored `shadow` group in/)
  assert.match(result.stderr, /is empty, so every shadow step in the tree would read as un-authored/)
})

test('elevation-layout fails rather than judging nothing when no shadow is named at all', () => {
  // The same coverage assertion the width rule makes, for the same reason: a rule
  // that read nothing and found nothing prints the same line as a rule that is
  // satisfied.
  const dir = stage({
    'packages/ui/src/probe.tsx': "export const NOTHING = 'flex items-center gap-2'\n",
    'apps/site/src/probe.tsx': "export const ALSO = 'flex items-center gap-2'\n",
    'apps/site/items/probe.tsx': "export const STILL = 'flex items-center gap-2'\n",
    'scripts/probe.mjs': "export const NOR = 'flex items-center gap-2'\n",
  })
  const result = runOver(dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /no `shadow-\*` name was read/)
  assert.match(result.stderr, /the elevation rule judged nothing/)
})

/* ── Cases that must PASS ───────────────────────────────────────────────────── */

const WIDTH_PASSES = [
  'max-w-page',
  'max-w-measure',
  'max-w-measure-narrow',
  'max-w-overlay-panel',
  'max-w-overlay-dialog',
  'max-w-overlay-form',
  'max-w-overlay-palette',
  'max-w-overlay-media',
  // Arithmetic on the spacing base, which is how a chart's axis band, a token
  // table's column and a documentation Demo's frame are sized. Every one of these
  // ships, so a rule that refused them would fail on the shipped tree.
  'max-w-96 max-w-64 max-w-72 max-w-32 max-w-20 max-w-192 max-w-224',
  // The keyword widths, which name the reader's own box rather than a scale value.
  'max-w-full max-w-none max-w-max min-w-0 min-w-48',
  'w-full w-3/4 w-1/2 w-9 w-px',
  // A variant on an authored name, and a descendant combinator inside an arbitrary
  // value whose own text carries a hyphen.
  'sm:max-w-overlay-panel lg:max-w-page md:max-w-measure-narrow',
  'grid-cols-[15rem_minmax(0,1fr)_13rem] w-[calc(100%-1rem)]',
  // A documentation sentence naming the whole family, which is prose and not a class.
  'max-w-*',
]

for (const classes of WIDTH_PASSES) {
  test(`elevation-layout passes: ${classes}`, () => {
    const result = runOver(stage(underTest(classes)))

    assert.equal(result.stderr, '')
    assert.equal(result.status, 0)
  })
}

test('elevation-layout passes a class name written down in a comment', () => {
  // A JSDoc block that explains that the namespace is closed, or that quotes the
  // class that was retired, is a record of the retired line and not a class anybody
  // renders. `scripts/check-motion.mjs` blanks comments for the same reason.
  const result = runOver(
    stage({
      'packages/ui/src/components/ui/under-test.tsx': [
        '/**',
        ' * A control under test.',
        ' *',
        ' * The page column used to be spelled with a step of Tailwind\'s own',
        ' * container namespace, at the same 72rem, and the two names drifted apart',
        ' * on the first retune of the authored token.',
        ' */',
        'export function UnderTest() {',
        "  return <div className='flex max-w-page' />",
        '}',
        '',
      ].join('\n'),
    }),
  )

  assert.equal(result.stderr, '')
  assert.equal(result.status, 0)
})

test('elevation-layout does not read another gate\'s own rule table as a class', () => {
  // `scripts/` is a root, and `check-motion.mjs` spells out the patterns it bans as
  // regular expressions. A `w-` inside one is not a width, and the boundary this
  // rule uses is what keeps that true.
  const result = runOver(
    stage({
      'scripts/other-gate.mjs': [
        'const BANNED = /w-](?:motion-safe|motion-reduce):(?:[\\w-]+:)*(?:transition|duration|ease)-/g',
        'export const NAMES = BANNED.source',
        '',
      ].join('\n'),
    }),
  )

  assert.equal(result.stderr, '')
  assert.equal(result.status, 0)
})

test('elevation-layout passes every container it is judging against', () => {
  const result = runOver(stage(underTest(CONTAINERS.join(' '))))

  assert.equal(result.stderr, '')
  assert.equal(result.status, 0)
  // The rule reads its authority from the token source rather than a list beside
  // itself, so the success line names where the names came from.
  assert.match(
    result.stdout,
    /width name\(s\) judged against the container group in packages\/tokens\/src\/foundation\/layout\.tokens\.json/,
  )
})

/* ── The run over the real tree, and coverage ───────────────────────────────── */

test('elevation-layout passes on the real tree and states its coverage', () => {
  const result = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

  assert.equal(result.stderr, '')
  assert.equal(result.status, 0)
  assert.match(result.stdout, /elevation-layout: 0 violation\(s\) in \d+ file\(s\) read from \d+ root\(s\)/)
  assert.match(result.stdout, /0 root\(s\) unresolved/)
  assert.match(result.stdout, /[1-9]\d* width name\(s\) judged/)
  assert.match(result.stdout, /1 generated file\(s\) skipped under apps\/site\/src\/generated/)
  assert.match(result.stdout, new RegExp(`${SECTION.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')} \\(owns the container contract\\)`))
})

test('elevation-layout reads its roots from its own location, not the working directory', () => {
  const fromRoot = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })
  const fromElsewhere = spawnSync(process.execPath, [GATE], { cwd: os.tmpdir(), encoding: 'utf8' })

  assert.equal(fromElsewhere.status, 0)
  assert.equal(fromElsewhere.stdout, fromRoot.stdout)
})

test('elevation-layout fails loudly when a configured root does not resolve', () => {
  const dir = stage({})
  rmSync(path.join(dir, 'apps', 'site', 'items'), { force: true, recursive: true })
  const result = runOver(dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /1 of \d+ configured roots? does not resolve: "apps\/site\/items"/)
  assert.match(result.stderr, /the gate was run from the wrong working directory/)
  assert.match(result.stderr, /does not exist in the repository at all/)
  assert.doesNotMatch(result.stdout, /0 violation\(s\)/)
})

test('elevation-layout fails rather than printing a clean line over a run that judged nothing', () => {
  const dir = stage({
    'packages/ui/src/probe.tsx': "export const NOTHING = 'flex items-center gap-2'\n",
    'apps/site/src/probe.tsx': "export const ALSO = 'flex items-center gap-2'\n",
    'apps/site/items/probe.tsx': "export const STILL = 'flex items-center gap-2'\n",
    'scripts/probe.mjs': "export const NOR = 'flex items-center gap-2'\n",
  })
  const result = runOver(dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /no `w-\*` or `max-w-\*` name was read/)
  assert.match(result.stderr, /A tree that carries no width at all is a tree this rule cannot see/)
})

test('elevation-layout fails rather than judging every name when the token source has no containers', () => {
  const dir = stage({})
  writeFileSync(
    path.join(dir, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json'),
    JSON.stringify({ container: { $type: 'dimension' } }, null, 2),
  )
  const result = runOver(dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /the authored `container` group in/)
  assert.match(result.stderr, /is empty, so every width name in the tree would read as un-authored/)
})

function rmDir(target) {
  rmSync(target, { force: true, recursive: true })
}

test('the gate exempts Section from its own container-declaration rule, and says so', () => {
  // The exemption exists because the ticket that wrote the rule gave the container
  // primitive the right to declare one. It is named on the success line, because an
  // exemption nobody can see is an exemption nobody reviews.
  const result = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

  assert.equal(result.status, 0)
  assert.ok(result.stdout.includes(relative(path.join(REPO, SECTION))))
  assert.ok(result.stdout.includes('scripts/check-elevation-layout.mjs (this gate\'s own rule table)'))
})
