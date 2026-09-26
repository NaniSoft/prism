/**
 * Token build determinism gate.
 *
 * Ticket 15 section 9: the DTCG projection is a property of the token source, so
 * the same source must produce the same bytes every time. The corpus package
 * already emits twice and byte-compares; this is the token half of that pair.
 *
 * The build writes into `PRISM_TOKENS_DIST` rather than the live `dist/`, so the
 * comparison never disturbs a running dev server's module graph. Two fresh
 * builds go into `.turbo/determinism/a` and `.turbo/determinism/b`, then every
 * file is compared byte for byte. Any difference fails the build: a
 * non-deterministic token artifact makes review trust worthless.
 *
 * Run: node scripts/check-determinism.mjs
 */
import { spawnSync } from 'node:child_process'
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const BUILD = path.join(PKG, 'build', 'build.mjs')
const WORK = path.join(PKG, '.turbo', 'determinism')

/** Every file under `dir`, relative and posix-separated, sorted. */
async function listFiles(dir, prefix = '') {
  const out = []
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...(await listFiles(path.join(dir, entry.name), rel)))
    else out.push(rel)
  }
  return out
}

function buildInto(distDir) {
  const result = spawnSync(process.execPath, [BUILD], {
    cwd: PKG,
    env: { ...process.env, PRISM_TOKENS_DIST: distDir },
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '')
    process.stderr.write(result.stderr ?? '')
    throw new Error(`token build failed with exit code ${result.status}`)
  }
}

await rm(WORK, { recursive: true, force: true })
const dirA = path.join(WORK, 'a')
const dirB = path.join(WORK, 'b')
await mkdir(dirA, { recursive: true })
await mkdir(dirB, { recursive: true })

buildInto(dirA)
buildInto(dirB)

const filesA = await listFiles(dirA)
const filesB = await listFiles(dirB)

const failures = []
const setA = new Set(filesA)
const setB = new Set(filesB)
for (const file of filesA) {
  if (!setB.has(file)) failures.push(`${file} is emitted by the first build but not the second`)
}
for (const file of filesB) {
  if (!setA.has(file)) failures.push(`${file} is emitted by the second build but not the first`)
}
for (const file of filesA) {
  if (!setB.has(file)) continue
  const [a, b] = await Promise.all([readFile(path.join(dirA, file)), readFile(path.join(dirB, file))])
  if (!a.equals(b)) failures.push(`${file} differs between two builds of the same source`)
}

await rm(WORK, { recursive: true, force: true })

if (failures.length) {
  console.error(`\ndeterminism: ${failures.length} difference(s) across two token builds`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`determinism: ${filesA.length} token artifacts byte-identical across two builds`)
