/**
 * SVG security gate (Mission Gate E).
 *
 * An SVG is executable markup that happens to scale, so an allowlist on
 * structure is the gate. Every `.svg` under `packages/ui/public` and
 * `apps/site/src/app` is read as text and held to one rule set:
 *
 *   - a `<script>` element and any `on*` event handler are failures
 *   - an external reference (`href` to http/https, `xlink:href`) is a failure
 *   - an embedded `<style>` element is a failure: colour must arrive from a
 *     token class, not from a stylesheet the drawing carries with it
 *   - a `viewBox` must be present and parseable, because an SVG without one
 *     cannot declare its intrinsic aspect and any width the reader gives it is
 *     a guess
 *   - a UI icon (category `icon` or role `ui-icon`) must carry no painted
 *     literal: fills and strokes name `currentColor` or a semantic token class.
 *     A brand logo may carry fixed hex only with a written exemption on its
 *     manifest entry, because a favicon renders outside the token cascade.
 *
 * The manifest is the exemption ledger: `themeAware: false` with a non-empty
 * `exception` is the only way a logo's hex survives this gate. A painted
 * literal without that ledger entry is a finding, not a judgement call.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:svg-security
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'svg-security'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const REPO = path.join(PKG, '..', '..')

const MANIFEST = process.env.PRISM_ASSETS_MANIFEST
  ? path.resolve(process.env.PRISM_ASSETS_MANIFEST)
  : path.join(PKG, 'src', 'assets', 'asset-manifest.json')

const ROOTS = process.env.PRISM_ASSETS_ROOT
  ? [path.resolve(process.env.PRISM_ASSETS_ROOT)]
  : [path.join(PKG, 'public'), path.join(REPO, 'apps', 'site', 'src', 'app')]

const rel = (file) => path.relative(REPO, file).split(path.sep).join('/')
const HEX = /#[0-9a-fA-F]{3,8}\b/g

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.svg')) out.push(full)
  }
  return out
}

function exemptions() {
  if (!existsSync(MANIFEST)) return new Map()
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8').replace(/^﻿/, ''))
  const map = new Map()
  for (const entry of manifest.assets ?? []) {
    if (entry.format === 'svg' && entry.themeAware === false && typeof entry.exception === 'string' && entry.exception.trim()) {
      map.set(entry.id, entry.exception)
      map.set(path.basename(entry.path ?? ''), entry.exception)
    }
  }
  return map
}

const EXEMPT = exemptions()
const files = ROOTS.flatMap((root) => walk(root)).sort()
const failures = []

if (files.length === 0) {
  console.error(`${NAME}: no .svg read under ${ROOTS.map((root) => rel(root)).join(', ')}, so the rule judged nothing`)
  process.exit(1)
}

let paintedLiterals = 0
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const shown = rel(file)

  if (!/viewBox="[^"]+"/.test(source)) {
    failures.push(`${shown}: no viewBox, so the intrinsic aspect cannot be read and any size the reader gives it is a guess`)
  }
  if (/<\s*script\b/i.test(source)) failures.push(`${shown}: carries a <script> element, which is executable markup`)
  if (/\bon[a-z]+\s*=/i.test(source)) failures.push(`${shown}: carries an event-handler attribute, which executes in the page that embeds it`)
  if (/<\s*style\b/i.test(source)) failures.push(`${shown}: carries an embedded <style>, so colour arrives from a stylesheet the drawing brings with it`)
  for (const match of source.matchAll(/\b(?:xlink:href|href)\s*=\s*"([^"]+)"/g)) {
    const value = match[1]
    if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
      failures.push(`${shown}: references ${value}, so embedding it reaches outside the page that drew it`)
    }
  }

  // Painted literals: a hex in an SVG is a resolved colour a pack boundary
  // cannot repaint. Brand logos we the ledger entry for are exempt; an icon
  // that uses it must name currentColor instead.
  const hits = [...source.matchAll(HEX)]
  for (const hit of hits) {
    paintedLiterals += 1
    const exempted = EXEMPT.has(path.basename(file)) || [...EXEMPT.keys()].some((key) => shown.includes(key))
    if (!exempted) {
      failures.push(`${shown}: paints ${hit[0]}, a resolved colour; a UI icon names currentColor and a brand logo names an exemption on its manifest entry`)
    }
  }
}

console.log(`${NAME}: ${files.length} svg file(s) read under ${ROOTS.map((root) => rel(root)).join(', ')}`)
console.log(`${NAME}: ${paintedLiterals} painted literal(s), ${EXEMPT.size} exemption id(s) in the ledger`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
console.log(`${NAME}: no svg carries executable markup, external references, or unexempted painted colour.`)
