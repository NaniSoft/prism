import type { ReactNode } from 'react'

import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The two surfaces a promotion band can be drawn on, and each one states its own
 * fill and its own ink.
 *
 * This is the `check-variant-ink` rule and not a style preference, and the gate
 * that holds it reads the Component layer only, so a Block stating the rule in its
 * own map is the Block doing the work the gate cannot. The measurement is in
 * `Cta01Action.variant` and in `toast.tsx`: `Cta01` drew a filled `bg-primary`
 * panel, defaulted its second action to `outline`, and shipped a control that was
 * `--background` behind `--primary-foreground`, which measured 1.01:1 in the
 * lavender pack's dark mode. It was in the document, focusable, announced, and
 * unreadable.
 *
 * So a `primary` band is `bg-primary text-primary-foreground` and a `default` band
 * is `bg-card text-card-foreground`, and neither inherits its ink. The cost is
 * that this Block cannot be recoloured by a caller, which is the no-override-path
 * rule arriving at a colour and not at a wrapper: a promotion band that a consumer
 * painted in their own brand hue is a band nobody in this repository can measure.
 */
const OFFER_TONE: Record<Offer01Tone, string> = {
  default: 'border-border bg-card text-card-foreground border',
  primary: 'border-transparent bg-primary text-primary-foreground border',
}

/** The two surfaces a promotion band can be drawn on. See `OFFER_TONE`. */
export type Offer01Tone = 'default' | 'primary'

/**
 * The props an Offer01 takes.
 *
 * Every string is a prop and the Block ships none: no eyebrow, no headline, no
 * supporting line, no code, no control and no terms. The last of those is the
 * point, and it is required.
 */
export type Offer01Props = {
  /** Optional label above the headline. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The headline: what the promotion is.
   *
   * Required, and it is the section's own heading rather than a line inside the
   * band, which is a composition decision the JSDoc below explains. A promotion
   * with no headline is a discount with nothing claiming it, and the two hardest
   * sentences to write are the one that says what the offer is and the one that
   * says what it excludes.
   */
  title: ReactNode
  /** One or two sentences under the headline: the size of the discount, the shape. */
  description?: ReactNode
  /**
   * The slot for the promotion's control, which is usually one call to action.
   *
   * A node rather than a label and a destination, for the reason `Cta01` gives:
   * the control is a link, a router link, a form or a menu, and a Block that
   * declared its label and its `href` would be unable to render three of those
   * four. The cost is that this Block cannot check that the control goes
   * anywhere, and the reason is that a control with no destination is a
   * consumer's bug rather than a Block's to catch.
   */
  actions?: ReactNode
  /**
   * The closing note: the expiry, the scope, the exclusions, in the caller's own
   * words.
   *
   * Required, and the argument is the whole JSDoc below. A discount with no
   * expiry, no scope and no exclusions is legally and ethically a different offer
   * from one with them, and a design system that lets this prop be optional is a
   * design system that has made that call for every consumer that installs it.
   */
  terms: ReactNode
  /**
   * Which surface the band is drawn on.
   *
   * @defaultValue 'default'
   */
  tone?: Offer01Tone
  /** Heading level for the headline. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout classes for the band. Layout only; every visual property is Prism's. */
  className?: string
} & (
  | {
      /**
       * The code the reader redeems, as the caller writes it.
       *
       * A `string` and not a node, because a code is a machine value: it is
       * copied, compared and typed, and a caller that composes one out of
       * fragments will be one release away from shipping a code with a space in
       * it.
       */
      code: string
      /**
       * The words that name the code, for its accessible name.
       *
       * Required whenever `code` is, and declared `never` when it is not, so the
       * two cannot drift apart. A chip holding `PRISM20` announces as the six
       * characters and nothing else, and a reader who has just been told to enter
       * a code has to be told which of the four things on this band is the code.
       * The cost is a prop a consumer has to remember, and the reason is the same
       * one `Toast.closeLabel` is required for: four products in two languages
       * cannot all be told this control says "Code".
       */
      codeLabel: string
    }
  | {
      /** No code on this band. */
      code?: never
      /** No accessible name needed, because there is no chip to name. */
      codeLabel?: never
    }
)

