/**
 * The source tree, the catalogue and the registry, compared as three sets in
 * both directions.
 *
 * The hole this closes. A module on disk with no catalogue entry leaves every
 * count correct. It ships, `shadcn add` installs it, the registry lists it, and
 * it is absent from the corpus, the site and every agent-facing tool, with a
 * fully green gate run. The two lists people trust were on the wrong side of
 * that hole, and the checks that believed they covered it compared lengths or
 * compared a file against something derived from itself:
 *
 *   - `validate-registry.mjs` holds registry.json against the disk and the
 *     manifest, in isolation. It never reads the catalogue.
 *   - `sync-registry.mjs` reads the disk, so it cannot disagree with the disk
 *     about what is on it. It is a generator, not a check.
 *   - `apps/site/test/catalogue-order.test.ts` holds the catalogue against the
 *     generated ordering and the documentation tree, and both are built FROM the
 *     catalogue, so a disagreement there is impossible by construction.
 *
 * A length assertion cannot report which item is wrong, so nothing here reports
 * a length on its own: every finding names the item, and the three set sizes are
 * printed as supplementary coverage underneath.
 *
 * The registry generator deliberately keeps reading the disk. Deriving the
 * registry from the catalogue would be the obvious way to remove the second
 * list, and it would delete the disagreement this gate exists to see: the
 * generator would agree with the catalogue by construction and the three-way
 * comparison would have nothing left to compare.
 *
 * Prose counts of catalogue items are not asserted here. A gate on prose punishes
 * editing a comment, and the response to that is to delete the gate. The
 * specification's historical numbers are dated in the prose by hand, where a
 * reader can see that a number is a number and not a claim.
 *
 * The version and the roster are two claims, printed as two lines under two
 * labels, so a roster error and a version bump cannot produce the same output.
 *
 * Run: node packages/ui/scripts/check-catalogue.mjs
 *
 * ## The canonical key
 *
 * The three sets use three naming conventions for the same item, so a set
 * comparison needs one key. The canonical key is the kebab-case **slug**, and
 * the three conventions are reconciled to it by rules that are mechanical over
 * the whole roster:
 *
 *   A  disk       `src/components/ui/radio-group.tsx` -> `radio-group`
 *                 `src/blocks/hero-01/`                -> `hero-01`
 *                 `src/pages/auth-page/`               -> `auth-page`
 *   B  catalogue  `slug: 'radio-group'`               -> `radio-group`
 *   C  registry   `name: 'radio-group'`               -> `radio-group`
 *
 * The registry names a Component by its file stem, so set C needs no conversion
 * at all for a Component, and a Block or a Page by the `name` in its
 * `block.json`, which is a SECOND name the disk carries for the same directory.
 * That second name is compared on its own, so a Block whose directory and whose
 * `block.json` disagree is one finding rather than a set difference reported
 * three times.
 *
 * The catalogue's `name` is a display name and is never used as a key. The rule
 * that maps it to the slug is asserted rather than assumed, so a `name` and a
 * `slug` that stop being the same item is a finding naming the entry. The one
 * place that rule is load-bearing is the numbered Blocks: a hyphen goes between
 * a letter and a following digit, so `Hero01` is `hero-01` and not `hero01`.
 * A future item that cannot follow the rule is a decision about the naming
 * convention to take in the open, not a special case to add to this file.
 *
 * ## Why `scripts/lib/walk.mjs` is reimplemented rather than imported
 *
 * The three habits are the ones that module documents and they are stated below
 * in full, because a reader of this file should not have to open another one to
 * learn whether a root that resolved to nothing failed the run. The import is
 * not taken for the reason `packages/tokens/scripts/check-determinism.mjs` gives:
 * a published package should not import a file from outside its own `files`, and
 * `scripts/` is not in `packages/ui`'s `files` either. The module would ship in
 * a tarball that cannot resolve it, and the failure would surface to a consumer
 * rather than to this gate.
 *
 * Roots resolve from `import.meta.url` and never from `process.cwd()`, so the
 * working directory cannot change what this gate reads. A root that resolves to
 * nothing is a failure naming both causes, not an empty result, and a run that
 * resolved every root and read no file is a failure too: "0 findings over 0
 * files" is the exact claim this gate replaces.
 *
 * Symbolic links are not followed. A linked directory is reported as a file, so
 * a link cycle cannot make the walk run forever. No root here contains one.
 *
 * ## The root override, and why it is not a test flag
 *
 * `PRISM_CATALOGUE_ROOT` points the whole run at another package root, so the
 * gate is a function of a tree rather than of this checkout, and a test can run
 * the real CLI over a fixture and read the real output. It changes which
 * directory is read and nothing else: no comparison is relaxed, no check is
 * skipped, no code path differs, and a run with it set prints the root it read
 * so a run aimed somewhere unexpected says so in its own output.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-catalogue'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = '@nanisoft/prism-ui'
const OVERRIDE = 'PRISM_CATALOGUE_ROOT'

/** Every root this gate reads, relative to a package root. */
const ROOTS = [
  'src/components/ui',
  'src/blocks',
  'src/pages',
  'src/catalog.ts',
  'registry.json',
  'package.json',
]

