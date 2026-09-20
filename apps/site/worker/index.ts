// prism.nanisoft.com's Worker (tickets 21 + 22): static site, `.md`
// negotiation, and the /mcp MCP endpoint. The routing lives in router.ts —
// this entry is only the fetch wiring, including the runtime's execution
// context, which the MCP lane needs (ticket 22 review round 1: ctx must reach
// `createMcpHandler`, not be dropped here).

import { handleRequest, type Env, type WorkerExecutionContext } from './router.js';

export default {
  async fetch(request: Request, env: Env, ctx?: WorkerExecutionContext): Promise<Response> {
    return handleRequest(request, env, ctx);
  },
};
