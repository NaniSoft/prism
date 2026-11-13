import { SiteChrome } from '@/components/site-chrome'
import { About01 } from '@nanisoft/prism-ui/blocks/about-01'
import { Team01 } from '@nanisoft/prism-ui/blocks/team-01'
import { Section } from '@nanisoft/prism-ui/components/section'

import { PEOPLE } from '@/lib/people'
import { publicPath } from '@/lib/site'

/**
 * The about route: a statement band and a team band, both from the catalogue,
 * both fed entirely from the data module beside this page.
 */
export default function AboutRoute() {
  return (
    <SiteChrome currentPath="/about">
      <About01
        headingLevel="h1"
        eyebrow="About"
        title="What Meridian is"
        statement="A small company that believes the person who runs a shop should not need a spreadsheet, a courier portal and a prayer to know what happened yesterday."
        body="Meridian was started by two shopkeepers and an engineer who kept meeting the same morning: three systems, three numbers, and no way to ask why they disagreed. The console is the answer they wanted, and this page is what it says about itself."
        figures={[
          { label: 'Shops on Meridian', value: '1,900' },
          {
            label: 'People supporting them',
            value: '34',
            delta: 9,
            hint: 'Against the same month last year',
          },
        ]}
        principles={[
          {
            id: 'one-morning',
            title: 'One morning',
            body: 'Every number the shop needs to act on is on one page, and everything else is a detail you chose to open.',
          },
          {
            id: 'sources',
            title: 'Every number opens',
            body: 'A figure that cannot be clicked through to the orders it is made of is a claim, and shops have heard enough claims.',
          },
          {
            id: 'shelf-first',
            title: 'The shelf before the chart',
            body: 'A beautiful chart of a stockout is still a stockout. The work goes to the shelf, the label and the courier.',
          },
          {
            id: 'leave-clean',
            title: 'Leaving is a feature',
            body: 'The ledger exports as plain files on day one, because a shop that cannot leave is not a customer, it is a hostage.',
          },
        ]}
        actions={[
          { label: 'See the plans', href: publicPath('/pricing') },
          { label: 'Contact the team', href: publicPath('/contact') },
        ]}
      />
      <Section>
        <Team01
          headingLevel="h2"
          eyebrow="The team"
          title="Who answers"
          description="Four invented people, because this whole product is the showcase of a design system and no real person agreed to be here."
          variant="cards"
          people={PEOPLE}
        />
      </Section>
    </SiteChrome>
  )
}