/** A registry item type is the kind with a prefix. Only these three are items. */
const REGISTRY_KINDS = {
  'registry:component': 'component',
  'registry:block': 'block',
  'registry:page': 'page',
}

/** A Component is one `.tsx` file, and its own test file is not a Component. */
const COMPONENT_FILE = /\.tsx$/
const TEST_FILE = /\.test\.tsx$/

/* ------------------------------------------------------------------ *
 * Root resolution
 * ------------------------------------------------------------------ */

/** A configured root against the base directory the caller passes in. */
function resolveRoot(base, relative) {
  return path.resolve(base, relative)
}

/**
 * Every file under `root`, absolute, in readdir order. A root that does not
 * exist is reported, never absorbed into an empty result.
 */
function walkRoot(root) {
  let entry
  try {
    entry = statSync(root)
  } catch (cause) {
    return { root, files: [], exists: false, error: cause.code ?? cause.message }
  }

  if (entry.isFile()) return { root, files: [root], exists: true }

  const files = []
  for (const child of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, child.name)
    if (!child.isDirectory()) {
      files.push(full)
      continue
    }
    const nested = walkRoot(full)
    if (!nested.exists) return nested
    files.push(...nested.files)
  }
  return { root, files, exists: true }
}

/**
 * Fail when any configured root resolved to nothing.
 *
 * The message names both causes on purpose. A reader who cannot tell which one
 * happened is the reader this gate was written for, and the difference between
 * them is the difference between re-running the gate and fixing the tree. This
 * gate resolves its roots from its own location, so it can only be in this state
 * when the script being run is not this repository's copy, which is why the hint
 * names that as well as the working directory.
 */
function assertRootsResolve(results) {
  const missing = results.filter((result) => !result.exists)
  if (missing.length === 0) return

  const listed = missing.map((result) => `"${result.relative}"`).join(', ')
  const plural = missing.length === 1 ? 'root does not resolve' : 'roots do not resolve'
  throw new Error(
    `${NAME}: ${missing.length} of ${results.length} configured ${plural}: ${listed}\n` +
      '  Two causes, and this run cannot tell them apart:\n' +
      '  (1) the gate was pointed at the wrong package root, or the script being run is not this\n' +
      `      repository's copy - run it as \`node packages/ui/scripts/${NAME}.mjs\`, leave\n` +
      `      ${OVERRIDE} unset, or set it to the package root you meant;\n` +
      '  (2) the root does not exist in the repository at all, so the configuration names a\n' +
      '      path that was renamed, moved or never committed.\n' +
      '  A gate that read nothing and reported zero findings is the failure this replaces,\n' +
      '  so an unresolved root fails the run rather than emptying it.',
  )
}

/**
 * Fail when every root resolved and the run still read no file.
 *
 * An empty root is legitimate on its own. A run that read nothing is not, and
 * "0 findings over 0 files" is the claim this gate replaces, so the assertion is
 * over the total rather than per root.
 */
function assertFilesRead(count) {
  if (count > 0) return
  throw new Error(
    `${NAME}: every root resolved and the run read 0 files.\n` +
      '  This is not a missing-directory problem: the roots are there and they are empty, or the\n' +
      '  read was short-circuited before it began.\n' +
      '  Reporting zero findings over zero files is the failure this replaces, so an empty read\n' +
      '  fails the run.',
  )
}

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

