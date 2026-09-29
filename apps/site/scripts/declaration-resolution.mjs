/**
 * Resolving a relative specifier in an emitted tree to the file that holds its types.
 *
 * **One place, because there were two.** `apps/site/scripts/generate-api.mjs` and
 * `packages/llms/scripts/build.mjs` each grew their own copy of this walk, and the
 * extractor's own note claimed there was no second extraction. There was one
 * extraction and two resolvers, which is the arrangement where a fix to one leaves
 * the other quietly wrong. That is not hypothetical: when the emitted declarations
 * began carrying file extensions, both resolvers stopped finding anything and every
 * Block's published props became "No additional props are declared for this item",
 * with no error anywhere.
 *
 * **Why the extension is there at all.** `tsc` emits an import specifier exactly as
 * the source wrote it, so the emitted tree used to carry `./hero` with no extension.
 * That is resolvable by a bundler and by nothing else, so `@nanisoft/prism-ui`
 * could not be loaded by Node's ESM loader while its own `exports` map invited the
 * import. The build now resolves every relative specifier to a file extension, which
 * is what a published ESM package owes its consumers, and every resolver that reads
 * the emitted tree has to know that.
 *
 * **The mapping is the TypeScript one.** In a declaration, `./hero.js` names the
 * module emitted from `hero.tsx`, and its types live in `hero.d.ts`. So a
 * specifier that already carries a runtime extension is stripped before the
 * candidates are tried, and a specifier that carries none is tried as it stands.
 * Both shapes are therefore read, which is what makes this robust to either rather
 * than to whichever one happens to be emitted today.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/** The runtime extensions a specifier may carry that a declaration drops. */
const RUNTIME_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs']

/**
 * The base path a relative specifier's types live at, with any runtime extension
 * removed.
 *
 * `'./hero'` and `'./hero.js'` both resolve to `<dir>/hero`, so a resolver written
 * against one of them keeps working against the other.
 *
 * @param {string} dir  the directory of the file holding the specifier
 * @param {string} specifier  the specifier, as written
 * @returns {string}
 */
export function declarationBase(dir, specifier) {
  const resolved = path.resolve(dir, specifier)
  for (const extension of RUNTIME_EXTENSIONS) {
    if (!resolved.endsWith(extension)) continue
    return resolved.slice(0, -extension.length)
  }
  return resolved
}

/**
 * Every path a relative specifier's declaration could be at, in the order to try
 * them. A Block's `index.tsx` re-exports from `./hero`, so the function declaration
 * lives in a sibling rather than in the index; a directory import resolves through
 * its own `index.d.ts`.
 *
 * @param {string} dir
 * @param {string} specifier
 * @returns {string[]}
 */
export function declarationCandidates(dir, specifier) {
  const base = declarationBase(dir, specifier)
  return [`${base}.d.ts`, `${base}.d.mts`, path.join(base, 'index.d.ts')]
}

/** Every relative specifier in a declaration's text, deduplicated. */
export function relativeSpecifiers(text) {
  const found = new Set()
  for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    found.add(match[1] ?? '')
  }
  return [...found]
}

/**
 * Read a declaration file plus everything it re-exports from a relative path.
 *
 * One hop, which covers the shapes this repository emits: a Block's index re-exports
 * its own module and nothing reaches further than that.
 *
 * @param {string} file  the `.d.ts` to read first
 * @param {(candidate: string) => Promise<string | undefined>} [read]
 *   how to read one candidate, so a caller that wants to track what it resolved can
 *   observe it. Returning `undefined` means "not there", and the next candidate is
 *   tried.
 * @returns {Promise<string>}
 */
export async function readDeclarations(file, read) {
  const readOne =
    read ??
    (async (candidate) => {
      try {
        return await readFile(candidate, 'utf8')
      } catch {
        return undefined
      }
    })

  const text = (await readOne(file)) ?? ''
  const dir = path.dirname(file)
  const parts = [text.replace(/\r\n/g, '\n')]

  for (const specifier of relativeSpecifiers(text)) {
    for (const candidate of declarationCandidates(dir, specifier)) {
      const part = await readOne(candidate)
      if (part === undefined) continue
      parts.push(part.replace(/\r\n/g, '\n'))
      break
    }
  }

  return parts.join('\n')
}
