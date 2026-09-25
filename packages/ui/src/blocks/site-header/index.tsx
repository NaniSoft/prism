'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '../../components/button/index.js';
import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerPopup, DrawerPortal, DrawerTitle, DrawerTrigger, DrawerViewport } from '../../components/drawer/index.js';
import { PrismIcon } from '../../components/icon/index.js';
import { Popover, PopoverPopup, PopoverPositioner, PopoverPortal, PopoverTrigger } from '../../components/popover/index.js';
import { usePrismLink, usePrismTheme, usePrismThemeMode } from '../../provider/index.js';
import { prismProducts, type PrismProductId } from '../../products/index.js';
import { ProductDot } from '../../products/ProductDot.js';
import { cx } from '../../internal/cx.js';

export interface PrismNavLink {
  label: string;
  url: string;
}

export interface SiteHeaderProps {
  site: PrismProductId;
  nav?: readonly PrismNavLink[];
  cta?: ReactNode;
  /** Set false when an outer multi-pack theme provider owns mode selection. */
  modeSwitch?: boolean;
  sticky?: boolean;
  className?: string;
}

function SiteHeaderModeSwitch() {
  const { mode, toggleMode } = usePrismThemeMode();
  const nextMode = mode === 'dark' ? 'light' : 'beam-dark';
  return <Button type="button" variant="ghost" size="icon" aria-label={`Switch to ${nextMode} mode`} iconStart={<PrismIcon name={mode === 'dark' ? 'sun' : 'moon'} />} onClick={toggleMode} />;
}

export function SiteHeader({ site, nav, cta, modeSwitch = true, sticky = true, className }: SiteHeaderProps) {
  const Link = usePrismLink();
  const { mode } = usePrismTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = prismProducts.find((product) => product.id === site)!;

  return (
    <header className={cx('prism-site-header', !sticky && 'prism-site-header--static', className)} data-prism="site-header">
      <div className="prism-site-header__inner">
        <Link href="/" className="prism-site-header__brand"><ProductDot product={current} mode={mode} />{current.name}</Link>
        {nav?.length ? <nav className="prism-site-header__nav" aria-label="Site">{nav.map((entry) => <Link key={`${entry.url}:${entry.label}`} href={entry.url}>{entry.label}</Link>)}</nav> : null}
        <div className="prism-site-header__actions" aria-label="Site actions">
          {cta}
          <Popover>
            <PopoverTrigger className="prism-button prism-button--secondary prism-button--sm" aria-label="Switch NaniSoft product">
              <PrismIcon name="command" size={15} />{current.name}<PrismIcon name="chevron-down" size={14} />
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverPositioner align="start">
                <PopoverPopup className="prism-site-header__products">
                  {prismProducts.map((product) => (
                    <Link key={product.id} href={product.url} aria-current={product.id === site ? 'page' : undefined}>
                      <ProductDot product={product} mode={mode} />{product.name}
                    </Link>
                  ))}
                </PopoverPopup>
              </PopoverPositioner>
            </PopoverPortal>
          </Popover>
          {modeSwitch ? <SiteHeaderModeSwitch /> : null}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger className="prism-button prism-button--ghost prism-button--icon prism-site-header__menu-button" aria-label="Menu"><PrismIcon name="menu" /></DrawerTrigger>
            <DrawerPortal>
              <DrawerBackdrop className="prism-drawer__backdrop" />
              <DrawerViewport className="prism-site-header__drawer-viewport">
                <DrawerPopup className="prism-site-header__drawer-popup">
                  <DrawerContent className="prism-site-header__drawer-content">
                    <div className="prism-site-header__drawer-head">
                      <DrawerTitle className="prism-drawer__title">{current.name}</DrawerTitle>
                      <DrawerClose className="prism-drawer__close" aria-label="Close menu" />
                    </div>
                    {cta ? <div className="prism-site-header__drawer-cta">{cta}</div> : null}
                    {nav?.length ? (
                      <nav className="prism-site-header__drawer-nav" aria-label="Site">
                        {nav?.map((entry) => <Link key={`${entry.url}:${entry.label}`} href={entry.url} onClick={() => setDrawerOpen(false)}>{entry.label}</Link>)}
                      </nav>
                    ) : null}
                    <div className="prism-site-header__drawer-products">
                      {prismProducts.map((product) => (
                        <Link key={product.id} href={product.url} onClick={() => setDrawerOpen(false)}>
                          <ProductDot product={product} mode={mode} />{product.name}{product.id === site ? <span>Current</span> : null}
                        </Link>
                      ))}
                    </div>
                  </DrawerContent>
                </DrawerPopup>
              </DrawerViewport>
            </DrawerPortal>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
