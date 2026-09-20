// The /mcp lane, end to end (ticket 22): the real `handleRequest` → the real
// `createMcpHandler` wiring → the real bundled prism-llms corpus, exercised
// with MCP protocol round-trips. Only the ASSETS binding is stubbed — `/mcp`
// must never reach it.

import { describe, expect, it, vi } from 'vitest';

import { handleRequest, type Env } from '../worker/router.js';

function stubEnv(): { env: Env; calls: Request[] } {
  const calls: Request[] = [];
  return {
    calls,
    env: {
      ASSETS: {
        fetch: vi.fn(async (input: Request | string | URL) => {
          calls.push(input instanceof Request ? input : new Request(input));
          return new Response('<html>asset</html>', { status: 200 });
        }),
      } as unknown as Env['ASSETS'],
    },
  };
}

/** A JSON-RPC request to the deployed host, with Host pinned for the allowlist. */
function rpc(body: unknown, host = 'prism.nanisoft.com'): Request {
  return new Request(`https://${host}/mcp`, {
    method: 'POST',
    headers: { host, 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify(body),
  });
}

const call = (id: number, method: string, params: Record<string, unknown> = {}) => ({ jsonrpc: '2.0', id, method, params });

/** Extract the JSON-RPC payload whether the lane answered JSON or SSE-framed. */
async function payload(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (response.headers.get('content-type')?.includes('event-stream')) {
    const data = text
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('');
    return JSON.parse(data) as Record<string, unknown>;
  }
  return JSON.parse(text) as Record<string, unknown>;
}

describe('POST /mcp — the MCP protocol round-trip', () => {
  it('initializes as prism-mcp-server over the real transport', async () => {
    const { env, calls } = stubEnv();
    const response = await handleRequest(rpc(call(1, 'initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'vitest', version: '0' },
    })), env);

    expect(response.status).toBe(200);
    const body = await payload(response);
    const result = body.result as { serverInfo: { name: string } };
    expect(result.serverInfo.name).toBe('prism-mcp-server');
    expect(calls).toHaveLength(0); // never falls through to assets
  });

  it('lists exactly the eight unprefixed tools from the bundled corpus', async () => {
    const { env } = stubEnv();
    const body = await payload(await handleRequest(rpc(call(2, 'tools/list')), env));
    const { tools } = body.result as { tools: Array<{ name: string }> };
    expect(tools.map((tool) => tool.name)).toEqual([
      'list_items',
      'get_item_doc',
      'get_item_props',
      'get_item_source',
      'get_theme_doc',
      'list_pages',
      'get_page',
      'search_docs',
    ]);
  });

  it('calls a tool for real: list_items echoes the bundled prismVersion + counts', async () => {
    const { env } = stubEnv();
    const body = await payload(await handleRequest(rpc(call(3, 'tools/call', { name: 'list_items', arguments: {} })), env));
    const result = body.result as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(false);
    expect(result.content[0]!.text).toMatch(/^Prism [\d.]+ — \d+ components?/);

    const miss = await payload(await handleRequest(rpc(call(4, 'tools/call', { name: 'get_item_doc', arguments: { name: 'Buton' } })), env));
    const missResult = miss.result as { isError: boolean; content: Array<{ text: string }> };
    expect(missResult.isError).toBe(true);
    expect(missResult.content[0]!.text).toContain('Did you mean:');
  });
});

describe('transport guards the endpoint', () => {
  it('answers only the message methods — GET and DELETE are stateless 405s', async () => {
    const { env } = stubEnv();
    for (const method of ['GET', 'DELETE']) {
      const response = await handleRequest(new Request('https://prism.nanisoft.com/mcp', { method, headers: { host: 'prism.nanisoft.com' } }), env);
      expect(response.status, method).toBe(405);
    }
  });

  it('rejects hosts outside the allowedHostnames allowlist', async () => {
    const { env } = stubEnv();
    const response = await handleRequest(rpc(call(5, 'tools/list'), 'evil.example.com'), env);
    expect(response.status).toBe(403);
  });

  it('404s a non-route path under /mcp/ (exact route match) without touching assets', async () => {
    const { env, calls } = stubEnv();
    const response = await handleRequest(
      new Request('https://prism.nanisoft.com/mcp/', {
        method: 'POST',
        headers: { host: 'prism.nanisoft.com', 'content-type': 'application/json' },
        body: JSON.stringify(call(6, 'tools/list')),
      }),
      env,
    );
    expect(response.status).toBe(404);
    expect(calls).toHaveLength(0);
  });
});
