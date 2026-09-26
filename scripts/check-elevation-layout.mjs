/**
 * Elevation / layout grep gate.
 *
 * Ticket 18 makes shadows, breakpoints and container widths authored tokens. This
 * gate fails the build when a second source of truth appears: a raw `box-shadow`,
 * an arbitrary `shadow-[...]` or `max-w-[...]` utility, or a
 * `--shadow-`/`--breakpoint-`/`--container-` custom-property declaration outside
 * the token package and the `Section` primitive. The docs-only `shadow-lg` floating
 * panel is deliberately allowed (it is site apparatus, not shipped surface).
 *
 * Allowed everywhere: `shadow-xs|sm|md`, `max-w-page|measure|measure-narrow`, the
 * `sm:`/`md:`/`lg:` variants, and `var(--shadow-*)`/`var(--container-*)` reads.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOTS = ['apps/site/src', 'packages/ui/src', 'scripts']
const EXT = /\.(tsx?|js|mjs|css)$/

/** This file necessarily contains the patterns it searches for. */
const SELF = path.normalize('scripts/check-elevation-layout.mjs')

/** `Section` owns the container contract; the ticket exempts it explicitly. */
const SECTION = path.normalize('packages/ui/src/components/ui/section.tsx')

const RULES = [
  {
    pattern: /box-shadow\s*:/,
    message: 'raw `box-shadow:` — author or consume a --shadow-* token instead',
  },
  {
    pattern: /\b(?:drop-)?shadow-\[/,
    message: 'arbitrary shadow utility `shadow-[...]` / `drop-shadow-[...]` — author a shadow token instead',
  },
  {
    pattern: /max-w-\[/,
    message: 'arbitrary `max-w-[...]` — use max-w-page, max-w-measure or max-w-measure-narrow',
  },
  {
    pattern: /--(?:shadow|breakpoint|container)-[^\s:;]+\s*:/,
    message: 'a second source of truth for --shadow-/--breakpoint-/--container-',
    except: SECTION,
  },
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

let violations = 0
let scanned = 0

for (const root of ROOTS) {
  let files
  try {
    files = walk(root)
  } catch {
    continue
  }
  for (const file of files) {
    const relative = path.normalize(file)
    if (relative === SELF || !EXT.test(file)) continue
    scanned += 1
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.except && relative === rule.except) continue
        if (!rule.pattern.test(line)) continue
        violations += 1
        console.error(`  ${file}:${index + 1}  ${rule.message}`)
        console.error(`      ${line.trim()}`)
      }
    })
  }
}

console.log(`\nelevation-layout: ${violations} violation(s) across ${scanned} file(s)`)

if (violations > 0) {
  console.error(
    '\nElevation, breakpoints and containers are authored in packages/tokens. ' +
      'Consume the bound utilities or the var(--shadow-*)/var(--container-*) tokens.',
  )
  process.exit(1)
}
