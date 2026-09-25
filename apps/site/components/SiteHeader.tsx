'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerPopup,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from '@nanisoft/prism-ui/components/drawer';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';

interface NavItem {
  href: string;
  label: string;
}

const NAV_GROUPS: readonly { label: string; items: readonly NavItem[] }[] = [
  {
    label: 'Build',
    items: [
      { href: '/components', label: 'Components' },
      { href: '/blocks', label: 'Blocks' },
      { href: '/pages', label: 'Pages' },
    ],
  },
  {
    label: 'Learn',
    items: [
      { href: '/docs', label: 'Docs' },
      { href: '/themes', label: 'Themes' },
      { href: '/blog', label: 'Journal' },
    ],
  },
];

const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="site-shell site-header__row">
        <Link href="/" className="site-brand"><PrismIcon name="command" size={17} />Prism</Link>
        <nav className="site-nav" aria-label="Sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="site-nav__group" role="group" aria-label={group.label}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  className={isCurrent(item.href) ? 'site-nav__link--current' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <ThemeSwitcher />
        <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
          <DrawerTrigger className="site-header__menu-button" aria-label="Open menu"><PrismIcon name="menu" /></DrawerTrigger>
          <DrawerPortal>
            <DrawerBackdrop className="site-drawer__backdrop" />
            <DrawerViewport className="site-drawer__viewport">
              <DrawerPopup className="site-drawer__popup">
                <DrawerContent className="site-drawer__content">
                  <div className="site-drawer__head"><DrawerTitle className="site-drawer__title">Prism</DrawerTitle><DrawerClose className="site-drawer__close" aria-label="Close menu" /></div>
                  <nav className="site-drawer__nav" aria-label="Mobile sections">
                    {NAV_ITEMS.map((item) => <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
                  </nav>
                  <div className="site-drawer__theme">
                    <ThemeSwitcher placement="drawer" />
                  </div>
                  <div className="site-drawer__agent"><span>Agent surfaces</span><Link href="/llms.txt" onClick={() => setMenuOpen(false)}>llms.txt</Link><Link href="/docs/quickstart#for-agents" onClick={() => setMenuOpen(false)}>MCP setup</Link></div>
                </DrawerContent>
              </DrawerPopup>
            </DrawerViewport>
          </DrawerPortal>
        </Drawer>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__row">
        <div className="site-footer__left">
          <span className="site-mono">© 2026 NaniSoft · MIT</span>
          <Link href="/llms.txt" className="site-mono site-footer__link">llms.txt</Link>
          <Link href="/docs/quickstart#for-agents" className="site-mono site-footer__link">MCP setup</Link>
          <Link href="/docs/brand" className="site-mono site-footer__link">Brand policy</Link>
        </div>
        <Link href="/llms.txt" className="site-mono site-footer__host">Agent corpus <PrismIcon name="arrow-right" size={14} /></Link>
      </div>
    </footer>
  );
}
