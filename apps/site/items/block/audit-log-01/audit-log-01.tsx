import { AuditLog01, type AuditLog01Entry } from '@nanisoft/prism-ui/blocks/audit-log-01'

/**
 * The six columns in the order a reader of an audit log actually checks them.
 *
 * The moment first, because the question is usually about a window of time rather than
 * about a record. The actor second, because a reader who has found the change is now
 * asking who made it. The change third. Then the diff, which is the only column that
 * needs width. Then the link, headed with nothing, because a column whose only content
 * is a control does not need a name and a name on it would be a word a reader reads
 * once per row.
 */
const COLUMNS = [
  { id: 'at', header: 'When' },
  { id: 'actor', header: 'Who' },
  { id: 'change', header: 'What changed' },
  { id: 'diff', header: 'Before and after' },
  { id: 'link', header: '' },
] as const

/**
 * Three entries, and the three that make the Block's rules visible rather than
 * asserted.
 *
 * The first carries a before, an after and a tone with its own words, so the diff
 * component, the urgency and the link are all on one row. The second carries an
 * `after` with no `before`, which is a real state and is not dropped: a record that
 * says what was created and nothing about what came before it is one line of a diff
 * rather than two. The third carries no values at all, so the `diff` cell is empty and
 * the row still reads.
 */
const ENTRIES: AuditLog01Entry[] = [
  {
    id: 'limit',
    at: '2026-09-30T08:14:00.000Z',
    actor: 'bo@nine',
    target: 'billing.invoice.limit',
    change: 'Raised the per invoice limit',
    before: '10000',
    after: '50000',
    tone: 'warning',
    toneLabel: 'Needs review',
    href: '/overview',
    hrefLabel: 'Open the full record',
  },
  {
    id: 'export',
    at: '2026-09-30T07:02:00.000Z',
    actor: 'ada@nine',
    target: 'exports.daily',
    change: 'Created the nightly export',
    after: 'enabled',
    tone: 'success',
    toneLabel: 'Approved',
  },
  {
    id: 'retention',
    at: '2026-09-29T17:40:00.000Z',
    actor: 'nightly',
    target: 'ledger.retention',
    change: 'Reduced the retention window',
  },
]

/**
 * The two words `diff.tsx` needs, and the reason this demo writes them.
 *
 * The Component states the whole argument: a diff that announced "added" and "removed"
 * in English would be a diff every consumer inherits in a language they did not
 * choose, because a shared library cannot know whether the word for this is "added",
 * "ajoute" or "hinzugefuegt". So it asks, and the run throws if a diff is drawn
 * without an answer.
 */
const DIFF_LABELS = { added: 'Now', removed: 'Before', context: 'Unchanged' }

export default function AuditLog01Demo() {
  return (
    <AuditLog01
      headingLevel="h3"
      eyebrow="Preview"
      title="Section heading"
      description="Three changes, newest first, with a diff drawn by the diff component."
      columns={COLUMNS}
      entries={ENTRIES}
      diffLabels={DIFF_LABELS}
      empty="No changes have been recorded in this period."
    />
  )
}
