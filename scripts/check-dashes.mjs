/**
 * Fails the build on typographic tells that are otherwise invisible in review.
 *
 * Two patterns, one doctrine:
 *
 *   1. em and en dashes in copy a reader sees;
 *   2. the mangled `???` sequence `DESIGN.md` records, which a broken encoding
 *      step leaves behind and review keeps missing.
 *
 * Both are gated only in files whose string content reaches a rendered page or
 * a published artifact. Code comments in `.ts`/`.tsx`/`.mjs` stay reported, not
 * failed, because a comment is ordinary prose for whoever maintains the package.
 * A line inside a `/* ... *\/` or a JSX `{/* ... *\/}` block is a comment even
 * when it carries no leading marker, which is how the layout's JSX comment
 * blocks are handled.
 *
 * Coverage (ticket 15 section 7). ROOTS is every directory or root document the
 * gate reads. GATED is the subset whose strings render or ship:
 *
 *   ROOTS: apps/site/src, apps/site/content, apps/site/items, apps/site/scripts,
 *          apps/site/test, packages/ui/src, packages/tokens/src,
 *          packages/tokens/build, packages/tokens/scripts, packages/ui/scripts,
 *          packages/llms/src, packages/mcp-server/src, scripts, README.md,
 *          DESIGN.md, PRODUCT.md, CONTEXT.md, AGENTS.md, CONTRIBUTING.md,
 *          docs/**
 *   GATED: all of apps/site/src and apps/site/{content,items};
 *          packages/ui/src/** (component JSDoc reaches the corpus, block source
 *          ships verbatim); packages/tokens/src/{themes,semantic,foundation}
 *          (their `$description` renders on /tokens, /themes and Foundations);
 *          packages/llms/src/** (it emits reader-facing Markdown);
 *          packages/mcp-server/src/** (tool descriptions are read by agents);
 *          every root/doc `*.md`/`*.mdx`.
 *
 * `apps/site/scripts` and `apps/site/test` are read and not gated. They are
 * build tooling and assertions: their strings are gate output and failure
 * messages, which a maintainer reads and no reader sees, so they belong in the
 * reported column with the rest of the comment prose rather than in the failing
 * one. They were outside every root until the site's own gate and test lanes
 * grew five hundred lines that nothing scanned.
 *
 * The honest limit: the gate sees characters, not meaning. It proves no em/en
 * dash and no `???` sequence in the listed files, nothing more.
 *
 * Coverage is asserted, not assumed. ROOTS is resolved against `REPO_ROOT`,
 * which is derived from this file's own location rather than `process.cwd()`,
 * so the working directory cannot change what the gate reads. A root that
 * resolves to nothing fails the run, and a run that reads no file at all fails
 * the run, because "0 in reader-facing copy" over zero files is the claim this
 * gate used to make from the wrong directory. The final line states the coverage
 * the run achieved, and the roots that are read but not gated are printed every
 * run rather than described only in the comment above.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  assertFilesRead,
  assertRootsResolve,
  coverageOf,
  relativePosix,
  walkRoots,
} from './lib/walk.mjs'

const NAME = 'check-dashes'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository root, from this file's own location. Never `process.cwd()`. */
const REPO_ROOT = path.resolve(HERE, '..')

const ROOTS = [
  'apps/site/src',
  'apps/site/content',
  'apps/site/items',
  'apps/site/scripts',
  'apps/site/test',
  'packages/ui/src',
  'packages/ui/gates',
  'packages/tokens/src',
  'packages/tokens/build',
  'packages/tokens/scripts',
  'packages/ui/scripts',
  'packages/llms/src',
  'packages/mcp-server/src',
  'scripts',
  'README.md',
  'DESIGN.md',
  'PRODUCT.md',
  'CONTEXT.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'docs',
]
const EXT = /\.(tsx?|json|css|mjs|mdx?)$/
const DASH = /[—–]/g
const MANGLED = /\?\?\?\s/g
const G = '\u001b[31m'

