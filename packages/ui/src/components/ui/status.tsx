import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The five tones a Status's dot can take.
 *
 * A tone is a judgement the caller makes, and this Component has the same reason
 * `MeterTone` gives for holding the same judgement at arm's length: it can see
 * the state, and it cannot see whether the state is urgent. A Status is asked
 * for far more often than a Meter is, and for smaller things, which is exactly
 * the case where a Component that coloured itself would be making a claim about
 * the caller's product with the least evidence. A deploy is `info` on a status
 * page and `success` in a release note; a disk is `warning` at 80 percent and
 * `destructive` at 95, and the number does not know which of the two the
 * consumer is looking at.
 *
 * **The set is the semantic contract's, and the JSDoc has to say what that
 * costs.** The contract publishes three state roles, `success`, `warning` and
 * `destructive`, and it publishes no informational one, so `info` here borrows
 * `brand-ink`, which is the only cool role in the contract that means "not an
 * alarm". The cost is named rather than hidden: in a pack whose brand hue is also
 * its emphasis hue, an `info` dot and an emphasised mark are the same colour. The
 * alternative was a fourth state role in the token contract, which is a
 * decision about the tokens rather than about a Component, and a Component that
 * invented the role would have had a second source of truth for colour. The
 * other alternative, dropping `info` from the set, would have made the ordinary
 * states of a product, in progress, scheduled, degraded, unreachable, expressible
 * only as `neutral` and `warning`, which are both wrong.
 *
 * `neutral` is the tone for a state with nothing to alarm about, and it is drawn
 * in the muted foreground rather than the full ink. A dot in the foreground
 * colour reads as an emphasis mark rather than as a state, and a row of neutral
 * states is a row of things the reader should look at.
 */
export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive'

/** The dot each tone is drawn in, from the semantic roles and no other. */
const TONE_DOT: Record<StatusTone, string> = {
  neutral: 'bg-muted-foreground',
  info: 'bg-brand-ink',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

/** The dot's diameter, per size, as an authored `size-*` step. */
const SIZE_DOT: Record<'sm' | 'md', string> = {
  sm: 'size-1.5',
  md: 'size-2',
}

/** The label's type-scale step, per size, because the pair is sized together. */
const SIZE_LABEL: Record<'sm' | 'md', string> = {
  sm: 'text-xs',
  md: 'text-sm',
}

/**
 * A dot in one of five tones, and the caller's words beside it.
 *
 * **The dot is the tone and the label is the caller's.** The split is the whole
 * design. A Component that knew what the words were would be a Component making
 * a claim about a product it knows nothing about, so it takes the tone and the
 * caller takes the sentence, and neither one can be derived from the other
 * without a lie.
 *
 * **The label is required, and the reason is the colour.** A status with no words
 * is a coloured dot, and a coloured dot is invisible to a reader who cannot
 * separate the tones and unreadable to a screen reader whatever the tones are.
 * There is a Component for the other half of that idea, an indicator that is
 * decorative beside a state the surrounding sentence already names, and it is a
 * different Item because a name it did not receive is a name the consumer has to
 * supply. This one refuses to render unlabelled rather than rendering something
 * every consumer inherits.
 *
 * **The tone is required rather than defaulted.** There is no `neutral` default
 * for the same reason `MeterTone` states, and this Component inherits that
 * argument in full: a tone is a judgement about urgency that only the caller can
 * make, and a Component that picked one would be picking it for four products at
 * once. A default here is the quietest way to ship a claim, because it looks
 * like a convenience and behaves like an opinion.
 *
 * **The tone is never the only signal.** Every dot here is `aria-hidden` and the
 * label carries the meaning, so a reader who cannot separate `warning` from
 * `destructive` still reads which is which. That is also why the tone list can
 * stay as small as it is: a wider list would be a wider set of colours a reader
 * has to learn and a maintainer has to keep true, and the words are what make
 * each one legible. The cost is stated rather than hidden: `warning` is amber and
 * measures about 2.1:1 against the default pack's light background, so on a light
 * surface that one dot is a tint rather than a mark. The label beside it is what
 * carries the state, which is the trade this design makes everywhere.
 *
 * It is a server Component: no hook, no state, and a status that changes is
 * something the surrounding surface re-renders, not something this Component
 * animates.
 */
function Status({
  className,
  tone,
  label,
  size = 'md',
  ...props
}: {
  /**
   * Which of the five tones the dot takes. Required rather than defaulted, for
   * the reason `StatusTone` states in full.
   */
  tone: StatusTone
  /**
   * The words naming the state, in the product's own vocabulary.
   *
   * Required, and deliberately not derived from `tone`: a product that says
   * "Degraded" and a product that says "Partially unavailable" are both
   * describing the same tone, and neither word is Prism's to choose.
   */
  label: ReactNode
  /**
   * The size of the dot and of the label together. @defaultValue 'md'
   *
   * Two steps and not one, because a status appears at two scales in practice: in
   * a dense table row, where a `md` dot competes with the numbers beside it, and
   * beside a heading, where `sm` is hard to find. Sizing the pair together is
   * deliberate, because a small dot beside a large label is a status the reader
   * is meant to read rather than one they are meant to spot.
   */
  size?: 'sm' | 'md'
} & Omit<ComponentProps<'span'>, 'children'>) {
  return (
    <span
      data-slot="status"
      className={cn('inline-flex max-w-full items-center gap-1.5', className)}
      {...props}
    >
      <span
        data-slot="status-dot"
        aria-hidden="true"
        className={cn('shrink-0 rounded-full', SIZE_DOT[size], TONE_DOT[tone])}
      />
      <span data-slot="status-label" className={SIZE_LABEL[size]}>
        {label}
      </span>
    </span>
  )
}

export { Status }
