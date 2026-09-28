/**
 * The gate's own test, driven over the fixture cases that ship beside it.
 *
 * The property under test is not "the gate passes". It is that DELETING or
 * LOOSENING any one of the five patterns turns a case red. Every case asserts a
 * NAMED family rather than a count, and the case set on disk is compared with
 * the case set registered here, so a case that stops firing, a case that is
 * deleted, and a case that is added without being registered are all failures.
 * A count would satisfy none of those.
 *
 * The gate runs as a process and is never imported, for the reason
 * `gates.test.mjs` gives: a test that imports the helper proves the helper, not
 * the gate. The gate is a script whose whole body is its run, so importing it
 * would run it.
 *
 * Run: node --test "scripts/__tests__/no-legacy-line.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const GATE = path.join(REPO, 'scripts', 'check-no-legacy-line.mjs')
const FIXTURES = path.join(REPO, 'scripts', 'fixtures', 'no-legacy-line')
const TEMPLATE = path.join(FIXTURES, 'template')
const CASES = path.join(FIXTURES, 'cases')
const NOT_THE_ROOT = path.join(REPO, 'packages', 'ui')

/** Every root the gate declares, which is also the fixture template's shape. */
const ROOTS = 51

/**
 * The roots the gate reads when present and does not require. They are
 * gitignored build outputs written at `prepack`, so the template has none of
 * them: a staged tree is already the case where every one is absent.
 */
const OPTIONAL_ROOTS = [
  'packages/tokens/THIRD-PARTY-NOTICES.md',
  'packages/ui/THIRD-PARTY-NOTICES.md',
  'packages/llms/THIRD-PARTY-NOTICES.md',
  'packages/mcp-server/THIRD-PARTY-NOTICES.md',
]

const tempTree = () => mkdtempSync(path.join(os.tmpdir(), 'prism-legacy-'))

/** A throwaway copy of the template, which satisfies every configured root. */
function stageTemplate() {
  const dir = tempTree()
  cpSync(TEMPLATE, dir, { recursive: true })
  return dir
}

/**
 * A tree for one case: the template with the case's files laid over it. The
 * copy is what lets a case mutate the tree (drop a root, empty it) without
 * touching the committed fixture.
 */
function stage(name, mutate) {
  const dir = stageTemplate()
  cpSync(path.join(CASES, name), dir, { recursive: true })
  if (mutate) mutate(dir)
  return dir
}

const run = (cwd, args = []) => spawnSync(process.execPath, [GATE, ...args], { cwd, encoding: 'utf8' })

const overRepo = (dir) => run(REPO, [`--repo=${dir}`])

/** The families a run reported. A finding is stderr, a discharge is stdout. */
const families = (output) => [...output.matchAll(/\[([a-z-]+)\]/g)].map((match) => match[1])

const discharges = (output) =>
  [...output.matchAll(/\[([a-z-]+)\]\s+DISCHARGED by convention `([a-z-]+)`/g)].map((m) => [m[1], m[2]])

/** Both causes, so no test passes on a message that names only one. */
const BOTH_CAUSES = /wrong working directory[\s\S]*does not exist in the repository at all/

/**
 * Every case that must FAIL the gate, with the family only that case can
 * produce. An entry here is a claim about one specific pattern, so removing
 * that pattern from the rule table leaves this list pointing at a case that no
 * longer fires.
 */
const FAILING_CASES = [
  ['manifest-dependency', 'manifest-dependency'],
  ['lockfile-transitive', 'lockfile-reachability'],
  ['bare-export', 'module-specifier'],
  ['custom-property', 'custom-property'],
  ['ruleset-class', 'ruleset-class'],
  ['artefact-name', 'artefact-path-name'],
  ['artefact-exists', 'artefact-path-exists'],
  ['prose', 'vendor-name'],
]

/** Every case that must PASS the gate, with why it is a case at all. */
const PASSING_CASES = [
  ['historical-record', 'the closed historical-record allowlist'],
  ['package-name-anchoring', 'neighbour package names that merely resemble the vendor'],
]

/** Every file under a directory, relative to it, so a fixture is provably real. */
function filesUnder(dir, base = dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...filesUnder(full, base))
    else found.push(path.relative(base, full).split(path.sep).join('/'))
  }
  return found
}

