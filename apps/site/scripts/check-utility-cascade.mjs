/**
 * The utility-cascade gate, and the second half of the site's `check` task.
 *
 * The site is two Tailwind builds, and the only place they meet is the built
 * stylesheet, so this gate reads that. It is the first gate here that looks at
 * CSS: everything else reads tokens, content, routes or the corpus, and none of
 * them can see a rule losing a tie it was supposed to win. `docs/quality-gates.md`
 * has said for a while that "Tailwind collision" is outside every gate; this is
 * the one that is inside one now, for this site, and the limit of what it can see
 * is written down in `utility-cascade.mjs` rather than left to be discovered.
 *
 * It reads two things that have to agree. The built stylesheet, which is where the
 * cascade is, and the source that produced it, which is checked here as well so a
 * stale `out/` cannot make a stylesheet the site no longer ships look correct. A
 * collision and a missing layer are both reported, in that order, because the
 * collision is the finding and the missing layer is usually its cause.
 *
 * Run: node scripts/check-utility-cascade.mjs
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { findUtilityCascadeFindings, SITE_VARIANT_LAYER } from './utility-cascade.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const OUT = path.join(SITE, 'out')
const STATIC = path.join(OUT, '_next', 'static')
const GLOBALS = path.join(SITE, 'src', 'app', 'globals.css')
/** The three roots the site's own Tailwind build scans, in the order it names them. */
const SOURCE_ROOTS = ['src', 'items', 'content']

function die(message) {
  console.error(`utility-cascade: ${message}`)
  process.exit(1)
}

async function walk(dir, accept) {
  const found = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await walk(full, accept)))
    else if (entry.isFile() && accept(full)) found.push(full)
  }
  return found
}

const stylesheets = await walk(STATIC, (file) => file.endsWith('.css'))
if (stylesheets.length === 0) {
  die(
    'no built stylesheet under apps/site/out/_next/static. Run pnpm --filter @nanisoft/site build ' +
      'first: this gate reads the stylesheet the reader receives, and a stylesheet that was never ' +
      'built cannot be checked.',
  )
}

const css = (await Promise.all(stylesheets.map((file) => readFile(file, 'utf8')))).join('\n')

const sources = []
for (const root of SOURCE_ROOTS) {
  sources.push(...(await walk(path.join(SITE, root), (file) => /\.(tsx|ts|mdx)$/.test(file))))
}
if (sources.length === 0) die(`no site source found under ${SOURCE_ROOTS.join(', ')}`)

const classLists = (
  await Promise.all(sources.map(async (file) => `${await readFile(file, 'utf8')}\n`))
).join('\n')

const { findings, ranks, ruleCount, listCount } = findUtilityCascadeFindings({ css, classLists })

/**
 * The source, checked against the artifact.
 *
 * The built stylesheet is what a reader receives and the source is what the next
 * build will produce, so a gate that reads only the first can be made to pass by a
 * stale `out/`. Reading the declaration the layer exists for closes that, and the
 * failure names the file rather than the bytes.
 */
const globals = await readFile(GLOBALS, 'utf8')
if (!globals.includes(`@layer ${SITE_VARIANT_LAYER}`)) {
  findings.push({
    group: 'source',
    message:
      `src/app/globals.css no longer declares @layer ${SITE_VARIANT_LAYER}. That layer is the only ` +
      'rank the site holds over the library stylesheet. Either the fix has gone, or the build that ' +
      'produced out/ is older than the source.',
  })
}

if (findings.length > 0) {
  console.error(`utility-cascade: ${findings.length} finding(s)\n`)
  for (const finding of findings) console.error(`  [${finding.group}] ${finding.message}`)
  console.error('')
  process.exit(1)
}

console.log(
  `utility-cascade: no collision - ${ruleCount} rules across ${ranks.length} layers ` +
    `(${ranks.join(' > ')}), ${listCount} class lists read from ${sources.length} source files, ` +
    `@layer ${SITE_VARIANT_LAYER} declared in globals.css and ranked last in the built stylesheet`,
)
