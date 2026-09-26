import { Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Section, SectionHeading, type HeadingLevel } from '@/components/ds/blocks/section'

export type Plan = {
  name: string
  price: string
  /** Rendered after the price, e.g. " / month". Omit for a one-off figure. */
  period?: string
  body?: string
  features: string[]
  cta: string
  /** Lifts the plan with a primary border and a filled button. */
  featured?: boolean
  /** Overrides the "Popular" badge on the featured plan. */
  badge?: string
}

export type Pricing01Props = {
  eyebrow?: string
  title?: string
  description?: string
  plans: Plan[]
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A three-up plan comparison.
 *
 * Every plan is a prop, including the price and the call to action. It previously
 * hardcoded "$0 / $24 / $68", "Talk to us", "MIT licence" and "Figma library",
 * and shipped a heading reading "Pricing" above a title already reading "Pick a
 * plan". A shared library has no plans to sell, so those strings described a
 * business that does not exist here, and every consumer who installed the block
 * inherited them.
 */
export function Pricing01({
  eyebrow,
  title,
  description,
  plans,
  headingLevel = 'h2',
}: Pricing01Props) {
  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.featured ? 'border-primary shadow-md' : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.featured ? <Badge>{plan.badge ?? 'Popular'}</Badge> : null}
              </div>
              {plan.body ? <CardDescription>{plan.body}</CardDescription> : null}
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {plan.price}
                {plan.period ? (
                  <span className="text-muted-foreground text-sm font-normal">
                    {plan.period}
                  </span>
                ) : null}
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {/*
                Keyed by position, not by the feature string. The string is display
                content rather than identity, and a plan is free to list the same
                line twice; keying on it logged React's duplicate-key error and let
                React drop and reorder rows. `key={index}` is correct here because
                this list is static: it is rendered once from props and never
                reordered, filtered or appended to, so there is no state to
                preserve across a reorder that a positional key could lose.
              */}
              {plan.features.map((feature, index) => (
                <p key={index} className="flex items-start gap-2 text-sm">
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  {feature}
                </p>
              ))}
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                variant={plan.featured ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default Pricing01
