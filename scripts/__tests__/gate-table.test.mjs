/**
 * The gate-table gate, run as a process over the real tree and over staged documents.
 *
 * **The property under test is that the table cannot drift from the chains.** The
 * defect it exists to stop already happened once in this repository: seven scripts
 * were added to `check` chains and `docs/quality-gates.md` was never updated, so the
 * document said seven of the gates did not exist while five of them were explained in
 * prose further down the same file. A gate that has only ever been green is not
 * evidence of anything, and this one has two directions that fail in different ways,
 * so each is proven red separately over a staged document rather than over the real
 * one.
 *
 * **The gate is spawned, never imported**, for the reason
 * `scripts/__tests__/elevation-layout.test.mjs` gives: a test that imports a script
 * whose whole body is its run would run it at import time and then assert on the
 * module it got back. It resolves its repository root from its own location, so a
 * staged tree is a copy of the manifests and the document rather than an edit to
 * either.
 *
 * **The staged tree copies the real manifests rather than writing new ones.** The
 * gate's subject is what the chains say, so a fixture that invented a manifest would
 * be asserting that the gate reads whatever it is handed, which is a weaker and less
 * useful claim. It copies, edits one copy, and puts it back in a `finally`, so a case
 * that fails cannot leave this repository's chains changed.
 *
 * Run: node --test "scripts/__tests__/gate-table.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const GATE = path.join(REPO, 'scripts', 'check-gate-table.mjs')
const DOC = 'docs/quality-gates.md'

/** The manifests the gate reads, read out of the gate rather than typed here. */
function declaredManifests() {
  const source = readFileSync(GATE, 'utf8')
  const block = source.slice(
    source.indexOf('const MANIFESTS = ['),
    source.indexOf(']\n', source.indexOf('const MANIFESTS = [')) + 1,
  )
  return block
    .split('\n')
    .map((line) => /^\s*'[^']+'/.exec(line)?.[0]?.trim().replace(/'/g, ''))
    .filter(Boolean)
}

/**
 * Every path the real document's table names, resolved against the package its row is
 * about.
 *
 * The row's package column is the mapping, read from the table rather than hard-coded
 * here, because a hard-coded list in a test about the table is a second list: it would
 * say the row is complete even if the row changed underneath it.
 */
function tablePaths() {
  const markdown = readFileSync(path.join(REPO, DOC), 'utf8')
  const start = markdown.indexOf('## Fail or report')
  const section = markdown.slice(start, markdown.indexOf('\n## ', start))
  const root = { '`prism-tokens`': 'packages/tokens', '`prism-ui`': 'packages/ui', '`prism-llms`': 'packages/llms', '`prism-mcp-server`': 'packages/mcp-server', '`@nanisoft/site` (private)': 'apps/site', 'repository root': '.' }
  const found = []
  for (const line of section.split('\n')) {
    if (line.startsWith('|') === false || line.startsWith('| ---')) continue
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    const base = root[cells[0]]
    if (base === undefined) continue
    for (const [, written] of line.matchAll(/`([^`]*\.(?:mjs|ts))`/g)) {
      found.push(path.join(base, written))
    }
  }
  return found
}

/**
 * A staged repository holding the gate, every manifest the gate reads, every file
 * those manifests and the document name, and the document, with `edit` applied to one
 * of them.
 *
 * The gate files are copied because the gate asserts in both directions, and a staged
 * tree holding the chains and the table without the gates they name would make every
 * case red on the "not on disk" direction for a reason of its own. A case that fails
 * for two reasons proves nothing about either, and this is the same lesson
 * `elevation-layout.test.mjs` records about its probe files.
 */
function stage(edit) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-gate-table-'))
  const copy = (from, to) => {
    mkdirSync(path.dirname(to), { recursive: true })
    cpSync(from, to, { recursive: true })
  }
  for (const relative of ['scripts', ...declaredManifests().map((m) => path.join(path.dirname(m), 'scripts'))]) {
    const from = path.join(REPO, relative)
    if (existsSync(from)) copy(from, path.join(dir, relative))
  }
  for (const manifest of declaredManifests()) copy(path.join(REPO, manifest), path.join(dir, manifest))
  copy(path.join(REPO, DOC), path.join(dir, DOC))
  // The paths the table names, resolved against the package each row is about. Only
  // one of them is not under a `scripts/` directory, and it is a test file in the one
  // package whose row is a test lane.
  for (const relative of tablePaths()) {
    const from = path.join(REPO, relative)
    if (existsSync(from)) copy(from, path.join(dir, relative))
  }
  edit(dir)
  return dir
}

const runOver = (dir) =>
  spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-gate-table.mjs')], {
    cwd: dir,
    encoding: 'utf8',
  })

const runReal = () => spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

function withDocument(dir, transform) {
  const file = path.join(dir, DOC)
  writeFileSync(file, transform(readFileSync(file, 'utf8')))
}

function withManifest(dir, manifest, transform) {
  const file = path.join(dir, manifest)
  const parsed = JSON.parse(readFileSync(file, 'utf8'))
  transform(parsed)
  writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`)
}

