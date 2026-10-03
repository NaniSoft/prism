/**
 * The motion gate, run as a process, over cases that each isolate one shape.
 *
 * The property under test is not "the gate passes". It is that every shape the gate
 * is supposed to catch still fires, and that every shape it is supposed to leave
 * alone still passes, INCLUDING the shapes that are one edit away from each other. A
 * gate proven only on the clean repository has been shown to read nothing, because
 * reading nothing and finding nothing print the same line.
 *
 * That is why every case here is staged: the real tree is clean, and a clean tree
 * cannot tell a rule from a pattern that never matches anything. Each failing case
 * therefore carries a file only that rule can report, and each passing case carries a
 * file that a too-wide pattern would report.
 *
 * **The gate is spawned, never imported**, for the reason `gates.test.mjs` gives: a
 * test that imports a script whose whole body is its run would run it at import time
 * and then assert on the module it got back. The gate reads its roots from its own
 * location and takes `--repo=`, so a case is a temporary directory rather than a
 * mutation of this repository, and a case that drops a root cannot damage the checkout.
 *
 * **The roots the staged trees are built from are read out of the gate**, by the same
 * reasoning `gates.test.mjs` gives for `check-dashes`: a hard-coded root list in a
 * test about coverage is a second list that drifts, and adding a root to the gate
 * would leave every case here failing on a missing directory rather than on the rule
 * it exists to prove.
 *
 * Run: node --test "scripts/__tests__/motion.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const SCRIPT_DIR = path.join(REPO, 'scripts')
const GATE = path.join(SCRIPT_DIR, 'check-motion.mjs')

/** Both causes, so no test can pass on a message that names only one. */
const BOTH_CAUSES = /wrong working directory[\s\S]*does not exist in the repository at all/

/**
 * Every root the gate declares, read out of the gate rather than typed here.
 *
 * The array literal is sliced between its own two neighbouring declarations, because
 * the gate declares `MOTION_PROPERTIES` immediately above `ROOTS` and a slice bounded
 * on `ROOTS` alone would run off the end of the file.
 */