test('every registered case exists on disk, and every case on disk is registered', () => {
  const registered = [...FAILING_CASES, ...PASSING_CASES].map(([name]) => name).sort()
  const onDisk = readdirSync(CASES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  assert.deepEqual(onDisk, registered, 'a case that is added or deleted must be registered here')
  for (const name of registered) {
    assert.ok(
      filesUnder(path.join(CASES, name)).length > 0,
      `the ${name} case ships no file, so it cannot fire and its rule is untested`,
    )
  }
})

test('each of the five families has a case that only that family can produce', () => {
  for (const [name, family] of FAILING_CASES) {
    const result = overRepo(stage(name))

    assert.equal(result.status, 1, `the ${name} case must fail the gate:\n${result.stderr}`)
    assert.ok(
      families(result.stderr).includes(family),
      `the ${name} case must report [${family}]; it reported ${JSON.stringify(families(result.stderr))}`,
    )
  }
})

test('each passing case still passes, so a widened pattern is red too', () => {
  for (const [name, why] of PASSING_CASES) {
    const result = overRepo(stage(name))

    assert.equal(result.status, 0, `the ${name} case must pass (${why}):\n${result.stderr}`)
    assert.equal(result.stderr, '', `the ${name} case must report nothing on stderr (${why})`)
  }
})

test('a package name that merely resembles the vendor is not the vendor', () => {
  // The anchoring is the load-bearing part of the package-specifier pattern, so
  // it is pinned by a case rather than left to the reader. `plantd-theme`
  // CONTAINS the four characters a substring match would admit and is a
  // different package; `@ant-design-system/tokens` is a different SCOPE that a
  // prefix match on the scope would admit. Loosening either turns this red.
  const dir = stage('package-name-anchoring')
  const declared = JSON.parse(readFileSync(path.join(dir, 'packages/ui/package.json'), 'utf8'))
  const names = Object.keys(declared.dependencies)
  assert.ok(
    names.some((name) => name.includes('antd')),
    'the decoy must CONTAIN the characters a substring match would admit',
  )
  assert.ok(
    names.some((name) => name.startsWith('@ant-design')),
    'the decoy must START WITH the scope a prefix match would admit',
  )

  const result = overRepo(dir)

  assert.equal(result.status, 0, `a neighbour package is not the old line:\n${result.stderr}`)
  assert.equal(result.stderr, '')
})

test('the bare export is the case a subpath-anchored pattern would miss', () => {
  const result = overRepo(stage('bare-export'))

  assert.equal(result.status, 1)
  // The bare root with no subpath at all, which `from 'antd/` cannot match.
  assert.match(result.stderr, /from 'antd'/)
  assert.match(result.stderr, /require\('antd'\)/)
  assert.match(result.stderr, /import\('antd\/es\/button'\)/)
  assert.match(result.stderr, /from "@ant-design\/icons"/)
})

test('a transitive declaration is caught, and a base64 hash in the same file is not', () => {
  const dir = stage('lockfile-transitive')
  const result = overRepo(dir)

  assert.equal(result.status, 1)
  const found = result.stderr.split('\n').filter((line) => line.includes('[lockfile-reachability]'))
  // Reached from an importer, through a package no manifest mentions.
  assert.ok(
    found.some((line) => line.includes('reachable from importer `packages/ui`') && line.includes('antd')),
    `a transitive declaration must be found from the importer:\n${result.stderr}`,
  )
  assert.ok(
    found.some((line) => line.includes('@ant-design/nextjs-registry')),
    'a transitive declaration under a scope must be found too',
  )
  // This case ships no manifest, so the one under test is the template's, which
  // declares nothing at all. The vendor is therefore reachable only through
  // the lockfile, which is the whole claim of the family.
  const declared = JSON.parse(readFileSync(path.join(dir, 'packages/ui/package.json'), 'utf8'))
  assert.equal(declared.dependencies, undefined)
  assert.equal(declared.devDependencies, undefined)
})

test('deleting a dependency line does not empty the tree while another package declares it', () => {
  const dir = stage('lockfile-transitive', (tree) => {
    writeFileSync(
      path.join(tree, 'packages/ui/package.json'),
      `${JSON.stringify({ name: '@nanisoft/prism-ui', version: '0.0.0', private: true }, null, 2)}\n`,
    )
  })

  const result = overRepo(dir)

  assert.equal(result.status, 1, 'the answer comes from the graph, not from the importer line')
  assert.ok(families(result.stderr).includes('lockfile-reachability'))
})

test('an integrity hash containing the vendor is not a finding, on the same bytes a grep would fire on', () => {
  const dir = stageTemplate()
  const lock = readFileSync(path.join(dir, 'pnpm-lock.yaml'), 'utf8')
  const hash = /integrity: sha512-([A-Za-z0-9+/=]+)/.exec(lock)[1]

  // The false positive is constructed, not asserted in a comment: the fixture's
  // hash is a base64 payload that literally spells the vendor, so a grep over
  // this file fires and a grep is the failure this gate exists to refuse.
  assert.ok(hash.includes('antd'), 'the fixture hash must contain the characters the pattern admits')
  assert.match(hash, /^[A-Za-z0-9+/]+={0,2}$/, 'it is a base64 payload, not a package name')
  assert.ok(
    !/\bantd\b/.test(lock.replace(hash, '')),
    'outside its hash the clean lockfile must not spell the vendor at all',
  )

  const result = overRepo(dir)

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.equal(result.stderr, '', 'the hash must produce no finding')
  assert.match(result.stdout, /0 finding\(s\)/)
  assert.match(result.stdout, /read as a graph, never grepped: pnpm-lock\.yaml/)
})

test('a historical record is discharged by convention, and the discharge is printed', () => {
  const result = overRepo(stage('historical-record'))

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.equal(result.stderr, '', 'a discharged line is not written to stderr')

  // Every convention in the closed allowlist is exercised, so removing one is red.
  assert.deepEqual(
    [...new Set(discharges(result.stdout).map(([, id]) => id))].sort(),
    ['architecture-decision', 'archive-segment', 'changelog', 'history-segment', 'migration-note'],
  )
  // A discharge carries the file, the line, the matched text and the reason,
  // because a rule that fires on nothing is indistinguishable from a rule that
  // found nothing to say.
  assert.match(result.stdout, /packages\/ui\/CHANGELOG\.md:5\s+\[vendor-name\]\s+DISCHARGED by convention `changelog`/)
  assert.match(result.stdout, /MIGRATION\.md:3\s+\[vendor-name\]\s+DISCHARGED by convention `migration-note`/)
  assert.match(result.stdout, /docs\/adr\/0001-record-the-old-line\.md:1\s+\[vendor-name\]\s+DISCHARGED by convention `architecture-decision`/)
  assert.match(result.stdout, /docs\/history\/old-line\.md:3\s+\[vendor-name\]\s+DISCHARGED by convention `history-segment`/)
  assert.match(result.stdout, /docs\/archive\/old-line\.md:3\s+\[vendor-name\]\s+DISCHARGED by convention `archive-segment`/)
  // A historical record names the old ARTEFACTS as well as the vendor, and a
  // record is discharged from the artefact rule on the same convention rather
  // than being a special case of it.
  assert.match(result.stdout, /packages\/ui\/CHANGELOG\.md:6\s+\[artefact-path-name\]\s+DISCHARGED by convention `changelog`/)
  // The matched text and the reason are printed, not just the count, so a
  // reader can see what was excused and why without opening the file.
  assert.match(result.stdout, /matched Ant Design, excused because /)
  // One skipped file per convention, and a count rather than a total, so the
  // coverage line stays falsifiable against what the run actually discharged.
  assert.match(result.stdout, /5 file\(s\) skipped as historical record\(s\)/)
  assert.match(result.stdout, /9 discharge\(s\)/)
})

test('a missing root fails loudly naming both causes', () => {
  const result = overRepo(
    stage('manifest-dependency', (tree) => {
      rmSync(path.join(tree, 'docs'), { recursive: true })
    }),
  )

  assert.equal(result.status, 1)
  assert.match(result.stderr, BOTH_CAUSES)
  assert.match(result.stderr, /1 of \d+ configured root does not resolve: "docs"/)
  assert.doesNotMatch(result.stdout, /finding\(s\)/, 'a run that resolved nothing must not report a count')
})

test('a tree whose roots all resolve but hold nothing readable fails rather than passing', () => {
  const dir = stageTemplate()

  // Turn every file in the tree into an empty directory of the same name. Each
  // configured root is then still there, so `assertRootsResolve` passes, and
  // the extension filter matches nothing anywhere, so `assertFilesRead` is the
  // assertion under test. This is the state that used to report zero
  // violations over zero files.
  for (const file of filesUnder(dir)) {
    const abs = path.join(dir, file)
    rmSync(abs)
    mkdirSync(abs, { recursive: true })
  }

  const result = overRepo(dir)

  assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`)
  assert.match(result.stderr, /read 0 files/)
  assert.match(result.stderr, /Every root resolved, so this is not a missing-directory problem/)
  assert.doesNotMatch(result.stdout, /0 finding\(s\)/)
})

test('there is no report-only mode: a finding fails the run whatever else is asked for', () => {
  for (const flag of ['--report', '--report-only', '--quiet', '--warn', '--help']) {
    const result = run(REPO, [`--repo=${path.join(CASES, '..')}`, flag])
    assert.equal(result.status, 1, `${flag} must not turn a finding into a pass`)
  }
})

test('a run from a working directory that is not the root reads the same tree', () => {
  const dir = stage('historical-record')

  const fromPackage = run(NOT_THE_ROOT, [`--repo=${dir}`])
  const fromRoot = run(TEMPLATE, [`--repo=${dir}`])
  const fromOs = run(os.tmpdir(), [`--repo=${dir}`])

  assert.equal(fromPackage.status, 0)
  assert.equal(fromRoot.status, 0)
  assert.equal(fromPackage.stdout, fromRoot.stdout)
  assert.equal(fromPackage.stdout, fromOs.stdout, 'the working directory cannot change what the gate reads')
  assert.match(fromPackage.stdout, new RegExp(`across ${ROOTS} root\\(s\\) \\(0 unresolved\\)`))
})

test('the gate states what it read, and names every path it excluded', () => {
  const result = overRepo(stage('historical-record'))

  assert.equal(result.status, 0)
  assert.match(result.stdout, new RegExp(`0 finding\\(s\\) in \\d+ file\\(s\\) read across ${ROOTS} root\\(s\\) \\(0 unresolved\\)`))
  assert.match(result.stdout, /\d+ file\(s\) skipped as historical record\(s\), \d+ discharge\(s\)/)
  assert.match(result.stdout, /read as a graph, never grepped: pnpm-lock\.yaml/)
  // The gate's own rule table, its own test and its own fixtures all spell the
  // vendor, so all three are excluded and all three are printed.
  assert.match(result.stdout, /excluded from the text rules: .*check-no-legacy-line\.mjs/)
  assert.match(result.stdout, /no-legacy-line\.test\.mjs/)
  assert.match(result.stdout, /fixtures\/no-legacy-line/)
})

test('the real repository passes, and prints its one historical-record discharge', () => {
  const result = run(REPO)

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.equal(result.stderr, '', 'a clean tree reports nothing on stderr')
  assert.match(result.stdout, new RegExp(`0 finding\\(s\\) in \\d+ file\\(s\\) read across ${ROOTS} root\\(s\\) \\(0 unresolved\\)`))
  // The single vendor mention in the whole repository is the migration note,
  // and it is printed rather than only counted.
  assert.match(result.stdout, /MIGRATION\.md:194\s+\[vendor-name\]\s+DISCHARGED by convention `migration-note`/)
  assert.match(result.stdout, /1 file\(s\) skipped as historical record\(s\)/)
  assert.match(result.stdout, /read as a graph, never grepped: pnpm-lock\.yaml/)
})

test('an absent optional root is reported absent, not read', () => {
  // A status line that cannot report absence is not a coverage claim. The
  // comparison is keyed on the walker's repository-relative field rather than
  // its absolute `root`, because the absolute path is platform-separated and the
  // declared list is not: comparing the two matched nothing, and every optional
  // root reported itself read whether or not the file existed. That shipped
  // because the developer's tree has the files (a publish rehearsal wrote them)
  // and only a clean checkout does not. This drives the tree where they are
  // genuinely missing, which is what a clean clone and CI both look like.
  const dir = stageTemplate()
  for (const root of OPTIONAL_ROOTS) {
    assert.equal(existsSync(path.join(dir, root)), false, `${root} must be absent from the template`)
  }

  const result = overRepo(dir)
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  for (const root of OPTIONAL_ROOTS) {
    assert.match(
      result.stdout,
      new RegExp(`${root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\(absent\\)`),
      `the run must report ${root} as absent, not read`,
    )
  }
  assert.doesNotMatch(result.stdout, /\(read\)/, 'nothing optional resolved, so nothing may claim it did')
})

test('an optional root that exists is read and scanned, not skipped', () => {
  // The absence must not be the only behaviour: a notices file is generated from
  // what is actually installed, so a vendor named in one is a finding and not a
  // record. This pins that a present optional root is really scanned.
  const dir = stageTemplate()
  const notices = path.join(dir, 'packages', 'ui', 'THIRD-PARTY-NOTICES.md')
  writeFileSync(notices, '# Third party notices\n\nThis product bundles antd 6.6.4\n')

  const result = overRepo(dir)
  assert.equal(result.status, 1, 'a vendor in a present notices file is a finding')
  assert.match(result.stdout, /packages\/ui\/THIRD-PARTY-NOTICES\.md/)
  assert.match(result.stdout, /packages\/ui\/THIRD-PARTY-NOTICES\.md \(read\)/)
})

test('a CRLF lockfile is the same graph, not an empty one', () => {
  // This is a bug the LF fixture did not catch. Splitting on '\n' alone leaves
  // a '\r' on every line of a Windows checkout, `section` never matches, the
  // graph comes back with zero importers, and a reachability gate over an empty
  // graph reports a clean pass. The real repository's lockfile is CRLF, which is
  // how it was found; this pins it.
  const dir = stage('lockfile-transitive')
  const lock = path.join(dir, 'pnpm-lock.yaml')

  writeFileSync(lock, readFileSync(lock, 'utf8').replace(/\n/g, '\r\n'))
  const crlf = overRepo(dir)
  const lf = overRepo(stage('lockfile-transitive'))

  assert.match(crlf.stderr, /reachable from importer `packages\/ui`/)
  assert.equal(crlf.status, 1)
  // The two must agree on the finding, so the line ending cannot change the
  // verdict, only whether the verdict is reached at all.
  assert.equal(
    crlf.stderr.split('\n').filter((l) => l.includes('[lockfile-reachability]')).length,
    lf.stderr.split('\n').filter((l) => l.includes('[lockfile-reachability]')).length,
  )
})

test('the real lockfile resolves into a graph that can find a vendor', () => {
  // The real tree passes. That pass is only evidence if the real lockfile was
  // actually resolved into a graph, so the CRLF case is proved against THIS file
  // rather than only against a fixture: a gate whose graph came back empty would
  // also pass on the real tree, which is exactly the failure being replaced.
  //
  // This asserts a property of the PARSER, not of the file. Asserting that the
  // checked-in lockfile happens to be CRLF is a claim about one machine's
  // checkout, and it is false on the Linux runner: git writes LF there and
  // LF here only because this working tree has `core.autocrlf` set. A test that
  // passes on the author's checkout and fails on the runner is a test of the
  // environment. The invariant is that both spellings resolve, which is pinned
  // by running this against each.
  const real = readFileSync(path.join(REPO, 'pnpm-lock.yaml'), 'utf8')
  const lf = real.replace(/\r\n/g, '\n')

  for (const [label, text] of [
    ['as checked out', real],
    ['normalised to LF', lf],
  ]) {
    // A copy of the REAL lockfile, with one vendor package added to one importer,
    // must produce a finding. If the real lockfile resolved to an empty graph,
    // this would be green. The line ending is taken from the text being patched,
    // not from the checked-out file, so the LF variant is patched as LF.
    const eol = text.includes('\r\n') ? '\r\n' : '\n'
    const dir = stageTemplate()
    const patched = text.replace(
      `  packages/ui:${eol}    dependencies:${eol}`,
      `  packages/ui:${eol}    dependencies:${eol}      antd:${eol}        specifier: ^6.6.4${eol}        version: 6.6.4${eol}`,
    )
    // Not `assert.notEqual`: on a mismatch it would print both 400 KB strings,
    // which buries the one line a reader needs.
    if (patched === text) throw new Error(`the real lockfile must be patchable to prove anything (${label})`)
    writeFileSync(path.join(dir, 'pnpm-lock.yaml'), patched)

    const result = overRepo(dir)
    assert.equal(result.status, 1, `a vendor added to the real lockfile must be found (${label})`)
    assert.match(
      result.stderr + result.stdout,
      /antd.*reachable from importer `packages\/ui`/s,
      `the finding must name the vendor and the importer (${label})`,
    )
  }
})

test('the real lockfile has no vendor package reachable from any importer', () => {
  // And unmodified, the real lockfile finds nothing. Both halves matter: the
  // previous test says the graph is read, this one says what it read is clean.
  const dir = stageTemplate()
  writeFileSync(path.join(dir, 'pnpm-lock.yaml'), readFileSync(path.join(REPO, 'pnpm-lock.yaml')))
  const result = overRepo(dir)
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  assert.doesNotMatch(result.stderr, /lockfile-reachability/)
  assert.match(result.stdout, /read as a graph, never grepped: pnpm-lock\.yaml/)

  // The transitive case still names its importer, so the clean result above is a
  // read graph and not a silently empty one.
  const injected = overRepo(stage('lockfile-transitive'))
  assert.equal(injected.status, 1)
  assert.match(injected.stderr, /reachable from importer `packages\/ui`/)
})
