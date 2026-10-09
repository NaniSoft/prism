/**
 * The fourth Kind's second family: a message thread that receives messages as they
 * arrive.
 *
 * **What is being tested is the boundary, not the pixels.** A `live` surface exists
 * because a Block takes its content as props and therefore cannot express content
 * that changes without a navigation event. So the things worth asserting are the
 * ones that make it a *live* surface rather than a Block with a subscription bolted
 * on: the subscription is the consumer's and is torn down, the messages are ordered
 * by when they happened rather than when they arrived, the window is bounded, and
 * the growing list is not itself announced on every arrival.
 *
 * **It follows the `RunStream01` boundary test, which is the tested precedent.** The
 * extra assertions here are the ones this family adds: the content is a message list
 * with ordered parts, a tool-call part is drawn through the ledger's own row, and
 * the surface's only control is its pause, which pauses the surface and never the
 * run.
 */
import { act, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  MessageThread01,
  type ChatMessage,
  type MessageSubscribe,
} from '../src/live/message-thread-01'

const at = (ms: number): number => Date.UTC(2026, 9, 1, 9, 0, 0) + ms

const message = (
  id: string,
  ms: number,
  text: string,
  sender: ChatMessage['sender'] = 'assistant',
): ChatMessage => ({
  id,
  sender,
  senderLabel: sender === 'user' ? 'You' : 'Agent',
  at: at(ms),
  parts: [{ kind: 'text', text }],
})

/**
 * A transport the test controls: `emit` pushes a message, `stopped` records whether
 * the surface unsubscribed, and `connects` how many times it was called.
 */
function harness(initial: ChatMessage[] = []) {
  const state = {
    emit: (_message: ChatMessage) => {},
    stopped: 0,
    connects: 0,
  }

  const subscribe: MessageSubscribe = (emit) => {
    state.connects += 1
    state.emit = emit
    return () => {
      state.stopped += 1
    }
  }

  const view = (
    <MessageThread01
      subscribe={subscribe}
      initial={initial}
      messagesLabel="Messages"
      emptyLabel="Waiting for the first message."
      liveLabel="New message"
    />
  )

  return { state, view }
}

/** The texts in the order the thread renders them. */
const texts = (): string[] =>
  [...document.querySelectorAll('[data-slot="thread-message"]')].map(
    (row) => row.querySelector('[data-slot="message-part"][data-kind="text"] p')?.textContent ?? '',
  )

describe('MessageThread01 takes its messages from the consumer, not from a connection', () => {
  it('subscribes once on mount and unsubscribes on unmount', () => {
    const { state, view } = harness()
    const { unmount } = render(view)
    expect(state.connects).toBe(1)

    // The teardown is the half that matters and the half a consumer cannot see: a
    // surface that opens a connection and never closes it is a leak per mount.
    unmount()
    expect(state.stopped).toBe(1)
  })

  it('re-subscribes when the thread key changes, and closes the old one first', () => {
    let connects = 0
    let stops = 0
    const subscribe: MessageSubscribe = () => {
      connects += 1
      return () => {
        stops += 1
      }
    }
    const { rerender } = render(
      <MessageThread01 subscribe={subscribe} messagesLabel="Messages" resubscribeKey="a" />,
    )
    rerender(<MessageThread01 subscribe={subscribe} messagesLabel="Messages" resubscribeKey="a" />)
    expect(connects).toBe(1)

    rerender(<MessageThread01 subscribe={subscribe} messagesLabel="Messages" resubscribeKey="b" />)
    expect(connects).toBe(2)
    // The first connection is closed rather than left running beside the second,
    // which is the half a consumer cannot see from outside.
    expect(stops).toBe(1)
  })

  it('renders messages the surface already knew, so a thread opened mid-flight is not blank', () => {
    const { view } = harness([message('a', 0, 'Ask me about any run.'), message('b', 1000, 'Where did it lose time?', 'user')])
    render(view)
    expect(texts()).toEqual(['Ask me about any run.', 'Where did it lose time?'])
  })

  it('and shows its own words when it has none', () => {
    const { view } = harness()
    render(view)
    expect(screen.getByText('Waiting for the first message.')).toBeInTheDocument()
  })
})

describe('the thread is ordered by when things happened, not by when they arrived', () => {
  it('sorts messages delivered out of order', () => {
    // The reconnect case. A transport decides delivery, not truth, and a reader
    // watching a reconnect is exactly when an out-of-order thread would be noticed.
    const { state, view } = harness()
    render(view)

    act(() => {
      state.emit(message('third', 2000, 'Build'))
      state.emit(message('first', 0, 'Intake'))
      state.emit(message('second', 1000, 'Plan'))
    })

    expect(texts()).toEqual(['Intake', 'Plan', 'Build'])
  })

  it('breaks a tie on id, so the same thread renders the same way every time', () => {
    const { state, view } = harness()
    render(view)
    act(() => {
      state.emit(message('b', 500, 'Second'))
      state.emit(message('a', 500, 'First'))
    })
    expect(texts()).toEqual(['First', 'Second'])
  })

  it('merges a re-reported message in place rather than appending a second', () => {
    // The same id is the same message, so a transport that reports it again as more
    // parts arrive updates one message rather than adding another.
    const { state, view } = harness()
    render(view)
    act(() => {
      state.emit(message('a', 0, 'One'))
      state.emit({ ...message('a', 0, 'One'), parts: [{ kind: 'text', text: 'One' }, { kind: 'text', text: 'Two' }] })
    })
    expect(document.querySelectorAll('[data-slot="thread-message"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-slot="message-part"]')).toHaveLength(2)
  })

  it('drops the oldest messages past the limit rather than growing without bound', () => {
    const { state } = harness()
    render(
      <MessageThread01
        subscribe={(emit) => {
          state.emit = emit
          return () => {}
        }}
        messagesLabel="Messages"
        limit={2}
      />,
    )
    act(() => {
      for (let i = 0; i < 4; i += 1) state.emit(message(`m${i}`, i * 1000, `Message ${i}`))
    })
    expect(texts()).toEqual(['Message 2', 'Message 3'])
  })
})

