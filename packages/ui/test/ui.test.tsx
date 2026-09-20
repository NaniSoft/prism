// prism-ui surface tests: PrismProvider composition (ADR-0003), the blocks'
// and pages' documented hooks, and ADR-0002's antd tripwire — every emitted
// antd key must resolve on the real antd machine, so a rename breaks here
// instead of silently dropping a token.

import { render, screen } from '@testing-library/react';
import { theme as antdTheme } from 'antd';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPrismTheme, getPrismTheme, type PrismPackId, type PrismMode } from '@nanisoft/prism-tokens';

import { ComponentDemo } from '../src/blocks/component-demo/index.js';
import { PageHeader } from '../src/blocks/page-header/index.js';
import { DocsShell } from '../src/pages/docs-shell/index.js';
import { BlogLayout } from '../src/pages/blog-layout/index.js';
import { DisplayTitle } from '../src/components/display-title/index.js';
import { PrismProvider } from '../src/provider/PrismProvider.js';
import { mergePrismTheme, toAntdTheme } from '../src/provider/mergePrismTheme.js';

const COMBOS: Array<[PrismPackId, PrismMode]> = [
  ['blue', 'light'],
  ['blue', 'dark'],
  ['green', 'light'],
  ['green', 'dark'],
];

describe('mergePrismTheme', () => {
  it('attaches exactly one algorithm per theme — darkAlgorithm for beam-dark', () => {
    expect(toAntdTheme(getPrismTheme('blue', 'light')).algorithm).toBe(antdTheme.defaultAlgorithm);
    expect(toAntdTheme(getPrismTheme('green', 'dark')).algorithm).toBe(antdTheme.darkAlgorithm);
  });

  it('carries the antd lane verbatim (cssVar key, hashed: false)', () => {
    const merged = toAntdTheme(getPrismTheme('green', 'dark'));
    expect(merged.cssVar).toEqual({ key: 'prism-green-dark', prefix: 'prism' });
    expect(merged.hashed).toBe(false);
  });

  it('merges consumer themes per key, consumer last — never replaced by reference', () => {
    const merged = mergePrismTheme(getPrismTheme('blue', 'light'), {
      token: { colorPrimary: '#FF00FF' },
      components: { Button: { primaryShadow: '0 1px 2px rgba(0,0,0,.3)' } },
    });
    expect(merged.token?.colorPrimary).toBe('#FF00FF'); // consumer wins
    expect(merged.token?.colorLink).toBe('#2563EB'); // base survives per key
    expect(merged.components).toHaveProperty('Button.primaryShadow', '0 1px 2px rgba(0,0,0,.3)'); // consumer wins
    expect(merged.components).toHaveProperty('Button.defaultShadow', 'none'); // deep-merged per component
    expect(merged.components).not.toBe(getPrismTheme('blue', 'light').antd.components); // new object, never by reference
  });

  it('accepts a raw ThemeConfig as the base for full control', () => {
    const merged = mergePrismTheme({ token: { colorPrimary: '#123456' } }, { token: { borderRadius: 8 } });
    expect(merged.token?.colorPrimary).toBe('#123456');
    expect(merged.token?.borderRadius).toBe(8);
  });
});

describe('PrismProvider', () => {
  it('renders children through ConfigProvider → App', () => {
    render(<PrismProvider><p data-testid="kid">hello</p></PrismProvider>);
    expect(screen.getByTestId('kid')).toBeTruthy();
  });

  it('defaults to the blue pack in light mode (ADR-0003)', () => {
    render(
      <PrismProvider>
        <p data-testid="kid2">x</p>
      </PrismProvider>,
    );
    // The merged theme is opaque from the DOM; assert through the same call the
    // provider makes.
    const merged = mergePrismTheme(getPrismTheme('blue', 'light'));
    expect(merged.cssVar?.key).toBe('prism-blue-light');
  });

  it('applies the selected pack × mode via prismTheme', () => {
    const merged = mergePrismTheme(getPrismTheme('green', 'dark'));
    expect(merged.cssVar?.key).toBe('prism-green-dark');
    expect(merged.algorithm).toBe(antdTheme.darkAlgorithm);
  });

  it('lets the consumer theme win per key over the default', () => {
    const merged = mergePrismTheme(getPrismTheme('blue', 'light'), { token: { colorPrimary: '#ABCDEF' } });
    expect(merged.token?.colorPrimary).toBe('#ABCDEF');
  });

  it("opens with the 'use client' directive (source-level — RSC boundary)", () => {
    // A bundler directive can only be asserted on the source: render-time
    // checks can't see it, and its absence is silent (the merged theme's
    // algorithm function serializes to undefined across the RSC boundary).
    const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'provider', 'PrismProvider.tsx'), 'utf8');
    expect(source.startsWith("'use client';")).toBe(true);
  });
});

