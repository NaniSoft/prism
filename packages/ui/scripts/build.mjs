/**
 * The @nanisoft/prism-ui build.
 *
 * Two emitters, no JavaScript bundler:
 *
 *   1. `tsc -p tsconfig.build.json` emits `dist/**` JS, `.d.ts` and declaration
 *      maps from `src/**`. A consumer is a bundler already, so no second one.
 *   2. Tailwind 4 over `src/styles.css` emits the single self-sufficient
 *      `dist/styles.css`: token variables, semantic utilities and Prism's own
 *      base layer. A consumer imports only the emitted stylesheet and installs
 *      no Tailwind.
 *
 * And one repair between them: the emitted tree has its relative specifiers
 * rewritten to carry file extensions, which is what makes the package loadable by
 * Node's ESM loader and not only by a bundler. The reasoning for doing it here
 * rather than in the source is at the step.
 *
 * The token package's emitted CSS is a build input, so this script refuses to
 * run when `@nanisoft/prism-tokens` has not been built rather than emitting a
 * stylesheet with missing variables.
 *
 * Run: pnpm --filter @nanisoft/prism-ui build
 */
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const SRC = path.join(PKG, 'src')
const DIST = path.join(PKG, 'dist')
const STYLES_IN = path.join(SRC, 'styles.css')
const STYLES_OUT = path.join(DIST, 'styles.css')

const TOKENS_DIST = path.join(PKG, 'node_modules', '@nanisoft', 'prism-tokens', 'dist')
for (const required of ['light.css', 'dark.css', 'theme.css']) {
  if (!existsSync(path.join(TOKENS_DIST, required))) {
    console.error(
      `error @nanisoft/prism-ui needs the token build first: ${required} is missing.\n` +
        '  Run `pnpm --filter @nanisoft/prism-tokens build` before this build.',
    )
    process.exit(1)
  }
}

/* ── 1. Declarations and JS ──────────────────────────────────────────────── */

// `dist/` is entirely owned by this build, so it is cleared rather than
// overlaid. The token `dist/` has the opposite rule (see packages/tokens).
rmSync(DIST, { recursive: true, force: true })
mkdirSync(DIST, { recursive: true })

const tsc = path.join(PKG, 'node_modules', 'typescript', 'bin', 'tsc')
execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], {
  cwd: PKG,
  stdio: 'inherit',
})

/* ── 2. The extensions Node's loader needs ──────────────────────────────── */

/**
 * Rewrite every relative specifier in the emitted tree so it carries a file
 * extension, in both the JavaScript and the declarations.
 *
 * **The problem, and it is a packaging defect rather than a consumer
 * inconvenience.** `tsc` emits an import specifier exactly as it was written in
 * the source, so `import { cn } from '../../lib/utils'` reaches `dist` unchanged.
 * Every bundler resolves that, which is why four downstream sites build and why
 * this went unnoticed. Node's ESM loader does not, and the package's own
 * `exports` map points at those files, so the manifest invites an `import()` the
 * artefact refuses.
 *
 * **Why the build and not the source.** Writing `./utils.js` in every source file
 * is the other way to fix this, and it is the wrong way here for one concrete
 * reason: the repository runs Tailwind over the source, and a dozen gates read
 * source text. Churning every specifier in `src/**` to satisfy Node would put the
 * change in the place a human looks when a Component misbehaves, and the benefit
 * is only observable in the output. The output is therefore where the fix goes.
 *
 * It rewrites only relative specifiers. A bare specifier like `react` is already
 * what Node expects and must not be touched, and a specifier that is already
 * absolute or already carries an extension is left exactly as it is, so this is
 * idempotent and a second run changes nothing.
 *
 * **`live` was missing from this list and that was a real hole, not an oversight
 * of the same kind.** Every other root the manifest publishes is here, and
 * `live` was published: the `./live` and `./live/*` subpaths resolve to
 * `dist/live/*.js`, so a consumer importing `@nanisoft/prism-ui/live/run-stream-01`
 * got a file whose own relative imports carried no extension, which Node's ESM
 * loader refuses. It went unnoticed for the same reason the rest did: four
 * downstream sites build, and every bundler resolves an extensionless relative
 * specifier. What made it findable in 2026-09 is that the roster grew a second
 * live surface, so the fourth Kind is no longer a single Item a consumer might
 * never reach: a package that publishes a Kind resolves it in `dist` or it does
 * not, and a list that omitted one root published a manifest that lied about
 * exactly one of the four.
 */
