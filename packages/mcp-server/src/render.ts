/**
 * The pure renderers behind the eight tools.
 *
 * Every tool returns markdown and never touches I/O: the store is the whole
 * input. A lookup miss is an `isError` result with did-you-mean suggestions and
 * a browse pointer, never a throw, so a client sees the same contract on every
 * transport.
 */
import type { CallToolResult } from '@modelcontextprotocol/server'
import type { PrismDocsPage, PrismDocsStore, PrismDocsStoreEntry } from '@nanisoft/prism-llms'

import { IMPORT_RULE, NO_INVENTION_RULE, SURFACE_RULE } from './rules.js'
import type { ComponentCategory, ItemKind, SearchKind, TokenGroup } from './vocab.js'
import { TOKEN_GROUPS } from './vocab.js'

/* -------------------------------------------------------------------------- */
/* Result helpers                                                             */
/* -------------------------------------------------------------------------- */

const text = (value: string): CallToolResult => ({ content: [{ type: 'text', text: value }] })

const error = (value: string): CallToolResult => ({
  content: [{ type: 'text', text: value }],
  isError: true,
})

function fence(code: string, language = 'tsx'): string {
  return `\`\`\`${language}\n${code.replace(/\r\n/g, '\n').replace(/\n$/, '')}\n\`\`\``
}

function kindLabel(kind: string): string {
  if (kind === 'component') return 'Component'
  if (kind === 'block') return 'Block'
  return 'Page'
}

function countKinds(items: readonly PrismDocsStoreEntry[]): Record<ItemKind, number> {
  const counts: Record<ItemKind, number> = { component: 0, block: 0, page: 0 }
  for (const item of items) counts[item.kind] += 1
  return counts
}

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

/** Every exact name or slug match in the optional kind, case-insensitively. */
export function matchesFor(
  store: PrismDocsStore,
  name: string,
  kind?: ItemKind,
): PrismDocsStoreEntry[] {
  const needle = name.trim().toLowerCase()
  const pool = store.items.filter((item) => !kind || item.kind === kind)
  const byName = pool.filter((item) => item.name.toLowerCase() === needle)
  if (byName.length > 0) return byName
  return pool.filter((item) => item.slug.toLowerCase() === needle)
}

function suggestItems(store: PrismDocsStore, name: string, kind?: ItemKind): PrismDocsStoreEntry[] {
  const needle = name.trim().toLowerCase()
  const pool = store.items.filter((item) => !kind || item.kind === kind)
  return pool
    .map((item) => {
      const candidate = `${item.name} ${item.slug}`.toLowerCase()
      let score = candidate.includes(needle) ? 3 : 0
      let common = 0
      while (common < item.name.length && common < needle.length && item.name[common]?.toLowerCase() === needle[common]) {
        common += 1
      }
      score += common
      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, 3)
    .map((entry) => entry.item)
}

function itemMiss(store: PrismDocsStore, name: string, kind?: ItemKind): CallToolResult {
  const suggestions = suggestItems(store, name, kind)
  const did =
    suggestions.length > 0
      ? ` Did you mean ${suggestions.map((item) => `\`${item.name}\` (${item.kind})`).join(', ')}?`
      : ''
  return error(
    `No Prism item named \`${name}\`${kind ? ` of kind \`${kind}\`` : ''}.${did} Browse the catalogue with \`list_items\` or search with \`search_docs\`.`,
  )
}

type ResolvedItem = { ok: true; item: PrismDocsStoreEntry } | { ok: false; result: CallToolResult }

function resolveItem(store: PrismDocsStore, name: string, kind?: ItemKind): ResolvedItem {
  const matches = matchesFor(store, name, kind)
  if (matches.length === 0) return { ok: false, result: itemMiss(store, name, kind) }
  if (matches.length > 1) {
    const kinds = matches.map((item) => `\`${item.kind}\``).join(', ')
    return {
      ok: false,
      result: error(
        `\`${name}\` matches more than one kind: ${kinds}. Pass \`kind\` to disambiguate.`,
      ),
    }
  }
  const item = matches[0]
  if (!item) return { ok: false, result: itemMiss(store, name, kind) }
  return { ok: true, item }
}

/* -------------------------------------------------------------------------- */
/* list_items                                                                 */
/* -------------------------------------------------------------------------- */

export interface ListItemsArgs {
  kind?: ItemKind
  category?: ComponentCategory
}

