import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree'
import type { PageTreeOptions } from 'fumadocs-core/source'
import type { ReactNode } from 'react'

/**
 * The site's navigation, projected from the content tree.
 *
 * The tree is the one place the order of the documentation is stated. A folder's
 * `meta.json` names the pages beneath it, in the order a reader should meet
 * them, and the catalogue's order is generated from the Catalogue rather than
 * written out. Nothing here restates either, so a section cannot disagree with
 * the order its own folder declares.
 *
 * This module holds no runtime import. That is deliberate and load-bearing in two
 * places: the page tree cannot be built outside the bundler that compiled the
 * macro, so everything that reads it lives in a module that can be loaded
 * without it and therefore be tested; and the header's row is rendered by a
 * client component, so importing `TOP_NAV` from here must not drag a server
 * module, or `fumadocs-core` itself, into the client bundle.
 */

/** A page in the navigation: a title and the route it is addressed by. */
export type NavItem = { type: 'page'; title: string; url: string }

/**
 * A group in the navigation: a heading and its ordered children, at any depth.
 *
 * `url` is the group's own index page. It is absent when the folder has none,
 * and absent means a label: a group is a place in the tree, not a route, and
 * none is invented for it. `id` is the tree node's own id, used as the render
 * key so two groups that share a title still key apart.
 */
export type NavSection = {
  type: 'group'
  id: string
  title: string
  url?: string
  items: NavEntry[]
}

/**
 * A rule between entries, from a meta file's `---Name---`.
 *
 * The meta vocabulary can express one and the projection has to account for it,
 * because a vocabulary it silently drops is a page a maintainer believes is
 * published and a reader cannot see. It is a label, not a link.
 */
export type NavDivider = { type: 'divider'; id: string; title: string }

export type NavEntry = NavItem | NavSection | NavDivider

/**
 * The page-tree options the routed tree is built with.
 *
 * This is empty, and every absence in it is load-bearing rather than an
 * oversight. `PageTreeOptions` has two flags that would quietly break the
 * navigation, and neither reports an error when set.
 *
 * `noRef` strips `$ref` from every node, and `$ref` is the only handle
 * `getNodeMeta()` has on the file behind a folder, so setting it makes the
 * metadata accessor return nothing for the whole tree.
 *
 * `root` is a key in a meta file rather than an option here, but it is read by
 * the same builder: it marks a folder as a tree root, and marking a folder as a
 * root skips the automatic `index.mdx` lookup. A group heading is wired to
 * exactly that index, so a `root` key on a Section's meta file would leave the
 * heading with no route, no children and no error.
 *
 * `generateFallback` is deliberately left on. It is what moves a page the
 * ordering forgot out of the primary tree, which is the only evidence
 * `projectNav()` below has to refuse to render.
 */
export const PAGE_TREE = {} satisfies Partial<PageTreeOptions>

/** A node's name is a string on every path the tree builder takes. */
function text(name: ReactNode): string {
  return typeof name === 'string' ? name : ''
}

/**
 * A stable render key. The builder assigns `$id` from the node's own path, so it
 * is unique and identical on every build. The index is only reached by a node
 * that somehow has none, and is there so the key can never be `undefined`.
 */
function keyOf(node: Node, index: number): string {
  return node.$id ?? `${index}:${text(node.name)}`
}

function projectPage(node: Item): NavItem {
  return { type: 'page', title: text(node.name), url: node.url }
}

function projectEntry(node: Node, index: number): NavEntry {
  if (node.type === 'page') return projectPage(node)
  if (node.type === 'folder') return projectGroup(node, index)
  return { type: 'divider', id: keyOf(node, index), title: text(node.name) }
}

/**
 * One group per folder, at any depth.
 *
 * The heading's route is the folder's index page and nothing else. Every array
 * and object here is built fresh: the tree is memoized and handed out by
 * identity, and this projection runs once per rendered page, so one that sorted
 * or spliced a node's own children in place would reorder what a later page in
 * the same process sees. There is no sort here to guard, because the order lives
 * in the meta file and the tree builder has already applied it.
 */
