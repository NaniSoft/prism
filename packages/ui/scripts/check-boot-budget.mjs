/**
 * The pre-paint boot script's own byte ceiling (ticket 90).
 *
 * The blocking inline string `PrismThemeScript` renders runs before paint on
 * every page of every site. It is not a component, so adding it to the
 * per-component client budget in `check-client-budget.mjs` would corrupt the
 * unit that table exists to measure: those figures are gzipped module bundles,
 * and this is raw inline bytes that a bundler never sees, a minifier never
 * rewrites and a reader downloads on every load. So it is priced here, in raw
 * bytes, against a ceiling derived by addition rather than asserted as a number.
 *
 * THE ARITHMETIC
 *
 *   measured emission        the string as emitted, raw UTF-8 bytes
 *   migration clause         the two exported fragments, measured from the
 *                            module rather than estimated
 *   non-migration part       measured emission - clause, so the rule rewrite
 *                            and the origin attribute are visible as their own
 *                            number instead of hiding inside the total
 *   one migration generation the clause, because that is what a migration
 *                            generation costs, and it is the only headroom
 *                            this string is allowed
 *
 *   ceiling = pinned base + clause + one migration generation
 *           = non-migration part + clause + clause
 *           = measured emission + one migration generation
 *           = 820 + 229 + 229 = 1278 B
 *
 * The last line of that is an identity only while the pin is current, so the
 * run prints the drift between the live non-migration part and the pin rather
 * than asserting they agree. A run with drift is still correct; a run whose
 * drift is positive is over the ceiling, which is the failure below.
 *
 * WHY THE BASE IS PINNED
 *
 * `measured emission + one generation` can be recomputed from the live emission
 * on every run, and a ceiling derived entirely from what it is about to measure
 * can never fail. That is a gate that reports success because it ran, which is
 * the failure mode this programme is against. So the base term is a recorded
 * measurement of the non-migration part rather than a live one, and the clause
 * term stays live so a future migration is covered without a number changing.
 *
 * The consequence is deliberate: the whole allowance is one migration
 * generation's worth of bytes and it is not reserved for migrations. The string
 * may grow by 229 B, and the gate cannot tell whether the growth was a
 * migration or an origin attribute somebody found useful. Past that the build
 * fails until the base is re-pinned, and re-pinning is a visible decision
 * rather than a threshold somebody raises to make a run green: it is
 * `measured emission - migration clause`, and this script prints both.
 *
 * The clause is priced by subtraction, and the subtraction is only trusted when
 * it can be constructed: each fragment has to appear in the emission exactly
 * once. A fragment that has drifted out of the string, or been copied into it
 * twice, is a failure here rather than a quietly wrong number.
 *
 * The clause's price is the migration's whole cost to every page, so it is
 * visible here rather than inside a bundle figure. Retiring the migration by
 * deleting the last entry of `LEGACY_MODE_STORAGE_KEYS` takes the clause to zero
 * bytes, and the ceiling's second term with it.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:boot-budget
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const NAME = 'boot-budget'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const WORK = path.join(PKG, '.turbo', 'boot-budget')

const SCRIPT_MODULE = path.join(PKG, 'dist', 'provider', 'theme-script.js')

/**
 * The non-migration part of the emission, in bytes, as of ticket 90.
 *
 * A measurement, not a judgement, and the run below prints the live figure so a
 * drift shows up next to it rather than as a surprise failure. Re-take it as
 * `measured emission - migration clause` when the non-migration part genuinely
 * has to change, and say why in this comment.
 */
const NON_MIGRATION_BASE_BYTES = 820

/** How many migration generations beyond the one present may be paid for. */
const MIGRATION_GENERATIONS_ALLOWED = 1

if (!existsSync(SCRIPT_MODULE)) {
  console.error(
    `\n${NAME}: dist/provider/theme-script.js is missing; ` +
      'run `pnpm --filter @nanisoft/prism-ui build` before this gate.',
  )
  process.exit(1)
}

/**
 * The emitted file imports `../theming` as a directory, which Node's ESM
 * resolver rejects and a bundler resolves, so it is bundled rather than patched.
 */
async function loadEmitted() {
  mkdirSync(WORK, { recursive: true })
  const outfile = path.join(WORK, 'theme-script.mjs')
  await build({
    entryPoints: [SCRIPT_MODULE],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    outfile,
    absWorkingDir: PKG,
    external: ['react', 'react/*'],
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  })
  return import(pathToFileURL(outfile).href)
}

const module = await loadEmitted()
const { PrismThemeScript, THEME_MIGRATION_READ, THEME_MIGRATION_RETIRE } = module

const bytes = (text) => Buffer.byteLength(text, 'utf8')

const emitted = PrismThemeScript({}).props.dangerouslySetInnerHTML.__html
const measured = bytes(emitted)

const failures = []

const fragments = [
  ['THEME_MIGRATION_READ', THEME_MIGRATION_READ],
  ['THEME_MIGRATION_RETIRE', THEME_MIGRATION_RETIRE],
]

/* A fragment the string does not contain exactly once cannot be subtracted. */
let withoutClause = emitted
for (const [label, fragment] of fragments) {
  if (typeof fragment !== 'string' || fragment.length === 0) {
    failures.push(`${label} is not a non-empty string, so the clause has no price to charge`)
    continue
  }
  const occurrences = emitted.split(fragment).length - 1
  if (occurrences !== 1) {
    failures.push(
      `${label} appears ${occurrences} time(s) in the emitted script, not once, ` +
        'so the clause cannot be priced by subtraction and the ceiling below is not the derivation it claims to be',
    )
    continue
  }
  withoutClause = withoutClause.replace(fragment, '')
}

const clause = fragments.reduce((total, [, fragment]) => total + bytes(fragment ?? ''), 0)
const nonMigration = bytes(withoutClause)
const generations = 1 + MIGRATION_GENERATIONS_ALLOWED
const ceiling = NON_MIGRATION_BASE_BYTES + clause * generations

if (measured > ceiling) {
  failures.push(
    `the emitted script is ${measured} B, over the ${ceiling} B ceiling by ${measured - ceiling} B. ` +
      `Its non-migration part is ${nonMigration} B against a ${NON_MIGRATION_BASE_BYTES} B base, ` +
      `and the ${clause} B migration clause is allowed ${generations} generation(s).`,
  )
}

rmSync(WORK, { recursive: true, force: true })

const pad = (label) => `${label}:`.padEnd(32)
const signed = (value) => (value > 0 ? `+${value}` : `${value}`)

console.log(`\n${NAME}: the pre-paint string, raw UTF-8 bytes, default props`)
console.log(`  ${pad('measured emission')} ${measured} B`)
console.log(`  ${pad('migration clause')} ${clause} B  (read + retire, measured from the two exported fragments)`)
console.log(`  ${pad('non-migration part')} ${nonMigration} B  (measured emission - clause)`)
console.log(`  ${pad('pinned base')} ${NON_MIGRATION_BASE_BYTES} B  (ticket 90; re-take as measured emission - clause)`)
console.log(`  ${pad('non-migration drift')} ${signed(nonMigration - NON_MIGRATION_BASE_BYTES)} B against the pinned base`)
console.log(`  ${pad('one migration generation')} ${clause} B  (${generations} generation(s) priced at the current clause)`)
console.log(`  ${pad('ceiling')} ${ceiling} B  (pinned base + ${generations} x clause)`)
console.log(`  ${pad('headroom')} ${ceiling - measured} B`)

if (failures.length) {
  console.error(`\n${NAME}: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`\n${NAME}: ${measured} B is within the ${ceiling} B ceiling`)