/** Forward-slashed and relative to the package root, so a finding reads the same everywhere. */
const relativePosix = (base, file) => path.relative(base, file).split(path.sep).join('/')

/** Windows editors write a UTF-8 BOM and `JSON.parse` rejects it outright. */
const stripBom = (text) => text.replace(/^﻿/, '')

/**
 * Files this run actually opened, which is not the number of files the walk
 * passed over. A run that walked 99 files to compare 17 of them has not read
 * 99, and a coverage line that claims otherwise is the kind of overstatement
 * this gate exists to remove.
 */
let filesRead = 0

function readText(file, display) {
  try {
    filesRead += 1
    return stripBom(readFileSync(file, 'utf8'))
  } catch (cause) {
    throw new Error(
      `${display}: could not be read (${cause.code ?? cause.message}). It is a configured root, so\n` +
        '  a root that exists and cannot be read is a different failure from a root that is gone.',
    )
  }
}

function readJson(file, display) {
  const text = readText(file, display)
  try {
    return JSON.parse(text)
  } catch (cause) {
    throw new Error(`${display}: is not valid JSON, so it cannot be compared (${cause.message})`)
  }
}

/* ------------------------------------------------------------------ *
 * The catalogue reader
 *
 * `src/catalog.ts` is TypeScript and this is a plain Node script, so the array
 * is read by a scan. A regex is defensible here, and unlike elsewhere in this
 * repository, because the declaration is a literal array of object literals whose
 * fields are string literals, string arrays and `null`: there is no computed
 * member, no spread, no reference to another binding and no call anywhere inside
 * it. The scan below holds the same property without trusting it. It reads one
 * member at a time and throws on a shape it did not expect, rather than
 * returning the members it recognised and letting a shorter list pass as a
 * smaller roster. A parser that finds no items is a failure, never a pass,
 * because "the roster is empty" and "the roster could not be read" are different
 * answers and only one of them is a green run.
 * ------------------------------------------------------------------ */

/** The index just past the string starting at `start`, or -1 if it is unterminated. */
function endOfString(text, start) {
  const quote = text[start]
  let i = start + 1
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === quote) return i + 1
    // A single-quoted string cannot span a line, so a newline ends the attempt
    // rather than swallowing the rest of the file into one value.
    if (ch === '\n' && quote !== '`') return -1
    i += 1
  }
  return -1
}

/** The index of the bracket that closes the one at `start`, or -1. */
function closingIndex(text, start) {
  const open = text[start]
  const close = open === '[' ? ']' : open === '{' ? '}' : null
  if (close === null) return -1

  let depth = 0
  let i = start
  while (i < text.length) {
    const ch = text[i]
    if (ch === '/' && text[i + 1] === '/') {
      const newline = text.indexOf('\n', i)
      i = newline === -1 ? text.length : newline
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end === -1 ? text.length : end + 2
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const end = endOfString(text, i)
      if (end === -1) return -1
      i = end
      continue
    }
    if (ch === open) depth += 1
    else if (ch === close) {
      depth -= 1
      if (depth === 0) return i
    }
    i += 1
  }
  return -1
}

/** One value at `start`, and the index just past it. */
function readValue(text, start) {
  const ch = text[start]

  if (ch === "'" || ch === '"' || ch === '`') {
    const end = endOfString(text, start)
    if (end === -1) throw new Error('an unterminated string literal')
    return {
      value: { type: 'string', text: text.slice(start + 1, end - 1).replace(/\\(.)/g, '$1') },
      next: end,
    }
  }

  if (ch === '{') {
    const end = closingIndex(text, start)
    if (end === -1) throw new Error('an unterminated object literal')
    // Read past rather than into. No field this gate compares holds a nested
    // object, and recursing would make the reader carry a shape the file does
    // not have. It is accepted rather than refused, because a future member that
    // this gate does not read is not the same failure as a roster that cannot be
    // read at all.
    return { value: { type: 'object' }, next: end + 1 }
  }

  if (ch === '[') {
    const end = closingIndex(text, start)
    if (end === -1) throw new Error('an unterminated array literal')
    const body = text.slice(start + 1, end)
    const elements = []
    let i = 0
    while (i < body.length) {
      if (/\s/.test(body[i]) || body[i] === ',') {
        i += 1
        continue
      }
      const element = readValue(body, i)
      elements.push(element.value)
      i = element.next
    }
    return { value: { type: 'array', elements }, next: end + 1 }
  }

  const literal = /^(?:null|true|false|-?\d+(?:\.\d+)?)\b/.exec(text.slice(start))
  if (literal) {
    return { value: { type: 'literal', text: literal[0] }, next: start + literal[0].length }
  }

  throw new Error(
    `a value this parser does not read: ${JSON.stringify(text.slice(start, start + 24))}`,
  )
}