function rmDir(dir) {
  rmSync(dir, { force: true, recursive: true })
}

/* ── Cases that must FAIL ───────────────────────────────────────────────────── */

test('gate-table fails a gate a chain runs and the table does not name', () => {
  // The defect as it happened. One script is dropped from the `prism-ui` row and
  // nothing else changes, which is exactly how seven went missing.
  const dir = stage((d) =>
    withDocument(d, (text) =>
      text.replace('`scripts/check-block-imports.mjs`, ', '').replace('the modules a Block and a Page may not import, ', ''),
    ),
  )
  try {
    const result = runOver(dir)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /check task runs scripts\/check-block-imports\.mjs/)
    assert.match(result.stderr, /does not name it in its/)
    assert.match(result.stderr, /A gate that runs and is not in the table/)
  } finally {
    rmDir(dir)
  }
})

test('gate-table fails a gate dropped from the root chain', () => {
  // The root row, and the one whose omission was least visible, because a root gate
  // has no package column to key off and the row is read by everybody.
  const dir = stage((d) =>
    withDocument(d, (text) => text.replace('`scripts/check-block-controls.mjs`, ', '')),
  )
  try {
    const result = runOver(dir)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /package\.json's check task runs scripts\/check-block-controls\.mjs/)
  } finally {
    rmDir(dir)
  }
})

test('gate-table fails a path the table names that does not exist', () => {
  // The direction the document's own header already argued for, turned into an
  // assertion. The path the table really got wrong is `src/registration.test.ts`,
  // which is `test/registration.test.ts` on disk.
  const dir = stage((d) => withDocument(d, (text) => text.replace('`test/registration.test.ts`', '`src/registration.test.ts`')))
  try {
    const result = runOver(dir)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /names packages\/mcp-server\/src\/registration\.test\.ts in its gate table/)
    assert.match(result.stderr, /a gate list naming a gate which does not exist/)
  } finally {
    rmDir(dir)
  }
})

test('gate-table fails a chain that calls a script this repository does not have', () => {
  // The manifest side of the same defect: a gate renamed or deleted and the chain
  // left calling it. The chain is the thing that runs, so a chain pointing at nothing
  // is a `check` task that cannot pass.
  const dir = stage((d) =>
    withManifest(d, 'packages/ui/package.json', (parsed) => {
      parsed.scripts.check += ' && node scripts/check-a-gate-that-does-not-exist.mjs'
    }),
  )
  try {
    const result = runOver(dir)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /runs scripts\/check-a-gate-that-does-not-exist\.mjs, which is not on disk/)
  } finally {
    rmDir(dir)
  }
})

