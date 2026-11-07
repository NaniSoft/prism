import { SiteChrome } from '@/components/site-chrome'
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'
import { DSIcon } from '@nanisoft/prism-ui/components/ds-icon'
import { DSImage } from '@nanisoft/prism-ui/components/ds-image'
import { DSLogo } from '@nanisoft/prism-ui/components/ds-logo'
import { DSAvatar } from '@nanisoft/prism-ui/components/ds-avatar'
import { DSIllustration } from '@nanisoft/prism-ui/components/ds-illustration'
import { DSMediaCard } from '@nanisoft/prism-ui/components/ds-media-card'
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack'
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section'
import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'
import type { PackId } from '@nanisoft/prism-ui/theming'

const VARIANTS = ['hero', 'wide-hero', 'banner', 'card', 'landscape-thumb', 'square-thumb', 'avatar', 'product', 'icon'] as const
const PASTELS = ['blush', 'mint', 'lavender', 'sky', 'peach', 'cyan', 'gold'] as const

/**
 * Every presentation once, then every pack as a boundary on a mark.
 *
 * A boundary lands only on a mark: a section that carries a second pack would
 * move its index into its corner radius, so each pack is shown as a product
 * mark and the mediums are shown at the page ground.
 */
export default function AssetsPage() {
  return (
    <SiteChrome currentPath="/assets">
      <DSStack>
        <Section>
          <SectionHeading as="h1" title="Assets" description="Every governed presentation, drawn once. Below it, every pastel pack as a mark boundary." />
          <DSGrid columns={3} gap="md">
            {VARIANTS.map((variant) => (
              <DSImage key={variant} src={`https://placehold.co/800x450/EEE/333?text=${variant}`} alt={`${variant}`} variant={variant} />
            ))}
          </DSGrid>
          <DSStack gap="md">
            <DSLogo src="https://placehold.co/320x128/EEE/333?text=logo" alt="NaniSoft logo" size="lg" />
            <DSAvatar name="Ada Lovelace" src="https://placehold.co/256x256/EEE/333?text=A" size="lg" />
            <DSIllustration src="https://placehold.co/800x450/EEE/333?text=diagram" alt="Diagram illustration" />
            <DSIcon name="settings" size="lg" label="Settings" />
            <DSMediaCard image={{ src: 'https://placehold.co/800x600/EEE/333?text=card', alt: 'Release capsule in light' }} title="Release capsule" description="The card's medium is governed too." />
          </DSStack>
        </Section>
        <Section>
          <SectionHeading as="h2" title="Packs" description="Each mark carries its own data-pack boundary." />
          <DSGrid columns={4} gap="sm">
            {PASTELS.map((pack) => (
              <ProductMark key={pack} id={pack} name={pack} pack={pack as PackId} />
            ))}
          </DSGrid>
        </Section>
      </DSStack>
    </SiteChrome>
  )
}
