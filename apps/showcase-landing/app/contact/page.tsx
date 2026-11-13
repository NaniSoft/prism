import { SiteChrome } from '@/components/site-chrome'
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { FactList } from '@nanisoft/prism-ui/components/fact-list'
import { Section } from '@nanisoft/prism-ui/components/section'

import { publicPath } from '@/lib/site'

/**
 * The contact route. There is no form here, and that is deliberate: a form that
 * submits is a behaviour, and a Block that cannot be given one honestly is not
 * given one at all. The page is the ways in, as facts and as actions.
 */
export default function ContactRoute() {
  return (
    <SiteChrome currentPath="/contact">
      <Section>
        <PageHeader01
          headingLevel="h1"
          breadcrumbs={[{ label: 'Home', href: publicPath('/') }]}
          title="Contact"
          description="The ways in, for a shop, a courier or an engineer who wants to look under a figure."
        />
        <FactList
          facts={[
            { label: 'Shops and plans', value: 'hello@meridian.example', href: 'mailto:hello@meridian.example' },
            { label: 'Support, Fleet plan', value: 'four hours, every day' },
            { label: 'Couriers', value: 'couriers@meridian.example', href: 'mailto:couriers@meridian.example' },
            { label: 'Post', value: 'Meridian, 14 Guildhall Lane, Leicester LE1 5FJ' },
          ]}
        />
        <Cta01
          title="Write to us, or read the system that wrote this page."
          description="Every surface of Meridian is composed from Prism, the NaniSoft design system, and the showcase exists to be read as much as used."
          action={{ label: 'Email the team', href: 'mailto:hello@meridian.example' }}
          secondaryAction={{
            label: 'Visit Prism',
            href: 'https://prism.nanisoft.com',
          }}
          note="Meridian is fictional. The address is too, and the mail reaches nobody."
        />
      </Section>
    </SiteChrome>
  )
}