/**
 * A promotion band: an eyebrow, a headline, a supporting line, a code, one action
 * and the terms that say what the offer excludes.
 *
 * **The terms are required, and a design system that let them be optional would
 * have made the call for its consumers.** A discount with no expiry, no scope and
 * no exclusions is not a shorter version of the same offer, it is a different
 * offer: the one with terms is an offer a reader can accept, and the one without is
 * a claim the consumer cannot safely ship, because in most markets the terms of a
 * promotion are the part that is binding and the headline is the part that is not.
 * Making `terms` optional would have been the quietest possible way for this
 * repository to decide that for four products, and it would have looked like a
 * convenience while behaving like an opinion. So the prop is required, `terms` is
 * what fills it, and the only way to render this Block without saying what an
 * offer excludes is not to render it.
 *
 * **The headline is above the band rather than inside it, and that is a colour
 * decision rather than a layout one.** `SectionHeading` states its own muted ink
 * for the eyebrow and the description, which is correct on the page ground and
 * wrong on a filled `bg-primary` surface, because muted on primary is the
 * inheritance `check-variant-ink` exists to refuse and the measurement in
 * `Cta01Action.variant` is what it refused. So the heading sits on the ground where
 * its own ink is measured, and the band below it carries the code, the control and
 * the terms. The cost is that the promotion is split across two surfaces rather
 * than being one filled panel, and the answer is that a filled panel would have had
 * to re-declare `SectionHeading`'s type for one Block, which is how a design system
 * grows a second heading.
 *
 * **The code is a chip in the mono face, and the mono face is the reason.** The
 * mono stack in this system annotates machine-readable values, and a redemption
 * code is the most machine-readable value a marketing page carries: it is copied,
 * compared, typed and diffed. It is a `kbd`-shaped chip rather than a `Kbd`,
 * because a `Kbd` is a key on a keyboard and is set in the interface face on
 * purpose, and a discount code is not a key. The chip carries the caller's
 * `codeLabel` in a visually hidden span beside the code, which is the same pattern
 * every icon-only region in this package uses: the shape is decoration, the words
 * are the answer. The chip states its own ink beside its own fill for the same
 * reason the band does, and `muted-foreground` on `muted` is a gated pair
 * precisely because the pill, the avatar fallback and the key pattern all sit on
 * the tinted surface rather than on the page ground, so the chip is legible on a
 * `default` band and on a `primary` one.
 *
 * **A `tone` of `primary` states its own fill and its own ink.** See
 * `OFFER_TONE`, which carries the measurement. Both tones draw a fill, and a fill
 * without an ink is a control that is legible on the page ground and invisible on
 * the band, which is the defect `Cta01` shipped at 1.01:1 in lavender dark.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * one control is the consumer's node, so a consumer who passes a client component
 * pays for the control and not for the band.
 */
export function Offer01({
  eyebrow,
  title,
  description,
  actions,
  terms,
  tone = 'default',
  headingLevel = 'h2',
  className,
  code,
  codeLabel,
}: Offer01Props) {
  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-8"
      />

      <div
        data-slot="offer"
        data-tone={tone}
        className={cn(
          'flex flex-col items-start gap-4 rounded-2xl p-6 shadow-sm sm:p-8',
          OFFER_TONE[tone],
          className,
        )}
      >
        {code ? (
          <code
            data-slot="offer-code"
            className="bg-muted text-muted-foreground inline-flex h-7 items-center gap-2 rounded-sm px-2 font-mono text-sm font-medium select-none"
          >
            <span className="sr-only">{codeLabel}</span>
            {code}
          </code>
        ) : null}

        {actions ? (
          <div data-slot="offer-actions" className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        ) : null}

        <div
          data-slot="offer-terms"
          className="text-muted-foreground max-w-measure text-pretty text-sm"
        >
          {terms}
        </div>
      </div>
    </Section>
  )
}

export default Offer01
