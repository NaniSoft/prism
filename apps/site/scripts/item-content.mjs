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
 * of the site's tree, and the one path it needs is the one this module reads.
 *
 * **There is one place an Item lives, and there is no fallback.** All forty-two
 * Items are in a folder named for them, with their Demo beside them, and the
 * transitional flat demo root that the last few tickets carried is gone. A
 * document that is not in a folder named for it therefore has no Demo at all,
 * which is a refusal rather than a lookup: the demo generator exits on it, the
 * corpus builder and the gate each report it in their own words, and no consumer
 * can be handed a Demo from a directory nobody declared. A fallback in that
 * direction would quietly satisfy a Demo a maintainer left behind when they
 * filed the documentation, and the Demo would render from a second directory
 * with every gate green.
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
 * @property {boolean} beside whether the documentation is in a folder named for the Item
 */

/**
 * Every Item's documentation, its Demo and where the two sit, read from disk.
 *
 * @param {string} itemsRoot the documentation tree, e.g. `apps/site/items`
 * @returns {Promise<ItemContent[]>} one entry per documentation file, name sorted
 */
export async function readItemContent(itemsRoot) {
  const items = []
  for (const file of await walk(itemsRoot)) {
    if (!file.relative.endsWith(CONTENT_EXTENSION)) continue
    const segments = file.relative.split('/')
    const slug = segments[segments.length - 1].replace(/\.mdx$/, '')
    const kind = segments[0] ?? ''
    const folders = segments.slice(1, -1)
    const beside = folders.length > 0 && folders[folders.length - 1] === slug

    // The Demo is the file beside the documentation, or it is nothing. There is
    // no second directory to look in, so an Item whose documentation is filed
    // outside a folder named for it has no Demo and every consumer says so.
    const candidate = beside
      ? path.join(path.dirname(file.full), `${slug}${DEMO_EXTENSION}`)
      : null

    items.push({
      slug,
      kind,
      doc: file.full,
      demo: candidate !== null && (await isFile(candidate)) ? candidate : null,
      group: beside ? folders.slice(0, -1) : [],
      beside,
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
