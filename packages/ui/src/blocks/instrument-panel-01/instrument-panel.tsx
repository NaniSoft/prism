import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The state a panel's title bar claims about what is inside it.
 *
 * Three, and none of them is a fifth: `neutral` says nothing, `live` says the
 * content is updating now, and `paused` says it is not. A fourth state such as
 * `error` or `stale` is a claim about a specific system's health, and a panel
 * that shipped one would be making a claim about every consumer's data on their
 * behalf.
 */
export type PanelState = 'neutral' | 'live' | 'paused'

/**
 * The dot each state draws.
 *
 * All three are `aria-hidden`, and the state is announced in words beside them
 * rather than by the colour: a live dot is a shape a reader who cannot see
 * `success` has not been told anything, and the three sites that draw one all
 * write the words next to it. That is the rule this reproduces, and it is why
 * `stateLabel` is required whenever `state` is set to anything but `neutral`.
 */
const STATE_DOT = {
  neutral: 'bg-muted-foreground',
  live: 'bg-success',
  paused: 'bg-warning',
} as const

/**
 * The props an InstrumentPanel01 takes.
 *
 * The content is a slot and the frame is the Block. A panel that took a prop per
 * kind of instrument would be four panels, and an instrument - a graph, a chart,
 * a table, a canvas, a piece of application-owned markup - is the one thing in
 * this system that Prism cannot draw, because drawing it is the application's job
 * and its data is the application's own.
 */
export type InstrumentPanel01Props = {
  /**
   * What the panel shows, in one phrase: "the estate, as one graph", "the loop,
   * live". It is the panel's title and the only visible text the Block adds, so
   * it is required.
   */
  label: string
  /**
   * The state the title bar claims about the content. `neutral` renders a quiet
   * dot and no words; `live` and `paused` require `stateLabel` with them, because
   * the words are what a reader is told and the dot is only what a reader sees.
   *
   * @defaultValue 'neutral'
   */
  state?: PanelState
  /**
   * The words for the state, in the product's own vocabulary. Required whenever
   * `state` is `live` or `paused`: "live view", "paused", "snapshotting" and
   * "verified" are four different claims about four different systems, and none
   * of them is Prism's to choose.
   */
  stateLabel?: string
  /**
   * A slot on the right of the title bar, for a control the panel does not own: a
   * range selector, a pause button, a link to the full view. A slot rather than a
   * prop, because every one of those is application state.
   */
  actions?: ReactNode
  /**
   * The instrument. Any node the consumer composes: a graph, a chart, a table, a
   * canvas, a placeholder in a static export. The Block draws the frame and the
   * bar and nothing else.
   */
  children: ReactNode
  /**
   * The line under the instrument, for what a reader needs to know before
   * trusting it: where the data came from, how fresh it is, what is not shown.
   */
  footnote?: ReactNode
  /**
   * A caption for the panel as a whole, published as the frame's accessible name
   * and as no visible text. It is how a reader navigating by figure knows which
   * figure they have landed on.
   */
  caption?: string
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A bordered instrument panel with a titled bar: the frame a live view of
 * something is shown in, beside the copy that explains it.
 *
 * Three of the four NaniSoft sites compose this as the right half of their hero,
 * and each one wrote the same four things by hand: a bordered panel, a bar across
 * the top with a small state dot on the left, the name of the view in the middle
 * and something on the right, the instrument below, and a footnote under it. Each
 * also gave the panel a definite height, because an instrument whose height is
 * whatever its content is makes the hero beside it jump while it loads.
 *
 * **The panel owns the frame, never the instrument.** What goes inside is
 * whatever the consumer composed, and that is not a limitation: an instrument is
 * the one thing in this system Prism cannot draw, because it is a view of the
 * consumer's data and every consumer's data is a different drawing. A panel that
 * took a prop per instrument kind would be four panels and would still not cover
 * the fifth consumer to write their own.
 *
 * The state dot is `aria-hidden` and the words beside it are not. All three sites
 * that draw a dot write the state in words next to it, and that is the rule here:
 * a dot is a shape, and a reader who cannot see `success` has learned nothing from
 * it. `stateLabel` is therefore required whenever the state is `live` or `paused`,
 * and the Block throws without it rather than shipping a state a reader can only
 * see.
 *
 * The bar is a `Section`-width row rather than a page-width one, because a panel
 * is a column and a column that runs the page's width is not a column. The frame
 * carries `shadow-sm`, the resting surface step, and no more: a panel is a card
 * with an instrument in it, and the only element in this system that means
 * *lifted* is the one with a border in the pack's primary hue, which this is not.
 *
 * The three states are `neutral`, `live` and `paused`, and there is no fourth. A
 * state such as `error` or `stale` is a claim about a specific system's health,
 * and a panel that shipped one would be making that claim about every consumer's
 * data.
 *
 * It is a server Component. It holds no state and imports no client code, so a
 * consumer that puts a client instrument inside it pays for the instrument and not
 * for the frame.
 */
export function InstrumentPanel01({
  label,
  state = 'neutral',
  stateLabel,
  actions,
  children,
  footnote,
  caption,
  className,
}: InstrumentPanel01Props) {
  if (state !== 'neutral' && !stateLabel) {
    throw new Error(
      `InstrumentPanel01: the panel state is '${state}' and no stateLabel was passed, so the state would ` +
        'be a dot a reader can only see. Pass the words you mean, or use the neutral state.',
    )
  }

  return (
    <figure
      data-slot="instrument-panel"
      data-state={state}
      aria-label={caption}
      className={cn('bg-card flex w-full flex-col gap-0 rounded-xl border shadow-sm', className)}
    >
      <div
        data-slot="instrument-panel-bar"
        className="border-border text-muted-foreground flex items-center gap-3 border-b px-4 py-2 text-xs"
      >
        <span
          aria-hidden
          data-state={state}
          className={cn('inline-block size-2 shrink-0 rounded-full', STATE_DOT[state])}
        />
        <span className="truncate font-medium">{label}</span>
        {stateLabel ? <span className="truncate">{stateLabel}</span> : null}
        {actions ? <span className="ms-auto flex shrink-0 items-center gap-2">{actions}</span> : null}
      </div>

      <div data-slot="instrument-panel-body" className="min-h-0 flex-1 px-4 py-3">
        {children}
      </div>

      {footnote ? (
        <figcaption
          data-slot="instrument-panel-footnote"
          className="text-muted-foreground border-border border-t px-4 py-2 text-xs"
        >
          {footnote}
        </figcaption>
      ) : null}
    </figure>
  )
}

export default InstrumentPanel01