function resolveSpecifiers() {
  const roots = ['.', 'components', 'blocks', 'pages', 'live', 'lib', 'provider']
  let rewritten = 0
  let inspected = 0

  for (const root of roots) {
    const dir = path.join(DIST, root)
    if (!existsSync(dir)) continue
    for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue
      if (!entry.name.endsWith('.js') && !entry.name.endsWith('.d.ts')) continue
      const file = path.join(entry.parentPath, entry.name)
      const source = readFileSync(file, 'utf8')
      inspected += 1

      // `from './x'`, `import './x'` and `export ... from './x'` are the three
      // shapes that resolve a relative file, and they are matched by the
      // specifier rather than by the statement so a specifier inside a string or a
      // comment is not rewritten by accident.
      const next = source.replace(
        /(\bfrom\s*|\bimport\s*\(?\s*)(['"])(\.\.?\/[^'"]*)\2/g,
        (whole, lead, quote, specifier) => {
          if (path.extname(specifier) !== '') return whole
          const base = path.resolve(path.dirname(file), specifier)
          // A directory import resolves through its index, so try that first and
          // fall back to the file itself. The emitted tree is known at build time,
          // so this is a filesystem check rather than a guess.
          const target = existsSync(path.join(base, 'index.js'))
            ? path.join(base, 'index.js')
            : `${base}.js`
          if (!existsSync(target)) return whole
          let rel = path.relative(path.dirname(file), target).split(path.sep).join('/')
          if (!rel.startsWith('.')) rel = `./${rel}`
          return `${lead}${quote}${rel}${quote}`
        },
      )

      if (next !== source) {
        writeFileSync(file, next)
        rewritten += 1
      }
    }
  }
  return { rewritten, inspected }
}

const specifiers = resolveSpecifiers()

/* ── 3. The one stylesheet ───────────────────────────────────────────────── */

const postcss = require('postcss')
const tailwindcss = require('@tailwindcss/postcss')

const result = await postcss([tailwindcss()]).process(readFileSync(STYLES_IN, 'utf8'), {
  from: STYLES_IN,
  to: STYLES_OUT,
})
writeFileSync(STYLES_OUT, result.css)

/* ── 3. The face, next to the stylesheet that names it ────────────────────── */

// The `@font-face` sources in the emitted stylesheet are relative to it, and a
// consumer imports `dist/styles.css` from its own root, so the binaries have to
// sit beside the sheet rather than in a `public/` directory only the development
// server serves. The old line emitted the face at an absolute path and it silently
// failed in all four consumer repositories, so this is copied rather than assumed.
const FONTS_IN = path.join(PKG, 'public', 'fonts')
const FONTS_OUT = path.join(DIST, 'fonts')
if (existsSync(FONTS_IN)) {
  cpSync(FONTS_IN, FONTS_OUT, { recursive: true })
  const shipped = readdirSync(FONTS_OUT).filter((f) => !/OFL|LICENSE|LICENCE/i.test(f))
  const total = shipped.reduce((sum, f) => sum + statSync(path.join(FONTS_OUT, f)).size, 0)
  console.log(
    `  fonts: ${shipped.length} face(s) copied to dist/fonts, ${(total / 1024).toFixed(1)} KB, ` +
      'and the licence beside them',
  )
  // Every face the sheet names has to arrive with it. A `@font-face` pointing at
  // a file this build did not copy is a page that renders in the fallback with no
  // error anywhere, which is the failure this package exists to end.
  const faces = [...result.css.matchAll(/url\(['"]?([^'")]+\.woff2?)/g)].map((m) => m[1])
  for (const src of new Set(faces)) {
    const resolved = path.join(DIST, src)
    if (!existsSync(resolved)) {
      throw new Error(
        `the emitted stylesheet names ${src} and the build did not copy it; a face the sheet ` +
          `references but does not ship resolves to nothing in every consumer`,
      )
    }
  }
}

/* ── Report ──────────────────────────────────────────────────────────────── */

function collect(dir, suffix) {
  const out = []
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (full.endsWith(suffix)) out.push(full)
    }
  }
  walk(dir)
  return out
}

const js = collect(DIST, '.js')
const declarations = collect(DIST, '.d.ts')
const maps = collect(DIST, '.d.ts.map')
const kb = (file) => `${(statSync(file).size / 1024).toFixed(1)} KB`

console.log(
  `prism-ui: ${js.length} JS, ${declarations.length} declarations, ${maps.length} declaration maps`,
)
// Printed because a step that can silently do nothing is a step that will: a
// future change to the emitted layout that leaves every specifier already
// qualified would report zero and look like a pass.
console.log(
  `prism-ui: ${specifiers.rewritten} of ${specifiers.inspected} emitted file(s) had relative ` +
    `specifiers resolved to file extensions, so Node's ESM loader can import this package`,
)
console.log(`prism-ui: dist/styles.css ${kb(STYLES_OUT)}`)
