'use client';

// SiteFooter (ADR-0006 §2): the platform story rendered. The product grid is
// built in and registry-driven — www → Nexus → Atlas → AlphaLens → Prism,
// each with name, tagline, and pack dot — and sites can neither opt out nor
// reorder it. Link columns are site-declared; social links take app-supplied
// icons; `legal` overrides the default "© NaniSoft" line (the published legal
// entity is deliberately still open — the override is the reservation).

import type { ReactNode } from 'react';

import { prismProducts, type PrismProductId } from '../../products/index.js';
import { ProductDot } from '../../products/ProductDot.js';
import { usePrismLink, usePrismThemeMode } from '../../provider/index.js';
import type { PrismNavLink } from '../site-header/index.js';

export interface SiteFooterColumn {
  title: string;
  links: readonly PrismNavLink[];
}

export interface SiteFooterSocialLink {
  label: string;
  url: string;
  /** App-supplied icon — take it from the @nanisoft/prism-ui/icons re-export. */
  icon: ReactNode;
}

export interface SiteFooterProps {
  /** The site's registry id — marks the current product in the grid. */
  site: PrismProductId;
  /** Site-declared link columns, rendered beside the product grid. */
  columns?: readonly SiteFooterColumn[];
  /** Social links with app-supplied icons. */
  social?: readonly SiteFooterSocialLink[];
  /** Overrides the default "© NaniSoft" line. */
  legal?: ReactNode;
  className?: string;
}

export function SiteFooter({ site, columns, social, legal, className }: SiteFooterProps): ReactNode {
  const Link = usePrismLink();
  const { mode } = usePrismThemeMode();

  return (
    <footer
      className={['prism-site-footer', className].filter(Boolean).join(' ')}
      data-prism="site-footer"
    >
      <div className="prism-site-footer__inner">
        <div className="prism-site-footer__products" data-prism="site-footer-products">
          {prismProducts.map((product) => (
            // Link carries only { href, children } — the card (and its data
            // attributes) wraps inside the anchor.
            <Link key={product.id} href={product.url}>
              <span
                className="prism-site-footer__product"
                data-prism="site-footer-product"
                data-product={product.id}
                data-current={product.id === site ? 'true' : undefined}
              >
                <span className="prism-site-footer__product-head">
                  <ProductDot product={product} mode={mode} />
                  <span className="prism-site-footer__product-name">{product.name}</span>
                </span>
                <span className="prism-site-footer__product-tagline">{product.tagline}</span>
              </span>
            </Link>
          ))}
        </div>

        {columns?.length ? (
          <nav className="prism-site-footer__columns">
            {columns.map((column) => (
              <div key={column.title} className="prism-site-footer__column">
                <h3 className="prism-site-footer__column-title">{column.title}</h3>
                {column.links.map((link) => (
                  <Link key={link.url} href={link.url}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        ) : null}

        <div className="prism-site-footer__base">
          {social?.length ? (
            <div className="prism-site-footer__social">
              {social.map((entry) => (
                <Link key={entry.url} href={entry.url}>
                  {/* The visually hidden label names the link no matter which
                      Link implementation an app provides; the icon is decorative
                      (its own aria-label would otherwise pollute the name). */}
                  <span className="prism-site-footer__social-link" title={entry.label}>
                    <span aria-hidden="true">{entry.icon}</span>
                    <span className="prism-visually-hidden">{entry.label}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
          <div className="prism-site-footer__legal">{legal ?? <span>© NaniSoft</span>}</div>
        </div>
      </div>
    </footer>
  );
}
