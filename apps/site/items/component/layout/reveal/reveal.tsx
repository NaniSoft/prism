import { Reveal } from '@nanisoft/prism-ui/components/reveal'

/**
 * Two cards arriving, the second a step behind the first. The demo is the
 * device at its smallest: a staggered pair inside one panel, so the rhythm is
 * visible without a page to scroll.
 *
 * In this documentation frame the cards below the fold are the honest preview:
 * scroll to them and they arrive, arrive again on the way back up at no delay,
 * and a reader who has asked the platform for less motion finds them simply
 * there.
 */
export default function RevealDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Reveal>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            First band
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            An arrival, bound to the scroll the reader owns
          </h3>
          <p className="text-muted-foreground mt-2 text-sm text-pretty">
            No script decides when this plays. The hand on the scroll does, and
            a browser that cannot run it shows the band simply there.
          </p>
        </div>
      </Reveal>
      <Reveal delay={1}>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Second band
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            The same arrival, a step behind
          </h3>
          <p className="text-muted-foreground mt-2 text-sm text-pretty">
            The step is a fraction of the entry rather than a wait, so a reader
            who scrolls fast arrives fast, and nothing here could delay them.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
