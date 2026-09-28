/**
 * The theme-resolution equivalence gate (ticket 90).
 *
 * `PrismProvider` and the pre-paint boot script are two readers of one stored
 * value, and the string cannot import the rule the provider uses. Inlining a
 * serialised function is not a way to share it: the build minifies, a renamed
 * identifier inside the script's own `try` would throw there, the catch would
 * swallow it, and the theme would silently stop applying on every page. So the
 * shape here is one implementation plus a gate that can fail, and this file is
 * the gate.
 *
 * It runs the EMITTED string, not a reconstruction of it, and the SHARED rule
 * from `dist/theming`, over ONE table, and fails when the two disagree on the
 * pack, on the mode, on the origin, or on what each of them did to storage.
 *
 * The table is the falsifier. The divergence this gate exists for was real: the
 * old script validated the pack and the mode independently, so a stored
 * `{ mode: 'dark' }` with no pack half-applied there while `parseStoredTheme`
 * rejected it whole. Every row below that carries a stored value `whole` points
 * at the row that must resolve to the same pair with nothing stored, which is
 * how "falls through whole rather than half" is asserted rather than asserted
 * about. A reader that repaired a field by field fails that row.
 *
 * It also runs the emitted script, so a script that throws inside its own catch
 * and applies nothing cannot pass: every row must leave `data-theme-origin` set
 * to a member of the closed set.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:theme-resolution
 */
import vm from 'node:vm'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const NAME = 'theme-resolution'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const WORK = path.join(PKG, '.turbo', 'theme-resolution')

const THEMING = path.join(PKG, 'dist', 'theming', 'index.js')
const SCRIPT_MODULE = path.join(PKG, 'dist', 'provider', 'theme-script.js')

if (!existsSync(THEMING) || !existsSync(SCRIPT_MODULE)) {
  console.error(
    `\n${NAME}: dist is missing ${path.basename(THEMING)} or ${path.basename(SCRIPT_MODULE)}; ` +
      'run `pnpm --filter @nanisoft/prism-ui build` before this gate.',
  )
  process.exit(1)
}

/**
 * `dist/provider/theme-script.js` imports `../theming` as a directory, which
 * Node's ESM resolver rejects and a bundler resolves, so the module is bundled
 * before it is imported rather than patched.
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
  const script = await import(pathToFileURL(outfile).href)
  const theming = await import(pathToFileURL(THEMING).href)
  return { script, theming }
}

const { script: scriptModule, theming } = await loadEmitted()
const { resolveTheme, THEME_ORIGINS, THEME_ORIGIN_ATTRIBUTE, PACK_ATTRIBUTE, DEFAULT_STORAGE_KEY, LEGACY_MODE_STORAGE_KEYS } = theming

const STORAGE_KEY = DEFAULT_STORAGE_KEY
const LEGACY_KEY = LEGACY_MODE_STORAGE_KEYS[0]

/**
 * The element a Server Component returns is read for its `__html` prop rather
 * than rendered: the string is the artefact under test, and rendering it would
 * only prove that React copies a prop.
 *
 * One emission per distinct pair of consumer defaults, because the defaults are
 * interpolated into the string and a row that names a non-default default has to
 * be answered by the emission that carries it. Answering it with the
 * default-props string would be a disagreement the gate manufactured rather
 * than found.
 */
const emissions = new Map()
function emissionFor(defaultPack, defaultMode) {
  const key = `${defaultPack}/${defaultMode}`
  if (!emissions.has(key)) {
    emissions.set(
      key,
      scriptModule.PrismThemeScript({ defaultPack, defaultMode }).props.dangerouslySetInnerHTML.__html,
    )
  }
  return emissions.get(key)
}

/**
 * One row of the table. `stored`, `legacy` and `documentPack` are raw exactly
 * as the store and the markup hold them, because a corrupt value has to be
 * visible to both readers rather than normalised by a caller.
 *
 * `whole` names the row this one must resolve identically to with nothing
 * stored. It is the whole-vs-half assertion, and it is checked on the resolved
 * pair only: the origin is expected to differ, and to say so.
 */
