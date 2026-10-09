'use client'

import { useCallback, useRef, useState } from 'react'

import {
  PromptComposer,
  type PromptComposerState,
} from '@nanisoft/prism-ui/components/prompt-composer'
import { MessageThread01, type ChatMessage } from '@nanisoft/prism-ui/live/message-thread-01'

/** The thread's clock, so an order the Demo chose is the order a reader sees. */
const OPENED = Date.UTC(2026, 9, 1, 9, 0, 0)
let clock = 0
const tick = (): number => {
  clock += 1
  return OPENED + clock * 1000
}

/**
 * A conversation fed by a stand-in transport, with the run controls beside it.
 *
 * The subscription is a ref rather than a socket, because that is the honest shape
 * of the prop: Prism opens no connection, so a Demo that pretended to have one
 * would misrepresent the boundary the Item exists to hold. A real consumer swaps
 * the body of `subscribe` and nothing else changes.
 *
 * The composer is composed **beside** the thread rather than inside it, and that is
 * the point the Item makes: send, stop, retry and attach are `PromptComposer`'s
 * controls, and the thread draws only its own pause control. The two are separate
 * Items a consumer arranges, so a settled thread can be read without a composer
 * anywhere near it.
 */
export default function MessageThread01Demo() {
  const emitter = useRef<((message: ChatMessage) => void) | null>(null)
  const timers = useRef<number[]>([])
  const [text, setText] = useState('Where did the northbound run lose four minutes?')
  const [state, setState] = useState<PromptComposerState>({ phase: 'idle' })

  const clearTimers = (): void => {
    for (const handle of timers.current) window.clearTimeout(handle)
    timers.current = []
  }

  const subscribe = useCallback((emit: (message: ChatMessage) => void) => {
    emitter.current = emit
    return () => {
      emitter.current = null
    }
  }, [])

  const run = (request: string): void => {
    clearTimers()
    setState({ phase: 'sending' })
    emitter.current?.({
      id: `u${tick()}`,
      sender: 'user',
      senderLabel: 'You',
      at: tick(),
      parts: [{ kind: 'text', text: request }],
    })

    timers.current.push(
      window.setTimeout(() => setState({ phase: 'streaming' }), 600),
      window.setTimeout(() => {
        emitter.current?.({
          id: `a${tick()}`,
          sender: 'assistant',
          senderLabel: 'Agent',
          at: tick(),
          parts: [
            { kind: 'reasoning', label: 'How I worked it out', text: 'Compare the two arrival logs and find the gap.' },
            {
              kind: 'tool',
              call: {
                id: `c${tick()}`,
                name: 'read_file',
                at: tick(),
                state: 'succeeded',
                argumentsText: 'runs/northbound-2026-10-01.jsonl',
                resultText: '4 minutes lost between Berwick and Dunbar.',
              },
            },
            {
              kind: 'text',
              text: 'The run lost four minutes between Berwick and Dunbar, where a signal check held it.',
            },
            { kind: 'citation', label: 'Open the arrival log', href: '#northbound', detail: 'Run 41c9, 09:14' },
          ],
        })
        setState({ phase: 'done' })
      }, 1800),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <MessageThread01
        subscribe={subscribe}
        resubscribeKey="thread-41c9"
        status={state.phase === 'streaming' || state.phase === 'sending' ? 'running' : 'done'}
        statusLabel={state.phase === 'streaming' || state.phase === 'sending' ? 'Answering' : 'Up to date'}
        title="Run 41c9"
        eyebrow="Conversation"
        messagesLabel="Messages in this conversation"
        emptyLabel="Nothing has been said yet. Ask the first question below."
        liveLabel="New message"
        pauseControl
        pauseLabel="Pause the thread"
        resumeLabel="Resume the thread"
        initial={[
          {
            id: 'seed-1',
            sender: 'assistant',
            senderLabel: 'Agent',
            at: OPENED,
            parts: [{ kind: 'text', text: 'Ask me about any run and I will trace where its time went.' }],
          },
        ]}
      />

      <PromptComposer
        label="What should the agent do?"
        state={state}
        text={text}
        onTextChange={setText}
        onSubmit={run}
        onStop={() => {
          clearTimers()
          setState({ phase: 'idle' })
        }}
        onRetry={() => run(text)}
        sendLabel="Send"
        stopLabel="Stop generating"
        retryLabel="Try again"
        attachLabel="Attach"
        onAttach={() => {}}
        attachments={[]}
        onRemoveAttachment={() => {}}
        removeAttachmentLabel={(name) => `Remove ${name}`}
      />
    </div>
  )
}