test('gate-table fails a check task whose chain lost its gates', () => {
  // The coverage assertion. A `check` task that runs no gate script is not a check
  // task, and a run that compared nothing for it must say so rather than pass.
  const dir = stage((d) =>
    withManifest(d, 'packages/tokens/package.json', (parsed) => {
      parsed.scripts.check = 'node --version'
    }),
  )
  try {
    const result = runOver(dir)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /declares a `check` task that runs no gate script/)
    assert.match(result.stderr, /A check task whose chain lost its gates is not a check task/)
  } finally {
    rmDir(dir)
  }
})

test('gate-table fails when the table it compares against is gone', () => {
  // The subject disappearing. A gate that stops finding its own document passes,
  // because every direction it checks is vacuous.
  // The section heading is renamed rather than reworded, because the gate finds its
  // subject by a substring of the heading and a heading that still opens with the old
  // words is a heading the gate can still read. A case that passes for that reason is
  // a case that proves nothing.
  const dir = stage((d) =>
    withDocument(d, (text) => text.replace('## Fail or report', '## Fail, or report by another name')),
  )
  try {
    const result = runOver(dir)

    assert.equal(result.status, 1)
    assert.match(result.stderr, /has no `## Fail or report` section/)
    assert.match(result.stderr, /a gate that stops finding its subject is a gate that passes/)
  } finally {
    rmDir(dir)
  }
})

/* ── Cases that must PASS ───────────────────────────────────────────────────── */

test('gate-table passes when the table names every gate every chain runs', () => {
  // The positive half, and the one that has to keep being true: a gate added to a
  // chain and added to the row in the same change is the ordinary case. The script is
  // written before the manifest is edited so the chain never names a file that is not
  // there, which is a different failure and one the case above already covers.
  const dir = stage((d) => {
    mkdirSync(path.join(d, 'packages', 'ui', 'scripts'), { recursive: true })
    writeFileSync(path.join(d, 'packages', 'ui', 'scripts', 'check-another.mjs'), '// staged\n')
    withManifest(d, 'packages/ui/package.json', (parsed) => {
      parsed.scripts.check += ' && node scripts/check-another.mjs'
    })
    withDocument(d, (text) =>
      text.replace('`scripts/check-variant-ink.mjs`', '`scripts/check-variant-ink.mjs`, `scripts/check-another.mjs`'),
    )
  })
  try {
    const result = runOver(dir)

    assert.equal(result.status, 0, result.stdout + result.stderr)
    assert.match(result.stdout, /every gate a `check` task runs is named in the table/)
    assert.match(result.stdout, /named {4}packages\/ui\/scripts\/check-another\.mjs/)
  } finally {
    rmDir(dir)
  }
})

test('gate-table passes on the real tree and prints both sides of the comparison', () => {
  const result = runReal()

  assert.equal(result.stderr, '')
  assert.equal(result.status, 0)
  // The falsifiable part is the arithmetic on the line rather than the verdict: a
  // reader can see how many chains were read, how many gate scripts they yielded and
  // how many of them the table named, so "it passes" is separable from "it read
  // something".
  assert.match(
    result.stdout,
    /\d+ manifest\(s\) read, \d+ gate script\(s\) in their `check` chains, \d+ of them named/,
  )
  assert.match(result.stdout, /\d+ path\(s\) the table names/)
  // The two counts must be equal on a real tree, and reading them is what makes the
  // verdict checkable rather than asserted: a gate that printed "0 of them named"
  // would print the same clean line.
  const [, read, namedCount] =
    /(\d+) manifest\(s\) read, \d+ gate script\(s\) in their `check` chains, (\d+) of them named/.exec(
      result.stdout,
    ) ?? []
  assert.ok(Number(read) >= 6, 'every manifest with a check task was read')
  assert.equal(
    Number(namedCount),
    result.stdout.match(/ {4}named {4}/g)?.length,
    'the summary agrees with the lines above it',
  )
})

test('gate-table reads its repository root from its own location', () => {
  const fromRoot = runReal()
  const fromElsewhere = spawnSync(process.execPath, [GATE], { cwd: os.tmpdir(), encoding: 'utf8' })

  assert.equal(fromElsewhere.status, 0)
  assert.equal(fromElsewhere.stdout, fromRoot.stdout)
})