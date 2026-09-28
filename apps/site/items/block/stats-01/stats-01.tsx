import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'

/** The KPI row, with one of each delta direction and one figure with none. */
export default function Stats01Demo() {
  return (
    <Stats01
      headingLevel="h3"
      eyebrow="Preview"
      title="Section heading"
      stats={[
        { label: 'First metric', value: '1,284', delta: 12, hint: 'vs last month' },
        { label: 'Second metric', value: '47.2%', delta: -3, hint: 'vs last month' },
        { label: 'Third metric', value: '2.4d', delta: 0, hint: 'vs last quarter' },
        { label: 'Fourth metric', value: '138' },
      ]}
    />
  )
}
