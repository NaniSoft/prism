/**
 * The markdown every tool answers with — the corpus is Markdown, so JSON
 * envelopes would only add tokens and quoting (ADR-0004 §2). All of these are
 * pure string builders over already-resolved data; lookup/search logic lives
 * elsewhere. Result text always prints the next call to make (§7).
 */

import type { PrismDocsItem, PrismDocsPage, PrismDocsStore, PrismDocsTheme } from './store.js';
import { ITEM_KINDS, type ItemKind } from './lookup.js';
import type { SearchHit } from './search.js';

/** The one import rule every description and every miss carries. */
export const IMPORT_RULE = "Always import from '@nanisoft/prism-ui', never from antd directly.";

const KIND_LABEL: Record<ItemKind, string> = { component: 'component', block: 'block', page: 'page' };
const KIND_HEADING: Record<ItemKind, string> = { component: 'Components', block: 'Blocks', page: 'Pages' };

const plural = (count: number, noun: string): string => (count === 1 ? `1 ${noun}` : `${count} ${noun}s`);

/**
 * `list_items` — the cold-start catalog. The header line carries the corpus
 * version (mismatch detection) and, when the bundler supplies one, the build
 * date; pass-throughs are marked with their antd base so the delegation seam
 * is visible before any per-item call.
 */
export function catalogMarkdown(docs: PrismDocsStore, kind?: ItemKind, built?: string): string {
  const counts = new Map(ITEM_KINDS.map((entry) => [entry, docs.items.filter((item) => item.kind === entry).length] as const));
  const summary = ITEM_KINDS.map((entry) => plural(counts.get(entry) ?? 0, KIND_LABEL[entry])).join(', ');

  const lines: string[] = [`Prism ${docs.prismVersion} — ${summary}${built ? ` (built ${built})` : ''}`, ''];
  if (kind) lines.push(`Filtered to ${KIND_LABEL[kind]}s — omit \`kind\` for the whole catalog.`, '');

  for (const entry of ITEM_KINDS) {
    if (kind && entry !== kind) continue;
    const inKind = docs.items.filter((item) => item.kind === entry);
    lines.push(`## ${KIND_HEADING[entry]}`, '');
    if (inKind.length === 0) {
      lines.push(`No ${KIND_LABEL[entry]}s in this build.`, '');
      continue;
    }
    for (const item of inKind) lines.push(catalogEntry(item));
    lines.push('');
  }

  lines.push('---', '', `Next: \`get_item_doc\` for an item's full doc, \`get_item_props\` for its Prism-added props, \`search_docs\` to search everything. Items marked _(extends antd …)_ are pass-throughs — their inherited antd props live in the antd MCP. ${IMPORT_RULE}`);
  return lines.join('\n');
}

function catalogEntry(item: PrismDocsItem): string {
  const base = item.antdBase ? ` _(extends antd ${item.antdBase})_` : '';
  return `- **${item.name}** — ${item.description}${base}`;
}

/**
 * `get_item_doc` — the generator's page verbatim (usage rules, props, example,
 * the `> Extends:` seam), plus at most one steering footer built from the data.
 */
export function itemDocMarkdown(item: PrismDocsItem): string {
  const pointers: string[] = [];
  if (item.props) pointers.push(`Prism-added props only: \`get_item_props { "name": "${item.name}" }\``);
  if ((item.examples?.length ?? 0) > 0) pointers.push(`Copyable example source: \`get_item_source { "name": "${item.name}" }\``);
  if (item.antdBase) pointers.push(`Inherited antd props and demos: antd MCP \`antd_info ${item.antdBase}\``);
  return pointers.length > 0 ? `${item.doc}\n\n---\n\n${pointers.join(' · ')}` : item.doc;
}

/**
 * `get_item_props` — only the Prism-added delta. A pass-through's answer *is*
 * the routing instruction (ADR-0004 §4: plasma's `_No additional props…_` line
 * is the switch-servers signal).
 */
export function itemPropsMarkdown(item: PrismDocsItem): string {
  if (item.props) {
    return item.antdBase
      ? `${item.props}\n\n---\n\nBeyond these Prism-added props, the inherited antd surface lives in the antd MCP (\`antd_info ${item.antdBase}\`). ${IMPORT_RULE}`
      : item.props;
  }
  if (item.antdBase) {
    return [
      `## ${item.name} — props`,
      '',
      `${item.name} — antd ${item.antdBase}, unchanged. Props: use the antd MCP (\`antd_info ${item.antdBase}\`). ${IMPORT_RULE}`,
      '',
      '_No additional props beyond the antd base component._',
    ].join('\n');
  }
  return [
    `## ${item.name} — props`,
    '',
    `\`${item.name}\` documents no Prism-added props in this build. Its usage rules and example live in the full doc: \`get_item_doc { "name": "${item.name}" }\`.`,
  ].join('\n');
}

