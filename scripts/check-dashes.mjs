/**
 * Fails the build on a typographic tell that is otherwise invisible in review.
 *
 * The em-dash ban applies to copy a reader sees, not to code comments, which are
 * ordinary prose for whoever maintains the package. So this scans for them but
 * only gates the files whose string content reaches a rendered page. Comments in
 * these same files are still reported, as context for what was left alone.
 *
 * The gate list is deliberately explicit rather than a heuristic, because a
 * heuristic that guesses "is this string user-facing" will be wrong in both
 * directions and quietly stop meaning anything.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOTS = [
  'apps/site/src',
  'packages/ui/src',
  'packages/tokens/src',
  'packages/tokens/build',
  'packages/ui/scripts',
  'scripts',
]
const EXT = /\.(tsx?|json|css|mjs|md)$/
const DASH = /[—–]/g
const G = ''

/**
 * Files whose string literals are rendered. Token `$description` fields surface on
 * `/tokens` and `/themes`; block source ships verbatim into consumer apps, so a
 * dash in its copy is a dash in someone's product.
 */
const GATED = [
  'apps/site/src/app/tokens/page.tsx',
  'apps/site/src/app/themes/page.tsx',
  'apps/site/src/app/page.tsx',
  'apps/site/src/app/blocks',
  'apps/site/src/app/layout.tsx',
  'packages/ui/src/components/ds/blocks',
  'packages/tokens/src/themes',
  'packages/tokens/src/semantic',
  'packages/tokens/src/foundation',
]

const gated = (file) => GATED.some((prefix) => file.startsWith(prefix))

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

let violations = 0
let inComments = 0

for (const root of ROOTS) {
  let files
  try {
    files = walk(root)
  } catch {
    continue
  }
  for (const file of files.filter((f) => EXT.test(f))) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const found = line.match(DASH)
        if (!found) return

        // A line whose only content is a comment is not reader-facing copy.
        const comment = /^\s*(\/\/|\/\*|\*|\*\/)/.test(line)
        const fail = gated(file) && !comment

        if (fail) violations += 1
        else inComments += 1

        const at = line.search(DASH)
        const codes = [...new Set(found)]
          .map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`)
          .join(', ')

        console.log(
          `${fail ? G : '  '} ${file}:${i + 1}  [${codes}]  ${fail ? 'GATED' : 'comment'}`,
        )
        console.log(`      ${line.trim().slice(Math.max(0, at - 50), at + 60)}`)
      })
  }
}

console.log(
  `\ndashes: ${violations} in reader-facing copy, ${inComments} in comments or ungated files`,
)

if (violations > 0) {
  console.error(
    `\nAn em-dash or en-dash appears in copy a reader sees. Use a period, a comma, ` +
      `a semicolon, a colon, or a plain hyphen.`,
  )
  process.exit(1)
}

