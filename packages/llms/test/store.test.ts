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

  it('projects the whole catalog: components, blocks, pages', () => {
    const kinds = store.items.map((item) => item.kind);
    expect(kinds.filter((kind) => kind === 'component').length).toBeGreaterThanOrEqual(70);
    expect(kinds.filter((kind) => kind === 'block').length).toBe(4);
    expect(kinds.filter((kind) => kind === 'page').length).toBe(2);
    expect(new Set(store.items.map((item) => item.name)).size).toBe(store.items.length);
  });

  it('marks pass-throughs with antdBase and leaves wrappers bare', () => {
    const button = store.items.find((item) => item.name === 'Button');
    expect(button?.antdBase).toBe('Button');
    expect(button?.props).toBeUndefined();

    const displayTitle = store.items.find((item) => item.name === 'DisplayTitle');
    expect(displayTitle?.antdBase).toBeUndefined();
    expect(displayTitle?.props).toContain('`width`');
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
