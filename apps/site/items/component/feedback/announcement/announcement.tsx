'use client'

import { useState } from 'react'

import { Announcement } from '@nanisoft/prism-ui/components/announcement'
import { Button } from '@nanisoft/prism-ui/components/button'

/** The five tones the semantic contract publishes. */
const TONES = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

/**
 * Every tone, and the two shapes the bar can be in.
 *
 * The bar with the action and the dismiss is the full arrangement, and the second
 * one is the same bar with `dismissible` off, which is the notice a reader must
 * not dismiss. Both are here because the difference is a prop and because a
 * dismiss control on a notice is a decision the caller makes rather than one this
 * Component makes for them.
 */
export default function AnnouncementDemo() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <div className="flex max-w-measure-wide flex-col gap-3">
      {TONES.map((tone) => (
        <Announcement
          key={tone}
          tone={tone}
          message={`The ${tone} bar states its own fill and its own ink.`}
          action={
            <Button size="sm" variant="outline">
              See what changed
            </Button>
          }
          dismissible
          dismissLabel={`Dismiss the ${tone} notice`}
        />
      ))}

      <Announcement
        tone="info"
        message="This one cannot be dismissed, because the condition it describes is still true."
      />

      {dismissed ? null : (
        <Announcement
          tone="warning"
          message="A dismissal this one records stays dismissed after the reload."
          dismissible
          dismissLabel="Dismiss and remember"
          onDismiss={() => setDismissed(true)}
          action={
            <Button size="sm" variant="outline" onClick={() => setDismissed(true)}>
              Migrate now
            </Button>
          }
        />
      )}

      {dismissed ? (
        <p className="text-muted-foreground text-sm">
          The bar above is gone, and this line is here because the caller decided
          so. Prism did not decide it.
        </p>
      ) : null}
    </div>
  )
}
