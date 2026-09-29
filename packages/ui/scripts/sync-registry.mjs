/**
 * Generates registry.json from per-block metadata.
 *
 * registry.json is derived, never hand-edited. Adding a block means creating a
 * directory with a `block.json` and its components ??? there is no second list to keep
 * in sync, which is the failure mode that quietly rots a catalog over time.
 *
 *   src/blocks/<name>/block.json    -> a registry:block item
 *   src/pages/<name>/               -> a registry:page item
 *   components/ui/*.tsx             -> a registry:component item, one per component
 *
 * The ui primitives are scanned rather than hand-listed because blocks reference
 * them through `registryDependencies`. A dependency that is declared but never
 * emitted is the worst kind of rot here: `shadcn add` resolves dependencies by
 * name against this file, so a missing `button` item makes every block needing a
 * button fail to install, and the error points at the block rather than at the
 * registry.
 *
 * Run: pnpm registry:sync
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const BLOCKS = path.join(PKG, 'src', 'blocks')
const UI = path.join(PKG, 'src', 'components', 'ui')
const PAGES = path.join(PKG, 'src', 'pages')
const OUT = path.join(PKG, 'registry.json')

const toPosix = (p) => p.split(path.sep).join('/')
const rel = (abs) => toPosix(path.relative(PKG, abs))

const UTILS = { path: 'src/lib/utils.ts', type: 'registry:lib', target: 'lib/utils.ts' }

/**
 * Every item in this registry ships `lib/utils.ts`, so its imports are every item's
 * imports.
 *
 * This was the gap that let `clsx` and `tailwind-merge` reach a consumer's repo
 * without ever being declared. `dependencies` was derived from each item's own
 * primary source file only, so the packages imported by the one file that ships
 * with *every* item were read by nobody. A consumer running `shadcn add` got a
 * `lib/utils.ts` importing two packages the registry never asked the CLI to
 * install, and the resulting build failure pointed at their app rather than at
 * this file. Derived here for the same reason the rest is derived: a declaration
 * can neither claim a package the file does not use nor omit one it does.
 *
 * Declared below `npmDependencies` and `IMPLICIT`, which it reads at module scope.
 */
let UTILS_DEPS

/** Union of an item's own imports with the ones `lib/utils.ts` brings along. */
function dependenciesFor(ownDeps) {
  const merged = [...new Set([...(ownDeps ?? []), ...UTILS_DEPS])].sort()
  return merged.length ? merged : undefined
}

/** Packages the consumer already has; declaring them would only add install noise. */
const IMPLICIT = new Set(['react', 'react-dom', 'next', 'next-themes'])

/** Every block imports the shared Section primitives, so they always ship together. */
const SHARED = [
  {
    path: 'src/components/ui/section.tsx',
    type: 'registry:component',
    target: 'components/ui/section.tsx',
  },
]

async function isDirectory(p) {
  return (await stat(p)).isDirectory()
}

/**
 * Windows editors (and PowerShell's `Set-Content -Encoding utf8`) write a UTF-8
 * BOM, which JSON.parse rejects outright. Strip it rather than failing with a
 * confusing "Unexpected token" from a file that looks correct on screen.
 */
async function readJson(file) {
  const raw = await readFile(file, 'utf8')
  return JSON.parse(raw.replace(/^\uFEFF/, ''))
}

/** Files a block owns, relative to its directory, sorted for stable output. */
async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => /\.(tsx|ts|css)$/.test(e.name))
    .map((e) => e.name)
    .sort()
}

/**
 * Third-party packages a source file imports, read from the file itself.
 *
 * Derived rather than declared so a primitive cannot claim a dependency it does
 * not use, or omit one it does. Local `@/` aliases and the implicit set are
 * dropped; scoped packages keep their scope because that is the install name.
 */
async function npmDependencies(file) {
  const source = await readFile(file, 'utf8')
  const specifiers = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
  return [
    ...new Set(
      specifiers
        .filter((s) => !s.startsWith('.') && !s.startsWith('@/') && !s.startsWith('node:'))
        .filter((s) => !IMPLICIT.has(s))
        // A stylesheet or asset import is not an npm dependency.
        .filter((s) => /\.[a-z0-9]+$/i.test(s) === false)
        .map((s) => (s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0])),
    ),
  ].sort()
}

