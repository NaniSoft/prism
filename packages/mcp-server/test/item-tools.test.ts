// The four per-item tools: catalog header/count/grouping, verbatim docs,
// props-delta delegation, example source — plus case-insensitivity, kind
// disambiguation, and did-you-mean misses (ADR-0004 §1/§2).

import { afterEach, describe, expect, it } from 'vitest';

import { FIXTURE } from './fixture.js';
import { harness, type Harness } from './helpers.js';

let h: Harness;
afterEach(async () => {
  await h?.close();
});

describe('list_items', () => {
  it('opens with the corpus version, per-kind counts, and (when known) the build date', async () => {
    h = await harness();
    const text = await h.text('list_items');
    expect(text).toMatch(/^Prism 1\.2\.3 — 2 components, 2 blocks, 1 page\n/);

    const dated = await harness(FIXTURE, { built: '2026-09-19' });
    try {
      expect(await dated.text('list_items')).toMatch(/^Prism 1\.2\.3 — 2 components, 2 blocks, 1 page \(built 2026-09-19\)\n/);
    } finally {
      await dated.close();
    }
  });

  it('groups the catalog by kind and marks pass-throughs with their antd base', async () => {
    h = await harness();
    const text = await h.text('list_items');
    expect(text).toContain('## Components');
    expect(text).toContain('## Blocks');
    expect(text).toContain('## Pages');
    expect(text).toContain('- **Button** — antd Button, unchanged — a pass-through re-export. Import from \'@nanisoft/prism-ui\'. _(extends antd Button)_');
    expect(text).toContain('- **PageHeader** — Page-opening block: title, subtitle, breadcrumb, right-aligned actions.');
    expect(text).toContain("Always import from '@nanisoft/prism-ui', never from antd directly.");
  });

  it('filters to one kind while the header still describes the whole corpus', async () => {
    h = await harness();
    const text = await h.text('list_items', { kind: 'block' });
    expect(text).toContain('Filtered to blocks — omit `kind` for the whole catalog.');
    expect(text).toContain('- **PageHeader**');
    expect(text).toContain('- **StatRow**');
    expect(text).not.toContain('## Components');
  });
});

describe('get_item_doc', () => {
  it('returns the generator page verbatim plus a data-driven footer', async () => {
    h = await harness();
    const text = await h.text('get_item_doc', { name: 'PageHeader' });
    expect(text).toContain('# PageHeader\n\nPrism block. Usage: MUST keep actions right-aligned');
    expect(text).toContain('Prism-added props only: `get_item_props { "name": "PageHeader" }`');
    expect(text).toContain('Copyable example source: `get_item_source { "name": "PageHeader" }`');
  });

  it('steers pass-throughs to the antd MCP from the data', async () => {
    h = await harness();
    const text = await h.text('get_item_doc', { name: 'Button' });
    expect(text).toContain('Inherited antd props and demos: antd MCP `antd_info Button`');
    expect(text).toContain('_No additional props beyond the antd base component._');
  });

  it('resolves names case-insensitively', async () => {
    h = await harness();
    const text = await h.text('get_item_doc', { name: 'pageheader' });
    expect(text).toContain('# PageHeader');
  });

  it('answers a miss with did-you-mean and the catalog pointer, as an error', async () => {
    h = await harness();
    const result = await h.call('get_item_doc', { name: 'PageHeadr' });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('`PageHeadr` not found.');
    expect(text).toContain('Did you mean: **PageHeader**?');
    expect(text).toContain('`list_items`');
  });

  it('treats a wrong kind as a miss, not a silent hit', async () => {
    h = await harness();
    const result = await h.call('get_item_doc', { name: 'Button', kind: 'block' });
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toBe(
      '`Button` is a component, not a block. Retry with `kind` omitted — or with `"component"`.',
    );
  });
});

describe('get_item_props', () => {
  it('returns only the Prism-added props section', async () => {
    h = await harness();
    const text = await h.text('get_item_props', { name: 'DisplayTitle' });
    expect(text).toBe(FIXTURE.items[1]!.props);
  });

  it('answers a pass-through with the antd-MCP routing line', async () => {
    h = await harness();
    const text = await h.text('get_item_props', { name: 'button' });
    expect(text).toContain('Button — antd Button, unchanged. Props: use the antd MCP (`antd_info Button`).');
    expect(text).toContain('_No additional props beyond the antd base component._');
  });

  it('points a prop-less Prism item at its full doc', async () => {
    h = await harness();
    const text = await h.text('get_item_props', { name: 'StatRow' });
    expect(text).toContain('`StatRow` documents no Prism-added props in this build.');
    expect(text).toContain('`get_item_doc { "name": "StatRow" }`');
  });
});

describe('get_item_source', () => {
  it('returns the first example verbatim in one fenced tsx block', async () => {
    h = await harness();
    const text = await h.text('get_item_source', { name: 'PageHeader' });
    expect(text).toContain('# PageHeader — example source: Basic (`basic`)');
    expect(text).toContain('```tsx\nimport { PageHeader } from \'@nanisoft/prism-ui\';\n\nexport const Basic = () => <PageHeader title="Settings" />;\n```');
    expect(text).toContain('Other examples: `with-actions` — pass `example` to pick one.');
  });

  it('picks a named example, case-insensitively', async () => {
    h = await harness();
    const text = await h.text('get_item_source', { name: 'PageHeader', example: 'WITH-ACTIONS' });
    expect(text).toContain('export const WithActions = ()');
  });

  it('misses an unknown example slug with the available slugs', async () => {
    h = await harness();
    const result = await h.call('get_item_source', { name: 'PageHeader', example: 'actions' });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('Did you mean: **with-actions**?');
  });

  it('tells the agent where usage lives when an item documents no examples', async () => {
    h = await harness();
    const result = await h.call('get_item_source', { name: 'Button' });
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('`Button` documents no examples in this build');
    expect((result.content[0] as { text: string }).text).toContain('`get_item_doc { "name": "Button" }`');
  });
});
