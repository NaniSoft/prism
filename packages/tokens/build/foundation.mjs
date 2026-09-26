/**
 * Loads the authored foundation tree as one object.
 *
 * The build emits the mode-independent `@theme static` block from this tree
 * directly, and the DTCG projection writes it as `foundation.tokens.json`, so the
 * two consumers cannot drift. The tree is the deep merge of every
 * `src/foundation/*.tokens.json` file, matching what Style Dictionary sees when
 * it globs the same directory.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, readdir } from 'node:fs/promises'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FOUNDATION_DIR = path.join(HERE, '..', 'src', 'foundation')

/** DTCG reserved keys and plain-object test. */
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      deepMerge(target[key], value)
    } else {
      target[key] = value
    }
  }
  return target
}

export async function loadFoundationTree() {
  const files = (await readdir(FOUNDATION_DIR))
    .filter((file) => file.endsWith('.tokens.json'))
    .sort()

  const tree = {}
  for (const file of files) {
    const raw = (await readFile(path.join(FOUNDATION_DIR, file), 'utf8')).replace(/^\uFEFF/, '')
    deepMerge(tree, JSON.parse(raw))
  }
  return tree
}

export const foundationTree = await loadFoundationTree()

/** Every leaf token under a group path, as `[key, token]` pairs. */
export function groupEntries(tree, groupPath) {
  let node = tree
  for (const segment of groupPath) {
    node = node?.[segment]
  }
  if (!isPlainObject(node)) return []
  return Object.entries(node).filter(([, value]) => isPlainObject(value))
}
