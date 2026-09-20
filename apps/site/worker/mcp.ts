// The /mcp endpoint (ticket 22): a stateless Streamable-HTTP MCP server over
// prism-llms' bundled corpus. Tool logic lives in `@nanisoft/prism-mcp-server`;
// this module is only transport wiring — `createMcpHandler(factory)` from the
// Agents SDK (ticket 05: no McpAgent, no runtime I/O; the corpus is bundled at
// build time, so deploy is invalidation).
//
// Options are pinned by ADR-0004 §6: the production hostname (the handler's
// default allowlist is localhost + `*.workers.dev` only), no CORS (no browser
// client in v1), JSON responses (docs tools are small — never stream).

import { createMcpHandler } from 'agents/mcp/server';
import { createPrismMcpServer, parsePrismDocsStore } from '@nanisoft/prism-mcp-server';
import docsData from '@nanisoft/prism-llms/data.json';
import { PRISM_DOCS_BUILT } from './generated/mcp-data-built.js';
import type { WorkerExecutionContext } from './router.js';

const NOOP_CONTEXT: WorkerExecutionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

/**
 * The JSON import arrives type-widened (a JSON literal cannot preserve the
 * `kind` literals), so `parsePrismDocsStore` is the door: it validates the
 * literals and hands the factory a real `PrismDocsStore`. The factory runs per
 * request — the stateless handler builds a fresh server each time — so the
 * lookup maps are built per request too, never at isolate scope (ticket 05's
 * 1 s startup rule). `PRISM_DOCS_BUILT` is generated from the corpus build
 * output by scripts/stamp-mcp-data.mjs; `undefined` simply omits the header's
 * `(built …)` clause.
 */
const handler = createMcpHandler(
  () => createPrismMcpServer(parsePrismDocsStore(docsData), { built: PRISM_DOCS_BUILT }),
  {
    route: '/mcp',
    allowedHostnames: ['prism.nanisoft.com'],
    corsOptions: false,
    responseMode: 'json',
  },
);

/**
 * Handle one `/mcp` request. `env` is unused (the corpus is bundled, there are
 * no bindings). `ctx` is the runtime's execution context, threaded from
 * worker/index.ts through router.ts so the handler can schedule background
 * work with `ctx.waitUntil` — only tests call this bare and fall back to the
 * no-op context.
 */
export function handleMcp(request: Request, ctx: WorkerExecutionContext = NOOP_CONTEXT): Promise<Response> {
  return handler(request, undefined, ctx);
}
