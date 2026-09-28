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
 * Two empty builds compare equal, so this gate used to print
 * `0 token artifacts byte-identical across two builds` and exit 0 when the
 * builds had emitted nothing: a pass shaped exactly like a real one, on the
 * release path, because `packages/tokens` `build` runs this gate and `build`
 * runs before `prepack`. It now refuses to report on an empty comparison, and it
 * says what it read. The input root is asserted before the builds rather than
 * inferred from the artifact count afterwards, so a run from a tree that is not
 * this package names the two causes instead of reporting zero.
 *
 * Run: node scripts/check-determinism.mjs
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const BUILD = path.join(PKG, 'build', 'build.mjs')
const SOURCE = path.join(PKG, 'src')
const WORK = path.join(PKG, '.turbo', 'determinism')

/**
 * Every configured root, resolved from this file's own location rather than
 * `process.cwd()`, which is already the case here: habit 1 was not what was
 * wrong with this gate. What follows is habit 2 applied to the input root.
 */
const ROOTS = [
  { relative: 'build/build.mjs', exists: existsSync(BUILD) },
  { relative: 'src', exists: existsSync(SOURCE) },
]

const unresolved = ROOTS.filter((root) => !root.exists)
if (unresolved.length > 0) {
  const listed = unresolved.map((root) => `"${root.relative}"`).join(', ')
  const plural = unresolved.length === 1 ? 'root does not resolve' : 'roots do not resolve'
  console.error(
    `\ndeterminism: ${unresolved.length} of ${ROOTS.length} configured ${plural}: ${listed}\n` +
      '  Two causes, and this run cannot tell them apart:\n' +
      '  (1) the gate was run against the wrong tree or the wrong working directory, so the\n' +
      '      root is not where this script expects it - run it from packages/tokens;\n' +
      '  (2) the root does not exist in the repository at all, so the token source or the\n' +
      '      build script was renamed, moved or never committed.\n' +
      '  A gate that built nothing and reported zero differences is the failure this\n' +
      '  replaces, so an unresolved root fails the run rather than emptying it.',
  )
  process.exit(1)
}

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

/**
 * Two empty builds are byte-identical, so the comparison below is vacuous
 * without this. A run that built nothing has proved nothing, and reporting
 * `0 artifacts byte-identical` reads as an achievement on a lane that gates the
 * release.
 */
if (filesA.length === 0 && filesB.length === 0) {
  await rm(WORK, { recursive: true, force: true })
  console.error(
    '\ndeterminism: both builds emitted 0 artifacts, so there was nothing to compare.\n' +
      '  Three causes, and this run cannot tell them apart:\n' +
      '  (1) the build wrote somewhere other than the two directories being compared, so\n' +
      '      the comparison read two empty trees;\n' +
      '  (2) the token source the build reads emitted nothing, which is the same absence\n' +
      '      whether the source root did not resolve or the projection matches no token;\n' +
      '  (3) the build succeeded over an empty source, which is a defect in its own right.\n' +
      '  A byte-identical comparison of two empty builds is not a pass, so this fails.',
  )
  process.exit(1)
}

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
  console.error(
    `\ndeterminism: ${failures.length} difference(s) across two token builds ` +
      `of ${filesA.length} and ${filesB.length} artifact(s) from ${ROOTS.length} resolved root(s), ` +
      '0 unresolved',
  )
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(
  `determinism: ${filesA.length} token artifacts byte-identical across two builds, ` +
    `read from ${ROOTS.length} resolved root(s) and 0 unresolved`,
)
