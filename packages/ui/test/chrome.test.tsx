// The chrome blocks (ADR-0006 §1–2): SiteHeader and SiteFooter. Identity by
// registry id as a plain prop; the switcher, the mode toggle, the mobile
// drawer, and the footer's product grid are built in — not prop-configurable,
// because they are the platform story rendered.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GithubOutlined } from '@ant-design/icons';

import { PRISM_THEME_MODE_STORAGE_KEY } from '../src/theming/index.js';
import { PrismThemeModeProvider } from '../src/provider/index.js';
import { SiteFooter } from '../src/blocks/site-footer/index.js';
import { SiteHeader } from '../src/blocks/site-header/index.js';

function chromeUi(node: React.ReactElement): React.ReactElement {
  return <PrismThemeModeProvider pack="lavender">{node}</PrismThemeModeProvider>;
}

function renderHeader(sticky?: boolean): void {
  render(
    chromeUi(
      <SiteHeader
        site="nexus"
        nav={[
          { label: 'Docs', url: '/docs' },
          { label: 'Blog', url: '/blog' },
        ]}
        cta={<a href="/start">Get started</a>}
        {...(sticky === undefined ? {} : { sticky })}
      />,
    ),
  );
}

function htmlPrismClasses(): string[] {
  return Array.from(document.documentElement.classList).filter((c) => c.startsWith('prism-'));
}

beforeEach(() => {
  // jsdom has no ResizeObserver; the switcher's dropdown needs one.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.className = '';
});

describe('SiteHeader', () => {
  it('renders the site identity as a link home (registry id in, name out)', () => {
    renderHeader();
    const brand = screen.getByRole('link', { name: 'Nexus' });
    expect(brand.getAttribute('href')).toBe('/');
  });

  it('renders nav entries as links', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs');
    expect(screen.getByRole('link', { name: 'Blog' }).getAttribute('href')).toBe('/blog');
  });

  it('renders the optional right-pinned CTA and omits nothing when absent', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Get started' }).getAttribute('href')).toBe('/start');
    cleanup();
    render(chromeUi(<SiteHeader site="nexus" />));
    expect(screen.queryByRole('link', { name: 'Get started' })).toBeNull();
  });

  it('is sticky by default and can be pinned static', () => {
    renderHeader();
    expect(document.querySelector('.prism-site-header--static')).toBeNull();
    cleanup();
    renderHeader(false);
    expect(document.querySelector('.prism-site-header--static')).toBeTruthy();
  });

  it('the product switcher lists all five registry entries with the current site marked', async () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'NaniSoft products' }));
    const menu = await screen.findByRole('menu');
    for (const name of ['NaniSoft', 'Nexus', 'Atlas', 'AlphaLens', 'Prism']) {
      expect(menu.textContent).toContain(name);
    }
    expect(menu.querySelector('[aria-current="true"]')?.textContent).toContain('Nexus');
  });

  it('the mode toggle flips the html class and persists through the shared key', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(htmlPrismClasses()).toEqual(['prism-lavender-light']);
    expect(localStorage.getItem(PRISM_THEME_MODE_STORAGE_KEY)).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to beam-dark mode' })).toBeTruthy();
  });

  it('the mobile drawer carries the nav and the product list', () => {
    renderHeader();
    expect(document.querySelector('[data-prism="site-drawer"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const drawer = document.querySelector('[data-prism="site-drawer"]');
    expect(drawer).toBeTruthy();
    const links = Array.from(drawer!.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toContain('/docs');
    expect(links).toContain('/blog');
    expect(links).toContain('https://atlas.nanisoft.com');
  });
});

describe('SiteFooter', () => {
  it('renders the registry-driven product grid — built in, not opt-out-able', () => {
    render(chromeUi(<SiteFooter site="nexus" />));
    const grid = document.querySelector('[data-prism="site-footer-products"]')!;
    const names = Array.from(grid.querySelectorAll('[data-prism="site-footer-product"]')).map(
      (el) => el.getAttribute('data-product'),
    );
    expect(names).toEqual(['www', 'nexus', 'atlas', 'alphalens', 'prism']);
    expect(grid.textContent).toContain('The Digital Twin Platform — living models of real systems.');
  });

  it('marks the current site in the product grid', () => {
    render(chromeUi(<SiteFooter site="atlas" />));
    expect(
      document.querySelector('[data-prism="site-footer-product"][data-current="true"]')?.getAttribute('data-product'),
    ).toBe('atlas');
  });

  it('renders site-declared link columns', () => {
    render(
      chromeUi(
        <SiteFooter
          site="nexus"
          columns={[{ title: 'Product', links: [{ label: 'Docs', url: '/docs' }] }]}
        />,
      ),
    );
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs');
  });

  it('renders social links with app-supplied icons', () => {
    render(
      chromeUi(
        <SiteFooter
          site="nexus"
          social={[{ label: 'GitHub', url: 'https://github.com/NaniSoft', icon: <GithubOutlined /> }]}
        />,
      ),
    );
    const social = screen.getByRole('link', { name: 'GitHub' });
    expect(social.getAttribute('href')).toBe('https://github.com/NaniSoft');
    expect(social.querySelector('.anticon')).toBeTruthy();
  });

  it('defaults the legal line and honours the override', () => {
    render(chromeUi(<SiteFooter site="nexus" />));
    expect(screen.getByText(/© NaniSoft/)).toBeTruthy();
    cleanup();
    render(chromeUi(<SiteFooter site="nexus" legal={<span>Imprint: NaniSoft Ltd.</span>} />));
    expect(screen.getByText('Imprint: NaniSoft Ltd.')).toBeTruthy();
    expect(screen.queryByText(/© NaniSoft/)).toBeNull();
  });
});