function renderListItem(item: PrismDocsStoreEntry): string {
  const category = item.kind === 'component' && item.category ? ` _(${item.category})_` : ''
  return `- **${item.name}** - ${item.description}${category}`
}

export function renderListItems(
  store: PrismDocsStore,
  args: ListItemsArgs,
  built?: string,
): CallToolResult {
  const { kind, category } = args
  if (category && kind && kind !== 'component') {
    return error(
      `\`category\` is a Component-only field. Kind \`${kind}\` has no categories; omit \`category\` or pass \`kind: "component"\`.`,
    )
  }

  const counts = countKinds(store.items)
  const stamp = built ? ` (built ${built})` : ''
  const header = `# Prism ${store.version} - ${counts.component} components, ${counts.block} blocks, ${counts.page} pages${stamp}`

  const filters: string[] = []
  if (kind) filters.push(`kind = \`${kind}\``)
  if (category) filters.push(`category = \`${category}\``)
  const note = filters.length > 0 ? `\n\nFiltered to ${filters.join(', ')}.` : ''

  let items = store.items
  if (kind) items = items.filter((item) => item.kind === kind)
  if (category) {
    items = items.filter((item) => item.kind === 'component' && item.category === category)
  }

  const groups = [
    { kind: 'component' as const, heading: 'Components' },
    { kind: 'block' as const, heading: 'Blocks' },
    { kind: 'page' as const, heading: 'Pages' },
  ]
  const sections: string[] = []
  for (const group of groups) {
    const groupItems = items.filter((item) => item.kind === group.kind)
    if (groupItems.length === 0) continue
    sections.push(`## ${group.heading}\n\n${groupItems.map(renderListItem).join('\n')}`)
  }
  if (sections.length === 0) {
    const label = kind ? `${groupPlural(kind)}` : 'items'
    sections.push(`No ${label} in this build.`)
  }

  const footer = `Use \`get_item_doc\`, \`get_item_props\` or \`search_docs\` to read an item.\n\nImport rule: ${IMPORT_RULE}\n\nSurface rule: ${SURFACE_RULE}`
  return text([`${header}${note}`, ...sections, footer].join('\n\n'))
}

function groupPlural(kind: ItemKind): string {
  if (kind === 'component') return 'components'
  if (kind === 'block') return 'blocks'
  return 'pages'
}

/* -------------------------------------------------------------------------- */
/* get_item_doc                                                               */
/* -------------------------------------------------------------------------- */

export interface ItemArgs {
  name: string
  kind?: ItemKind
}

export function renderItemDoc(store: PrismDocsStore, args: ItemArgs): CallToolResult {
  const resolved = resolveItem(store, args.name, args.kind)
  if (!resolved.ok) return resolved.result
  const item = resolved.item
  return text(
    `${item.doc.trimEnd()}\n\n---\n\nPublic import: \`${item.importLine}\`\n\nImport rule: ${IMPORT_RULE}`,
  )
}

/* -------------------------------------------------------------------------- */
/* get_item_props                                                             */
/* -------------------------------------------------------------------------- */

export function renderItemProps(store: PrismDocsStore, args: ItemArgs): CallToolResult {
  const resolved = resolveItem(store, args.name, args.kind)
  if (!resolved.ok) return resolved.result
  const item = resolved.item
  if (item.props) {
    return text(
      `# ${item.name} - props\n\n${item.props}\n\nThis is the complete public Prism API for \`${item.name}\`; internal primitive props are not a consumer contract.\n\nImport rule: ${IMPORT_RULE}`,
    )
  }
  if (item.composition) {
    return text(
      `# ${item.name} - composition\n\nA ${kindLabel(item.kind)} has no own props; its public surface is the composition below.\n\n${item.composition}\n\nImport rule: ${IMPORT_RULE}`,
    )
  }
  return error(
    `No props or composition are recorded for \`${item.name}\`. Use \`get_item_doc\` for its documentation.`,
  )
}

/* -------------------------------------------------------------------------- */
/* get_item_source                                                            */
/* -------------------------------------------------------------------------- */

export function renderItemSource(store: PrismDocsStore, args: ItemArgs): CallToolResult {
  const resolved = resolveItem(store, args.name, args.kind)
  if (!resolved.ok) return resolved.result
  const item = resolved.item
  if (!item.example) {
    return error(
      `No demo source is recorded for \`${item.name}\`. Use \`get_item_doc\` for its documentation.`,
    )
  }
  return text(
    [
      `# ${item.name} - example source`,
      `Public import:\n\n${fence(item.importLine)}`,
      `${item.example.title}\n\n${fence(item.example.code)}`,
      'This demo is self-contained: it imports only `@nanisoft/prism-ui/*` or `react`, and exposes one default export.',
      `Import rule: ${IMPORT_RULE}`,
    ].join('\n\n'),
  )
}

