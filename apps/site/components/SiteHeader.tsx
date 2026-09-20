// Site chrome — the shell header every page wears, landing included
// (ticket 12 §1: the pack × mode switcher is shell-level, not per-page).

import Link from 'next/link';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const NAV = [
  { href: '/docs', label: 'Docs' },
  { href: '/themes', label: 'Themes' },
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/pages', label: 'Pages' },
  { href: '/blog', label: 'Blog' },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell site-header__row">
        <Link href="/" className="site-brand">
          Prism
        </Link>
        <span className="site-mono site-brand__note">NANISOFT · DESIGN SYSTEM</span>
        <nav className="site-nav" aria-label="Sections">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeSwitcher />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__row">
        <span className="site-footer__left">
          <span className="site-mono">© 2026 NaniSoft · MIT</span>
          {/* Ticket 17: brand protection lives in a policy page, never in license clauses. */}
          <Link href="/docs/brand" className="site-mono site-footer__link">
            Brand policy
          </Link>
        </span>
        <span className="site-mono site-footer__host">prism.nanisoft.com</span>
      </div>
    </footer>
  );
}
