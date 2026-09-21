// The products registry (ADR-0006 §3): the closed five-entry list that
// SiteHeader's switcher and SiteFooter's product grid both render from — one
// list, so the two can never disagree. Subdomain URLs are hardcoded constants;
// the list is frozen, so "closed" is true by construction.
//
// Future Products is deliberately absent: it is a www landing node, not a
// site, and the chrome only ever links to real ones. www rides in as the
// company root (every product site's switcher needs the way back) and carries
// no single pack — it layers all five.

import { prismBrandPacks, type PrismPackId } from '@nanisoft/prism-tokens';

export type PrismProductId = 'www' | 'nexus' | 'atlas' | 'alphalens' | 'prism';

export interface PrismProduct {
  readonly id: PrismProductId;
  readonly kind: 'company' | 'product';
  readonly name: string;
  readonly tagline: string;
  readonly url: string;
  /** The product's brand pack. Null only for the company root (www), which wears all five. */
  readonly pack: PrismPackId | null;
}

const WWW: PrismProduct = Object.freeze({
  id: 'www',
  kind: 'company',
  name: 'NaniSoft',
  tagline: 'Software that builds software.',
  url: 'https://www.nanisoft.com',
  pack: null,
});

/** The registry in platform-story order: company root, then the products built on Nexus, then the language they wear. */
export const prismProducts: readonly PrismProduct[] = Object.freeze([
  WWW,
  Object.freeze({
    id: 'nexus',
    kind: 'product',
    name: 'Nexus',
    tagline: 'The Agent Factory — autonomous software creation.',
    url: 'https://nexus.nanisoft.com',
    pack: 'lavender',
  }),
  Object.freeze({
    id: 'atlas',
    kind: 'product',
    name: 'Atlas',
    tagline: 'The Digital Twin Platform — living models of real systems.',
    url: 'https://atlas.nanisoft.com',
    pack: 'green',
  }),
  Object.freeze({
    id: 'alphalens',
    kind: 'product',
    name: 'AlphaLens',
    tagline: 'Quantitative trading research for the Indian market.',
    url: 'https://alphalens.nanisoft.com',
    pack: 'rose',
  }),
  Object.freeze({
    id: 'prism',
    kind: 'product',
    name: 'Prism',
    tagline: 'One design language across every product.',
    url: 'https://prism.nanisoft.com',
    pack: 'blue',
  }),
]);

/** Registry lookup; misses return undefined so callers can branch on identity. */
export function getPrismProduct(id: PrismProductId): PrismProduct | undefined {
  return prismProducts.find((product) => product.id === id);
}

/**
 * The pack-colour dot's CSS `background`: a product wears its own pack ink;
 * www wears the five-pack spectrum (a conic sweep of every ink), because the
 * company is the one entry that has no single colour.
 */
export function productDotBackground(product: PrismProduct): string {
  if (product.pack) return prismBrandPacks[product.pack].ink.light;
  // The five-pack spectrum in ADR-0005 order, closed back onto blue so the
  // wheel is seamless at 0°.
  const inks = (['blue', 'green', 'lavender', 'rose', 'peach', 'blue'] as const).map(
    (pack) => prismBrandPacks[pack].ink.light,
  );
  return `conic-gradient(${inks.join(', ')})`;
}