function declaredRoots() {
  const source = readFileSync(GATE, 'utf8')
  const block = source.slice(source.indexOf('const ROOTS = ['), source.indexOf('const EXT ='))
  return block
    .split('\n')
    .filter((line) => /^ {2}'[a-zA-Z]/.test(line))
    .map((line) => line.trim().replace(/'/g, '').replace(/,$/, ''))
}

/**
 * A temporary repository holding the gate, every declared root, and one case file.
 *
 * The roots are created empty. A root that resolved and held nothing is legitimate on
 * its own; what is not legitimate is a run that read no file, which is what the gate's
 * own assertions are for, so each case supplies at least one.
 */
function stage(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-motion-'))
  mkdirSync(path.join(dir, 'scripts', 'lib'), { recursive: true })
  cpSync(GATE, path.join(dir, 'scripts', 'check-motion.mjs'))
  cpSync(path.join(SCRIPT_DIR, 'lib', 'walk.mjs'), path.join(dir, 'scripts', 'lib', 'walk.mjs'))
  for (const root of declaredRoots()) mkdirSync(path.join(dir, root), { recursive: true })
  for (const [relative, text] of Object.entries(files)) {
    const full = path.join(dir, relative)
    mkdirSync(path.dirname(full), { recursive: true })
    writeFileSync(full, text)
  }
  return dir
}

const runOver = (dir) =>
  spawnSync(process.execPath, [GATE, `--repo=${dir}`], { cwd: dir, encoding: 'utf8' })

const families = (output) => [...output.matchAll(/\[([a-z-]+)\]/g)].map((match) => match[1])

/**
 * Every case that must FAIL, with the rule family only that case can produce.
 *
 * Each file names an authored motion name as well, because the gate refuses a run that
 * found no authored name at all: without that guard a case could pass for the wrong
 * reason, and a fixture whose only content is the defect cannot tell a rule from a
 * pattern that never matches.
 *
 * The last three are the reduced-motion policy rather than a value, and each one is
 * a shape the policy has actually been wrong in: a block narrowed to a list of the
 * ambient classes, a block that stopped animations and not transitions, and a block
 * written inside `@layer` where it is outranked by every utility it is meant to stop.
 */
const FAILING_CASES = [
  [
    'curve-literal-in-a-class',
    'curve-literal',
    { 'packages/ui/src/components/probe.tsx': CLASS(`ease-[cubic-bezier(0.4,0,0.2,1)] duration-base`) },
  ],
  [
    'curve-literal-in-a-stylesheet',
    'curve-literal',
    { 'packages/ui/src/probe.css': `.probe {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.other { color: red }\n` },
  ],
  [
    'arbitrary-duration',
    'arbitrary-motion',
    { 'apps/site/src/components/probe.tsx': CLASS(`transition-colors duration-[400ms]`) },
  ],
  [
    'arbitrary-easing',
    'arbitrary-motion',
    { 'apps/site/src/components/probe.tsx': CLASS(`transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)]`) },
  ],
  [
    'arbitrary-animation',
    'arbitrary-motion',
    {
      'packages/ui/src/blocks/probe/probe.tsx': CLASS(`animate-[prism-travel_7.2s_linear_infinite] ease-in-out`),
    },
  ],
  [
    'a-duration-in-a-class-constant',
    'arbitrary-motion',
    {
      // A module constant is as much a class as one written inline, which is the
      // boundary `check-breakpoint-variants.mjs` already settled for variants.
      'packages/ui/src/components/probe.tsx': `const REJECTED = 'animate-[prism-travel_7.2s_linear]'\nexport const named = \`\${REJECTED} duration-fast\`\n`,
    },
  ],
  [
    'milliseconds-in-a-stylesheet',
    'value-in-style',
    { 'packages/ui/src/probe.css': `.probe {\n  transition-duration: 400ms;\n}\n\n.other { animation: none; }\n` },
  ],
  [
    'milliseconds-in-a-shorthand',
    'value-in-style',
    {
      // The arrangement `DESIGN.md` forbids: a keyframe name with a length attached.
      'packages/ui/src/probe.css': `.probe {\n  animation: prism-travel 7200ms linear infinite;\n}\n\n.other { animation: none; }\n`,
    },
  ],
  [
    'milliseconds-in-an-inline-style',
    'value-in-style',
    {
      'apps/site/src/components/probe.tsx': `export function Probe() {\n  return <div style={{ transitionDuration: '250ms' }} className="duration-base" />\n}\n`,
    },
  ],
  [
    'milliseconds-in-a-style-attribute',
    'value-in-style',
    { 'apps/site/src/components/probe.tsx': `export const Probe = () => <div style="animation-delay: 1.2s" className="ease-out" />\n` },
  ],
  [
    'a-motion-guard-on-a-transition',
    'guarded-motion',
    // The shape `RangeField` shipped: an unguarded transition and its guarded twin,
    // where the variant adds a rule rather than removing one and the transition runs
    // at every setting.
    { 'packages/ui/src/components/probe.tsx': CLASS(`transition-transform duration-base ease-out motion-safe:transition-transform`) },
  ],
  [
    'a-motion-guard-on-a-duration',
    'guarded-motion',
    // The shape `toast.tsx` shipped, and the one that reads as the most careful of
    // the three: shortening a fade at a call site is a second answer beside the one
    // the stylesheet already gives every element.
    { 'packages/ui/src/components/probe.tsx': CLASS(`transition-opacity duration-slow ease-out motion-reduce:duration-fast`) },
  ],
  [
    'a-motion-guard-on-an-easing',
    'guarded-motion',
    { 'apps/site/src/components/probe.tsx': CLASS(`transition-transform duration-base motion-safe:ease-out`) },
  ],
  [
    'a-policy-that-stops-animations-and-not-transitions',
    'reduced-motion-block',
    {
      'packages/ui/src/styles.css': POLICY({
        selector: '.prism-ambient-travel, .prism-ambient-rise',
        declarations: 'animation: none;',
      }),
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'a-policy-named-over-the-ambient-classes-only',
    'reduced-motion-block',
    {
      'packages/ui/src/styles.css': POLICY({
        selector: '.prism-ambient-travel, .prism-ambient-rise',
        declarations: 'animation: none;\n  transition: none;',
      }),
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'a-policy-inside-a-layer',
    'reduced-motion-block',
    {
      // The layer is the rank it has, and a rule at `*` inside one loses to
      // `.duration-slow` at equal specificity, so the policy would ship and do nothing.
      'packages/ui/src/styles.css': `@layer base {\n${POLICY({
        selector: '*',
        declarations: 'animation: none;\n    transition: none;',
        indent: '  ',
      }).replace(/^/gm, '  ')}\n}\n`,
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'a-policy-that-is-not-there',
    'reduced-motion-block',
    {
      'packages/ui/src/styles.css': `.prism-ambient-travel {\n  animation: prism-travel var(--ambient-travel) var(--ambient-ease-linear) infinite;\n}\n`,
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
]

/** The reduced-motion block a fixture writes, shaped as the file writes it. */
function POLICY({ selector, declarations, indent = '' }) {
  return `${indent}@media (prefers-reduced-motion: reduce) {\n${indent}  ${selector} {\n${indent}    ${declarations.replace(/\n\s*/g, `\n${indent}    `)}\n${indent}  }\n${indent}}\n`
}

/**
 * Every case that must PASS, with why the shape is a case at all.
 *
 * The first four are the shapes the DESIGN.md sentence has to survive: the comment
 * that quotes a value while explaining why it is banned, the rule string an agent
 * reads, and a caller stating a reading in their own register. The rest pin the scope:
 * the token package owns the values, and a gate's own rule table and the consumer kit
 * restate laws as failure messages.
 */
const PASSING_CASES = [
  [
    'a-comment-quoting-a-value',
    'a JSDoc block that quotes the banned value while explaining why it is banned',
    {
      'packages/ui/src/components/probe.tsx': `/**
 * Why this is slow rather than fast, and the number.
 *
 * \`cubic-bezier(0.4, 0, 0.2, 1)\` and \`animate-[prism-travel_7.2s_linear]\` are the
 * rejected shapes, and \`400ms\` is a value the system already had a name for.
 */
export function Probe() {
  return <div className="duration-slow ease-in-out" />
}
`,
    },
  ],
  [
    'a-line-comment-quoting-a-duration',
    'the same record in a line comment, which is the other comment form',
    {
      'apps/site/src/components/probe.tsx': `// 280ms is \`duration-slow\`; \`cubic-bezier(...)\` is not written here at all.\nexport const named = 'duration-slow'\n`,
    },
  ],
  [
    'a-rule-string-naming-the-token',
    'the mcp-server rule string, which names `cubic-bezier` without writing a curve',
    {
      'packages/mcp-server/src/rules.ts': `export const RULES = [
  'Motion is named by token, never by a millisecond or a \`cubic-bezier\` literal.',
]
`,
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'a-caller-stating-a-reading',
    'a caller formatting a duration in their own register, which is content',
    {
      'packages/ui/src/live/probe/probe.tsx': `const durationLabel = (ms: number) => \`\${ms}ms\`\nconst readings = ['1.2s', '1200ms', 'about a second']\nexport const named = 'duration-fast'\n`,
    },
  ],
  [
    'the-authored-names-and-their-reads',
    'the whole allowed set: the names, the token reads and the ambient classes',
    {
      'packages/ui/src/styles.css': POLICY({
        selector: '*, ::before, ::after',
        declarations: 'animation: none;\n  transition: none;',
      }) + `.prism-ambient-travel {\n  animation: prism-travel var(--ambient-travel) var(--ambient-ease-linear) infinite;\n}\n\n.probe {\n  transition-duration: var(--duration-base);\n  transition-timing-function: var(--ease-out);\n}\n`,
      'packages/ui/src/components/probe.tsx': CLASS(`transition-colors duration-fast ease-out prism-ambient-travel`),
    },
  ],
  [
    'the-token-package',
    'the foundation tier owns the values, which is the one tier that may write them',
    {
      'packages/tokens/src/foundation/probe.tokens.json': `{\n  "probe": {\n    "$value": { "duration": { "ms": 400 }, "easing": [0.4, 0, 0.2, 1] },\n    "$description": "never a cubic-bezier(...) literal"\n  }\n}\n`,
      'packages/tokens/build/serialize.mjs': `export const serialize = (value) => \`cubic-bezier(\${value.join(', ')})\`\n`,
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'the-gates-and-scripts',
    'a gate rule table and the consumer kit restate laws as failure messages',
    {
      'packages/ui/gates/src/probe.css': `.probe { transition-duration: 400ms; }\n`,
      'packages/ui/gates/__tests__/probe.test.mjs': 'export const fixTURE = `@media (scripting: none) { .x { animation: rise 1ms linear 3s forwards; } }`\n',
      'scripts/probe.mjs': "export const RULE = /cubic-bezier\\(/\n",
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'the-generated-demo-registry',
    'the generated copy of the Demos, whose authored originals are read in apps/site/items',
    {
      'apps/site/src/generated/probe.ts': `export const demos = [{ source: "className=\\"animate-[prism-travel_7.2s_linear]\\"" }]\n`,
      'packages/ui/src/components/probe.tsx': CLASS('duration-base'),
    },
  ],
  [
    'a-comment-behind-a-regex-literal',
    'a regex literal carries a quote, and without skipping it the comment after it stops being blanked',
    {
      'packages/ui/src/components/probe.tsx': `const QUOTE = /['"]/\n\n/**\n * A record: \`cubic-bezier(0.4, 0, 0.2, 1)\` is the shape this package does not write.\n */\nexport const named = 'duration-fast'\n`,
    },
  ],
  [
    'a-motion-variant-that-guards-no-motion',
    'a reduced-motion guard on a layout reflow, which is a legitimate use of the variant and has nothing to do with motion',
    {
      'packages/ui/src/components/probe.tsx': CLASS('grid grid-cols-1 motion-safe:grid-cols-2 duration-base'),
    },
  ],
  [
    'a-record-of-a-retired-guard',
    'a comment naming the guard that was removed, which is a record and not a class',
    {
      'packages/ui/src/components/probe.tsx': `/**\n * This used to carry \`motion-safe:transition-transform\`, which did nothing: the variant\n * adds a rule rather than removing one, so the transition ran at every setting.\n */\nexport const named = 'duration-base'\n`,
    },
  ],
  [
    'a-division-beside-a-record',
    'a Component that divides is not a Component whose arithmetic is blanked',
    {
      'packages/ui/src/blocks/probe/probe.tsx': `const share = (value: number, total: number) => value / total\nexport const named = 'ease-out'\n`,
    },
  ],
]

/** A component file whose class list is the case, and which names an authored token. */
function CLASS(className) {
  return `export function Probe() {\n  return <div className="${className}" />\n}\n`
}

test('every declared root is a directory the gate can resolve, and there are five', () => {
  const roots = declaredRoots()
  assert.ok(roots.length > 0, 'the gate declares no roots, so the cases below prove nothing')
  for (const root of roots) {
    assert.ok(
      ROOT_EXCLUSIONS.every((excluded) => !root.startsWith(excluded)),
      `${root} is read by the gate and also listed as not read`,
    )
  }
  assert.deepEqual(
    roots,
    ['packages/ui/src', 'packages/llms/src', 'packages/mcp-server/src', 'apps/site/src', 'apps/site/items'],
  )
})

/** The prefixes the gate names in its EXCLUSIONS line. Read here, not restated. */
const ROOT_EXCLUSIONS = [
  'packages/tokens',
  'packages/ui/gates',
  'scripts',
  'apps/site/src/generated',
]

test('each failing case fails, and reports the family only that case can produce', () => {
  for (const [name, family, files] of FAILING_CASES) {
    const result = runOver(stage(files))

    assert.equal(result.status, 1, `the ${name} case must fail the gate:\n${result.stderr}`)
    assert.ok(
      families(result.stderr).includes(family),
      `the ${name} case must report [${family}]; it reported ${JSON.stringify(families(result.stderr))}`,
    )
    // The file the case wrote is the file the gate names, so a case cannot pass on
    // some other file's finding.
    const named = Object.keys(files).filter((file) => result.stderr.includes(file))
    assert.ok(named.length > 0, `the ${name} case must name the file it wrote:\n${result.stderr}`)
  }
})

test('each passing case passes, so a widened pattern is red too', () => {
  for (const [name, why, files] of PASSING_CASES) {
    const result = runOver(stage(files))

    assert.equal(result.status, 0, `the ${name} case must pass (${why}):\n${result.stderr}`)
    assert.equal(result.stderr, '', `the ${name} case must report nothing on stderr (${why})`)
  }
})

test('a case with no authored motion name fails for coverage rather than passing', () => {
  // The guard `check-breakpoint-variants.mjs` states in its own words: a tree with no
  // `sm:` in it is a tree the rule cannot see, and reporting that as a clean run is the
  // failure the guard replaces. It is counted as a finding rather than printed beside
  // the summary, so a run that judged nothing cannot print `0 finding(s)`.
  const result = runOver(stage({ 'packages/ui/src/probe.tsx': 'export const x = 1\n' }))

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[coverage\]  no authored motion name was read/)
  assert.deepEqual(families(result.stderr), ['coverage'])
  assert.match(result.stdout, /1 finding\(s\) in 1 file\(s\) read/)
  assert.doesNotMatch(result.stdout, /every duration and easing/)
})

test('the gate refuses a run whose roots do not resolve, naming both causes', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-motion-bare-'))
  mkdirSync(path.join(dir, 'scripts', 'lib'), { recursive: true })
  cpSync(GATE, path.join(dir, 'scripts', 'check-motion.mjs'))
  cpSync(path.join(SCRIPT_DIR, 'lib', 'walk.mjs'), path.join(dir, 'scripts', 'lib', 'walk.mjs'))

  const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-motion.mjs')], {
    cwd: dir,
    encoding: 'utf8',
  })

  const roots = declaredRoots().length
  assert.equal(result.status, 1)
  assert.match(result.stderr, BOTH_CAUSES)
  assert.match(result.stderr, new RegExp(`${roots} of ${roots} configured roots do not resolve`))
  assert.doesNotMatch(result.stdout, /every duration and easing/)
})

test("the real tree is clean, and the run states what it read and what it did not", () => {
  const result = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stderr, '')
  const roots = declaredRoots().length
  assert.match(result.stdout, new RegExp(`0 finding\\(s\\) in \\d+ file\\(s\\) read across ${roots} root\\(s\\) \\(0 unresolved\\)`))
  // The coverage guard's own number is on the line, so a run that judged nothing
  // cannot be told from a run that found nothing to say.
  assert.match(result.stdout, /[1-9]\d* authored motion name\(s\) read/)
  assert.match(result.stdout, /not read, by scope rather than by exclusion: .*packages\/tokens/)
  assert.match(result.stdout, /not read, by scope rather than by exclusion: .*packages\/ui\/gates/)
  assert.match(result.stdout, /not read, by scope rather than by exclusion: .*apps\/site\/src\/generated/)
  assert.match(result.stdout, /generated file\(s\) skipped as build output/)
})

test('the gate reads the same tree from a working directory that is not the root', () => {
  const fromRoot = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })
  const fromPackage = spawnSync(process.execPath, [GATE], { cwd: path.join(REPO, 'packages', 'ui'), encoding: 'utf8' })

  assert.equal(fromPackage.status, 0, fromPackage.stderr)
  assert.equal(fromRoot.stdout, fromPackage.stdout)
})