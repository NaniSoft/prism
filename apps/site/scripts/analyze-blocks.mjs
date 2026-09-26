/**
 * Derives the facts a block page needs to answer "what does installing this cost me?".
 *
 * Everything here is measured from the source rather than declared, because the
 * whole point is that a consumer can trust it. A block that quietly grows a
 * `'use client'` directive starts shipping JavaScript and hydrating, and nothing in
 * registry.json would say so: the shadcn schema has no field for it.
 *
 * Emitted to `src/generated/block-meta.json` so the analysis happens once at build
 * time. Doing it with `fs` inside a React module would tie the catalog to a Node
 * runtime and make the data impossible to cache.
 *
 * Run: node scripts/analyze-blocks.mjs
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.join(HERE, '..')
const REPO = path.join(DOCS, '..', '..')
const REGISTRY = path.join(REPO, 'packages', 'ui')
const REGISTRY_SRC = path.join(REGISTRY, 'src')
const OUT_DIR = path.join(DOCS, 'src', 'generated')
const OUT = path.join(OUT_DIR, 'block-meta.json')

/** `@/*` in packages/ui/tsconfig.json. Block source is written against it. */
const WORKSPACE_ALIAS = '@/'

/**
 * Bounds. A block's dependency graph is not ours to control, so the walk is
 * capped rather than trusted, and hitting a cap is recorded as "not proven" rather
 * than as "safe". These are deliberately generous: the current catalog closes
 * inside 3 hops, so a cap that fires is news worth reporting.
 */
const MAX_DEPTH = 8
const MAX_NODES = 6000
const MAX_FILE_BYTES = 4_000_000

/**
 * Packages whose client-safety is a framework guarantee rather than something this
 * walk can measure. React and Next are the runtime itself: `next/*` is already a
 * direct `client: true` signal on the importing file, and reading `react`'s own
 * dist would say nothing about whether a block needs to hydrate. `next-themes` is
 * the same story.
 */
const IMPLICIT = new Set(['react', 'react-dom', 'next', 'next-themes'])

