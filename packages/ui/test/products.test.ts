// The products registry (ADR-0006 §3): the closed five-entry list that
// SiteHeader's switcher and SiteFooter's product grid both render from — one
// list, so the two can never disagree. Future Products is deliberately absent:
// it is a www landing node, not a site.

import { describe, expect, it } from 'vitest';
import { prismBrandPacks } from '@nanisoft/prism-tokens';

import { getPrismProduct, prismProducts, productDotBackground } from '../src/products/index.js';

describe('products registry', () => {
  it('is the closed five-entry list in platform-story order (www → Nexus → Atlas → AlphaLens → Prism)', () => {
    expect(prismProducts.map((p) => p.id)).toEqual(['www', 'nexus', 'atlas', 'alphalens', 'prism']);
  });

  it('www rides as the company root; every other entry is a product', () => {
    expect(prismProducts.map((p) => p.kind)).toEqual(['company', 'product', 'product', 'product', 'product']);
  });

  it('hardcodes the five subdomain URLs', () => {
    expect(Object.fromEntries(prismProducts.map((p) => [p.id, p.url]))).toEqual({
      www: 'https://www.nanisoft.com',
      nexus: 'https://nexus.nanisoft.com',
      atlas: 'https://atlas.nanisoft.com',
      alphalens: 'https://alphalens.nanisoft.com',
      prism: 'https://prism.nanisoft.com',
    });
  });

  it('carries the locked pack map — www layers all five and carries no single pack', () => {
    expect(getPrismProduct('nexus')?.pack).toBe('lavender');
    expect(getPrismProduct('atlas')?.pack).toBe('green');
    expect(getPrismProduct('alphalens')?.pack).toBe('rose');
    expect(getPrismProduct('prism')?.pack).toBe('blue');
    expect(getPrismProduct('www')?.pack).toBeNull();
  });

  it('excludes Future Products — peach belongs to no site', () => {
    expect(prismProducts.some((p) => p.pack === 'peach')).toBe(false);
  });

  it('is frozen — closed by construction', () => {
    expect(Object.isFrozen(prismProducts)).toBe(true);
    for (const product of prismProducts) expect(Object.isFrozen(product)).toBe(true);
  });

  it('lookup misses return undefined', () => {
    expect(getPrismProduct('future')).toBeUndefined();
  });
});

describe('productDotBackground', () => {
  it('products wear their own pack ink', () => {
    expect(productDotBackground(getPrismProduct('nexus')!)).toBe(prismBrandPacks.lavender.ink.light);
    expect(productDotBackground(getPrismProduct('alphalens')!)).toBe(prismBrandPacks.rose.ink.light);
  });

  it('resolves the pack ink for the ambient mode (beam-dark dots use the lightened inks)', () => {
    expect(productDotBackground(getPrismProduct('nexus')!, 'dark')).toBe(prismBrandPacks.lavender.ink.dark);
    expect(productDotBackground(getPrismProduct('alphalens')!, 'dark')).toBe(prismBrandPacks.rose.ink.dark);
  });

  it('www wears the five-pack spectrum (the company carries every pack)', () => {
    const background = productDotBackground(getPrismProduct('www')!);
    expect(background).toContain('conic-gradient');
    for (const pack of Object.keys(prismBrandPacks)) {
      expect(background).toContain(prismBrandPacks[pack as keyof typeof prismBrandPacks].ink.light);
    }
  });
});
