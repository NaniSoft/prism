import { NothingChosen01 } from '@nanisoft/prism-ui/blocks/nothing-chosen-01'

/**
 * The resting detail pane, in the split it belongs in.
 *
 * The index beside it is drawn from this file's own rows and nothing else, so the
 * two panes can be read against each other: a list a reader can scan on the left
 * and, on the right, a pane that is empty because they have not chosen from it.
 * That is the whole claim the Demo makes, and it cannot be made by rendering the
 * Block on its own, because a pane with nothing in it next to nothing is
 * indistinguishable from a region a product forgot to build.
 *
 * The rows are deliberately plain. They are a static array rather than a fetch,
 * because a Demo that fetches is a Demo whose point is the data rather than the
 * state, and because a split whose selection is only real once there is a real
 * click is the arrangement this Block exists for.
 */
const INVOICES = [
  { id: 'inv-1041', name: 'Northwind Traders', total: '3,200.00', state: 'Sent' },
  { id: 'inv-1042', name: 'Contoso Ltd', total: '1,150.00', state: 'Paid' },
  { id: 'inv-1043', name: 'Fabrikam Industries', total: '8,940.50', state: 'Overdue' },
  { id: 'inv-1044', name: 'Adventure Works', total: '640.00', state: 'Draft' },
  { id: 'inv-1045', name: 'Litware Inc', total: '2,075.25', state: 'Sent' },
]

/** The three rows this Demo shows, and the two it keeps for the scroll. */
const SHOWN = INVOICES.slice(0, 3)

/** The mark, drawn here rather than chosen by the Block. */
const MARK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-10">
    <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" />
    <path d="M3 9h18M8 14h5" strokeLinecap="round" />
  </svg>
)

/** One detail pane at rest beside the index a reader chooses from. */
export default function NothingChosen01Demo() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground max-w-measure-narrow text-sm">
        The pane on the right is empty because the reader has chosen nothing, not
        because there is nothing to read. The records are in the list beside it,
        which is why this state is its own Block rather than a fourth reason on
        the empty state: a frame here would be claiming there is nothing to read
        while a readable region sits next to it.
      </p>

      {/*
        The split, drawn at the repository's own track ratio and not collapsed.
        The two tracks keep that ratio at every selection state, so the list never
        moves out from under the hand that clicked it, and which pane survives a
        narrow viewport is the caller's composition rather than a media query.
      */}
      <div className="border-border grid gap-4 rounded-xl border p-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-h-64 flex-col gap-1">
          {SHOWN.map((row) => (
            <div
              key={row.id}
              className="border-border flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
            >
              <span className="text-sm">{row.name}</span>
              <span className="text-muted-foreground font-mono text-sm tabular-nums">{row.total}</span>
            </div>
          ))}
        </div>

        {/*
          The whole of the pane, and there is no `onClick` beside it: the next
          step in this state is a click in the list on the left, which is the
          reason this Block renders no control of any kind. A button here would be
          either one this Block cannot wire or a second copy of the affordance the
          index already draws for the same reader.
        */}
        <NothingChosen01
          title="Select an invoice"
          body="Choose one from the list to see its lines, its history and who it is for."
          icon={MARK}
        />
      </div>

      <p className="text-muted-foreground max-w-measure-narrow text-sm">
        Notice what is not here: no action, no minimum height and no frame. A pane
        in a grid is already as tall as the pane beside it, so a floor authored here
        would be a second answer to a question the tracks of that split have
        already answered.
      </p>
    </div>
  )
}