/** `useState`/`useEffect` imply a client boundary even without the directive. */
const CLIENT_HOOKS = /\buse(State|Effect|Memo|Ref|Reducer|Callback|Context|LayoutEffect)\s*\(/
const USE_CLIENT = /^[ \t]*['"]use client['"]/m
const NEXT_CLIENT_IMPORT = /\bimport\s+[^\n;]*\bfrom\s+['"]next\/(navigation|router|image|head)\b/

/**
 * Specifier extraction is lexical, not a parse. Two consequences, and both are
 * recorded rather than hidden:
 *
 * - It can over-approximate: a `from '...'` that lives inside a function body may be
 *   mistaken for an import. That direction is survivable, because it only ever adds a
 *   module to the walk and the mistake is visible in the evidence.
 * - It cannot see computed or aliased specifiers (`import(x)` on a variable,
 *   `require` on a template literal). Nothing static can, which is why the answer to
 *   a specifier we cannot resolve is recorded below rather than assumed.
 */

/** `import ... from '...'` and `export ... from '...'`, across line breaks. */
const IMPORT_FROM =
  /^[ \t]*(?:import|export)\s+(?!default\b)([^;]{0,2000}?)[\s;]from\s*['"]([^'"\n]+)['"]/gm
/** Side-effect imports: `import 'x'`. */
const BARE_IMPORT = /^[ \t]*import\s*['"]([^'"\n]+)['"]/gm
/** `import type { A } from 'x'` is erased at compile time, so it ships no code. */
const TYPE_ONLY = /^\s*type\b/

/** Extensions a bundler would try when a specifier omits one. */
const EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts']
/** Declaration files carry no runtime directives, so landing on one means we mis-resolved. */
const DECLARATION = /\.d\.[cm]?ts$/

/**
 * Condition order for an `exports` map, applied to keys rather than to insertion
 * order. This matters more than it looks: `tailwind-merge@3.7.0` lists `types`
 * first, so a resolver that takes the first key lands on `dist/types.d.ts` and then
 * reports the package as unreadable. `types`/`typings` are never eligible.
 */
const CONDITIONS = ['import', 'node', 'browser', 'default', 'require']
const NEVER_CONDITIONS = new Set(['types', 'typings'])

/** Repo-relative, forward-slashed: stable across machines, greppable from the root. */
const rel = (abs) => path.relative(REPO, abs).split(path.sep).join('/')

/** `stat` on a pnpm junction is not free, and the same path gets asked about repeatedly. */
const statCache = new Map()

async function isFile(p) {
  const hit = statCache.get(p)
  if (hit !== undefined) return hit
  let ok = false
  try {
    ok = (await stat(p)).isFile()
  } catch {
    ok = false
  }
  statCache.set(p, ok)
  return ok
}

async function isDir(p) {
  try {
    return (await stat(p)).isDirectory()
  } catch {
    return false
  }
}

/** Classify one file's own source. Returns the signal, or null when it is server-safe. */
function classifyClient(source) {
  if (USE_CLIENT.test(source)) return 'use-client'
  if (NEXT_CLIENT_IMPORT.test(source)) return 'next-import'
  if (CLIENT_HOOKS.test(source)) return 'client-hook'
  return null
}

/** Count a block's own lines, and whether that file alone crosses the boundary. */
async function analyzeFile(abs) {
  const source = await readFile(abs, 'utf8')
  const lines = source.split('\n')
  return {
    lines: lines.length,
    code: lines.filter((l) => l.trim() && !/^\s*(\/\/|\/\*|\*)/.test(l)).length,
    client: classifyClient(source) !== null,
  }
}

/**
 * Split a file's specifiers into ones that stay inside the workspace and ones that
 * name a package. Protocols, `node:` builtins and `imports`-map specifiers are
 * dropped: none of them can carry a `'use client'` directive a consumer would ship.
 */
function collectSpecifiers(source) {
  const local = []
  const bare = []

  const add = (spec) => {
    if (spec === '.' || spec === '..' || spec.startsWith('./') || spec.startsWith('../') || spec.startsWith(WORKSPACE_ALIAS)) {
      local.push(spec)
    } else if (spec.startsWith('node:') || spec.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(spec)) {
      // not a module on disk
    } else {
      bare.push(spec)
    }
  }

  for (const m of source.matchAll(IMPORT_FROM)) {
    // `import type` / `export type` is compile-time only. Following it would let a
    // type-only dependency decide a runtime claim, which is the same class of error
    // as grepping a whole package directory.
    if (TYPE_ONLY.test(m[1])) continue
    add(m[2])
  }
  for (const m of source.matchAll(BARE_IMPORT)) add(m[1])

  return { local: [...new Set(local)], bare: [...new Set(bare)] }
}

/**
 * Read and analyse a file once for the whole run. Blocks share packages, so the
 * expensive part, reading `lucide-react`'s 1,600-odd icon modules, is paid once and
 * every block then walks an in-memory graph.
 */
const nodeCache = new Map()

async function loadNode(abs) {
  const cached = nodeCache.get(abs)
  if (cached) return cached

  let node
  try {
    const info = await stat(abs)
    if (info.size > MAX_FILE_BYTES) {
      node = { ok: false, reason: 'file-too-large' }
    } else {
      const source = await readFile(abs, 'utf8')
      node = { ok: true, signal: classifyClient(source), ...collectSpecifiers(source) }
    }
  } catch (error) {
    node = { ok: false, reason: `read-failed:${error.code ?? error.message}` }
  }

  nodeCache.set(abs, node)
  return node
}

/** Split `@scope/name/sub/path` into its package name and its subpath. */
function splitBare(spec) {
  const parts = spec.split('/')
  if (spec.startsWith('@')) {
    if (parts.length < 2 || !parts[0] || !parts[1]) return null
    return { name: `${parts[0]}/${parts[1]}`, subpath: parts.slice(2).join('/') }
  }
  if (!parts[0]) return null
  return { name: parts[0], subpath: parts.slice(1).join('/') }
}

/**
 * Walk `node_modules` up from the importing file, first hit wins. That is what a
 * bundler does, and in a pnpm workspace it is the only order that finds the
 * registry's own copy of a dependency before the store's.
 */
async function findPackageDir(fromDir, name) {
  let dir = fromDir
  for (let hop = 0; hop < 16; hop += 1) {
    const candidate = path.join(dir, 'node_modules', ...name.split('/'))
    if (await isFile(path.join(candidate, 'package.json'))) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
  return null
}

const packageJsonCache = new Map()

async function readPackageJson(dir) {
  const hit = packageJsonCache.get(dir)
  if (hit !== undefined) return hit
  let pkg = null
  try {
    // Windows editors add a BOM and JSON.parse rejects it.
    pkg = JSON.parse((await readFile(path.join(dir, 'package.json'), 'utf8')).replace(/^﻿/, ''))
  } catch {
    pkg = null
  }
  packageJsonCache.set(dir, pkg)
  return pkg
}

/** `exports` target selection. Recurses through nested condition objects. */
function pickExportTarget(value, wildcardRest) {
  if (typeof value === 'string') return value.replaceAll('*', wildcardRest)
  if (Array.isArray(value)) {
    for (const entry of value) {
      const target = pickExportTarget(entry, wildcardRest)
      if (target) return target
    }
    return null
  }
  if (value && typeof value === 'object') {
    for (const condition of CONDITIONS) {
      if (NEVER_CONDITIONS.has(condition) || !(condition in value)) continue
      const target = pickExportTarget(value[condition], wildcardRest)
      if (target) return target
    }
  }
  return null
}

/**
 * Find the `exports` entry for a subpath, longest wildcard prefix winning. Also
 * handles the two sugar forms: `"exports": "./index.js"` and a bare condition map
 * with no `./` keys at all, which is shorthand for the package root.
 */
function matchExportsKey(exportsField, key) {
  if (exportsField === null || exportsField === undefined) return null
  if (typeof exportsField === 'string' || Array.isArray(exportsField)) {
    return key === '.' ? { target: exportsField, rest: '' } : null
  }
  if (typeof exportsField !== 'object') return null

  if (key in exportsField) return { target: exportsField[key], rest: '' }

  const subpathKeys = Object.keys(exportsField).filter((k) => k.startsWith('./'))
  if (subpathKeys.length === 0) return key === '.' ? { target: exportsField, rest: '' } : null

  let best = null
  for (const candidate of subpathKeys) {
    const star = candidate.indexOf('*')
    if (star === -1) continue
    const head = candidate.slice(0, star)
    const tail = candidate.slice(star + 1)
    if (key.length < head.length + tail.length) continue
    if (!key.startsWith(head) || !key.endsWith(tail)) continue
    if (best && best.head.length >= head.length) continue
    best = { target: exportsField[candidate], rest: key.slice(head.length, key.length - tail.length), head }
  }
  return best
}

/** Try the path as given, then each known extension, then `path/index.<ext>`. */
async function probeFile(base) {
  if (await isFile(base)) return base
  for (const ext of EXTENSIONS) {
    if (await isFile(base + ext)) return base + ext
  }
  if (await isDir(base)) {
    for (const ext of EXTENSIONS) {
      const indexed = path.join(base, `index${ext}`)
      if (await isFile(indexed)) return indexed
    }
  }
  return null
}

/**
 * Resolve one bare specifier to a concrete file, in the order a bundler uses:
 * `exports` first, then `module`, then `main`, then `index.js`. `via` is reported
 * so a reader can tell which rule produced the answer.
 *
 * Resolving the specific specifier is the whole point. `lucide-react@0.545.0`
 * contains exactly one file with a `'use client'` directive,
 * `dist/esm/DynamicIcon.js`, reached only through the `lucide-react/dynamic`
 * subpath, and the default entry that `import { ArrowRight } from 'lucide-react'`
 * names is server-safe. Grepping the package directory flags lucide as
 * client-only, inverts the entire finding, and breaks all five blocks.
 */
async function resolveBare(spec, fromFile) {
  const parsed = splitBare(spec)
  if (!parsed) return { ok: false, reason: 'malformed-specifier' }

  const pkgDir = await findPackageDir(path.dirname(fromFile), parsed.name)
  if (!pkgDir) return { ok: false, reason: 'package-not-installed', package: parsed.name }

  const pkg = await readPackageJson(pkgDir)
  if (!pkg) return { ok: false, reason: 'unreadable-package-json', package: parsed.name }

  const key = parsed.subpath ? `./${parsed.subpath}` : '.'
  const matched = matchExportsKey(pkg.exports, key)

  if (matched) {
    const target = pickExportTarget(matched.target, matched.rest)
    if (!target) return { ok: false, reason: 'no-matching-export-condition', package: parsed.name, key }
    const file = await probeFile(path.resolve(pkgDir, target))
    if (!file) return { ok: false, reason: 'export-target-missing', package: parsed.name, key, target }
    if (DECLARATION.test(file)) {
      return { ok: false, reason: 'export-target-is-declaration', package: parsed.name, key, target }
    }
    return { ok: true, file, via: 'exports', pkgDir, version: pkg.version, package: parsed.name }
  }

  // An `exports` map is a wall: a subpath it does not list is not importable, however
  // plausible the file on disk looks.
  if (pkg.exports !== undefined && pkg.exports !== null) {
    return { ok: false, reason: 'subpath-not-exported', package: parsed.name, key }
  }

  if (!parsed.subpath) {
    for (const field of ['module', 'main']) {
      if (typeof pkg[field] !== 'string') continue
      const file = await probeFile(path.resolve(pkgDir, pkg[field]))
      if (file && !DECLARATION.test(file)) {
        return { ok: true, file, via: field, pkgDir, version: pkg.version, package: parsed.name }
      }
    }
  }

  const file = await probeFile(path.resolve(pkgDir, parsed.subpath || 'index'))
  if (!file) return { ok: false, reason: 'file-not-found', package: parsed.name, key }
  if (DECLARATION.test(file)) return { ok: false, reason: 'resolved-to-declaration', package: parsed.name, key }
  return {
    ok: true,
    file,
    via: parsed.subpath ? 'subpath' : 'index',
    pkgDir,
    version: pkg.version,
    package: parsed.name,
  }
}

/** `@/components/ui/button` and `./cta` both stay inside the registry source tree. */
async function resolveLocal(spec, fromFile, origin) {
  if (spec.startsWith(WORKSPACE_ALIAS)) {
    // An `@/` import inside a dependency is not ours to follow. It would drag the
    // registry's own source into an installed package's graph, which is wrong.
    if (origin !== 'workspace') return null
    return probeFile(path.resolve(REGISTRY_SRC, spec.slice(WORKSPACE_ALIAS.length)))
  }
  return probeFile(path.resolve(path.dirname(fromFile), spec))
}

/**
 * Walk one block's install surface.
 *
 * Seeds are every file `shadcn add` writes: the block's own files, its transitive
 * `registryDependencies`, and the shared `registry:lib` entries. From there the walk
 * follows local specifiers inside the workspace and bare specifiers into
 * `node_modules`, recursively, up to `MAX_DEPTH` hops and `MAX_NODES` distinct files
 * across the whole run.
 *
 * Every file read is recorded, and so is every file that could not be resolved. The
 * return value is the evidence a human needs to disagree with the verdict.
 */
async function walkBlock(seeds, declared) {
  const packages = new Map()
  const unresolved = new Map()
  const undeclared = new Set()
  const visited = new Set()
  const reachedVia = new Map()

  // `owner` is the bare specifier whose package graph a file belongs to. It is
  // inherited through relative hops so that a `use client` buried 1,600 modules
  // deep is still attributed to the dependency the block actually imported,
  // which is the only attribution a reader can act on.
  const queue = seeds.map((abs) => ({
    abs,
    depth: 0,
    origin: 'workspace',
    via: 'registry',
    owner: null,
    ownerFrom: null,
    ownerVia: null,
  }))

  let trigger = null
  let triggerAbs = null
  let truncated = false

  const note = (specifier, from, via, reason) => {
    const key = `${specifier}\u0000${from}`
    if (unresolved.has(key)) return
    unresolved.set(key, { specifier, from, resolvedVia: via, reason })
  }

  while (queue.length) {
    const node = queue.shift()
    if (visited.has(node.abs)) continue
    if (!nodeCache.has(node.abs) && nodeCache.size >= MAX_NODES) {
      visited.add(node.abs)
      truncated = true
      continue
    }
    visited.add(node.abs)

    if (node.owner) {
      const set = reachedVia.get(node.owner) ?? new Set()
      set.add(node.abs)
      reachedVia.set(node.owner, set)
    }

    const info = await loadNode(node.abs)

    if (!info.ok) {
      note(node.owner ?? rel(node.abs), node.ownerFrom ?? rel(node.abs), node.via, info.reason)
      continue
    }

    if (info.signal && !trigger) {
      trigger = {
        file: rel(node.abs),
        signal: info.signal,
        specifier: node.owner,
        resolvedVia: node.ownerVia,
        depth: node.depth,
      }
      triggerAbs = node.abs
    }

    if (node.depth + 1 > MAX_DEPTH) {
      if (info.local.length || info.bare.length) truncated = true
      continue
    }

    for (const spec of info.local) {
      const via = spec.startsWith(WORKSPACE_ALIAS) ? 'workspace-alias' : 'relative'
      const target = await resolveLocal(spec, node.abs, node.origin)
      if (!target) {
        note(spec, rel(node.abs), via, 'file-not-found')
        continue
      }
      queue.push({
        abs: target,
        depth: node.depth + 1,
        origin: node.origin,
        via,
        owner: node.owner,
        ownerFrom: node.ownerFrom,
        ownerVia: node.ownerVia,
      })
    }

    for (const spec of info.bare) {
      const name = splitBare(spec)?.name ?? spec
      if (IMPLICIT.has(name)) continue
      if (!declared.has(name)) undeclared.add(name)

      const existing = packages.get(spec)
      if (existing) {
        // A specifier that already failed to resolve stays failed, and every file
        // that reached for it records the same reason rather than staying silent.
        if (existing.reason) note(spec, rel(node.abs), 'bare', existing.reason)
        continue
      }

      const record = {
        specifier: spec,
        package: name,
        version: null,
        resolved: null,
        resolvedVia: null,
        reason: null,
        filesRead: 0,
        client: false,
      }

      const resolved = await resolveBare(spec, node.abs)
      if (!resolved.ok) {
        record.resolvedVia = 'bare'
        record.reason = resolved.reason
        packages.set(spec, record)
        note(spec, rel(node.abs), 'bare', resolved.reason)
        continue
      }

      record.version = resolved.version ?? null
      record.resolved = rel(resolved.file)
      record.resolvedVia = resolved.via
      packages.set(spec, record)

      queue.push({
        abs: resolved.file,
        depth: node.depth + 1,
        origin: 'package',
        via: resolved.via,
        owner: spec,
        ownerFrom: rel(node.abs),
        ownerVia: resolved.via,
      })
    }
  }

  // How many files each specifier caused us to read, so a reader can see where
  // `lucide-react`'s 1,600-odd modules went. A file first reached through a
  // different specifier is counted there, not here.
  //
  // `client` is set from the same set rather than by matching the trigger's path
  // against the package name. Matching on the name is the bug this whole analyzer
  // exists to avoid: `lucide-react` and `lucide-react/dynamic` share a name
  // prefix, so a string comparison credits the default entry for a directive that
  // only the subpath reaches.
  for (const [spec, record] of packages) {
    const files = reachedVia.get(spec)
    record.filesRead = files?.size ?? 0
    record.client = Boolean(triggerAbs) && Boolean(files?.has(triggerAbs))
  }

  return {
    trigger,
    truncated,
    visited,
    packages: [...packages.values()].sort((a, b) => a.specifier.localeCompare(b.specifier)),
    unresolved: [...unresolved.values()].sort((a, b) => a.specifier.localeCompare(b.specifier)),
    undeclared: [...undeclared].sort(),
  }
}

const registry = JSON.parse(
  (await readFile(path.join(REGISTRY, 'registry.json'), 'utf8')).replace(/^﻿/, ''),
)
const itemsByName = new Map(registry.items.map((item) => [item.name, item]))

/**
 * Every file `shadcn add @nanisoft/<name>` puts on disk: the item's own files plus those
 * of its transitive `registryDependencies`. Shared `registry:lib` files are included
 * here even though they are not reported in `files[]`, because they still land in the
 * consumer's project and a hook in `lib/utils.ts` is as real as one in a block.
 */
function installSurface(item) {
  const files = []
  const seen = new Set([item.name])
  const missing = []
  const queue = [item]
  // Everything `shadcn add` will resolve for this block: the block's own
  // `dependencies` plus those of every item it pulls in. A package absent from
  // here is one the CLI will not install, so a block reaching for it is a manifest
  // gap rather than a measurement gap.
  const declared = new Set(item.dependencies ?? [])

  while (queue.length) {
    const current = queue.shift()
    for (const dep of current.registryDependencies ?? []) {
      const next = itemsByName.get(dep)
      if (!next) {
        missing.push(dep)
        continue
      }
      if (seen.has(next.name)) continue
      seen.add(next.name)
      queue.push(next)
    }
    for (const dep of current.dependencies ?? []) declared.add(dep)
    for (const file of current.files ?? []) {
      files.push({ file, shared: current !== item })
    }
  }

  return { files, missing, items: [...seen], declared }
}

const blocks = {}
const allWarnings = []

for (const item of registry.items) {
  if (item.type !== 'registry:block') continue

  const surface = installSurface(item)

  // `files[]` keeps reporting only the block's own non-shared files, so `code`
  // totals and `fileCount` mean what they meant before this walk existed.
  const files = []
  const seeds = []

  for (const { file, shared } of surface.files) {
    const abs = path.join(REGISTRY, file.path)
    seeds.push(abs)
    if (shared || file.type === 'registry:lib') continue
    files.push({ target: file.target, ...(await analyzeFile(abs)) })
  }

  const walk = await walkBlock(seeds, surface.declared)

  for (const missing of surface.missing) {
    allWarnings.push(`${item.name}: registryDependency "${missing}" is not in registry.json`)
  }
  for (const { specifier, from, reason } of walk.unresolved) {
    allWarnings.push(`${item.name}: could not resolve "${specifier}" imported by ${from} (${reason})`)
  }
  if (walk.truncated) {
    allWarnings.push(
      `${item.name}: walk hit a cap (depth > ${MAX_DEPTH} or > ${MAX_NODES} files); client status is unproven past that point`,
    )
  }

  blocks[item.name] = {
    // A block is a client block if any file it installs, or any file reachable from
    // one, crosses the boundary.
    client: Boolean(walk.trigger) || files.some((f) => f.client),
    // The file that proved it, so the boolean is auditable rather than magic.
    clientSource: walk.trigger,
    /**
     * `true` only when the walk finished clean: no unresolved specifier, no
     * unreadable file, no cap hit. This is the difference between "we looked and
     * found nothing" and "we could not look", and it is what `summary.allServer`
     * requires before the site is allowed to make the claim.
     */
    verified: walk.unresolved.length === 0 && !walk.truncated,
    files,
    code: files.reduce((sum, f) => sum + f.code, 0),
    deps: {
      /** Every package the block's graph reached, in specifier order. */
      packages: walk.packages,
      /** Packages the graph reaches that registry.json never declared. */
      undeclared: walk.undeclared,
      /** Specifiers that could not be resolved, with the reason. */
      unresolved: walk.unresolved,
      truncated: walk.truncated,
      maxDepth: MAX_DEPTH,
      filesRead: walk.visited.size,
      /** Registry items pulled in beyond the block itself. */
      items: surface.items.filter((n) => n !== item.name).sort(),
    },
  }
}

const names = Object.keys(blocks)
const clientNames = names.filter((n) => blocks[n].client)
const unverifiedNames = names.filter((n) => !blocks[n].verified)
const walkedPackages = [...new Set(names.flatMap((n) => blocks[n].deps.packages.map((p) => p.package)))].sort()

await mkdir(OUT_DIR, { recursive: true })
await writeFile(
  OUT,
  `${JSON.stringify(
    {
      $comment:
        'Generated by scripts/analyze-blocks.mjs. Do not edit. Re-run via the docs prebuild/predev step.',
      $evidence: {
        rule:
          'A block is client only if a file it installs, or a file reachable from one by ' +
          'resolving real imports, carries a use-client directive, a client hook, or a ' +
          'next/{navigation,router,image,head} import. Bare specifiers are resolved to the ' +
          'specific file they name (exports map, then module, then main, then index.js) and ' +
          'that file is what gets evaluated. A package is never judged by grepping its ' +
          'directory, because lucide-react@0.545.0 ships a use-client DynamicIcon that no ' +
          'block reaches and a whole-package grep would flag all five blocks as client.',
        limits: { maxDepth: MAX_DEPTH, maxFiles: MAX_NODES, maxFileBytes: MAX_FILE_BYTES },
        unresolved:
          'An unresolvable specifier is not evidence of safety. It leaves client false but ' +
          'sets verified false, and summary.allServer requires every block to be both server ' +
          'and verified, so the site stops making the claim rather than making it by default. ' +
          'The analyzer reports and exits 0: a moved dependency must not fail a build.',
        typeOnlyImports: 'import type / export type is compile-time only and is not followed.',
        undeclared:
          'deps.undeclared lists packages the graph reaches that registry.json does not ' +
          'declare. Reported, not failed: clsx and tailwind-merge arrive with the shadcn ' +
          'lib/utils convention rather than an item that owns them.',
      },
      blocks,
      summary: {
        count: names.length,
        clientBlocks: clientNames.length,
        /**
         * Every block is server AND the walk proved it. Stricter than "no block is
         * client", on purpose: the headline on /blocks rests on this.
         */
        allServer: clientNames.length === 0 && unverifiedNames.length === 0,
        /** Blocks whose client status could not be established either way. */
        unverifiedBlocks: unverifiedNames.length,
        unverified: unverifiedNames,
        /** Every package any block's walk reached, for the record. */
        packages: walkedPackages,
        totalCode: names.reduce((sum, n) => sum + blocks[n].code, 0),
      },
      warnings: allWarnings,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

for (const [name, block] of Object.entries(blocks)) {
  const verdict = block.client
    ? `client, forced by ${block.clientSource.file} (${block.clientSource.signal})`
    : 'server'
  const proof = block.verified ? '' : '   UNPROVEN'
  console.log(`${block.client ? '!' : '.'} ${name.padEnd(17)} ${verdict}${proof}`)
  console.log(
    `    ${block.deps.filesRead} files read, ${block.files.length} owned, ` +
      `${block.deps.items.length} shared items (${block.deps.items.join(', ') || 'none'})`,
  )
  for (const record of block.deps.packages) {
    const where = record.resolved
      ? `${record.resolvedVia} -> ${record.resolved} (${record.filesRead} files)`
      : `UNRESOLVED via ${record.resolvedVia}: ${record.reason}`
    console.log(`    ${record.specifier}@${record.version ?? '?'} ${where}`)
  }
  if (block.deps.undeclared.length) {
    console.log(`    reached but undeclared: ${block.deps.undeclared.join(', ')}`)
  }
}

console.log(
  `\nblock-meta: ${names.length} blocks analyzed, ` +
    `${names.length - clientNames.length} server / ${clientNames.length} client` +
    `${unverifiedNames.length ? `, ${unverifiedNames.length} unproven` : ''}` +
    ` -> ${path.relative(DOCS, OUT)}`,
)
console.log(`packages walked: ${walkedPackages.join(', ') || 'none'}`)

// One line per warning would bury the run: a single missing transitive dependency
// can produce dozens. The full list is in block-meta.json either way, so the
// console gets a readable prefix and a count.
const WARNINGS_SHOWN = 12
for (const warning of allWarnings.slice(0, WARNINGS_SHOWN)) console.warn(`warn  ${warning}`)
if (allWarnings.length > WARNINGS_SHOWN) {
  console.warn(
    `warn  ... and ${allWarnings.length - WARNINGS_SHOWN} more, all recorded in block-meta.json`,
  )
}
