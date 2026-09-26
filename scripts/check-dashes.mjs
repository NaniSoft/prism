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
 *   ROOTS: apps/site/src, apps/site/content, apps/site/items, packages/ui/src,
 *          packages/tokens/src, packages/tokens/build, packages/tokens/scripts,
 *          packages/ui/scripts, packages/llms/src, packages/mcp-server/src,
 *          scripts, README.md, DESIGN.md, PRODUCT.md, CONTEXT.md, AGENTS.md,
 *          CONTRIBUTING.md, docs/**
 *   GATED: all of apps/site/src and apps/site/{content,items};
 *          packages/ui/src/** (component JSDoc reaches the corpus, block source
 *          ships verbatim); packages/tokens/src/{themes,semantic,foundation}
 *          (their `$description` renders on /tokens, /themes and Foundations);
 *          packages/llms/src/** (it emits reader-facing Markdown);
 *          packages/mcp-server/src/** (tool descriptions are read by agents);
 *          every root/doc `*.md`/`*.mdx`.
 *
 * The honest limit: the gate sees characters, not meaning. It proves no em/en
 * dash and no `???` sequence in the listed files, nothing more.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOTS = [
  'apps/site/src',
  'apps/site/content',
  'apps/site/items',
  'packages/ui/src',
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

/** Forward-slashed paths so the gate behaves the same on Windows and Linux. */
const toPosix = (file) => file.split(path.sep).join('/')

function walk(root) {
  let entries
  try {
    entries = statSync(root)
  } catch {
    return []
  }
  if (entries.isFile()) return [root]
  return readdirSync(root).flatMap((name) => {
    const full = path.join(root, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

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

for (const root of ROOTS) {
  for (const full of walk(root)) {
    if (!EXT.test(full)) continue
    const file = toPosix(full)
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

console.log(
  `\ndashes: ${violations} in reader-facing copy, ${reported} in comments or ungated files`,
)

if (violations > 0) {
  console.error(
    `\nAn em-dash, en-dash or mangled ??? appears in copy a reader sees. Use a period, a comma, ` +
      `a semicolon, a colon, or a plain hyphen.`,
  )
  process.exit(1)
}
