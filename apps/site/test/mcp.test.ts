import { Client, StreamableHTTPClientTransport, type FetchLike } from '@modelcontextprotocol/client'
import { parsePrismDocsStore } from '@nanisoft/prism-llms'
import docsData from '@nanisoft/prism-llms/data.json'
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
      expect(tools).toHaveLength(9)
      const result = await client.callTool({ name: 'list_items', arguments: {} })
      const block = result.content[0]
      expect(block?.type).toBe('text')
      if (block?.type === 'text') {
        // Derived from the corpus the Worker bundles rather than restated as a
        // literal. A literal is a count in a test: it fails on every new
        // catalogue item, so the response is to edit the test, and then it
        // asserts only that someone remembered. The tool count is fixed at nine
        // because that is a closed surface this test does own; the roster is not.
        // The same corpus the Worker bundles, imported the same way the Worker
        // imports it, so the expectation and the thing under test read one file.
        const store = parsePrismDocsStore(docsData as unknown)
        const byKind = (kind: string) => store.items.filter((item) => item.kind === kind).length
        expect(block.text).toContain(
          `${byKind('component')} components, ${byKind('block')} blocks, ${byKind('page')} pages`,
        )
      }
    } finally {
      await client.close()
    }
  })

  it('answers a changelog request over the Worker from the bundled corpus', async () => {
    // The ninth tool, proved over the same transport a real agent uses rather
    // than against the renderer. A published breaking change has to be
    // discoverable here, which is the one thing the reference design system this
    // is modelled on cannot do: its corpus has no changelog and no tool that
    // could return one.
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
      const result = await client.callTool({
        name: 'get_changelog',
        arguments: { package: '@nanisoft/prism-ui', version: '0.5.0' },
      })
      const block = result.content[0]
      expect(block?.type).toBe('text')
      if (block?.type === 'text') {
        expect(block.text).toContain('# @nanisoft/prism-ui - 0.5.0')
        expect(block.text).toContain('clean break')
      }
      const miss = await client.callTool({
        name: 'get_changelog',
        arguments: { package: '@nanisoft/prism-ui', version: '0.4.0' },
      })
      expect(miss.isError).toBe(true)
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
