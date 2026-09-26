/**
 * The curated Prism barrel.
 *
 * The most-used components, blocks and theming vocabulary in one import. It
 * carries no styles and no runtime side effects: importing this entry must not
 * pull the provider, the catalogue or a stylesheet. Consumers that want one
 * item import its own subpath instead.
 */
export { Button } from './components/ui/button'
export { Badge } from './components/ui/badge'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/ui/card'
export { Section, SectionHeading } from './components/ui/section'
export type { HeadingLevel } from './components/ui/section'

export { Hero01 } from './blocks/hero-01'
export { FeatureGrid01 } from './blocks/feature-grid-01'
export { Stats01 } from './blocks/stats-01'
export { Pricing01 } from './blocks/pricing-01'
export { Cta01 } from './blocks/cta-01'

export { PACKS, MODES, parseStoredTheme, themeAttributes } from './theming'
export type { PackId, Mode } from './theming'
