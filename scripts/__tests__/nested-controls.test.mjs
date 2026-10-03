/**
 * The nested-control gate's own test, run against planted defects.
 *
 * The property under test is not "the gate passes". It is that removing or
 * loosening any one of the four rules below turns a named case red, and that a
 * case the gate is NOT meant to catch stays green. A gate nobody has watched fail
 * is indistinguishable from one that found nothing, and this file is the watching.
 *
 * Every case runs the gate as a process against a staged tree, never against the
 * repository, for the reason `no-legacy-line.test.mjs` gives: a test that had to
 * plant a defect in the real tree to see the gate react would be a test that
 * dirties the tree to prove the gate works, and a second run would then find the
 * defect the first run left behind.
 *
 * Run: node --test "scripts/__tests__/nested-controls.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const GATE = path.join(REPO, 'scripts', 'check-nested-controls.mjs')

/** The three roots the gate declares, staged empty so a case can fill one of them. */
const ROOTS = ['apps/site/src', 'apps/site/items', 'packages/ui/src']

/** A staged tree with every configured root present and empty. */
function stage(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-nested-'))
  for (const root of ROOTS) mkdirSync(path.join(dir, root), { recursive: true })
  for (const [relative, source] of Object.entries(files)) {
    const full = path.join(dir, relative)
    mkdirSync(path.dirname(full), { recursive: true })
    writeFileSync(full, source)
  }
  return dir
}

const run = (dir) =>
  spawnSync(process.execPath, [GATE, `--repo=${dir}`], { encoding: 'utf8', cwd: REPO })

/** Run against a staged tree and hand back the result, having cleaned the tree up. */
function check(files) {
  const dir = stage(files)
  try {
    return run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const BLOCK = 'packages/ui/src/blocks/probe/probe.tsx'
const ROUTE = 'apps/site/src/app/(site)/probe.tsx'

/**
 * The four rules, one case each, each named for what it removes.
 *
 * The first two are the defects. The last two are the exceptions, and a case that
 * only ever asserted findings could not tell an exception rule from a rule that
 * had stopped matching.
 */
const FIRES = [
  {
    name: 'a Prism Component that renders a button, inside an anchor',
    file: BLOCK,
    source: [
      "export function Probe() {",
      "  return (",
      '    <a href="/start">',
      '      <Button size="lg">Start free</Button>',
      '    </a>',
      '  )',
      '}',
    ].join('\n'),
    says: ['<Button> is inside <a>', 'packages/ui/src/blocks/probe/probe.tsx:4'],
  },
  {
    name: 'a native button inside an anchor, which is the shape that shipped',
    file: ROUTE,
    source: [
      'export function Probe() {',
      '  return (',
      '    <Link href="/start">',
      '      <button type="button">Start free</button>',
      '    </Link>',
      '  )',
      '}',
    ].join('\n'),
    says: ['<button> is inside <Link>', 'apps/site/src/app/(site)/probe.tsx:4'],
  },
  {
    name: 'a native input inside an anchor',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <a href="/start">',
      '      <input type="text" />',
      '    </a>',
      '  )',
      '}',
    ].join('\n'),
    says: ['<input> is inside <a>', 'packages/ui/src/blocks/probe/probe.tsx:4'],
  },
  {
    name: 'a link inside a label, which the label exception does not admit',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <label htmlFor="x">',
      '      <a href="/start">Start free</a>',
      '    </label>',
      '  )',
      '}',
    ].join('\n'),
    says: ['<a> is inside <label>', 'packages/ui/src/blocks/probe/probe.tsx:4'],
  },
]

/** The shapes that must stay green, each with the rule whose removal would redden it. */
const SILENT = [
  {
    name: 'a label wrapping the input it names, which is the recommended pattern',
    rule: 'the label exception',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <label htmlFor="email">',
      '      <input id="email" type="email" />',
      '    </label>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'an anchor with no href wrapping a control, which is a placeholder and is legal',
    rule: 'the transparent content model',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <a>',
      '      <button type="button">Start free</button>',
      '    </a>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'two controls beside each other, which is a row and not a nest',
    rule: 'the stack, which is structural rather than a proximity search',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <div>',
      '      <Button size="lg">Start free</Button>',
      '      <Button size="lg" variant="outline">Read the docs</Button>',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'the nesting written inside a comment, which is prose and not markup',
    rule: 'the comment mask',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <div>',
      '      {/* <a href="/start"><Button>Start free</Button></a> */}',
      '      <Button size="lg">Start free</Button>',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'a control inside a component that renders a link through `render`',
    rule: 'nothing: this is the shape the gate is asking for',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <DropdownMenuItem render={<a href="/start" />}>',
      '      <ProductMark id="pipeline" name="Pipeline" />',
      '    </DropdownMenuItem>',
      '  )',
      '}',
    ].join('\n'),
  },
]

test('the gate passes over the repository it is checked into', () => {
  const result = run(REPO)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /0 finding\(s\)/)
  // The four labels in this repository are the negative control: the label rule is
  // live, matched four times, and rejected nothing. A run that reported `label: 0`
  // would mean the exception had stopped being read.
  assert.match(result.stdout, /watched as a parent, label: 4/)
})

for (const { name, file, source, says } of FIRES) {
  test(`it reports ${name}`, () => {
    const result = check({ [file]: source })
    assert.equal(result.status, 1, `expected a finding, got:\n${result.stdout}`)
    for (const phrase of says) {
      assert.ok(
        result.stderr.includes(phrase),
        `expected ${JSON.stringify(phrase)} in:\n${result.stderr}`,
      )
    }
    assert.match(result.stdout, /1 finding\(s\)/)
  })
}

for (const { name, rule, file, source } of SILENT) {
  test(`it accepts ${name}`, () => {
    const result = check({ [file]: source })
    assert.equal(result.status, 0, `expected no finding, got:\n${result.stderr}`)
    assert.match(result.stdout, /0 finding\(s\)/)
    assert.ok(rule.length > 0, 'a silent case names the rule that would redden it')
  })
}

test('a root that does not resolve fails the run rather than emptying it', () => {
  // The failure this replaces is a gate that read nothing and reported zero
  // violations, which is indistinguishable from a gate that found nothing.
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-nested-missing-'))
  try {
    mkdirSync(path.join(dir, ROOTS[0]), { recursive: true })
    const result = run(dir)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /configured root/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a resolved tree with no TSX in it fails the run rather than emptying it', () => {
  const result = check({ 'packages/ui/src/blocks/probe/probe.ts': 'export const a = 1\n' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /read 0 files/)
})

test('a test file is excluded, so a spec may stage the shape it is asserting is absent', () => {
  const result = check({
    'packages/ui/src/blocks/probe/probe.test.tsx': [
      'export const markup = (',
      '  <a href="/start">',
      '    <button type="button">Start free</button>',
      '  </a>',
      ')',
    ].join('\n'),
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /1 excluded file\(s\)/)
})