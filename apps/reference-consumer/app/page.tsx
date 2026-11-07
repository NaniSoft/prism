import { SiteChrome } from '@/components/site-chrome'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { DSImage } from '@nanisoft/prism-ui/components/ds-image'
import { DSIcon } from '@nanisoft/prism-ui/components/ds-icon'
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack'
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section'

/**
 * The landing: composition from catalogue Blocks and DS media, nothing else.
 */
export default function HomePage() {
  return (
    <SiteChrome currentPath="/">
      <HeroSection />
      <VariantsSection />
    </SiteChrome>
  )
}


function HeroSection() {
  return (
    <Hero01
      eyebrow="Reference consumer"
      title="One stylesheet. Approved media. Every pack."
      description="A consumer composes Blocks, Pages and DS components, chooses a pack and a mode, and writes no CSS."
      actions={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assets', href: '/assets' }]}
    />
  )
}

function VariantsSection() {
  return (
    <Section>
      <DSStack gap="md">
        <DSGrid columns={3} gap="md">
          <DSImage src="https://placehold.co/1200x675/EEE/333?text=hero" alt="Reference hero placeholder" variant="hero" />
          <DSImage src="https://placehold.co/800x600/EEE/333?text=card" alt="Reference card placeholder" variant="card" />
          <DSGrid columns={2} gap="sm">
            <DSIcon name="settings" size="lg" label="Settings" />
            <DSIcon name="search" size="md" label="Search" />
            <DSIcon name="menu" size="md" label="Menu" />
          </DSGrid>
        </DSGrid>
        <SectionHeading as="h2" title="Tokens, not values" description="Semantic names byte-identical to the shadcn contract. The sheet carries tokens, utilities, base and fonts." />
      </DSStack>
    </Section>
  )
}

