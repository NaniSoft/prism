// The pack-colour dot (ADR-0006 §2): how the chrome says "this is which
// product" without words. Products wear their pack ink; www wears the
// five-pack spectrum. Presentational — the registry owns the colour decision,
// this only renders it.

import type { CSSProperties, ReactNode } from 'react';

import { productDotBackground, type PrismProduct } from './index.js';

export function ProductDot({ product, className }: { product: PrismProduct; className?: string }): ReactNode {
  const style: CSSProperties = { background: productDotBackground(product) };
  return (
    <span
      className={['prism-product-dot', className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
      data-product={product.id}
    />
  );
}
