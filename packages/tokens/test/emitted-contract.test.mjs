/**
 * The emitted-contract suite (ticket 15 section 3, ticket 06 section 4, ticket
 * 18).
 *
 * It reads only the DTCG source under `src/` and the emitted files under
 * `dist/`, and asserts the same contract `scripts/check-emitted-contract.mjs`
 * gates on, as a set of independently named tests. `scripts/check-*` stays the
 * build gate; this suite is the same contract inside `pnpm test` so a regression
 * names the broken group instead of one aggregate failure.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { toCss, readToken } from '../build/serialize.mjs'
import { foundationTree, groupEntries } from '../build/foundation.mjs'
import { themeSelector, THEME_SELECTOR_STYLE } from '../build/themes.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist')
const SRC = path.join(PKG, 'src')
const EXTENSION = 'com.nanisoft.prism'

const readText = async (file) => (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
const readJson = async (file) => JSON.parse(await readText(file))

/** The body of an at-rule block: `@theme static { ... }` -> `...`. */
function atRuleBody(text, atRule) {
  const start = text.indexOf(atRule)
  if (start === -1) return null
  const open = text.indexOf('{', start)
  const close = text.indexOf('}', open)
  if (open === -1 || close === -1) return null
  return text.slice(open + 1, close)
}

const DECLARATION = /--((?:\\.|[^\s:;])+)\s*:\s*([^;]+);/g

/** Custom-property declarations keyed by name without the leading `--`. */
function declarations(text) {
  const out = new Map()
  if (!text) return out
  for (const match of text.matchAll(DECLARATION)) out.set(match[1].trim(), match[2].trim())
  return out
}

