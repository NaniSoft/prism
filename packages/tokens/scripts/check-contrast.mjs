/**
 * Contrast gate.
 *
 * Three things changed here, and every one of them was about what the gate could
 * not see.
 *
 * The walk is inverted. This used to walk the pair table and then apply one extra
 * rule, a name test: any root token ending in `-foreground` had to be the first
 * element of a row. That test could only see roles whose NAME announced that they
 * were foregrounds. Six of the seven roles that were in no row at all could not
 * be reported by any rule in this file, because `chart-1` through `chart-5` and
 * `sidebar-border` do not end in `-foreground`, and `sidebar-ring` does not
 * either. A gate that decides what to measure by a naming convention hands a new
 * role the default of silence, which is the defect the role walk replaces.
 *
 * So the walk starts at the token source. Every colour role in the semantic
 * source must appear in a row, as either element, or carry a declared exemption
 * whose reason is printed on every run. The default for a new role is now a
 * failure. The role set is read from the source and never from `PAIRS`, or the
 * walk would be checking the table against itself.
 *
 * The old name test is gone rather than kept beside the walk. It was never a
 * second opinion on coverage, which the walk settles, and its only additional
 * content is that a role named `*-foreground` must be the FOREGROUND of a row
 * rather than the background of one. That is a claim about the shadcn naming
 * convention, which is the Contract Rule's business and is stated in DESIGN.md,
 * and carrying it here would mean two tables to keep in step plus a worse error
 * message for the same failure.
 *
 * The mode rule. A role is measured in BOTH modes or the run fails, which is
 * enforced rather than assumed: every colour role, exempt ones included, has to
 * resolve to an sRGB value in light and in dark in every pack. An exemption buys
 * a role freedom from a GROUND, never from a MODE, so a role cannot be excused
 * in light and forgotten in dark.
 *
 * Thresholds follow WCAG 2.2: 4.5:1 for body text, 3:1 for large text and for
 * non-text boundaries such as borders and focus rings.
 *
 * Run: node scripts/check-contrast.mjs
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'

const HERE = path.dirname(fileURLToPath(import.meta.url))
/**
 * Output root. `PRISM_TOKENS_DIST` redirects it for the same reason `build.mjs`
 * honours it: the test lane runs this gate against a mutated COPY of the emitted
 * output to prove a rule can fail, and a gate that can only read the live
 * `dist/` forces that proof to edit the tree a dev server may be holding.
 */
const DIST = process.env.PRISM_TOKENS_DIST
  ? path.resolve(process.env.PRISM_TOKENS_DIST)
  : path.join(HERE, '..', 'dist')
const SRC = path.join(HERE, '..', 'src', 'semantic')

/** The two modes every role is measured in. A role present in one and not the other fails. */
export const MODES = ['light', 'dark']

