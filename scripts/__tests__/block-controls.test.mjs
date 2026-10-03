/**
 * The block-control gate's own test, run against planted defects.
 *
 * The property under test is not "the gate passes". It is that removing or
 * loosening any one of the three arms below turns a named case red, and that a
 * case the gate is NOT meant to catch stays green. A gate nobody has watched fail
 * is indistinguishable from one that found nothing, and this file is the watching.
 *
 * **Why the fixtures are the whole point here, more than for
 * `nested-controls.test.mjs`.** The five defects this gate was written for were
 * real, and all five have now been fixed, so the shipped tree is clean and there is
 * nothing left to watch the gate react to. Every case below is therefore a shape
 * that really existed in this repository within the hour: the inert arm of an action
 * union, an action whose type had no destination member at all, a required `cta`
 * string rendered as a button, and a control declared by its accessible name and its
 * state with no handler behind either. Read as history rather than as fixtures.
 *
 * Every case runs the gate as a process against a staged tree, never against the
 * repository, for the reason `no-legacy-line.test.mjs` gives: a test that had to
 * plant a defect in the real tree to see the gate react would be a test that
 * dirties the tree to prove the gate works, and a second run would then find the
 * defect the first run left behind.
 *
 * Run: node --test "scripts/__tests__/block-controls.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const GATE = path.join(REPO, 'scripts', 'check-block-controls.mjs')

/** The roots the gate declares, staged empty so a case can fill one of them. */
const ROOTS = ['packages/ui/src/blocks', 'packages/ui/src/pages']

