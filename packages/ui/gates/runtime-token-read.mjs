/**
 * The token-read law's runtime form: no token is read at runtime.
 *
 * The clause was written about canvas, because a canvas reads a computed style
 * from one element and paints it into pixels. The pack is a runtime attribute on
 * an ancestor, so a scoped boundary hands that read the pack's light values on a
 * dark page, and a painted pixel does not move when the pack beneath it changes.
 * A reader with dark mode stored and a reader without it are served different
 * colours from the same markup, and nothing in the rendered page says so.
 *
 * It generalises from canvas to any runtime token read, and it holds its shape
 * from the original clause: **a read with a hard-coded fallback is a read that
 * cannot fail, and a read that cannot fail hides its own failure.** The token
 * build publishes the replacement, which is a token-driven inline replacement
 * painted in the HTML: it resolves through the cascade, holds every pack, and
 * ships no client code. So the fix is deletion rather than repair, and this gate
 * asserts the deletion.
 *
 * What this gate does not do is forbid client code. Three of the four consumer
 * repositories ship none and one ships exactly one component for a reason its own
 * gate explains; whether a given repository has a client boundary is that
 * repository's business, and a gate that forbade one would be a law about one
 * site's structure pretending to be a law about all of them. What is universal is
 * the read, because a read resolves once and paints a value that never follows the
 * cascade.
 *
 * Coverage is asserted: the declared roots must hold at least as many source files
 * as the consumer declares as its floor, so a renamed directory cannot empty this
 * run and report a repository that reads nothing.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { law } from './laws.mjs'
import { CoverageError, finding, floor } from './run.mjs'

/** Every way a program resolves a custom property from a live element. */
const RUNTIME_READ = /getPropertyValue|getComputedStyle|documentElement\.style\.|style\.setProperty/

/** The retired line's runtime read helpers, which a half-finished removal leaves behind. */
const RETIRED_READS = /prismCssVarKey|prismBrandPacks|PrismThemeModeProvider/

/** How a canvas or an inline replacement is painted, for the message that names the fix. */
const PAINTS = /getContext\(|<canvas|document\.createElement\(['"]canvas['"]\)/

export function run({ root, config }) {
  const l = law('runtime-token-read')
  const findings = []
  const notes = []
  const sourceRoots = config.sourceRoots ?? ['app', 'components', 'lib']
  const minFiles = config.minFiles ?? 5

  const missing = sourceRoots.filter((declared) => !existsSync(path.join(root, declared)))
  if (missing.length > 0) {
    throw new CoverageError(
      `${missing.length} of ${sourceRoots.length} declared source roots do not resolve: ${missing.join(', ')}.\n` +
        '  A gate that read nothing reports a repository that reads nothing, which is the cleanest possible\n' +
        '  reading of this law and the one this gate must never give by accident.',
    )
  }

  const skip = new Set(['node_modules', '.next', 'out', '.git', '.wrangler', '.source'])
  const files = []
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory() || statSync(full).isDirectory()) visit(full)
      else if (/\.(tsx?|mjs|jsx?)$/.test(entry.name)) files.push(full)
    }
  }
  for (const declared of sourceRoots) visit(path.join(root, declared))
  floor('source file(s)', files.length, minFiles)

  const relative = (file) => path.relative(root, file).split(path.sep).join('/')
  let clientModules = 0

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const where = relative(file)
    if (/^\s*['"]use client['"]/m.test(source)) clientModules += 1

    source.split('\n').forEach((line, index) => {
      const read = line.match(RUNTIME_READ)
      if (read) {
        const paints = PAINTS.test(source)
        findings.push(
          finding(
            `${where}:${index + 1}`,
            'runtime-token-read',
            `"${read[0]}" resolves a token from a live element. ${paints ? 'A canvas reads it once and paints\n' +
              '      pixels, so a scoped boundary hands it the light values on a dark page and a painted pixel does not\n' +
              '      move when the pack beneath it does. ' : ''}A read with a hard-coded fallback is a read that cannot\n` +
              '      fail, and a read that cannot fail hides its own failure.',
          ),
        )
      }
      const retired = line.match(RETIRED_READS)
      if (retired) {
        findings.push(
          finding(
            `${where}:${index + 1}`,
            'retired-runtime-read',
            `"${retired[0]}" is the retired line's runtime read helper. The theme is two attributes on the document\n` +
              '      element and a blocking script the design system ships.',
          ),
        )
      }
    })
  }

  notes.push(
    `${l.id}: ${findings.length} finding(s) across ${files.length} source file(s) read, floor ${minFiles}; roots: ${sourceRoots.join(', ')}`,
  )
  notes.push(
    `${l.id}: ${clientModules} module(s) carry a client directive. Whether this repository has a client boundary at\n` +
      '      all is its own business; what is universal is the read, because a read resolves once and a resolved\n' +
      '      value does not follow the cascade.',
  )
  notes.push(
    `${l.id}: every directory this run did not read, printed so an exclusion is arguable: ${[...skip].sort().join(', ')}`,
  )
  notes.push(
    `${l.id}: the honest limit: this is a lexical scan. It cannot see a computed \`import()\` or a \`require\` assembled at\n` +
      '      runtime, and it does not attempt to decide whether a read it found is load-bearing.',
  )

  return { law: l, findings, notes }
}
