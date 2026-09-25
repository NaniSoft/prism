'use client';

import { Button } from '@nanisoft/prism-ui/components/button';
import { DisplayTitle, Text } from '@nanisoft/prism-ui/components/typography';
import { PrismProvider } from '@nanisoft/prism-ui/provider';
import { getPrismTheme } from '@nanisoft/prism-tokens';

import { useThemeSelection } from '@/components/SiteThemeProvider';

export function DocsDaylight() {
  const { selection } = useThemeSelection();
  return (
    <PrismProvider prismTheme={getPrismTheme(selection.pack, 'light')}>
      <section className="site-landing__daylight" aria-labelledby="daylight-title">
        <div className="site-shell site-landing__daylight-frame">
          <nav className="site-landing__daylight-nav" aria-label="Example documentation navigation">
            <span>Components</span><span>Actions</span><span>Button</span>
          </nav>
          <article className="site-landing__daylight-card">
            <DisplayTitle level={2} id="daylight-title" className="site-landing__daylight-title">Button</DisplayTitle>
            <Text className="site-landing__daylight-copy">Every item ships as live behavior plus the exact source an agent or developer can copy. The catalog, examples, API data, and MCP all point at the same owned component.</Text>
            <div className="site-landing__daylight-actions" role="group" aria-label="Button variants">
              <Button variant="primary">Primary</Button><Button>Default</Button><Button variant="ghost">Ghost</Button><Button variant="link">Link</Button>
            </div>
            <code className="site-landing__daylight-code">{'import { Button } from \'@nanisoft/prism-ui/components/button\';'}</code>
            <Button variant="primary" href="/components/button">Open the Button doc</Button>
          </article>
        </div>
      </section>
    </PrismProvider>
  );
}
