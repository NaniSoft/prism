/**
 * The prism-llms generator.
 *
 * One build-fresh `dist/` serves three lanes:
 * - `data.json`   the PrismDocsStore projection, bundled by the MCP server
 * - `llms.txt` + `llms-full.txt`   the agent reference, one group per Section
 * - `prism-skill.md`   the one-screen agent fast path
 * - `md/`   the per-item Markdown mirror the Worker serves at `/<page>.md`
 *
 * File-is-truth per artifact: the catalogue entry, the hand-written MDX page,
 * `@nanisoft/prism-ui`'s emitted declarations, the verbatim demo source and the
 * emitted token cascade. A published package's changelog is the fourth kind of
 * file-is-truth: the generated page in the content tree is a byte-for-byte copy
 * of the package's own `CHANGELOG.md`, and this builder carries those bytes
 * rather than a reading of the package taken down a second path. Emit is
 * deterministic and byte-stable; `dist/` is never committed and the build starts
 * from scratch.
 *
 * `emit(outDir)` writes only the corpus so the drift gate can emit twice and
 * byte-compare. Run `node scripts/build.mjs` to compile the library and emit.
 *
 * The content walk lives here and it recurses, because a page's place in the
 * tree is the only thing that says where it is published. See
 * `collectContentPages`. It reads two extensions, for the same reason: the
 * Changelogs Section holds files that are copied rather than authored.
 *
 * The published packages, and the route each one's changelog belongs at, are
 * read through the site's own rule,
 * `apps/site/scripts/published-packages.mjs`, which is the same module the copy
 * step and the content-join gate read. Three consumers have to agree about what
 * a published package is and what its route is, so the rule is stated once. A
 * published package with a changelog and no route throws below, which is the
 * gate the reference design system does not have.
 *
 * An Item's documentation and its Demo are read through the site's own rule,
 * `apps/site/scripts/item-content.mjs`, rather than through a path restated
 * here. An Item is filed in one folder, with its documentation and its Demo as
 * siblings, and the folders in between are the site's business. Nothing in this
 * file holds a path to either, which is what keeps the Corpus reading the same
 * Items the site renders once the tree grows folders under them.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  readPublishedChangelogs,
  splitChangelog,
} from '../../../apps/site/scripts/published-packages.mjs'
import { readItemContent } from '../../../apps/site/scripts/item-content.mjs'

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..')
const UI_ROOT = path.join(REPO_ROOT, 'packages', 'ui')
const TOKENS_ROOT = path.join(REPO_ROOT, 'packages', 'tokens')
const SITE_ROOT = path.join(REPO_ROOT, 'apps', 'site')
const ITEMS_ROOT = path.join(SITE_ROOT, 'items')
const CONTENT_ROOT = path.join(SITE_ROOT, 'content')
const DEMOS_ROOT = path.join(SITE_ROOT, 'src', 'demos')

const BASE_URL = 'https://prism.nanisoft.com'
const KIND_SEGMENT = { component: 'components', block: 'blocks', page: 'pages' }
const KIND_RANK = { component: 0, block: 1, page: 2 }
/**
 * The extensions the content tree is read in: the one it is authored in, and
 * the one it is copied in.
 *
 * The Changelogs Section is the reason there are two. A published package's
 * `CHANGELOG.md` is copied into the content tree byte for byte so the site's
 * text and the package's text are the same bytes, which means it arrives as
 * plain Markdown. Reading only `.mdx` would leave every changelog out of
 * `llms.txt`, out of `llms-full.txt`, out of the Store and out of the tool that
 * answers for a breaking change, with a green build: the same omission, one
 * extension down.
 */
const CONTENT_EXTENSIONS = ['.mdx', '.md']
const PACKS = ['default', 'blush', 'mint', 'lavender', 'sky', 'peach']
const MODES = ['light', 'dark']
/**
 * The content Section read after the catalogue rather than before it.
 *
 * One named exception rather than a second list of Sections: the Changelogs
 * Section is history, and history is read after the thing it is the history of.
 * A Section with no exception joins the prose group, which is the default a
 * reader expects, and `STORE_SECTIONS` remains the only list of Sections.
 */
const TRAILING_SECTION = 'changelogs'

/**
 * The corpus artifacts `emit()` owns. Removing only these keeps tsc's compiled
 * library when `emit()` is called against `dist/` directly.
 */