function projectGroup(node: Folder, index: number): NavSection {
  return {
    type: 'group',
    id: keyOf(node, index),
    title: text(node.name),
    url: node.index?.url,
    items: node.children.map((child, at) => projectEntry(child, at)),
  }
}

/**
 * The root level is a list of groups whatever the node is.
 *
 * A page at the root of the tree is a Section that never got a folder, and a
 * rule at the root is a divider between two Sections. Both still have to reach a
 * reader, so both become a group with nothing under it: the first is a heading
 * that links to its own route, the second a label.
 */
function projectSection(node: Node, index: number): NavSection {
  if (node.type === 'folder') return projectGroup(node, index)
  return {
    type: 'group',
    id: keyOf(node, index),
    title: text(node.name),
    url: node.type === 'page' ? node.url : undefined,
    items: [],
  }
}

/** Every page a folder holds, its own index first, as the builder orders them. */
function collectPages(nodes: Node[], into: string[]): void {
  for (const node of nodes) {
    if (node.type === 'page') {
      into.push(node.$ref ?? node.url)
      continue
    }
    if (node.type !== 'folder') continue
    if (node.index) into.push(node.index.$ref ?? node.index.url)
    collectPages(node.children, into)
  }
}

/**
 * Every page the ordering left out, by the file that holds it.
 *
 * A `pages` array in a meta file is a whitelist, not a reorder. Anything it
 * omits and does not cover with `...` leaves the primary tree, lands in
 * `root.fallback`, and keeps its exported route. Nothing reports that: the page
 * is reachable by URL, absent from the navigation, and the build is green. The
 * fallback tree is the only evidence, which is why it is read rather than
 * ignored.
 */
function unordered(tree: Root): string[] {
  const paths: string[] = []
  if (tree.fallback) collectPages(tree.fallback.children, paths)
  return paths
}

/**
 * The navigation, from the one routed tree.
 *
 * It throws rather than return a partial navigation when a page is in the
 * fallback collection, because a partial navigation is the failure this exists
 * to prevent: the reader loses a page that is still published, and the build
 * stays green. Throwing here fails every page render, so the build fails.
 */
export function projectNav(tree: Root): NavSection[] {
  const left = unordered(tree)
  if (left.length > 0) {
    throw new Error(
      `the page tree holds ${left.length} page(s) that no ordering claims, so they are ` +
        `reachable by URL and missing from the navigation: ${left.join(', ')}. Name each one ` +
        'in the pages array of the meta.json for its folder, or cover the remainder with "...", ' +
        'or delete the page.',
    )
  }
  return tree.children.map((node, index) => projectSection(node, index))
}

export type FlatNav = { title: string; url: string }

/** Every routed page in reading order, for prev/next. */
export function flattenNav(sections: NavSection[]): FlatNav[] {
  const out: FlatNav[] = []
  for (const section of sections) {
    if (section.url) out.push({ title: section.title, url: section.url })
    pushEntries(out, section.items)
  }
  return out
}

function pushEntries(out: FlatNav[], entries: NavEntry[]): void {
  for (const entry of entries) {
    if (entry.type === 'page') {
      out.push({ title: entry.title, url: entry.url })
      continue
    }
    if (entry.type !== 'group') continue
    if (entry.url) out.push({ title: entry.title, url: entry.url })
    pushEntries(out, entry.items)
  }
}

/**
 * The header's top-level row.
 *
 * This is the one navigation list left by hand, and it is not the sidebar. It is
 * a reading order of its own that puts the catalogue together in the middle
 * rather than after the prose, and it carries the two routes that are not
 * Sections at all: the landing page and the live theme reader. Neither can be
 * read out of the tree, so neither is invented here: this row is stated once,
 * consumed by the one component that renders it, and the Section routes it
 * shares with the sidebar are the same routes the tree holds.
 */
export const TOP_NAV = [
  { href: '/', label: 'Overview' },
  { href: '/docs', label: 'Guides' },
  { href: '/foundations', label: 'Foundations' },
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/pages', label: 'Pages' },
  { href: '/content', label: 'Content' },
  { href: '/themes', label: 'Themes' },
] as const
