/**
 * The view-only law's program: a consumer that names this gate owns no stylesheet,
 * no style tooling and no client module.
 *
 * The claim this holds. Prism is a view-only library: a consumer composes
 * published Components and Blocks, passes content and data as props, and every
 * style and every animation arrives through the one imported stylesheet. The
 * shape is not aspirational; the showcase applications ship it, and they ship it
 * with zero stylesheet files, zero style-tooling configurations, zero client
 * modules and zero inline style attributes.
 *
 * What each arm catches, and why each is separate.
 *
 *   1. a stylesheet      a `.css`, `.scss` or `.sass` file under the declared
 *                        source roots. The strongest signal, because a sheet is
 *                        never an accident: it is a file somebody created.
 *   2. style tooling     a `tailwind.config.*` or `postcss.config.*` anywhere at
 *                        the root or under the source roots, or one of the style
 *                        toolchains declared in the consumer's own manifest. A
 *                        configuration with no sheet still owns a build step the
 *                        design system already performed.
 *   3. a client module   a module whose first directive is `'use client'`. The
 *                        design system ships its own client boundaries where
 *                        interactivity is its business, so a consumer's own
 *                        directive is a boundary this repository took back.
 *   4. an inline style   a `style={` attribute in consumer source. An inline
 *                        style is a stylesheet of one element, and it wins the
 *                        cascade against everything the system publishes.
 *
 * This gate is named rather than universal, and that is the reconciliation with
 * the position the runtime-token-read gate records: whether a repository has a
 * client boundary is that repository's business, and a repository declares its
 * business by naming or not naming this gate. A consumer with a reason for a
 * boundary runs the other seven laws and not this one. A consumer that names
 * this one is holding itself to the showcase shape, and the failure message
 * says what that shape costs and returns: the fix is deletion, and the surface
 * goes upstream.
 *
 * Coverage is asserted: the declared roots must hold at least as many source
 * files as the consumer declares as its floor, so a renamed directory cannot
 * empty this run and report a repository that owns nothing.
 *
 * The honest limit, stated here rather than discovered: this is a lexical scan.
 * It reads lines, so a directive assembled at runtime or a style written by a
 * dependency the consumer owns is invisible to it, and a `style=` inside a
 * comment is a finding this gate accepts rather than resolves.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { law } from './laws.mjs'
import { CoverageError, finding, floor } from './run.mjs'

/** A stylesheet a consumer authored, in any of the dialects the toolchains serve. */
const STYLESHEET = /\.(css|scss|sass)$/

/** A style-tooling configuration, by the names those toolchains read. */
const TOOLING_CONFIG = /^(tailwind|postcss|sass)[.\-]/

/** The toolchains a view-only consumer has no surface for, as manifest dependencies. */
const TOOLING_PACKAGES = /^(tailwindcss|@tailwindcss\/|postcss|sass|less|stylus)(\/|$)/

/** The manifest keys that declare what a repository installs for itself. */
const DEPENDENCY_KEYS = ['dependencies', 'devDependencies']