const CORPUS_ARTIFACTS = ['md', 'data.json', 'llms.txt', 'llms-full.txt', 'prism-skill.md']

async function readText(file) {
  try {
    return (await readFile(file, 'utf8')).replace(/\r\n/g, '\n')
  } catch {
    return undefined
  }
}

async function readJson(file) {
  const text = await readText(file)
  return text === undefined ? undefined : JSON.parse(text)
}

/**
 * Every content page under `root`, at any depth, with its route taken from
 * where it sits in the tree.
 *
 * The walk recurses. Reading one directory and filtering to `.mdx` is how a
 * page one folder deeper used to vanish from `llms.txt`, from `llms-full.txt`,
 * from the Store and from every tool, with a green build. Nesting content is a
 * legitimate thing to do, so the depth of a page cannot decide whether it
 * exists.
 *
 * A Section that is declared and not on disk throws. Skipping it would delete a
 * whole Section from every agent surface without a word, which is the same
 * failure by omission one level up.
 *
 * `index.mdx` is a Section's landing page rather than one of its pages, so it
 * stays out at every level, exactly as it was when only the top level was read.
 */
export async function collectContentPages(root, sections) {
  const pages = []
  for (const section of sections) {
    const dir = path.join(root, section)
    const found = await walkContent(dir, section)
    if (found === undefined) {
      throw new Error(
        `prism-llms: the content Section '${section}' is declared but ${dir} is not a directory`,
      )
    }
    for (const relative of found) {
      const { route, extension } = splitContentPath(relative)
      if (route.endsWith('/index') || route === 'index') continue
      const slug = route.slice(section.length + 1)
      pages.push({
        file: path.join(root, ...relative.split('/')),
        extension,
        section,
        slug,
        route,
        url: `/${route}`,
        mirrorPath: `md/${route}.md`,
      })
    }
  }
  return pages
}

/**
 * A content file's route and the extension it was read at.
 *
 * The route is the path without its extension, and the extension is returned
 * rather than assumed because there are two of them: the walk must not slice a
 * fixed number of characters off a filename whose length it guessed.
 */
function splitContentPath(relative) {
  const extension = CONTENT_EXTENSIONS.find((candidate) => relative.endsWith(candidate))
  if (extension === undefined) {
    throw new Error(`prism-llms: ${relative} has none of the content extensions`)
  }
  return { route: relative.slice(0, -extension.length), extension }
}

/**
 * Content files under `dir`, depth first and name sorted, as paths relative to
 * the content root. `undefined` when the directory cannot be read, so a
 * missing Section and a missing file are told apart from an empty Section.
 */
async function walkContent(dir, prefix) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return undefined
  }
  const found = []
  for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = `${prefix}/${entry.name}`
    if (entry.isDirectory()) {
      const nested = await walkContent(path.join(dir, entry.name), relative)
      if (nested === undefined) return undefined
      found.push(...nested)
    } else if (
      entry.isFile() &&
      CONTENT_EXTENSIONS.some((extension) => entry.name.endsWith(extension))
    ) {
      found.push(relative)
    }
  }
  return found
}

/** Load the compiled library modules `emit()` uses. */
async function loadLib() {
  const [markdown, extractor, demos, store] = await Promise.all([
    import('../dist/markdown.js'),
    import('../dist/extractor.js'),
    import('../dist/demo-graph.js'),
    import('../dist/store.js'),
  ])
  return { markdown, extractor, demos, store }
}

/** `packages/ui/src/a.tsx` to `packages/ui/dist/a.d.ts`. */
function dtsPath(source) {
  return path.join(UI_ROOT, 'dist', source.replace(/^src\//, '').replace(/\.tsx?$/, '.d.ts'))
}

/**
 * Read a declaration file plus the relative files it re-exports from. A Block's
 * `index.tsx` re-exports from its sibling, so one hop reaches the declaration.
 */
async function readDeclarations(file) {
  const text = await readFile(file, 'utf8')
  const dir = path.dirname(file)
  const parts = [text.replace(/\r\n/g, '\n')]
  for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const base = path.resolve(dir, match[1])
    for (const candidate of [`${base}.d.ts`, `${base}.d.mts`, path.join(base, 'index.d.ts')]) {
      const part = await readText(candidate)
      if (part !== undefined) {
        parts.push(part)
        break
      }
    }
  }
  return parts.join('\n')
}

function itemUrl(item) {
  return `/${KIND_SEGMENT[item.kind]}/${item.slug}`
}

function kindLabel(kind) {
  return kind === 'component' ? 'Component' : kind === 'block' ? 'Block' : 'Page'
}

/** The documented seam line for an item whose props are an upstream primitive's. */
function seamLine(item, declaration) {
  if (/Base UI/.test(declaration)) {
    return `_No additional props beyond the internal Base UI \`${item.name}\` primitive._`
  }
  const element = /ComponentProps<'([^']+)'>/.exec(declaration)
  if (element) {
    return `> Extends: the native \`<${element[1]}>\` element. No additional Prism-specific props.`
  }
  return '_No additional props are declared for this item._'
}

