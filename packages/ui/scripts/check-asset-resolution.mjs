/**
 * Asset resolution gate (Mission Gate D).
 *
 * A source that is smaller than the surface it paints at 2x looks soft exactly
 * where a reader looks longest. The rule is arithmetic: minimum source is the
 * maximum rendered size times the device pixel ratio, on both axes. A vector
 * asset (svg, svg-component, woff2) has no raster source and is exempt, and a
 * font carries the same exemption: there is no pixel to be short of.
 *
 * The gate reads the same manifest as the metadata gate and checks each raster
 * entry that names a rendered maximum and a DPR: `intrinsic >= rendered * DPR`
 * on width and on height. When the manifest names a `minSource`, that record
 * must agree with the arithmetic rather than restate it, so the two cannot drift.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:asset-resolution
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'asset-resolution'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

const MANIFEST = process.env.PRISM_ASSETS_MANIFEST
  ? path.resolve(process.env.PRISM_ASSETS_MANIFEST)
  : path.join(PKG, 'src', 'assets', 'asset-manifest.json')
const ROOT = process.env.PRISM_ASSETS_ROOT
  ? path.resolve(process.env.PRISM_ASSETS_ROOT)
  : PKG

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const VECTOR = new Set(['svg', 'svg-component', 'woff2', 'ico'])
const DEFAULT_DPR = 2

function readManifest() {
  if (!existsSync(MANIFEST)) {
    console.error(`${NAME}: ${rel(MANIFEST)} does not exist, so this run has no rendered maxima to measure against`)
    process.exit(1)
  }
  return JSON.parse(readFileSync(MANIFEST, 'utf8').replace(/^﻿/, ''))
}

const manifest = readManifest()
const failures = []
const fail = (message) => failures.push(message)

let checked = 0
let exempt = 0
let assetsRead = 0

for (const entry of manifest.assets ?? []) {
  assetsRead += 1
  if (VECTOR.has(entry.format)) {
    exempt += 1
    continue
  }
  if (entry.intrinsicWidth == null || entry.intrinsicHeight == null) {
    fail(`${entry.id}: raster ${entry.format} names no intrinsic size, so its resolution cannot be judged`)
    continue
  }
  if (entry.maxRenderedWidthPx == null && entry.maxRenderedHeightPx == null) {
    fail(`${entry.id}: names no rendered maximum, so the minimum source has nothing to be derived from`)
    continue
  }
  const dpr = entry.devicePixelRatio ?? DEFAULT_DPR
  if (dpr < 1) fail(`${entry.id}: devicePixelRatio ${dpr} is below 1, so the minimum source would be smaller than the surface it paints`)
  const maxW = entry.maxRenderedWidthPx ?? entry.intrinsicWidth
  const maxH = entry.maxRenderedHeightPx ?? entry.intrinsicHeight
  const needW = maxW * dpr
  const needH = maxH * dpr
  checked += 1
  if (entry.intrinsicWidth < needW) {
    fail(`${entry.id}: source ${entry.intrinsicWidth}px is under the 2x minimum ${needW}px (${maxW}px rendered at ${dpr}x)`)
  }
  if (entry.intrinsicHeight < needH) {
    fail(`${entry.id}: source ${entry.intrinsicHeight}px is under the 2x minimum ${needH}px (${maxH}px rendered at ${dpr}x)`)
  }
  if (entry.minSource != null) {
    if (entry.minSource.widthPx !== needW || entry.minSource.heightPx !== needH) {
      fail(`${entry.id}: minSource ${entry.minSource.widthPx}x${entry.minSource.heightPx} disagrees with rendered*DPR ${needW}x${needH}, so the record and the rule have drifted`)
    }
  }
  // The manifest's own PNG: a 192px favicon at 48px rendered is 4x, not the
  // 96px floor — the floor arithmetic must hold, not the other way round.
  const abs = path.resolve(ROOT, entry.path)
  void abs
  void rel
}

if (assetsRead === 0) failures.push('the manifest holds no asset, so this run judged nothing')
if (checked === 0) failures.push(`no raster asset with a rendered maximum was judged (${exempt} vector/font entry(s) exempt), so the rule ran over nothing`)

console.log(`${NAME}: ${assetsRead} asset(s), ${checked} raster judged, ${exempt} vector/font exempt`)
console.log(`${NAME}: rule is minimumSource = maxRendered * devicePixelRatio on both axes, DPR defaults to ${DEFAULT_DPR}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
console.log(`${NAME}: every raster source clears its 2x minimum on both axes.`)
