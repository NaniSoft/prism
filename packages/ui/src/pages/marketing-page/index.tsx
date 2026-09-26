import type { ComponentProps } from 'react'

import { Cta01 } from '../../blocks/cta-01'
import { FeatureGrid01 } from '../../blocks/feature-grid-01'
import { Hero01 } from '../../blocks/hero-01'
import { Pricing01 } from '../../blocks/pricing-01'
import { Stats01 } from '../../blocks/stats-01'
import type { HeadingLevel } from '../../components/ui/section'

export type MarketingPageProps = {
  /** The opening band: an optional eyebrow, the headline and one or two actions. */
  hero: ComponentProps<typeof Hero01>
  /** The capability grid below the hero. */
  features: ComponentProps<typeof FeatureGrid01>
  /** The key-figure row. */
  stats: ComponentProps<typeof Stats01>
  /** The plan comparison. */
  pricing: ComponentProps<typeof Pricing01>
  /** The closing call to action. */
  cta: ComponentProps<typeof Cta01>
  /**
   * The heading level for the hero. Defaults to `h1`, because a page owns the
   * top of the document outline. A consumer that embeds the page under a
   * heading it already owns passes one level deeper.
   */
  headingLevel?: HeadingLevel
}

/**
 * A complete marketing page.
 *
 * It composes `Hero01`, `FeatureGrid01`, `Stats01`, `Pricing01` and `Cta01` in
 * reading order and passes each block its own props unchanged, so the page adds
 * the sequence and nothing else. Every string, number and action is a prop, and
 * the page ships no sample copy and fetches nothing. It is a product-agnostic
 * screen model, not this site's own landing route: a consumer installs it,
 * passes their own content and owns the links.
 *
 * The hero is the page's primary heading, so it defaults to `h1`; set
 * `headingLevel` when the page is embedded rather than rendered as a screen.
 * The composed blocks keep their own `h2` defaults, so the outline stays one
 * heading per section below the hero.
 */
export function MarketingPage({
  hero,
  features,
  stats,
  pricing,
  cta,
  headingLevel = 'h1',
}: MarketingPageProps) {
  return (
    <div className="bg-background text-foreground">
      <Hero01 {...hero} headingLevel={headingLevel} />
      <FeatureGrid01 {...features} />
      <Stats01 {...stats} />
      <Pricing01 {...pricing} />
      <Cta01 {...cta} />
    </div>
  )
}

export default MarketingPage
