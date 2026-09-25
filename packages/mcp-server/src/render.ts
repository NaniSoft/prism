/**
 * The markdown every tool answers with — the corpus is Markdown, so JSON
 * envelopes would only add tokens and quoting (ADR-0004 §2). All of these are
 * pure string builders over already-resolved data; lookup/search logic lives
 * elsewhere. Result text always prints the next call to make (§7).
 */

import type { PrismDocsItem, PrismDocsPage, PrismDocsStore, PrismDocsTheme, PrismPrimitive } from './store.js';
import { ITEM_KINDS, type ItemKind } from './lookup.js';
import type { SearchHit } from './search.js';

/** The one import rule every description and every miss carries. */
export const IMPORT_RULE =
  "Always import from '@nanisoft/prism-ui', never from antd or Base UI directly; Base UI is internal to prism-ui.";

const KIND_LABEL: Record<ItemKind, string> = { component: 'component', block: 'block', page: 'page' };
const KIND_HEADING: Record<ItemKind, string> = { component: 'Components', block: 'Blocks', page: 'Pages' };
const PRIMITIVE_LABEL: Record<PrismPrimitive, string> = {
  'base-ui': 'Base UI primitive internally',
  native: 'native HTML primitive',
};

const plural = (count: number, noun: string): string => (count === 1 ? `1 ${noun}` : `${count} ${noun}s`);

/**
 * `list_items` — the cold-start catalog. The header line carries the corpus
 * version (mismatch detection) and, when the bundler supplies one, the build
 * date. Every item also states its internal primitive foundation so agents
 * understand the implementation without treating it as a second public API.
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

  lines.push(
    '---',
    '',
    `Next: \`get_item_doc\` for an item's full doc, \`get_item_props\` for its public props, \`search_docs\` to search everything. Primitive labels describe internal foundations only. ${IMPORT_RULE}`,
  );
  return lines.join('\n');
}

function catalogEntry(item: PrismDocsItem): string {
  return `- **${item.name}** — ${item.description} _(${PRIMITIVE_LABEL[item.primitive]})_`;
}

/**
 * `get_item_doc` — the generator's page verbatim (usage rules, props, and
 * examples), plus at most one steering footer built from the data.
 */
export function itemDocMarkdown(item: PrismDocsItem): string {
  const pointers: string[] = [];
  if (item.props) pointers.push(`Public Prism props: \`get_item_props { "name": "${item.name}" }\``);
  if ((item.examples?.length ?? 0) > 0) pointers.push(`Copyable example source: \`get_item_source { "name": "${item.name}" }\``);
  pointers.push(`Foundation: ${PRIMITIVE_LABEL[item.primitive]}; never import it directly. ${IMPORT_RULE}`);
  return `${item.doc}\n\n---\n\n${pointers.join(' · ')}`;
}

/** `get_item_props` — the complete public Prism prop table when declared. */
export function itemPropsMarkdown(item: PrismDocsItem): string {
  if (item.props) {
    return `${item.props}\n\n---\n\nThis is the public Prism API for \`${item.name}\`; internal primitive props are not a consumer contract. ${IMPORT_RULE}`;
  }
  return [
    `## ${item.name} — props`,
    '',
    `\`${item.name}\` declares no additional Prism-authored props in this build. Its usage rules and examples live in the full doc: \`get_item_doc { "name": "${item.name}" }\`. ${IMPORT_RULE}`,
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
  lines.push('---', '', `Full site index: ${baseUrl}/llms.txt · Catalog: \`list_items\`. ${IMPORT_RULE}`);
  return lines.join('\n');
}

/** `get_page` — the prerendered page verbatim, cited back to the site. */
export function pageMarkdown(page: PrismDocsPage, baseUrl: string): string {
  return `${page.markdown}\n\n---\n\nSource: ${baseUrl}${page.url} · More: \`list_pages\`. ${IMPORT_RULE}`;
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
  lines.push('', browseHint, '', IMPORT_RULE);
  return lines.join('\n');
}

/** A name hit whose `kind` argument pointed somewhere else. */
export function kindMismatchMarkdown(item: PrismDocsItem, requested: ItemKind): string {
  return `\`${item.name}\` is a ${item.kind}, not a ${requested}. Retry with \`kind\` omitted — or with \`"${item.kind}"\`.`;
}
