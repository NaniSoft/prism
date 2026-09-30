'use client'

import { Activity, Workflow } from 'lucide-react'

import { Backdrop01 } from '@nanisoft/prism-ui/blocks/backdrop-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph'
import { SignalField } from '@nanisoft/prism-ui/components/signal-field'

/**
 * Two bands, and the pair is the point rather than the decoration.
 *
 * The first is the atmosphere half: a `SignalField`, which is `aria-hidden` by
 * default and names nothing, under a control the Block draws. The second is the
 * claim half: a `PulseGraph` with three stages in a lane, which names itself and
 * is stopped by the caller rather than by the Block, so the controlled arm of
 * `paused` and the `children` slot for a caller's own control are both visible
 * here.
 */
export default function Backdrop01Demo() {
  return (
    <>
      <Backdrop01
        headingLevel="h3"
        eyebrow="Preview"
        title="A line that finishes before anyone asks"
        description="A field behind the copy, a cycle the stylesheet resolves, and a control that stops it."
        field="drift"
        intensity="present"
        pauseControl
        pauseLabel="Pause the field"
        resumeLabel="Resume the field"
        label="The collection line, as a field of marks drifting on its own cycle"
        figure={<SignalField count={40} emphasisAt={0.4} />}
      >
        <div className="flex max-w-measure flex-col gap-3">
          <h4 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Workflow className="text-muted-foreground size-4" aria-hidden />
            Nothing here polls
          </h4>
          <p className="text-muted-foreground text-pretty text-sm">
            One site, one line, and a run that finished before anybody had asked
            whether it was useful. The claim being tested was narrow on purpose.
          </p>
        </div>
      </Backdrop01>

      <Backdrop01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same band, with the field stopped and the control yours"
        description="A claim-carrying figure, `paused` passed as a prop, and the control composed into the content."
        field="pulse"
        intensity="subtle"
        paused
        label="The collection line, as three stages with a marker travelling the rail"
        figure={
          <PulseGraph
            label="The collection line, as three stages with a marker travelling the rail"
            nodes={[
              { id: 'collect', name: 'collect', x: 0, y: 0, lane: 0, note: 'the edge' },
              { id: 'load', name: 'load', x: 1, y: 0, lane: 0, note: 'the lake', emphasis: true },
              { id: 'serve', name: 'serve', x: 2, y: 0, lane: 0, note: 'the reader' },
            ]}
            relations={[
              { from: 'collect', to: 'load', carries: true },
              { from: 'load', to: 'serve', carries: true },
            ]}
          />
        }
      >
        <div className="flex max-w-measure flex-col gap-3">
          <h4 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Activity className="text-muted-foreground size-4" aria-hidden />
            Stopped, and still true
          </h4>
          <p className="text-muted-foreground text-pretty text-sm">
            The graph draws every node, every edge and the rail in its resting form,
            so a reader who has asked for no movement reads the same claim. The
            control below is the caller&rsquo;s own and so are the words on it, and
            the state it moves is the caller&rsquo;s too, which is why this preview
            holds none of it.
          </p>
          <div>
            <Button type="button" variant="outline" size="sm">
              Resume the field
            </Button>
          </div>
        </div>
      </Backdrop01>
    </>
  )
}
