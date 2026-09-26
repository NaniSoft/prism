/**
 * Generates the pastel foundation ramps in `src/foundation/pastel.tokens.json`.
 *
 * Pastels are defined in OKLCH rather than picked by hand: lightness steps are then
 * perceptually uniform across every hue, which is what makes five different themes
 * feel like one family. A hand-tuned hex ramp drifts — yellow at a given lightness
 * reads far lighter than blue at the same value.
 *
 * Run: node scripts/gen-pastel.mjs   (output is committed; edit the tables below,
 * not the generated JSON)
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, '..', 'src', 'foundation', 'pastel.tokens.json')

/* ── OKLCH → sRGB ─────────────────────────────────────────────────────────── */

const clamp01 = (n) => Math.min(1, Math.max(0, n))

function oklchToLinearSrgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const gamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

const inGamut = (rgb) => rgb.every((c) => c >= -0.0001 && c <= 1.0001)

/** Reduce chroma until the colour fits sRGB, so no hue clips to a flat channel. */
function oklchToSrgb(L, C, H) {
  // OKLCH lightness runs 0 (black) to 1 (white). Only L<=0 is out of range —
  // clamping L>=1 to black here would turn every step-0 pastel into #000000.
  if (L <= 0) return [0, 0, 0]
  let lo = 0
  let hi = C
  if (inGamut(oklchToLinearSrgb(L, C, H))) lo = C
  else {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklchToLinearSrgb(L, mid, H))) lo = mid
      else hi = mid
    }
  }
  const rgb = oklchToLinearSrgb(L, lo, H).map((c) => clamp01(gamma(clamp01(c))))
  return rgb.map((c) => Math.round(c * 255))
}

const toHex = ([r, g, b]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`

/* ── Ramp definitions ─────────────────────────────────────────────────────── */

/** Perceptually even lightness. Wider in the mids, compressed at both ends. */
const STEPS = {
  0: { L: 1.0, c: 0 },
  50: { L: 0.975, c: 0.3 },
  100: { L: 0.945, c: 0.45 },
  200: { L: 0.9, c: 0.62 },
  300: { L: 0.84, c: 0.8 },
  400: { L: 0.74, c: 0.95 },
  500: { L: 0.65, c: 1.0 },
  600: { L: 0.56, c: 1.0 },
  700: { L: 0.47, c: 0.95 },
  800: { L: 0.38, c: 0.85 },
  900: { L: 0.3, c: 0.72 },
  950: { L: 0.21, c: 0.6 },
}

/**
 * Each theme gets a tinted neutral and a pastel brand ramp.
 * `neutralC` is deliberately tiny — the tint should register as cohesion, not colour.
 */
const THEMES = [
  { id: 'blush', hue: 5, neutralC: 0.011, brandC: 0.13 },
  { id: 'mint', hue: 152, neutralC: 0.01, brandC: 0.115 },
  { id: 'lavender', hue: 305, neutralC: 0.012, brandC: 0.125 },
  { id: 'sky', hue: 245, neutralC: 0.011, brandC: 0.115 },
  { id: 'peach', hue: 55, neutralC: 0.012, brandC: 0.125 },
]

/* ── Emit ─────────────────────────────────────────────────────────────────── */

const ramp = (hue, chroma) =>
  Object.fromEntries(
    Object.entries(STEPS).map(([step, { L, c }]) => {
      const rgb = oklchToSrgb(L, chroma * c, hue)
      return [
        step,
        {
          $value: {
            colorSpace: 'srgb',
            components: rgb.map((v) => Number((v / 255).toFixed(4))),
            alpha: 1,
            hex: toHex(rgb),
          },
        },
      ]
    }),
  )

const color = {}
for (const theme of THEMES) {
  color[`${theme.id}-neutral`] = ramp(theme.hue, theme.neutralC)
  color[`${theme.id}-brand`] = ramp(theme.hue, theme.brandC)
}

const doc = {
  color: {
    // No `$type` or `$description` here: this file merges into the same `color`
    // group as color.tokens.json, and redeclaring either makes Style Dictionary
    // report a collision. `$type: "color"` is inherited from that group.
    ...color,
  },
}

await writeFile(OUT, `${JSON.stringify(doc, null, 2)}\n`, 'utf8')

console.log(`pastel: wrote ${Object.keys(color).length} ramps -> ${path.relative(process.cwd(), OUT)}`)
for (const theme of THEMES) {
  const sample = color[`${theme.id}-brand`]['400'].$value.hex
  console.log(`  ${theme.id.padEnd(10)} hue ${String(theme.hue).padStart(3)}  brand-400 ${sample}`)
}
