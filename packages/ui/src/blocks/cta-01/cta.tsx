import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Section, type HeadingLevel } from '../../components/ui/section'

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
  /** Heading level for the headline. See `HeadingLevel`. */
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
  headingLevel = 'h2',
}: Cta01Props) {
  /*
   * The same mechanism `SectionHeading` uses for its own `as` prop, which this
   * block cannot borrow: its copy sits on a filled `bg-primary` surface, where
   * `SectionHeading`'s muted-surface description colour and `gap-4` would be
   * wrong. So the tag is resolved here and the classes stay surface-specific
   * rather than the heading level being the reason the markup stays hardcoded.
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
          <Heading className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </Heading>
          {description ? (
            <p className="max-w-xl text-lg text-pretty opacity-90">{description}</p>
          ) : null}
          {action ? (
            <CtaLink
              size="lg"
              variant={action.variant ?? 'secondary'}
              href={action.href}
              newTab={action.newTab}
              className="group"
            >
              {action.label}
              <ArrowRight className="motion-safe:transition-transform size-4 group-hover:translate-x-0.5" />
            </CtaLink>
          ) : actionSlot ? (
            actionSlot
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default Cta01
