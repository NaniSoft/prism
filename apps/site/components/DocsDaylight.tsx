'use client';

// The "docs in daylight" peek (ticket 11): light mode appears exactly once on
// the landing — as the current pack's light expression, not a toggle. It reads
// the shell selection so a peach-dark page peeks peach-light, never a leftover
// blue island (ADR-0005's one-language-many-expressions story).

import { Button } from '@nanisoft/prism-ui/components/button';
import { PrismProvider } from '@nanisoft/prism-ui/provider';
import { getPrismTheme } from '@nanisoft/prism-tokens';

import { DisplayTitle } from '@/components/prism-client';
import { useThemeSelection } from '@/components/SiteThemeProvider';

export function DocsDaylight() {
  const { selection } = useThemeSelection();
  return (
    <PrismProvider prismTheme={getPrismTheme(selection.pack, 'light')}>
      <div className="site-landing__daylight">
        <div className="site-shell">
          <span className="site-landing__note">docs / components / button</span>
          <div className="site-landing__daylight-card" style={{ maxWidth: 980, marginTop: 18 }}>
            <DisplayTitle level={2} style={{ margin: 0 }}>
              Button
            </DisplayTitle>
            <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.65, maxWidth: '58ch' }}>
              Every doc page ships as a live demo plus copyable source — the same components, the same
              theme object, that your app installs from npm.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button type="primary">Primary</Button>
              <Button>Default</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="text">Text</Button>
              <Button type="link">Link</Button>
            </div>
            <div className="site-landing__daylight-code">
              {"import { Button } from '@nanisoft/prism-ui/components';"}
            </div>
            <div>
              <Button type="primary" href="/components/button">
                Open the Button doc
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PrismProvider>
  );
}