/** `get_item_source` — the documented example, verbatim, in one fenced block. */
export function itemSourceMarkdown(item: PrismDocsItem, example: { readonly slug: string; readonly title?: string; readonly code: string }): string {
  const labelled = example.title ? `${example.title} (\`${example.slug}\`)` : `\`${example.slug}\``;
  const others = (item.examples ?? []).filter((entry) => entry.slug !== example.slug).map((entry) => `\`${entry.slug}\``);

  const lines = [
    `# ${item.name} — example source: ${labelled}`,
    '',
    '```tsx',
    example.code,
    '```',
    '',
    `Verbatim from the docs demo — self-contained (imports only \`@nanisoft/prism-ui\` and \`react\`). ${IMPORT_RULE}`,
  ];
  if (others.length > 0) lines.push('', `Other examples: ${others.join(', ')} — pass \`example\` to pick one.`);
  return lines.join('\n');
}

/** `get_theme_doc` — the pack × mode atom verbatim, plus the sibling slugs. */
export function themeMarkdown(theme: PrismDocsTheme, all: readonly PrismDocsTheme[]): string {
  const others = all.filter((entry) => entry.slug !== theme.slug).map((entry) => `\`${entry.slug}\``);
  const footer = others.length > 0 ? `\n\n---\n\nOther theme atoms: ${others.join(', ')} — pass \`pack\`/\`mode\` to switch.` : '';
  return `${theme.markdown}${footer}`;
}

/** `list_pages` — the site's llms.txt body as an index. */
export function pagesIndexMarkdown(pages: readonly PrismDocsPage[], baseUrl: string): string {
  const lines = ['# Prism docs pages', ''];
  if (pages.length === 0) {
    lines.push('This build carries no docs pages — the catalog is the whole corpus for now.');
  } else {
    lines.push(`Found ${pages.length}:`, '');
    for (const page of pages) {
      lines.push(`- **${page.title}** — \`${page.url}\`${page.description ? ` — ${page.description}` : ''}`);
      lines.push(`  → \`get_page { "url": "${page.url}" }\``);
    }
    lines.push('');
  }
  lines.push('---', '', `Full site index: ${baseUrl}/llms.txt · Catalog: \`list_items\`.`);
  return lines.join('\n');
}

/** `get_page` — the prerendered page verbatim, cited back to the site. */
export function pageMarkdown(page: PrismDocsPage, baseUrl: string): string {
  return `${page.markdown}\n\n---\n\nSource: ${baseUrl}${page.url} · More: \`list_pages\`.`;
}

/** `search_docs` — ranked hits, each printing its own next call. */
export function searchResultsMarkdown(query: string, hits: readonly SearchHit[]): string {
  const lines = [`# Search results for "${query}"`, ''];
  if (hits.length === 0) {
    lines.push('No matches.', '', 'Try broader terms — or browse: `list_items` for the catalog, `list_pages` for docs pages.');
    return lines.join('\n');
  }

  lines.push(`Found ${hits.length} result(s):`, '');
  hits.forEach((hit, index) => {
    if (index > 0) lines.push('---', '');
    lines.push(`## ${hit.title} (${hit.kind})`, hit.snippet, `→ \`${hit.followUp}\`${hit.followUp.startsWith('get_item_source') ? ' for the copyable source.' : ''}`);
  });
  return lines.join('\n');
}

/** A lookup miss: the closest names plus the browse pointer, as an error. */
export function missMarkdown(target: string, suggestions: readonly string[], browseHint: string): string {
  const lines = [`\`${target}\` not found.`];
  if (suggestions.length > 0) lines.push('', `Did you mean: ${suggestions.map((name) => `**${name}**`).join(', ')}?`);
  lines.push('', browseHint);
  return lines.join('\n');
}

/** A name hit whose `kind` argument pointed somewhere else. */
export function kindMismatchMarkdown(item: PrismDocsItem, requested: ItemKind): string {
  return `\`${item.name}\` is a ${item.kind}, not a ${requested}. Retry with \`kind\` omitted — or with \`"${item.kind}"\`.`;
}
