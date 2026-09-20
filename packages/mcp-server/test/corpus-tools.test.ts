// The corpus-wide tools: theme pass-through, the docs-page lane (list_pages /
// get_page, mirroring fumadocs' contracts), and term-frequency search with its
// cap and follow-up pointers (ADR-0004 §1/§3).

import { afterEach, describe, expect, it } from 'vitest';

import type { PrismDocsStore } from '../src/store.js';
import { harness, type Harness } from './helpers.js';
import { FIXTURE } from './fixture.js';

let h: Harness;
afterEach(async () => {
  await h?.close();
});

describe('get_theme_doc', () => {
  it('defaults to the blue light atom and passes its markdown through verbatim', async () => {
    h = await harness();
    expect(await h.text('get_theme_doc')).toBe('# Theming — blue pack · light mode\n\n---\n\nOther theme atoms: `blue-dark`, `green-light`, `green-dark` — pass `pack`/`mode` to switch.');
  });

  it('resolves an explicit pack and mode', async () => {
    h = await harness();
    const text = await h.text('get_theme_doc', { pack: 'green', mode: 'dark' });
    expect(text).toContain('# Theming — green pack · dark mode');
  });

  it('misses an atom the corpus does not have, suggesting the ones it does', async () => {
    const partial: PrismDocsStore = { ...FIXTURE, themes: [FIXTURE.themes[0]!] };
    h = await harness(partial);
    const result = await h.call('get_theme_doc', { pack: 'green', mode: 'dark' });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('`green-dark` not found.');
    expect(text).toContain('Available theme atoms: `blue-light`.');
  });
});

describe('list_pages', () => {
  it('indexes title, url, and one-liner with the read pointer', async () => {
    h = await harness();
    const text = await h.text('list_pages');
    expect(text).toContain('# Prism docs pages');
    expect(text).toContain('Found 2:');
    expect(text).toContain('- **Theming** — `/docs/theming` — Brand packs and modes; createPrismTheme().');
    expect(text).toContain('  → `get_page { "url": "/docs/theming" }`');
    expect(text).toContain('Full site index: https://prism.nanisoft.com/llms.txt');
  });

  it('is honest when the build carries no docs pages', async () => {
    const pageless: PrismDocsStore = { ...FIXTURE, pages: [] };
    h = await harness(pageless);
    const text = await h.text('list_pages');
    expect(text).toContain('This build carries no docs pages — the catalog is the whole corpus for now.');
    expect(text).toContain('Catalog: `list_items`.');
  });
});

describe('get_page', () => {
  it('returns the prerendered markdown verbatim, cited to the site', async () => {
    h = await harness();
    const text = await h.text('get_page', { url: '/docs/theming' });
    expect(text).toContain('# Theming\n\nBrand packs and modes; `createPrismTheme({ pack: "green", mode: "dark" })`.');
    expect(text).toContain('Source: https://prism.nanisoft.com/docs/theming');
  });

  it('tolerates case, trailing slashes, and absolute site URLs', async () => {
    h = await harness();
    await expect(h.text('get_page', { url: '/Docs/Theming/' })).resolves.toContain('# Theming');
    await expect(h.text('get_page', { url: 'https://prism.nanisoft.com/docs/getting-started' })).resolves.toContain('# Getting started');
  });

  it('misses with did-you-mean urls and the list_pages pointer', async () => {
    h = await harness();
    const result = await h.call('get_page', { url: '/docs/themng' });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('Did you mean: **/docs/theming**?');
    expect(text).toContain('Index of pages: `list_pages`.');
  });
});

describe('search_docs', () => {
  it('ranks a name match first and prints its suggested follow-up call', async () => {
    h = await harness();
    const text = await h.text('search_docs', { query: 'settings' });
    expect(text).toContain('# Search results for "settings"');
    expect(text).toContain('## SettingsPage (page)');
    expect(text).toContain('→ `get_item_source { "name": "SettingsPage" }` for the copyable source.');
  });

  it('finds docs pages and points at get_page', async () => {
    h = await harness();
    const text = await h.text('search_docs', { query: 'theming' });
    expect(text).toContain('## Theming (doc)');
    expect(text).toContain('→ `get_page { "url": "/docs/theming" }`');
  });

  it('steers a pass-through hit to the antd MCP', async () => {
    h = await harness();
    const text = await h.text('search_docs', { query: 'pass-through re-export' });
    expect(text).toContain('## Button (component)');
    expect(text).toContain('→ `antd_info Button (antd MCP)`');
  });

  it('defaults to 5 hits and honours the limit parameter', async () => {
    h = await harness();
    const everything = await h.text('search_docs', { query: 'prism block' });
    const found = everything.match(/Found (\d+) result\(s\)/);
    expect(found?.[1]).toBe('5');

    const two = await h.text('search_docs', { query: 'prism block', limit: 2 });
    expect(two).toContain('Found 2 result(s)');
  });

  it('filters by kind, including the docs-page kind', async () => {
    h = await harness();
    const docsOnly = await h.text('search_docs', { query: 'theming', kind: 'doc' });
    expect(docsOnly).toContain('## Theming (doc)');
    expect(docsOnly).not.toMatch(/\(component\)|\(block\)|\(page\)/);

    const blocksOnly = await h.text('search_docs', { query: 'settings', kind: 'block' });
    expect(blocksOnly).not.toContain('## SettingsPage');
  });

  it('answers an empty result set with guidance, not an error', async () => {
    h = await harness();
    const result = await h.call('search_docs', { query: 'zzzzqqqq' });
    expect(result.isError).toBe(false);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('No matches.');
    expect(text).toContain('`list_items`');
  });
});
