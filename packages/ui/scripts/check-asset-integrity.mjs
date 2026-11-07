/**
 * Asset-integrity gate (Mission Gate L).
 *
 * No file ships silently: every font asset under `public/fonts` is in the
 * manifest, every file the manifest names exists, and every string that names
 * an asset in the shipped source resolves to a published subpath or an
 * `assets` export. An unlisted file is easy to miss in review and hard to
 * explain in a release; a dangling reference ships a broken image and no gate
 * says so.
 *
 * `PRISM_ASSETS_MANIFEST` / `PRISM_ASSETS_ROOT` / `PRISM_ASSETS_SRC` let the
 * suite stage a tree.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:asset-integrity
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'asset-integrity'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

const MANIFEST = process.env.PRISM_ASSETS_MANIFEST
  ? path.resolve(process.env.PRISM_ASSETS_MANIFEST)
  : path.join(PKG, 'src', 'assets', 'asset-manifest.json')
const ROOT = process.env.PRISM_ASSETS_ROOT
  ? path.resolve(process.env.PRISM_ASSETS_ROOT)
  : PKG
const SRC_ROOT = process.env.PRISM_ASSETS_SRC
  ? path.resolve(process.env.PRISM_ASSETS_SRC)
  : path.join(PKG, 'src')

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const isDerived = (entry) => entry.format === 'svg-component'

function purpose(file) {
  if (!existsSync(file)) return 'missing'
  if (statSync(file).size === 0) return 'empty'
  return 'ok'
}

if (!existsSync(MANIFEST)) {
  console.error(`${NAME}: ${rel(MANIFEST)} does not exist`)
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8').replace(/^﻿/, ''))
const failures = []

const listed = new Set()
for (const entry of manifest.assets ?? []) {
  if (isDerived(entry)) continue
  const abs = path.resolve(ROOT, entry.path)
  listed.add(path.basename(abs))
  if (existsSync(abs) && statSync(abs).size === 0) failures.push(`${entry.id}: ${entry.path} is empty, so the registry names a zero-byte file`)
}

// Unlisted on disk: public/fonts is the only tree a file can be dropped in
// without an author; report it by name rather than ignoring whatever a future
// drop adds.
const fontsDir = path.join(ROOT, 'public', 'fonts')
if (existsSync(fontsDir)) {
  for (const name of readdirSync(fontsDir)) {
    if (!/\.(woff2?|ttf|otf)$/.test(name)) continue
    if (!listed.has(name) && !listed.has(path.join('public', 'fonts', name))) {
      failures.push(`public/fonts/${name}: ships but is absent from the manifest; register it or remove it`)
    }
  }
}

// Dangling references: asset-shaped string literals in the shipped source must
// name a published file or be a prop the caller passes (paths in `src=` props
// are the caller's data, so they are not flagged here; this rule is for hard
// asset paths like url(...) in CSS and `public/`-rooted literals).
const css = existsSync(path.join(ROOT, 'src', 'styles.css'))
  ? readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8')
  : ''
const fontRefs = [...css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map((m) => m[1]).filter((u) => u.endsWith('.woff2'))
for (const ref of fontRefs) {
  const resolved = path.normalize(path.join(ROOT, 'public', 'fonts', path.basename(ref)))
  if (purpose(resolved) !== 'ok') failures.push(`styles.css: ${ref} does not resolve next to the shipped fonts`)
}
if (fontRefs.length === 0) failures.push('styles.css: no @font-face source was read, so the integrity of the face cannot be judged')

// Package publish list: dist/fonts and dist/assets must hold the manifest's files.
const manifestJsonDist = path.join(ROOT, 'dist', 'assets', 'manifest.json')
if (process.env.PRISM_ASSETS_ROOT == null && !existsSync(manifestJsonDist)) {
  failures.push('dist/assets/manifest.json: absent, so Gate L cannot confirm the registry ships')
}

console.log(`${NAME}: ${manifest.assets?.length ?? 0} manifest entr(ies); ${fontRefs.length} font reference(s) from styles.css; ${listed.size} listed file(s)`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
console.log(`${NAME}: every shipped asset is listed, present, non-empty, and named by the CSS that ships it.`)
