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
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const KIT = path.resolve(import.meta.dirname, '..')
const REPO = path.resolve(KIT, '..', '..', '..')
const LAWS = path.join(KIT, 'laws.mjs')
const CONSUMERS = ['landing-page', 'atlas', 'nexus', 'alphalens']
const HERE = path.join(REPO, '..')

/** The line the demonstration edits, and the line it restores. */
const PUBLISHED =
  "message:\n      'A reader followed a link on this site and arrived nowhere. Every address a reader has ever used\\n' +"
const EDITED = "message:\n      'EDITED ONCE, IN THE PACKAGE. Every address a reader has ever used\\n' +"

/** Run the links gate in one consumer, and capture what it printed either way. */
function runLinks(site) {
  try {
    const stdout = execFileSync(process.execPath, [path.join(KIT, 'cli.mjs'), '--gate=links'], {
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
 * On the real repositories this mutates `out/index.html`, which is a build output
 * and is gitignored, so a run leaves the working tree's tracked files untouched. It
 * is still a write into a live repository's export, so the test removes what it
 * planted on the way out and the removal is asserted rather than assumed.
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

  try {
    // Run 1: the law as published. Each consumer must find the defect AND print
    // the wording, which is the whole claim: the message is not the consumer's.
    const first = available.map((site) => ({ site, ...runLinks(site) }))
    for (const row of first) {
      assert.equal(row.exit, 1, `${row.site}: a planted broken destination must fail the gate`)
      assert.match(row.output, /\[internal-destination\]/, `${row.site}: the gate did not name the defect class`)
      assert.ok(
        row.output.includes('A reader followed a link on this site and arrived nowhere'),
        `${row.site}: the gate did not print the law as the package defines it`,
      )
    }

    // The edit. One line, in the package, and the consumers are not touched.
    const source = readFileSync(LAWS, 'utf8')
    assert.ok(source.includes(PUBLISHED), 'the demonstration needs the published wording to be present in laws.mjs')
    writeFileSync(LAWS, source.replace(PUBLISHED, EDITED))

    const second = available.map((site) => ({ site, ...runLinks(site) }))
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
  } finally {
    // Restore the law first, then the exports: a test that leaves the package
    // edited fails the next run for a reason of its own making.
    const source = readFileSync(LAWS, 'utf8')
    if (source.includes(EDITED)) writeFileSync(LAWS, source.replace(EDITED, PUBLISHED))
    unplant()
    assert.ok(
      !readFileSync(LAWS, 'utf8').includes('EDITED ONCE'),
      'the demonstration left the package edited',
    )
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
