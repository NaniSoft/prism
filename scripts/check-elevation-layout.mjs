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
 *
 * Coverage is asserted, not assumed. ROOTS is resolved against `REPO_ROOT`,
 * which is derived from this file's own location rather than `process.cwd()`,
 * and the two exclusions are absolute paths compared against the walked files
 * rather than normalised relative strings compared against the working
 * directory. A run from the wrong directory used to read 12 files instead of
 * 135 and print a success line no reader could tell from a real one. A root
 * that resolves to nothing fails the run, a run that reads no file fails the
 * run, and the final line states the coverage achieved and names both
 * exclusions, so the scope of a pass is on the line rather than in a comment.
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

const NAME = 'check-elevation-layout'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository root, from this file's own location. Never `process.cwd()`. */
const REPO_ROOT = path.resolve(HERE, '..')

const ROOTS = ['apps/site/src', 'packages/ui/src', 'scripts']
const EXT = /\.(tsx?|js|mjs|css)$/

/**
 * This file necessarily contains the patterns it searches for. Absolute, because
 * a relative comparison depends on the working directory and a gate that stops
 * excluding itself is a gate nobody notices failing.
 */
const SELF = path.join(REPO_ROOT, 'scripts', 'check-elevation-layout.mjs')

/** `Section` owns the container contract; the ticket exempts it explicitly. */
const SECTION = path.join(REPO_ROOT, 'packages', 'ui', 'src', 'components', 'ui', 'section.tsx')

const EXCLUSIONS = [
  `${relativePosix(REPO_ROOT, SELF)} (this gate's own rule table)`,
  `${relativePosix(REPO_ROOT, SECTION)} (owns the container contract)`,
]

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

let violations = 0
let scanned = 0

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })

try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { scriptName: NAME, extensions: EXT })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

for (const result of results) {
  for (const file of result.files) {
    if (file === SELF) continue
    scanned += 1
    const shown = relativePosix(REPO_ROOT, file)
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.except && file === rule.except) continue
        if (!rule.pattern.test(line)) continue
        violations += 1
        console.error(`  ${shown}:${index + 1}  ${rule.message}`)
        console.error(`      ${line.trim()}`)
      }
    })
  }
}

const coverage = coverageOf(results)

console.log(
  `\nelevation-layout: ${violations} violation(s) in ${scanned} file(s) read from ` +
    `${coverage.roots} root(s), ${coverage.files} file(s) matched, ` +
    `${coverage.unresolved} root(s) unresolved`,
)
console.log(`elevation-layout: excluded from every rule: ${EXCLUSIONS.join(', ')}`)

if (violations > 0) {
  console.error(
    '\nElevation, breakpoints and containers are authored in packages/tokens. ' +
      'Consume the bound utilities or the var(--shadow-*)/var(--container-*) tokens.',
  )
  process.exit(1)
}