/** One object literal's members, as `{ key, value }`, from the inside of the braces. */
function readMembers(body, where) {
  const members = []
  let i = 0
  const skipSpace = () => {
    while (i < body.length && /\s/.test(body[i])) i += 1
  }
  const fail = (why) => {
    throw new Error(
      `${where}: ${why}, at ${JSON.stringify(body.slice(Math.max(0, i - 12), i + 24))}`,
    )
  }

  skipSpace()
  while (i < body.length) {
    if (body[i] === '.' || body[i] === '[') fail('a spread or computed member')

    const key = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(body.slice(i))
    if (!key) fail('a member whose key is not a plain identifier')
    i += key[0].length
    skipSpace()
    if (body[i] !== ':') fail(`"${key[0]}" with no value`)
    i += 1
    skipSpace()

    const value = readValue(body, i)
    members.push({ key: key[0], value: value.value })
    i = value.next
    skipSpace()

    if (body[i] === ',') {
      i += 1
      skipSpace()
      continue
    }
    if (i >= body.length) break
    fail('text after a member value that is neither a comma nor the end of the object')
  }
  return members
}

/** The declared `catalog` array, read as the four fields this gate compares. */
function readCatalogue(text, display) {
  const declaration = /export\s+const\s+catalog\b[^=]*=\s*/.exec(text)
  if (!declaration) {
    throw new Error(
      `${display}: declares no \`export const catalog\` array, so the hand-listed roster could not\n` +
        '  be read at all. A parser that finds nothing fails here rather than reporting an empty\n' +
        '  roster, because an empty roster and an unread roster are different facts.',
    )
  }

  const from = declaration.index + declaration[0].length
  if (text[from] !== '[') {
    throw new Error(
      `${display}: \`catalog\` is declared but not as an array literal, so the roster this gate\n` +
        '  compares cannot be read.',
    )
  }
  const close = closingIndex(text, from)
  if (close === -1) throw new Error(`${display}: the \`catalog\` array literal is unterminated`)

  const inside = text.slice(from + 1, close)
  const entries = []
  let i = 0
  while (i < inside.length) {
    const ch = inside[i]
    if (/\s/.test(ch) || ch === ',') {
      i += 1
      continue
    }
    if (ch !== '{') {
      throw new Error(
        `${display}: the catalog array holds a ${JSON.stringify(ch)} where an object literal was\n` +
          '  expected, so the entry count this gate would report is not the count that was authored.',
      )
    }
    const end = closingIndex(inside, i)
    if (end === -1) {
      throw new Error(`${display}: an unterminated object literal in the catalog array`)
    }

    const at = `entry ${entries.length}`
    const members = readMembers(inside.slice(i + 1, end), `${display}, ${at}`)
    const field = (name) => {
      const found = members.filter((member) => member.key === name)
      if (found.length === 0) return { type: 'missing' }
      if (found.length > 1) throw new Error(`${display}, ${at}: declares "${name}" twice`)
      return found[0].value
    }
    const text_ = (name) => {
      const value = field(name)
      if (value.type === 'missing') throw new Error(`${display}, ${at}: has no "${name}"`)
      if (value.type !== 'string') {
        throw new Error(
          `${display}, ${at}: "${name}" is a ${value.type}, not the string literal this gate reads\n` +
            '  it as, so the entry is not one this gate can compare.',
        )
      }
      return value.text
    }

    const name = text_('name')
    entries.push({
      key: text_('slug'),
      name,
      slug: text_('slug'),
      kind: text_('kind'),
      source: text_('source'),
      at: `${display} ${at} ("${name}")`,
    })
    i = end + 1
  }

  if (entries.length === 0) {
    throw new Error(
      `${display}: the \`catalog\` array is empty, so there is no hand-listed roster to compare\n` +
        '  against the disk and the registry. An empty roster fails because a roster that cannot be\n' +
        '  read and a roster with nothing in it are not the same fact.',
    )
  }
  return entries
}