const channel = (v) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export const luminance = (hex) => {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * [foreground, background, minimum, label, severity]
 *
 * `required` pairs gate the build. `advisory` pairs are reported but do not fail:
 * a subtle card border is a deliberate aesthetic choice, and WCAG 1.4.11 only
 * requires 3:1 where a boundary is the sole means of identifying a control. Focus
 * rings stay required - an unfindable focus indicator is a real defect.
 */
export const PAIRS = [
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
  // The sidebar is its own surface, so it has its own ring. It had no row at
  // all, and its shipped values measured 2.42:1 in the base pack's light mode,
  // 1.73:1 in its dark mode, 2.86:1 in Mint and 2.97:1 in Sky: a focus indicator
  // four of twelve pack/mode combinations could not be seen against. The values
  // moved, not the row. This is the row that found them.
  ['sidebar-ring', 'sidebar', 3, 'sidebar focus ring', 'required'],
  ['border', 'background', 3, 'border', 'advisory'],
  ['input', 'background', 3, 'input border', 'advisory'],
  // The sidebar divider is the same judgement as `border` on the page ground, on
  // the sidebar's own surface: a separator a sighted reader finds without it
  // being a control boundary. It measured 1.18:1 to 1.37:1 before it was
  // measured at all, which is the number a reader of the contract needs.
  ['sidebar-border', 'sidebar', 3, 'sidebar border', 'advisory'],
  // `brand-ink` is the one role in the contract that is a brand hue READ AS TEXT.
  // Three grounds, because three are where it lands: the page, a card, and the
  // tinted accent surface. The accent is the one that decides the step, in both
  // directions - a light-mode ink has to survive the pack's own brand 100, and a
  // dark-mode ink has to survive brand 800, and brand 600 and brand 400 are the
  // steps that fail each of those. The accent row is therefore the one that
  // constrains the value and the other two are the ones a reader will check.
  ['brand-ink', 'background', 4.5, 'brand ink on the page', 'required'],
  ['brand-ink', 'card', 4.5, 'brand ink on a card', 'required'],
  ['brand-ink', 'accent', 4.5, 'brand ink on an accent surface', 'required'],
]

/**
 * Why a chart series is not measured against a ground. Written once because all
 * five entries say the same thing, and a reason that is stated five times in a
 * source is a reason that is read once. The report groups exemptions by reason
 * and prints it a single time with the count and every role name beside it.
 */
const CHART_REASON =
  'a series colour is a graphic object rather than text, so WCAG 1.4.3 does not bind it: shadcn ' +
  'consumes chart-1 through chart-5 as the stroke and fill of a series and reads its tooltip and ' +
  'legend text from foreground and muted-foreground, which are each gated against their own ' +
  "ground. What binds a five-way set is that no two series resolve to the same value, which the " +
  '`chart series` distinctness assertion checks in every pack and mode instead, and chart-1 starts ' +
  "at the pack's own brand hue so a chart reads as its pack. Not asserted here: any minimum " +
  'separation between a series and the surface it is drawn on, or between two series beyond being ' +
  'distinct.'

/**
 * The whole exemption list. Every entry carries a reason, every reason is printed
 * on every run, and the count is printed with them, because an allowlist nobody
 * can read is a silent hole with a name on it.
 *
 * Two kinds, and the kind is part of the claim. `not-a-colour` says the role has
 * no sRGB value to measure at all, which is a statement about DTCG types.
 * `graphic` says the role is a colour and is deliberately not held to a ground
 * ratio, with the assertion that replaces the ratio named in the reason.
 */
export const EXEMPTIONS = [
  {
    role: 'radius',
    kind: 'not-a-colour',
    reason:
      'radius is a length. It authors 0.5rem in the base pack and 0.5rem to 1rem across the packs, it emits --radius rather than a colour, and it has no sRGB value, so there is no ground to measure it against and no ratio that would mean anything. It is declared here rather than left to a name test so that the exclusion is a decision on the record instead of a filter buried in a loop.',
  },
  { role: 'chart-1', kind: 'graphic', reason: CHART_REASON },
  { role: 'chart-2', kind: 'graphic', reason: CHART_REASON },
  { role: 'chart-3', kind: 'graphic', reason: CHART_REASON },
  { role: 'chart-4', kind: 'graphic', reason: CHART_REASON },
  { role: 'chart-5', kind: 'graphic', reason: CHART_REASON },
]

/**
 * Sets of roles that are judged as a set rather than role by role, because what
 * binds them is a property no single row can express.
 *
 * The assertion is exact-value distinctness and nothing more. A minimum
 * separation would be a threshold somebody has to argue about, and a threshold
 * nobody can derive from a standard is a number that gets bent; exact distinctness
 * is a property of the set itself, so it is asserted and the tightest pair is
 * reported next to it. A reader who wants a separation floor has the number.
 */
export const DISTINCT_SETS = [
  {
    name: 'chart series',
    roles: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
    reason:
      'a chart is read by comparing series, so two series that resolve to the same value are one ' +
      'series to a reader, and no per-series ground ratio can see it. Checked in every pack and ' +
      'both modes because the five resolve to different values in each, so a collapse in one ' +
      'combination is invisible from the others.',
  },
]

/** UTF-8 BOMs (Windows editors leave them) are not valid JSON - strip before parsing. */
const readJson = async (file) => JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''))

/**
 * The semantic source the build compiles, read as the role set this gate walks.
 *
 * Two files, because the build takes two: `light.tokens.json` holds the colour
 * roles and `radius.tokens.json` holds the one root token that is not a colour.
 * Reading only the first would make the `radius` exemption refer to a role the
 * walk never saw, which is a declaration that cannot be checked. The build's own
 * filter is `token.path.length === 1`, so every root-level entry in these two
 * files is a semantic token and nothing nested is.
 */
