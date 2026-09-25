import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismIcon } from '../src/components/icon/index.js';
import { PRISM_THEME_MODE_STORAGE_KEY } from '../src/theming/index.js';
import { PrismThemeModeProvider } from '../src/provider/index.js';
import { SiteFooter } from '../src/blocks/site-footer/index.js';
import { SiteHeader } from '../src/blocks/site-header/index.js';

function chromeUi(node: React.ReactElement): React.ReactElement {
  return <PrismThemeModeProvider pack="lavender">{node}</PrismThemeModeProvider>;
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.className = '';
});

describe('SiteHeader', () => {
  it('renders product identity, nav, and CTA', () => {
    render(chromeUi(<SiteHeader site="nexus" nav={[{ label: 'Docs', url: '/docs' }, { label: 'Blog', url: '/blog' }]} cta={<a href="/start">Get started</a>} />));
    expect(screen.getByRole('link', { name: 'Nexus' })).toHaveProperty('pathname', '/');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveProperty('pathname', '/docs');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveProperty('pathname', '/start');
  });

  it('switches mode through the same class and storage contract', () => {
    render(chromeUi(<SiteHeader site="nexus" />));
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement.classList.contains('prism-lavender-light')).toBe(true);
    expect(localStorage.getItem(PRISM_THEME_MODE_STORAGE_KEY)).toBe('light');
  });

  it('opens mobile navigation with the same links', () => {
    render(chromeUi(<SiteHeader site="nexus" nav={[{ label: 'Docs', url: '/docs' }]} />));
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(document.querySelector('.prism-site-header__drawer-popup')?.textContent).toContain('Docs');
  });
});

describe('SiteFooter', () => {
  it('renders the closed product registry and current marker', () => {
    render(chromeUi(<SiteFooter site="atlas" mode="dark" />));
    const grid = document.querySelector('[data-prism="site-footer-products"]')!;
    expect(grid.querySelectorAll('[data-prism="site-footer-product"]')).toHaveLength(5);
    expect(grid.querySelector('[data-current="true"]')?.getAttribute('data-product')).toBe('atlas');
  });

  it('renders site columns, social links, and legal override', () => {
    render(chromeUi(<SiteFooter site="nexus" columns={[{ title: 'Product', links: [{ label: 'Docs', url: '/docs' }] }]} social={[{ label: 'GitHub', url: 'https://github.com/NaniSoft', icon: <PrismIcon name="external-link" /> }]} legal={<span>Imprint: NaniSoft Ltd.</span>} />));
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveProperty('pathname', '/docs');
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveProperty('href', 'https://github.com/NaniSoft');
    expect(screen.getByText('Imprint: NaniSoft Ltd.')).toBeTruthy();
  });
});
