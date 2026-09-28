/**
 * Shared file walking for the repository gates.
 *
 * Three gates resolve a configured list of roots through this module:
 * `check-dashes.mjs` and `check-elevation-layout.mjs` walk them, and
 * `validate-changesets.mjs` resolves and asserts them without walking. Each of
 * the first two used to carry its own `walk()` that answered a missing root with
 * an empty list, so a run from the wrong working directory reported zero
 * violations across zero files and exited 0. The success line could not be told
 * apart from a real one.
 *
 * The three habits this module exists to make unavoidable:
 *
 *   1. a root is resolved against a base directory the CALLER passes in, so no
 *      function here ever consults `process.cwd()` and the wrong working
 *      directory cannot change what a gate reads;
 *   2. a missing root is not an empty result. `walkRoot` says `exists: false`
 *      and `assertRootsResolve` turns that into a failure naming both causes,
 *      because a reader who sees `0 violations` needs to know it was not a run
 *      that read nothing;
 *   3. a run that resolved every root and still read no file is a failure too,
 *      so coverage is asserted rather than assumed.
 *
 * Symbolic links are not followed: a linked directory is reported as a file, so
 * a link cycle cannot make a gate walk forever. No configured root in this
 * repository contains one.
 */
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * Resolve a configured root against the caller's base directory.
 *
 * An absolute `relative` is returned normalised, because `path.resolve` treats
 * it as its own answer. A gate that hardcodes an absolute root still works, and
 * the review can see it.
 */
export function resolveRoot(base, relative) {
  return path.resolve(base, relative)
}

/** A `RegExp` matched against the whole path, or a list of extensions. */
function matches(file, extensions) {
  if (!extensions) return true
  if (extensions instanceof RegExp) return extensions.test(file)
  const name = file.toLowerCase()
  return extensions.some((extension) => name.endsWith(extension.toLowerCase()))
}

/**
 * Every file under `root`, absolute, in `readdirSync` order.
 *
 * `root` may be a file (the gates read root documents as well as trees) or a
 * directory. A root that does not exist is reported, never absorbed:
 *
 *   { root, files: [], exists: false, error: 'ENOENT' }
 */
export function walkRoot(root, { extensions } = {}) {
  let entry
  try {
    entry = statSync(root)
  } catch (cause) {
    return { root, files: [], exists: false, error: cause.code ?? cause.message }
  }

  if (entry.isFile()) {
    return { root, files: matches(root, extensions) ? [root] : [], exists: true }
  }

  const files = []
  for (const child of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, child.name)
    if (!child.isDirectory()) {
      if (matches(full, extensions)) files.push(full)
      continue
    }
    const nested = walkRoot(full, { extensions })
    if (!nested.exists) return nested
    files.push(...nested.files)
  }
  return { root, files, exists: true }
}

/**
 * Walk every configured root and keep the answer per root, so one missing root
 * names itself in the failure rather than quietly emptying the run.
 *
 * `roots` are the gate's own strings, `base` is the directory they are
 * expressed against. Nothing is cached between calls, because a gate that
 * caches cannot be re-run in one process.
 */
export function walkRoots(base, roots, options) {
  return roots.map((relative) => {
    const absolute = resolveRoot(base, relative)
    return { relative, ...walkRoot(absolute, options) }
  })
}

/** Roots that resolved to nothing, in the order the gate configured them. */
export function unresolvedRoots(results) {
  return results.filter((result) => !result.exists)
}

/** Total files read across every root. */
export function filesRead(results) {
  return results.reduce((total, result) => total + result.files.length, 0)
}

/**
 * The coverage a run achieved, for a success line a reader can falsify.
 * `unresolved` is 0 on a pass by construction: this is only called after the
 * assertions below have held.
 */
export function coverageOf(results) {
  return {
    files: filesRead(results),
    roots: results.length,
    unresolved: unresolvedRoots(results).length,
  }
}

/** The command that answers cause (1) for a gate run from the repository root. */
const DEFAULT_HINT = 'run it from the repository root, or via `pnpm check`'

/**
 * Fail when any configured root resolved to nothing.
 *
 * The message names both causes on purpose. A reader who cannot tell which one
 * happened is exactly the reader this gate was written for, and the difference
 * is the difference between re-running the gate and fixing the tree. `hint` is
 * per gate, because a gate that resolves its roots from its own location can
 * only be in this state when the script being run is not this repository's
 * copy, so "run it from the repository root" is no longer the whole answer.
 */
export function assertRootsResolve(results, { scriptName, hint = DEFAULT_HINT }) {
  const missing = unresolvedRoots(results)
  if (missing.length === 0) return

  const listed = missing.map((result) => `"${result.relative}"`).join(', ')
  const plural = missing.length === 1 ? 'root does not resolve' : 'roots do not resolve'
  throw new Error(
    `${scriptName}: ${missing.length} of ${results.length} configured ${plural}: ${listed}\n` +
      '  Two causes, and this run cannot tell them apart:\n' +
      "  (1) the gate was run from the wrong working directory, or the script being run is\n" +
      `      not this repository's copy - ${hint};\n` +
      '  (2) the root does not exist in the repository at all, so the configuration names a\n' +
      '      path that was renamed, moved or never committed.\n' +
      '  A gate that read nothing and reported zero violations is the failure this replaces,\n' +
      '  so an unresolved root fails the run rather than emptying it.',
  )
}

/**
 * Fail when every root resolved and the run still read no file.
 *
 * An empty root is legitimate on its own; a run that read nothing is not, so
 * the assertion is over the total rather than per root.
 */
export function assertFilesRead(results, { scriptName, extensions }) {
  const total = filesRead(results)
  if (total > 0) return

  const filter = extensions
    ? ` the extension filter ${describeFilter(extensions)} matched nothing,`
    : ' every root was empty,'
  throw new Error(
    `${scriptName}: read 0 files across ${results.length} resolved root(s).\n` +
      `  Every root resolved, so this is not a missing-directory problem:${filter}\n` +
      '  or the trees are empty.\n' +
      '  Reporting zero violations over zero files is the failure this replaces, so an empty\n' +
      '  read fails the run.',
  )
}

function describeFilter(extensions) {
  if (extensions instanceof RegExp) return String(extensions)
  return JSON.stringify(extensions)
}

/** Repo-relative, forward-slashed, so a gate prints the same on every OS. */
export function relativePosix(base, file) {
  return path.relative(base, file).split(path.sep).join('/')
}