export function run({ root, config }) {
  const l = law('view-only')
  const findings = []
  const notes = []
  const sourceRoots = config.sourceRoots ?? ['app', 'components', 'lib']
  const minFiles = config.minFiles ?? 5

  const missing = sourceRoots.filter((declared) => !existsSync(path.join(root, declared)))
  if (missing.length > 0) {
    throw new CoverageError(
      `${missing.length} of ${sourceRoots.length} declared source roots do not resolve: ${missing.join(', ')}.\n` +
        '  A gate that read nothing reports a repository that owns nothing, which is the cleanest possible\n' +
        '  reading of this law and the one this gate must never give by accident.',
    )
  }

  const skip = new Set(['node_modules', '.next', 'out', '.git', '.wrangler', '.source'])
  const files = []
  const sheets = []
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory() || statSync(full).isDirectory()) visit(full)
      else if (STYLESHEET.test(entry.name)) sheets.push(full)
      else if (/\.(tsx?|mjs|jsx?)$/.test(entry.name)) files.push(full)
    }
  }
  for (const declared of sourceRoots) visit(path.join(root, declared))
  floor('source file(s)', files.length, minFiles)

  const relative = (file) => path.relative(root, file).split(path.sep).join('/')

  for (const sheet of sheets) {
    findings.push(
      finding(
        relative(sheet),
        'view-only-stylesheet',
        'A stylesheet file is a surface this repository owns and the design system already owns. Delete it\n' +
          '      and request the surface upstream: a sheet that survives here is a repair the next release\n' +
          '      cannot deliver to this site.',
      ),
    )
  }

  /*
   * Style tooling, in the two places it declares itself: a configuration file at
   * the repository root or under the source roots, and a dependency in the
   * consumer's own manifest. The manifest arm reads only the top-level keys, so
   * a monorepo's sibling package never reaches it; the root a consumer names is
   * the root this gate holds.
   */
  const rootConfigs = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && TOOLING_CONFIG.test(entry.name))
    .map((entry) => entry.name)
  for (const configName of rootConfigs) {
    findings.push(
      finding(
        configName,
        'view-only-tooling',
        `"${configName}" is a style-tooling configuration. The design system performed this build step when\n` +
          '      it compiled the one stylesheet the consumer imports, so the configuration is a second build\n' +
          '      of a surface the system already shipped.',
      ),
    )
  }

  const manifestPath = path.join(root, 'package.json')
  if (existsSync(manifestPath)) {
    let manifest
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    } catch {
      manifest = null
    }
    if (manifest) {
      for (const key of DEPENDENCY_KEYS) {
        for (const name of Object.keys(manifest[key] ?? {})) {
          if (TOOLING_PACKAGES.test(name)) {
            findings.push(
              finding(
                `package.json (${key})`,
                'view-only-tooling',
                `"${name}" is a style toolchain this repository has no surface for. Every style and every\n` +
                  '      animation arrives compiled in the one imported stylesheet, so the toolchain can only\n' +
                  '      build a sheet this law has already refused.',
              ),
            )
          }
        }
      }
    }
  }

  let clientModules = 0
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const where = relative(file)
    if (/^\s*['"]use client['"]/m.test(source)) {
      clientModules += 1
      findings.push(
        finding(
          where,
          'view-only-client',
          'A `\'use client\'` directive is a client boundary this repository took back. The design system\n' +
            '      ships its own boundaries where interactivity is its business, so interactivity a consumer\n' +
            '      needs is a Component to request upstream, and the module here is deleted rather than\n' +
            '      repaired.',
        ),
      )
    }
    source.split('\n').forEach((line, index) => {
      if (line.includes('style={')) {
        findings.push(
          finding(
            `${where}:${index + 1}`,
            'view-only-inline-style',
            'An inline `style=` attribute is a stylesheet of one element, and it wins the cascade against\n' +
              '      everything the design system publishes. Name the surface upstream and pass props, so the\n' +
              '              next release repairs it everywhere at once.',
          ),
        )
      }
    })
  }

  notes.push(
    `${l.id}: ${findings.length} finding(s) across ${files.length} source file(s) and ${sheets.length} stylesheet(s), floor ${minFiles}; roots: ${sourceRoots.join(', ')}`,
  )
  notes.push(
    `${l.id}: ${clientModules} client module(s), ${rootConfigs.length} root style-tooling configuration(s). The showcase shape is\n` +
      '      zero of each, and a count above zero is the repository this run holds naming where it differs.',
  )
  notes.push(
    `${l.id}: every directory this run did not read, printed so an exclusion is arguable: ${[...skip].sort().join(', ')}`,
  )
  notes.push(
    `${l.id}: the honest limit: this is a lexical scan. A directive assembled at runtime, a style written by\n` +
      '      an owned dependency, and a `style=` inside a comment are beyond it, and the first two are the\n' +
      '      runtime-token-read and hidden-state gates\' territory rather than this one\'s.',
  )

  return { law: l, findings, notes }
}
