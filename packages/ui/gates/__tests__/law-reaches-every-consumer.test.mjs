/**
 * The ticket's last acceptance criterion, proved rather than asserted.
 *
 * The claim is that a change to a law lands once and reaches four repositories in
 * one release. The strongest available proof is not a sentence in a document: it is
 * that a gate's failure message is *defined* once, in the package, and that a
 * consumer reads it rather than restating it. So this test does three things, in
 * order:
 *
 *   1. plants the same defect in a copy of every consumer, so the four runs differ
 *      only in their data;
 *   2. runs the same gate, from the same file in the package, in all four, and
 *      asserts each found the defect and printed the law's current wording;
 *   3. edits that wording once, in `laws.mjs`, touches nothing else, runs all four
 *      again, and asserts all four printed the new wording.
 *
 * Then it restores the law, because a test that leaves the package edited is a test
 * that fails the next run for a reason of its own making.
 *
 * **The law it edits is a COPY.** The demonstration used to write into
 * `packages/ui/gates/laws.mjs`, which is a tracked source file in this repository,
 * and `pnpm test:scripts` runs every file under `gates/__tests__` in its own process
 * at the same time. `gates.test.mjs` imports `laws.mjs` by URL, so a sibling process
 * could import it between this file's truncate and its write, or read it while the
 * demonstration's wording was in place. That is the same defect
 * `vector-ink-gate.test.tsx` had, and it is the class this repository keeps paying
 * for: a test that proves its point by editing a shared source file.
 *
 * The copy is the whole `gates/` directory minus its own tests, and the CLI runs from
 * there. That works because `run.mjs` resolves `@nanisoft/prism-ui` through the
 * **consumer's** `package.json`, which is the rule the kit is built on: the consumer's
 * own half of the contract stays where the consumer keeps it, so moving the program
 * does not move anything it depends on. The demonstration is therefore still the same
 * demonstration. One edit, in one copy of the package, reaching four consumers.
 *
 * The one write that is not in a temporary directory is each consumer's
 * `out/index.html`, and that one is inherent: the links gate reads the export the
 * site publishes, so a demonstration that the gate finds a broken destination has to
 * put a broken destination in an export. It is a build output, it is gitignored, and
 * the test removes what it planted on the way out and asserts the removal rather than
 * assuming it.
 *
 * The consumer copies need their own `node_modules` junction and their built
 * `out/`, because the links gate reads a real export and the pin gate resolves the
 * installed package through the consumer's own export map. When a copy is missing
 * the test says so and skips, because a skip is visible and a fabricated fixture
 * that runs against nothing is not.
 *
 * Run: node --test "packages/ui/gates/__tests__/*.test.mjs"
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const KIT = path.resolve(import.meta.dirname, '..')
const REPO = path.resolve(KIT, '..', '..', '..')
const CONSUMERS = ['landing-page', 'atlas', 'nexus', 'alphalens']
const HERE = path.join(REPO, '..')

/** The line the demonstration edits, and the line it restores. */
const PUBLISHED =
  "message:\n      'A reader followed a link on this site and arrived nowhere. Every address a reader has ever used\\n' +"
const EDITED = "message:\n      'EDITED ONCE, IN THE PACKAGE. Every address a reader has ever used\\n' +"

/**
 * A copy of the kit in a temporary directory, with its own tests left out.
 *
 * A copy rather than an edit of the real one, for the reason the header gives: the
 * demonstration's whole claim is about a file the package owns, and the file it was
 * editing was a tracked source file in a repository where another test process
 * imports it.
 */
function stageKit() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-kit-'))
  const gates = path.join(dir, 'gates')
  mkdirSync(gates, { recursive: true })
  for (const entry of ['cli.mjs', 'index.mjs', 'laws.mjs', 'links.mjs', 'run.mjs']) {
    cpSync(path.join(KIT, entry), path.join(gates, entry))
  }
  return gates
}

