/**
 * Asset metadata gate (Mission Gate C).
 *
 * The manifest claims a file exists, has the format, the size and the aspect the
 * registry states. A claim nobody measured is a guess, so this gate reads both
 * and fails when they disagree. It reads the authored manifest in
 * `src/assets/asset-manifest.json` and the files it names, relative to the
 * package root. Fonts are measured by byte size, PNGs by their IHDR header,
 * SVGs by viewBox, and component-derived marks by their source module.
 *
 * `PRISM_ASSETS_MANIFEST` and `PRISM_ASSETS_ROOT` exist so the gate can prove
 * itself against a staged tree: the test suite copies the script, writes one
 * fixture manifest with one defect, and expects one failure naming it.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:asset-metadata
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'asset-metadata'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

const MANIFEST = process.env.PRISM_ASSETS_MANIFEST
  ? path.resolve(process.env.PRISM_ASSETS_MANIFEST)
  : path.join(PKG, 'src', 'assets', 'asset-manifest.json')
const ROOT = process.env.PRISM_ASSETS_ROOT
  ? path.resolve(process.env.PRISM_ASSETS_ROOT)
  : PKG

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const isDerived = (entry) => entry.format === 'svg-component'

function pngSize(buffer) {
  if (buffer.length < 33 || buffer.toString('ascii', 1, 4) !== 'PNG') return null
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

function svgViewBox(text) {
  const match = /viewBox="([^"]+)"/.exec(text)
  if (!match) return null
  const parts = match[1].trim().split(/\s+/).map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null
  return { width: parts[2], height: parts[3] }
}

function readManifest() {
  if (!existsSync(MANIFEST)) {
    console.error(`${NAME}: ${rel(MANIFEST)} does not exist, so this run has nothing to hold the files to`)
    process.exit(1)
  }
  return JSON.parse(readFileSync(MANIFEST, 'utf8').replace(/^﻿/, ''))
}

const manifest = readManifest()
const failures = []
const fail = (message) => failures.push(message)

// Schema shape: version, budgets, variants, assets.
if (manifest.version !== 1) fail(`version is ${JSON.stringify(manifest.version)}, expected 1`)
if (manifest.budgetsKiB == null || typeof manifest.budgetsKiB !== 'object') fail('budgetsKiB is missing')
if (manifest.variants == null || typeof manifest.variants !== 'object') fail('variants is missing')
if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) fail('assets is empty or not an array')

const VARIANTS = ['hero', 'wide-hero', 'banner', 'card', 'landscape-thumb', 'square-thumb', 'avatar', 'product', 'logo', 'illustration', 'icon']
const CATEGORIES = ['font', 'image', 'icon', 'logo', 'illustration', 'video']
const FORMATS = ['woff2', 'png', 'svg', 'ico', 'svg-component', 'webp', 'avif', 'mp4', 'webm']
const ROLES = ['ui-icon', 'brand-logo', 'decoration', 'complex-diagram', 'content', 'font']

if (manifest.variants) {
  for (const variant of VARIANTS) {
    if (!manifest.variants[variant]) fail(`variants.${variant} is missing, so a controlled component naming it resolves to nothing`)
  }
}

const seenIds = new Set()
let assetsRead = 0
let filesChecked = 0

for (const entry of manifest.assets ?? []) {
  assetsRead += 1
  if (!entry.id || !/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) fail(`${entry.id ?? '(missing id)'}: id is not a kebab-case identifier`)
  if (seenIds.has(entry.id)) fail(`${entry.id}: duplicate id, so two entries claim one asset`)
  seenIds.add(entry.id)
  if (!CATEGORIES.includes(entry.category)) fail(`${entry.id}: category ${JSON.stringify(entry.category)} is outside ${CATEGORIES.join(', ')}`)
  if (!FORMATS.includes(entry.format)) fail(`${entry.id}: format ${JSON.stringify(entry.format)} is outside ${FORMATS.join(', ')}`)
  if (!ROLES.includes(entry.role)) fail(`${entry.id}: role ${JSON.stringify(entry.role)} is outside ${ROLES.join(', ')}`)
  if (typeof entry.themeAware !== 'boolean') fail(`${entry.id}: themeAware must be a boolean, because a missing value reads as either answer`)
  if (!Array.isArray(entry.allowedVariants) || entry.allowedVariants.length === 0) fail(`${entry.id}: allowedVariants is empty, so no presentation can name it`)
  for (const variant of entry.allowedVariants ?? []) {
    if (!VARIANTS.includes(variant)) fail(`${entry.id}: allows variant ${JSON.stringify(variant)}, which no token defines`)
  }
  if (!entry.budgetKiB || entry.budgetKiB < 1) fail(`${entry.id}: budgetKiB must be a positive number`)

  const budgetKiB = manifest.budgetsKiB?.[entry.category] ?? manifest.budgetsKiB?.[entry.role === 'font' ? 'font' : entry.category]
  if (budgetKiB != null && entry.budgetKiB > budgetKiB) fail(`${entry.id}: budgetKiB ${entry.budgetKiB} exceeds the ${budgetKiB} KiB ceiling for ${entry.category}`)

  if (isDerived(entry)) {
    // Derived marks: the source module must exist and carry the named export.
    const [modulePath, exportName] = entry.path.split('#')
    const sourceFile = path.join(ROOT, modulePath)
    if (!existsSync(sourceFile)) {
      fail(`${entry.id}: derived source ${entry.path} does not exist at ${rel(sourceFile)}`)
      continue
    }
    const source = readFileSync(sourceFile, 'utf8')
    if (exportName && !new RegExp(`function ${exportName}\\b|export \\{[^}]*${exportName}`).test(source)) {
      fail(`${entry.id}: ${modulePath} does not export ${exportName}`)
    }
    filesChecked += 1
    continue
  }

  const abs = path.resolve(ROOT, entry.path)
  if (!existsSync(abs)) {
    fail(`${entry.id}: path ${entry.path} does not exist, so the registry names a file the package does not carry`)
    continue
  }
  const bytes = statSync(abs).size
  filesChecked += 1

  if (entry.fileSizeBytes != null && entry.fileSizeBytes !== bytes) {
    fail(`${entry.id}: manifest records ${entry.fileSizeBytes} bytes, the file is ${bytes} bytes`)
  }
  if (bytes > entry.budgetKiB * 1024) {
    fail(`${entry.id}: ${bytes} bytes exceeds its ${entry.budgetKiB} KiB budget`)
  }

  if (entry.format === 'png') {
    const size = pngSize(readFileSync(abs))
    if (!size) {
      fail(`${entry.id}: not a PNG, so the intrinsic dimensions cannot be read`)
      continue
    }
    if (entry.intrinsicWidth != null && entry.intrinsicWidth !== size.width) fail(`${entry.id}: manifest width ${entry.intrinsicWidth} disagrees with the PNG ${size.width}`)
    if (entry.intrinsicHeight != null && entry.intrinsicHeight !== size.height) fail(`${entry.id}: manifest height ${entry.intrinsicHeight} disagrees with the PNG ${size.height}`)
  }
  if (entry.format === 'svg') {
    const box = svgViewBox(readFileSync(abs, 'utf8'))
    if (!box) fail(`${entry.id}: no parseable viewBox, so the intrinsic aspect cannot be read`)
    if (entry.intrinsicWidth != null && box && entry.intrinsicWidth !== box.width) fail(`${entry.id}: manifest width ${entry.intrinsicWidth} disagrees with viewBox ${box.width}`)
  }
  void entry
}

if (assetsRead === 0) failures.push('the manifest holds no asset, so this run judged nothing and reporting zero findings would be the failure this gate exists to prevent')
if (filesChecked === 0) failures.push('no file was checked, so the manifest and the tree were never read against each other')

console.log(`${NAME}: ${assetsRead} asset(s) from ${rel(MANIFEST)}, ${filesChecked} file(s) checked against ${rel(ROOT)}`)
console.log(`${NAME}: budgets KiB ${JSON.stringify(manifest.budgetsKiB)}; variants ${VARIANTS.length}; categories ${CATEGORIES.length}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
console.log(`${NAME}: every entry names a file that exists, fits its budget, and carries the dimensions the manifest records.`)
