import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Button } from '@nanisoft/prism-ui/components/button';
import { Text } from '@nanisoft/prism-ui/components/typography';

const NAV = [
  { label: 'Catalog', url: '#catalog' },
  { label: 'Guides', url: '#guides' },
  { label: 'Themes', url: '#themes' },
];

export default function SiteHeaderDemo() {
  return (
    <div role="group" aria-label="Synthetic NaniSoft Prism site header" style={{ overflow: 'hidden', border: '1px solid var(--prism-border)', borderRadius: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 16px' }}>
        <Badge variant="info">Synthetic NaniSoft navigation preview</Badge>
        <Text variant="tertiary">Navigation and the product switcher are active here; enable the mode control when a PrismThemeModeProvider owns site mode.</Text>
      </div>
      <SiteHeader
        site="prism"
        nav={NAV}
        cta={<Button href="#catalog" variant="primary" size="sm">Start building</Button>}
        modeSwitch={false}
        sticky={false}
      />
    </div>
  );
}
