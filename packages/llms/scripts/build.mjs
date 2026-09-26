/**
 * The prism-llms generator.
 *
 * One build-fresh `dist/` serves three lanes:
 * - `data.json`   the PrismDocsStore projection, bundled by the MCP server
 * - `llms.txt` + `llms-full.txt`   the agent reference, six sections
 * - `prism-skill.md`   the one-screen agent fast path
 * - `md/`   the per-item Markdown mirror the Worker serves at `/<page>.md`
 *
 * File-is-truth per artifact: the catalogue entry, the hand-written MDX page,
 * `@nanisoft/prism-ui`'s emitted declarations, the verbatim demo source and the
 * emitted token cascade. Emit is deterministic and byte-stable; `dist/` is never
 * committed and the build starts from scratch.
 *
 * `emit(outDir)` writes only the corpus so the drift gate can emit twice and
 * byte-compare. Run `node scripts/build.mjs` to compile the library and emit.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
const PAGE_SECTIONS = ['docs', 'foundations', 'content']
const PACKS = ['default', 'blush', 'mint', 'lavender', 'sky', 'peach']
const MODES = ['light', 'dark']

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
async function itemSections(item, declaration, lib, publicExports, byName) {
  const extracted = lib.extractor.extractExports(declaration, item.exports)

  if (item.kind === 'component') {
    const props = lib.markdown.renderPropsSection(extracted, seamLine(item, declaration))
    return { props, composition: undefined }
  }

  const demo = await readText(path.join(DEMOS_ROOT, `${item.slug}.tsx`))
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

The read-only MCP endpoint is \`${BASE_URL}/mcp\`. It exposes eight tools:
\`list_items\`, \`get_item_doc\`, \`get_item_props\`, \`get_item_source\`,
\`get_theme_doc\`, \`list_pages\`, \`get_page\` and \`search_docs\`.

## Truth rules

- Prism is the one source of truth. A consumer composes; it never writes CSS and
  never overrides a style.
- There is no override path. When Prism lacks a component, token or variant,
  request it upstream.
- Generated code imports from \`@nanisoft/prism-ui\` only.

## This corpus

Generated from the catalogue and the authored pages: ${counts.component}
Components, ${counts.block} Blocks and ${counts.page} Pages, plus the guides,
Foundations and Content pages.
`
}

/**
 * Emit the whole corpus into `outDir`. Deterministic: the same inputs produce
 * the same bytes. Returns the sorted relative file list and the store.
 */
export async function emit(outDir) {
  const lib = await loadLib()
  const { markdown, store: storeLib } = lib

  for (const artifact of CORPUS_ARTIFACTS) {
    await rm(path.join(outDir, artifact), { recursive: true, force: true })
  }

  const uiPackage = (await readJson(path.join(UI_ROOT, 'package.json'))) ?? {}
  const catalogue = (await import('@nanisoft/prism-ui/catalog')).buildCatalog()
  const byName = new Map(catalogue.map((entry) => [entry.name, entry]))
  const publicExports = new Set(catalogue.flatMap((entry) => entry.exports))
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
    const raw = await readText(path.join(ITEMS_ROOT, item.kind, `${item.slug}.mdx`))
    if (raw === undefined) {
      throw new Error(`prism-llms: catalog item '${item.name}' has no prose page at apps/site/items/${item.kind}/${item.slug}.mdx`)
    }
    if (!item.description || item.description.trim().length === 0) {
      throw new Error(`prism-llms: catalog item '${item.name}' has an empty description`)
    }
    const { body } = markdown.parseMdx(raw)
    const proseBody = markdown.stripSection(markdown.stripMdxMechanics(body), 'Usage')
    const importLine = `import { ${item.exports.join(', ')} } from '@nanisoft/prism-ui/${segment}/${item.slug}'`

    const demo = await readText(path.join(DEMOS_ROOT, `${item.slug}.tsx`))
    let example
    if (demo !== undefined) {
      const title = markdown.demoTitle(demo, `${item.name} example`)
      example = { title, code: demo }
    }

    const declarationFile = dtsPath(item.source)
    const declaration = existsSync(declarationFile) ? await readDeclarations(declarationFile) : ''

    const { props, composition } = await itemSections(item, declaration, lib, publicExports, byName)
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

  /* Pages ---------------------------------------------------------------- */

  const pages = []
  for (const section of PAGE_SECTIONS) {
    const dir = path.join(CONTENT_ROOT, section)
    if (!existsSync(dir)) continue
    const files = (await readdir(dir)).filter((name) => name.endsWith('.mdx')).sort()
    for (const file of files) {
      if (file === 'index.mdx') continue
      const slug = file.replace(/\.mdx$/, '')
      const raw = await readText(path.join(dir, file))
      if (raw === undefined) continue
      const { data, body } = markdown.parseMdx(raw)
      const title = data.title
      if (!title) throw new Error(`prism-llms: page '${section}/${slug}' has no title`)
      const description = data.description ?? ''
      const markdownBody = markdown.assembleDoc([
        `# ${title}`,
        description,
        markdown.stripMdxMechanics(body),
      ])
      const url = `/${section}/${slug}`
      await writeArtifact(path.join('md', section, `${slug}.md`), markdownBody)
      pages.push({
        id: `${section}/${slug}`,
        slug,
        section,
        title,
        description,
        url,
        markdown: markdownBody,
        mirror: `${url}.md`,
      })
    }
  }

  /* Store ---------------------------------------------------------------- */

  const tokens = await tokensProjection()
  const store = {
    version: String(uiPackage.version ?? '0.0.0'),
    items,
    pages,
    tokens,
  }
  // Validate our own output through the one guard before writing it.
  storeLib.parsePrismDocsStore(store)
  await writeArtifact('data.json', `${JSON.stringify(store, null, 2)}\n`)

  /* llms.txt + llms-full.txt -------------------------------------------- */

  const bullet = (title, mirror, description) => `- [${title}](${BASE_URL}${mirror}): ${description}`
  const llmsSections = []
  const pageSections = [
    { heading: 'Guides', section: 'docs' },
    { heading: 'Foundations', section: 'foundations' },
    { heading: 'Content', section: 'content' },
  ]
  for (const { heading, section } of pageSections) {
    const group = pages.filter((page) => page.section === section).sort((a, b) => a.slug.localeCompare(b.slug))
    if (group.length === 0) continue
    llmsSections.push(
      `## ${heading}\n\n${group.map((page) => bullet(page.title, page.mirror, page.description)).join('\n')}`,
    )
  }
  const itemGroups = [
    { heading: 'Components', kind: 'component' },
    { heading: 'Blocks', kind: 'block' },
    { heading: 'Pages', kind: 'page' },
  ]
  for (const { heading, kind } of itemGroups) {
    const group = items.filter((item) => item.kind === kind)
    if (group.length === 0) continue
    llmsSections.push(
      `## ${heading}\n\n${group.map((item) => bullet(item.name, item.mirror, item.description)).join('\n')}`,
    )
  }

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