/** Files whose string literals are rendered or published. */
const GATED = [
  'apps/site/src',
  'apps/site/content',
  'apps/site/items',
  'packages/ui/src',
  // The gate kit's own failure messages are reader-facing copy for a maintainer in
  // another repository: they are the laws, and a law that prints an em dash is the
  // one piece of this programme's prose that reaches a terminal rather than a page.
  'packages/ui/gates',
  'packages/tokens/src/themes',
  'packages/tokens/src/semantic',
  'packages/tokens/src/foundation',
  'packages/llms/src',
  'packages/mcp-server/src',
  'README.md',
  'DESIGN.md',
  'PRODUCT.md',
  'CONTEXT.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'docs',
]

const gated = (file) => GATED.some((prefix) => file === prefix || file.startsWith(`${prefix}/`))

/** A root whose every file is gated, a root that is partly gated, or neither. */
const gatedState = (root) => {
  const covered = GATED.some((prefix) => prefix === root || prefix.startsWith(`${root}/`))
  if (covered) return 'gated'
  return GATED.some((prefix) => root === prefix || root.startsWith(`${prefix}/`))
    ? 'partly gated'
    : 'read, not gated'
}

/**
 * Every root the gate reads without failing on, computed rather than kept as a
 * second hand-maintained list, so a root added to ROOTS shows up here the day it
 * is added.
 */
const EXCLUSIONS = ROOTS.filter((root) => gatedState(root) !== 'gated').map(
  (root) => `${root} (${gatedState(root)})`,
)

/**
 * Per line, whether the whole line is comment prose. Tracks both `/* ... *\/`
 * and JSX `{/* ... *\/}` blocks so the interior lines count as comments even
 * though they carry no marker.
 */
function commentMask(lines) {
  const mask = new Array(lines.length).fill(false)
  let inBlock = false
  lines.forEach((line, i) => {
    if (inBlock) {
      mask[i] = true
      if (line.includes('*/')) inBlock = false
      return
    }
    const trimmed = line.replace(/^\s+/, '')
    if (/^(\/\/|\*)/.test(trimmed)) {
      mask[i] = true
      return
    }
    if (trimmed.startsWith('/*') || trimmed.startsWith('{/*')) {
      mask[i] = true
      if (!line.includes('*/')) inBlock = true
    }
  })
  return mask
}

let violations = 0
let reported = 0

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })

try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { scriptName: NAME, extensions: EXT })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

for (const result of results) {
  for (const full of result.files) {
    const file = relativePosix(REPO_ROOT, full)
    const lines = readFileSync(full, 'utf8').split('\n')
    const mask = commentMask(lines)

    lines.forEach((line, i) => {
      const dash = line.match(DASH)
      const mangled = line.match(MANGLED)
      if (!dash && !mangled) return

      const comment = mask[i]
      const fail = gated(file) && !comment
      if (fail) violations += 1
      else reported += 1

      const at = dash ? line.search(DASH) : line.search(MANGLED)
      const codes = dash
        ? [...new Set(dash)].map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(', ')
        : 'mangled ???'
      const kind = dash ? 'dash' : '???'

      console.log(
        `${fail ? G : '  '} ${file}:${i + 1}  [${codes}]  ${fail ? 'GATED' : 'comment'}  (${kind})`,
      )
      console.log(`      ${line.trim().slice(Math.max(0, at - 50), at + 60)}`)
    })
  }
}

const coverage = coverageOf(results)

console.log(
  `\ndashes: ${violations} in reader-facing copy, ${reported} in comments or ungated files, ` +
    `across ${coverage.files} file(s) in ${coverage.roots} root(s) ` +
    `(${coverage.unresolved} unresolved)`,
)
console.log(`dashes: read but not gated: ${EXCLUSIONS.join(', ')}`)

if (violations > 0) {
  console.error(
    `\nAn em-dash, en-dash or mangled ??? appears in copy a reader sees. Use a period, a comma, ` +
      `a semicolon, a colon, or a plain hyphen.`,
  )
  process.exit(1)
}