describe('a growing list is not announced on every arrival', () => {
  it('announces the newest message alone', () => {
    // A live region around the thread would make a screen reader read the whole
    // conversation again on every arrival, which is the failure a live region on a
    // list guarantees rather than avoids.
    const { state, view } = harness([message('a', 0, 'Intake')])
    render(view)
    act(() => {
      state.emit(message('b', 1000, 'Plan'))
    })

    const live = document.querySelector('[aria-live]')
    expect(live).not.toBeNull()
    expect(within(live as HTMLElement).getByText('Plan')).toBeInTheDocument()
    // The earlier message is in the thread and not in the announcement.
    expect(within(live as HTMLElement).queryByText('Intake')).not.toBeInTheDocument()
  })

  it('names the scrolling region, so a keyboard reader can tell what is in it', () => {
    const { view } = harness([message('a', 0, 'Intake')])
    render(view)
    expect(screen.getByRole('group', { name: 'Messages' })).toBeInTheDocument()
  })
})

describe('the parts are the message vocabulary the Kind owns', () => {
  it('draws a tool part through the ledger own row', () => {
    const { view } = harness([
      {
        id: 'a',
        sender: 'assistant',
        at: at(0),
        parts: [
          {
            kind: 'tool',
            call: {
              id: 'c1',
              name: 'read_file',
              at: at(0),
              state: 'failed',
              argumentsText: 'runs/2026-10-01.jsonl',
              errorText: 'The file is gone.',
            },
          },
        ],
      },
    ])
    render(view)
    // The shared row's own slots, so the message part and the ledger cannot drift
    // into two shapes for one call.
    expect(screen.getByText('read_file')).toBeInTheDocument()
    expect(screen.getByText('runs/2026-10-01.jsonl')).toBeInTheDocument()
    expect(screen.getByText('The file is gone.')).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="message-part"][data-kind="tool"] [data-slot="tool-ledger-error"]'),
    ).not.toBeNull()
  })

  it('draws a reasoning block collapsed and a citation as a named link', () => {
    const { view } = harness([
      {
        id: 'a',
        sender: 'assistant',
        at: at(0),
        parts: [
          { kind: 'reasoning', label: 'How I worked it out', text: 'Compare the two logs.' },
          { kind: 'citation', label: 'Open the arrival log', href: '#northbound' },
        ],
      },
    ])
    render(view)
    expect(screen.getByText('How I worked it out')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open the arrival log' })).toHaveAttribute('href', '#northbound')
  })
})

describe('the surface holds no control it cannot act on', () => {
  it('draws only its pause control, and the pause pauses the surface', () => {
    const { state } = harness()
    render(
      <MessageThread01
        subscribe={(emit) => {
          state.emit = emit
          return () => {}
        }}
        messagesLabel="Messages"
        pauseControl
        pauseLabel="Pause the thread"
        resumeLabel="Resume the thread"
      />,
    )

    const pause = screen.getByRole('button', { name: 'Pause the thread' })
    expect(pause).toHaveAttribute('aria-pressed', 'false')

    act(() => {
      pause.click()
    })
    expect(screen.getByRole('button', { name: 'Resume the thread' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // A paused thread drops what arrives rather than queueing it, and it does not
    // close the subscription, which is the consumer's and may be shared.
    act(() => {
      state.emit(message('a', 0, 'Arrived while paused'))
    })
    expect(screen.queryByText('Arrived while paused')).not.toBeInTheDocument()
    expect(state.stopped).toBe(0)
  })

  it('draws no send, stop, retry or attach control of its own', () => {
    // Those are PromptComposer's, composed beside the thread, so the surface draws
    // none of them and cannot render one it cannot act on.
    const { view } = harness([message('a', 0, 'Intake')])
    render(view)
    for (const name of ['Send', 'Stop', 'Retry', 'Attach']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    }
  })
})

describe('a surface that is a function of its props, so a parent can drive it', () => {
  it('does not open a second subscription per message', () => {
    const { state, view } = harness()
    render(view)
    act(() => {
      state.emit(message('a', 0, 'One'))
      state.emit(message('b', 1000, 'Two'))
      state.emit(message('c', 2000, 'Three'))
    })
    expect(state.connects).toBe(1)
  })

  it('survives a consumer whose subscribe returns nothing', () => {
    // Calling a missing teardown throws during unmount, so a consumer's mistake
    // would become a crash in someone else's teardown.
    const bad = (): MessageSubscribe => vi.fn(() => undefined as unknown as () => void)
    const { unmount } = render(<MessageThread01 subscribe={bad()} messagesLabel="Messages" />)
    expect(() => unmount()).not.toThrow()
  })
})