/* ------------------------------------------------------------------ *
 * The three sets
 * ------------------------------------------------------------------ */

/**
 * Set A, the source tree.
 *
 * A Component is one `.tsx` file under `src/components/ui`, named by its stem. A
 * Block or a Page is one directory under its own root, named by the directory.
 * A test file beside a Component is not a Component, which is the same rule
 * `sync-registry.mjs` applies, so both read the same set.
 */
function readSourceTree(base) {
  const modules = []

  for (const file of walkRoot(resolveRoot(base, 'src/components/ui')).files) {
    const name = path.basename(file)
    if (!COMPONENT_FILE.test(name) || TEST_FILE.test(name)) continue
    modules.push({
      key: name.replace(COMPONENT_FILE, ''),
      kind: 'component',
      where: relativePosix(base, file),
    })
  }

  for (const [root, kind] of [
    ['blocks', 'block'],
    ['pages', 'page'],
  ]) {
    const dir = resolveRoot(base, `src/${root}`)
    for (const child of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      if (!child.isDirectory()) continue
      const key = child.name
      const meta = path.join(dir, key, 'block.json')
      // `sync-registry.mjs` emits a Block or a Page under the `name` in this
      // file, so it is a second name the disk carries for the same directory and
      // it is compared with the directory name rather than assumed equal to it.
      let declared = null
      try {
        const parsed = JSON.parse(readText(meta, relativePosix(base, meta)))
        if (typeof parsed?.name === 'string') declared = parsed.name
      } catch {
        declared = null
      }
      modules.push({ key, kind, where: `${relativePosix(base, path.join(dir, key))}/`, declared })
    }
  }

  return modules
}

/** Set C, the generated registry: one item per module the generator found. */
function readRegistry(base) {
  const registry = readJson(resolveRoot(base, 'registry.json'), 'registry.json')
  if (!Array.isArray(registry?.items) || registry.items.length === 0) {
    throw new Error(
      'registry.json: "items" is not a non-empty array, so the generated roster cannot be\n' +
        '  compared. An empty generated file is a failure, not a roster of nothing.',
    )
  }

  const items = []
  registry.items.forEach((item, index) => {
    if (!item || typeof item.name !== 'string' || item.name === '') {
      throw new Error(`registry.json: items[${index}] has no "name", so it cannot be compared`)
    }
    if (!Object.prototype.hasOwnProperty.call(REGISTRY_KINDS, item.type)) {
      throw new Error(
        `registry.json: items[${index}] ("${item.name}") has the type ` +
          `${JSON.stringify(item.type)}, which is not one of the three item types a catalogue item\n` +
          '  is, so it has no kind to compare against one.',
      )
    }
    items.push({
      key: item.name,
      type: item.type,
      kind: REGISTRY_KINDS[item.type],
      at: `items[${index}] ("${item.name}")`,
    })
  })
  return items
}

/* ------------------------------------------------------------------ *
 * The rules that make one key out of three conventions
 * ------------------------------------------------------------------ */

/**
 * A display name to the canonical key.
 *
 * `Button` to `button`, `RadioGroup` to `radio-group`, `Hero01` to `hero-01`. The
 * digit rule is what carries the numbered Blocks: a hyphen goes between a letter
 * and a following digit, so `Hero01` is `hero-01` and not `hero01`, and
 * `FeatureGrid01` is `feature-grid-01`.
 */
const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .toLowerCase()

/**
 * A catalogue `source` path to the key the disk holds that path under.
 *
 * Null for a path shape this rule does not cover, which is reported by name
 * rather than absorbed: a source the rule cannot read is a claim about a module
 * that nothing here can confirm.
 */
