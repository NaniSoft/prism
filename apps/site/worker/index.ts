// prism.nanisoft.com's Worker (ticket 21): static site + `.md` negotiation,
// with the /mcp seam reserved for ticket 22. The routing lives in router.ts —
// this entry is only the fetch wiring.

import { handleRequest, type Env } from './router.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
