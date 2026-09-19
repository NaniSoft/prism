// The app-side `toPrismTree()` adapter (ADR-0003): fumadocs' page tree → the
// Prism-owned DocsNavEntry[]. prism-ui never sees a fumadocs type.

import type { DocsNavEntry } from '@nanisoft/prism-ui/pages';
import type { Folder, Item, Node, Separator } from 'fumadocs-core/page-tree';

function nodeName(node: Item | Folder | Separator): string {
  const { name } = node;
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);
  return '';
}

/**
 * Flatten a section's page tree into sidebar entries. Separators become
 * group headers (a link-less entry — DocsShell renders it as an anchor without
 * href, which the site CSS styles as a label); folders carry their index page's
 * URL and nest their children.
 */
export function toPrismTree(children: Node[]): DocsNavEntry[] {
  const entries: DocsNavEntry[] = [];
  for (const node of children) {
    if (node.type === 'separator') {
      entries.push({ id: `separator-${nodeName(node)}-${entries.length}`, title: nodeName(node), url: '' });
      continue;
    }
    if (node.type === 'folder') {
      entries.push({
        id: node.$id ?? `folder-${nodeName(node)}-${entries.length}`,
        title: nodeName(node),
        url: node.index?.url ?? '',
        children: toPrismTree(node.children),
      });
      continue;
    }
    entries.push({ id: node.$id ?? node.url, title: nodeName(node), url: node.url });
  }
  return entries;
}

/** Section index grids: pages grouped under their separators, in tree order. */
export interface CatalogGroup {
  group?: string;
  items: { title: string; description?: string; url: string }[];
}

export function toCatalogGroups(children: Node[]): CatalogGroup[] {
  const groups: CatalogGroup[] = [];
  for (const node of children) {
    if (node.type === 'separator') {
      groups.push({ group: nodeName(node), items: [] });
      continue;
    }
    if (node.type === 'folder') {
      const nested = toCatalogGroups(node.children);
      for (const nestedGroup of nested) groups.push({ group: nodeName(node), items: nestedGroup.items });
      continue;
    }
    const title = nodeName(node);
    const last = groups[groups.length - 1];
    const item = { title, url: node.url };
    if (last) last.items.push(item);
    else groups.push({ items: [item] });
  }
  return groups;
}
