/**
 * The eight read-only tools (ADR-0004 §1/§2) — unprefixed names, markdown in
 * and out, `isError: true` for lookup misses (never a throw), tools only (no
 * resources/prompts in v1). Descriptions are the steering surface most clients
 * show, so each carries the scope, the antd delegation rule, and the import
 * invariant.
 */

import type { McpServer, CallToolResult } from '@modelcontextprotocol/server';
import { z } from 'zod';

import {
  DEFAULT_MODE,
  DEFAULT_PACK,
  resolveExample,
  themeSlug,
  type ItemKind,
  type ItemLookup,
  type PageLookup,
  type ThemeLookup,
} from './lookup.js';
import {
  catalogMarkdown,
  itemDocMarkdown,
  itemPropsMarkdown,
  itemSourceMarkdown,
  kindMismatchMarkdown,
  missMarkdown,
  pageMarkdown,
  pagesIndexMarkdown,
  searchResultsMarkdown,
  themeMarkdown,
  IMPORT_RULE,
} from './render.js';
import { searchCorpus } from './search.js';
import type { PrismDocsStore } from './store.js';

/** Prism-owned surface only; the upstream antd surface delegates. */
const ANTD_RULE = 'Prism answers its own surface only — inherited antd props, demos, and tokens belong to the antd MCP.';

const Kind = z.enum(['component', 'block', 'page']);
const SearchKind = z.enum(['component', 'block', 'page', 'doc']);

const NAME_DESC = "e.g. 'Button', 'PageHeader', 'SettingsPage'";
const KIND_DESC = 'Disambiguate when the name exists as more than one kind.';
const CATALOG_HINT = 'Browse the catalog: `list_items`.';

/** Everything a handler reads — built fresh per `createPrismMcpServer()` call. */
export interface PrismToolContext {
  readonly docs: PrismDocsStore;
  readonly items: ItemLookup;
  readonly pages: PageLookup;
  readonly themes: ThemeLookup;
  /** Corpus build date (YYYY-MM-DD) for the `list_items` header, when known. */
  readonly built?: string;
}

/** The one response shape: markdown text, with lookup misses flagged as errors. */
const markdown = (text: string, isError = false): CallToolResult => ({ content: [{ type: 'text', text }], isError });