const ROWS = [
  { name: 'nothing stored' },

  { name: 'a valid pair', stored: '{"pack":"mint","mode":"dark"}' },
  { name: 'a valid pair beside a retired key', stored: '{"pack":"mint","mode":"dark"}', legacy: 'light' },
  { name: 'a valid pair of the base pack', stored: '{"pack":"default","mode":"light"}' },

  { name: 'a valid mode with a retired pack', stored: '{"pack":"rose","mode":"dark"}', whole: 'nothing stored' },
  { name: 'a valid pack with a retired mode', stored: '{"pack":"mint","mode":"beam-dark"}', whole: 'nothing stored' },
  { name: 'a mode with no pack', stored: '{"mode":"dark"}', whole: 'nothing stored' },
  { name: 'a pack with no mode', stored: '{"pack":"mint"}', whole: 'nothing stored' },
  { name: 'garbage', stored: 'not json {{{', whole: 'nothing stored' },
  { name: 'a JSON array', stored: '["mint","dark"]', whole: 'nothing stored' },
  { name: 'a JSON string, the old site value', stored: '"blue-dark"', whole: 'nothing stored' },
  { name: 'the literal null', stored: 'null', whole: 'nothing stored' },
  { name: 'an empty object', stored: '{}', whole: 'nothing stored' },
  { name: 'an empty string', stored: '', whole: 'nothing stored' },

  { name: 'a server-rendered pack, nothing stored', documentPack: 'sky' },
  { name: 'a server-rendered dark class, nothing stored', documentDark: true },
  { name: 'a server-rendered pack and dark class', documentPack: 'sky', documentDark: true },
  { name: 'unparseable beside a server-rendered pack', stored: '{}', documentPack: 'sky', whole: 'a server-rendered pack, nothing stored' },
  { name: 'unparseable beside a server-rendered dark class', stored: '[]', documentDark: true, whole: 'a server-rendered dark class, nothing stored' },

  { name: 'a usable mode on a retired key', legacy: 'dark' },
  { name: 'a retired key beside a retired value', stored: '{"pack":"rose","mode":"dark"}', legacy: 'dark', whole: 'nothing stored' },
  { name: 'a retired key beside garbage', stored: 'not json', legacy: 'dark', whole: 'nothing stored' },
  { name: 'a retired key holding an unusable value', legacy: 'beam-dark', whole: 'nothing stored' },
  { name: 'a retired key beside a server-rendered pack', legacy: 'light', documentPack: 'sky' },

  { name: 'a non-default consumer default, nothing stored', defaultPack: 'peach', defaultMode: 'dark' },
  { name: 'a non-default default with a retired key', defaultPack: 'peach', legacy: 'light' },
  { name: 'a non-default default, unparseable', defaultPack: 'peach', defaultMode: 'dark', stored: '{}', whole: 'a non-default consumer default, nothing stored' },
]

/** A root element and a localStorage, small enough to audit line by line. */
function browser(emitted, stored, legacy, documentPack, documentDark) {
  const initial = new Map()
  if (stored !== null) initial.set(STORAGE_KEY, stored)
  if (legacy !== null) initial.set(LEGACY_KEY, legacy)

  const storage = new Map(initial)
  const attributes = new Map()
  if (documentPack !== null) attributes.set(PACK_ATTRIBUTE, documentPack)
  const classes = new Set()
  if (documentDark) classes.add('dark')

  const root = {
    getAttribute: (name) => (attributes.has(name) ? attributes.get(name) : null),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    removeAttribute: (name) => attributes.delete(name),
    classList: {
      contains: (name) => classes.has(name),
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)),
    },
  }

  const localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  }

  return {
    attributes,
    classes,
    storage,
    initial,
    run: () => {
      vm.runInContext(emitted, vm.createContext({ document: { documentElement: root }, localStorage }))
      return {
        pack: attributes.get(PACK_ATTRIBUTE) ?? 'default',
        mode: classes.has('dark') ? 'dark' : 'light',
        origin: attributes.get(THEME_ORIGIN_ATTRIBUTE) ?? null,
        storage: Object.fromEntries(storage),
        untouched: storage.size === initial.size && [...storage].every(([k, v]) => initial.get(k) === v),
      }
    },
  }
}

