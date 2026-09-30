'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Consent01 } from '@nanisoft/prism-ui/blocks/consent-01'

/**
 * The notice, with the record it did not keep printed underneath.
 *
 * The Demo is the only place in this repository that can show the point of the
 * Block, because the point is a refusal that looks like a refusal. A notice whose
 * reject is a ghost beside a filled accept looks complete in a screenshot, so the
 * screenshot is not where the argument can be made, and a live notice a reader can
 * press is.
 */
const BODY = (
  <>
    <p>
      This demo stores nothing. That is the Block rather than the Demo: there is no
      cookie, no local storage and no state in the module, so a reload asks again
      until the consumer stops rendering the notice.
    </p>
    <p>
      We set two cookies: one remembers that the notice was seen, and one measures
      which pages are read. Refusing turns off exactly the second one, and the
      preference surface is not built here, so the settings control is passed no
      handler and is not drawn at all.
    </p>
  </>
)

export default function Consent01Demo() {
  const [position, setPosition] = useState<'banner' | 'dialog'>('banner')
  const [withSettings, setWithSettings] = useState(false)
  const [record, setRecord] = useState<{ choice: string; at: string } | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose how to show the notice">
        <button
          type="button"
          aria-pressed={position === 'banner'}
          onClick={() => setPosition('banner')}
          className={
            position === 'banner'
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          In the flow
        </button>
        <button
          type="button"
          aria-pressed={position === 'dialog'}
          onClick={() => setPosition('dialog')}
          className={
            position === 'dialog'
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Covering
        </button>
        <button
          type="button"
          aria-pressed={withSettings}
          onClick={() => setWithSettings(!withSettings)}
          className={
            withSettings
              ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
              : 'border-input rounded-md border px-3 py-1.5 text-sm'
          }
        >
          Settings route
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRecord(null)
            setWithSettings(false)
          }}
        >
          Show the notice again
        </Button>
      </div>

      {record === null ? (
        <Consent01
          title="Cookies on this site"
          body={BODY}
          acceptLabel="Accept"
          rejectLabel="Refuse"
          settingsLabel="Choose which cookies"
          onAccept={() => setRecord({ choice: 'accepted', at: new Date().toISOString() })}
          onReject={() => setRecord({ choice: 'rejected', at: new Date().toISOString() })}
          {...(withSettings
            ? { onSettings: () => setRecord({ choice: 'opened settings', at: new Date().toISOString() }) }
            : null)}
          policyHref="/overview"
          policyLabel="Read the cookie policy"
          position={position}
          headingLevel="h3"
        />
      ) : (
        <div className="border-border rounded-xl border p-4">
          <p className="text-foreground mb-2 text-sm font-medium">
            The decision the consumer would now store
          </p>
          <ul className="text-muted-foreground flex flex-col gap-1 font-mono text-xs">
            <li>choice: {record.choice}</li>
            <li>at: {record.at}</li>
            <li>policy version: (yours, not the Block&rsquo;s)</li>
          </ul>
          <p className="text-muted-foreground mt-3 text-sm">
            Press the button above to see the notice again, which is the behaviour a
            consumer who has written no storage gets and the one a consumer who has
            written some replaces.
          </p>
        </div>
      )}
    </div>
  )
}
