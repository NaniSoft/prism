/**
 * `@nanisoft/prism-mcp-server` — the Prism MCP tool surface (ADR-0004).
 *
 * Transport-free: this package exports the pure `createPrismMcpServer(docs)`
 * factory plus the `PrismDocsStore` corpus contract it reads (this package is
 * that interface's canonical home — the consumer). It imports nothing from any
 * other workspace package at runtime; apps/site bundles the factory together
 * with `@nanisoft/prism-llms`' `data.json` at build time.
 */

export { createPrismMcpServer, type PrismMcpServerOptions } from './factory.js';
export { parsePrismDocsStore } from './store.js';
export type { PrismDocsStore, PrismDocsItem, PrismDocsPage, PrismDocsTheme, PrismPrimitive } from './store.js';