export async function readSemanticRoles() {
  const entries = []
  for (const file of ['light.tokens.json', 'radius.tokens.json']) {
    for (const [name, token] of Object.entries(await readJson(path.join(SRC, file)))) {
      if (name.startsWith('$')) continue
      entries.push({ name, declaredAsColour: token?.$type === undefined || token.$type === 'color' })
    }
  }
  return entries
}

/** The largest absolute per-channel sRGB distance between two resolved hexes, 0 to 255. */
function channelDistance(a, b) {
  const parse = (hex) => {
    const n = Number.parseInt(hex.replace('#', ''), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  return Math.max(Math.abs(ar - br), Math.abs(ag - bg), Math.abs(ab - bb))
}

/**
 * Which roles a row measures, which are excused, and which are neither.
 *
 * Exported and pure so the rule this gate runs on can be asserted directly. A
 * test that only inspected the real role set would prove that today's roles are
 * covered, which is a weaker claim: what has to hold is that a role nobody has
 * thought about yet is reported, and only a synthetic role can say that.
 */
export function coverageOf(roles) {
  const measured = new Set(PAIRS.flatMap(([fg, bg]) => [fg, bg]))
  const excused = new Set(EXEMPTIONS.filter((e) => e.kind !== 'not-a-colour').map((e) => e.role))
  return {
    measured,
    excused,
    covered: roles.filter((role) => measured.has(role)),
    exempt: roles.filter((role) => !measured.has(role) && excused.has(role)),
    uncovered: roles.filter((role) => !measured.has(role) && !excused.has(role)),
  }
}

async function main() {
  const manifest = await readJson(path.join(DIST, 'themes.json'))
  const sources = [
    { id: 'default', label: 'default', light: 'tokens.light.json', dark: 'tokens.dark.json' },
    ...manifest.map((t) => ({
      id: t.id,
      label: t.name,
      light: `themes/${t.id}/tokens.light.json`,
      dark: `themes/${t.id}/tokens.dark.json`,
    })),
  ]

  const failures = []
  const fail = (message) => failures.push(message)

  // ── The role walk ───────────────────────────────────────────────────────────

  const source = await readSemanticRoles()
  const declaredNonColours = new Set(
    EXEMPTIONS.filter((e) => e.kind === 'not-a-colour').map((e) => e.role),
  )
  const allRoles = new Set(source.map((r) => r.name))
  const colours = source.filter((r) => r.declaredAsColour && !declaredNonColours.has(r.name)).map((r) => r.name)

  // The role walk. A role a row names is covered, in either position, because a
  // row that names a role is that role's coverage. Anything left is either excused
  // with a reason or a failure, and the default for a role nobody has thought
  // about is the failure.
  const { measured, covered, exempt, uncovered } = coverageOf(colours)

  for (const [fg, bg, , , severity] of PAIRS) {
    if (severity !== 'required' && severity !== 'advisory') {
      fail(`row ${fg} on ${bg} has severity "${severity}", which is neither required nor advisory`)
    }
  }

  for (const role of uncovered) {
    fail(
      `${role}: a semantic colour role with no contrast row and no stated reason. Name it in a ` +
        'PAIRS row, or add it to EXEMPTIONS with the reason it is not measured against a ground.',
    )
  }

  // A row naming something that is not a role is either a typo, which costs the
  // intended role its coverage above, or a row for a token that no longer exists,
  // which is a pair measured against nothing. Both are findings by name.
  for (const [fg, bg] of PAIRS) {
    for (const role of [fg, bg]) {
      if (allRoles.has(role)) continue
      fail(
        `row ${fg} on ${bg} names "${role}", which is not a root token in the semantic source, ` +
          'so the row measures a pair that does not exist',
      )
    }
  }

  // Exemption hygiene. A stale exemption is a hole that has stopped being needed
  // and nobody removed, and an unreferenced one is a rule that fires on nothing:
  // both are the shape the focus-indicator gate already refuses.
  for (const entry of EXEMPTIONS) {
    if (!entry.reason || !entry.reason.trim()) {
      fail(`exemption ${entry.role} carries no reason, so it is an allowlist entry with nothing to say`)
    }
    if (!allRoles.has(entry.role)) {
      fail(
        `exemption ${entry.role} names a role that is not in the semantic source, so it excuses ` +
          'nothing and will keep excusing nothing after the role is reintroduced',
      )
    }
    if (entry.kind === 'not-a-colour') {
      const declared = source.find((r) => r.name === entry.role)
      if (declared?.declaredAsColour) {
        fail(`exemption ${entry.role} claims it is not a colour, but the source authors it as one`)
      }
    } else if (measured.has(entry.role)) {
      fail(
        `exemption ${entry.role} is stale: a PAIRS row already measures it, so the exemption ` +
          'reads as a hole that is still open when it is not',
      )
    }
  }

  // ── Mode coverage and the measurements ──────────────────────────────────────

  let advisories = 0
  const rows = []
  /** Tightest pair in each distinct set across the whole run, for the report. */
  const tightest = new Map(DISTINCT_SETS.map((set) => [set.name, null]))
  const distinctChecked = new Map(DISTINCT_SETS.map((set) => [set.name, 0]))
  const modeChecks = sources.length * MODES.length

  for (const sourceEntry of sources) {
    for (const mode of MODES) {
      const tokens = await readJson(path.join(DIST, sourceEntry[mode]))

      // Every colour role, exempt ones included, has to resolve in this mode.
      // This is the mode rule: an exemption is freedom from a GROUND, not from a
      // MODE, so a role cannot be excused in light and unresolved in dark.
      for (const role of colours) {
        const value = tokens[role]?.value
        if (typeof value === 'string' && value.startsWith('#')) continue
        fail(
          `${sourceEntry.label}/${mode}: ${role} does not resolve to an sRGB value ` +
            `(${value === undefined ? 'absent from the emitted token map' : `"${value}"`}). A role ` +
            'is measured in both modes, so a role that resolves in one and not the other is a ' +
            'mismatch, and an exemption does not excuse it.',
        )
      }

      for (const [fg, bg, min, label, severity] of PAIRS) {
        const f = tokens[fg]?.value
        const b = tokens[bg]?.value
        if (!f?.startsWith('#') || !b?.startsWith('#')) {
          // A required pair with a missing or non-hex value is an error, not a
          // silent skip: a forgotten token must fail rather than disappear. An
          // advisory pair may still skip, and the mode rule above is what
          // reports the role itself.
          if (severity === 'required') {
            fail(`${sourceEntry.label}/${mode}  ${label}: ${fg} or ${bg} did not resolve, needs ${min}:1`)
            rows.push({ theme: sourceEntry.label, mode, label, ratio: 0, min, ok: false, fg, bg, severity })
          }
          continue
        }
        const r = ratio(f, b)
        const ok = r >= min
        if (!ok) {
          if (severity === 'required') {
            fail(
              `${sourceEntry.label}/${mode}  ${label}: ${r.toFixed(2)}:1 (needs ${min}:1)  ${fg} on ${bg}`,
            )
          } else {
            advisories++
          }
        }
        rows.push({ theme: sourceEntry.label, mode, label, ratio: r, min, ok, fg, bg, severity })
      }

      // Distinctness, per set, per pack, per mode.
      for (const set of DISTINCT_SETS) {
        const values = set.roles.map((role) => ({ role, value: tokens[role]?.value }))
        if (values.some(({ value }) => typeof value !== 'string' || !value.startsWith('#'))) {
          fail(
            `${sourceEntry.label}/${mode}: the ${set.name} set does not fully resolve, so its ` +
              'distinctness cannot be asserted',
          )
          continue
        }
        distinctChecked.set(set.name, distinctChecked.get(set.name) + 1)
        for (let i = 0; i < values.length; i++) {
          for (let j = i + 1; j < values.length; j++) {
            const a = values[i]
            const b = values[j]
            if (a.value === b.value) {
              fail(
                `${sourceEntry.label}/${mode}: ${set.name} members ${a.role} and ${b.role} both ` +
                  `resolve to ${a.value}, so a reader cannot tell the two series apart`,
              )
              continue
            }
            const distance = channelDistance(a.value, b.value)
            const best = tightest.get(set.name)
            if (best === null || distance < best.distance) {
              tightest.set(set.name, { distance, where: `${sourceEntry.label}/${mode}`, pair: `${a.role} and ${b.role}` })
            }
          }
        }
      }
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────────

  // Only surface failures plus a per-pack summary; a 264-row dump buries the
  // signal.
  for (const failure of failures) console.error(`  FAIL ${failure}`)

  const requiredRows = PAIRS.filter(([, , , , severity]) => severity === 'required')
  const advisoryRows = PAIRS.filter(([, , , , severity]) => severity === 'advisory')

  for (const entry of sources) {
    const mine = rows.filter((r) => r.theme === entry.label)
    const required = mine.filter((r) => r.severity === 'required')
    const passed = required.filter((r) => r.ok).length
    const worst = required.reduce((a, b) => (b.ratio < a.ratio ? b : a))
    console.log(
      `  ${entry.label.padEnd(9)} ${String(passed).padStart(2)}/${required.length} required pass  ` +
        `lowest ${worst.ratio.toFixed(2)}:1 (${worst.mode} ${worst.label})`,
    )
  }

  console.log(
    `\ncontrast: coverage ${colours.length} colour role(s) read from the semantic source: ` +
      `${covered.length} named by a row, ${exempt.length} exempt, ${uncovered.length} uncovered`,
  )
  console.log(
    `contrast: ${PAIRS.length} rows, ${requiredRows.length} required and ${advisoryRows.length} advisory, ` +
      `measured in ${sources.length} pack(s) x ${MODES.length} mode(s): ` +
      `${PAIRS.length * modeChecks} pair(s), ${requiredRows.length * modeChecks} required assertion(s)`,
  )
  console.log(
    `contrast: ${EXEMPTIONS.length} exemption(s) declared across ` +
      `${new Set(EXEMPTIONS.map((e) => `${e.kind}|${e.reason}`)).size} reason(s). ` +
      'Every reason is printed below with the roles that share it, on every run. ' +
      'A new role with no row and no reason fails this run.',
  )
  // Grouped by reason rather than printed once per role, so five series that say
  // the same thing say it once and the log stays readable. The count and every
  // role name are still printed, so a reason cannot hide how much it covers.
  const grouped = new Map()
  for (const entry of EXEMPTIONS) {
    const key = `${entry.kind}|${entry.reason}`
    if (!grouped.has(key)) grouped.set(key, { kind: entry.kind, reason: entry.reason, roles: [] })
    grouped.get(key).roles.push(entry.role)
  }
  for (const group of grouped.values()) {
    const count = group.roles.length
    console.log(
      `  exempt  ${String(count).padStart(2)} ${count === 1 ? 'role ' : 'roles'} (${group.roles.join(', ')})  ${group.kind}`,
    )
    console.log(`            because ${group.reason}`)
  }
  for (const set of DISTINCT_SETS) {
    const best = tightest.get(set.name)
    const checked = distinctChecked.get(set.name)
    const tight = best === null ? 'not measured' : `tightest pair ${best.distance}/255 in a channel (${best.where}, ${best.pair})`
    console.log(
      `  distinct  ${set.name.padEnd(10)} ${checked}/${modeChecks} pack/mode combination(s) distinct; ${tight}`,
    )
    console.log(`            because ${set.reason}`)
  }

  if (advisories) {
    const names = [...new Set(advisoryRows.map(([, , , label]) => label))].join(', ')
    console.log(
      `\n${advisories} advisory pair(s) below target across ${modeChecks} pack/mode combination(s) - ` +
        `${names} are intentionally subtle.`,
    )
  }

  if (failures.length) {
    console.error(`\ncontrast: ${failures.length} failure(s)`)
    process.exit(1)
  }
  console.log(`\ncontrast: all required pairs pass across ${sources.length} packs`)
}

/**
 * Whether this file is the process entry point rather than an import by the test
 * lane. The test lane imports the tables to assert on them, and a gate that ran
 * its own exit on import could not be imported. `pnpm check` runs
 * `node scripts/check-contrast.mjs`, which resolves to the same path; the test
 * suite spawns the script as a child process to prove this arm still fires, so a
 * mismatch here fails a test rather than passing a gate that measures nothing.
 */
const isEntryPoint = (() => {
  const entry = process.argv[1]
  if (!entry) return false
  const normalise = (p) => path.resolve(p).split(path.sep).join('/').toLowerCase()
  return normalise(entry) === normalise(fileURLToPath(import.meta.url))
})()

if (isEntryPoint) await main()
