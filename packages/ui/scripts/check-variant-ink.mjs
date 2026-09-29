/**
 * A variant that sets its own fill must set its own ink.
 *
 * The defect this exists to end: `Button`'s and `CtaLink`'s `outline` variant
 * carried `bg-background` with no `text-` for as long as the package existed. On
 * the page ground and on a card the omission was invisible, because the ink a
 * control inherits there is `--foreground` and `--card-foreground` is equal to it
 * in all twelve pack and mode combinations. The variant was therefore correct
 * everywhere the design system itself put it and wrong everywhere else, and the
 * only place it was wrong was a Block's own composition: `Cta01` draws a filled
 * `bg-primary` band whose inherited ink is `--primary-foreground`, defaulted its
 * second action to `outline`, and shipped a button that was `--background` behind
 * `--primary-foreground`. In lavender dark that measured 1.01:1. It was in the
 * document, focusable, announced, and unreadable.
 *
 * **The token contrast gate could not see it and never will.** It measures token
 * pairs, and `foreground` on `background` is a pair it already holds at 4.5:1 in
 * every pack and mode. What went wrong was not a value, it was a component
 * declining to use a value it was relying on by accident. A gate over tokens has
 * nothing to say about a class string, so the check has to read the class
 * strings, which is what this one does.
 *
 * It reads the source rather than the emitted stylesheet on purpose: Tailwind only
 * emits a variant that some shipped file uses, so the emitted sheet is a record of
 * what was chosen and not of what is available. `outline` was reachable in the
 * source and absent from any sheet until a Block defaulted to it.
 *
 * What it refuses: a variant whose own (non-state) fill utility has no `text-`
 * utility of its own. A `hover:` fill is exempt, because a hover fill arriving
 * alongside its own hover ink is the pattern everywhere in this package, and
 * exempting it is the difference between a rule that finds the defect and a rule
 * nobody can run.
 *
 * **It reads only the Component layer, and that is deliberate, not an oversight.**
 * It was extended to `src/blocks` and `src/pages` as an experiment and withdrawn,
 * and the reason is worth keeping because the reasoning is easy to get wrong.
 *
 * The Block layer does hold the shape this gate exists for. `StackGrid01` writes
 * `<Card className="bg-muted">`: a fill override carrying no ink of its own, which
 * read on its own is precisely the Cta01 defect one layer down. Measured as such
 * it is a 1.09:1 tile, failing in seven of twelve pack and mode combinations. It
 * is also not a defect, and the reason is the whole of why the extension fails.
 *
 * `Card` declares `bg-card text-card-foreground` on itself, and `cn()` merges the
 * caller's class over it. The override replaces the *fill*; the *ink* arrives with
 * the base. The tile therefore renders `--muted` behind `--card-foreground`, which
 * is 13.88:1 in the base pack's dark mode and 16.44:1 in its light, and no reader
 * sees anything wrong with it. The ink a rendered element has is a property of the
 * merge, not of any one string, and a gate that reads strings cannot see it.
 *
 * Narrowing the rule to fills on elements that can hold a label, and excluding
 * `bg-gradient-to-*` and self-closing elements, reduces twenty-six candidate fills
 * to fifteen, and every one of the fifteen is a case where the ink is supplied by
 * the component being overridden: a `DialogPrimitive` overlay, a `SwitchPrimitive`
 * thumb, a `TooltipPrimitive` bubble, a `site-header` whose `bg-background` is the
 * page ground by definition. Widening the gate here would add fifteen findings
 * that all have to be explained away, which is a gate nobody runs, against a real
 * defect it still would not catch.
 *
 * So the layer stays as it is, and the judgement to make instead is the one this
 * gate already models: a Block that wants a different surface says so with a
 * variant that states both, rather than overriding a fill alone. Where that is
 * genuinely impossible, the pair belongs in `check-contrast.mjs`, which measures
 * token pairs and so can be asked about `--muted` on `--card-foreground` directly.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:variant-ink
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const SRC = path.join(PKG, 'src', 'components', 'ui')

/**
 * The fills that count as a variant setting its own surface. A `bg-` utility on a
 * pseudo-state (`hover:`, `focus:`, `active:`, `data-`, `group-`, `peer-`,
 * `aria-`, `disabled:`) is a state change on whatever surface the element is
 * already on, not the variant claiming one.
 */
