'use client';

/**
 * PROTOTYPE (map ticket 11, resolved) — the winning landing direction:
 * "Specimen" (dark-first, antd worn loudly). The losing variants (Ledger,
 * Workbench) and the dev-only switcher live on the `prototype/landing-variants`
 * branch. The real prism-ui page is built in the site-build pass; until then
 * this stands in on the site's `/` route.
 */
import type { ReactElement } from 'react';

import { VariantASpecimen } from './variant-a-specimen.js';

export function LandingPrototype(): ReactElement {
  return <VariantASpecimen />;
}
