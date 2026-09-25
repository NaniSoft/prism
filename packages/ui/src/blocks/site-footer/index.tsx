'use client';

import type { ReactNode } from 'react';
import type { PrismMode } from '@nanisoft/prism-tokens';

import { usePrismLink } from '../../provider/index.js';
import { prismProducts, type PrismProductId } from '../../products/index.js';
import { ProductDot } from '../../products/ProductDot.js';
import type { PrismNavLink } from '../site-header/index.js';
import { cx } from '../../internal/cx.js';

export interface SiteFooterColumn { title: string; links: readonly PrismNavLink[]; }
export interface SiteFooterSocialLink { label: string; url: string; icon: ReactNode; }
export interface SiteFooterProps {
  site: PrismProductId;
  mode?: PrismMode;
  columns?: readonly SiteFooterColumn[];
  social?: readonly SiteFooterSocialLink[];
  legal?: ReactNode;
  className?: string;
}

export function SiteFooter({ site, mode = 'light', columns, social, legal, className }: SiteFooterProps) {
  const Link = usePrismLink();
  return (
    <footer className={cx('prism-site-footer', className)} data-prism="site-footer">
      <div className="prism-site-footer__inner">
        <div className="prism-site-footer__products" data-prism="site-footer-products">
          {prismProducts.map((product) => (
            <Link key={product.id} href={product.url} className="prism-site-footer__product-link">
              <span className="prism-site-footer__product" data-prism="site-footer-product" data-product={product.id} data-current={product.id === site ? 'true' : undefined}>
                <span className="prism-site-footer__product-head"><ProductDot product={product} mode={mode} />{product.name}</span>
                <span className="prism-site-footer__product-tagline">{product.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
        {columns?.length ? <nav className="prism-site-footer__columns" aria-label="Footer">{columns.map((column) => <div key={column.title} className="prism-site-footer__column"><h2>{column.title}</h2>{column.links.map((link) => <Link key={link.url} href={link.url}>{link.label}</Link>)}</div>)}</nav> : null}
        <div className="prism-site-footer__base">
          {social?.length ? <div className="prism-site-footer__social">{social.map((entry) => <Link key={entry.url} href={entry.url} aria-label={entry.label}><span aria-hidden="true">{entry.icon}</span></Link>)}</div> : <span />}
          <div className="prism-site-footer__legal">{legal ?? <span>© NaniSoft</span>}</div>
        </div>
      </div>
    </footer>
  );
}