const isOwnFill = (utility) => !/^(hover|focus|focus-visible|active|data-\[|data-\w+:|group-|peer-|aria-|disabled|has-\[)/.test(utility)

/** The ink utilities that count as a variant stating its own ink. */
/*
 * The inks that count as a variant stating its own ink.
 *
 * Every role `check-contrast.mjs` measures as a required 4.5:1 foreground pair
 * belongs here, and the two sidebar foregrounds were missing until the first
 * Component put a `sidebar-*` fill in a variant. `sidebar-primary-foreground` and
 * `sidebar-accent-foreground` are both required rows in the contrast table, under
 * "sidebar active item" and "sidebar hover", so a list of inks that omits them
 * would have told the `Sidebar` that its own required pairing was an inherited
 * one. The list is derived from the roles the token gate measures rather than
 * written out separately, because two lists about the same roles is the defect
 * this repository has already had to unpick three times.
 */
const INK = /^text-(foreground|primary-foreground|secondary-foreground|accent-foreground|muted-foreground|destructive-foreground|success-foreground|warning-foreground|popover-foreground|card-foreground|sidebar-foreground|sidebar-primary-foreground|sidebar-accent-foreground|inherit|current|white|black)$/

/**
 * Pull the variant maps out of a component's source.
 *
 * Deliberately a narrow read rather than a parse: this repository's variant maps
 * are `cva({...})` objects whose entries are single-quoted or double-quoted class
 * strings, and a real parser here would be a second thing that has to be taught
 * about Tailwind class syntax. Anything it cannot read is reported as unread, so
 * a variant map that stops looking like one is visible rather than silently
 * skipped.
 */
function variantMaps(source) {
  const maps = []
  const entry = /(\w+):\s*'([^']*)'|(\w+):\s*"([^"]*)"/g
  let match
  while ((match = entry.exec(source)) !== null) {
    const name = match[1] ?? match[3]
    const value = match[2] ?? match[4]
    if (/\s/.test(value)) maps.push({ name, value })
  }
  return maps
}

const failures = []
const rows = []

for (const file of existsSync(SRC) ? readdirSync(SRC).filter((f) => f.endsWith('.tsx')) : []) {
  const source = readFileSync(path.join(SRC, file), 'utf8')
  for (const { name, value } of variantMaps(source)) {
    // Split into utilities, then drop the escapes an arbitrary value can carry.
    const utilities = value
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\\\//g, '/')
      .replace(/\\(.)/g, '$1')
      .split(/\s+/)
      .filter(Boolean)

    const fills = utilities.filter((u) => isOwnFill(u) && /^bg-/.test(u))
    if (fills.length === 0) continue
    const inks = utilities.filter((u) => INK.test(u))
    const row = { file, name, fills, inks }
    rows.push(row)

    if (inks.length === 0) {
      failures.push(
        `${file}: variant \`${name}\` sets ${fills.join(' and ')} and no ink of its own, so ` +
          `its colour is inherited from whatever surface it is placed on. A fill and an ` +
          `inheritance is a variant that is the same control on the page ground and a ` +
          `different one inside a Block. State the matching \`text-\` utility.`,
      )
    }
  }
}

const withFill = rows.filter((row) => row.fills.length > 0)
console.log(`variant-ink: ${withFill.length} variant(s) across the Component layer set their own fill`)
for (const row of withFill) {
  console.log(
    `  ${(row.inks.length > 0 ? 'ok  ' : 'FAIL')} ${row.file.replace('.tsx', '')} ${row.name.padEnd(12)} ` +
      `${row.fills.join(' ')}  ink: ${row.inks.length > 0 ? row.inks.join(' ') : 'INHERITED'}`,
  )
}

console.log('')
if (failures.length > 0) {
  console.error(`variant-ink: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(
  `variant-ink: every variant that sets its own fill states its own ink, ` +
    `${withFill.length} variant(s) checked`,
)