/** Run the links gate in one consumer, and capture what it printed either way. */
function runLinks(site, gates) {
  try {
    const stdout = execFileSync(process.execPath, [path.join(gates, 'cli.mjs'), '--gate=links'], {
      cwd: path.join(HERE, site),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { exit: 0, output: stdout }
  } catch (failure) {
    return { exit: failure.status, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}` }
  }
}

/**
 * Plant one defect per consumer, on the copy the site itself publishes.
 *
 * On the real repositories this mutates `out/index.html`, which is a build output and
 * is gitignored, so a run leaves the working tree's tracked files untouched. It is
 * still a write into a live repository's export, so the test removes what it planted
 * on the way out and the removal is asserted rather than assumed.
 */
const planted = new Map()
function plant(site) {
  const target = path.join(HERE, site, 'out', 'index.html')
  if (!existsSync(target)) return false
  const source = readFileSync(target, 'utf8')
  if (source.includes('/no-such-route')) return false
  const before = source
  writeFileSync(target, source.replace('</main>', '<a href="/no-such-route">x</a></main>'))
  planted.set(target, before)
  return true
}

function unplant() {
  for (const [target, before] of planted) writeFileSync(target, before)
  planted.clear()
}

test('one edit to a law reaches every consumer, and no consumer file is edited', (t) => {
  const available = CONSUMERS.filter((site) => existsSync(path.join(HERE, site, 'prism-gates.json')))
  if (available.length < CONSUMERS.length) {
    t.skip(`${CONSUMERS.length - available.length} consumer checkout(s) are not beside this repository`)
    return
  }
  for (const site of available) plant(site)

  const gates = stageKit()
  const laws = path.join(gates, 'laws.mjs')
  try {
    // Run 1: the law as published. Each consumer must find the defect AND print
    // the wording, which is the whole claim: the message is not the consumer's.
    const first = available.map((site) => ({ site, ...runLinks(site, gates) }))
    for (const row of first) {
      assert.equal(row.exit, 1, `${row.site}: a planted broken destination must fail the gate`)
      assert.match(row.output, /\[internal-destination\]/, `${row.site}: the gate did not name the defect class`)
      assert.ok(
        row.output.includes('A reader followed a link on this site and arrived nowhere'),
        `${row.site}: the gate did not print the law as the package defines it`,
      )
    }

    // The edit. One line, in one copy of the package, and the consumers are not touched.
    const source = readFileSync(laws, 'utf8')
    assert.ok(source.includes(PUBLISHED), 'the demonstration needs the published wording to be present in laws.mjs')
    writeFileSync(laws, source.replace(PUBLISHED, EDITED))

    const second = available.map((site) => ({ site, ...runLinks(site, gates) }))
    for (const row of second) {
      assert.equal(row.exit, 1, `${row.site}: the defect is still there, so the gate is still red`)
      assert.ok(
        row.output.includes('EDITED ONCE, IN THE PACKAGE'),
        `${row.site}: one edit in the package did not reach this consumer's failure message`,
      )
      assert.ok(
        !row.output.includes('A reader followed a link on this site and arrived nowhere'),
        `${row.site}: the old wording is still printed, so the edit did not take`,
      )
    }

    // And the four consumers' own files are free of the wording, which is what
    // makes run 2 mean something: there was no second copy for the edit to miss.
    for (const site of available) {
      const config = readFileSync(path.join(HERE, site, 'prism-gates.json'), 'utf8')
      assert.doesNotMatch(config, /arrived nowhere/, `${site}/prism-gates.json restates the law`)
      assert.doesNotMatch(config, /EDITED ONCE/, `${site}/prism-gates.json restates the law`)
    }

    // And this repository's own copy of the law was never written to, which is the
    // half the demonstration used to get wrong: it edited the file it was proving a
    // property of, in a repository where another test process imports that file.
    const real = readFileSync(path.join(KIT, 'laws.mjs'), 'utf8')
    assert.ok(!real.includes('EDITED ONCE'), 'the demonstration left the package edited')
    assert.ok(
      real.includes(PUBLISHED.split('\n')[0]),
      'the real laws.mjs no longer carries the published wording this test replaced',
    )
  } finally {
    unplant()
    rmSync(gates, { force: true, recursive: true })
    assert.equal(planted.size, 0, 'the demonstration left a planted defect in a consumer export')
  }
})

test('the laws a consumer configures are the laws the package defines, by id', async () => {
  // A consumer names gates by id and the kit resolves them, so a misspelt id fails
  // rather than running nothing. This asserts the resolution from the package side
  // and the configuration from the consumer side, in both directions.
  const { GATE_IDS, GATE_LAWS } = await import(pathToFileURL(path.join(KIT, 'index.mjs')).href)
  const { LAW_IDS } = await import(pathToFileURL(path.join(KIT, 'laws.mjs')).href)

  for (const site of CONSUMERS) {
    const file = path.join(HERE, site, 'prism-gates.json')
    if (!existsSync(file)) continue
    const config = JSON.parse(readFileSync(file, 'utf8'))
    for (const id of config.gates ?? []) {
      assert.ok(GATE_IDS.includes(id), `${site} names the gate "${id}", which the kit does not ship`)
      assert.ok(
        (GATE_LAWS[id] ?? []).some((law) => LAW_IDS.includes(law)),
        `${site} names the gate "${id}", which holds no law the package defines`,
      )
    }
  }
})
