import { ArrowRight } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'

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
   * Heading level for the title. Defaults to `h2` because a block is composed,
   * not a page: it installs into a consumer's layout via `shadcn add` and renders
   * inside catalog previews, so the surrounding document already owns the `h1`.
   * A page that uses this block as its top-level heading opts in with
   * `headingLevel="h1"`; a document that already names this section in its own
   * heading passes one level deeper. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
}

export function Hero01({
  eyebrow,
  title,
  description,
  actions = [],
  headingLevel = 'h2',
}: Hero01Props) {
  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-primary/5 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b to-transparent"
      />
      <div className="flex flex-col items-center gap-10 text-center">
        {eyebrow ? (
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
            {eyebrow}
          </span>
        ) : null}

        <SectionHeading
          as={headingLevel}
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
