'use client'

import { MemberList01 } from '@nanisoft/prism-ui/blocks/member-list-01'

/**
 * Five invented members, one of them away and one of them offline.
 *
 * **Every name is invented and every presence is a string in this file rather
 * than anything real.** The presence column is the part that has to be shown
 * honestly in a demo: a documentation site that published "Priya Raman is
 * online" would be making a claim about a person who has not agreed to it, and
 * the reason this Block takes the words beside the dot as a prop is precisely
 * that a design system cannot choose them.
 *
 * All three presences are on screen so the mapping is visible: `success` for the
 * first, `warning` for the away row and `neutral` for the two offline rows, which
 * is the one that proves a list of members is not a list of alarms. The last
 * member has no `href` while `onSelect` is passed, which is the arm where a row
 * is a control with the member's name as its accessible name.
 */
export default function MemberList01Demo() {
  return (
    <MemberList01
      headingLevel="h3"
      label="Workspace members"
      title="Members"
      empty="Nobody has joined this workspace yet."
      onSelect={() => {}}
      members={[
        {
          id: 'p-raman',
          name: 'Priya Raman',
          role: 'Pipeline operations',
          presence: 'online',
          presenceLabel: 'At a terminal',
          lastSeen: 'Seen a moment ago',
          avatar: { name: 'Priya Raman' },
        },
        {
          id: 't-oyelaran',
          name: 'Tunde Oyelaran',
          role: 'Market reading',
          presence: 'away',
          presenceLabel: 'Away until Monday',
          lastSeen: 'Seen yesterday',
          avatar: { src: 'https://portraits.example/t-oyelaran.png', name: 'Tunde Oyelaran' },
        },
        {
          id: 'm-haldorsdottir',
          name: 'Margret Haldorsdottir',
          role: 'Estate observation',
          presence: 'offline',
          presenceLabel: 'Signed out',
          lastSeen: 'Seen on Tuesday',
        },
        {
          id: 'j-abara',
          name: 'Jide Abara',
          role: 'Settlement engineering',
          presence: 'offline',
          presenceLabel: 'Signed out',
          lastSeen: 'Seen three days ago',
          avatar: { name: 'Jide Abara' },
        },
      ]}
    />
  )
}