import { Button } from '@nanisoft/prism-ui/components/button'
import { Tag } from '@nanisoft/prism-ui/components/tag-group'
import { Textarea } from '@nanisoft/prism-ui/components/textarea'
import {
  IssueDetail01,
  type IssueDetail01Comment,
} from '@nanisoft/prism-ui/blocks/issue-detail-01'

/** A moment in this year, as the platform will read it. */
const OPENED = Date.parse('2026-02-11T00:00:00Z')

/**
 * The thread, oldest first, in the order the Block renders it.
 *
 * Three comments, and the order is the point rather than an accident of the
 * fixture: the first one asks the question, the second one answers it, and the
 * third one reports what the fix did when it shipped. A Demo whose comments were in
 * any other order would be a Demo that says the Block sorts them, which it does
 * not, and a reader would take the arrangement as a promise about their own data.
 */
const THREAD: IssueDetail01Comment[] = [
  {
    id: 'c1',
    author: { name: 'Lior Benali', avatar: { name: 'Lior Benali' } },
    at: Date.parse('2026-02-11T09:14:00Z'),
    dateLabel: () => 'eleven weeks ago',
    body: (
      <>
        <p>
          The operator view times out on an estate of about four hundred machines. It is
          not the query: it is the fan-out, and the view opens one connection per machine
          rather than one per page.
        </p>
        <p>Reproduced on 2.14.0 and not on 2.13.4.</p>
      </>
    ),
  },
  {
    id: 'c2',
    author: { name: 'Ravi Menon', avatar: { name: 'Ravi Menon' } },
    at: Date.parse('2026-02-12T11:02:00Z'),
    dateLabel: () => 'ten weeks ago',
    body: (
      <p>
        Confirmed. The connection cap is 100 and the page size is 50, so the second page
        needs 50 more connections and the pool is already full. One pool per page fixes it
        and costs a second on a cold cache.
      </p>
    ),
  },
  {
    id: 'c3',
    author: { name: 'Ada Okafor', avatar: { name: 'Ada Okafor' } },
    at: Date.parse('2026-03-02T16:40:00Z'),
    dateLabel: () => 'three weeks ago',
    body: <p>Shipped in 2.14.2. Four hundred machines now page in 1.2 seconds.</p>,
  },
]

/**
 * One issue, with the fields this tracker actually carries.
 *
 * The fixture is shaped to make the two decisions visible. The key is a real
 * identifier in the mono face rather than a title prefix, because a reader pastes
 * the key into a search box and it has to be the key. The fields are the four this
 * product asks about an issue and not the four a generic tracker would, which is the
 * whole argument for the caller declaring them. The sidebar is one region holding
 * the labels, because labels in a sidebar and labels in the field list are two
 * different claims about what a label is.
 */
export default function IssueDetail01Demo() {
  return (
    <IssueDetail01
      headingLevel="h3"
      issue={{
        key: 'NX-412',
        title: 'The operator view times out on a full estate',
        state: 'in_review',
        stateLabel: 'In review',
        author: { name: 'Lior Benali', avatar: { name: 'Lior Benali' } },
        openedAt: OPENED,
        dateLabel: () => 'opened eleven weeks ago',
        fields: [
          { id: 'area', label: 'Area', value: 'Operator view' },
          { id: 'severity', label: 'Severity', value: 'Two of five' },
          { id: 'found-in', label: 'Found in', value: '2.14.0' },
          { id: 'sprint', label: 'Sprint', value: <Tag label="2026.07" /> },
        ],
        labels: [
          { id: 'regression', label: 'Regression' },
          { id: 'estate', label: 'Estate' },
          { id: 'needs-review', label: 'Needs review' },
        ],
        body: (
          <>
            <p>
              The operator view times out on an estate of about four hundred machines. It
              is not the query that is slow: it is the fan-out, because the view opens one
              connection per machine rather than one per page of fifty.
            </p>
            <p>What we know so far:</p>
            <ul>
              <li>Reproduced on 2.14.0 and not on 2.13.4.</li>
              <li>The connection cap is 100 and the page size is 50.</li>
              <li>The second page therefore needs fifty connections the pool does not have.</li>
            </ul>
            <p>
              One pool per page appears to fix it. It costs about a second on a cold cache
              and nothing on a warm one, which is the trade in the thread.
            </p>
          </>
        ),
      }}
      comments={THREAD}
      actions={
        <>
          <Button size="sm">Reassign</Button>
          <Button size="sm" variant="outline">
            Close
          </Button>
        </>
      }
      commentForm={
        <div className="flex flex-col gap-2">
          <Textarea placeholder="Add a comment" aria-label="Add a comment" rows={3} />
          <Button size="sm" className="self-start">
            Comment
          </Button>
        </div>
      }
      sidebar={
        <>
          <Tag label="Regression" />
          <Tag label="Estate" />
          <p className="text-muted-foreground text-sm">
            Two people are watching this. The thread above is in the order it happened.
          </p>
        </>
      }
    />
  )
}
