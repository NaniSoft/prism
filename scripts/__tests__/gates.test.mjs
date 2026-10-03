/**
 * The four gates, run as processes, from a working directory that is not the
 * repository root.
 *
 * This is the lane the ticket asked for: each gate used to be able to exit 0
 * having read nothing, with a success line shaped exactly like a real pass. The
 * three habits this suite pins down are:
 *
 *   1. a gate reads what its own location says, so a run from another directory
 *      is the same run rather than a smaller one;
 *   2. a gate pointed at a directory that is not the repository fails loudly and
 *      names both causes, rather than reporting an empty result as a pass;
 *   3. a gate that built or read nothing says so in a way that cannot be read as
 *      success.
 *
 * Habit 2 is proved with the real gate scripts staged into a directory that is
 * not the repository, because that is the only way to point a gate at the wrong
 * directory once habit 1 has removed the working directory as a variable. The
 * scripts are copied rather than reimplemented, so what runs is the shipped
 * file: `check-dashes.mjs` and `check-elevation-layout.mjs` bring
 * `lib/walk.mjs` with them, and `check-determinism.mjs` reads its build script
 * and its source root from beside itself, which is what lets a stub build stand
 * in for the token build.
 *
 * Run: node --test "scripts/__tests__/*.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const SCRIPT_DIR = path.join(REPO, 'scripts')
const DASHES = path.join(SCRIPT_DIR, 'check-dashes.mjs')
const ELEVATION = path.join(SCRIPT_DIR, 'check-elevation-layout.mjs')
const CHANGESETS = path.join(SCRIPT_DIR, 'validate-changesets.mjs')
const DETERMINISM = path.join(REPO, 'packages', 'tokens', 'scripts', 'check-determinism.mjs')
const NOT_THE_ROOT = path.join(REPO, 'packages', 'ui')

const tempTree = () => mkdtempSync(path.join(os.tmpdir(), 'prism-gate-'))

/** Copy a gate and whatever it imports into `<dir>/scripts/`, and return its path. */
function stageGate(name, dir) {
  const scripts = path.join(dir, 'scripts')
  mkdirSync(path.join(scripts, 'lib'), { recursive: true })
  copyFileSync(path.join(SCRIPT_DIR, name), path.join(scripts, name))
  copyFileSync(path.join(SCRIPT_DIR, 'lib', 'walk.mjs'), path.join(scripts, 'lib', 'walk.mjs'))
  return path.join(scripts, name)
}

const run = (gate, cwd) =>
  spawnSync(process.execPath, [gate], { cwd, encoding: 'utf8', env: { ...process.env } })

/**
 * How many roots `check-dashes` declares, read out of the gate rather than typed
 * here. A hard-coded count in a test about coverage is a second list that drifts:
 * adding the consumer gate kit's root moved that number once, and a test printing
 * the old figure would have failed for a reason that had nothing to do with the
 * claim it was making. Counted from the ROOTS array's own entries, so the GATED
 * list beside it does not inflate the number.
 */
