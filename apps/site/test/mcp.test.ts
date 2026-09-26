import { Client, StreamableHTTPClientTransport, type FetchLike } from '@modelcontextprotocol/client'
import { describe, expect, it } from 'vitest'

import { handleRequest } from '../worker/index'
import { handleMcp } from '../worker/mcp'

const ORIGIN = 'https://prism.nanisoft.com'
const HOST = 'prism.nanisoft.com'
const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext

/** An env whose asset binding throws, proving `/mcp` never falls through to it. */
const guardedEnv = {
  ASSETS: {
    fetch: async (): Promise<Response> => {
      throw new Error('the /mcp lane must not touch the asset binding')
    },
  },
}

function initializeBody(): string {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'site-test', version: '0.0.0' },
    },
  })
}

/**
 * A Worker Request carries the `Host` header; Node's `new Request` does not,
 * so the tests set it explicitly to stand in for Cloudflare's routing.
 */
function request(url: string, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers)
  headers.set('host', new URL(url).host)
  return new Request(url, { ...init, headers })
}

function postInit(url: string): Request {
  return request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: initializeBody(),
  })
}

describe('the site Worker MCP lane', () => {
  it('round-trips a real client through handleMcp over the bundled corpus', async () => {
    const fetchFn: FetchLike = async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString()
      return handleMcp(request(url, init ?? {}), guardedEnv, ctx)
    }
    const transport = new StreamableHTTPClientTransport(new URL(`${ORIGIN}/mcp`), {
      fetch: fetchFn,
    })
    const client = new Client({ name: 'site-test', version: '0.0.0' })
    try {
      await client.connect(transport)
      expect(client.getServerVersion()).toMatchObject({ name: 'prism-mcp-server' })
      const { tools } = await client.listTools()
      expect(tools).toHaveLength(8)
      const result = await client.callTool({ name: 'list_items', arguments: {} })
      const block = result.content[0]
      expect(block?.type).toBe('text')
      if (block?.type === 'text') {
        expect(block.text).toContain('28 components, 10 blocks, 4 pages')
      }
    } finally {
      await client.close()
    }
  })

  it('rejects a Host outside the allowlist with 403', async () => {
    const response = await handleMcp(postInit('https://evil.example.com/mcp'), guardedEnv, ctx)
    expect(response.status).toBe(403)
  })

  it('answers GET and DELETE on the exact route with 405', async () => {
    const get = await handleMcp(request(`${ORIGIN}/mcp`, { method: 'GET' }), guardedEnv, ctx)
    expect(get.status).toBe(405)
    const del = await handleMcp(request(`${ORIGIN}/mcp`, { method: 'DELETE' }), guardedEnv, ctx)
    expect(del.status).toBe(405)
  })

  it('answers the subtree path /mcp/ with 404', async () => {
    const response = await handleMcp(postInit(`${ORIGIN}/mcp/`), guardedEnv, ctx)
    expect(response.status).toBe(404)
  })

  it('routes /mcp through the Worker without touching the asset binding', async () => {
    const response = await handleRequest(postInit(`${ORIGIN}/mcp`), guardedEnv, ctx)
    expect(response.status).toBe(200)
  })

  it('allows a Host header in different case', async () => {
    const response = await handleMcp(postInit(`https://${HOST.toUpperCase()}/mcp`), guardedEnv, ctx)
    expect(response.status).toBe(200)
  })
})
