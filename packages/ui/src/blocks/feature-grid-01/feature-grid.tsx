import type { LucideIcon } from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'

/**
 * One feature in an icon-bearing grid.
 *
 * The icon is required, not optional, because this tile is always rendered: an
 * optional icon here would compile and then paint an empty accent tile, which is
 * the safe-at-render condition an optional prop turns unsafe.
 */
export type IconFeature = {
  icon: LucideIcon
  title: string
  body: string
}

/** One feature in a bare grid, which renders no tile and so asks for no icon. */
export type BareFeature = {
  title: string
  body: string
}

/**
 * A feature, in whichever of the two shapes the grid's `variant` admits.
 *
 * The requirement is expressed as a union discriminated on `variant` rather than
 * as `icon?: LucideIcon` on one type, because only a union lets the type system
 * see the exception. A single type cannot require an icon in one variant and not
 * in the other: it can only be required in both, which makes the bare variant
 * impossible, or optional in both, which makes the icon variant's empty tile
 * possible. The discriminator is the same `variant` value the Block branches on
 * at render, so the two cannot disagree.
 */
export type Feature = IconFeature | BareFeature

type FeatureGrid01CommonProps = {
  eyebrow?: string
  title?: string
  description?: string
  /**
   * Puts the feature's position in the grid on the card, zero-padded to two
   * digits, above the title.
   *
   * The ordinal is rendered from the card's position rather than taken from the
   * feature, because a list that carries its own numbers is a list whose numbers
   * can disagree with its order after a sort, a filter or an insertion. All four
   * NaniSoft sites render one: three of them as `01` in the mono face on every
   * card, and the fourth on a set of pillars as well as on the grid.
   *
   * It is off by default. A number on a card is a claim that the set is a
   * sequence, and a grid of features is usually a set.
   */
  numbered?: boolean
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
}

/**
 * The `icon` arm is the one an omitted `variant` selects, so the default and
 * the required icon live on the same arm: a consumer who writes nothing about
 * the variant gets the tiles and the icons they imply.
 */
export type FeatureGrid01Props = FeatureGrid01CommonProps &
  (
    | { variant?: 'icon'; features: IconFeature[] }
    | { variant: 'bare'; features: BareFeature[] }
  )

/**
 * A grid of short feature blurbs.
 *
 * The feature list is a prop. It previously hardcoded the catalog's own selling
 * points under the heading "Why this catalog", so an installed block argued for
 * the library inside the consumer's product.
 *
 * The `icon` variant renders a tile per feature and requires an icon per feature.
 * The `bare` variant renders no tile and requires no icon, and the type says so
 * rather than the renderer finding out.
 */
export function FeatureGrid01(props: FeatureGrid01Props) {
  const { eyebrow, title, description, numbered = false, headingLevel = 'h2' } = props
  // A card title is a heading one step below the section that introduces the set,
  // derived rather than written, so a Block embedded one level deeper carries its
  // five headings with it instead of announcing five siblings of the section.
  const Title = childLevel(headingLevel)
  // Read off `props` rather than destructured, so the two stay one value: taking
  // `variant` and `features` apart is what would let the arm the type checked
  // and the arm the renderer followed come to be two different ones.
  const variant = props.variant ?? 'icon'
  const { features } = props

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
        {features.map((feature, index) => (
          <Card key={feature.title} className="gap-4 py-6">
            <CardHeader>
              {numbered ? (
                <span className="text-muted-foreground font-mono text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
              ) : null}
              {variant === 'icon' && 'icon' in feature ? (
                <span className="bg-accent text-accent-foreground mb-2 flex size-10 items-center justify-center rounded-lg">
                  <feature.icon className="size-5" />
                </span>
              ) : null}
              <CardTitle>
                <Title>{feature.title}</Title>
              </CardTitle>
              <CardDescription>{feature.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default FeatureGrid01
