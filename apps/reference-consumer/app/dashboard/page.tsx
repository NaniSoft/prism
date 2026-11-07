import { SiteChrome } from '@/components/site-chrome'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section'
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid'
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack'

/**
 * An enterprise dashboard composed of Blocks inside the site rail.
 */
export default function DashboardRoute() {
  return (
    <SiteChrome currentPath="/dashboard">
      <DSStack>
        <Section>
          <PageHeader01
            title="Runs"
            description="The working set a reader acts on."
            headingLevel="h1"
            breadcrumbs={[{ label: 'Home', href: '/' }]}
          />
          <Stats01
            headingLevel="h2"
            stats={[
              { key: 'open', label: 'Open runs', value: '12' },
              { key: 'artifacts', label: 'Artifacts', value: '204' },
              { key: 'health', label: 'Fleet health', value: '98%', delta: 2, deltaFormat: '2 points' },
            ]}
          />
        </Section>
        <Section>
          <DSGrid columns={2} gap="md">
            <SectionHeading as="h2" title="Runs" description="Run, owner, state." />
          </DSGrid>
        </Section>
      </DSStack>
    </SiteChrome>
  )
}