/** A staged tree with every configured root present and empty. */
function stage(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-block-controls-'))
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
const PAGE = 'packages/ui/src/pages/probe/page.tsx'

/**
 * The three arms, one case each, each named for what it removes.
 *
 * The first is the shape that shipped in three heroes and two section Blocks. The
 * second is the shape that shipped in a page header, where the action type had no
 * destination member at all. The third is the shape that shipped in a pricing card
 * and in a waitlist referral, where a string named a control and no handler stood
 * behind it.
 */
const FIRES = [
  {
    name: 'an action union whose button arm renders a Button, which is the shipped shape',
    file: BLOCK,
    source: [
      'export function Probe({ actions }: { actions: { label: string; href?: string }[] }) {',
      '  return (',
      '    <div>',
      '      {actions.map((action, index) =>',
      '        action.href !== undefined ? (',
      '          <a key={index} href={action.href}>{action.label}</a>',
      '        ) : (',
      '          <Button key={index} variant={index === 0 ? "default" : "outline"}>',
      '            {action.label}',
      '          </Button>',
      '        ),',
      '      )}',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
    says: ['<Button> is rendered with nothing that makes it act', `${BLOCK}:8`],
  },
  {
    name: 'a declared action with no destination member at all, which is the page-header shape',
    file: BLOCK,
    source: [
      'export function Probe({ actions }: { actions: { label: string }[] }) {',
      '  return (',
      '    <div>',
      '      {actions.map((action, index) => (',
      '        <Button key={index} variant="outline" size="sm">',
      '          {action.label}',
      '        </Button>',
      '      ))}',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
    says: ['<Button> is rendered with nothing that makes it act', `${BLOCK}:5`],
  },
  {
    name: 'a required string naming a control with no handler, which is the pricing and waitlist shape',
    file: PAGE,
    source: [
      'export function Probe({ cta }: { cta: string }) {',
      '  return (',
      '    <div>',
      '      <Button type="button" variant="outline">',
      '        {cta}',
      '      </Button>',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
    // `type="button"` is deliberately present. Naming the type is not a behaviour,
    // and a rule that accepted any `type` would have passed both shipped defects.
    says: ['<Button> is rendered with nothing that makes it act', `${PAGE}:4`],
  },
]

/** The shapes that must stay green, each with the rule whose removal would redden it. */
const SILENT = [
  {
    name: 'a handler passed to the rendered Button, which is what a client Block does',
    rule: 'the onClick arm',
    file: BLOCK,
    source: [
      'export function Probe({ onRemove }: { onRemove: () => void }) {',
      '  return (',
      '    <Button type="button" variant="ghost" onClick={onRemove}>',
      '      Remove',
      '    </Button>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'a handler whose body holds an arrow and a comparison, which a pattern match would truncate',
    rule: 'the balanced tag reader, which is why `=>`, `<=` and `>=` do not end a tag',
    file: BLOCK,
    source: [
      'export function Probe({ at, total, step }: { at: number; total: number; step: (n: number) => void }) {',
      '  return (',
      '    <Button',
      '      type="button"',
      '      variant="outline"',
      '      disabled={at >= Math.max(1, total)}',
      '      onClick={() => step(-1)}',
      '    >',
      '      Previous',
      '    </Button>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'a submit button, which acts through the form the browser owns',
    rule: 'the type="submit" arm',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <form action="/subscribe" method="post">',
      '      <Button type="submit" className="w-full">',
      '        Take a place',
      '      </Button>',
      '    </form>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'a CtaLink with a destination, which is every link a Block renders',
    rule: 'the href arm',
    file: BLOCK,
    source: [
      'export function Probe() {',
      '  return (',
      '    <CtaLink href="/start" size="lg">',
      '      Start free',
      '    </CtaLink>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'a slot, which is the escape the finding points at',
    rule: 'nothing: this is the shape the gate is asking for',
    file: BLOCK,
    source: [
      'export function Probe({ actions }: { actions: ({ slot: React.ReactNode } | { label: string; href: string })[] }) {',
      '  return (',
      '    <div>',
      '      {actions.map((action, index) => (',
      '        "slot" in action ? action.slot : <a key={index} href={action.href}>{action.label}</a>',
      '      ))}',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'a hand-written button in a client Block, which is that Block\'s own control',
    rule: 'the scope, which is Prism\'s action Components rather than every element',
    file: BLOCK,
    source: [
      "'use client'",
      '',
      'export function Probe() {',
      '  return (',
      '    <button',
      '      type="button"',
      '      data-slot="gallery-trigger"',
      '      onClick={() => undefined}',
      '    >',
      '      <img src="/one.png" alt="" />',
      '    </button>',
      '  )',
      '}',
    ].join('\n'),
  },
  {
    name: 'the dead Button written inside a comment, which is prose and not markup',
    rule: 'the comment mask',
    file: BLOCK,
    source: [
      'export function Probe({ label }: { label: string }) {',
      '  return (',
      '    <div>',
      '      {/* <Button variant="outline">{label}</Button> */}',
      '      <a href="/start">{label}</a>',
      '    </div>',
      '  )',
      '}',
    ].join('\n'),
  },
]

test('the gate passes over the repository it is checked into', () => {
  const result = run(REPO)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /0 finding\(s\)/)
  // The negative control that makes the clean run mean something: both Components in
  // the table were classified, and neither printed the "stated and unused" note. A run
  // that reported `Button: 0` would mean the pattern had stopped matching, which is
  // indistinguishable from a rule that was deleted.
  assert.match(result.stdout, /action control, Button: [1-9]\d*/)
  assert.match(result.stdout, /action control, CtaLink: [1-9]\d*/)
  assert.doesNotMatch(result.stdout, /stated and unused rather than removed/)
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
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-block-controls-missing-'))
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

test('a finding above a JSDoc block is printed on the line the reader sees', () => {
  // The first version of this gate deleted comments rather than blanking them, which
  // removed their newlines and moved every offset below the first JSDoc block. It
  // reported `offering-categories-01.tsx:191` for a line of prose. The line is
  // asserted here because a gate that names the wrong line is worse than a gate that
  // names none.
  const result = check({
    [BLOCK]: [
      '/**',
      ' * A block of prose long enough to be worth reading.',
      ' *',
      ' * It has several lines.',
      ' */',
      'export function Probe({ label }: { label: string }) {',
      '  return (',
      '    <Button variant="outline">{label}</Button>',
      '  )',
      '}',
    ].join('\n'),
  })
  assert.equal(result.status, 1, result.stdout)
  assert.ok(result.stderr.includes(`${BLOCK}:8`), `expected line 8 in:\n${result.stderr}`)
})
