import {
  Retention01,
  type RetentionColumn,
  type RetentionRow,
} from '@nanisoft/prism-ui/blocks/retention-01'

/**
 * A retention period, in days.
 *
 * Written in days on purpose. "One month" and "a month" are the other two
 * sentences a period can be, and both of them are a different promise, because
 * thirty days is not a month. A compliance surface that printed one of them in
 * English would be asserting a period the reader never agreed to.
 */
function periodLabel(days: number): string {
  return `${days} days`
}

/** A review date, printed exactly as the caller wrote it. */
function reviewedAtLabel(value: number | string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

const COLUMNS: RetentionColumn[] = [
  { id: 'subject', header: 'What is kept' },
  { id: 'kind', header: 'Kind' },
  { id: 'period', header: 'Kept for' },
  { id: 'region', header: 'Where' },
  { id: 'policy', header: 'Policy' },
  { id: 'last-reviewed', header: 'Reviewed' },
]

const ROWS: RetentionRow[] = [
  {
    id: 'readings',
    subject: 'Process readings from every site',
    kind: 'Operational',
    period: 730,
    periodLabel,
    region: 'Dublin, then Frankfurt',
    policy: 'Operational data',
    reviewedAt: Date.UTC(2026, 5, 1),
    reviewedAtLabel,
    href: '/policies/operational',
    hrefLabel: 'Read the policy',
  },
  {
    id: 'findings',
    subject: 'Findings, and the trail of every change to one',
    kind: 'Accountability',
    period: 2555,
    periodLabel,
    region: 'Dublin, then Frankfurt',
    policy: 'Accountability',
    reviewedAt: Date.UTC(2026, 5, 1),
    reviewedAtLabel,
  },
  {
    id: 'sessions',
    subject: 'Where the workspace was signed in from',
    kind: 'Security',
    period: 90,
    periodLabel,
    region: 'Dublin',
    policy: 'Security',
    reviewedAt: Date.UTC(2026, 7, 11),
    reviewedAtLabel,
  },
  {
    id: 'drafts',
    subject: 'A finding nobody ever submitted',
    kind: 'Working',
    period: 30,
    periodLabel,
    region: 'Dublin',
  },
]

/** The full schedule, then a four-column variant, then a schedule with nothing in it. */
export default function Retention01Demo() {
  return (
    <>
      <Retention01
        headingLevel="h3"
        eyebrow="Preview"
        title="What this workspace keeps, and for how long"
        description="Four rows and every column. The row with no review date and no policy is a real one, and a cell that says nothing is a truthful answer."
        columns={COLUMNS}
        rows={ROWS}
        summary={[
          { label: 'Kinds of thing kept', value: '4' },
          { label: 'Shortest period', value: '30 days' },
          { label: 'Longest period', value: '2,555 days' },
          { label: 'Regions', value: '2' },
        ]}
        empty="This workspace keeps nothing that has to be scheduled for deletion."
      />
      <Retention01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same schedule with four columns"
        description="The columns are the caller's and only the columns are, so a shorter page can carry the same rows without a horizontal scroll."
        columns={[
          { id: 'subject', header: 'What is kept' },
          { id: 'period', header: 'Kept for' },
          { id: 'region', header: 'Where' },
          { id: 'href', header: 'Policy' },
        ]}
        rows={ROWS}
        empty="This workspace keeps nothing that has to be scheduled for deletion."
      />
      <Retention01
        headingLevel="h3"
        eyebrow="Preview"
        title="A schedule with nothing in it"
        description="The table still renders and the caller's sentence sits in it, because a heading with no rows says the publisher retains nothing, and hiding the section leaves a reader wondering whether it was missed."
        columns={COLUMNS}
        rows={[]}
        summary={[{ label: 'Kinds of thing kept', value: '0' }]}
        empty="Nothing here is kept on a schedule. Everything is either live data or gone the moment it is written."
      />
    </>
  )
}
