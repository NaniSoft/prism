'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  LifecycleButton,
  type LifecycleButtonState,
} from '@nanisoft/prism-ui/components/lifecycle-button'

/** The steps the first button counts through, and the one that makes it fail. */
const STEPS = ['Reading the manifest', 'Resolving the estate', 'Writing the summary']

/**
 * One lifecycle that finishes and one that does not.
 *
 * The first carries a real fraction: the caller knows how many steps there are and
 * how far through it is, so the bar reports a position and `progressText` says it
 * in words. The second knows nothing about how long its work will take, so it
 * passes no fraction at all and the same component is announced as indeterminate,
 * which is the truth about a request of unknown length. Neither path uses a timer
 * to fill a bar, because a bar that fills on its own is a measurement of nothing.
 */
export default function LifecycleButtonDemo() {
  const timers = useRef<number[]>([])
  const [publishing, setPublishing] = useState<LifecycleButtonState>({ phase: 'idle' })
  const [rejecting, setRejecting] = useState<LifecycleButtonState>({ phase: 'idle' })

  const clearTimers = () => {
    for (const handle of timers.current) window.clearTimeout(handle)
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  const publish = () => {
    clearTimers()
    setPublishing({ phase: 'in-flight' })
    STEPS.forEach((step, index) => {
      timers.current.push(
        window.setTimeout(
          () =>
            setPublishing({
              phase: 'in-flight',
              progress: (index + 1) / STEPS.length,
              progressText: `${index + 1} of ${STEPS.length} steps: ${step}`,
            }),
          600 * (index + 1),
        ),
      )
    })
    timers.current.push(
      window.setTimeout(() => setPublishing({ phase: 'succeeded' }), 600 * STEPS.length + 300),
    )
  }

  const reject = () => {
    clearTimers()
    setRejecting({ phase: 'in-flight' })
    timers.current.push(
      window.setTimeout(
        () =>
          setRejecting({
            phase: 'failed',
            reason: 'The estate has no readings after 14 March. Nothing was written.',
          }),
        1800,
      ),
    )
  }

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <div className="flex flex-col items-start gap-2">
        <LifecycleButton
          state={publishing}
          onActivate={publish}
          idleLabel="Publish the summary"
          inFlightLabel="Publishing"
          succeededLabel="Published"
          failedLabel="Not published"
          retryLabel="Publish again"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearTimers()
            setPublishing({ phase: 'idle' })
            setRejecting({ phase: 'idle' })
          }}
        >
          Start again
        </Button>
      </div>

      <div className="flex flex-col items-start gap-2">
        <LifecycleButton
          variant="secondary"
          state={rejecting}
          onActivate={reject}
          idleLabel="Write the run log"
          inFlightLabel="Writing"
          succeededLabel="Written"
          failedLabel="Not written"
          retryLabel="Try again"
        />
      </div>

      <p className="text-muted-foreground text-sm">
        The first button knows how far through it is, so its bar carries the
        position and the sentence beside it names the step. The second does not, so
        its bar is indeterminate and no number is invented for it. Both end by
        changing their own label, and both announce that change to a screen reader,
        which is the part a caller cannot get from a control that only draws a
        spinner: the second one also grows a second control beside it, because
        trying the same request again and sending a new one are not the same
        action.
      </p>
    </div>
  )
}
