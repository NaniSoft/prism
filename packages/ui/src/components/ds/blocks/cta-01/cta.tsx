import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Section, type HeadingLevel } from '@/components/ds/blocks/section'

export type Cta01Props = {
  title: string
  description?: string
  action?: { label: string; href?: string; variant?: 'default' | 'secondary' | 'outline' }
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
 */
export function Cta01({ title, description, action, headingLevel = 'h2' }: Cta01Props) {
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
            <Button
              size="lg"
              variant={action.variant ?? 'secondary'}
              className="group"
            >
              {action.label}
              <ArrowRight className="motion-safe:transition-transform size-4 group-hover:translate-x-0.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default Cta01
