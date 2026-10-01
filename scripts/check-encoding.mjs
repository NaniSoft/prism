/**
 * No file in the authored tree begins with a byte order mark.
 *
 * A BOM is invisible in every tool a person uses to write a file and fatal in
 * the ones that read one. It is not a style question, it is a parsing question,
 * and this gate exists because it has bitten this repository twice and no other
 * gate saw either time.
 *
 * The first time was six `block.json` files in the 2026-09 expansion: a JSON
 * parser accepted them and `JSON.parse` did not, so the catalogue read a slug of
 * `﻿package` and the item silently vanished from a list rather than failing
 * loudly. The second time was a Component's `.mdx` and its Demo, written with a
 * byte order mark, where the frontmatter parser did not recognise the opening
 * `---` and returned an empty `slug` and an empty `title`. Every other gate
 * passed that file: it has a JSDoc-bearing module, it has a Demo beside it, its
 * strings are all props, and it joins the catalogue cleanly. The only thing that
 * noticed was a site test asserting the frontmatter, which is a test about
 * content rather than a gate about encoding, so the finding arrived as seventeen
 * unrelated failures in two files instead of one line naming one file.
 *
 * **The rule is one byte at offset zero of every authored text file.** The trees
 * are listed rather than globbed so that a file type nobody thought about is a
 * decision rather than an accident, and so that a generated tree is excluded on
 * purpose: `dist`, `out` and the derived `registry.json` are written by a build
 * and are not authored here, and a gate that failed on a build artefact would be
 * a gate that fails for reasons no author controls.
 *
 * What it deliberately does not do is normalise line endings, strip a BOM from a
 * file, or rewrite anything. This gate reports, and the fix is a person deleting
 * three bytes, because a tool that silently repairs a file is a tool whose output
 * differs from its input and this repository has a rule about that: a comment that
 * names a fact is a record, and a script that rewrites a file without saying so is
 * neither.
 *
 * It is a root gate rather than a package one because the failure is invisible to
 * whichever package happens to read the file next, and a defect that surfaces as
 * an unrelated failure somewhere else belongs in the place that can see all of it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

/** Every tree a person writes into. A file type not here is not a decision. */
const ROOTS = [
  'apps/site/src',
  'apps/site/content',
  'apps/site/items',
  'apps/site/scripts',
  'apps/site/test',
  'apps/site/e2e',
  'apps/site/worker',
  'packages/ui/src',
  'packages/ui/gates',
  'packages/ui/scripts',
  'packages/ui/test',
  'packages/tokens/src',
  'packages/tokens/scripts',
  'packages/llms/src',
  'packages/llms/scripts',
  'packages/llms/test',
  'packages/mcp-server/src',
  'packages/mcp-server/test',
  'scripts',
  'docs',
]

/** The root documents, which are files rather than trees. */
const FILES = [
  'README.md',
  'DESIGN.md',
  'PRODUCT.md',
  'CONTEXT.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'MIGRATION.md',
  'package.json',
  'turbo.json',
  'pnpm-workspace.yaml',
]

const EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.cjs', '.js', '.json', '.md', '.mdx', '.css', '.txt', '.yml', '.yaml'])

/** Directories that are build output rather than authored source. */
const GENERATED = new Set(['node_modules', 'dist', 'out', '.next', '.turbo', 'coverage', 'public'])

const findings = []
let scanned = 0

function read(file) {
  const ext = path.extname(file)
  if (!EXTENSIONS.has(ext)) return
  scanned += 1
  const buffer = readFileSync(file)
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    findings.push(file)
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (GENERATED.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
    } else if (entry.isFile() && statSync(full).size > 0) {
      read(full)
    }
  }
}

for (const root of ROOTS) {
  try {
    if (statSync(root).isDirectory()) walk(root)
  } catch {
    /* a root this checkout does not have is not a finding */
  }
}
for (const file of FILES) {
  try {
    read(file)
  } catch {
    /* likewise */
  }
}

if (findings.length > 0) {
  console.error(`encoding: ${findings.length} file(s) begin with a byte order mark, which a parser reads as content and a person does not see:`)
  for (const file of findings) {
    console.error(`  ${file}`)
  }
  console.error('')
  console.error('Delete the first three bytes of each file. Nothing in this repository rewrites a file for you,')
  console.error('because a script that repairs what it is auditing is a script whose output differs from its input.')
  process.exit(1)
}

console.log(`encoding: no byte order mark in ${scanned} file(s) across ${ROOTS.length} tree(s) and ${FILES.length} root file(s)`)