/* -------------------------------------------------------------------------- */
/* get_theme_doc                                                              */
/* -------------------------------------------------------------------------- */

export interface ThemeDocArgs {
  pack?: string
  mode?: string
  group?: string
}

export function renderThemeDoc(store: PrismDocsStore, args: ThemeDocArgs): CallToolResult {
  const pack = args.pack ?? 'default'
  const mode = args.mode ?? 'light'
  const group = args.group

  if (!(store.tokens.packs as readonly string[]).includes(pack)) {
    return error(`Unknown pack \`${pack}\`. Valid packs: ${store.tokens.packs.join(', ')}.`)
  }
  if (!(store.tokens.modes as readonly string[]).includes(mode)) {
    return error(`Unknown mode \`${mode}\`. Valid modes: ${store.tokens.modes.join(', ')}.`)
  }
  if (group !== undefined && !(TOKEN_GROUPS as readonly string[]).includes(group)) {
    return error(`Unknown group \`${group}\`. Valid groups: ${TOKEN_GROUPS.join(', ')}.`)
  }

  const preamble = [
    `Packs: ${store.tokens.packs.join(', ')}.`,
    `Modes: ${store.tokens.modes.join(', ')}.`,
    `Queryable groups: ${TOKEN_GROUPS.join(', ')}.`,
    'Selection: `data-pack="<id>"` on `<html>`, plus the `.dark` class for mode.',
  ].join('\n\n')
  const footer = `Import rule: ${IMPORT_RULE}\n\n${NO_INVENTION_RULE}`

  if (group === undefined || group === 'semantic') {
    const theme = store.tokens.themes.find((entry) => entry.pack === pack && entry.mode === mode)
    if (!theme) {
      return error(`No resolved values are recorded for pack \`${pack}\` in mode \`${mode}\`.`)
    }
    const lines = theme.semantic.map((token) => `--${token.token}: ${token.value}`).join('\n')
    return text([`# Prism theme: ${pack} / ${mode}`, preamble, lines, footer].join('\n\n'))
  }

  const scale = store.tokens.scales[group as Exclude<TokenGroup, 'semantic'>]
  const lines = scale
    .map((token) =>
      token.binding
        ? `--${token.token}: ${token.value} (binding: --${token.binding})`
        : `--${token.token}: ${token.value}`,
    )
    .join('\n')
  const close =
    group === 'breakpoint'
      ? '\n\nThe scale closes with `--breakpoint-xl: initial` and `--breakpoint-2xl: initial`.'
      : ''
  return text([`# Prism token scale: ${group}`, preamble, `${lines}${close}`, footer].join('\n\n'))
}

/* -------------------------------------------------------------------------- */
/* list_pages / get_page                                                      */
/* -------------------------------------------------------------------------- */

export function renderListPages(store: PrismDocsStore): CallToolResult {
  const groups = [
    { section: 'docs' as const, heading: 'Guides' },
    { section: 'foundations' as const, heading: 'Foundations' },
    { section: 'content' as const, heading: 'Content' },
  ]
  const counts = groups
    .map((group) => ({ ...group, pages: store.pages.filter((page) => page.section === group.section) }))
  const header = `# Prism pages - ${store.pages.length} pages (${counts
    .map((group) => `${group.pages.length} ${group.heading.toLowerCase()}`)
    .join(', ')})`
  const sections = counts
    .filter((group) => group.pages.length > 0)
    .map(
      (group) =>
        `## ${group.heading}\n\n${group.pages
          .map((page) => `- **${page.title}** - ${page.description} (\`${page.url}\`)`)
          .join('\n')}`,
    )
  const footer = `Use \`get_page({ url })\` to read one.\n\nImport rule: ${IMPORT_RULE}`
  return text([header, ...sections, footer].join('\n\n'))
}

export interface PageArgs {
  url: string
}