UTILS_DEPS = await npmDependencies(path.join(PKG, UTILS.path))

const items = []

/**
 * Shared ui primitives, emitted before the blocks that depend on them so the
 * generated file reads top-down: what everything needs, then what needs it.
 */
for (const entry of (await readdir(UI, { withFileTypes: true })).sort((a, b) =>
  a.name.localeCompare(b.name),
)) {
  if (!entry.isFile() || !entry.name.endsWith('.tsx') || entry.name.endsWith('.test.tsx')) continue

  const name = entry.name.replace(/\.tsx$/, '')
  const file = path.join(UI, entry.name)
  const deps = dependenciesFor(await npmDependencies(file))

  items.push({
    name,
    title: name.charAt(0).toUpperCase() + name.slice(1),
    description: `Shared ${name} primitive. Installed automatically as a dependency of any block that uses it.`,
    type: 'registry:component',
    ...(deps ? { dependencies: deps } : {}),
    files: [
      {
        path: rel(file),
        type: 'registry:component',
        target: `components/ui/${entry.name}`,
      },
      UTILS,
    ],
  })
}

/**
 * Blocks, Pages and live surfaces: one loop over the three composed roots.
 *
 * They were two near-identical loops and adding a third Kind would have made three,
 * which is the arrangement where a fix to one leaves the other two quietly wrong.
 * They differ in three facts and nothing else, so those are the row: the source
 * directory, the registry type, and the metadata filename. Everything else is the
 * same derivation, and the derivation is the part that must not drift, because a
 * hand-written `dependencies` list is the one declaration here that can be wrong in
 * either direction and the error surfaces in a consumer's `shadcn add`.
 *
 * A live surface is the only one of the three whose metadata is not `block.json`,
 * and it is carried per row rather than derived: a filename asserting `block` for an
 * Item of Kind `live` is a small lie that every later reader has to notice.
 *
 * **A live surface is emitted as `registry:block`, and that is not a fourth Kind
 * leaking into a third-party vocabulary.** The `type` field here belongs to the
 * shadcn registry schema, which has `registry:component`, `registry:block` and
 * `registry:page` and no notion of a live surface; `shadcn build` rejects a type it
 * does not know, so inventing one breaks the build. The **Kind** is ours and is
 * `live` in `CATALOG_KINDS`, the corpus, the MCP tools and the site's Sections. The
 * registry is a derived internal artefact, never served and never an install lane,
 * and the two vocabularies are allowed to differ because only one of them is ours.
 */