function keyFromSource(source) {
  const parts = source.split('/')
  const file = parts[parts.length - 1]
  const directory = parts[parts.length - 2]
  if (parts[0] === 'src' && parts[1] === 'components' && file && COMPONENT_FILE.test(file)) {
    return { key: file.replace(COMPONENT_FILE, ''), kind: 'component' }
  }
  if (parts[0] === 'src' && (parts[1] === 'blocks' || parts[1] === 'pages') && file === 'index.tsx') {
    return { key: directory, kind: parts[1] === 'blocks' ? 'block' : 'page' }
  }
  return null
}

/* ------------------------------------------------------------------ *
 * The comparison
 * ------------------------------------------------------------------ */

/** The keys of `right` that `left` does not hold. */
const missingFrom = (left, right) => [...right.keys()].filter((key) => !left.has(key))

const byKey = (entries) => new Map(entries.map((entry) => [entry.key, entry]))

/** One comparison: a name for it, and one line per offending item. */
const comparison = (label, findings) => ({ label, findings })

/**
 * The three sets, in both directions, name for name.
 *
 * All six directions a three-set comparison implies are implemented, because
 * each names a different broken promise and none of them is implied by another:
 *
 *   A to B  a module on disk with no catalogue entry: it ships, it installs, and
 *           it is in no roster. That is the hole this gate was written for.
 *   B to A  a catalogue entry with no module: the corpus, the site and the agent
 *           surface advertise something the package cannot serve.
 *   C to B  a registry item with no catalogue entry: installable and absent from
 *           the corpus, the site and the agent surface.
 *   B to C  a catalogue entry with no registry item: advertised everywhere and
 *           not installable, which `validate-registry.mjs` cannot see because it
 *           never reads the catalogue.
 *   A to C  a module with no registry item: on disk and listed nowhere, so
 *           `shadcn add` cannot reach a module the tree ships. This is the
 *           direction that covers the difference the disk-reading generator
 *           leaves open when nobody re-ran it.
 *   C to A  a registry item with no module: the install 404s. `validate-registry.mjs`
 *           holds this against the disk in isolation; holding it here as well is
 *           not duplication, because this one is keyed the same way as the other
 *           five so a name that moved cannot pass as a clean pair.
 *
 * A kind disagreement is reported separately from a missing item, because a
 * Component and a Block that share a slug are two items, and reporting them as
 * one missing and one extra would be true and useless.
 */
