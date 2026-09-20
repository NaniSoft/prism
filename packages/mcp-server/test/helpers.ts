/**
 * Test harness: the real factory over a fixture store, driven by a real MCP
 * client over an in-memory transport pair — the tools are exercised at the
 * protocol level, not through test doubles.
 */

import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport, type CallToolResult, type McpServer } from '@modelcontextprotocol/server';

import { createPrismMcpServer, type PrismMcpServerOptions } from '../src/factory.js';
import type { PrismDocsStore } from '../src/store.js';
import { FIXTURE } from './fixture.js';

export interface Harness {
  readonly client: Client;
  readonly server: McpServer;
  /** `tools/call` — the full protocol result. */
  call(name: string, args?: Record<string, unknown>): Promise<CallToolResult>;
  /** `tools/call`, unwrapped to the markdown text every tool answers with. */
  text(name: string, args?: Record<string, unknown>): Promise<string>;
  close(): Promise<void>;
}

export async function harness(docs: PrismDocsStore = FIXTURE, options?: PrismMcpServerOptions): Promise<Harness> {
  const server = createPrismMcpServer(docs, options);
  const client = new Client({ name: 'vitest', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return {
    client,
    server,
    call: (name, args = {}) => client.request({ method: 'tools/call', params: { name, arguments: args } }),
    text: async (name, args = {}) => {
      const result = await client.request({ method: 'tools/call', params: { name, arguments: args } });
      const first = result.content[0];
      if (first?.type !== 'text') throw new Error(`expected text content from ${name}`);
      return first.text;
    },
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
