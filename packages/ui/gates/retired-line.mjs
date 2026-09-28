/**
 * The retired-line law: no trace of the old component library survives.
 *
 * Four repositories shipped the retired line together, each discovered it had to
 * come off separately, and the rule that governed the removal lived in prose in
 * four files. A rule in a document decays; this one already had. One repository's
 * own instructions said never import the library directly while three files did,
 * the build baked 126 KB of generated variables from it on every run, and that
 * generated file was the only definition site for every custom property the
 * repository's own stylesheet read.
 *
 * **The lockfile is read as a graph and never grepped.** Two failures make that
 * non-negotiable. A base64 integrity hash contains the characters a
 * package-specifier pattern admits, so a grep reports hits that are not packages.
 * And deleting a dependency line does not empty a lockfile while another package
 * declares the library, which is exactly what happened here: the retired line
 * declared it, so ten packages stayed reachable after the line was dropped and
 * only the move of the pin emptied the graph. The parser reads `importers:` and
 * `snapshots:` and never reads a `resolution:` value, which is where the hashes
 * are.
 *
 * **There is no carve-out for this gate's own prose.** The four copies each
 * excluded one file by path, because each named the library it was keeping out.
 * A rule that has to except itself is a rule whose exception is a file a later
 * commit renames, and the file it excepted was inside a consumer's repository
 * where a reader would come to change a gate. The gate now lives in the package,
 * so the text that names the library is not in the tree being scanned.
 *
 * Coverage is asserted: the run reads the whole repository below the declared
 * roots, every skipped directory is printed, and a run that read fewer files than
 * its floor fails rather than reporting a clean tree.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'

import { law } from './laws.mjs'
import { SKIP_DIRECTORIES, blankComments, finding, floor, read, walk } from './run.mjs'

/** The old line was built on Ant Design. */
const isVendorPackage = (name) => name === 'antd' || name.startsWith('@ant-design/')

/** Text files a trace could be in. The lockfile is a graph input, not a text input. */
const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|mdx|svg|ya?ml|toml)$/

/**
 * A module specifier naming the old line's packages, in every position a
 * specifier can take. The bare root matters: `from 'antd'` is reachable with no
 * subpath at all, and a pattern anchored on `from 'antd/` misses it.
 */