const failures = []
const answers = new Map()
const inputs = new Map()

for (const row of ROWS) {
  const input = {
    stored: row.stored ?? null,
    legacy: row.legacy ?? null,
    documentPack: row.documentPack ?? null,
    documentDark: row.documentDark ?? false,
    defaultPack: row.defaultPack ?? 'default',
    defaultMode: row.defaultMode ?? 'light',
  }

  const expected = resolveTheme(input)
  const emitted = emissionFor(input.defaultPack, input.defaultMode)
  const actual = browser(emitted, input.stored, input.legacy, input.documentPack, input.documentDark).run()
  answers.set(row.name, { expected, actual })
  inputs.set(row.name, input)

  if (actual.pack !== expected.pack) {
    failures.push(`${row.name}: the script applied pack "${actual.pack}", the rule resolved "${expected.pack}"`)
  }
  if (actual.mode !== expected.mode) {
    failures.push(`${row.name}: the script applied mode "${actual.mode}", the rule resolved "${expected.mode}"`)
  }
  if (actual.origin !== expected.origin) {
    failures.push(
      `${row.name}: the script recorded ${THEME_ORIGIN_ATTRIBUTE}="${actual.origin}", ` +
        `the rule resolved origin "${expected.origin}"`,
    )
  }
  if (actual.origin === null) {
    failures.push(`${row.name}: the script left ${THEME_ORIGIN_ATTRIBUTE} unset, so an absent origin is indistinguishable from an unread one`)
  } else if (!THEME_ORIGINS.includes(actual.origin)) {
    failures.push(`${row.name}: the script wrote "${actual.origin}", which is outside the closed set ${THEME_ORIGINS.join(', ')}`)
  }

  // The write is gated on a decision, and only on one the rule names.
  const recovered = expected.origin === 'legacy'
  if (recovered) {
    const written = actual.storage[STORAGE_KEY]
    if (written === undefined) {
      failures.push(`${row.name}: the rule recovered a decision from ${LEGACY_KEY} but the script wrote nothing to ${STORAGE_KEY}`)
    } else {
      let parsed
      try {
        parsed = JSON.parse(written)
      } catch {
        failures.push(`${row.name}: the script wrote unparseable JSON to ${STORAGE_KEY}: ${written}`)
      }
      if (parsed && (parsed.pack !== expected.pack || parsed.mode !== expected.mode)) {
        failures.push(`${row.name}: the script recovered ${JSON.stringify(parsed)} where the rule resolved ${expected.pack}:${expected.mode}`)
      }
    }
    if (LEGACY_KEY in actual.storage) {
      failures.push(`${row.name}: the script recovered a decision and left ${LEGACY_KEY} in place, so the clause never expires`)
    }
  } else if (!actual.untouched) {
    failures.push(
      `${row.name}: no decision was made, yet the script wrote to storage (${JSON.stringify(actual.storage)}); ` +
        'a visitor who never chose must end the load with an empty store',
    )
  }
}

