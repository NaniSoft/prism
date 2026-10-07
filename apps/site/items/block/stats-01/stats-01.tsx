import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'

/** The KPI row, with one of each delta direction and one figure with none. */
export default function Stats01Demo() {
  return (
    <Stats01
      headingLevel="h3"
      eyebrow="Preview"
      title="Section heading"
      stats={[
        {
          key: 'installs',
          label: 'First metric',
          value: '1,284',
          delta: 12,
          deltaFormat: '12 more than last month',
          hint: 'vs last month',
        },
        {
          key: 'conversion',
          label: 'Second metric',
          value: '47.2%',
          delta: -3,
          deltaFormat: '3 points lower',
          hint: 'vs last month',
        },
        {
          key: 'duration',
          label: 'Third metric',
          value: '2.4d',
          delta: 0,
          hint: 'vs last quarter',
          series: [3.4, 3.1, 2.9, 2.6, 2.5, 2.4],
          seriesLabel: 'Median duration, by week',
        },
        {
          key: 'open',
          label: 'Fourth metric',
          value: '138',
          href: '/issues',
          hrefLabel: 'Open the issue list',
        },
      ]}
    />
  )
}
