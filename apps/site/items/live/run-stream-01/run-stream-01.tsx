'use client'

import { useCallback, useState } from 'react'

import { RunStream01, type RunEvent } from '@nanisoft/prism-ui/live/run-stream-01'

/**
 * A run console fed by a stand-in transport.
 *
 * The subscription is a timer rather than a socket, because that is the honest shape
 * of the prop: Prism does not open a connection, so a demo that pretended to have
 * one would misrepresent the boundary the Item exists to hold. A real consumer
 * swaps the body of `subscribe` and nothing else changes.
 */
export default function RunStream01Demo() {
  const [emitter, setEmitter] = useState<((event: RunEvent) => void) | null>(null)
  const [running, setRunning] = useState(false)

  const subscribe = useCallback((emit: (event: RunEvent) => void) => {
    setEmitter(() => emit)
    return () => setEmitter(null)
  }, [])

  const push = () => {
    emitter?.({
      id: `e${Date.now()}`,
      role: 'tool',
      at: Date.now(),
      message: 'Ran the test suite',
      detail: '1,284 passed, 0 failed',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <RunStream01
        subscribe={subscribe}
        resubscribeKey="demo"
        initial={[
          { id: 'e1', role: 'agent', at: Date.UTC(2026, 8, 29, 10, 0, 0), message: 'Read the request' },
          { id: 'e2', role: 'agent', at: Date.UTC(2026, 8, 29, 10, 0, 4), message: 'Wrote a plan' },
        ]}
        status={running ? 'running' : 'done'}
        statusLabel={running ? 'Running' : 'Idle'}
        title="Run 41c9"
        eventsLabel="Events in this run"
        emptyLabel="Waiting for the first event."
        liveLabel="New activity"
      />
      <button
        type="button"
        onClick={() => {
          push()
          setRunning(true)
        }}
        className="border-border w-fit rounded-md border px-3 py-1.5 text-sm"
      >
        Push an event
      </button>
    </div>
  )
}
