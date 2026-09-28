import { ArrowRight } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

export type HeroAction = {
  label: string
  href?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

export type Hero01Props = {
  /**
   * Optional label above the headline. Intentionally has no default: an earlier
   * version shipped a hardcoded "Now in open beta" pill, which meant every
   * consumer who installed this block inherited a status badge making a claim
   * about their product. Pass one if you mean it.
   */
  eyebrow?: string
  title: string
  description?: string
  actions?: HeroAction[]
  /**
   * Whether the copy is centered in the band or set flush to the left edge of
   * the container.
   *
   * This is the hero's own alignment and not `SectionHeading`'s, because the two
   * are not the same decision: a left-aligned hero is nearly always the left half
   * of a two-column band with a panel or an instrument beside it, and that column
   * is narrower than the container, so the alignment has to be the hero's before
   * the container can be anything. Three of the four NaniSoft sites compose a
   * left-aligned hero, each beside a panel, and each wrote the alignment by hand
   * because this Block was the centered form only.
   *
   * It has no visual effect on its own, which is the point: it aligns the copy
   * inside whatever width it is given.
   *
   * @defaultValue 'center'
   */
  align?: 'center' | 'left'
  /**
   * Heading level for the title. Defaults to `h2` because a block is composed,
   * not a page: it installs into a consumer's layout and renders
   * inside catalog previews, so the surrounding document already owns the `h1`.
   * A page that uses this block as its top-level heading opts in with
   * `headingLevel="h1"`; a document that already names this section in its own
   * heading passes one level deeper. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
}

/**
 * A centered marketing hero with an optional eyebrow, a headline, a supporting
 * line and up to two actions.
 *
 * The copy and the actions are props, and the Block ships none of either. It
 * previously shipped nothing of its own here and the remaining thing worth saying
 * is the alignment: `align` is this Block's own prop rather than a pass-through of
 * `SectionHeading`'s, because a left-aligned hero is nearly always one column of a
 * two-column band and that column is narrower than the container, so the alignment
 * has to be decided before the container is anything.
 */
export function Hero01({
  eyebrow,
  title,
  description,
  actions = [],
  align = 'center',
  headingLevel = 'h2',
}: Hero01Props) {
  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-primary/5 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b to-transparent"
      />
      <div
        data-slot="hero-01-copy"
        className={cn(
          'flex flex-col gap-10',
          align === 'center' ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        {eyebrow ? (
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
            {eyebrow}
          </span>
        ) : null}

        <SectionHeading
          as={headingLevel}
          align={align}
          title={title}
          description={description}
        />

        {actions.length ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {actions.map((action, index) => (
              // Positional, for the same reason as `pricing-01`'s feature list:
              // the label is display content, and two actions may share one.
              // Safe here because the list is static and never reordered.
              <Button
                key={index}
                size="lg"
                variant={action.variant ?? (index === 0 ? 'default' : 'outline')}
                className="group"
              >
                {action.label}
                {index === 0 ? (
                  <ArrowRight className="motion-safe:transition-transform size-4 group-hover:translate-x-0.5" />
                ) : null}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export default Hero01
