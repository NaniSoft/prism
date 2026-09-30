import { Bell, LifeBuoy, MessageSquare, Radio, Scale } from 'lucide-react'

import { Community01, type CommunitySpace } from '@nanisoft/prism-ui/blocks/community-01'

/**
 * The four NaniSoft readings of a community, which is what this section is.
 *
 * A pipeline that runs has an on-call rotation, a market that is captured has a
 * watchlist, an estate that is observed has an operators channel, and the fourth
 * is the one that exists to show the shape: a space with a name, a description
 * and a link, and no readings at all, which is a valid row rather than a thinner
 * one. The counts are formatted here rather than in the Block, because
 * `Intl.NumberFormat` needs a locale and the Block does not have one.
 */
const SPACES: CommunitySpace[] = [
  {
    id: 'on-call',
    name: 'The on-call rotation',
    description:
      'A page when a run stops, and a thread afterwards about why it did. The rota is public and the page is not.',
    icon: Bell,
    members: 1204,
    membersLabel: (count) => `${new Intl.NumberFormat().format(count)} people carry the rota`,
    online: 12,
    onlineLabel: (count) => `${count} on call right now`,
    href: 'https://example.com/rota',
    hrefLabel: 'See who is on call',
  },
  {
    id: 'watchlist',
    name: 'The watchlist',
    description:
      'The instruments we publish about, and the notes we keep beside them between publications.',
    icon: Scale,
    members: 640,
    membersLabel: (count) => `${new Intl.NumberFormat().format(count)} subscribers`,
    href: 'https://example.com/watchlist',
    hrefLabel: 'Read the watchlist',
  },
  {
    id: 'operators',
    name: 'The operators channel',
    description:
      'For the eleven sites, and for the people who are awake at three in the morning because something is.',
    icon: MessageSquare,
    online: 204,
    onlineLabel: (count) => `${count} reading this week`,
    href: 'https://example.com/operators',
    hrefLabel: 'Ask a question',
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'What changed, and when. Read only, which is why it has no count on it.',
    icon: Radio,
    href: 'https://example.com/announcements',
    hrefLabel: 'Read what changed',
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Where a question about your own workspace gets an answer from a person.',
    icon: LifeBuoy,
    members: 31,
    membersLabel: (count) => `${count} people on the desk this week`,
    href: 'https://example.com/support',
    hrefLabel: 'Open a ticket',
  },
]

/** The cards, the same set as rows, and the empty state. */
export default function Community01Demo() {
  return (
    <>
      <Community01
        headingLevel="h3"
        eyebrow="Preview"
        title="Three places, and they are not the same"
        description="The fourth space has no readings at all, which is a valid row. A rotation is a page, a watchlist is a reading list, and an operators channel is a conversation."
        variant="cards"
        spaces={SPACES}
      />
      <Community01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same places as rows"
        description="One set of data and two arrangements. The two readings and the link sit on one line, which is what a list of five reads like."
        variant="rows"
        spaces={SPACES.filter((space) => space.icon !== undefined && space.id !== 'announcements')}
      />
      <Community01
        headingLevel="h3"
        eyebrow="Preview"
        title="A product that has not opened a channel yet"
        description="The empty sentence is yours, because the two honest answers are opposites."
        spaces={[]}
        empty="There is nowhere to ask yet. The team answers questions inside a workspace until this opens."
      />
    </>
  )
}