const MODULE_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)['"](?:antd(?:\/[^'"]*)?|@ant-design\/[^'"]*)['"]/

/** The files the old line shipped, by name. A `.gitignore` line naming one is a finding. */
const ARTEFACTS = ['antd-vars.css', 'bake-antd-css.mjs']

/** The old line's own theming symbols, which a half-finished removal leaves behind. */
const THEMING_SYMBOLS = /prismCssVarKey|prismBrandPacks|PrismThemeModeProvider/

/** The old line's custom-property namespace. The current contract is unprefixed. */
const OLD_NAMESPACE = /--prism-[a-z0-9-]*/

/** The old line's ruleset class. A pack and a mode are `[data-pack]` and `.dark` today. */
const OLD_RULESET = /\bprism-[a-z0-9]+(?:-[a-z0-9]+)*-(?:light|dark)\b/

export function run({ root, config }) {
  const l = law('retired-line')
  const findings = []
  const notes = []
  const manifestPath = config.manifest ?? 'package.json'
  const lockfilePath = config.lockfile ?? 'pnpm-lock.yaml'
  const documents = new Set(config.documents ?? ['README.md', 'AGENTS.md', 'CLAUDE.md'])
  const minFiles = config.minFiles ?? 12

  const files = walk(root, { skip: SKIP_DIRECTORIES, extensions: [TEXT] })
  floor('this run read', files.length, minFiles)

  let bytes = 0
  let commentOnly = 0
  for (const relative of files) {
    const source = read(root, relative)
    bytes += source.length
    const lines = source.split('\n')
    /*
     * Comments are blanked before the two families that name things rather than
     * use them: the custom-property namespace and the theming symbols. A comment
     * that says which property the old sheet declared is a historical record, and
     * the design system's own gate excludes its rule table for the same reason.
     * A *declaration* or a *read* of one is not excused, and blanking rather than
     * skipping the file is what keeps that distinction: a stylesheet whose rule is
     * commented out stops being a read and starts being a note, which is correct.
     *
     * The module specifier, the artefact name and the ruleset class are NOT
     * comment-blanked. A comment that tells a later implementer to import the old
     * package is an instruction rather than a record, and that is the family the
     * whole programme lost a reader to.
     */
    const codeLines = blankComments(source).split('\n')

    lines.forEach((line, index) => {
      const at = `${relative}:${index + 1}`
      const code = codeLines[index] ?? ''
      if (code.trim() === '' && line.trim() !== '') commentOnly += 1

      const specifier = line.match(MODULE_SPECIFIER)
      if (specifier) {
        findings.push(
          finding(at, 'module-imported', `"${specifier[0].trim()}" imports the retired line. A consumer installs ${'`@nanisoft/prism-ui`'}, which needs no part of it.`),
        )
      }
      for (const artefact of ARTEFACTS) {
        if (line.includes(artefact)) {
          findings.push(
            finding(at, 'generated-artefact', `this line names the retired line's artefact \`${artefact}\`, and the artefact and its generator are the same removal.`),
          )
        }
      }
      if (THEMING_SYMBOLS.test(code)) {
        findings.push(
          finding(at, 'theming-symbol', `this line names the retired line's theming symbol. The theme is two attributes on the document element and a blocking script the design system ships.`),
        )
      }
      const namespace = code.match(OLD_NAMESPACE)
      if (namespace) {
        findings.push(
          finding(at, 'custom-property', `\`${namespace[0]}\` is the retired line's custom-property namespace. The current contract is unprefixed (\`--background\`), so this read resolves to nothing.`),
        )
      }
      const ruleset = code.match(OLD_RULESET)
      if (ruleset) {
        findings.push(
          finding(at, 'ruleset-class', `\`${ruleset[0]}\` is the retired line's ruleset class. A pack and a mode are \`[data-pack]\` and \`.dark\` today.`),
        )
      }
      // The lockfile is read as a graph below and never as text, because a base64
      // integrity hash contains the characters every specifier pattern admits.
      if (relative === lockfilePath) {
        const parsed = parseLockfile(source)
        for (const [name, chain] of reachableVendors(parsed)) {
          findings.push(
            finding(
              lockfilePath,
              'reachable-package',
              `\`${name}\` is still reachable from importer \`${chain[0]}\`: ${chain.join(' -> ')}. Deleting a dependency line does not empty a lockfile while another package declares it.`,
            ),
          )
        }
        return
      }
      if (relative === manifestPath) {
        for (const name of vendorDependencies(JSON.parse(source))) {
          findings.push(
            finding(manifestPath, 'dependency-declared', `\`${name}\` is a live dependency. A consumer installs the design system, which brings its own foundation.`),
          )
        }
      }
      if (documents.has(relative) || relative.startsWith('docs/')) {
        const prose = line.match(/\bant[\s-]design\b/i) ?? line.match(/\bantd\b/)
        if (prose) {
          findings.push(
            finding(at, 'living-instruction', `"${prose[0]}" names the retired line in an instruction a later implementer will follow. A document that needs to say what the old line was belongs in a historical record.`),
          )
        }
      }
    })
  }

  if (!existsSync(path.join(root, lockfilePath))) {
    findings.push(
      finding(lockfilePath, 'missing', 'the lockfile does not resolve, so reachability cannot be read at all and the graph half of this law is unrun.'),
    )
  }

  notes.push(`${l.id}: ${findings.length} finding(s) across ${files.length} file(s) read, ${bytes} byte(s)`)
  notes.push(`${l.id}: ${commentOnly} comment-only line(s) were exempt from the namespace and theming-symbol families, and were not exempt from the specifier, artefact or ruleset families. A comment naming a property the old sheet declared is a record; a comment telling a later implementer which package to import is an instruction.`)
  notes.push(`${l.id}: ${lockfilePath} was read as a dependency graph and never text-scanned, because a base64 integrity hash contains the characters a specifier pattern admits.`)
  notes.push(`${l.id}: every directory this run did not read, printed so an exclusion is arguable:`)
  for (const directory of SKIP_DIRECTORIES) notes.push(`${l.id}:   ${directory}/`)
  notes.push(
    `${l.id}: this gate does not except itself, because it does not live in the tree it scans. The four copies each excluded one file by path for exactly that reason.`,
  )
  notes.push(
    `${l.id}: the honest limit: this is a text and dependency-graph scan. It cannot see a competitor reached through a package that renames it, and it cannot see a runtime that resolves one by string.`,
  )

  return { law: l, findings, notes }
}

/** Every dependency key naming the retired line, in any block that declares one. */
export function vendorDependencies(manifest) {
  const found = []
  for (const block of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    'overrides',
    'resolutions',
    'pnpm.overrides',
    'pnpm.resolutions',
  ]) {
    const declared = manifest?.[block]
    if (!declared || typeof declared !== 'object') continue
    for (const name of Object.keys(declared)) if (isVendorPackage(name)) found.push(name)
  }
  return found
}

