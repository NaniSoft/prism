/**
 * Emitted-contract check.
 *
 * Replaces the old Tailwind spacing-coincidence gate, which compared the authored
 * spacing scale against Tailwind's own private `theme.css`. This reads only the
 * DTCG source and the emitted files, and asserts:
 *
 *   1. completeness: every authored bound-group token has its declared custom
 *      property in the file the contract says it belongs to;
 *   2. value equality: each emitted value equals the authored value, serialised
 *      by the same `toCss` the build uses;
 *   3. spacing arithmetic: `spacing.1` is `--spacing` and every step equals
 *      `--spacing` times its own key;
 *   4. no extras: no declaration exists in a bound namespace that the source did
 *      not author (this is what once let an unbounded group hide);
 *   5. the mode-independent groups: shadows, the closed breakpoint set, the
 *      containers, and the zero-overshoot easing and closed duration set.
 *
 * It also checks the runtime selector shape, so the emitted CSS cannot drift from
 * the `themeSelector` output switch.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { toCss, readToken } from '../build/serialize.mjs'
import { foundationTree, groupEntries } from '../build/foundation.mjs'
import { themeSelector, THEME_SELECTOR_STYLE } from '../build/themes.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist')
const SRC = path.join(PKG, 'src')

const EXTENSION = 'com.nanisoft.prism'

const failures = []
const check = (condition, message) => {
  if (!condition) failures.push(message)
}

// ── Parsing ───────────────────────────────────────────────────────────────────

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
  for (const match of text.matchAll(DECLARATION)) {
    out.set(match[1].trim(), match[2].trim())
  }
  return out
}

const selectorOf = (css) => css.match(/^[ \t]*([^ \t{][^{\n]*?)[ \t]*\{/m)?.[1].trim()

const escapeDot = (key) => key.replace(/\./g, '\\.')

// ── Foundation lookup ─────────────────────────────────────────────────────────

function flatten(tree, prefix = [], out = new Map()) {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue
    const isToken =
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('$value' in value || 'value' in value)
    if (isToken) out.set([...prefix, key].join('.'), value)
    else if (value !== null && typeof value === 'object') flatten(value, [...prefix, key], out)
  }
  return out
}

const foundationTokens = flatten(foundationTree)

function resolveReference(reference) {
  const path = String(reference).replace(/^\{|\}$/g, '')
  const token = foundationTokens.get(path)
  return token ? toCss(token.$value ?? token.value) : null
}

// ── Expected static block ─────────────────────────────────────────────────────

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
check(spacing.length === 20, `spacing should author 20 steps, found ${spacing.length}`)
check(spacingBase !== undefined, 'spacing is missing its base step `1`')
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

// ── Emitted files ─────────────────────────────────────────────────────────────

const lightCss = await readText(path.join(DIST, 'light.css'))
const darkCss = await readText(path.join(DIST, 'dark.css'))
const themeCss = await readText(path.join(DIST, 'theme.css'))
const lightDecls = declarations(lightCss)
const darkDecls = declarations(darkCss)
const inlineDecls = declarations(atRuleBody(themeCss, '@theme inline {'))
const staticDecls = declarations(atRuleBody(themeCss, '@theme static {'))

check(atRuleBody(themeCss, '@theme static {') !== null, 'theme.css has no @theme static block')
check(atRuleBody(themeCss, '@theme inline {') !== null, 'theme.css has no @theme inline block')

// 1 + 2. Colours: every authored semantic token, in the right mode file.
for (const mode of ['light', 'dark']) {
  const source = await readJson(path.join(SRC, 'semantic', `${mode}.tokens.json`))
  const decls = mode === 'light' ? lightDecls : darkDecls
  for (const [name, token] of Object.entries(source)) {
    if (name.startsWith('$') || name === 'radius') continue
    const want = resolveReference(token.$value)
    check(decls.has(name), `${mode}.css is missing --${name}`)
    if (want !== null && decls.has(name)) {
      check(decls.get(name) === want, `--${name} in ${mode}.css is "${decls.get(name)}", authored "${want}"`)
    }
  }
}

// Radius is mode-independent but mode-scoped in the shadcn contract.
const radiusToken = (await readJson(path.join(SRC, 'semantic', 'radius.tokens.json'))).radius
const radiusValue = toCss(radiusToken.$value)
check(lightDecls.get('radius') === radiusValue, `--radius in light.css is "${lightDecls.get('radius')}", authored "${radiusValue}"`)
check(darkDecls.get('radius') === radiusValue, `--radius in dark.css is "${darkDecls.get('radius')}", authored "${radiusValue}"`)

// 4. The `@theme inline` colour contract is unchanged.
for (const [name] of Object.entries(await readJson(path.join(SRC, 'semantic', 'light.tokens.json')))) {
  if (name.startsWith('$') || name === 'radius') continue
  check(inlineDecls.get(`color-${name}`) === `var(--${name})`, `@theme inline is missing --color-${name}: var(--${name})`)
}

// 1 + 2 + 5. Every expected static declaration exists and equals the autor's value.
for (const [name, want] of expected) {
  check(staticDecls.has(name), `theme.css @theme static is missing --${name}`)
  if (staticDecls.has(name)) {
    check(staticDecls.get(name) === want, `--${name} in theme.css is "${staticDecls.get(name)}", authored "${want}"`)
  }
}

// 4. No declaration in a bound namespace that the source did not author.
const NAMESPACES = [
  'font-', 'font-weight-', 'text-', 'leading-', 'tracking-',
  'duration-', 'ease-', 'shadow-', 'breakpoint-', 'container-',
  'transition-duration-', 'default-transition-duration', 'default-transition-timing-function',
]
const isBound = (name) =>
  name === 'spacing' ||
  name.startsWith('spacing-') ||
  NAMESPACES.some((namespace) => name.startsWith(namespace))
for (const name of staticDecls.keys()) {
  if (isBound(name) && !expected.has(name)) {
    failures.push(`theme.css @theme static declares --${name}, which the DTCG source did not author`)
  }
}

// 3. Spacing is the base multiplier times the key.
if (spacingBase) {
  const base = Number.parseFloat(readToken(spacingBase[1]))
  check(staticDecls.get('spacing') === readToken(spacingBase[1]), '--spacing must equal the authored spacing.1')
  for (const [key, token] of spacing) {
    const value = readToken(token)
    if (Number(key) === 0) {
      check(/^0(px|rem)?$/.test(value), `spacing.0 is "${value}", but the zero step must be a literal zero`)
      continue
    }
    const match = value.match(/^(-?[\d.]+)rem$/)
    const want = base * Number(key)
    check(
      match !== null && Math.abs(Number(match[1]) - want) < 1e-9,
      `spacing.${key} is "${value}", but --spacing x ${key} is ${want}rem`,
    )
  }
}

// 5. Closed sets and the zero-overshoot rule.
const durationKeys = groupEntries(foundationTree, ['duration']).map(([key]) => key).sort()
check(JSON.stringify(durationKeys) === JSON.stringify(['base', 'fast', 'slow']), `duration set must be {fast, base, slow}, found {${durationKeys.join(', ')}}`)
check(staticDecls.get('duration-fast') === '80ms' && staticDecls.get('duration-base') === '160ms' && staticDecls.get('duration-slow') === '280ms', 'duration values must be 80/160/280ms')

const easeKeys = groupEntries(foundationTree, ['ease']).map(([key]) => key).sort()
check(JSON.stringify(easeKeys) === JSON.stringify(['in-out', 'out']), `ease set must be {out, in-out}, found {${easeKeys.join(', ')}}`)
for (const [key, token] of groupEntries(foundationTree, ['ease'])) {
  const value = token.$value ?? token.value
  check(Array.isArray(value) && value.length === 4, `ease.${key} must be a four-number cubic-bezier`)
  if (Array.isArray(value) && value.length === 4) {
    check(value[1] >= 0 && value[1] <= 1 && value[3] >= 0 && value[3] <= 1, `ease.${key} overshoots: control-point y must stay in [0, 1]`)
  }
}

const shadowKeys = groupEntries(foundationTree, ['shadow']).map(([key]) => key).sort()
check(JSON.stringify(shadowKeys) === JSON.stringify(['md', 'sm', 'xs']), `shadow set must be exactly {xs, sm, md}, found {${shadowKeys.join(', ')}}`)
for (const forbidden of ['shadow-2xs', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner']) {
  check(!staticDecls.has(forbidden), `theme.css must not emit --${forbidden}`)
}
for (const name of staticDecls.keys()) {
  check(!name.startsWith('inset-shadow-') && !name.startsWith('drop-shadow-'), `theme.css must not emit --${name}`)
}

const breakpointKeys = groupEntries(foundationTree, ['breakpoint']).map(([key]) => key).sort()
check(JSON.stringify(breakpointKeys) === JSON.stringify(['lg', 'md', 'sm']), `breakpoint set must be {sm, md, lg}, found {${breakpointKeys.join(', ')}}`)
check(staticDecls.get('breakpoint-xl') === 'initial' && staticDecls.get('breakpoint-2xl') === 'initial', 'breakpoint-xl and breakpoint-2xl must be closed with `initial`')

const containerKeys = groupEntries(foundationTree, ['container']).map(([key]) => key).sort()
check(JSON.stringify(containerKeys) === JSON.stringify(['measure', 'measure-narrow', 'page']), `container set must be {page, measure, measure-narrow}, found {${containerKeys.join(', ')}}`)

// 6. The runtime selector shape comes from the single output switch.
const manifest = await readJson(path.join(DIST, 'themes.json'))
check(selectorOf(lightCss) === ':root', `light.css should select :root, found "${selectorOf(lightCss)}"`)
check(selectorOf(darkCss) === '.dark', `dark.css should select .dark, found "${selectorOf(darkCss)}"`)
for (const { id } of manifest) {
  const themeLight = await readText(path.join(DIST, 'themes', id, 'light.css'))
  const themeDark = await readText(path.join(DIST, 'themes', id, 'dark.css'))
  check(
    selectorOf(themeLight) === themeSelector(id, 'light', THEME_SELECTOR_STYLE),
    `themes/${id}/light.css should select "${themeSelector(id, 'light', THEME_SELECTOR_STYLE)}", found "${selectorOf(themeLight)}"`,
  )
  check(
    selectorOf(themeDark) === themeSelector(id, 'dark', THEME_SELECTOR_STYLE),
    `themes/${id}/dark.css should select "${themeSelector(id, 'dark', THEME_SELECTOR_STYLE)}", found "${selectorOf(themeDark)}"`,
  )
}

// ── Result ────────────────────────────────────────────────────────────────────

if (failures.length) {
  console.error(`\nemitted-contract: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(
  `emitted-contract: ${expected.size} bound-group declarations match the DTCG source ` +
    `(${spacing.length} spacing steps, ${shadowKeys.length} shadows, ${breakpointKeys.length} breakpoints, ${containerKeys.length} containers)`,
)