for (const { root, type, meta: metaName } of [
  { root: 'blocks', type: 'registry:block', meta: 'block.json' },
  { root: 'pages', type: 'registry:page', meta: 'block.json' },
  { root: 'live', type: 'registry:block', meta: 'item.json' },
]) {
  const base = path.join(PKG, 'src', root)
  for (const entry of (await readdir(base, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!entry.isDirectory()) continue

    const dir = path.join(base, entry.name)
    const metaPath = path.join(dir, metaName)
    let meta
    try {
      meta = await readJson(metaPath)
    } catch {
      console.error(`error src/${root}/${entry.name}: missing or malformed ${metaName}`)
      process.exit(1)
    }

    const own = await collectFiles(dir)
    const files = own.map((file) => ({
      path: rel(path.join(dir, file)),
      type: 'registry:component',
      target: `components/${root}/${entry.name}/${file}`,
    }))

    const ownDeps = []
    for (const file of own) ownDeps.push(...(await npmDependencies(path.join(dir, file))))
    // SHARED entries carry a path relative to the package root, not to the Item's
    // own directory, so they join the scan for a Block and not for a Page or a
    // live surface. A live surface ships `SHARED` too, because it is the only
    // client entry point and the shared client files are what it depends on.
    if (root === 'blocks' || root === 'live') {
      for (const shared of SHARED) ownDeps.push(...(await npmDependencies(path.join(PKG, shared.path))))
    }
    const deps = dependenciesFor([...ownDeps, ...(meta.dependencies ?? [])])

    // Dedupe: a Block that also owns section.tsx must not ship it twice.
    const seen = new Set()
    const all = [...files, ...SHARED, UTILS].filter((file) => {
      if (seen.has(file.path)) return false
      seen.add(file.path)
      return true
    })

    items.push({
      name: meta.name,
      title: meta.title,
      description: meta.description,
      type,
      ...(meta.categories?.length ? { categories: meta.categories } : {}),
      ...(meta.registryDependencies?.length
        ? { registryDependencies: meta.registryDependencies }
        : {}),
      ...(deps ? { dependencies: deps } : {}),
      files: all,
    })
  }
}


/**
 * The registry homepage, read from this package's own manifest.
 *
 * It used to be a hardcoded `https://example.com`. RFC 2606 reserves that domain for
 * documentation, so the committed generated file advertised a homepage that could never
 * resolve, and it was a claim rather than a value: nothing read it, so nobody noticed it
 * was false.
 *
 * It is now read from configuration rather than hardcoded, so there is exactly one
 * place to set it. Two things are enforced rather than trusted:
 *
 *   - A reserved placeholder is rejected outright, because that specific value is what
 *     this check exists to keep out of a generated file.
 *   - The field is *required*, not optional. `shadcn build` validates registry.json
 *     against its published schema and fails with a bare "Invalid registry file found"
 *     that names no field; the field turned out to be mandatory, so omitting it is not
 *     available as a way to avoid asserting something. Failing here instead produces
 *     the same stop with a message that says which key to set.
 *
 * The homepage is configured on this package's manifest, so the build stops until one
 * is supplied. That is the honest outcome: the alternative was a URL that cannot
 * resolve, shipped to consumers.
 */
const configuredHomepage = (await readJson(path.join(PKG, 'package.json'))).homepage
const homepage = typeof configuredHomepage === 'string' ? configuredHomepage.trim() : ''

if (!homepage) {
  console.error(
    'error registry homepage is not set.\n' +
      '  shadcn requires `homepage` on registry.json, and there is no default that is\n' +
      '  not a lie: example.com is reserved by RFC 2606 and can never resolve.\n' +
      '  Set a real one in packages/ui/package.json:\n\n' +
      '    "homepage": "https://<your-domain>"\n',
  )
  process.exit(1)
}

/**
 * Hosts that can never be real, per RFC 2606 and RFC 6761.
 *
 * Matched against the parsed hostname, and subdomains count: `ds.example.org` is as
 * permanently reserved as `example.org`, so a test anchored to the whole string is not
 * enough. A substring or suffix test on the raw homepage value does not work either,
 * because the character before `example` in `https://example.com` is a slash rather
 * than a dot, so a pattern anchored to a dot or the start of the string matches
 * nothing and the reserved value sails straight through.
 */
const RESERVED_HOSTS = ['example.com', 'example.net', 'example.org', 'localhost', 'test', 'local']
const isReservedHost = (host) =>
  RESERVED_HOSTS.some((r) => host === r || host.endsWith(`.${r}`))

let hostname = null
try {
  hostname = new URL(homepage).hostname
} catch {
  console.error(
    `error registry homepage: "${homepage}" is not an absolute URL.\n` +
      '  Set a real homepage in packages/ui/package.json, for example "https://<your-domain>".',
  )
  process.exit(1)
}

if (isReservedHost(hostname)) {
  console.error(
    `error registry homepage: "${homepage}" resolves to the reserved host "${hostname}" and can never be real.\n` +
      '  Set a real homepage in packages/ui/package.json.',
  )
  process.exit(1)
}

await writeFile(
  OUT,
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: 'nanisoft',
      ...(homepage ? { homepage } : {}),
      items,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

const blocks = items.filter((i) => i.type === 'registry:block').length
console.log(
  `registry: synced ${items.length} items (${blocks} blocks) -> ${rel(OUT)}` +
    (homepage ? `  homepage ${homepage}` : '  homepage omitted (none configured)'),
)
