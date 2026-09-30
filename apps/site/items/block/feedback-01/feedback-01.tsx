'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Feedback01 } from '@nanisoft/prism-ui/blocks/feedback-01'

/**
 * The panel, with the scale this site would actually ask and the three ways a
 * report can end.
 *
 * The Demo owns the scale, the counter, the refusal and the three sentences, on
 * purpose. Every one of those is the argument the Block makes: Prism supplies no
 * points, no order, no wording, no minimum and no confirmation, so a preview that
 * showed five smiling faces and a "Thanks" would have shown the parts this Block
 * refuses to ship rather than the parts it does.
 */
const SCALE = [
  { id: 'blocked', label: 'Blocked', value: 1 },
  { id: 'slow', label: 'Slow', value: 2 },
  { id: 'fine', label: 'Fine', value: 3 },
]

export default function Feedback01Demo() {
  const [rating, setRating] = useState<string>()
  const [comment, setComment] = useState('')
  const [attached, setAttached] = useState<string[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<React.ReactNode>(null)
  const [withArtefact, setWithArtefact] = useState(true)
  const [withComment, setWithComment] = useState(true)

  function report(value: { rating?: string; comment?: string; files?: File[] }) {
    setState('sending')
    setMessage(null)
    // Stands in for a request. The rejection is the one a triage queue produces
    // most often and the one a demo is least likely to reach for.
    window.setTimeout(() => {
      if (value.rating === 'blocked' && (value.comment ?? '').trim() === '') {
        setState('error')
        setMessage('A report with nothing in it goes to nobody. Add a line and send it again.')
        return
      }
      const files = value.files?.length ?? 0
      setState('sent')
      setMessage(
        files > 0
          ? `Received, with ${files} attachment${files === 1 ? '' : 's'}. An engineer will read it.`
          : 'Received. An engineer will read it.',
      )
    }, 500)
  }

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Three points, not five, and the ends are named as the reader&rsquo;s situation rather
        than as a judgement about the product. Choose <strong>Blocked</strong> and send with the
        comment empty to see the refusal, which is the caller&rsquo;s sentence and not the
        Block&rsquo;s.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose which halves to show">
        <button
          type="button"
          aria-pressed={withComment}
          onClick={() => setWithComment(!withComment)}
          className={
            withComment
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Comment
        </button>
        <button
          type="button"
          aria-pressed={withArtefact}
          onClick={() => setWithArtefact(!withArtefact)}
          className={
            withArtefact
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Attachment
        </button>
        <Button variant="ghost" size="sm" onClick={() => setRating(undefined)}>
          Clear the scale
        </Button>
      </div>

      <Feedback01
        eyebrow="Nexus"
        title="Tell us what went wrong"
        description="One engineer reads every report, and a blocked report is read first."
        scale={SCALE}
        scaleLabel="How is it going?"
        value={rating}
        onValueChange={setRating}
        {...(withComment
          ? {
              comment: {
                label: 'What happened?',
                value: comment,
                onValueChange: setComment,
                maxLength: 500,
                counter: true,
              },
            }
          : null)}
        {...(withArtefact
          ? {
              artefact: {
                label: 'A screenshot of the error',
                onFiles: (files: File[]) => setAttached(files.map((one) => one.name)),
                accept: 'image/*',
              },
            }
          : null)}
        submitLabel="Send"
        cancel={
          <Button variant="ghost" onClick={() => setRating(undefined)}>
            Never mind
          </Button>
        }
        status={state === 'idle' ? undefined : { state, message }}
        onSubmit={report}
        headingLevel="h3"
      />

      {/*
        * The named files, printed by the Demo. Prism reads no byte of them and
        * uploads nothing, so the names are here because the caller's own handler
        * chose to keep them rather than because the Block needed them.
        */}
      {attached.length > 0 ? (
        <p className="text-muted-foreground text-sm">
          Named in the caller&rsquo;s state: {attached.join(', ')}
        </p>
      ) : null}
    </div>
  )
}
