'use client'

import { useState } from 'react'

import { Handoff01, type Handoff01Status } from '@nanisoft/prism-ui/blocks/handoff-01'

/**
 * One handover, with the state machine the control actually has.
 *
 * The Demo is the only place in this repository that can show the point of the Block,
 * because the point is a refusal that looks like a refusal until you press it. A
 * screenshot of a handover shows two names at the same weight and a button, and both
 * of those look like a mistake to a reader who has seen a hundred handovers with the
 * receiver emphasised. A live one they can press is not.
 *
 * So the Demo holds the caller's own status and moves it through the four states the
 * type allows, which is the whole of what this Block refuses to do for them: the
 * control's words in the confirmed state, the sentence beside it, and the fact that it
 * is disabled rather than gone are all the consumer's decisions arriving as props.
 */
export default function Handoff01Demo() {
  const [status, setStatus] = useState<Handoff01Status>()
  const [taken, setTaken] = useState(false)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Press the control. Nothing here is Prism&rsquo;s: the sentence beside it, the
        words the control reads afterwards, and the fact that it is disabled rather
        than removed are all this Demo&rsquo;s decisions arriving as props. Press it
        again and you will get the same four refusals, because the Block has no state of
        its own to advance.
      </p>

      <Handoff01
        headingLevel="h3"
        eyebrow="Preview"
        title="The Tuesday settlement run"
        description="End of shift. Everything still open is listed, so nobody has to ask about it."
        from={{
          name: 'Jide Abara',
          role: 'Settlement engineering',
          avatar: { name: 'Jide Abara' },
        }}
        to={{
          name: 'Margret Haldorsdottir',
          role: 'Estate observation',
          avatar: { src: 'https://portraits.example/mh.png', name: 'Margret Haldorsdottir' },
        }}
        state="draining"
        stateLabel="Draining, capture still running"
        startedAt="2026-09-28T17:00:00Z"
        open={[
          {
            id: 'capture',
            label: 'The Rotterdam capture is half done and the source has no dedupe key',
            href: '/overview',
            hrefLabel: 'See the run',
          },
          {
            id: 'cert',
            label: 'A certificate on the Rotterdam load balancer expires in 61 days',
            href: '/overview',
            hrefLabel: 'See the certificate',
          },
          {
            id: 'snapshot',
            label: 'The snapshot job has been failing on the Rotterdam volume since Friday',
          },
        ]}
        onConfirm={() => {
          setStatus({ state: 'sending', message: 'Handing the run over' })
          window.setTimeout(() => {
            setTaken(true)
            setStatus({
              state: 'confirmed',
              message:
                'Margret has the run. It is on her rota until Thursday and the capture carries on where Jide left it.',
            })
          }, 900)
        }}
        confirmLabel="Take this run"
        confirmedLabel="Margret has this run"
        status={status}
        empty="Nothing outstanding. The run is quiet and everything that was due is done."
      />

      {taken ? null : (
        <button
          type="button"
          className="text-muted-foreground self-start text-sm underline underline-offset-4"
          onClick={() => {
            setTaken(false)
            setStatus(undefined)
          }}
        >
          Put the handover back before it happened
        </button>
      )}

      <Handoff01
        headingLevel="h3"
        eyebrow="Preview"
        title="A handover with nothing outstanding"
        description="The same Block with an empty list, and the sentence in place of it. Nothing outstanding is the good case and the sentence saying so is the one a receiver is most likely to believe without reading, which is why it is yours."
        from={{ name: 'Priya Raman', role: 'Market reading' }}
        to={{ name: 'Halima Said', role: 'Market reading' }}
        state="quiet"
        stateLabel="Quiet since Thursday afternoon"
        startedAt="2026-09-24T14:05:00Z"
        open={[]}
        onConfirm={() => {}}
        confirmLabel="Take the watchlist"
        confirmedLabel="Halima has the watchlist"
        status={{ state: 'confirmed', message: 'Halima has the watchlist. Nothing was in flight.' }}
        empty="Nothing outstanding. Every capture that was due has landed and nothing is waiting on anybody."
      />
    </div>
  )
}
