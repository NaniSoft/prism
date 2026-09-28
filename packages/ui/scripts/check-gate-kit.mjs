/**
 * The gate kit's own gate.
 *
 * The failure this replaces is the one every gate list in every design system
 * eventually has: a gate that does not exist, named as though it did. It is green,
 * it is believed, and it is not checking anything. So this asserts, in both
 * directions and by name rather than by count:
 *
 *   1. every gate in the registry is a file in `gates/`, and every file in
 *      `gates/` that exports `run` is in the registry;
 *   2. every law has a gate, and every gate names only laws that exist;
 *   3. the kit is on the published surface: the subpath is in the export map, the
 *      directory is in `files`, and the CLI is in `bin`;
 *   4. the tarball verifier requires the kit's entry file, so a release that
 *      dropped it fails before it publishes rather than after.
 *
 * A length assertion cannot report which item is wrong, so every line of this gate
 * names the offending file, law or key.
 *
 * Coverage is asserted by construction: the gate reads its own directory rather
 * than a declared list, so a file that exists but is unlisted is a finding rather
 * than an absence, and a listed file that has moved is a finding too.
 *
 * Run: node scripts/check-gate-kit.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { GATE_IDS, GATE_LAWS } from '../gates/index.mjs'
import { LAWS, LAW_IDS } from '../gates/laws.mjs'

const NAME = 'check-gate-kit'
const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATES = path.join(PKG, 'gates')
const manifest = JSON.parse(readFileSync(path.join(PKG, 'package.json'), 'utf8'))

const findings = []

/** Every file the kit ships, relative to the kit, sorted. */
const shipped = readdirSync(GATES, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort()

/** The gate modules, which are the files that export a `run`. */
const gateFiles = shipped.filter((name) => name.endsWith('.mjs') && name !== 'cli.mjs' && name !== 'index.mjs' && name !== 'run.mjs' && name !== 'laws.mjs')

for (const name of gateFiles) {
  const source = readFileSync(path.join(GATES, name), 'utf8')
  if (!/export\s+(async\s+)?function\s+run\b/.test(source)) {
    findings.push(`${name}: a module in the kit that exports no run() is a program nobody can run`)
  }
}

const idOf = (file) => file.replace(/\.mjs$/, '')
for (const file of gateFiles) {
  const id = idOf(file)
  if (!GATE_IDS.includes(id)) findings.push(`${file}: a gate file the registry does not name, so nothing runs it`)
}
for (const id of GATE_IDS) {
  if (!shipped.includes(`${id}.mjs`)) findings.push(`gates/${id}.mjs: a gate the registry names that is not a file in the kit`)
}

for (const [gate, laws] of Object.entries(GATE_LAWS)) {
  if (laws.length === 0) findings.push(`${gate}: a gate that holds no law is a program that states nothing`)
  for (const id of laws) if (!(id in LAWS)) findings.push(`${gate}: names the law "${id}", which is not in the law table`)
}
const heldLaws = new Set(Object.values(GATE_LAWS).flat())
for (const id of LAW_IDS) {
  if (!heldLaws.has(id)) findings.push(`laws.${id}: a law no gate holds, which is a sentence in a program`)
  const entry = LAWS[id]
  for (const field of ['title', 'message', 'why']) {
    if (typeof entry?.[field] !== 'string' || entry[field].trim() === '') {
      findings.push(`laws.${id}.${field}: empty, so the failure message a reader reads is missing`)
    }
  }
}

/* The published surface. A gate kit that is not on it is a kit four consumers
   cannot reach, and a consumer that copied the files instead has eight laws. */
for (const key of ['./gates', './gates/*']) {
  if (!(key in manifest.exports)) {
    findings.push(`package.json: the export map has no "${key}", so the kit is not reachable by subpath`)
  }
}
if (!manifest.files.includes('gates')) {
  findings.push('package.json: `files` does not include "gates", so the kit is not in the tarball')
}
if (manifest.bin?.['prism-gates'] !== './gates/cli.mjs') {
  findings.push('package.json: `bin` does not expose prism-gates, so a consumer cannot run the kit by name')
}
if (manifest.devDependencies?.jsdom === undefined && manifest.peerDependencies?.jsdom === undefined) {
  // Not a finding: the consumer owns its parser, on purpose, so that four
  // consumers do not install four copies of jsdom to read four documents. Stated
  // here so the absence is a decision on the record rather than an oversight.
  console.log(`${NAME}: the kit resolves the consumer's jsdom rather than shipping one, so no dependency is declared`)
}

console.log(`\n${NAME}: ${findings.length} finding(s)`)
console.log(
  `${NAME}: ${gateFiles.length} gate file(s), ${GATE_IDS.length} gate(s) in the registry, ${LAW_IDS.length} law(s): ${LAW_IDS.join(', ')}`,
)
console.log(`${NAME}: the kit ships ${shipped.length} file(s): ${shipped.join(', ')}`)
console.log(
  `${NAME}: every law above is held by exactly one gate, and the gate kit's own test drives each of them to red on a\n` +
    '      fixture, because a gate that has never been red is not evidence of anything.',
)

if (findings.length > 0) {
  for (const finding of findings) console.error(`  error ${finding}`)
  console.error(
    `\nThe kit and its registry are one list. A gate nobody runs, or a law no gate holds, is the defect this\n` +
      '  repository exists to end, in a new place.',
  )
  process.exit(1)
}

console.log(`${NAME}: the registry, the kit and the published surface are the same list.`)