function suggestPages(store: PrismDocsStore, normalized: string): PrismDocsPage[] {
  const needle = normalized.replace(/^\//, '').toLowerCase()
  return store.pages
    .map((page) => {
      const candidate = `${page.section}/${page.slug}`.toLowerCase()
      let score = candidate.includes(needle) || needle.includes(candidate) ? 3 : 0
      let common = 0
      while (common < candidate.length && common < needle.length && candidate[common] === needle[common]) {
        common += 1
      }
      score += common
      return { page, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
    .slice(0, 3)
    .map((entry) => entry.page)
}

export function renderPage(store: PrismDocsStore, args: PageArgs): CallToolResult {
  const raw = args.url.trim()
  const withoutMd = raw.endsWith('.md') ? raw.slice(0, -3) : raw
  const normalized = withoutMd.startsWith('/') ? withoutMd : `/${withoutMd}`

  if (/^\/(components|blocks|pages)\//.test(normalized)) {
    return error(
      `\`${args.url}\` is a catalogue item URL, not a documentation page. Use \`get_item_doc\` or \`get_item_source\` for an item.`,
    )
  }

  const page = store.pages.find(
    (entry) => entry.url === normalized || entry.mirror === raw || entry.url === withoutMd,
  )
  if (!page) {
    const suggestions = suggestPages(store, normalized)
    const did =
      suggestions.length > 0
        ? ` Did you mean ${suggestions.map((entry) => `\`${entry.url}\``).join(', ')}?`
        : ''
    return error(
      `No Prism page at \`${args.url}\`.${did} List the pages with \`list_pages\`.`,
    )
  }
  return text(`${page.markdown.trimEnd()}\n\n---\n\nMirror: \`${page.mirror}\`\n\nImport rule: ${IMPORT_RULE}`)
}

/* -------------------------------------------------------------------------- */
/* search_docs                                                                */
/* -------------------------------------------------------------------------- */

export interface SearchArgs {
  query: string
  kind?: SearchKind
  limit?: number
}

interface Candidate {
  title: string
  kind: SearchKind
  url: string
  snippet: string
  content: string
  followUp: string
}

interface Hit extends Candidate {
  matched: string[]
  score: number
}

export function searchCandidates(store: PrismDocsStore, kind?: SearchKind): Candidate[] {
  const candidates: Candidate[] = []
  if (kind === undefined || kind !== 'doc') {
    for (const item of store.items) {
      if (kind !== undefined && item.kind !== kind) continue
      candidates.push({
        title: item.name,
        kind: item.kind,
        url: item.url,
        snippet: item.description,
        content: item.doc,
        followUp: `get_item_doc({ name: "${item.name}", kind: "${item.kind}" })`,
      })
    }
  }
  if (kind === undefined || kind === 'doc') {
    for (const page of store.pages) {
      candidates.push({
        title: page.title,
        kind: 'doc',
        url: page.url,
        snippet: page.description,
        content: page.markdown,
        followUp: `get_page({ url: "${page.url}" })`,
      })
    }
  }
  return candidates
}

export function searchDocs(store: PrismDocsStore, args: SearchArgs): CallToolResult {
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 10)
  const terms = args.query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  const hits: Hit[] = []
  for (const candidate of searchCandidates(store, args.kind)) {
    const name = candidate.title.toLowerCase()
    const description = candidate.snippet.toLowerCase()
    const content = candidate.content.toLowerCase()
    const matched = new Set<string>()
    let score = 0
    let matchesAll = true
    for (const term of terms) {
      let termScore = 0
      if (name.includes(term)) {
        matched.add('name')
        termScore += 5
      }
      if (description.includes(term)) {
        matched.add('description')
        termScore += 3
      }
      if (content.includes(term)) {
        matched.add('content')
        termScore += 1
      }
      if (termScore === 0) {
        matchesAll = false
        break
      }
      score += termScore
    }
    if (!matchesAll) continue
    hits.push({ ...candidate, matched: [...matched], score })
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  const top = hits.slice(0, limit)

  if (top.length === 0) {
    return text(
      `No matches for \`${args.query}\`${args.kind ? ` in kind \`${args.kind}\`` : ''}. It searches item names, descriptions and page bodies. Try a shorter query, or browse with \`list_items\` and \`list_pages\`.`,
    )
  }

  const header = `# Search: ${args.query}\n\n${top.length} hit${top.length === 1 ? '' : 's'}${args.kind ? ` in kind \`${args.kind}\`` : ''}.`
  const lines = top.map(
    (hit) =>
      `- **${hit.title}** (${hit.kind}) - ${hit.snippet} [matched: ${hit.matched.join(', ')}] -> \`${hit.followUp}\``,
  )
  const footer = `Read the body with the follow-up call, or repeat a narrower search.\n\nImport rule: ${IMPORT_RULE}`
  return text([header, lines.join('\n'), footer].join('\n\n'))
}