for (const row of ROWS) {
  if (!row.whole) continue
  const whole = answers.get(row.whole)
  if (!whole) {
    failures.push(`${row.name}: names "${row.whole}" as its whole fall-through and no such row exists`)
    continue
  }

  /*
   * A `whole` row is the same SITE with a different STORE, so the site has to
   * match. `legacy` is allowed to differ, because a retired key is itself a
   * stored value and the rows that exercise one are precisely the rows where it
   * must be ignored. The consumer defaults and the rendered document are not
   * stored values, and two rows differing in them are two different questions
   * whose answers cannot be compared.
   */
  const here = inputs.get(row.whole)
  const there = inputs.get(row.name)
  for (const field of ['documentPack', 'documentDark', 'defaultPack', 'defaultMode']) {
    if (here[field] !== there[field]) {
      failures.push(
        `${row.name}: its whole fall-through "${row.whole}" also differs in ${field} ` +
          `(${JSON.stringify(there[field])} against ${JSON.stringify(here[field])}), ` +
          'so the pair comparison below is between two different sites',
      )
    }
  }

  if (whole.actual.pack !== answers.get(row.name).actual.pack || whole.actual.mode !== answers.get(row.name).actual.mode) {
    failures.push(
      `${row.name}: half-applied. It resolved ${answers.get(row.name).actual.pack}:${answers.get(row.name).actual.mode} ` +
        `where nothing stored resolves ${whole.actual.pack}:${whole.actual.mode}, ` +
        'so one axis came from the stored value and one did not',
    )
  }
}

/* Coverage the table has to have, or the run above proved nothing. */
const coveredOrigins = new Set(ROWS.map((row) => answers.get(row.name)?.actual.origin))
const missingOrigins = THEME_ORIGINS.filter((origin) => !coveredOrigins.has(origin))
if (missingOrigins.length) {
  failures.push(`the table never reached origin(s) ${missingOrigins.join(', ')}, so a branch of the rule ran zero times`)
}
for (const name of ['garbage', 'a JSON array', 'a JSON string, the old site value', 'an empty object', 'a mode with no pack', 'a valid pack with a retired mode', 'a usable mode on a retired key']) {
  if (!ROWS.some((row) => row.name === name)) failures.push(`the table lost its "${name}" row`)
}

/* The shared vocabulary and the string are checked to still agree. */
for (const [props, emitted] of emissions) {
  if (!emitted.includes(THEME_ORIGIN_ATTRIBUTE)) {
    failures.push(`the emission for ${props} does not carry ${THEME_ORIGIN_ATTRIBUTE}`)
  }
  if (!emitted.includes(PACK_ATTRIBUTE)) {
    failures.push(`the emission for ${props} does not carry ${PACK_ATTRIBUTE}`)
  }
  for (const key of LEGACY_MODE_STORAGE_KEYS) {
    if (!emitted.includes(JSON.stringify(key))) {
      failures.push(
        `${key} is in LEGACY_MODE_STORAGE_KEYS but the emission for ${props} never reads it, ` +
          'so the shared rule and the string have drifted apart',
      )
    }
  }
  for (const origin of THEME_ORIGINS) {
    if (!emitted.includes(`"${origin}"`)) {
      failures.push(`origin "${origin}" is in the closed set but the emission for ${props} never writes it`)
    }
  }
}

rmSync(WORK, { recursive: true, force: true })

const pad = (value, width) => String(value).padEnd(width)
const cell = (pair, origin) => `${pad(`${pair.pack}:${pair.mode}`, 16)}${pad(origin, 10)}`

console.log(`\n${NAME}: one table, two readers, ${ROWS.length} row(s) over ${emissions.size} emission(s)`)
console.log(`  ${pad('row', 52)}${pad('script', 26)}${pad('rule', 26)}storage`)
for (const row of ROWS) {
  const { expected, actual } = answers.get(row.name)
  const storage = actual.untouched
    ? 'unchanged'
    : `recovered into ${STORAGE_KEY}, ${LEGACY_KEY} retired`
  const agreed = actual.pack === expected.pack && actual.mode === expected.mode && actual.origin === expected.origin
  console.log(
    `  ${agreed ? '.' : '!'} ${pad(row.name, 50)}${cell(actual, actual.origin)}${cell(expected, expected.origin)}${storage}`,
  )
}

console.log(`\n  origins reached: ${[...coveredOrigins].sort().join(', ')}`)
console.log(`  migration clauses still live: ${LEGACY_MODE_STORAGE_KEYS.length} key(s) the script reads and prices`)

if (failures.length) {
  console.error(`\n${NAME}: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`\n${NAME}: the emitted script and resolveTheme agree on all ${ROWS.length} row(s), and every fall-through is whole`)