/** The public Prism value exports a declaration imports from relative files. */
function declarationDependencyNames(declaration) {
  const names = new Set()
  const pattern = /(?:^|\n)\s*import\s+(type\s+)?\{([^}]*)\}\s+from\s+['"][^'"]+['"]/g
  let match
  while ((match = pattern.exec(declaration)) !== null) {
    if (match[1]) continue
    for (const raw of (match[2] ?? '').split(',')) {
      const trimmed = raw.trim()
      if (!trimmed || trimmed.startsWith('type ')) continue
      const name = trimmed.split(/\s+as\s+/)[0]?.trim()
      if (name) names.add(name)
    }
  }
  return [...names]
}

/**
 * The public Prism exports an item composes: the union of its demo imports and
 * its emitted declaration imports, restricted to the checked catalogue.
 */
function composedNames(item, demo, declaration, lib, publicExports) {
  const names = new Set()
  if (demo) for (const name of lib.demos.scanPrismImports(demo)) names.add(name)
  for (const name of declarationDependencyNames(declaration)) names.add(name)
  return [...names]
    .filter((name) => name !== item.name && publicExports.has(name))
    .sort()
}

/** Build the item's props or composition section from its declaration. */
async function itemSections(item, demo, declaration, lib, publicExports, byName) {
  const extracted = lib.extractor.extractExports(declaration, item.exports)

  if (item.kind === 'component') {
    const props = lib.markdown.renderPropsSection(extracted, seamLine(item, declaration))
    return { props, composition: undefined }
  }

  const dependencies = composedNames(item, demo, declaration, lib, publicExports).filter(
    (name) => byName.has(name),
  )
  const composition = lib.markdown.renderCompositionSection([
    { key: 'exports', value: item.exports.join(', '), description: `the public runtime names this ${kindLabel(item.kind)} promises` },
    { key: 'source', value: `packages/ui/${item.source}`, description: `the file this ${kindLabel(item.kind)} is defined in` },
    { key: 'dependencies', value: dependencies.join(', ') || '\u2014', description: 'the public Prism exports this item composes' },
  ])
  return { props: undefined, composition }
}

/**
 * Cross-references to the other Blocks and Pages the item composes, derived
 * from its demo imports and its emitted declaration imports.
 */
function crossReferences(item, demo, declaration, lib, byName, publicExports) {
  const names = composedNames(item, demo, declaration, lib, publicExports)
  const references = { blocks: [], pages: [] }
  const links = { blocks: [], pages: [] }
  for (const name of names) {
    const target = byName.get(name)
    if (!target) continue
    if (target.kind === 'block') {
      references.blocks.push(name)
      links.blocks.push({ name, href: `${BASE_URL}${itemUrl(target)}.md` })
    } else if (target.kind === 'page') {
      references.pages.push(name)
      links.pages.push({ name, href: `${BASE_URL}${itemUrl(target)}.md` })
    }
  }
  references.blocks.sort()
  references.pages.sort()
  const section = lib.markdown.renderCrossReferences([
    { heading: 'Blocks', links: links.blocks.sort((a, b) => a.name.localeCompare(b.name)) },
    { heading: 'Pages', links: links.pages.sort((a, b) => a.name.localeCompare(b.name)) },
  ])
  return { references, section }
}

