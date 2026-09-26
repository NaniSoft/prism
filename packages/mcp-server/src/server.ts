/**
 * `createPrismMcpServer`: the transport-free factory ticket 05 fixed as the one
 * seam. It registers the eight read-only tools over a validated
 * `PrismDocsStore` and returns an `McpServer` that any transport can connect.
 *
 * The store guard runs at this door, so a raw `data.json` is validated once and
 * every transport inherits the same rejection. The factory holds no I/O: the
 * Worker bundles the store at build time.
 */
import { McpServer } from '@modelcontextprotocol/server'
import { parsePrismDocsStore, type PrismDocsStore } from '@nanisoft/prism-llms'

import { DESCRIPTIONS } from './descriptions.js'
import {
  getItemDocSchema,
  getItemPropsSchema,
  getItemSourceSchema,
  getPageSchema,
  getThemeDocSchema,
  listItemsSchema,
  listPagesSchema,
  searchDocsSchema,
} from './schemas.js'
import {
  renderItemDoc,
  renderItemProps,
  renderItemSource,
  renderListItems,
  renderListPages,
  renderPage,
  renderThemeDoc,
  searchDocs,
} from './render.js'
import { SERVER_NAME, SERVER_VERSION } from './version.js'

export interface PrismMcpServerOptions {
  /**
   * The corpus build stamp from the MCP lane's generated module. When omitted
   * or `undefined`, `list_items` omits the `(built ...)` clause.
   */
  built?: string
}

/**
 * Build a fresh `McpServer` over `raw`, which may be a parsed `PrismDocsStore`
 * or a raw `data.json` payload. The guard is idempotent on a valid store.
 */
export function createPrismMcpServer(
  raw: unknown,
  options: PrismMcpServerOptions = {},
): McpServer {
  const store: PrismDocsStore = parsePrismDocsStore(raw)
  const built = options.built
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION })

  server.registerTool(
    'list_items',
    {
      title: 'List Prism items',
      description: DESCRIPTIONS.list_items,
      inputSchema: listItemsSchema,
    },
    (args) => renderListItems(store, args ?? {}, built),
  )

  server.registerTool(
    'get_item_doc',
    {
      title: 'Get item documentation',
      description: DESCRIPTIONS.get_item_doc,
      inputSchema: getItemDocSchema,
    },
    (args) => renderItemDoc(store, args),
  )

  server.registerTool(
    'get_item_props',
    {
      title: 'Get item props',
      description: DESCRIPTIONS.get_item_props,
      inputSchema: getItemPropsSchema,
    },
    (args) => renderItemProps(store, args),
  )

  server.registerTool(
    'get_item_source',
    {
      title: 'Get item example source',
      description: DESCRIPTIONS.get_item_source,
      inputSchema: getItemSourceSchema,
    },
    (args) => renderItemSource(store, args),
  )

  server.registerTool(
    'get_theme_doc',
    {
      title: 'Get theme and token contract',
      description: DESCRIPTIONS.get_theme_doc,
      inputSchema: getThemeDocSchema,
    },
    (args) => renderThemeDoc(store, args ?? {}),
  )

  server.registerTool(
    'list_pages',
    {
      title: 'List documentation pages',
      description: DESCRIPTIONS.list_pages,
      inputSchema: listPagesSchema,
    },
    () => renderListPages(store),
  )

  server.registerTool(
    'get_page',
    {
      title: 'Get documentation page',
      description: DESCRIPTIONS.get_page,
      inputSchema: getPageSchema,
    },
    (args) => renderPage(store, args),
  )

  server.registerTool(
    'search_docs',
    {
      title: 'Search the corpus',
      description: DESCRIPTIONS.search_docs,
      inputSchema: searchDocsSchema,
    },
    (args) => searchDocs(store, args),
  )

  return server
}
