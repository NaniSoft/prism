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
  /** Use `region` when a composed page is embedded inside another page landmark. */
  landmark?: 'main' | 'region';
  className?: string;
}

function Navigation({ groups, activeUrl, onNavigate }: { groups: readonly ApplicationNavGroup[]; activeUrl?: string; onNavigate?: () => void }) {
  const Link = usePrismLink();
  const hasItems = groups.some((group) => group.items.length > 0);

  return (
    <nav className="prism-application-shell__nav" aria-label="Application">
      {hasItems ? groups.map((group, groupIndex) => (
        <div key={group.label ?? groupIndex} className="prism-application-shell__nav-group">
          {group.label ? <div className="prism-application-shell__nav-label">{group.label}</div> : null}
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx('prism-application-shell__nav-link', item.href === activeUrl && 'prism-application-shell__nav-link--active')}
              aria-current={item.href === activeUrl ? 'page' : undefined}
              onClick={onNavigate}
            >
              {item.icon ? <span className="prism-application-shell__nav-icon" aria-hidden="true">{item.icon}</span> : null}
              <span>{item.label}</span>
              {item.badge ? <span className="prism-application-shell__nav-badge">{item.badge}</span> : null}
            </Link>
          ))}
        </div>
      )) : <Text variant="tertiary">No navigation items</Text>}
    </nav>
  );
}

export function ApplicationShell({ nav, activeUrl, header, sidebarHeader, sidebarFooter, children, landmark = 'main', className }: ApplicationShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const ContentElement = landmark === 'main' ? 'main' : 'div';

  return (
    <div className={cx('prism-application-shell', className)} data-prism="application-shell">
      <aside className="prism-application-shell__sidebar" aria-label="Application sidebar">
        {sidebarHeader ? <div className="prism-application-shell__sidebar-header">{sidebarHeader}</div> : null}
        <Navigation groups={nav} activeUrl={activeUrl} />
        {sidebarFooter ? <div className="prism-application-shell__sidebar-footer">{sidebarFooter}</div> : null}
      </aside>
      <div className="prism-application-shell__main">
        <header className="prism-application-shell__header" aria-label="Application header">
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen} swipeDirection="right">
            <DrawerTrigger className="prism-application-shell__menu-button" aria-label="Open navigation"><PrismIcon name="menu" /></DrawerTrigger>
            <DrawerPortal>
              <DrawerBackdrop className="prism-drawer__backdrop" />
              <DrawerViewport className="prism-application-shell__drawer-viewport">
                <DrawerPopup className="prism-application-shell__drawer-popup">
                  <DrawerContent className="prism-application-shell__drawer-content">
                    <div className="prism-application-shell__drawer-head">
                      <DrawerTitle className="prism-drawer__title">Application navigation</DrawerTitle>
                      <DrawerClose className="prism-drawer__close" aria-label="Close navigation" />
                    </div>
                    {sidebarHeader ? <div className="prism-application-shell__sidebar-header">{sidebarHeader}</div> : null}
                    <Navigation groups={nav} activeUrl={activeUrl} onNavigate={() => setMobileOpen(false)} />
                    {sidebarFooter ? <div className="prism-application-shell__sidebar-footer">{sidebarFooter}</div> : null}
                  </DrawerContent>
                </DrawerPopup>
              </DrawerViewport>
            </DrawerPortal>
          </Drawer>
          {header}
        </header>
        <ContentElement
          className="prism-application-shell__content"
          {...(landmark === 'region' ? { role: 'region', 'aria-label': 'Application content' } : {})}
        >
          {children}
        </ContentElement>
      </div>
    </div>
  );
}

export function ApplicationShellTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="prism-application-shell__title">
      <span className="prism-application-shell__brand">{title}</span>
      {description ? <div><Text variant="tertiary">{description}</Text></div> : null}
    </div>
  );
}

export function ApplicationShellAction({ children }: { children: ReactNode }) {
  return <Button type="button" variant="primary">{children}</Button>;
}
