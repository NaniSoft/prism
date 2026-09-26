'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'

type Status = 'idle' | 'copied' | 'failed'

const REVERT_MS = 1600

/*
 * Everything that never changes, in one place. The `before:` chain is the
 * hit-area decoupling described at the call site below and is load-bearing —
 * splitting the string so the text colour can swap would otherwise put that
 * chain in two literals, free to drift apart on the next edit.
 */
const BUTTON_BASE =
  "border-border bg-card hover:bg-accent hover:text-accent-foreground relative inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']"

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const revertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const attempt = useRef(0)

  useEffect(() => () => clearTimeout(revertTimer.current), [])

  async function copy() {
    // A second click supersedes the first, so only the latest attempt is
    // allowed to speak. Without this, two in-flight writes can settle out of
    // order and a stale "Copied" lands on top of a fresh failure.
    const id = ++attempt.current
    let next: Status = 'failed'
    try {
      await navigator.clipboard.writeText(value)
      next = 'copied'
    } catch {
      // Clipboard can be blocked by permissions. It can also fail because the
      // window lost focus mid-write, or because `navigator.clipboard` does not
      // exist at all on an insecure origin — that last case throws a TypeError
      // from calling through `undefined`, and it arrives here too. The causes
      // are not separable at this size and, more to the point, the recovery is
      // the same for all of them, so the catch says the one thing it knows:
      // the copy did not happen. Leaving the text selectable is still the
      // fallback; the label just stops implying otherwise.
    }

    if (id !== attempt.current) return
    setStatus(next)
    clearTimeout(revertTimer.current)
    revertTimer.current = setTimeout(() => setStatus('idle'), REVERT_MS)
  }

  // The visual box stays at 26px — a bordered pill at 44px would outweigh the
  // 12px monospace command it sits beside, and this is a secondary inline
  // control, not the page's primary CTA. The hit area is decoupled from it
  // instead: a ::before band, 44px tall and centred on the button, extends the
  // tappable region 9px past the border box on each side without touching
  // layout. It is transparent, so hover and focus paint exactly as before, and
  // it stays inside the install row's `p-3`, so it never reaches the heading
  // above or steals a tap from the command text beside it.
  //
  // Failure recolours the text and nothing else. The surface stays `bg-card` and
  // the border stays `border-border`: a 26px control that also tinted its own
  // fill would read as a persistent error badge, when the state is transient
  // and resolves itself in REVERT_MS. The word, the icon and the colour are
  // three channels for one fact, and any one of them alone would be a failure
  // — colour and iconography are not read aloud, and a swatch is not a label.
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`${status === 'failed' ? 'text-destructive' : 'text-muted-foreground'} ${BUTTON_BASE}`}
      >
        {status === 'copied' ? (
          <Check aria-hidden className="size-3" />
        ) : status === 'failed' ? (
          <TriangleAlert aria-hidden className="size-3" />
        ) : (
          <Copy aria-hidden className="size-3" />
        )}
        {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : label}
      </button>

      {/*
        The failure is announced, and only the failure. The region is mounted
        from the first render and stays empty otherwise, because a live region
        that appears at the same moment as its own text is not announced
        reliably; what is announced is a change to a node already on the page.

        It is a sibling of the button rather than a child or a wrapper. A child
        would fold the message into the button's accessible name and announce
        on every state change; a wrapper would make the sr-only span the flex
        item in the install row and push `shrink-0` off the button. As a
        sibling, `sr-only`'s `position: absolute` takes it out of flow — an
        absolutely positioned box is not a flex item — so the row lays out
        identically in all three states.

        It is blank on the success path on purpose. Wrapping the button in a
        polite region would make "Copy" -> "Copied" announce as well, and the
        button already carries that outcome in its own name, so the pair would
        be read twice. Reverting to idle empties the text rather than swapping
        in neutral filler, which would have a screen reader speak a word that
        carries no meaning.
      */}
      <span role="status" className="sr-only">
        {status === 'failed' ? 'Copy failed' : ''}
      </span>
    </>
  )
}
