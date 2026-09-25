import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function SiteFooterDemo() {
  return (
    <div role="group" aria-label="Synthetic NaniSoft site footer" style={{ overflow: 'hidden', border: '1px solid var(--prism-border)', borderRadius: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 16px' }}>
        <Badge variant="info">Synthetic NaniSoft site chrome</Badge>
        <Text variant="tertiary">The app supplies catalog links and the legal line; Prism renders the product row.</Text>
      </div>
      <SiteFooter
        site="prism"
        columns={[
          { title: 'Prism', links: [{ label: 'Catalog', url: '#catalog' }, { label: 'Theme reference', url: '#themes' }] },
          { title: 'NaniSoft', links: [{ label: 'Product switcher', url: '#products' }, { label: 'Source notes', url: '#source' }] },
        ]}
        legal={<span>Synthetic footer preview | NaniSoft</span>}
      />
    </div>
  );
}