const dashRootCount = () => {
  const source = readFileSync(DASHES, 'utf8')
  const block = source.slice(source.indexOf('const ROOTS = ['), source.indexOf('const EXT ='))
  return block.split('\n').filter((line) => /^ {2}'[a-zA-Z]/.test(line)).length
}

/**
 * The roots `check-elevation-layout` declares, read out of the gate rather than
 * typed here, for the reason `dashRootCount` gives.
 *
 * The count alone was hard-coded until this gate took a fourth root, and the test
 * that staged it into a directory that is not the repository then failed with
 * `2 of 3 configured roots` against a gate saying `3 of 4`. That is the same
 * defect the count was introduced to prevent, one layer up: a number about a
 * gate's coverage, written beside the gate instead of read from it. So the names
 * come out of the array too, and the assertion below names the roots the gate
 * itself will name, which is the whole claim.
 */
const elevationRoots = () => {
  const source = readFileSync(ELEVATION, 'utf8')
  const block = source.slice(source.indexOf('const ROOTS = ['), source.indexOf('const EXT ='))
  return block
    .split('\n')
    .filter((line) => /^ {2}'[a-zA-Z]/.test(line))
    .map((line) => line.trim().replace(/'/g, '').replace(/,$/, ''))
}

/** Both causes, so a test cannot pass on a message that names only one. */
const BOTH_CAUSES = /wrong working directory[\s\S]*does not exist in the repository at all/

test('check-dashes reads the same coverage from a working directory that is not the root', () => {
  const fromPackage = run(DASHES, NOT_THE_ROOT)
  const fromRoot = run(DASHES, REPO)

  assert.equal(fromPackage.status, 0)
  assert.equal(fromRoot.status, 0)
  assert.match(fromPackage.stdout, new RegExp(`in ${dashRootCount()} root\\(s\\) \\(0 unresolved\\)`))

  const files = fromRoot.stdout.match(/across \d+ file\(s\)/)[0]
  assert.ok(
    fromPackage.stdout.includes(files),
    `the wrong working directory cannot reduce what the gate reads (expected "${files}")`,
  )
})

test('check-dashes pointed at a directory that is not the repository fails loudly', () => {
  const dir = tempTree()
  const gate = stageGate('check-dashes.mjs', dir)

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, BOTH_CAUSES)
  // The staged `scripts` root does resolve, which is the point: a partial read is
  // reported rather than passing as a smaller run.
  const roots = dashRootCount()
  assert.match(result.stderr, new RegExp(`${roots - 1} of ${roots} configured roots do not resolve`))
  assert.doesNotMatch(result.stdout, /dashes: 0 in reader-facing copy/)
})

test('check-elevation-layout pointed at a directory that is not the repository fails loudly', () => {
  const dir = tempTree()
  const gate = stageGate('check-elevation-layout.mjs', dir)

  const result = run(gate, dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, BOTH_CAUSES)
  // The staged `scripts` root does resolve, which is the point: a partial read
  // is reported rather than passing as a smaller run. `stageGate` writes into
  // `<dir>/scripts`, so that is the one root of the gate's own list that exists.
  const roots = elevationRoots()
  const absent = roots.filter((root) => root !== 'scripts')
  assert.match(result.stderr, new RegExp(`${absent.length} of ${roots.length} configured roots do not resolve`))
  assert.match(result.stderr, new RegExp(absent.map((root) => `"${root}"`).join(', ')))
})

test('the changeset validator tells a missing .changeset from an empty one', () => {
  const missing = tempTree()
  const empty = tempTree()
  for (const dir of [missing, empty]) {
    writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'prism' }))
    mkdirSync(path.join(dir, 'packages', 'ui'), { recursive: true })
    writeFileSync(
      path.join(dir, 'packages', 'ui', 'package.json'),
      JSON.stringify({ name: '@nanisoft/prism-ui' }),
    )
    mkdirSync(path.join(dir, 'apps', 'site'), { recursive: true })
    writeFileSync(
      path.join(dir, 'apps', 'site', 'package.json'),
      JSON.stringify({ name: '@nanisoft/site' }),
    )
  }

  const withoutDirectory = run(stageGate('validate-changesets.mjs', missing), missing)
  assert.equal(withoutDirectory.status, 1)
  assert.match(withoutDirectory.stderr, BOTH_CAUSES)
  assert.match(withoutDirectory.stderr, /1 of 3 configured root does not resolve: "\.changeset"/)
  assert.doesNotMatch(withoutDirectory.stdout, /changesets:/)

  mkdirSync(path.join(empty, '.changeset'))
  const withEmptyDirectory = run(stageGate('validate-changesets.mjs', empty), empty)
  assert.equal(withEmptyDirectory.status, 0)
  assert.match(withEmptyDirectory.stdout, /none found, so nothing was validated/)
  assert.match(withEmptyDirectory.stdout, /0 unresolved/)
})

