/**
 * The fourth Kind's first surface: an event log that receives events as they arrive.
 *
 * **What is being tested is the boundary, not the pixels.** A `live` surface exists
 * because a Block takes its content as props and therefore cannot express content
 * that changes without a navigation event. So the things worth asserting are the
 * three that make it a *live* surface rather than a Block with a subscription bolted
 * on: the subscription is the consumer's and is torn down, the events are ordered by
 * when they happened rather than when they arrived, and the growing list is not
 * itself announced on every arrival.
 *
 * **The ordering is the subtle one.** A consumer's transport decides when a message
 * is delivered, and a reconnect delivers older events after newer ones. Sorting on
 * arrival would put a run's own history out of order in exactly the case where a
 * reader is watching, so the tests push events out of order and assert the log is
 * still in time order.
 */
import { act, render, screen, within } from '@testing-library/react'
import { useCallback, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { RunStream01, type RunEvent, type RunSubscribe } from '../src/live/run-stream-01'

const at = (ms: number): number => Date.UTC(2026, 8, 29, 10, 0, 0) + ms

const event = (id: string, ms: number, message: string, role: RunEvent['role'] = 'agent'): RunEvent => ({
  id,
  role,
  at: at(ms),
  message,
})

/**
 * A transport the test controls: `emit` pushes an event, `stopped` records whether
 * the surface unsubscribed, and `connects` how many times it was called.
 */
function harness(initial: RunEvent[] = []) {
  const state = {
    emit: (_event: RunEvent) => {},
    stopped: 0,
    connects: 0,
  }

  const subscribe: RunSubscribe = (emit) => {
    state.connects += 1
    state.emit = emit
    return () => {
      state.stopped += 1
    }
  }

  const view = (
    <RunStream01
      subscribe={subscribe}
      initial={initial}
      eventsLabel="Events"
      emptyLabel="Waiting for the first event."
      liveLabel="New activity"
    />
  )

  return { state, view }
}

/** The messages in the order the log renders them. */
const messages = (): string[] =>
  [...document.querySelectorAll('[data-slot="run-event"]')].map(
    (row) => row.querySelector('span:last-child')?.firstChild?.textContent ?? '',
  )

describe('RunStream01 takes its events from the consumer, not from a connection', () => {
  it('subscribes once on mount and unsubscribes on unmount', () => {
    const { state, view } = harness()
    const { unmount } = render(view)
    expect(state.connects).toBe(1)

    // The teardown is the half that matters and the half a consumer cannot see: a
    // surface that opens a connection and never closes it is a leak per mount.
    unmount()
    expect(state.stopped).toBe(1)
  })

  it('re-subscribes when the run key changes, and closes the old one first', () => {
    // A second run in the same surface is a new subscription rather than two
    // consumers of one, which is what a run identifier is for.
    let connects = 0
    let stops = 0
    const subscribe: RunSubscribe = () => {
      connects += 1
      return () => {
        stops += 1
      }
    }
    const { rerender } = render(
      <RunStream01 subscribe={subscribe} eventsLabel="Events" resubscribeKey="a" />,
    )
    rerender(<RunStream01 subscribe={subscribe} eventsLabel="Events" resubscribeKey="a" />)
    expect(connects).toBe(1)

    rerender(<RunStream01 subscribe={subscribe} eventsLabel="Events" resubscribeKey="b" />)
    expect(connects).toBe(2)
    // The first connection is closed rather than left running beside the second,
    // which is the half a consumer cannot see from outside.
    expect(stops).toBe(1)
  })

  it('renders events the surface already knew, so a run opened mid-flight is not blank', () => {
    const { view } = harness([event('a', 0, 'Intake'), event('b', 1000, 'Plan')])
    render(view)
    expect(messages()).toEqual(['Intake', 'Plan'])
  })

  it('and shows its own words when it has none', () => {
    const { view } = harness()
    render(view)
    expect(screen.getByText('Waiting for the first event.')).toBeInTheDocument()
  })
})

describe('the log is ordered by when things happened, not by when they arrived', () => {
  it('sorts events delivered out of order', () => {
    // The reconnect case. A transport decides delivery, not truth, and a reader
    // watching a reconnect is exactly when an out-of-order log would be noticed.
    const { state, view } = harness()
    render(view)

    act(() => {
      state.emit(event('third', 2000, 'Build'))
      state.emit(event('first', 0, 'Intake'))
      state.emit(event('second', 1000, 'Plan'))
    })

    expect(messages()).toEqual(['Intake', 'Plan', 'Build'])
  })

  it('breaks a tie on id, so the same run renders the same log every time', () => {
    const { state, view } = harness()
    render(view)
    act(() => {
      state.emit(event('b', 500, 'Second'))
      state.emit(event('a', 500, 'First'))
    })
    expect(messages()).toEqual(['First', 'Second'])
  })

  it('drops the oldest events past the limit rather than growing without bound', () => {
    // An agent run can produce thousands of events, and a surface that grows
    // without bound eventually stops repainting.
    const { state } = harness()
    render(
      <RunStream01
        subscribe={(emit) => {
          state.emit = emit
          return () => {}
        }}
        eventsLabel="Events"
        limit={3}
      />,
    )
    act(() => {
      for (let i = 0; i < 5; i += 1) state.emit(event(`e${i}`, i * 1000, `Event ${i}`))
    })
    expect(messages()).toEqual(['Event 2', 'Event 3', 'Event 4'])
  })
})

describe('a growing list is not announced on every arrival', () => {
  it('announces the newest event alone', () => {
    // A live region around the log would make a screen reader read the whole run
    // again on every arrival, which is the failure a live region on a list
    // guarantees rather than avoids.
    const { state, view } = harness([event('a', 0, 'Intake')])
    render(view)
    act(() => {
      state.emit(event('b', 1000, 'Plan'))
    })

    const live = document.querySelector('[aria-live]')
    expect(live).not.toBeNull()
    expect(within(live as HTMLElement).getByText('Plan')).toBeInTheDocument()
    // The earlier event is in the log and not in the announcement.
    expect(within(live as HTMLElement).queryByText('Intake')).not.toBeInTheDocument()
  })

  it('names the scrolling region, so a keyboard reader can tell what is in it', () => {
    const { view } = harness([event('a', 0, 'Intake')])
    render(view)
    // `ScrollArea` names its group rather than its region, and that is the role it
    // uses, so the assertion asks for the role the component actually has rather
    // than the one that sounds right for a scroll container.
    expect(screen.getByRole('group', { name: 'Events' })).toBeInTheDocument()
  })
})

describe('the roles are told apart without relying on colour', () => {
  it('gives each event its role as data and its own mark', () => {
    const { view } = harness([
      event('a', 0, 'Planned', 'agent'),
      event('b', 1000, 'Ran the tests', 'tool'),
      event('c', 2000, 'Retrying', 'system'),
      event('d', 3000, 'Build failed', 'error'),
    ])
    render(view)

    const roles = [...document.querySelectorAll('[data-slot="run-event"]')].map((row) =>
      row.getAttribute('data-role'),
    )
    expect(roles).toEqual(['agent', 'tool', 'system', 'error'])

    // Four distinct marks, so the four tiers are separable in a monochrome render
    // and by a reader who cannot see the ink at all.
    const marks = [...document.querySelectorAll('[data-slot="run-event"] [aria-hidden="true"]')].map(
      (mark) => mark.textContent,
    )
    expect(new Set(marks).size).toBe(4)
  })

  it('and gives the status a tier of its own', () => {
    render(
      <RunStream01
        subscribe={() => () => {}}
        eventsLabel="Events"
        status="failed"
        statusLabel="Failed after 3 attempts"
      />,
    )
    // Exactly once. An earlier version fell back to `statusLabel` for the heading
    // when no title was given, so this sentence was the surface's subject *and* its
    // state, and the test found it by failing on the duplicate.
    expect(screen.getAllByText('Failed after 3 attempts')).toHaveLength(1)
  })
})

describe('a surface that is a function of its props, so a parent can drive it', () => {
  it('works when the parent re-renders with a new run', () => {
    // Composed into a consumer's own state rather than only used standalone, which
    // is the shape a real surface is used in.
    function Host() {
      const [events, setEvents] = useState<RunEvent[]>([event('a', 0, 'First run')])
      const [key, setKey] = useState('one')
      const subscribe = useCallback<RunSubscribe>(() => () => {}, [])
      return (
        <div>
          <button type="button" onClick={() => { setKey('two'); setEvents([event('b', 0, 'Second run')]) }}>
            switch
          </button>
          <RunStream01
            subscribe={subscribe}
            resubscribeKey={key}
            initial={events}
            eventsLabel="Events"
          />
        </div>
      )
    }

    render(<Host />)
    expect(screen.getByText('First run')).toBeInTheDocument()
    act(() => {
      screen.getByRole('button', { name: 'switch' }).click()
    })
    expect(screen.getByText('Second run')).toBeInTheDocument()
  })

  it('does not open a second subscription per event', () => {
    // The failure an effect that depends on the value it writes guarantees, and the
    // reason the emitter is a ref rather than state.
    const { state, view } = harness()
    render(view)
    act(() => {
      state.emit(event('a', 0, 'One'))
      state.emit(event('b', 1000, 'Two'))
      state.emit(event('c', 2000, 'Three'))
    })
    expect(state.connects).toBe(1)
  })

  it('survives a consumer whose subscribe returns nothing', () => {
    // Calling a missing teardown throws during unmount, so a consumer's mistake
    // would become a crash in someone else's teardown.
    const bad = (): RunSubscribe => vi.fn(() => undefined as unknown as () => void)
    const { unmount } = render(<RunStream01 subscribe={bad()} eventsLabel="Events" />)
    expect(() => unmount()).not.toThrow()
  })
})
