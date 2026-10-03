import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One closing action.
 *
 * The destination is required rather than optional, and that is the whole point
 * of the type: `href` was already declared and never rendered, so the type said
 * the control could navigate while the markup produced a `<button>` with no
 * handler. An action with no handler navigates nothing, so there is no arm of
 * this union that omits the destination and no optional one either. A caller
 * whose control is not a link at all uses `Cta01`'s `actionSlot`.
 */
export type Cta01Action = {
  label: string
  /** Where the action goes. Rendered as a native anchor's `href`. */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Declared rather than inferred: Prism
   * does not parse the destination, and a cross-origin URL is not by itself a
   * reason to open a tab.
   */
  newTab?: boolean
  /**
   * Which weight this action draws at, when the caller does not say.
   *
   * **A filled panel wants `secondary` or `outline`, and never `default`.** The
   * property that decides it is not the ink but the fill: this Block draws its
   * band as a filled `bg-primary` surface, and `default` fills with `--primary`,
   * so a `default` action on this band is the band's own colour against the
   * band's own colour. Its label is legible, because `primary-foreground` on
   * `primary` is a gated pair, and the control has no edge, which is a different
   * defect and the reason this sentence is about the fill rather than the text.
   *
   * `secondary` and `outline` are the two that answer, and what makes them
   * answer is that each states its own ink rather than inheriting one. That is
   * the part that was broken and is now settled: `outline` carried `bg-background`
   * with no `text-` of its own, so inside this band it was `--background` behind
   * the inherited `--primary-foreground`, which in lavender's dark mode measured
   * 1.01:1 and in the base pack's light mode 1.00:1, a focusable, announced,
   * unreadable button. The variant is fixed in `cta-link.tsx`, where a variant
   * that sets a fill now states the matching ink, and
   * `packages/ui/scripts/check-variant-ink.mjs` is the gate that holds it there.
   *
   * So a panel may take all three, and the settled defaults are the two that
   * carry a fill distinct from the band. Which of the two a given action wants is
   * the caller's: `secondary` for the one ask, `outline` for the alternative
   * beside it.
   */
  variant?: 'default' | 'secondary' | 'outline'
}

export type Cta01Props = {
  title: string
  description?: string
  /**
   * The one action this band carries. Omit it for a closing statement that asks
   * for nothing, and use `actionSlot` for a control that is not a call to
   * action.
   */
  action?: Cta01Action
  /**
   * A slot for a control the block does not own, such as a client router's link
   * or a menu. This is what a call to action with no destination becomes: a slot
   * the consumer fills, rather than a control the block renders and cannot make
   * work.
   */
  actionSlot?: ReactNode
  /**
   * The second action, rendered beside the first at outline weight. It is a prop
   * rather than a second `action` array because `action` is the one this Block
   * styles as the closing ask and a second action in the same weight is two
   * closing asks; a reader who has to choose between two equally-weighted
   * buttons has been given a menu where a page wanted a decision.
   *
   * Three of the four NaniSoft sites render two actions in their closing band
   * and all four do, and all four wrote the pair by hand, so each one re-decided
   * the gap, the order and the weight between them.
   *
   * Its default weight is `outline`, which is the settled answer for the pair:
   * the primary action is filled and this one is not, so the two read as one
   * decision and one alternative rather than as two competing asks. It is safe on
   * the filled band because the variant carries its own ink rather than
   * inheriting the band's, which is a property of the variant and no longer of
   * where a caller puts it. See `Cta01Action`'s `variant` for the measurement.
   */
  secondaryAction?: Cta01Action
  /**
   * The line under the actions: the footnote, the caveat, the sentence that
   * qualifies the ask. Three of the four sites render one, and each wrote it by
   * hand.
   *
   * A `ReactNode` rather than a string because the honest line is sometimes not
   * one sentence: three of the four carry a link inside it, and a string prop
   * would force a caller to compose a paragraph to say "this is in development,
   * here is where to watch it".
   */
  note?: ReactNode
  /**
   * Heading level for the headline. See `HeadingLevel`.
   *
   * It picks the headline's size as well as its tag, from the table in
   * `headingSizeClass`, so a banner composed at the default `h2` reads as the
   * section it is rather than as a second page heading.
   */
  headingLevel?: HeadingLevel
}

/**
 * A closing call to action on a filled primary surface.
 *
 * The copy and the action are props. It previously shipped the catalog's own
 * pitch ("Start with one block, keep the tokens") and a hardcoded "Browse the
 * catalog" button, both of which described the library rather than whatever
 * product installed the block.
 *
 * The action renders a `CtaLink`, so it is a native anchor announced as a link
 * rather than a button announced as a command, and its destination is a required
 * prop. The only rendered change from the button this replaces is the element and
 * the `href` it now carries.
 */
export function Cta01({
  title,
  description,
  action,
  actionSlot,
  secondaryAction,
  note,
  headingLevel = 'h2',
}: Cta01Props) {
  /*
   * The same mechanism `SectionHeading` uses for its own `as` prop, which this
   * block cannot borrow: its copy sits on a filled `bg-primary` surface, where
   * `SectionHeading`'s muted-surface description colour and `gap-4` would be
   * wrong. So the tag is resolved here and the classes stay surface-specific
   * rather than the heading level being the reason the markup stays hardcoded.
   *
   * The size is asked of `headingSizeClass` rather than written here, and that
   * line is the reason it is not written here. This block drew its heading at one
   * size for every level, which is the defect `SectionHeading` had too, so a page
   * whose closing banner sat at the default `h2` would have shown that banner a
   * step above every other section title on the page and the same size as the
   * page's own `h1`. Two surfaces answering one question separately is how it
   * reached two surfaces.
   */
  const Heading = headingLevel

  return (
    <Section className="py-20">
      <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-8 py-16 text-center">
        <div
          aria-hidden
          className="from-primary-foreground/15 pointer-events-none absolute inset-0 bg-gradient-to-tr to-transparent"
        />
        <div className="relative flex flex-col items-center gap-6">
          <Heading
            className={cn('max-w-measure font-semibold tracking-tight text-balance', headingSizeClass(headingLevel))}
          >
            {title}
          </Heading>
          {description ? (
            <p className="max-w-measure-narrow text-lg text-pretty opacity-90">{description}</p>
          ) : null}
          {action ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <CtaLink
                size="lg"
                variant={action.variant ?? 'secondary'}
                href={action.href}
                newTab={action.newTab}
                className="group"
              >
                {action.label}
                <ArrowRight className="transition-transform size-4 group-hover:translate-x-0.5" />
              </CtaLink>
              {secondaryAction ? (
                <CtaLink
                  size="lg"
                  variant={secondaryAction.variant ?? 'outline'}
                  href={secondaryAction.href}
                  newTab={secondaryAction.newTab}
                >
                  {secondaryAction.label}
                </CtaLink>
              ) : null}
            </div>
          ) : actionSlot ? (
            actionSlot
          ) : null}
          {note ? (
            <p className="max-w-measure text-pretty text-sm opacity-80">{note}</p>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default Cta01
