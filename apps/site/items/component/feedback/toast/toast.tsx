'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Toast } from '@nanisoft/prism-ui/components/toast'

/**
 * The four tones a Toast draws.
 *
 * A toast's behaviour is its timing, so a Demo that renders one instance and
 * leaves it is not showing the Component. This one switches the tone so the four
 * fills and inks are comparable, and it leaves the clock running so the pause is
 * real: put the pointer on the toast and it stops, take it off and it continues
 * with the time it had left rather than four more seconds.
 *
 * The type is written out rather than left to `as const`, because a union of
 * object literals has the optional member on only the member that declared it,
 * and reading `entry.action` off the union is then an error on the other three.
 */
type DemoTone = {
  key: 'default' | 'success' | 'warning' | 'destructive'
  label: string
  title: string
  description: string
  /** The label of the one route out, when this tone offers one. */
  action?: string
}

const TONES: readonly DemoTone[] = [
  {
    key: 'default',
    label: 'Informational',
    title: 'Changes saved',
    description: 'Your workspace is up to date.',
  },
  {
    key: 'success',
    label: 'Success',
    title: 'Invoice sent',
    description: 'Acme Ltd can see it now.',
  },
  {
    key: 'warning',
    label: 'Warning',
    title: 'Card expires this month',
    description: 'Update it before the next invoice.',
  },
  {
    key: 'destructive',
    label: 'Destructive',
    title: 'Session expired',
    description: 'Sign in again to pick up where you left off.',
    // The one route out, offered beside the words rather than instead of them.
    // A toast's action is a shortcut, never the only way to do the thing.
    action: 'Sign in',
  },
]

/** One live Toast at a time, so the reader can watch a whole life. */
export default function ToastDemo() {
  const [tone, setTone] = useState<DemoTone['key']>('success')
  const [open, setOpen] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  // `0` is the clock being off, so the reader is not going to be told they
  // missed a message they are being asked to act on.
  const [sticky, setSticky] = useState(false)

  const current = TONES.find((entry) => entry.key === tone) ?? TONES[0]

  const show = (next: DemoTone['key']) => {
    setTone(next)
    setDismissed(false)
    setOpen(true)
  }

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        A Toast reports something the reader did not have to be told. It never
        takes focus, it is announced once, and it pauses on hover and on focus
        while holding the time it had left.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a tone">
        {TONES.map((entry) => (
          <Button
            key={entry.key}
            type="button"
            variant={tone === entry.key ? 'default' : 'outline'}
            size="sm"
            aria-pressed={tone === entry.key}
            onClick={() => show(entry.key)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <div className="border-border bg-card relative min-h-32 rounded-lg border p-6">
        {open ? (
          <Toast
            variant={current?.key}
            title={current?.title}
            description={current?.description}
            closeLabel="Dismiss notification"
            duration={sticky ? 0 : undefined}
            action={
              current?.action === undefined ? undefined : (
                <Button size="sm" variant="outline">
                  {current.action}
                </Button>
              )
            }
            onDismiss={() => {
              setOpen(false)
              setDismissed(true)
            }}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={() => show(tone)} disabled={open}>
          Show again
        </Button>
        {/*
          A clock that is off. The one toast a reader has to act on, and the only
          case where a toast earns the name: the reader's next step is the toast's
          entire purpose, so it cannot be allowed to expire before they take it.
        */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-pressed={sticky}
          onClick={() => {
            setSticky((was) => !was)
            setDismissed(false)
            setOpen(true)
          }}
        >
          {sticky ? 'Turn the clock back on' : 'Turn the clock off'}
        </Button>
        {/*
          Not a `role="status"`. The Toast beside it is already a live region, and
          a Demo that announces the toast's own life from a second live region is
          demonstrating the opposite of what the Component argues for.
        */}
        <span className="text-muted-foreground text-sm">
          {open
            ? sticky
              ? 'On screen, and it will wait for you.'
              : 'On screen, on a four second clock.'
            : dismissed
              ? 'Asked to leave, and gone.'
              : 'Not shown.'}
        </span>
      </div>

      <p className="text-muted-foreground text-sm">
        Put the pointer on a toast and it stops. Take it off and the toast
        continues with the time it had left, so hovering for ten seconds does not
        buy four more seconds. There is no countdown on screen on purpose: a
        number that changed inside a live region would be read out four times a
        second.
      </p>
    </div>
  )
}
