/**
 * A Pattern that names an Item which does not exist fails the build.
 *
 * Nothing about a prose page is type-checked, so a Pattern naming an Item that was
 * renamed reads perfectly, builds perfectly, and hands a consumer a recipe that
 * cannot be followed. This is the only place that can be caught, and it is a gate
 * rather than a note because the failure is silent rather than loud.
 *
 * The Section's own bookkeeping is checked in the same pass, in both directions: a
 * Pattern on disk that `meta.json` does not list is a page nothing links to, and a
 * `meta.json` entry with no document behind it is a 404 the build emits happily.
 *
 * The catalogue is read through `buildCatalog()`, the same entry point the site's
 * other joins use, so this cannot become a second list of what exists.
 *
 * Run: node scripts/check-pattern-composition.mjs
 */
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'

import {
  catalogueNames,
  checkPatterns,
  readDeclaration,
  splitFrontmatter,
} from './pattern-composition.mjs'
import { PATTERN_SECTION } from '../src/lib/sections.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const CONTENT_ROOT = path.join(SITE, 'content')
const SECTION_DIR = path.join(CONTENT_ROOT, PATTERN_SECTION)

const manifestPath = path.join(SECTION_DIR, 'meta.json')

if (!existsSync(SECTION_DIR)) {
  console.error(
    `pattern-composition: the Patterns Section is declared as "${PATTERN_SECTION}" but ` +
      `${path.relative(SITE, SECTION_DIR)} does not exist. A Section a reader is sent to ` +
      `and cannot reach is a 404, and declaring it in one list is not the same as having it.`,
  )
  process.exit(1)
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const allDocuments = (await readdir(SECTION_DIR)).filter((name) => name.endsWith('.mdx'))

/*
 * The Section's own landing page is not a Pattern.
 *
 * Every Section in this site has an `index.mdx`, and it is a different kind of page:
 * it is the entry a group heading links to, it is not in its own `meta.json` `pages`
 * array, and it composes nothing. Holding it to the declaration rule would demand a
 * `composes` list on the page whose job is to introduce the Patterns beside it, and
 * the finding would be right for the wrong reason.
 */
const SECTION_ROOT = 'index.mdx'
const patterns = []
for (const name of allDocuments) {
  if (name === SECTION_ROOT) continue
  const source = await readFile(path.join(SECTION_DIR, name), 'utf8')
  const declared = readDeclaration(splitFrontmatter(source).frontmatter)
  patterns.push({
    file: name,
    title: declared.title ?? '',
    description: declared.description,
    composes: declared.composes ?? [],
    arranges: declared.arranges ?? [],
  })
}

const declaredCount = patterns.reduce(
  (total, pattern) => total + pattern.composes.length + pattern.arranges.length,
  0,
)

const names = catalogueNames(buildCatalog())
const findings = checkPatterns({
  patterns,
  manifest: { section: PATTERN_SECTION, pages: manifest.pages ?? [] },
  names,
})

console.log(
  `pattern-composition: ${patterns.length} document(s) declaring ${declaredCount} Item ` +
    `reference(s), against a catalogue of ${names.size} Item(s); ` +
    `${allDocuments.length - patterns.length} Section root(s) exempt`,
)

if (findings.length === 0) {
  console.log(
    'pattern-composition: every Item a Pattern composes and every Page a Template ' +
      'arranges is in the Catalogue, and the Section lists exactly the documents it publishes',
  )
  process.exit(0)
}

console.error(`pattern-composition: ${findings.length} finding(s)`)
for (const finding of findings) {
  console.error(`  - ${finding.file}: ${finding.message}`)
}
process.exit(1)
