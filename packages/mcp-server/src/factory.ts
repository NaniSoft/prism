/**
 * The pure, transport-agnostic factory (ADR-0004): tool logic written once
 * here, served by any transport. The site Worker wires it through
 * `createMcpHandler(factory)`; a stdio-only client bridges with
 * `npx mcp-remote` — there is deliberately no second implementation.
 *
 * The factory runs per request on the Worker lane, so the lookup maps are
 * built inside it (never at isolate scope — ticket 05's startup-limit rule).
 */

import { McpServer } from '@modelcontextprotocol/server';

import { createItemLookup, createPageLookup, createThemeLookup } from './lookup.js';
import { registerPrismTools } from './tools.js';
import { parsePrismDocsStore, type PrismDocsStore } from './store.js';
import { SERVER_NAME, SERVER_VERSION } from './version.js';

export interface PrismMcpServerOptions {
  /**
   * The corpus build date (`YYYY-MM-DD`) for the `list_items` header.
   *
   * `PrismDocsStore` carries no build date (ADR-0004 §5 fixes the interface and
   * prism-llms emits exactly those fields), so the bundler supplies this when
   * it knows one; when absent the header simply states version + counts rather
   * than inventing a date. If prism-llms grows a `built` field, render it from
   * the store and retire this option.
   */
  readonly built?: string;
}

/**
 * Build an `McpServer` with the eight Prism tools over `docs`. Pure: reads
 * `docs`, touches no I/O, registers no transport. The store guard runs here at
 * the door as well — callers that bypass their own validation get a precise
 * `TypeError` naming the field, not a deep tool failure.
 */
export function createPrismMcpServer(docs: PrismDocsStore, options: PrismMcpServerOptions = {}): McpServer {
  const store = parsePrismDocsStore(docs);
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerPrismTools(server, {
    docs: store,
    items: createItemLookup(store.items),
    pages: createPageLookup(store.pages, store.baseUrl),
    themes: createThemeLookup(store.themes),
    built: options.built,
  });
  return server;
}