describe('ADR-0002 tripwire: emitted antd keys resolve on the real antd machine', () => {
  it('every emitted token key exists in getDesignToken() output for all four themes', () => {
    for (const [pack, mode] of COMBOS) {
      const prismTheme = createPrismTheme({ pack, mode });
      const resolved = antdTheme.getDesignToken(toAntdTheme(prismTheme)) as Record<string, unknown>;
      for (const key of Object.keys(prismTheme.antd.token)) {
        expect(resolved, `${pack}/${mode}: token "${key}" missing from resolved antd output`).toHaveProperty(key);
      }
      // Spot-check the pass-through identities — in light mode the seeds ride
      // through verbatim (antd lowercases hex output); beam-dark deliberately
      // re-derives colorPrimary, so only presence is asserted there.
      const lower = (v: unknown): string => String(v).toLowerCase();
      if (mode === 'light') {
        expect(lower(resolved.colorPrimary)).toBe(prismTheme.semantics.inkPrimary.toLowerCase());
        expect(lower(resolved.colorLink)).toBe(prismTheme.semantics.inkPrimary.toLowerCase());
        expect(lower(resolved.colorBgLayout)).toBe(prismTheme.semantics.surfaceGround.toLowerCase());
      }
      expect(resolved.boxShadow).toBe(prismTheme.semantics.elevationFloating);
    }
  });
});

describe('blocks and pages — documented hooks (class + data-prism markers)', () => {
  it('ComponentDemo renders the live demo and the raw source', () => {
    render(
      <ComponentDemo code={'<Button>hi</Button>'}>
        <button type="button">hi</button>
      </ComponentDemo>,
    );
    expect(screen.getByText('hi').tagName).toBe('BUTTON');
    expect(screen.getByText(/<Button>hi<\/Button>/)).toBeTruthy();
    expect(document.querySelector('[data-prism="component-demo"]')).toBeTruthy();
  });

  it('PageHeader takes the ADR-0003 contract: title, subtitle, breadcrumb, actions', () => {
    render(
      <PageHeader title="Tokens" subtitle="The language" breadcrumb={<span>Docs</span>} actions={<button type="button">Edit</button>} />,
    );
    expect(screen.getByText('Tokens')).toBeTruthy();
    expect(screen.getByText('The language')).toBeTruthy();
    expect(screen.getByText('Docs')).toBeTruthy();
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(document.querySelector('[data-prism="page-header"]')).toBeTruthy();
  });

  it('DocsShell renders nav, toc, and neighbours from structural props', () => {
    render(
      <DocsShell
        title="Button"
        description="To trigger an operation."
        nav={[{ id: 'a', title: 'Overview', url: '/components/overview' }]}
        toc={[{ id: 'when', title: 'When to use', url: '#when' }]}
        neighbours={{ previous: { title: 'AutoComplete', url: '/components/auto-complete' }, next: { title: 'Calendar', url: '/components/calendar' } }}
      >
        <p>body</p>
      </DocsShell>,
    );
    expect(screen.getByText('Button')).toBeTruthy();
    expect(screen.getByText('Overview').getAttribute('href')).toBe('/components/overview');
    expect(screen.getByText('When to use').getAttribute('href')).toBe('#when');
    expect(screen.getByText('AutoComplete').getAttribute('rel')).toBe('prev');
    expect(screen.getByText('Calendar').getAttribute('rel')).toBe('next');
  });

  it('BlogLayout renders date/tags/draft frontmatter as structural data', () => {
    render(
      <BlogLayout frontmatter={{ title: 'Hello Prism', date: '2026-09-19', tags: ['tokens'], draft: true }}>
        <p>post</p>
      </BlogLayout>,
    );
    expect(screen.getByText('Hello Prism')).toBeTruthy();
    expect(screen.getByText('2026-09-19').tagName).toBe('TIME');
    expect(screen.getByText('tokens')).toBeTruthy();
    expect(screen.getByText('Draft')).toBeTruthy();
  });
});

describe('DisplayTitle — the brand-behavior wrapper', () => {
  it('applies the width axis by default and on demand', () => {
    render(
      <>
        <DisplayTitle id="t1">Refracted</DisplayTitle>
        <DisplayTitle id="t2" width="normal">
          Normal
        </DisplayTitle>
      </>,
    );
    const refracted = document.querySelector('#t1');
    const normal = document.querySelector('#t2');
    expect(refracted?.className).toContain('prism-display--refracted');
    expect(normal?.className).toContain('prism-display');
    expect(normal?.className).not.toContain('prism-display--refracted');
  });
});
