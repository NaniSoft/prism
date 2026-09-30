import { Button } from '@nanisoft/prism-ui/components/button'
import { Badge } from '@nanisoft/prism-ui/components/badge'

import { UserProfile01, type UserProfile01Fact } from '@nanisoft/prism-ui/blocks/user-profile-01'

/**
 * Five facts and no photograph on two of the three profiles, because the absence is
 * the part worth showing.
 *
 * A Demo that gave every person a portrait would prove nothing about the decision
 * this Block makes, which is that an omitted `avatar` draws no mark at all rather
 * than a person-shaped placeholder. The second profile has a name, a role and a
 * biography and no disc, and a reader who can see both side by side learns something
 * a screenshot of one would not teach them.
 */
const WITH_PHOTOGRAPH: UserProfile01Fact[] = [
  { id: 'team', label: 'Team', value: 'Estate observation' },
  { id: 'based', label: 'Based', value: 'Bristol' },
  { id: 'scope', label: 'Observes', value: 'Eleven sites' },
  { id: 'rotation', label: 'Rotation', value: 'Second from October' },
]

/**
 * Three facts, and the third is a badge, so the value slot is shown doing the thing
 * it is for: a node rather than a string, drawn inside the definition list the
 * Component already styles.
 */
const WITHOUT_PHOTOGRAPH: UserProfile01Fact[] = [
  { id: 'team', label: 'Team', value: 'Settlement engineering' },
  { id: 'joined', label: 'Joined', value: 'March 2025' },
  { id: 'scope', label: 'Building', value: <Badge variant="outline">On rotation</Badge> },
]

export default function UserProfile01Demo() {
  return (
    <div className="flex flex-col gap-16">
      <UserProfile01
        headingLevel="h3"
        name="Margret Haldorsdottir"
        role="Estate observation"
        bio="She reads the eleven sites and the rotations that keep them observed, and she is the person who decides what a fault on an estate means before anybody calls it one."
        avatar={{ name: 'Margret Haldorsdottir' }}
        facts={WITH_PHOTOGRAPH}
        actions={
          <>
            <Button variant="outline">Message</Button>
            <Button variant="ghost">Remove from this estate</Button>
          </>
        }
      />

      <UserProfile01
        headingLevel="h3"
        name="Jide Abara"
        role="Settlement engineering"
        bio="A profile with no portrait is still a profile. Nothing is drawn where the photograph would be, because a person-shaped glyph is a claim about a person this system knows nothing about."
        facts={WITHOUT_PHOTOGRAPH}
        layout="sidebar"
        actions={<Button variant="outline">Message</Button>}
      />

      <UserProfile01
        headingLevel="h3"
        name="Priya Raman"
        role="Pipeline operations"
        bio="A name, a role and a biography, with no facts at all. The fact list renders nothing rather than an empty frame, so there is no box where facts would have been and no heading saying there are none."
        avatar={{ name: 'Priya Raman' }}
      />
    </div>
  )
}
