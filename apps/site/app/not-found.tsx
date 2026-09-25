// Static-export 404 (wrangler.jsonc points not_found_handling at it: Next
// emits out/404.html from this route).

import Link from 'next/link';
import type { ReactElement } from 'react';
import { Button } from '@nanisoft/prism-ui/components/button';

export default function NotFound(): ReactElement {
  return (
    <div className="site-catalog">
      <h1 className="site-catalog__title">404</h1>
      <p className="site-empty">
        This page does not exist. The docs live at <Link href="/docs">/docs</Link>, the catalog at{' '}
        <Link href="/components">/components</Link> — and agents read{' '}
        <Link href="/llms.txt">/llms.txt</Link>.
      </p>
      <div className="site-landing__cta">
        <Button variant="primary" href="/">
          Back to the landing
        </Button>
      </div>
    </div>
  );
}
