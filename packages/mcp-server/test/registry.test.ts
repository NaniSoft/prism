// The registration contract (ADR-0004 §2): exactly the eight unprefixed tools,
// tools only, and descriptions that carry the steering surface (import
// invariant + antd delegation rule) every client shows.

import { describe, expect, it } from 'vitest';

import { harness } from './helpers.js';
import type { PrismDocsStore } from '../src/store.js';

const TOOL_NAMES = [
  'list_items',
  'get_item_doc',
  'get_item_props',
  'get_item_source',
  'get_theme_doc',
  'list_pages',
  'get_page',
  'search_docs',
];

describe('registration', () => {
  it('exposes exactly the eight unprefixed tools', async () => {
    const h = await harness();
    try {
      const { tools } = await h.client.request({ method: 'tools/list', params: {} });
      expect(tools.map((tool) => tool.name)).toEqual(TOOL_NAMES);
    } finally {
      await h.close();
    }
  });

  it('serves tools only — resources and prompts are not there', async () => {
    const h = await harness();
    try {
      await expect(h.client.request({ method: 'resources/list', params: {} })).rejects.toThrow(/Method not found/);
      await expect(h.client.request({ method: 'prompts/list', params: {} })).rejects.toThrow(/Method not found/);
    } finally {
      await h.close();
    }
  });

  it('names itself prism-mcp-server at the protocol layer', async () => {
    const h = await harness();
    try {
      const init = await h.client.request({
        method: 'initialize',
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'vitest', version: '0' } },
      });
      expect(init.serverInfo).toMatchObject({ name: 'prism-mcp-server' });
    } finally {
      await h.close();
    }
  });

  it('carries the import invariant and antd delegation in every description', async () => {
    const h = await harness();
    try {
      const { tools } = await h.client.request({ method: 'tools/list', params: {} });
      for (const tool of tools) {
        expect(tool.description, tool.name).toContain("import from '@nanisoft/prism-ui'");
        expect(tool.description, tool.name).toMatch(/antd/);
      }
    } finally {
      await h.close();
    }
  });

  it('describes get_item_doc in the ADR-0004 §2 wording', async () => {
    const h = await harness();
    try {
      const { tools } = await h.client.request({ method: 'tools/list', params: {} });
      const doc = tools.find((tool) => tool.name === 'get_item_doc');
      expect(doc?.description).toContain('usage rules (RFC-2119)');
      expect(doc?.description).toContain('use the antd MCP');
    } finally {
      await h.close();
    }
  });

  it('describes each parameter so the client sees what to pass', async () => {
    const h = await harness();
    try {
      const { tools } = await h.client.request({ method: 'tools/list', params: {} });
      const byName = new Map(tools.map((tool) => [tool.name, tool]));
      const docSchema = byName.get('get_item_doc')?.inputSchema as { properties?: Record<string, { description?: string }> };
      expect(docSchema.properties?.name?.description).toContain("'Button'");
      const searchSchema = byName.get('search_docs')?.inputSchema as { properties?: Record<string, { type?: string; maximum?: number }> };
      expect(searchSchema.properties?.query?.type).toBe('string');
      expect(searchSchema.properties?.limit?.maximum).toBe(10);
    } finally {
      await h.close();
    }
  });

  it('rejects schema violations as tool errors, never throws', async () => {
    const h = await harness();
    try {
      const overLimit = await h.call('search_docs', { query: 'x', limit: 11 });
      expect(overLimit.isError).toBe(true);
      expect((overLimit.content[0] as { text: string }).text).toContain('limit');

      const badKind = await h.call('get_item_doc', { name: 'Button', kind: 'section' });
      expect(badKind.isError).toBe(true);

      const missingName = await h.call('get_item_doc', {});
      expect(missingName.isError).toBe(true);
    } finally {
      await h.close();
    }
  });

  it('tolerates an empty corpus without crashing', async () => {
    const empty: PrismDocsStore = {
      prismVersion: '0.0.0',
      baseUrl: 'https://prism.nanisoft.com',
      items: [],
      pages: [],
      themes: [],
    };
    const h = await harness(empty);
    try {
      await expect(h.text('list_items')).resolves.toContain('Prism 0.0.0');
      await expect(h.text('list_pages')).resolves.toContain('no docs pages');
    } finally {
      await h.close();
    }
  });
});
