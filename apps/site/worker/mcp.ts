// The /mcp endpoint seam (ticket 22's implementation site).
//
// This module is deliberately the ONLY thing ticket 22 replaces: the Worker
// entry, the router, and wrangler.jsonc (run_worker_first, the /mcp patterns,
// the custom domain) are already in place. The landed implementation will be a
// stateless `createMcpHandler(() => createPrismMcpServer(data))` over
// prism-llms' bundled data.json (ticket 05: no McpAgent, no runtime I/O).

const ALLOWED_METHODS = 'GET, POST, DELETE';

export async function handleMcp(request: Request): Promise<Response> {
  // Streamable HTTP accepts GET (SSE), POST (messages), DELETE (session teardown).
  if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
    return new Response(null, { status: 405, headers: { allow: ALLOWED_METHODS } });
  }
  const body = JSON.stringify({
    error: 'not_implemented',
    message: 'The Prism MCP endpoint is wired but unimplemented — ticket 22 (prism-mcp-server) lands it here.',
    hint: 'Until then, agents read https://prism.nanisoft.com/llms.txt and per-page /md/*.md.',
  });
  return new Response(body, {
    status: 501,
    headers: { 'content-type': 'application/json', allow: ALLOWED_METHODS },
  });
}