/** The PrismTokensProjection: the resolved semantic set and the bound scales. */
async function tokensProjection() {
  const dist = path.join(TOKENS_ROOT, 'dist')
  const themesIndex = (await readJson(path.join(dist, 'themes.json'))) ?? []

  const themes = []
  for (const pack of PACKS) {
    for (const mode of MODES) {
      const file =
        pack === 'default'
          ? path.join(dist, `tokens.${mode}.json`)
          : path.join(dist, 'themes', pack, `tokens.${mode}.json`)
      const raw = (await readJson(file)) ?? {}
      const semantic = Object.keys(raw)
        .sort()
        .map((token) => ({ token, value: String(raw[token]?.value ?? '') }))
      themes.push({ pack, mode, semantic })
    }
  }

  const css = (await readText(path.join(dist, 'theme.css'))) ?? ''
  const staticBlock = /@theme\s+static\s*\{([\s\S]*?)\}/.exec(css)
  const declarations = [...(staticBlock?.[1] ?? '').matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)]
  const scales = {
    motion: [],
    typography: [],
    spacing: [],
    shadow: [],
    breakpoint: [],
    container: [],
  }
  for (const match of declarations) {
    const token = match[1] ?? ''
    const value = (match[2] ?? '').trim()
    let group = null
    if (token === 'spacing' || token.startsWith('spacing-')) group = 'spacing'
    else if (token.startsWith('font-') || token.startsWith('text-')) group = 'typography'
    else if (token.startsWith('leading-') || token.startsWith('tracking-')) group = 'typography'
    else if (token.startsWith('duration-')) group = 'motion'
    else if (token.startsWith('ease-')) group = 'motion'
    else if (token.startsWith('shadow-')) group = 'shadow'
    else if (token.startsWith('breakpoint-')) group = 'breakpoint'
    else if (token.startsWith('container-')) group = 'container'
    if (!group) continue
    const entry = { token, value }
    if (group === 'motion' && token.startsWith('duration-')) {
      entry.binding = `transition-${token}`
    }
    scales[group].push(entry)
  }
  for (const group of Object.keys(scales)) {
    scales[group].sort((a, b) => a.token.localeCompare(b.token))
  }

  return {
    packs: PACKS,
    modes: MODES,
    themes,
    scales,
  }
}

function prismSkill(store) {
  const counts = { component: 0, block: 0, page: 0 }
  for (const item of store.items) counts[item.kind] += 1
  return `# Prism agent skill

Prism is NaniSoft's design system: design tokens, a React component library, a
documentation site, and this agent surface. This is the fast path. The index is
[\`/llms.txt\`](${BASE_URL}/llms.txt) and every page in full is
[\`/llms-full.txt\`](${BASE_URL}/llms-full.txt); both are generated from the
checked catalogue and the authored pages.

## Start here

\`\`\`tsx
import '@nanisoft/prism-ui/styles.css'

import { PrismProvider, PrismThemeScript } from '@nanisoft/prism-ui/provider'
\`\`\`

Import the one stylesheet once. The provider is optional: the declarative axes
are \`data-pack\` on \`<html>\` and the \`dark\` class for mode.

## Import contract

- Components: \`@nanisoft/prism-ui/components/<slug>\`
- Blocks: \`@nanisoft/prism-ui/blocks/<slug>\`
- Pages: \`@nanisoft/prism-ui/pages/<slug>\`

Compound parts stay inside their module. Base UI and every internal path are
never a consumer import.

## MCP

The read-only MCP endpoint is \`${BASE_URL}/mcp\`. It exposes nine tools:
\`list_items\`, \`get_item_doc\`, \`get_item_props\`, \`get_item_source\`,
\`get_theme_doc\`, \`list_pages\`, \`get_page\`, \`search_docs\` and
\`get_changelog\`.

## Truth rules

- Prism is the one source of truth. A consumer composes; it never writes CSS and
  never overrides a style.
- There is no override path. When Prism lacks a component, token or variant,
  request it upstream.
- Generated code imports from \`@nanisoft/prism-ui\` only.

## This corpus

Generated from the catalogue and the authored pages: ${counts.component}
Components, ${counts.block} Blocks and ${counts.page} Pages, plus the guides,
Foundations, Content and Changelogs pages. The Changelogs pages are each
published package's own changelog, byte for byte; \`get_changelog\` returns one
package's, optionally one version of it.
`
}

/**
 * Emit the whole corpus into `outDir`. Deterministic: the same inputs produce
 * the same bytes. Returns the sorted relative file list and the store.
 *
 * `options.contentRoot` points the page walk at another content tree, which is
 * how the test lane proves a nested page reaches every artifact without
 * nesting a page in the site the reader sees. `options.packages` is the same
 * idea for the published packages: a fixture tree declares which packages owe it
 * a route, so the throw below is provable without publishing a package.
 */
