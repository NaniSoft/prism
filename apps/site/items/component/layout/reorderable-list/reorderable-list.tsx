'use client'

import { useState } from 'react'

import {
  ReorderableList,
  type ReorderableMove,
} from '@nanisoft/prism-ui/components/reorderable-list'

type Stage = { id: string; name: string; detail: string; pinned?: boolean }

const INITIAL: Stage[] = [
  { id: 'ingest', name: 'Ingest', detail: 'Readings arrive on the socket.' },
  { id: 'normalise', name: 'Normalise', detail: 'Units and timestamps are made uniform.' },
  {
    id: 'validate',
    name: 'Validate',
    detail: 'Range and plausibility rules run.',
    pinned: true,
  },
  { id: 'enrich', name: 'Enrich', detail: 'Site and asset metadata is joined in.' },
  { id: 'publish', name: 'Publish', detail: 'The market snapshot is written.' },
]

/**
 * Two reorder models and one locked row, side by side.
 *
 * The first list has a row that cannot move. Dragging across it and pressing the
 * arrow keys past it both stop at its own slot, and both say so out loud, which is
 * the point: the two models run through the same function here, so they cannot
 * disagree about what a locked row means.
 *
 * The second list has nothing locked, which is the ordinary case and is here so the
 * difference is visible rather than described.
 */
export default function ReorderableListDemo() {
  const [stages, setStages] = useState(INITIAL)
  const [loose, setLoose] = useState(INITIAL)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-10">
      <ReorderableList
        label="Pipeline stages"
        rows={stages}
        getRowId={(stage) => stage.id}
        isLocked={(stage) => stage.pinned === true}
        onOrderChange={setStages}
        handleLabel={(index) => `Reorder ${stages[index]?.name ?? ''}, position ${index + 1} of ${stages.length}`}
        instructionsLabel="Press Space or Enter to pick this stage up, the up and down arrows to move it, Space or Enter to put it down, and Escape to put it back where it started."
        announce={(move: ReorderableMove) =>
          `${stages.find((stage) => stage.id === move.id)?.name ?? 'Stage'} moved to position ${move.to + 1} of ${move.total}.`
        }
        blockedLabel={(index) => `${stages[index]?.name ?? 'That stage'} holds its position and cannot be moved past. Change it in the pipeline settings instead.`}
        cancelLabel="Stage returned to the position it started in."
      >
        {(stage, info) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{stage.name}</span>
            <span className="text-muted-foreground text-xs">
              {stage.detail}
              {info.locked ? ' This stage is pinned.' : ''}
            </span>
          </div>
        )}
      </ReorderableList>

      <div>
        <p className="text-muted-foreground mb-3 text-sm">
          The same list with nothing locked. Escape restores the arrangement the row
          had when it was picked up, in one call and one sentence, rather than
          unwinding it a position at a time.
        </p>
        <ReorderableList
          label="Reorderable set"
          rows={loose}
          getRowId={(stage) => stage.id}
          onOrderChange={setLoose}
          handleLabel={(index) => `Reorder ${loose[index]?.name ?? ''}, position ${index + 1} of ${loose.length}`}
          instructionsLabel="Press Space or Enter to pick this stage up, the up and down arrows to move it, Space or Enter to put it down, and Escape to put it back where it started."
          announce={(move: ReorderableMove) =>
            `${loose.find((stage) => stage.id === move.id)?.name ?? 'Stage'} moved to position ${move.to + 1} of ${move.total}.`
          }
          blockedLabel={(index) => `${loose[index]?.name ?? 'That stage'} is held in place.`}
          cancelLabel="Stage returned to the position it started in."
        >
          {(stage, info) => (
            <span className="text-sm">
              {info.index + 1}. {stage.name}
            </span>
          )}
        </ReorderableList>
      </div>
    </div>
  )
}