function compare(modules, catalogue, registry) {
  const disk = byKey(modules)
  const listed = byKey(catalogue)
  const generated = byKey(registry)

  return [
    comparison(
      'A to B: a module on disk with no catalogue entry',
      missingFrom(listed, disk).map(
        (key) =>
          `a module on disk with no catalogue entry: ${disk.get(key).where} (${disk.get(key).kind})`,
      ),
    ),
    comparison(
      'B to A: a catalogue entry with no module on disk',
      missingFrom(disk, listed).map((key) => {
        const entry = listed.get(key)
        return (
          `a catalogue entry with no module on disk: "${entry.name}" (${entry.kind}, slug ` +
          `${entry.slug}, source ${entry.source})`
        )
      }),
    ),
    comparison(
      'C to B: a registry item with no catalogue entry',
      missingFrom(listed, generated).map(
        (key) => `a registry item with no catalogue entry: "${key}" (${generated.get(key).type})`,
      ),
    ),
    comparison(
      'B to C: a catalogue entry with no registry item',
      missingFrom(generated, listed).map((key) => {
        const entry = listed.get(key)
        return `a catalogue entry with no registry item: "${entry.name}" (${entry.kind}, slug ${entry.slug})`
      }),
    ),
    comparison(
      'A to C: a module on disk with no registry item',
      missingFrom(generated, disk).map(
        (key) =>
          `a module on disk with no registry item: ${disk.get(key).where} (${disk.get(key).kind})`,
      ),
    ),
    comparison(
      'C to A: a registry item with no module on disk',
      missingFrom(disk, generated).map(
        (key) => `a registry item with no module on disk: "${key}" (${generated.get(key).type})`,
      ),
    ),
    comparison(
      'the kind an item is, in the catalogue and on disk',
      [...disk.keys()]
        .filter((key) => listed.has(key) && listed.get(key).kind !== disk.get(key).kind)
        .map(
          (key) =>
            `"${key}" is a ${listed.get(key).kind} in the catalogue and a ${disk.get(key).kind} ` +
            `on disk (${disk.get(key).where})`,
        ),
    ),
    comparison(
      'the kind an item is, in the catalogue and in the registry',
      [...generated.keys()]
        .filter((key) => listed.has(key) && listed.get(key).kind !== generated.get(key).kind)
        .map(
          (key) =>
            `"${key}" is a ${listed.get(key).kind} in the catalogue and a ` +
            `${generated.get(key).type} in the registry`,
        ),
    ),
    comparison(
      'the kind an item is, on disk and in the registry',
      [...disk.keys()]
        .filter((key) => generated.has(key) && disk.get(key).kind !== generated.get(key).kind)
        .map(
          (key) =>
            `"${key}" is a ${disk.get(key).kind} on disk (${disk.get(key).where}) and a ` +
            `${generated.get(key).type} in the registry`,
        ),
    ),
    ...[
      ['the source tree', modules, 'two modules'],
      ['the catalogue', catalogue, 'two catalogue entries'],
      ['the registry', registry, 'two registry items'],
    ].map(([set, entries, twice]) => {
      // Counted over the raw list, not over the keyed map: a map has already
      // dropped the second claim, which is exactly the one this check exists to
      // see. A key two entries claim has to be found before the dedupe.
      const seen = new Set()
      const duplicates = new Set()
      for (const entry of entries) {
        if (seen.has(entry.key)) duplicates.add(entry.key)
        seen.add(entry.key)
      }
      return comparison(
        `a canonical key is claimed once in ${set}`,
        [...duplicates].map(
          (key) => `"${key}" is claimed by ${twice}, so one set holds the key and hides the other`,
        ),
      )
    }),
  ]
}

/**
 * The claims that make one key out of three conventions, reported apart from the
 * set differences because a naming failure and a missing item are different facts
 * about different things.
 */
