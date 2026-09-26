import type { LucideIcon } from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Section, SectionHeading, type HeadingLevel } from '@/components/ds/blocks/section'

export type Feature = {
  icon: LucideIcon
  title: string
  body: string
}

export type FeatureGrid01Props = {
  eyebrow?: string
  title?: string
  description?: string
  features: Feature[]
  /** `icon` tiles read well at 2-up; `bare` leans on the type alone. */
  variant?: 'icon' | 'bare'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * A grid of short feature blurbs.
 *
 * The feature list is a prop. It previously hardcoded the catalog's own selling
 * points under the heading "Why this catalog", so an installed block argued for
 * the library inside the consumer's product.
 */
export function FeatureGrid01({
  eyebrow,
  title,
  description,
  features,
  variant = 'icon',
  headingLevel = 'h2',
}: FeatureGrid01Props) {
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

      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="gap-4 py-6">
            <CardHeader>
              {variant === 'icon' ? (
                <span className="bg-accent text-accent-foreground mb-2 flex size-10 items-center justify-center rounded-lg">
                  <feature.icon className="size-5" />
                </span>
              ) : null}
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default FeatureGrid01
