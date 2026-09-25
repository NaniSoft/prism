import { describe, expect, it } from 'vitest';
import { parsePrismDocsStore } from '@nanisoft/prism-mcp-server';
import raw from '../dist/data.json';

/**
 * The emitted store, validated through the same runtime guard the check gate
 * (invariant 5) and the MCP factory door use — the type-only devDependency
 * pulling the contract in from its canonical home.
 */
const store = parsePrismDocsStore(raw);

describe('the emitted PrismDocsStore', () => {
  it('carries the prism-ui version and production baseUrl', () => {
    expect(store.prismVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(store.baseUrl).toBe('https://prism.nanisoft.com');
  });

  it('projects the curated component → block → page catalog', () => {
    const kinds = store.items.map((item) => item.kind);
    expect(kinds.filter((kind) => kind === 'component').length).toBe(29);
    expect(kinds.filter((kind) => kind === 'block').length).toBe(9);
    expect(kinds.filter((kind) => kind === 'page').length).toBe(5);
    expect(new Set(store.items.map((item) => item.name)).size).toBe(store.items.length);
  });

  it('marks internal primitive foundations without exposing an upstream API', () => {
    const button = store.items.find((item) => item.name === 'Button');
    expect(button?.primitive).toBe('base-ui');

    const table = store.items.find((item) => item.name === 'Table');
    expect(table?.primitive).toBe('native');
    expect(store.items.every((item) => item.primitive === 'base-ui' || item.primitive === 'native')).toBe(true);
  });

  it('ships verbatim example code under the item', () => {
    const block = store.items.find((item) => item.name === 'ComponentDemo');
    expect(block?.doc).toContain('## Props');
    expect(block?.doc).toContain('`code`');
  });

  it('holds ten theme atoms and a blog-free page lane', () => {
    expect(store.themes.map((theme) => theme.slug)).toEqual([
      'blue-dark',
      'blue-light',
      'green-dark',
      'green-light',
      'lavender-dark',
      'lavender-light',
      'peach-dark',
      'peach-light',
      'rose-dark',
      'rose-light',
    ]);
    expect(store.themes.every((theme) => theme.markdown.includes('createPrismTheme'))).toBe(true);
    expect(store.pages.every((page) => !page.url.startsWith('/blog'))).toBe(true);
  });
});
