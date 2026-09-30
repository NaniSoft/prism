'use client'

import { useState } from 'react'

import { Intake01, type Intake01Item } from '@nanisoft/prism-ui/blocks/intake-01'

/**
 * Six arriving items, one in each state and one with a detail that is a node.
 *
 * The states are all on screen at once because the mapping is the part a reader has
 * to learn, and a Demo showing only the two interesting ones teaches nothing about
 * the two quiet ones. The third row carries a detail that is a sentence and the fifth
 * carries one that is a hostname, which is the case the `detail` slot exists for: a
 * queue's second line is not always prose.
 */
const ARRIVING: Intake01Item[] = [
  {
    id: 'access-1',
    source: 'forms.access',
    subject: "Priya Raman's access request",
    at: '2026-09-28T09:14:00Z',
    state: 'new',
    stateLabel: 'Arrived',
    detail: 'Asks for read access to the settlements feed, which she has not held before.',
  },
  {
    id: 'capture-2',
    source: 'agent.capture',
    subject: 'A capture from the Rotterdam run',
    at: '2026-09-28T08:52:00Z',
    state: 'queued',
    stateLabel: 'Waiting',
    detail: 'Rotterdam, 412 records, no dedupe key on the source.',
  },
  {
    id: 'run-3',
    source: 'agent.run',
    subject: 'The Tuesday settlement run',
    at: '2026-09-28T07:30:00Z',
    state: 'accepted',
    stateLabel: 'Taken',
    detail: 'Claimed by Jide Abara and due to finish before the Bristol cut.',
  },
  {
    id: 'dup-4',
    source: 'agent.capture',
    subject: 'A duplicate of capture 8814',
    at: '2026-09-28T06:05:00Z',
    state: 'rejected',
    stateLabel: 'Turned down',
    detail: 'Same source key as 8814, so the whole capture was discarded rather than merged.',
  },
  {
    id: 'key-5',
    source: 'ops.keys',
    subject: 'A key rotation for the observatory',
    at: '2026-09-28T05:40:00Z',
    state: 'new',
    stateLabel: 'Arrived',
    detail: 'observatory-02.internal',
  },
  {
    id: 'form-6',
    source: 'forms.contact',
    subject: 'A contact form from the Cardiff unit',
    at: '2026-09-28T04:12:00Z',
    state: 'queued',
    stateLabel: 'Waiting',
    detail: 'Asks whether the Cardiff unit is still a delivery address.',
  },
]

/**
 * The take and refuse sentences, written per item so a reader can see the difference
 * two functions make over two strings.
 *
 * The take label names the subject, because taking one specific thing is not the same
 * act as taking whatever is on the screen. The refuse label is one sentence for every
 * row, because turning an arrival down is one offer and the reader does not need to
 * know which one they are refusing to read it twice.
 */
function acceptLabel(item: Intake01Item): string {
  return `Take ${item.subject.toLowerCase()}`
}

function rejectLabel(): string {
  return 'Turn down'
}

/**
 * What each control did, printed underneath so the Block's own claim is visible.
 *
 * A Demo that took an item and showed nothing would look exactly like a Demo whose
 * controls did nothing, and those are the two failures a reader of this page is most
 * likely to be checking for. This line is the difference between them, and it is the
 * consumer's state rather than the Block's: the Block holds no accepting state and
 * writes no flag, because whether the server took the item is a fact about the
 * server.
 */
export default function Intake01Demo() {
  const [items, setItems] = useState<Intake01Item[]>(ARRIVING)
  const [lastAction, setLastAction] = useState<string>()

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Press either control on a row. The Block holds no accepting state, writes no
        flag and starts no poll: the row disappears because this Demo took it out of
        its own array, which is the whole of what a Block can be responsible for.
      </p>

      <Intake01
        headingLevel="h3"
        eyebrow="Preview"
        title="Arriving now"
        description="Six items in four states. This list grows when your own state changes and not before."
        items={items}
        onAccept={(id) => {
          setLastAction(id)
          setItems((current) => current.filter((item) => item.id !== id))
        }}
        acceptLabel={acceptLabel}
        onReject={(id) => {
          setLastAction(id)
          setItems((current) => current.filter((item) => item.id !== id))
        }}
        rejectLabel={rejectLabel}
        summary={(count) => (count === 0 ? null : `${count} waiting`)}
        empty="Nothing has arrived on the feeds you are watching."
      />

      {lastAction === undefined ? null : (
        <p data-slot="demo-note" className="text-muted-foreground text-sm">
          The consumer removed <code className="font-mono">{lastAction}</code> from its
          own array. The Block made no request and wrote no state.
        </p>
      )}

      {items.length === 0 ? null : (
        <button
          type="button"
          className="text-muted-foreground self-start text-sm underline underline-offset-4"
          onClick={() => setItems(ARRIVING)}
        >
          Put them all back
        </button>
      )}
    </div>
  )
}
