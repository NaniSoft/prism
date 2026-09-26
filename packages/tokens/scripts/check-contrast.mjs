/**
 * Contrast gate.
 *
 * Pastels are easy to get wrong: a soft fill looks fine in isolation but can fail
 * badly against its own foreground. This checks every foreground/background pair in
 * every built theme, so a palette change that breaks accessibility fails the build
 * instead of shipping.
 *
 * Thresholds follow WCAG 2.2: 4.5:1 for body text, 3:1 for large text and for
 * non-text boundaries such as borders and focus rings.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(HERE, '..', 'dist')

const channel = (v) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = (hex) => {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * [foreground, background, minimum, label, severity]
 *
 * `required` pairs gate the build. `advisory` pairs are reported but do not fail:
 * a subtle card border is a deliberate aesthetic choice, and WCAG 1.4.11 only
 * requires 3:1 where a boundary is the sole means of identifying a control. Focus
 * rings stay required — an unfindable focus indicator is a real defect.
 */
const PAIRS = [
  ['foreground', 'background', 4.5, 'body text', 'required'],
  ['card-foreground', 'card', 4.5, 'card text', 'required'],
  ['popover-foreground', 'popover', 4.5, 'popover text', 'required'],
  ['primary-foreground', 'primary', 4.5, 'primary button', 'required'],
  ['secondary-foreground', 'secondary', 4.5, 'secondary button', 'required'],
  ['accent-foreground', 'accent', 4.5, 'accent surface', 'required'],
  ['muted-foreground', 'background', 4.5, 'muted text', 'required'],
  // The pill, avatar fallback, kbd and tab-list pattern pairs muted text with
  // the muted surface, not the page ground, so it is a distinct pair. Without
  // this row the gate held the base pack at 4.74:1 on white while the muted
  // surface composited to 4.34:1 and the real-browser axe run caught it.
  ['muted-foreground', 'muted', 4.5, 'muted text on muted surface', 'required'],
  ['destructive-foreground', 'destructive', 4.5, 'destructive button', 'required'],
  ['success-foreground', 'success', 4.5, 'success badge', 'required'],
  ['warning-foreground', 'warning', 4.5, 'warning badge', 'required'],
  ['sidebar-foreground', 'sidebar', 4.5, 'sidebar text', 'required'],
  ['sidebar-primary-foreground', 'sidebar-primary', 4.5, 'sidebar active item', 'required'],
  ['sidebar-accent-foreground', 'sidebar-accent', 4.5, 'sidebar hover', 'required'],
  ['ring', 'background', 3, 'focus ring', 'required'],
  ['border', 'background', 3, 'border', 'advisory'],
  ['input', 'background', 3, 'input border', 'advisory'],
]

const manifest = JSON.parse(await readFile(path.join(DIST, 'themes.json'), 'utf8'))

const sources = [
  { id: 'default', label: 'default', light: 'tokens.light.json', dark: 'tokens.dark.json' },
  ...manifest.map((t) => ({
    id: t.id,
    label: t.name,
    light: `themes/${t.id}/tokens.light.json`,
    dark: `themes/${t.id}/tokens.dark.json`,
  })),
]

let failures = 0
let advisories = 0
const rows = []

/**
 * The new-`-foreground` pair rule (ticket 15 section 2).
 *
 * A semantic colour whose name ends in `-foreground` carries text on a surface.
 * If it is not the foreground of a checked pair, it ships without contrast
 * coverage. The base semantic source is the place a new one appears, so the rule
 * reads it directly and fails on an unpaired name. The current source omits
 * `$type`, so "colour" here means any root token that is not `radius`; the
 * explicit `$type: color` form is also accepted when it is later authored.
 */
const pairedForegrounds = new Set(PAIRS.map(([fg]) => fg))
const semanticLightFile = path.join(HERE, '..', 'src', 'semantic', 'light.tokens.json')
const semanticLight = JSON.parse(
  (await readFile(semanticLightFile, 'utf8')).replace(/^\uFEFF/, ''),
)
for (const [name, token] of Object.entries(semanticLight)) {
  if (name.startsWith('$') || name === 'radius') continue
  const isColor = token?.$type === undefined || token.$type === 'color'
  if (isColor && name.endsWith('-foreground') && !pairedForegrounds.has(name)) {
    failures++
    console.error(
      `  FAIL pair-rule  ${name}: a -foreground token must be the first element of a PAIRS entry`,
    )
  }
}

for (const source of sources) {
  for (const mode of ['light', 'dark']) {
    const tokens = JSON.parse(await readFile(path.join(DIST, source[mode]), 'utf8'))
    for (const [fg, bg, min, label, severity] of PAIRS) {
      const f = tokens[fg]?.value
      const b = tokens[bg]?.value
      if (!f?.startsWith('#') || !b?.startsWith('#')) {
        // A required pair with a missing or non-hex value is an error, not a
        // silent skip: a forgotten token must fail rather than disappear. An
        // advisory pair may still skip.
        if (severity === 'required') {
          failures++
          rows.push({ theme: source.label, mode, label, ratio: 0, min, ok: false, fg, bg, severity })
        }
        continue
      }
      const r = ratio(f, b)
      const ok = r >= min
      if (!ok) {
        if (severity === 'required') failures++
        else advisories++
      }
      rows.push({ theme: source.label, mode, label, ratio: r, min, ok, fg, bg, severity })
    }
  }
}

// Only surface failures plus a per-theme summary; a 100-row dump buries the signal.
for (const row of rows) {
  if (row.ok) continue
  const tag = row.severity === 'required' ? 'FAIL' : 'note'
  if (row.severity === 'required') {
    console.error(
      `  ${tag} ${row.theme}/${row.mode}  ${row.label}: ${row.ratio.toFixed(2)}:1 ` +
        `(needs ${row.min}:1)  ${row.fg} on ${row.bg}`,
    )
  }
}

for (const source of sources) {
  const mine = rows.filter((r) => r.theme === source.label)
  const required = mine.filter((r) => r.severity === 'required')
  const passed = required.filter((r) => r.ok).length
  const worst = required.reduce((a, b) => (b.ratio < a.ratio ? b : a))
  console.log(
    `  ${source.label.padEnd(9)} ${String(passed).padStart(2)}/${required.length} required pass  ` +
      `lowest ${worst.ratio.toFixed(2)}:1 (${worst.mode} ${worst.label})`,
  )
}

if (advisories) {
  console.log(`\n${advisories} advisory pair(s) below target — border/input are intentionally subtle.`)
}

if (failures) {
  console.error(`\ncontrast: ${failures} required pair(s) failing`)
  process.exit(1)
}
console.log(`\ncontrast: all required pairs pass across ${sources.length} themes`)
