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

/* ── 2. The one stylesheet ───────────────────────────────────────────────── */

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
console.log(`prism-ui: dist/styles.css ${kb(STYLES_OUT)}`)