test('the changeset validator reads its root from its own location, not the caller', () => {
  const fromPackage = run(CHANGESETS, NOT_THE_ROOT)
  const fromRoot = run(CHANGESETS, REPO)

  assert.equal(fromPackage.status, 0)
  // The property this test is for: the two runs agree, so the caller's working
  // directory cannot change what was read.
  assert.equal(fromPackage.stdout, fromRoot.stdout)
  // What it read is checked against the tree rather than against a state. An
  // earlier version asserted the output did NOT say "none found", which was a
  // claim about the repository having pending changesets rather than about the
  // gate. Merging a release consumes every changeset, so that assertion passed
  // until the day it was guaranteed to fail, and it said nothing about the gate
  // on any other day.
  const onDisk = readdirSync(path.join(REPO, '.changeset')).filter(
    (name) => name.endsWith('.md') && name !== 'README.md',
  ).length
  const reported = /read (\d+) changeset\(s\)/.exec(fromPackage.stdout)
  assert.ok(reported, fromPackage.stdout)
  assert.equal(reported[1], String(onDisk))
  // And with nothing pending it says so in the neutral wording rather than
  // claiming a validation it did not perform.
  if (onDisk === 0) {
    assert.match(fromPackage.stdout, /none found, so nothing was validated/)
  }
})

test('check-determinism rejects a comparison over zero artifacts', () => {
  const dir = tempTree()
  const pkg = path.join(dir, 'tokens')
  const scripts = path.join(pkg, 'scripts')
  mkdirSync(scripts, { recursive: true })
  mkdirSync(path.join(pkg, 'build'), { recursive: true })
  mkdirSync(path.join(pkg, 'src'), { recursive: true })
  writeFileSync(path.join(pkg, 'src', 'seed.tokens.json'), '{}\n')
  copyFileSync(DETERMINISM, path.join(scripts, 'check-determinism.mjs'))
  // A build that succeeds and emits nothing: the case the gate used to pass on.
  writeFileSync(path.join(pkg, 'build', 'build.mjs'), 'process.exit(0)\n')

  const empty = run(path.join(scripts, 'check-determinism.mjs'), dir)

  assert.equal(empty.status, 1)
  assert.match(empty.stderr, /both builds emitted 0 artifacts/)
  assert.doesNotMatch(empty.stdout, /byte-identical/)

  // The control: the same gate, the same tree, a build that emits one artifact.
  writeFileSync(
    path.join(pkg, 'build', 'build.mjs'),
    [
      "import { writeFileSync } from 'node:fs'",
      "import path from 'node:path'",
      "const out = process.env.PRISM_TOKENS_DIST",
      "writeFileSync(path.join(out, 'light.css'), ':root {}\\n')",
      '',
    ].join('\n'),
  )

  const oneArtifact = run(path.join(scripts, 'check-determinism.mjs'), dir)

  assert.equal(oneArtifact.status, 0)
  assert.match(oneArtifact.stdout, /1 token artifacts byte-identical across two builds/)
  assert.match(oneArtifact.stdout, /2 resolved root\(s\) and 0 unresolved/)
})

test('check-determinism fails when its own input root does not resolve', () => {
  const dir = tempTree()
  const pkg = path.join(dir, 'tokens')
  const scripts = path.join(pkg, 'scripts')
  mkdirSync(scripts, { recursive: true })
  copyFileSync(DETERMINISM, path.join(scripts, 'check-determinism.mjs'))

  const result = run(path.join(scripts, 'check-determinism.mjs'), dir)

  assert.equal(result.status, 1)
  assert.match(result.stderr, BOTH_CAUSES)
  assert.match(result.stderr, /2 of 2 configured roots do not resolve/)
  assert.doesNotMatch(result.stdout, /byte-identical/)
})

test('the real gates still pass and state their coverage', () => {
  const dashes = run(DASHES, REPO)
  const elevation = run(ELEVATION, REPO)
  const changesets = run(CHANGESETS, REPO)

  assert.equal(dashes.status, 0, dashes.stderr)
  assert.equal(elevation.status, 0, elevation.stderr)
  assert.equal(changesets.status, 0, changesets.stderr)
  assert.match(dashes.stdout, /0 in reader-facing copy/)
  assert.match(dashes.stdout, /0 unresolved\)/)
  assert.match(dashes.stdout, /read but not gated: .*scripts \(read, not gated\)/)
  assert.match(elevation.stdout, /0 violation\(s\) in \d+ file\(s\)/)
  assert.match(elevation.stdout, /0 root\(s\) unresolved/)
  assert.match(elevation.stdout, /excluded from every rule: .*check-elevation-layout\.mjs/)
  assert.match(changesets.stdout, /read \d+ changeset\(s\) and \d+ workspace manifest\(s\)/)
  assert.match(changesets.stdout, /0 unresolved/)
})