const selectorOf = (css) => css.match(/^[ \t]*([^ \t{][^{\n]*?)[ \t]*\{/m)?.[1].trim()

function flatten(tree, prefix = [], out = new Map()) {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue
    const isToken =
      value !== null && typeof value === 'object' && !Array.isArray(value) && ('$value' in value || 'value' in value)
    if (isToken) out.set([...prefix, key].join('.'), value)
    else if (value !== null && typeof value === 'object') flatten(value, [...prefix, key], out)
  }
  return out
}

const foundationTokens = flatten(foundationTree)
const resolveReference = (reference) => {
  const token = foundationTokens.get(String(reference).replace(/^\{|\}$/g, ''))
  return token ? toCss(token.$value ?? token.value) : null
}

const escapeDot = (key) => key.replace(/\./g, '\\.')

/* ── The expected static block, derived from the DTCG source ──────────────── */

const expected = new Map()
const put = (name, value) => expected.set(name, value)

for (const [key, token] of groupEntries(foundationTree, ['font'])) put(`font-${key}`, readToken(token))
for (const [key, token] of groupEntries(foundationTree, ['font-weight'])) put(`font-weight-${key}`, readToken(token))
for (const [key, token] of groupEntries(foundationTree, ['text'])) {
  put(`text-${key}`, readToken(token))
  const lineHeight = token?.$extensions?.[EXTENSION]?.lineHeight
  if (lineHeight !== undefined) put(`text-${key}--line-height`, String(lineHeight))
}
for (const [key, token] of groupEntries(foundationTree, ['leading'])) put(`leading-${key}`, readToken(token))
for (const [key, token] of groupEntries(foundationTree, ['tracking'])) put(`tracking-${key}`, readToken(token))

const spacing = groupEntries(foundationTree, ['spacing'])
const spacingBase = spacing.find(([key]) => key === '1')
if (spacingBase) put('spacing', readToken(spacingBase[1]))
for (const [key, token] of spacing) put(`spacing-${escapeDot(key)}`, readToken(token))

for (const [key, token] of groupEntries(foundationTree, ['duration'])) put(`duration-${key}`, readToken(token))
for (const [key, token] of groupEntries(foundationTree, ['ease'])) put(`ease-${key}`, readToken(token))

put('transition-duration-fast', 'var(--duration-fast)')
put('transition-duration-base', 'var(--duration-base)')
put('transition-duration-slow', 'var(--duration-slow)')
put('default-transition-duration', 'var(--duration-base)')
put('default-transition-timing-function', 'var(--ease-out)')

for (const [key, token] of groupEntries(foundationTree, ['shadow'])) put(`shadow-${key}`, readToken(token))
for (const [key, token] of groupEntries(foundationTree, ['breakpoint'])) put(`breakpoint-${key}`, readToken(token))
put('breakpoint-xl', 'initial')
put('breakpoint-2xl', 'initial')
for (const [key, token] of groupEntries(foundationTree, ['container'])) put(`container-${key}`, readToken(token))

/* ── The emitted files ────────────────────────────────────────────────────── */

const lightCss = await readText(path.join(DIST, 'light.css'))
const darkCss = await readText(path.join(DIST, 'dark.css'))
const themeCss = await readText(path.join(DIST, 'theme.css'))
const lightDecls = declarations(lightCss)
const darkDecls = declarations(darkCss)
const inlineDecls = declarations(atRuleBody(themeCss, '@theme inline {'))
const staticDecls = declarations(atRuleBody(themeCss, '@theme static {'))
const manifest = await readJson(path.join(DIST, 'themes.json'))

const NAMESPACES = [
  'font-',
  'font-weight-',
  'text-',
  'leading-',
  'tracking-',
  'duration-',
  'ease-',
  'shadow-',
  'breakpoint-',
  'container-',
  'transition-duration-',
  'default-transition-duration',
  'default-transition-timing-function',
]
const isBound = (name) =>
  name === 'spacing' ||
  name.startsWith('spacing-') ||
  NAMESPACES.some((namespace) => name.startsWith(namespace))

describe('emitted token contract', () => {
  it('declares every authored semantic colour in its mode file at the authored value', async () => {
    for (const mode of ['light', 'dark']) {
      const source = await readJson(path.join(SRC, 'semantic', `${mode}.tokens.json`))
      const decls = mode === 'light' ? lightDecls : darkDecls
      for (const [name, token] of Object.entries(source)) {
        if (name.startsWith('$') || name === 'radius') continue
        expect(decls.get(name), `--${name} in ${mode}.css`).toBe(resolveReference(token.$value))
      }
    }
  })

  it('maps every semantic colour to a var in @theme inline', async () => {
    for (const name of Object.keys(await readJson(path.join(SRC, 'semantic', 'light.tokens.json')))) {
      if (name.startsWith('$') || name === 'radius') continue
      expect(inlineDecls.get(`color-${name}`), `--color-${name}`).toBe(`var(--${name})`)
    }
  })

  it('reaches the static theme block for every authored bound-group token', () => {
    for (const [name, want] of expected) {
      expect(staticDecls.get(name), `--${name}`).toBe(want)
    }
  })

  it('emits no bound-namespace declaration the DTCG source did not author', () => {
    const extras = [...staticDecls.keys()].filter((name) => isBound(name) && !expected.has(name))
    expect(extras).toEqual([])
  })

  it('keeps spacing as the base step times each of twenty keys', () => {
    expect(spacing.length).toBe(20)
    const base = Number.parseFloat(readToken(spacingBase[1]))
    expect(staticDecls.get('spacing')).toBe(readToken(spacingBase[1]))
    for (const [key, token] of spacing) {
      const value = readToken(token)
      if (Number(key) === 0) {
        expect(value).toMatch(/^0(px|rem)?$/)
        continue
      }
      const match = value.match(/^(-?[\d.]+)rem$/)
      expect(match, `spacing.${key} is "${value}"`).not.toBeNull()
      expect(Math.abs(Number(match[1]) - base * Number(key))).toBeLessThan(1e-9)
    }
  })

  it('closes motion to {fast, base, slow} = {80, 160, 280} with zero-overshoot easing', () => {
    const durationKeys = groupEntries(foundationTree, ['duration']).map(([key]) => key).sort()
    expect(durationKeys).toEqual(['base', 'fast', 'slow'])
    expect(staticDecls.get('duration-fast')).toBe('80ms')
    expect(staticDecls.get('duration-base')).toBe('160ms')
    expect(staticDecls.get('duration-slow')).toBe('280ms')

    const easeKeys = groupEntries(foundationTree, ['ease']).map(([key]) => key).sort()
    expect(easeKeys).toEqual(['in-out', 'out'])
    for (const [key, token] of groupEntries(foundationTree, ['ease'])) {
      const value = token.$value ?? token.value
      expect(Array.isArray(value) && value.length === 4, `ease.${key}`).toBe(true)
      expect(value[1], `ease.${key} control-point y`).toBeGreaterThanOrEqual(0)
      expect(value[1], `ease.${key} control-point y`).toBeLessThanOrEqual(1)
      expect(value[3], `ease.${key} control-point y`).toBeGreaterThanOrEqual(0)
      expect(value[3], `ease.${key} control-point y`).toBeLessThanOrEqual(1)
    }
  })

  it('closes the shadow set to xs, sm and md', () => {
    const shadowKeys = groupEntries(foundationTree, ['shadow']).map(([key]) => key).sort()
    expect(shadowKeys).toEqual(['md', 'sm', 'xs'])
    for (const forbidden of ['shadow-2xs', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner']) {
      expect(staticDecls.has(forbidden), `--${forbidden}`).toBe(false)
    }
    for (const name of staticDecls.keys()) {
      expect(name.startsWith('inset-shadow-') || name.startsWith('drop-shadow-')).toBe(false)
    }
  })

  it('closes breakpoints to {sm, md, lg} with xl and 2xl initial, and containers to three', () => {
    const breakpointKeys = groupEntries(foundationTree, ['breakpoint']).map(([key]) => key).sort()
    expect(breakpointKeys).toEqual(['lg', 'md', 'sm'])
    expect(staticDecls.get('breakpoint-xl')).toBe('initial')
    expect(staticDecls.get('breakpoint-2xl')).toBe('initial')

    const containerKeys = groupEntries(foundationTree, ['container']).map(([key]) => key).sort()
    expect(containerKeys).toEqual(['measure', 'measure-narrow', 'page'])
  })

  it('emits the runtime selector the output switch produces for every theme and mode', async () => {
    expect(selectorOf(lightCss)).toBe(':root')
    expect(selectorOf(darkCss)).toBe('.dark')
    for (const { id } of manifest) {
      const themeLight = await readText(path.join(DIST, 'themes', id, 'light.css'))
      const themeDark = await readText(path.join(DIST, 'themes', id, 'dark.css'))
      expect(selectorOf(themeLight), `themes/${id}/light.css`).toBe(
        themeSelector(id, 'light', THEME_SELECTOR_STYLE),
      )
      expect(selectorOf(themeDark), `themes/${id}/dark.css`).toBe(
        themeSelector(id, 'dark', THEME_SELECTOR_STYLE),
      )
    }
  })
})
