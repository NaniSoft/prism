/**
 * The `/mcp` lane: the read-only MCP surface over the bundled corpus.
 *
 * `createMcpHandler` from the Agents SDK's MCP server entry is the current,
 * non-deprecated pattern (`McpAgent` is feature-frozen). It owns the `/mcp`
 * route, the host allowlist, CORS and JSON response shaping, and calls the
 * transport-free `createPrismMcpServer` factory once per request.
 *
 * The store is `@nanisoft/prism-llms`'s `data.json` imported as an ESM module
 * and bundled by the Worker bundler, then validated by the factory's guard in
 * memory. There is no `fs`, `fetch`, KV, cache or binding beyond `ASSETS`, and
 * no lookup map is built at isolate scope.
 *
 * Public read-only in version one. The optional Cloudflare Access escalation is
 * applied through `withCloudflareAccess` and is inert while disabled; see
 * `access.ts` for the flip trigger and the steps.
 */
import { createMcpHandler } from 'agents/mcp/server'
import docsData from '@nanisoft/prism-llms/data.json'
import { BUILT, createPrismMcpServer } from '@nanisoft/prism-mcp-server'

import { withCloudflareAccess } from './access'

const handler = withCloudflareAccess(
  createMcpHandler(() => createPrismMcpServer(docsData, { built: BUILT }), {
    route: '/mcp',
    allowedHostnames: ['prism.nanisoft.com'],
    corsOptions: false,
    responseMode: 'json',
  }),
)

/** The MCP lane entry the Worker routes `/mcp` and `/mcp/*` to. */
export function handleMcp(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
  return handler(request, env, ctx)
}

export { handler as mcpHandler }
