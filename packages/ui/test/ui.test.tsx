import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrismTheme } from '@nanisoft/prism-tokens';

import { ApplicationShell } from '../src/blocks/application-shell/index.js';
import { ComponentDemo } from '../src/blocks/component-demo/index.js';
import { DataTable } from '../src/blocks/data-table/index.js';
import { PageHeader } from '../src/blocks/page-header/index.js';
import { StatCard } from '../src/blocks/stat-card/index.js';
import { Button } from '../src/components/button/index.js';
import { Card, CardHeader, CardTitle } from '../src/components/card/index.js';
import { Checkbox } from '../src/components/checkbox/index.js';
import { Field, FieldDescription, FieldLabel } from '../src/components/field/index.js';
import { Input } from '../src/components/input/index.js';
import { Switch } from '../src/components/switch/index.js';
import { Table } from '../src/components/table/index.js';
import { PrismProvider, usePrismTheme } from '../src/provider/index.js';
import { BlogLayout } from '../src/pages/blog-layout/index.js';
import { DocsShell } from '../src/pages/docs-shell/index.js';

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = '';
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
});

describe('PrismProvider', () => {
  it('renders a serializable theme scope with the selected class and variables', () => {
    const theme = getPrismTheme('rose', 'dark');
    const { container } = render(<PrismProvider prismTheme={theme}><p>content</p></PrismProvider>);
    const root = container.querySelector('[data-prism="provider"]')!;
    expect(root.classList.contains('prism-rose-dark')).toBe(true);
    expect((root as HTMLElement).style.getPropertyValue('--prism-primary')).toBe('#F08CB4');
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('exposes the selected theme to client components', () => {
    function Probe() { return <span>{usePrismTheme().pack}</span>; }
    render(<PrismProvider prismTheme={getPrismTheme('green', 'light')}><Probe /></PrismProvider>);
    expect(screen.getByText('green')).toBeTruthy();
  });

  it('can defer the initial CSS scope to a pre-paint document class', () => {
    const theme = getPrismTheme('blue', 'light');
    const { container, rerender } = render(<PrismProvider prismTheme={theme} deferInitialTheme><p>content</p></PrismProvider>);
    const root = container.querySelector('[data-prism="provider"]')!;
    expect(root.classList.contains('prism-blue-light')).toBe(false);
    expect((root as HTMLElement).style.getPropertyValue('--prism-primary')).toBe('');

    rerender(<PrismProvider prismTheme={theme}><p>content</p></PrismProvider>);
    expect(root.classList.contains('prism-blue-light')).toBe(true);
    expect((root as HTMLElement).style.getPropertyValue('--prism-primary')).toBe('#2563EB');
  });
});

describe('components', () => {
  it('Button renders commands, links, and a busy state', () => {
    render(<><Button href="/docs">Read docs</Button><Button loading>Saving</Button></>);
    expect(screen.getByRole('link', { name: 'Read docs' })).toHaveProperty('pathname', '/docs');
    expect(screen.getByRole('button', { name: 'Saving' }).getAttribute('aria-busy')).toBe('true');
  });

  it('Field connects its label and description to the input', () => {
    render(<Field><FieldLabel>Project name</FieldLabel><Input /><FieldDescription>Shown to collaborators.</FieldDescription></Field>);
    expect(screen.getByLabelText('Project name')).toBeTruthy();
    expect(screen.getByText('Shown to collaborators.')).toBeTruthy();
  });

  it('Checkbox and Switch expose checked-change state', () => {
    const checked = vi.fn();
    const switched = vi.fn();
    render(<><Checkbox label="Include drafts" onCheckedChange={checked} /><Switch label="Live mode" onCheckedChange={switched} /></>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include drafts' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Live mode' }));
    expect(checked).toHaveBeenCalledWith(true, expect.anything());
    expect(switched).toHaveBeenCalledWith(true, expect.anything());
  });

  it('Table renders typed content and a real empty state', () => {
    const columns = [{ key: 'name', header: 'Name' }];
    const { rerender } = render(<Table data={[{ name: 'Alpha' }]} columns={columns} getRowKey={(row) => row.name} />);
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeTruthy();
    rerender(<Table data={[]} columns={columns} getRowKey={(row) => row.name} empty="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('CardTitle supports the surrounding heading level', () => {
    render(<Card><CardHeader><CardTitle level={2}>Recent activity</CardTitle></CardHeader></Card>);
    expect(screen.getByRole('heading', { name: 'Recent activity', level: 2 })).toBeTruthy();
  });
});

describe('blocks and pages', () => {
  it('ComponentDemo keeps live content and verbatim source', () => {
    render(<ComponentDemo code="<Button>Save</Button>"><Button>Save</Button></ComponentDemo>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    expect(screen.getByText('<Button>Save</Button>')).toBeTruthy();
  });

  it('PageHeader composes copy and actions without a nested heading shell', () => {
    render(<PageHeader title="Themes" description="Ten expressions" level={1} actions={<Button>Wear</Button>} />);
    expect(screen.getByRole('heading', { name: 'Themes', level: 1 })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Wear' })).toBeTruthy();
  });

  it('StatCard and DataTable expose real product patterns', () => {
    render(<><StatCard label="Components" value="29" change="+4" trend="up" /><DataTable data={[{ id: 'a', name: 'Button' }]} columns={[{ key: 'name', header: 'Name' }]} getRowKey={(row) => row.id} /></>);
    expect(screen.getByText('Components')).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Button' })).toBeTruthy();
  });

  it('DocsShell renders navigation, TOC, and neighbours from structural data', () => {
    render(<DocsShell title="Button" description="Actions." nav={[{ id: 'a', title: 'Overview', url: '/components' }]} toc={[{ id: 'usage', title: 'Usage', url: '#usage' }]} neighbours={{ next: { title: 'Input', url: '/components/input' } }}><p>Body</p></DocsShell>);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveProperty('pathname', '/components');
    expect(screen.getByRole('link', { name: 'Input' }).getAttribute('rel')).toBe('next');
  });

  it('BlogLayout renders article metadata semantically', () => {
    render(<BlogLayout frontmatter={{ title: 'A post', date: '2026-09-25', tags: ['tokens'], draft: true }}><p>Body</p></BlogLayout>);
    expect(screen.getByRole('heading', { name: 'A post' })).toBeTruthy();
    expect(screen.getByText('2026-09-25').tagName).toBe('TIME');
    expect(screen.getByText('Draft')).toBeTruthy();
  });

  it('ApplicationShell composes navigation and content', () => {
    render(<ApplicationShell nav={[{ label: 'Build', items: [{ label: 'Components', href: '/components' }] }]} activeUrl="/components"><p>Work</p></ApplicationShell>);
    expect(screen.getAllByRole('link', { name: 'Components' })[0]).toHaveProperty('pathname', '/components');
    expect(screen.getByText('Work')).toBeTruthy();
  });
});