export async function emit(outDir, options = {}) {
  const lib = await loadLib()
  const { markdown, store: storeLib } = lib
  const contentRoot = options.contentRoot ?? CONTENT_ROOT
  const packages = options.packages ?? (await readPublishedChangelogs(REPO_ROOT))

  for (const artifact of CORPUS_ARTIFACTS) {
    await rm(path.join(outDir, artifact), { recursive: true, force: true })
  }

  const uiPackage = (await readJson(path.join(UI_ROOT, 'package.json'))) ?? {}
  const catalogue = (await import('@nanisoft/prism-ui/catalog')).buildCatalog()
  const byName = new Map(catalogue.map((entry) => [entry.name, entry]))
  const publicExports = new Set(catalogue.flatMap((entry) => entry.exports))
  // Read once per emit, by the rule the site, this builder and the gate share.
  const itemContent = new Map(
    (await readItemContent(ITEMS_ROOT, DEMOS_ROOT)).map((item) => [item.slug, item]),
  )
  const written = new Set()
  const writeArtifact = async (relative, text) => {
    const file = path.join(outDir, relative)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, text)
    written.add(relative.split(path.sep).join('/'))
  }

  /* Items ---------------------------------------------------------------- */

  const orderedItems = [...catalogue].sort(
    (a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.name.localeCompare(b.name),
  )
  const items = []
  for (const item of orderedItems) {
    const segment = KIND_SEGMENT[item.kind]
    const content = itemContent.get(item.slug)
    if (content === undefined) {
      throw new Error(
        `prism-llms: catalog item '${item.name}' has no documentation file anywhere under ` +
          `${ITEMS_ROOT}, which is where an Item's documentation and its Demo live`,
      )
    }
    const raw = await readText(content.doc)
    if (raw === undefined) {
      throw new Error(
        `prism-llms: the documentation for catalog item '${item.name}' is at ` +
          `${content.doc} and could not be read`,
      )
    }
    if (!item.description || item.description.trim().length === 0) {
      throw new Error(`prism-llms: catalog item '${item.name}' has an empty description`)
    }
    const { body } = markdown.parseMdx(raw)
    const proseBody = markdown.stripSection(markdown.stripMdxMechanics(body), 'Usage')
    const importLine = `import { ${item.exports.join(', ')} } from '@nanisoft/prism-ui/${segment}/${item.slug}'`

    const demo = content.demo === null ? undefined : await readText(content.demo)
    let example
    if (demo !== undefined) {
      const title = markdown.demoTitle(demo, `${item.name} example`)
      example = { title, code: demo }
    }

    const declarationFile = dtsPath(item.source)
    const declaration = existsSync(declarationFile) ? await readDeclarations(declarationFile) : ''

    const { props, composition } = await itemSections(
      item,
      demo,
      declaration,
      lib,
      publicExports,
      byName,
    )
    const { references, section: crossRefs } = crossReferences(item, demo, declaration, lib, byName, publicExports)
    const demoSection = example ? markdown.renderDemoSection(example.title, example.code) : undefined

    const doc = markdown.assembleDoc([
      `# ${item.name}`,
      item.description,
      markdown.fence(importLine, 'tsx'),
      proseBody,
      demoSection,
      props ?? composition,
      crossRefs,
    ])

    await writeArtifact(path.join('md', segment, `${item.slug}.md`), doc)

    items.push({
      id: item.slug,
      slug: item.slug,
      kind: item.kind,
      name: item.name,
      category: item.category,
      status: item.status,
      description: item.description,
      url: itemUrl(item),
      mirror: `${itemUrl(item)}.md`,
      source: item.source,
      exports: item.exports,
      importLine,
      doc,
      ...(props !== undefined ? { props } : {}),
      ...(composition !== undefined ? { composition } : {}),
      ...(example !== undefined ? { example } : {}),
      references,
    })
  }

  /* Changelogs ------------------------------------------------------------ */

  /*
   * One Store entry per published package that ships a changelog, read from the
   * generated file the site renders rather than from the package.
   *
   * Reading the generated file is the point. The site's text and the package's
   * text are the same bytes because the file is a byte-for-byte copy, and the
   * Corpus carries those bytes rather than a reading of the package taken down a
   * second path that could disagree with the first. The package list supplies
   * the identity and the route; the file supplies everything else.
   *
   * A package that ships a changelog and has no route throws here rather than
   * being skipped. This is the build-time half of the gate the reference design
   * system has no equivalent of: it publishes reader-facing changelog pages and
   * can lose all of them with its continuous integration green, because nothing
   * in it knows a package owes a route. This builder runs in the site's
   * `prebuild`, so a missing route fails `pnpm build` and not only `pnpm check`.
   */
  const walkedPages = await collectContentPages(contentRoot, storeLib.STORE_SECTIONS)
  const changelogs = []
  for (const entry of packages) {
    const page = walkedPages.find((candidate) => candidate.url === entry.route)
    if (page === undefined) {
      throw new Error(
        `prism-llms: the published package ${entry.name} ships a changelog at ${entry.changelog} and ` +
          `the content tree publishes no route for it at ${entry.route}, so no reader and no agent can ` +
          'reach it. Run the site copy step, or the file it owns has been deleted.',
      )
    }
    const text = await readText(page.file)
    if (text === undefined || text.trim().length === 0) {
      throw new Error(
        `prism-llms: the changelog route ${entry.route} is at ${page.file} and holds no text, so ` +
          `${entry.name} is recorded as having published nothing`,
      )
    }
    const { title, releases } = splitChangelog(text)
    if (title !== entry.name) {
      throw new Error(
        `prism-llms: the changelog generated for ${entry.name} at ${page.file} leads with ` +
          `'${title}', so a reader and an agent are shown a route named for a different package. The ` +
          'file is the package\'s own bytes, so the package\'s changelog is what to fix.',
      )
    }
    changelogs.push({
      package: entry.name,
      slug: entry.slug,
      route: entry.route,
      title,
      versions: releases.map((release) => release.version),
      releases,
      text,
    })
  }
  const changelogByRoute = new Map(changelogs.map((entry) => [entry.route, entry]))

  /* Pages ---------------------------------------------------------------- */

  const pages = []
  for (const page of walkedPages) {
    const raw = await readText(page.file)
    if (raw === undefined) {
      throw new Error(`prism-llms: the page at ${page.file} was walked and then could not be read`)
    }
    const changelog = changelogByRoute.get(page.url)
    if (changelog !== undefined) {
      /*
       * A generated page is published whole. Its bytes are the package's bytes,
       * so nothing is prepended, stripped or re-levelled: the mirror file, the
       * Store's `markdown` and the tool's text are the same string the site
       * rendered. A changelog assembled from its own parts would be a fourth
       * copy of the same prose, and a copy is what drifts.
       */
      await writeArtifact(page.mirrorPath, changelog.text)
      pages.push({
        id: `${page.section}/${page.slug}`,
        slug: page.slug,
        section: page.section,
        title: changelog.title,
        // The versions the file records, which is its own content rather than a
        // sentence about it, and is what an agent scanning `llms.txt` needs.
        description: changelog.versions.join(', '),
        url: page.url,
        markdown: changelog.text,
        mirror: `${page.url}.md`,
      })
      continue
    }
    const { data, body } = markdown.parseMdx(raw)
    const title = data.title
    if (!title) throw new Error(`prism-llms: the page at ${page.route} has no title`)
    const description = data.description ?? ''
    const markdownBody = markdown.assembleDoc([
      `# ${title}`,
      description,
      markdown.stripMdxMechanics(body),
    ])
    await writeArtifact(page.mirrorPath, markdownBody)
    pages.push({
      id: `${page.section}/${page.slug}`,
      slug: page.slug,
      section: page.section,
      title,
      description,
      url: page.url,
      markdown: markdownBody,
      mirror: `${page.url}.md`,
    })
  }

  /* Store ---------------------------------------------------------------- */

  const tokens = await tokensProjection()
  const store = {
    version: String(uiPackage.version ?? '0.0.0'),
    items,
    pages,
    changelogs,
    tokens,
  }
  // Validate our own output through the one guard before writing it.
  storeLib.parsePrismDocsStore(store)
  await writeArtifact('data.json', `${JSON.stringify(store, null, 2)}\n`)

  /* llms.txt + llms-full.txt -------------------------------------------- */

  const bullet = (title, mirror, description) => `- [${title}](${BASE_URL}${mirror}): ${description}`
  const llmsSections = []

  /**
   * One Section's group, under the Store's own label for it, or nothing when the
   * Section holds no page. A Section with no label throws rather than being
   * grouped under a name this file would have to invent, because an invented
   * name is a heading no agent will look for.
   */
  const sectionGroup = (section) => {
    const group = pages
      .filter((page) => page.section === section)
      .sort((a, b) => a.slug.localeCompare(b.slug))
    if (group.length === 0) return undefined
    const heading = storeLib.STORE_SECTION_TITLES[section]
    if (heading === undefined) {
      throw new Error(
        `prism-llms: the content Section '${section}' has no label in STORE_SECTION_TITLES, so it ` +
          'would be grouped under a name this file would have to invent',
      )
    }
    return `## ${heading}\n\n${group.map((page) => bullet(page.title, page.mirror, page.description)).join('\n')}`
  }

  const itemGroups = [
    { heading: 'Components', kind: 'component' },
    { heading: 'Blocks', kind: 'block' },
    { heading: 'Pages', kind: 'page' },
  ]
  const itemGroup = (heading, kind) => {
    const group = items.filter((item) => item.kind === kind)
    if (group.length === 0) return undefined
    return `## ${heading}\n\n${group.map((item) => bullet(item.name, item.mirror, item.description)).join('\n')}`
  }

  // The reading order is the order the site's content tree declares: the prose
  // Sections, the catalogue, then the history. The Section list is the Store's
  // own and the label each is read under is the Store's own map, so a Section
  // cannot be in the content tree and missing from `llms.txt` without one of the
  // two refusing to agree. The Changelogs Section is the one read after the
  // catalogue, because history is read after the thing it is the history of;
  // a new Section joins the first loop, which is the default a reader expects.
  for (const section of storeLib.STORE_SECTIONS) {
    if (section === TRAILING_SECTION) continue
    const group = sectionGroup(section)
    if (group !== undefined) llmsSections.push(group)
  }
  for (const { heading, kind } of itemGroups) {
    const group = itemGroup(heading, kind)
    if (group !== undefined) llmsSections.push(group)
  }
  const trailing = sectionGroup(TRAILING_SECTION)
  if (trailing !== undefined) llmsSections.push(trailing)

  const tagline =
    "Prism is NaniSoft's design system: a token pipeline, a React component library, a documentation site and an agent surface. Import from '@nanisoft/prism-ui'; internal dependencies are never consumer imports."
  const llmsTxt = [
    '# Prism',
    '',
    `> ${tagline}`,
    '',
    `- [Full reference](${BASE_URL}/llms-full.txt): every page in this index expanded to its full specification.`,
    `- [Agent skill](${BASE_URL}/prism-skill.md): the one-screen fast path.`,
    '',
    ...llmsSections.map((section) => `${section}\n`),
  ].join('\n')
  await writeArtifact('llms.txt', llmsTxt)

  const orderedFull = [
    ...pages.sort((a, b) => a.section.localeCompare(b.section) || a.slug.localeCompare(b.slug)).map((page) => page.markdown),
    ...items.map((item) => item.doc),
  ]
  const llmsFull = [
    '# Prism - full reference',
    '',
    `> ${tagline}`,
    '',
    '---',
    '',
    orderedFull.join('\n\n---\n\n'),
    '',
  ].join('\n')
  await writeArtifact('llms-full.txt', llmsFull)

  await writeArtifact('prism-skill.md', prismSkill(store))

  return { written: [...written].sort(), store }
}

async function runTsc() {
  const tsc = path.join(PKG_ROOT, 'node_modules', 'typescript', 'bin', 'tsc')
  execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], {
    cwd: PKG_ROOT,
    stdio: 'inherit',
  })
}

export async function main(argv) {
  const outIndex = argv.indexOf('--out')
  const outDir = outIndex !== -1 ? path.resolve(argv[outIndex + 1]) : path.join(PKG_ROOT, 'dist')

  // Build-fresh: clear the generator-owned corpus, then recompile the library
  // into `dist/` (never an `rm -rf` of a live dev graph).
  await rm(path.join(PKG_ROOT, 'dist', 'md'), { recursive: true, force: true })
  for (const artifact of ['data.json', 'llms.txt', 'llms-full.txt', 'prism-skill.md']) {
    await rm(path.join(PKG_ROOT, 'dist', artifact), { force: true })
  }
  await runTsc()
  const { written, store } = await emit(outDir)
  console.log(
    `prism-llms: ${written.length} corpus files -> ${path.relative(process.cwd(), outDir) || '.'} ` +
      `(${store.items.length} items, ${store.pages.length} pages, ${store.tokens.themes.length} themes)`,
  )
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main(process.argv.slice(2))
}
