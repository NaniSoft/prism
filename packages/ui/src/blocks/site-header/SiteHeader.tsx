'use client';

// SiteHeader (ADR-0006 §1): the one header a site wears everywhere — landing
// and docs alike. Identity by registry id as a plain prop; nav is lean
// { label, url } through usePrismLink; optional right-pinned CTA; sticky by
// default. Built in and not prop-configurable: the product switcher, the
// theme-mode toggle, and the mobile drawer. One header, no variants.

import { AppstoreOutlined, DownOutlined, MenuOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Drawer, Dropdown } from 'antd';
import { useState, type ReactNode } from 'react';

import { prismProducts, type PrismProductId } from '../../products/index.js';
import { ProductDot } from '../../products/ProductDot.js';
import { usePrismLink, usePrismThemeMode } from '../../provider/index.js';

export interface PrismNavLink {
  label: string;
  url: string;
}

export interface SiteHeaderProps {
  /** The site's registry id — identity is static and known at build time. */
  site: PrismProductId;
  /** Lean site nav, rendered between the brand and the actions. */
  nav?: readonly PrismNavLink[];
  /** Right-pinned call to action, before the switcher. */
  cta?: ReactNode;
  /** Sticky by default; pass false to pin the header static. */
  sticky?: boolean;
  className?: string;
}

export function SiteHeader({ site, nav, cta, sticky = true, className }: SiteHeaderProps): ReactNode {
  const Link = usePrismLink();
  const { mode, toggleMode } = usePrismThemeMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = prismProducts.find((product) => product.id === site)!;
  const switcherItems = prismProducts.map((product) => ({
    key: product.id,
    label:
      product.id === site ? (
        <span className="prism-site-header__switcher-current" aria-current="true">
          <ProductDot product={product} mode={mode} />
          {product.name}
        </span>
      ) : (
        <Link href={product.url}>
          <ProductDot product={product} mode={mode} />
          {product.name}
        </Link>
      ),
  }));

  const nextMode = mode === 'dark' ? 'light' : 'beam-dark';

  return (
    <header
      className={['prism-site-header', sticky ? null : 'prism-site-header--static', className]
        .filter(Boolean)
        .join(' ')}
      data-prism="site-header"
    >
      <div className="prism-site-header__inner">
        {/* Link carries only { href, children } — brand styling wraps inside. */}
        <Link href="/">
          <span className="prism-site-header__brand">
            <ProductDot product={current} mode={mode} />
            {current.name}
          </span>
        </Link>

        {nav?.length ? (
          <nav className="prism-site-header__nav" aria-label="Site">
            {nav.map((entry) => (
              <Link key={entry.url} href={entry.url}>
                {entry.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="prism-site-header__actions">
          {cta}
          <Button
            className="prism-site-header__menu-button"
            type="text"
            aria-label="Menu"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
          <Dropdown
            trigger={['click']}
            menu={{
              items: switcherItems,
              selectable: false,
              className: 'prism-site-header__switcher',
            }}
          >
            <Button icon={<AppstoreOutlined />} aria-label="NaniSoft products">
              <span className="prism-site-header__switcher-trigger">
                {current.name}
                <DownOutlined className="prism-site-header__switcher-caret" />
              </span>
            </Button>
          </Dropdown>
          <Button
            type="text"
            aria-label={`Switch to ${nextMode} mode`}
            icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleMode}
          />
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={current.name}
        placement="left"
        className="prism-site-header__drawer-root"
      >
        <div className="prism-site-header__drawer" data-prism="site-drawer">
          <nav className="prism-site-header__drawer-nav" aria-label="Site">
            {nav?.map((entry) => (
              <Link key={entry.url} href={entry.url}>
                {entry.label}
              </Link>
            ))}
          </nav>
          <div className="prism-site-header__drawer-products">
            {prismProducts.map((product) => (
              <Link key={product.id} href={product.url}>
                <ProductDot product={product} mode={mode} />
                {product.name}
                {product.id === site ? <span className="prism-site-header__drawer-here">here</span> : null}
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