function namingChecks(catalogue, modules) {
  const disk = byKey(modules)

  return [
    comparison(
      'a catalogue slug is the key its own source path carries',
      catalogue
        .filter((entry) => {
          const derived = keyFromSource(entry.source)
          return !derived || derived.key !== entry.slug
        })
        .map((entry) => {
          const derived = keyFromSource(entry.source)
          return derived
            ? `the catalogue entry "${entry.name}" declares the slug "${entry.slug}", but its ` +
              `source ${entry.source} names "${derived.key}" on disk, so the slug and the module ` +
              'are two names for what may be two items'
            : `the catalogue entry "${entry.name}" declares the source ${entry.source}, which is ` +
              'not a path this mapping rule covers, so nothing here can confirm the module it names'
        }),
    ),
    comparison(
      'a catalogue name is the display form of its own slug',
      catalogue
        .filter((entry) => kebab(entry.name) !== entry.slug)
        .map(
          (entry) =>
            `the catalogue entry "${entry.name}" declares the slug "${entry.slug}", which is not ` +
            `the kebab-case of the name ("${kebab(entry.name)}"), so the display name and the ` +
            'address are no longer one item under one rule',
        ),
    ),
    comparison(
      'a catalogue source path names a module the tree holds',
      catalogue
        .filter((entry) => {
          const derived = keyFromSource(entry.source)
          return derived ? !disk.has(derived.key) : true
        })
        .map((entry) => {
          const derived = keyFromSource(entry.source)
          return derived
            ? `the catalogue entry "${entry.name}" names the source ${entry.source}, and no ` +
              `${derived.kind} named "${derived.key}" is on disk`
            : `the catalogue entry "${entry.name}" names the source ${entry.source}, which this ` +
              'mapping rule cannot resolve to a module on disk'
        }),
    ),
    comparison(
      "a Block's and a Page's block.json name is the directory the tree holds",
      modules
        .filter((entry) => entry.kind !== 'component' && entry.declared !== entry.key)
        .map(
          (entry) =>
            `${entry.where}block.json declares the name "${entry.declared}", not its directory ` +
            `name "${entry.key}", so the generator emits the registry item under a name the ` +
            'directory does not have',
        ),
    ),
  ]
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

function packageRoot() {
  const override = process.env[OVERRIDE]
  if (override && override.trim() !== '') return path.resolve(override.trim())
  return path.resolve(HERE, '..')
}

function main() {
  const override = process.env[OVERRIDE] && process.env[OVERRIDE].trim() !== ''
  const base = packageRoot()

  const results = ROOTS.map((relative) => ({ relative, ...walkRoot(resolveRoot(base, relative)) }))
  assertRootsResolve(results)

  // The catalogue text is read once and used twice: the roster, and the version
  // claim. Reading it twice would inflate the coverage line by one file for no
  // reason a reader could see.
  const catalogueFile = resolveRoot(base, 'src/catalog.ts')
  const catalogueText = readText(catalogueFile, 'src/catalog.ts')
  const manifest = readJson(resolveRoot(base, 'package.json'), 'package.json')
  const modules = readSourceTree(base)
  const catalogue = readCatalogue(catalogueText, 'src/catalog.ts')
  const registry = readRegistry(base)

  const checks = [...namingChecks(catalogue, modules), ...compare(modules, catalogue, registry)]
  const findings = checks.flatMap((entry) => entry.findings)
  assertFilesRead(filesRead)

  /* The version claim, on its own line, with its own message. */
  const versionErrors = []
  const warnings = []
  const version = manifest.version
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    versionErrors.push(
      `package.json: declares ${JSON.stringify(version ?? null)} as "version", which is not a\n` +
        '  version string. This claim is separate from the roster claim below, because a version\n' +
        '  that is not a version and a roster that is wrong are different failures and must not\n' +
        '  print the same line.',
    )
  }

  /*
   * The catalogue's own version, if it ever declares one.
   *
   * It does not today, and that is stated in the run's own output rather than
   * left for a reader to infer: the claim above is then the manifest's alone, and
   * nothing here holds the roster to a release. Declaring one is a change to
   * `src/catalog.ts`, which this ticket does not make, and a gate that failed on
   * a gap it cannot close would be a gate the first person to run it deletes.
   */
  const declared = /export\s+const\s+catalogVersion\b[^=]*=\s*'([^']*)'/.exec(catalogueText)
  if (!declared) {
    warnings.push(
      "src/catalog.ts: declares no catalogue version, so the version claim in this run is the\n" +
        '  manifest\'s alone and nothing here holds the roster to a release.',
    )
  } else if (declared[1] !== version) {
    versionErrors.push(
      `src/catalog.ts: declares the catalogue version "${declared[1]}" and package.json declares\n` +
        `  "${version}", so the two disagree about which release the roster belongs to.`,
    )
  }

  const walked = results.reduce((total, result) => total + result.files.length, 0)
  const passed = checks.filter((entry) => entry.findings.length === 0).length

  for (const warning of warnings) console.warn(`warn  ${warning}`)
  for (const finding of findings) console.error(`error ${finding}`)
  for (const failure of versionErrors) console.error(`error ${failure}`)

  console.log(
    `catalogue: ${findings.length + versionErrors.length} finding(s) across ` +
      `${checks.length} comparison(s) and ${versionErrors.length} version claim(s)`,
  )
  console.log(`catalogue: version ${PKG} ${version ?? '(none declared)'}`)
  console.log(
    `catalogue: roster ${modules.length} module(s) on disk, ${catalogue.length} catalogue ` +
      `item(s), ${registry.length} registry item(s)`,
  )
  console.log(
    `catalogue: coverage ${results.length} root(s) resolved, ` +
      `${results.filter((result) => !result.exists).length} unresolved; ${walked} file(s) walked, ` +
      `${filesRead} file(s) read; ${passed}/${checks.length} comparisons passed` +
      (override ? `; package root overridden to ${base}` : ''),
  )

  if (findings.length > 0 || versionErrors.length > 0) process.exit(1)
}

try {
  main()
} catch (failure) {
  console.error(`error ${failure.message}`)
  process.exit(1)
}
