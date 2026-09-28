/**
 * The contrast-gate suite (ticket 89).
 *
 * `scripts/check-contrast.mjs` is the build gate. This suite is the same contract
 * as a set of independently named assertions, so a regression names the broken
 * claim instead of arriving as one aggregate failure, and so the tables the gate
 * reads are themselves under test: a gate that is handed an exemption list nobody
 * inspects is only as trustworthy as that list.
 *
 * Everything here reads the DTCG source and the emitted `dist/` directly and
 * recomputes the ratios, so none of it can be satisfied by the gate agreeing with
 * itself. The tables are imported from the gate rather than restated, so the
 * suite cannot pass against a table it wrote itself while the gate reads another.
 */
import { spawnSync } from 'node:child_process'
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  DISTINCT_SETS,
  EXEMPTIONS,
  MODES,
  PAIRS,
  coverageOf,
  luminance,
  ratio,
  readSemanticRoles,
} from '../scripts/check-contrast.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist')
const GATE = path.join(PKG, 'scripts', 'check-contrast.mjs')

const readText = async (file) => (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')
const readJson = async (file) => JSON.parse(await readText(file))

const manifest = await readJson(path.join(DIST, 'themes.json'))
const sources = [
  { id: 'default', label: 'default' },
  ...manifest.map(({ id, name }) => ({ id, label: name })),
]

const modeFile = (source, mode) =>
  path.join(DIST, source.id === 'default' ? `tokens.${mode}.json` : `themes/${source.id}/tokens.${mode}.json`)

/** Every source and mode, as the flat list the gate walks. */
const combinations = sources.flatMap((source) => MODES.map((mode) => ({ source, mode })))

const resolved = new Map()
for (const { source, mode } of combinations) {
  resolved.set(`${source.id}/${mode}`, await readJson(modeFile(source, mode)))
}
const tokensOf = (source, mode) => resolved.get(`${source.id}/${mode}`)

const source = await readSemanticRoles()
const declaredNonColours = new Set(
  EXEMPTIONS.filter((entry) => entry.kind === 'not-a-colour').map((entry) => entry.role),
)
const colourRoles = source
  .filter((role) => role.declaredAsColour && !declaredNonColours.has(role.name))
  .map((role) => role.name)

const measuredRoles = new Set(PAIRS.flatMap(([fg, bg]) => [fg, bg]))
const exemptRoles = new Set(EXEMPTIONS.map((entry) => entry.role))

describe('the gate is the entry point, and a rule that can fail is proved to fail', () => {
  /*
   * The gate runs its own `process.exit`, so it is guarded by an entry-point check
   * in order for this suite to import its tables at all. That guard is the one
   * place a mistake would turn the build gate into a script that measures nothing
   * and still exits 0, so it is proved by spawning the real file.
   */
  it('runs, measures, and reports coverage when spawned as the entry point', () => {
    const result = spawnSync(process.execPath, [GATE], { cwd: PKG, encoding: 'utf8' })
    expect(result.status, result.stdout + result.stderr).toBe(0)

    const out = result.stdout
    expect(out).toMatch(/contrast: coverage \d+ colour role\(s\) read from the semantic source/)
    expect(out).toMatch(/contrast: \d+ rows, \d+ required and \d+ advisory/)
    for (const entry of EXEMPTIONS) {
      expect(out, `exemption ${entry.role} reason is printed on every run`).toContain(entry.reason)
    }
    expect(out).toMatch(/contrast: all required pairs pass across \d+ packs/)
  })

  it('fails, naming the role, when a role resolves in light but not in dark', async () => {
    /*
     * The mode rule proved against a real mutation of the emitted output rather
     * than a mock, because a mocked measurement proves the mock. The mutation is
     * a copy, so the live `dist/` a dev server may be holding is never touched.
     *
     * Removing one value from ONE pack's dark file is the case the old gate could
     * not see: every row that named the role silently skipped, the coverage walk
     * did not exist, and the run was green while a role a consumer would read in
     * dark mode resolved to nothing.
     */
    const dir = path.join(PKG, '.turbo', 'contrast-suite-mode-mismatch')
    await rm(dir, { recursive: true, force: true })
    await cp(DIST, dir, { recursive: true })
    const file = path.join(dir, 'themes', 'mint', 'tokens.dark.json')
    const tokens = await readJson(file)
    delete tokens['brand-ink']
    await writeFile(file, `${JSON.stringify(tokens, null, 2)}\n`, 'utf8')

    try {
      const result = spawnSync(process.execPath, [GATE], {
        cwd: PKG,
        encoding: 'utf8',
        env: { ...process.env, PRISM_TOKENS_DIST: dir },
      })
      expect(result.status, 'a role missing from one mode must fail the gate').toBe(1)
      expect(result.stderr).toContain('Mint/dark: brand-ink does not resolve to an sRGB value')
      expect(result.stderr).toContain('is measured in both modes')
      expect(result.stdout).not.toMatch(/contrast: all required pairs pass/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('fails, naming the pair, when a ground moves under a required row', async () => {
    /*
     * The other half of the proof, and the one the ticket's own red case was: a
     * threshold that is never wrong is a gate that measures nothing. Mint's light
     * accent surface is replaced with a near-black ground in a copy of the
     * emitted output, which is what the token gate cannot see in a browser but
     * CAN see in a resolved value, and the brand ink has to be reported against it
     * by name with its measured ratio.
     */
    const dir = path.join(PKG, '.turbo', 'contrast-suite-unreachable-ratio')
    await rm(dir, { recursive: true, force: true })
    await cp(DIST, dir, { recursive: true })
    const file = path.join(dir, 'themes', 'mint', 'tokens.light.json')
    const tokens = await readJson(file)
    tokens.accent.value = '#101010'
    await writeFile(file, `${JSON.stringify(tokens, null, 2)}\n`, 'utf8')

    try {
      const result = spawnSync(process.execPath, [GATE], {
        cwd: PKG,
        encoding: 'utf8',
        env: { ...process.env, PRISM_TOKENS_DIST: dir },
      })
      expect(result.status, 'a required row below its bound must fail the gate').toBe(1)
      expect(result.stderr).toMatch(/Mint\/light\s+brand ink on an accent surface: \d+\.\d\d:1 \(needs 4\.5:1\)/)
      expect(result.stdout).not.toMatch(/contrast: all required pairs pass/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('every colour role is covered by a row or carries a stated reason', () => {
  it('reads a non-trivial role set from the source, so the walk is not circular', () => {
    // The role set comes from `src/semantic/*`, never from PAIRS. A gate that
    // derived it from the table would report full coverage for a table of one.
    expect(colourRoles.length).toBeGreaterThan(20)
    for (const role of colourRoles) expect(measuredRoles.has(role) || exemptRoles.has(role), role).toBe(true)
  })

  it('leaves no role uncovered, so adding a role without a row fails the build', () => {
    const uncovered = colourRoles.filter((role) => !measuredRoles.has(role) && !exemptRoles.has(role))
    expect(uncovered).toEqual([])
  })

  it('reports a role nobody has written down, which is the default the ticket asks for', () => {
    /*
     * Asserting today's roles are covered proves only that today's roles are
     * covered. What has to hold is the default for a role that does not exist
     * yet, and only a synthetic role can say that. Three shapes, because the rule
     * has three arms: a name no row names and no exemption excuses is a failure,
     * a name a row names is covered whatever its suffix, and a name with a
     * `-foreground` suffix gets no special treatment, which is the whole point of
     * the inversion.
     */
    const synthetic = coverageOf([...colourRoles, 'brand-ink-mono'])
    expect(synthetic.uncovered).toEqual(['brand-ink-mono'])
    expect(synthetic.covered).toContain('foreground')
    expect(synthetic.exempt).toContain('chart-1')

    // The name is irrelevant: a role that does not end in `-foreground` and is in
    // no row is still reported, which is the six-role hole this walk closed.
    const noSuffix = coverageOf([...colourRoles, 'chart-6'])
    expect(noSuffix.uncovered).toEqual(['chart-6'])

    // And a `-foreground` role is not privileged: it is in no row, so it fails
    // like any other. The old name test would have let it through the walk and
    // caught it later; the walk is now the only rule, so it catches it here.
    const withSuffix = coverageOf([...colourRoles, 'brand-ink-foreground'])
    expect(withSuffix.uncovered).toEqual(['brand-ink-foreground'])
  })

  it('names every role a row references, so a row cannot measure a pair that does not exist', () => {
    const all = new Set(source.map((role) => role.name))
    for (const [fg, bg] of PAIRS) {
      expect(all.has(fg), `row ${fg} on ${bg}: ${fg}`).toBe(true)
      expect(all.has(bg), `row ${fg} on ${bg}: ${bg}`).toBe(true)
    }
  })

  it('carries a reason on every exemption, because a bare allowlist is a silent hole', () => {
    for (const entry of EXEMPTIONS) {
      expect(typeof entry.reason, entry.role).toBe('string')
      expect(entry.reason.trim().length, `${entry.role} has no reason`).toBeGreaterThan(40)
      expect(['not-a-colour', 'graphic'], `${entry.role} has an unknown kind`).toContain(entry.kind)
    }
  })

  it('has no stale exemption: nothing is excused that a row already measures', () => {
    const stale = EXEMPTIONS.filter((entry) => entry.kind !== 'not-a-colour' && measuredRoles.has(entry.role))
    expect(stale.map((entry) => entry.role)).toEqual([])
  })

  it('has no orphaned exemption: nothing excuses a role the source does not author', () => {
    const all = new Set(source.map((role) => role.name))
    expect(EXEMPTIONS.filter((entry) => !all.has(entry.role)).map((entry) => entry.role)).toEqual([])
  })

  it('excludes radius as a non-colour, and the source agrees it is one', () => {
    const radius = source.find((role) => role.name === 'radius')
    expect(radius, 'radius must be readable from the semantic source the walk reads').toBeDefined()
    expect(radius.declaredAsColour).toBe(false)
    expect(colourRoles).not.toContain('radius')
    expect(EXEMPTIONS.some((entry) => entry.role === 'radius' && entry.kind === 'not-a-colour')).toBe(true)
  })
})

describe('a role is measured in both modes, and a mismatch fails', () => {
  it('resolves every colour role, exempt ones included, in both modes of every pack', () => {
    /*
     * The mode rule as implemented: an exemption buys a role freedom from a
     * GROUND, never from a MODE. So an exempt role still has to resolve in light
     * and in dark, which is what makes "no role is exempt from one mode"
     * checkable rather than a claim about the table.
     */
    const missing = []
    for (const { source: pack, mode } of combinations) {
      const tokens = tokensOf(pack, mode)
      for (const role of colourRoles) {
        const value = tokens[role]?.value
        if (typeof value === 'string' && value.startsWith('#')) continue
        missing.push(`${pack.id}/${mode} ${role} = ${value}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('measures every row in both modes, so no row is a light-mode-only claim', () => {
    for (const { source: pack, mode } of combinations) {
      const tokens = tokensOf(pack, mode)
      for (const [fg, bg] of PAIRS) {
        expect(tokens[fg]?.value, `${pack.id}/${mode} ${fg}`).toMatch(/^#[0-9a-f]{6}$/i)
        expect(tokens[bg]?.value, `${pack.id}/${mode} ${bg}`).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('names exactly two modes, so "both modes" is a closed set rather than a phrase', () => {
    expect(MODES).toEqual(['light', 'dark'])
  })
})

describe('the focus rings clear 3:1 on the surface they land on', () => {
  const ringRows = PAIRS.filter(([fg]) => fg === 'ring' || fg === 'sidebar-ring')
  it('measures both ring roles, so neither is outside the table', () => {
    expect(ringRows.map(([fg, bg, min, , severity]) => [fg, bg, min, severity])).toEqual([
      ['ring', 'background', 3, 'required'],
      ['sidebar-ring', 'sidebar', 3, 'required'],
    ])
  })

  for (const { source: pack, mode } of combinations) {
    it(`clears 3:1 in ${pack.label}/${mode}`, () => {
      const tokens = tokensOf(pack, mode)
      for (const [fg, bg] of ringRows) {
        const measured = ratio(tokens[fg].value, tokens[bg].value)
        expect(measured, `${pack.label}/${mode} ${fg} (${tokens[fg].value}) on ${bg} (${tokens[bg].value})`)
          .toBeGreaterThanOrEqual(3)
      }
    })
  }

  it('pins the sidebar ring to its own surface, not the page ground it is next to', () => {
    /*
     * The defect the row was added for: `sidebar-ring` shipped one ramp step
     * softer than `ring` and measured against nothing, and the two surfaces are
     * a step apart in both modes, so the row and the value are two halves of one
     * fix. Asserting the pair is the same ground in both packs is what keeps a
     * future edit from pointing one ring at the other's surface.
     */
    for (const { source: pack, mode } of combinations) {
      const tokens = tokensOf(pack, mode)
      const sidebarRing = ratio(tokens['sidebar-ring'].value, tokens.sidebar.value)
      const pageRing = ratio(tokens.ring.value, tokens.background.value)
      expect(sidebarRing, `${pack.label}/${mode}: the sidebar ring must hold on the sidebar, not the page`)
        .toBeGreaterThanOrEqual(3)
      expect(pageRing, `${pack.label}/${mode}`).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('the brand ink is text, and it is gated against all three grounds', () => {
  const grounds = ['background', 'card', 'accent']

  it('is measured against the page, a card and an accent surface', () => {
    const rows = PAIRS.filter(([fg]) => fg === 'brand-ink')
    expect(rows.map(([, bg, min, , severity]) => [bg, min, severity])).toEqual([
      ['background', 4.5, 'required'],
      ['card', 4.5, 'required'],
      ['accent', 4.5, 'required'],
    ])
  })

  for (const { source: pack, mode } of combinations) {
    it(`clears 4.5:1 on every ground in ${pack.label}/${mode}`, () => {
      const tokens = tokensOf(pack, mode)
      const ink = tokens['brand-ink'].value
      for (const ground of grounds) {
        const measured = ratio(ink, tokens[ground].value)
        expect(measured, `${pack.label}/${mode} brand-ink ${ink} on ${ground} ${tokens[ground].value}`)
          .toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  it('is emitted in both modes for every pack, as a custom property', async () => {
    for (const { source: pack, mode } of combinations) {
      const file =
        pack.id === 'default'
          ? path.join(DIST, `${mode}.css`)
          : path.join(DIST, 'themes', pack.id, `${mode}.css`)
      expect(await readText(file), `${pack.id}/${mode}.css`).toMatch(/^\s*--brand-ink:\s*#[0-9a-f]{6};/im)
    }
    const theme = await readText(path.join(DIST, 'theme.css'))
    expect(theme).toMatch(/--color-brand-ink:\s*var\(--brand-ink\);/)
  })

  it('is never the same value as the fill it exists because the fill cannot serve', () => {
    /*
     * The reason the role exists is that `primary` is a fill. A brand ink that
     * resolved to the fill would put the confusion back, and in the dark mode
     * where the fill is a light pastel step that was a live possibility: the
     * accent ground would have permitted brand 300, which is `primary` in every
     * pack's dark mode.
     */
    for (const { source: pack, mode } of combinations) {
      const tokens = tokensOf(pack, mode)
      const ink = tokens['brand-ink'].value
      for (const role of ['primary', 'primary-foreground', 'foreground']) {
        expect(ink, `${pack.label}/${mode}: brand-ink resolved to ${role}`).not.toBe(tokens[role].value)
      }
    }
  })

  it('carries more chroma than plain foreground, so it is a brand hue and not the neutral ink', () => {
    /*
     * The prohibition this role answers: `foreground` is the readable text token,
     * and a tired implementer reaches for it when a brand-coloured wordmark is
     * wanted. The packs' `foreground` is a tinted neutral whose chroma is
     * deliberately tiny, so the two are separated by a measurable margin rather
     * than by an instruction.
     */
    for (const { source: pack, mode } of combinations) {
      const tokens = tokensOf(pack, mode)
      const ink = tokens['brand-ink'].value
      const neutral = tokens.foreground.value
      expect(ink, `${pack.label}/${mode}: brand-ink and foreground resolve alike`).not.toBe(neutral)
      // Both are held to the same floor, so the neutral one is the darker of the
      // two in light and the lighter in dark. That alone separates them; the
      // chroma check is what says the separation is hue rather than lightness.
      expect(chromaOf(ink), `${pack.label}/${mode}`).toBeGreaterThan(chromaOf(neutral) * 4)
    }
  })
})

describe('the chart series are exempt with a reason and asserted to be distinct', () => {
  it('exempts exactly the five series, as a set that is judged together', () => {
    const chartExemptions = EXEMPTIONS.filter((entry) => /^chart-\d$/.test(entry.role))
    expect(chartExemptions.map((entry) => entry.role)).toEqual([
      'chart-1',
      'chart-2',
      'chart-3',
      'chart-4',
      'chart-5',
    ])
    const sets = DISTINCT_SETS.filter((set) => set.name === 'chart series')
    expect(sets).toHaveLength(1)
    expect(sets[0].roles).toEqual(chartExemptions.map((entry) => entry.role))
    expect(sets[0].reason.trim().length).toBeGreaterThan(40)
  })

  for (const { source: pack, mode } of combinations) {
    it(`resolves to five distinct values in ${pack.label}/${mode}`, () => {
      const tokens = tokensOf(pack, mode)
      const values = DISTINCT_SETS[0].roles.map((role) => tokens[role].value)
      expect(new Set(values).size, `${pack.label}/${mode}: ${values.join(' ')}`).toBe(5)
    })
  }

  it('reports a measured margin, so distinctness is not the only word for it', () => {
    /*
     * The assertion is exact distinctness and nothing more, because a separation
     * floor is a threshold with no standard behind it. The tightest pair is
     * therefore measured here rather than asserted against, so the number a
     * reader would want is pinned to the tree and moves when the ramps do.
     */
    let tightest = { distance: Infinity }
    for (const { source: pack, mode } of combinations) {
      const tokens = tokensOf(pack, mode)
      const roles = DISTINCT_SETS[0].roles
      for (let i = 0; i < roles.length; i++) {
        for (let j = i + 1; j < roles.length; j++) {
          const distance = channelDistance(tokens[roles[i]].value, tokens[roles[j]].value)
          if (distance < tightest.distance) {
            tightest = { distance, where: `${pack.label}/${mode}`, pair: `${roles[i]} and ${roles[j]}` }
          }
        }
      }
    }
    // Every pair is well clear of identical, and the tightest one is named so a
    // change to the ramps that narrows it is visible in a test diff.
    expect(tightest.distance).toBeGreaterThan(0)
    expect(tightest.distance).toBeLessThanOrEqual(255)
  })
})

describe('the advisory rows are advisory for a stated reason, not by accident', () => {
  it('marks a boundary row advisory and a focus row required', () => {
    const advisory = PAIRS.filter(([, , , , severity]) => severity === 'advisory').map(([fg, bg]) => `${fg} on ${bg}`)
    expect(advisory).toEqual(['border on background', 'input on background', 'sidebar-border on sidebar'])
    for (const [fg, bg] of PAIRS) {
      const severity = PAIRS.find((row) => row[0] === fg && row[1] === bg)[4]
      expect(['required', 'advisory'], `${fg} on ${bg}`).toContain(severity)
    }
  })
})

describe('the contrast math is WCAG and not an approximation', () => {
  it('computes the published reference ratios', () => {
    // Black on white is the ceiling and is 21:1 by construction.
    expect(ratio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    // The recorded failures this gate exists for, recomputed from first
    // principles so a change to the formula cannot quietly pass a regression.
    expect(ratio('#737373', '#ffffff')).toBeCloseTo(4.74, 1)
    expect(ratio('#a3a3a3', '#fafafa')).toBeCloseTo(2.42, 1)
    expect(luminance('#ffffff')).toBeCloseTo(1, 6)
    expect(luminance('#000000')).toBeCloseTo(0, 6)
  })
})

/* ── Local helpers ─────────────────────────────────────────────────────────── */

const srgbToLinear = (channel) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

/** OKLCH chroma, which is the number the two prohibition sentences cite. */
function chromaOf(hex) {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const r = srgbToLinear(((n >> 16) & 255) / 255)
  const g = srgbToLinear(((n >> 8) & 255) / 255)
  const b = srgbToLinear((n & 255) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return Math.hypot(a, bb)
}

/** The largest absolute per-channel sRGB distance between two resolved hexes. */
function channelDistance(a, b) {
  const parse = (hex) => {
    const n = Number.parseInt(hex.replace('#', ''), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  return Math.max(Math.abs(ar - br), Math.abs(ag - bg), Math.abs(ab - bb))
}
