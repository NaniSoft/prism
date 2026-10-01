'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  TaskProgress,
  type TaskProgressPhase,
} from '@nanisoft/prism-ui/components/task-progress'

/**
 * The four positions, moved by two controls rather than by a timer.
 *
 * There is no clock on purpose. This Component holds no promise and runs no
 * timer, so the only honest way to show its four positions is for the caller to
 * decide them, and a demo that resolved itself after two seconds would be showing
 * the demo's timer rather than the Component's behaviour.
 */
export default function TaskProgressDemo() {
  const [exportPhase, setExportPhase] = useState<TaskProgressPhase>({ phase: 'idle' })
  const [rebuildPhase, setRebuildPhase] = useState<TaskProgressPhase>({
    phase: 'running',
    progress: 3 / 8,
    progressText: '3 of 8 machines rebuilt',
  })

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setExportPhase({
                phase: 'running',
                progress: 0.42,
                progressText: 'Uploading, 42 percent',
              })
            }
          >
            Start the export
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setExportPhase({
                phase: 'failed',
                reason: 'The estate has no readings after 14 March. Nothing was written.',
              })
            }
          >
            Fail the export
          </Button>
          <Button variant="ghost" onClick={() => setExportPhase({ phase: 'idle' })}>
            Send it back to idle
          </Button>
        </div>

        <TaskProgress phase={exportPhase} label="Exporting the estate report" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setRebuildPhase({
                phase: 'succeeded',
                outcome: 'All eight machines are current.',
              })
            }
          >
            Finish the rebuild
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setRebuildPhase({
                phase: 'running',
                progress: 3 / 8,
                progressText: '3 of 8 machines rebuilt',
              })
            }
          >
            Put it back to running
          </Button>
        </div>

        <TaskProgress phase={rebuildPhase} label="Rebuilding the estate index" />
      </div>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        The idle position draws nothing at all. The bar belongs to the running position and
        leaves with it, because a bar at one hundred percent is a measurement of nothing, and
        the outcome is announced through a live region that is created with its content.
      </p>
    </div>
  )
}