const indentOf = (line) => line.length - line.trimStart().length
const unquote = (value) => value.trim().replace(/^'(.*)'$/, '$1').trim()

/**
 * Parse the lockfile into the two things reachability needs and nothing else.
 *
 * The line ending is normalised first, because a CRLF checkout leaves a carriage
 * return on the end of every line, so trimming a section name yields a name with
 * a character at the end of it. No section then matches, the graph comes back
 * empty, and an empty graph finds nothing and reports a clean pass. That is the
 * difference between a gate and a gate that is switched off.
 */
export function parseLockfile(text) {
  const importers = new Map()
  const snapshots = new Map()
  let section = null
  let importer = null
  let snapshot = null
  let depBlock = null
  let pending = null

  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trim() === '') continue
    const indent = indentOf(line)

    if (indent === 0) {
      section = line.replace(/:.*/, '')
      importer = null
      snapshot = null
      depBlock = null
      pending = null
      continue
    }

    if (section === 'importers') {
      if (indent === 2) {
        importer = unquote(line.trim().replace(/:$/, ''))
        importers.set(importer, new Map())
      } else if (indent === 4) {
        depBlock = line.trim().replace(/:$/, '')
      } else if (indent === 6) {
        pending = unquote(line.trim().replace(/:$/, ''))
      } else if (indent === 8) {
        // The resolved version is the seed of the walk. A `link:` version is a
        // workspace edge with no snapshot, so it seeds nothing.
        if (!line.trim().startsWith('version:') || pending == null) continue
        const version = unquote(line.trim().slice('version:'.length))
        if (version.startsWith('link:')) continue
        importers.get(importer)?.set(`${depBlock ?? 'dependencies'}/${pending}`, `${pending}@${version}`)
      }
      continue
    }

    if (section === 'snapshots') {
      if (indent === 2) {
        snapshot = unquote(line.trim().replace(/:(\s*\{\})?$/, ''))
        if (!snapshots.has(snapshot)) snapshots.set(snapshot, new Map())
      } else if (indent === 4) {
        depBlock = line.trim().replace(/:$/, '')
      } else if (indent === 6) {
        const colon = line.indexOf(':')
        const name = unquote(line.slice(0, colon))
        const version = unquote(line.slice(colon + 1))
        snapshots.get(snapshot)?.set(`${depBlock ?? 'dependencies'}/${name}`, `${name}@${version}`)
      }
    }
  }

  return { importers, snapshots }
}

/**
 * Split a `name@version(peer@1)` key at the `@` outside every parenthesised
 * suffix. `lastIndexOf` does not work: the suffixes are full of `@`.
 */
export function splitPackageKey(key) {
  let depth = 0
  for (let i = 1; i < key.length; i += 1) {
    const char = key[i]
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === '@' && depth === 0) return [key.slice(0, i), key.slice(i + 1)]
  }
  return [key, '']
}

/** Every retired-line package reachable from an importer, with the chain that reaches it. */
export function reachableVendors(lock) {
  const found = new Map()
  for (const [importer, direct] of lock.importers) {
    const queue = [...direct.values()].map((key) => ({ key, parent: null }))
    const seen = new Set()
    while (queue.length > 0) {
      const node = queue.shift()
      if (seen.has(node.key)) continue
      seen.add(node.key)
      const [name] = splitPackageKey(node.key)
      if (isVendorPackage(name) && !found.has(name)) {
        const chain = [importer]
        for (let cursor = node; cursor; cursor = cursor.parent) chain.push(splitPackageKey(cursor.key)[0])
        found.set(name, chain.reverse())
      }
      for (const target of lock.snapshots.get(node.key)?.values() ?? []) queue.push({ key: target, parent: node })
    }
  }
  return found
}
