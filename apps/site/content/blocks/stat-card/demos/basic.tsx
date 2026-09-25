import { StatCard } from '@nanisoft/prism-ui/blocks/stat-card';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function StatCardDemo() {
  return (
    <div role="group" aria-label="Synthetic NaniSoft catalog release signals" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="info">Synthetic release summary</Badge>
        <Text variant="tertiary">Counts below are checked catalog facts; the release context is demonstration data.</Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <StatCard
          label="Checked catalog"
          value="43"
          change="Current"
          detail="29 components, 9 blocks, and 5 pages."
          footer={<Text variant="tertiary">Catalog source fact</Text>}
        />
        <StatCard
          label="Theme expressions"
          value="10"
          change="Registered"
          detail="Five brand packs in light and dark."
          footer={<Text variant="tertiary">Theme source fact</Text>}
        />
        <StatCard
          label="Release layers"
          value="3"
          change="Composed"
          detail="Components, blocks, and pages work together."
          footer={<Text variant="tertiary">Composition model</Text>}
        />
      </div>
    </div>
  );
}
