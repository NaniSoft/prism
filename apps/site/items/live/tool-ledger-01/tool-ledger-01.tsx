'use client'

import { useCallback, useRef } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { ToolLedger01, type ToolCall } from '@nanisoft/prism-ui/live/tool-ledger-01'

/** The run's clock, so a duration in the ledger is a difference the Demo chose. */
const OPENED = Date.UTC(2026, 8, 30, 10, 0, 0)

/** The instant of the next call, one second after the last. */
let clock = 4
const tick = (): number => {
  clock += 1
  return OPENED + clock * 1000
}

/** The reading beside a call, in the caller's own register. */
const duration = (ms: number): string => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`)

/**
 * The tool-call ledger of a run, fed by a stand-in transport.
 *
 * The subscription is a ref rather than a socket, because that is the honest shape
 * of the prop: Prism opens no connection, so a Demo that pretended to have one
 * would misrepresent the boundary the Item exists to hold. A real consumer swaps
 * the body of `subscribe` and nothing else changes.
 */
export default function ToolLedger01Demo() {
  const emitter = useRef<((call: ToolCall) => void) | null>(null)

  const subscribe = useCallback((emit: (call: ToolCall) => void) => {
    emitter.current = emit
    return () => {
      emitter.current = null
    }
  }, [])

  const send = (call: ToolCall): void => {
    emitter.current?.(call)
  }

  return (
    <div className="flex flex-col gap-4">
      <ToolLedger01
        subscribe={subscribe}
        resubscribeKey="run-41c9"
        label="Tool calls in run 41c9"
        empty="No tool has been called yet. The first call appears the moment the transport reports it."
        limit={4}
        droppedLabel={(count) => `${count} earlier calls are not shown`}
        pauseControl
        pauseLabel="Pause the ledger"
        resumeLabel="Resume the ledger"
        callbacks={[
          {
            id: 'c1',
            name: 'read_file',
            at: OPENED,
            state: 'succeeded',
            durationLabel: duration,
            argumentsText: 'ledger/2026-09-29.jsonl',
            resultText: '18,402 lines',
            link: { href: '#c1', label: 'Open the trace' },
          },
          {
            id: 'c2',
            name: 'search_files',
            at: OPENED + 2_400,
            state: 'running',
            durationLabel: duration,
            argumentsText: 'pattern=cap*  path=docs/',
            spanLabel: 'isolated',
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const id = `c${tick()}`
            const opened = tick()
            // Two sightings under one id, which is what a duration is a difference
            // between. The surface measures nothing itself and reads no clock.
            send({ id, name: 'fetch', at: opened, state: 'running', durationLabel: duration })
            setTimeout(() => {
              send({
                id,
                name: 'fetch',
                at: opened + 1_240,
                state: 'succeeded',
                durationLabel: duration,
                argumentsText: 'https://example.test/quotes',
                resultText: '2,048 quotes',
                link: { href: `#${id}`, label: 'Open the trace' },
              })
            }, 700)
          }}
        >
          Call a tool
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            send({
              id: `c${tick()}`,
              name: 'run_query',
              at: tick(),
              state: 'failed',
              durationLabel: duration,
              argumentsText:
                'SELECT count(*) FROM quotes WHERE captured_at > now() - interval 1 minute',
              errorText:
                'Statement timed out after 30s. The capture table is not indexed on captured_at.',
            })
          }}
        >
          Fail a call
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            for (let step = 0; step < 6; step += 1) {
              send({
                id: `c${tick()}`,
                name: 'read_file',
                at: tick(),
                state: 'succeeded',
                durationLabel: duration,
                argumentsText: `ledger/segment-${step}.jsonl`,
              })
            }
          }}
        >
          Six more calls
        </Button>
      </div>
    </div>
  )
}
