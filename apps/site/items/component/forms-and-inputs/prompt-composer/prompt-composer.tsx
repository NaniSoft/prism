'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

import {
  PromptComposer,
  type PromptComposerAttachment,
  type PromptComposerState,
} from '@nanisoft/prism-ui/components/prompt-composer'

/**
 * A request lifecycle, driven by this Demo and by nothing else.
 *
 * The five positions are held in state and advanced by two timers, which stands in
 * for whatever the caller's transport reports. There is no fetch here and no model
 * client, and that is the arrangement the Component asks for rather than a
 * limitation of the Demo: the position is the caller's fact, and a design system
 * that opened the connection would hand every consumer a connection it did not ask
 * for.
 *
 * The one rule worth reading is the failing one. A request whose text begins with
 * `fail` ends in the failed position, so every affordance in the lifecycle can be
 * seen without a second Demo. Real products decide failure from a status code, a
 * validation result or a stream error, and the Component is identical either way.
 */
export default function PromptComposerDemo() {
  const picker = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])
  const [state, setState] = useState<PromptComposerState>({ phase: 'idle' })
  const [text, setText] = useState('Summarise last night on the northbound run.')
  const [attachments, setAttachments] = useState<PromptComposerAttachment[]>([])

  const clearTimers = () => {
    for (const handle of timers.current) window.clearTimeout(handle)
    timers.current = []
  }

  // Clearing on unmount is the one effect a caller of a Component that owns no
  // transport still owes, because the timers are the caller's.
  useEffect(() => clearTimers, [])

  const run = (request: string) => {
    clearTimers()
    const fails = request.trim().toLowerCase().startsWith('fail')
    setState({ phase: 'sending' })
    timers.current.push(
      window.setTimeout(() => setState({ phase: 'streaming' }), 700),
      window.setTimeout(
        () =>
          setState(
            fails
              ? { phase: 'failed', reason: 'The agent could not read that run. Try again, or narrow the window.' }
              : { phase: 'done' },
          ),
        2600,
      ),
    )
  }

  const take = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ''
    setAttachments((current) => [
      ...current,
      ...chosen.map((file) => ({ id: `${file.name}-${file.size}`, name: file.name })),
    ])
  }

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <input
        ref={picker}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={take}
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
        onAttach={() => picker.current?.click()}
        attachments={attachments}
        onRemoveAttachment={(id) =>
          setAttachments((current) => current.filter((item) => item.id !== id))
        }
        removeAttachmentLabel={(name) => `Remove ${name}`}
      />

      <p className="text-muted-foreground text-sm">
        Send the note to watch the request go from nothing to sending to streaming,
        where the only control is a stop, and then to done. Send a note beginning
        with the word fail to reach the failed position, with the reason beneath and
        a retry beside the control rather than in place of it. Attach two files and
        remove the first one: focus lands on the row that took its place, and on the
        attach control when the last one goes.
      </p>
    </div>
  )
}
