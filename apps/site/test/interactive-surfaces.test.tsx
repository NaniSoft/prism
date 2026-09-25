import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildCatalog } from '@nanisoft/prism-ui/catalog';

import { CatalogSearch, ProductWindowWall, type LandingCatalogItem } from '../components/LandingSpecimen.js';
import { ThemeControls } from '../components/ThemeControls.js';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

const CATALOG: readonly LandingCatalogItem[] = buildCatalog().map((entry) => ({
  title: entry.name,
  url: `/${entry.layer}/${entry.id}`,
  description: entry.description,
  layer: entry.layer,
}));

describe('interactive site surfaces', () => {
  it('searches every checked catalog item and honors suggested queries', () => {
    render(<CatalogSearch catalog={CATALOG} />);

    const results = screen.getByRole('region', { name: 'Catalog search results' });
    expect(within(results).getAllByRole('link')).toHaveLength(43);
    expect(within(results).getByText('43 of 43 items')).toBeTruthy();
    expect(within(results).getAllByText('Component')).toHaveLength(29);
    expect(within(results).getAllByText('Block')).toHaveLength(9);
    expect(within(results).getAllByText('Page')).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: 'settings' }));
    const settingsResults = within(results).getAllByRole('link');
    expect(settingsResults.some((link) => link.textContent?.includes('SettingsPage'))).toBe(true);
    expect(within(results).getByText(`${settingsResults.length} of 43 items`)).toBeTruthy();
  });

  it('moves emphasis between real page slots without autoplay', () => {
    render(
      <ProductWindowWall
        dashboard={<div>Dashboard canvas</div>}
        settings={<div>Settings canvas</div>}
        docs={<div>Docs canvas</div>}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain('DashboardPage');
    expect(screen.getByRole('link', { name: 'Open DashboardPage source' })).toBeTruthy();
    expect(screen.getByText('Dashboard canvas').parentElement?.getAttribute('aria-hidden')).toBe(null);

    fireEvent.click(screen.getByRole('radio', { name: /SettingsPage/ }));

    expect(screen.getByRole('status').textContent).toContain('SettingsPage');
    expect(screen.getByText('Settings canvas').parentElement?.getAttribute('aria-hidden')).toBe(null);
    expect(screen.getByText('Dashboard canvas').parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('makes theme island controls local and announced', () => {
    render(<ThemeControls pack="blue" mode="dark" />);

    fireEvent.click(screen.getByRole('button', { name: 'ghost' }));
    expect(screen.getByRole('status', { name: 'Theme specimen status' }).textContent).toContain('ghost button');

    fireEvent.change(screen.getByRole('textbox', { name: 'Filter the blue dark theme specimen' }), {
      target: { value: 'ghost' },
    });
    expect(screen.getByRole('status', { name: 'Theme specimen status' }).textContent).toContain('Matches: ghost');
  });
});
