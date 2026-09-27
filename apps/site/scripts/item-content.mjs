/**
 * One folder per Item: where an Item's documentation and its Demo live.
 *
 * The rule, in one sentence: an Item's documentation is a `.mdx` file named for
 * the Item, and its Demo is a `.tsx` file of the same name in the same folder.
 * The folders between the Kind and that folder are the Item's place in the
 * content tree, and they are read here rather than restated by each consumer,
 * because three of them need to agree and none of them may hold a path.
 *
 * Three consumers read it, and that is the whole reason it is one module:
 *
 *   - `apps/site/scripts/generate-demos.mjs`, for the registry the live preview
 *     and the copy control render from, and for the item manifest the routing
 *     tree is built from;
 *   - `apps/site/scripts/check-content-joins.mjs`, for the document and Demo
 *     join the gate asserts in both directions;
 *   - `packages/llms/scripts/build.mjs` and its drift gate, which read an
 *     Item's prose and the verbatim Demo source for the Corpus.
 *
 * The corpus package reaches across for this rather than keeping its own walk
 * of the site's tree, and the two paths it needs to be deleted with are the
 * ones this module deletes when the last Item moves: the flat demo root and the
 * `items/<kind>/<slug>.mdx` shape.
 *
 * **The flat fallback is half a rule, and it is deliberate.** An Item whose
 * documentation is not in a folder named for it has not moved yet, and its Demo
 * is in the flat demo root. A documentation file that *is* in a folder named for
 * it has no fallback: its Demo is the file beside it or it has none, because a
 * fallback in that direction would quietly satisfy a Demo that a maintainer
 * left behind when they moved the documentation, and the Demo would render from
 * a second directory with every gate green. The gate reports it; the build
 * refuses it.
 *
 * Nothing here reads a route, a kind from the Catalogue or a Category. The Kind
 * is the top folder of the documentation tree, and it is the Catalogue's word
 * for it: a document filed under the wrong Kind is a finding in the gate, not a
 * correction here.
 */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

/** The one extension the content tree is authored in, and the Demo beside it. */
const CONTENT_EXTENSION = '.mdx'
const DEMO_EXTENSION = '.tsx'

/**
 * Every file under `dir`, as `{ relative, full }` pairs, depth first and name
 * sorted. Sorted, because two readers of the same tree must see the same order:
 * the emitted registry and the emitted manifest are byte-compared by the corpus
 * drift gate.
 */
async function walk(dir, prefix = '') {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const found = []
  for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name)
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) found.push(...(await walk(full, relative)))
    else if (entry.isFile()) found.push({ relative, full })
  }
  return found
}

/** Whether `file` exists, read as a path rather than as content. */
async function isFile(file) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

/**
 * @typedef {object} ItemContent
 * @property {string} slug the Item's slug, which is its documentation file name
 * @property {string} kind the top folder of the documentation tree
 * @property {string} doc absolute path of the documentation file
 * @property {string | null} demo absolute path of the Demo, or null when there is none
 * @property {string[]} group the folders between the Kind and the Item's own folder
 * @property {boolean} beside whether the Demo is a sibling of the documentation
 * @property {string[]} demosInFolder every Demo-shaped file in the documentation's own folder
 */

/**
 * Every Item's documentation, its Demo and where the two sit, read from disk.
 *
 * @param {string} itemsRoot the documentation tree, e.g. `apps/site/items`
 * @param {string} demoRoot the flat demo root, e.g. `apps/site/src/demos`
 * @returns {Promise<ItemContent[]>} one entry per documentation file, name sorted
 */
export async function readItemContent(itemsRoot, demoRoot) {
  const items = []
  for (const file of await walk(itemsRoot)) {
    if (!file.relative.endsWith(CONTENT_EXTENSION)) continue
    const segments = file.relative.split('/')
    const slug = segments[segments.length - 1].replace(/\.mdx$/, '')
    const kind = segments[0] ?? ''
    const folders = segments.slice(1, -1)
    const beside = folders.length > 0 && folders[folders.length - 1] === slug
    const folder = path.dirname(file.full)
    const demosInFolder = (await walk(folder))
      .filter((entry) => entry.relative.endsWith(DEMO_EXTENSION))
      .map((entry) => path.basename(entry.relative, DEMO_EXTENSION))
      .sort()

    const demo = beside
      ? path.join(folder, `${slug}${DEMO_EXTENSION}`)
      : path.join(demoRoot, `${slug}${DEMO_EXTENSION}`)

    items.push({
      slug,
      kind,
      doc: file.full,
      demo: (await isFile(demo)) ? demo : null,
      group: beside ? folders.slice(0, -1) : [],
      beside,
      demosInFolder,
    })
  }
  return items
}

/**
 * The one Item with a slug, or undefined. A missing Item is not an error here:
 * the corpus builder and the gate each report it in their own words, from the
 * Catalogue they read.
 *
 * @param {ItemContent[]} items
 * @param {string} slug
 * @returns {ItemContent | undefined}
 */
export function itemFor(items, slug) {
  return items.find((item) => item.slug === slug)
}

export { CONTENT_EXTENSION, DEMO_EXTENSION }