/** Registers exactly the eight v1 tools; nothing else (no resources/prompts). */
export function registerPrismTools(server: McpServer, ctx: PrismToolContext): void {
  server.registerTool(
    'list_items',
    {
      description:
        `Catalog of every Prism item — components, blocks, and pages — with kind, one-liner, and antd base. ` +
        `Start here to learn Prism's vocabulary; the header carries the Prism version and the corpus build ` +
        `date, so you can detect a corpus/installed-version mismatch before trusting the answer. ` +
        `${ANTD_RULE} ${IMPORT_RULE}`,
      inputSchema: { kind: Kind.optional().describe('Filter to one kind; omit for the whole catalog.') },
    },
    ({ kind }) => markdown(catalogMarkdown(ctx.docs, kind, ctx.built)),
  );

  server.registerTool(
    'get_item_doc',
    {
      description:
        `Full Prism documentation for one component, block, or page: usage rules (RFC-2119), Prism-added props, ` +
        `and an example. Covers Prism's own surface only — for inherited antd props on pass-through re-exports ` +
        `use the antd MCP. ${IMPORT_RULE}`,
      inputSchema: { name: z.string().describe(NAME_DESC), kind: Kind.optional().describe(KIND_DESC) },
    },
    ({ name, kind }) => {
      const match = ctx.items.find(name, kind);
      if (match.status === 'miss') return markdown(missMarkdown(name, match.suggestions, CATALOG_HINT), true);
      if (match.status === 'kind-mismatch') return markdown(kindMismatchMarkdown(match.item, kind as ItemKind), true);
      return markdown(itemDocMarkdown(match.item));
    },
  );

  server.registerTool(
    'get_item_props',
    {
      description:
        `Prism-added props for one component, block, or page, as Markdown — the API delta Prism adds on top of ` +
        `antd, not the inherited antd table. A pass-through re-export answers with the antd MCP pointer instead. ${IMPORT_RULE}`,
      inputSchema: { name: z.string().describe(NAME_DESC), kind: Kind.optional().describe(KIND_DESC) },
    },
    ({ name, kind }) => {
      const match = ctx.items.find(name, kind);
      if (match.status === 'miss') return markdown(missMarkdown(name, match.suggestions, CATALOG_HINT), true);
      if (match.status === 'kind-mismatch') return markdown(kindMismatchMarkdown(match.item, kind as ItemKind), true);
      return markdown(itemPropsMarkdown(match.item));
    },
  );

  server.registerTool(
    'get_item_source',
    {
      description:
        `Documented example source for one item — verbatim, self-contained TSX in one fenced block, ready to paste. ` +
        `Returns documented usage, never prism-ui implementation files; raw antd demos belong to the antd MCP's ` +
        `antd_demo. ${IMPORT_RULE}`,
      inputSchema: {
        name: z.string().describe(NAME_DESC),
        example: z.string().optional().describe("Example slug; omit for the item's first example."),
      },
    },
    ({ name, example }) => {
      const match = ctx.items.find(name);
      if (match.status === 'miss') return markdown(missMarkdown(name, match.suggestions, CATALOG_HINT), true);
      const item = match.item;
      const resolved = resolveExample(item, example);
      if (resolved.status === 'none') {
        return markdown(
          `\`${item.name}\` documents no examples in this build — its usage rules live in the full doc: \`get_item_doc { "name": "${item.name}" }\`.`,
          true,
        );
      }
      if (resolved.status === 'miss') {
        return markdown(
          missMarkdown(`example "${example}" of ${item.name}`, resolved.suggestions, `Available examples of \`${item.name}\` are listed by its doc: \`get_item_doc { "name": "${item.name}" }\`.`),
          true,
        );
      }
      return markdown(itemSourceMarkdown(item, resolved.example));
    },
  );

  server.registerTool(
    'get_theme_doc',
    {
      description:
        `Theme and token documentation for one Prism brand pack × mode (blue | green | lavender | rose | peach ` +
        `× light | dark), including the createPrismTheme() snippet. Prism's multi-pack theming is not answerable ` +
        `by antd's antd_token. ${ANTD_RULE} ${IMPORT_RULE}`,
      inputSchema: {
        // Mirrors prism-tokens' PrismPackId (ADR-0005). Unknown packs take the
        // graceful miss path below, which lists the corpus's actual atoms.
        pack: z.enum(['blue', 'green', 'lavender', 'rose', 'peach']).optional().describe(`Brand pack (default '${DEFAULT_PACK}').`),
        mode: z.enum(['light', 'dark']).optional().describe(`Mode (default '${DEFAULT_MODE}').`),
      },
    },
    ({ pack, mode }) => {
      const resolvedPack = pack ?? DEFAULT_PACK;
      const resolvedMode = mode ?? DEFAULT_MODE;
      const theme = ctx.themes.find(resolvedPack, resolvedMode);
      if (!theme) {
        const slug = themeSlug(resolvedPack, resolvedMode);
        return markdown(
          missMarkdown(slug, ctx.themes.suggest(slug), `Available theme atoms: ${ctx.themes.slugs.map((entry) => `\`${entry}\``).join(', ')}.`),
          true,
        );
      }
      return markdown(themeMarkdown(theme, ctx.docs.themes));
    },
  );

  server.registerTool(
    'list_pages',
    {
      description:
        `Index of the Prism docs pages (guides): title, url, and one-liner — the site's llms.txt body. ` +
        `For the component/block/page catalog use list_items. ${IMPORT_RULE}`,
      inputSchema: {},
    },
    () => markdown(pagesIndexMarkdown(ctx.docs.pages, ctx.docs.baseUrl)),
  );

  server.registerTool(
    'get_page',
    {
      description:
        `One Prism docs page as Markdown, by site pathname (e.g. '/docs/theming') — mirrors fumadocs' get_page ` +
        `contract exactly. Docs describe Prism behaviour; inherited antd surface stays with the antd MCP. ${IMPORT_RULE}`,
      inputSchema: { url: z.string().describe("Site pathname, e.g. '/docs/theming'.") },
    },
    ({ url }) => {
      const page = ctx.pages.find(url);
      if (!page) return markdown(missMarkdown(url, ctx.pages.suggest(url), 'Index of pages: `list_pages`.'), true);
      return markdown(pageMarkdown(page, ctx.docs.baseUrl));
    },
  );

  server.registerTool(
    'search_docs',
    {
      description:
        `One search entry point over the whole Prism corpus — components, blocks, pages, and docs pages. Ranked ` +
        `hits with kind, snippet, and the suggested follow-up call. ${ANTD_RULE} ${IMPORT_RULE}`,
      inputSchema: {
        query: z.string().describe('Free text — item names, features, guide topics.'),
        kind: SearchKind.optional().describe("'doc' means a docs page; the other three filter catalog items."),
        limit: z.number().int().min(1).max(10).optional().describe('Max hits, 1–10 (default 5).'),
      },
    },
    ({ query, kind, limit }) => markdown(searchResultsMarkdown(query, searchCorpus(ctx.docs, { query, kind, limit }))),
  );
}
