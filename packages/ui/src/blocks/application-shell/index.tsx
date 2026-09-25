'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '../../components/button/index.js';
import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerPopup, DrawerPortal, DrawerTitle, DrawerTrigger, DrawerViewport } from '../../components/drawer/index.js';
import { PrismIcon } from '../../components/icon/index.js';
import { Text } from '../../components/typography/index.js';
import { usePrismLink } from '../../provider/index.js';
import { cx } from '../../internal/cx.js';

export interface ApplicationNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface ApplicationNavGroup {
  label?: string;
  items: readonly ApplicationNavItem[];
}

export interface ApplicationShellProps {
  nav: readonly ApplicationNavGroup[];
  activeUrl?: string;
  header?: ReactNode;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  children: ReactNode;
  className?: string;
}

function Navigation({ groups, activeUrl, onNavigate }: { groups: readonly ApplicationNavGroup[]; activeUrl?: string; onNavigate?: () => void }) {
  const Link = usePrismLink();
  return (
    <nav className="prism-application-shell__nav" aria-label="Application">
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? groupIndex} className="prism-application-shell__nav-group">
          {group.label ? <div className="prism-application-shell__nav-label">{group.label}</div> : null}
          {group.items.map((item) => (
            <Link key={item.href} href={item.href} className={cx('prism-application-shell__nav-link', item.href === activeUrl && 'prism-application-shell__nav-link--active')} aria-current={item.href === activeUrl ? 'page' : undefined} onClick={onNavigate}>
              {item.icon ? <span className="prism-application-shell__nav-icon">{item.icon}</span> : null}
              <span>{item.label}</span>
              {item.badge ? <span className="prism-application-shell__nav-badge">{item.badge}</span> : null}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function ApplicationShell({ nav, activeUrl, header, sidebarHeader, sidebarFooter, children, className }: ApplicationShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className={cx('prism-application-shell', className)} data-prism="application-shell">
      <aside className="prism-application-shell__sidebar">
        <div className="prism-application-shell__sidebar-header">{sidebarHeader}</div>
        <Navigation groups={nav} activeUrl={activeUrl} />
        {sidebarFooter ? <div className="prism-application-shell__sidebar-footer">{sidebarFooter}</div> : null}
      </aside>
      <div className="prism-application-shell__main">
        <header className="prism-application-shell__header">
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen} swipeDirection="right">
            <DrawerTrigger className="prism-application-shell__menu-button" aria-label="Open navigation"><PrismIcon name="menu" /></DrawerTrigger>
            <DrawerPortal>
              <DrawerBackdrop className="prism-drawer__backdrop" />
              <DrawerViewport className="prism-application-shell__drawer-viewport">
                <DrawerPopup className="prism-application-shell__drawer-popup">
                  <DrawerContent className="prism-application-shell__drawer-content">
                    <div className="prism-application-shell__drawer-head"><DrawerTitle className="prism-drawer__title">Navigation</DrawerTitle><DrawerClose className="prism-drawer__close" aria-label="Close navigation" /></div>
                    {sidebarHeader}
                    <Navigation groups={nav} activeUrl={activeUrl} onNavigate={() => setMobileOpen(false)} />
                    {sidebarFooter}
                  </DrawerContent>
                </DrawerPopup>
              </DrawerViewport>
            </DrawerPortal>
          </Drawer>
          {header}
        </header>
        <main className="prism-application-shell__content">{children}</main>
      </div>
    </div>
  );
}

export function ApplicationShellTitle({ title, description }: { title: string; description?: string }) {
  return <div className="prism-application-shell__title"><span>{title}</span>{description ? <Text variant="secondary">{description}</Text> : null}</div>;
}

export function ApplicationShellAction({ children }: { children: ReactNode }) {
  return <Button variant="primary">{children}</Button>;
}
