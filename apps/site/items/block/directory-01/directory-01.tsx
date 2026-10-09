'use client'

import { useState } from 'react'

import { Switch } from '@nanisoft/prism-ui/components/switch'
import { Directory01, type Directory01Category } from '@nanisoft/prism-ui/blocks/directory-01'

/**
 * Three categories, nine members, and a link label on every one of them that says
 * something different.
 *
 * The labels are the point of this Demo. Nine members all linking to /people/x with
 * nine identical labels would prove nothing about the argument the JSDoc makes, so
 * every row here carries a different offer: message, open, ask, see who is on call.
 * A reader who scans the trailing column of either arrangement can see that the
 * sentence is the caller's, because no two of them are alike.
 */
const CATEGORIES: Directory01Category[] = [
  {
    id: 'observation',
    title: 'Estate observation',
    description: 'The people who read the eleven sites and decide what a fault on one means.',
    members: [
      {
        id: 'mh',
        name: 'Margret Haldorsdottir',
        role: 'Estate observation',
        href: '/overview',
        hrefLabel: 'Message Margret',
        avatar: { name: 'Margret Haldorsdottir' },
        tags: [
          { id: 'rotations', label: 'Rotations' },
          { id: 'bristol', label: 'Bristol' },
        ],
      },
      {
        id: 'to',
        name: 'Tunde Oyelaran',
        role: 'Estate observation',
        href: '/overview',
        hrefLabel: 'Open the Tuesday rota',
        avatar: { src: 'https://portraits.example/t-oyelaran.png', name: 'Tunde Oyelaran' },
        tags: [
          { id: 'rotations', label: 'Rotations' },
          { id: 'cardiff', label: 'Cardiff' },
        ],
      },
      {
        id: 'ja',
        name: 'Jide Abara',
        role: 'Settlement engineering',
        href: '/overview',
        hrefLabel: 'Ask Jide about the run',
        avatar: { name: 'Jide Abara' },
        tags: [{ id: 'settlements', label: 'Settlements' }],
      },
    ],
  },
  {
    id: 'market',
    title: 'Market reading',
    description: 'The instruments we publish about, and the notes we keep beside them between publications.',
    members: [
      {
        id: 'pr',
        name: 'Priya Raman',
        role: 'Market reading',
        href: '/overview',
        hrefLabel: 'See the watchlist Priya keeps',
        avatar: { name: 'Priya Raman' },
        tags: [
          { id: 'watchlist', label: 'Watchlist' },
          { id: 'rotations', label: 'Rotations' },
        ],
      },
      {
        id: 'hs',
        name: 'Halima Said',
        role: 'Market reading',
        href: '/overview',
        hrefLabel: 'Read Halima latest note',
        tags: [{ id: 'notes', label: 'Notes' }],
      },
    ],
  },
  {
    id: 'platform',
    title: 'Platform',
    description: 'The people who build the thing, for the questions about the thing itself.',
    members: [
      {
        id: 'nw',
        name: 'Nils Wagenheim',
        role: 'Platform engineering',
        href: '/overview',
        hrefLabel: 'Open the incident Nils is on',
        tags: [
          { id: 'platform', label: 'Platform' },
          { id: 'rotations', label: 'Rotations' },
        ],
      },
      {
        id: 'ao',
        name: 'Adaeze Okafor',
        role: 'Design systems',
        href: '/overview',
        hrefLabel: 'Message Adaeze about the tokens',
        tags: [{ id: 'design', label: 'Design systems' }],
      },
      {
        id: 'sk',
        name: 'Soren Kjeldsen',
        role: 'Platform engineering',
        href: '/overview',
        hrefLabel: 'Ask Soren about the collector',
        tags: [{ id: 'platform', label: 'Platform' }],
      },
    ],
  },
]

/**
 * A set of extensions, each with its own enable.
 *
 * This is the shape the per-member node exists for: a directory is a browse, so
 * the enable is a property of a member rather than a command on a selection, and
 * the `Switch` and its handler are the caller's. The Block places the node and
 * draws nothing in its place.
 */
const PLUGINS: Directory01Category[] = [
  {
    id: 'installed',
    title: 'Installed',
    description: 'The extensions this workspace has added, and whether each is on.',
    members: [
      {
        id: 'linear',
        name: 'Linear',
        role: 'Issue tracking',
        href: '/overview',
        hrefLabel: 'Open the Linear connection',
        tags: [{ id: 'issues', label: 'Issues' }],
      },
      {
        id: 'figma',
        name: 'Figma',
        role: 'Design handoff',
        href: '/overview',
        hrefLabel: 'Open the Figma connection',
        tags: [{ id: 'design', label: 'Design' }],
      },
    ],
  },
]

/**
 * The result line, written the way four products write it.
 *
 * It returns null for a count of zero, so the live region is in the document from the
 * first paint with nothing in it and a sentence the moment there is something to say.
 * The plural is the caller's too: the Block hands over a number because the noun it
 * goes with inflects, and the inflection belongs to this sentence.
 */
function summary(matches: number): React.ReactNode {
  if (matches === 0) return null
  return matches === 1 ? '1 person' : `${matches} people`
}

export default function Directory01Demo() {
  const [query, setQuery] = useState('')
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ linear: true })

  return (
    <div className="flex flex-col gap-16">
      <div className="flex max-w-measure-narrow flex-col gap-6">
        <p className="text-muted-foreground text-sm">
          Try <strong>rotations</strong>, which is a tag on four members across three
          categories, or <strong>Platform</strong>, which is one category own name and
          therefore carries both of its members at once. Or type something that is not
          here at all, which is the one line this Block refuses to write.
        </p>

        <Directory01
          headingLevel="h3"
          eyebrow="Preview"
          title="Who to ask"
          description="Nine people in three teams. Every link says something different, because what you can do with a colleague is not the same offer as what you can do with a rota."
          value={query}
          onValueChange={setQuery}
          label="Search the directory"
          clearLabel="Clear the search"
          categories={CATEGORIES}
          empty="Nobody here matches that. Try a team, a role, or one of the labels on a card."
          summary={summary}
        />
      </div>

      <Directory01
        headingLevel="h3"
        eyebrow="Preview"
        title="The same people as rows"
        description="One set of data and two arrangements. The portrait belongs at the leading edge of a line here rather than above a name in a grid, and the link stays at the trailing edge either way."
        value=""
        onValueChange={() => {}}
        label="Search the directory"
        clearLabel="Clear the search"
        variant="rows"
        categories={CATEGORIES.slice(0, 2)}
        empty="Nobody here matches that."
      />

      <Directory01
        headingLevel="h3"
        eyebrow="Preview"
        title="A directory nobody has joined yet"
        description="The empty sentence is yours, because the two honest answers are opposites."
        value=""
        onValueChange={() => {}}
        label="Search the directory"
        clearLabel="Clear the search"
        categories={[]}
        empty="Nobody is in this directory yet. The first person you add is the first card here."
      />

      <Directory01
        headingLevel="h3"
        eyebrow="Preview"
        title="A plugin list with a per-member enable"
        description="The enable is the caller's own Switch with its own handler, placed as a per-member node. The Block draws no control of its own in its place, so a directory never ships a toggle that cannot act."
        value=""
        onValueChange={() => {}}
        label="Search the plugins"
        clearLabel="Clear the search"
        categories={PLUGINS}
        empty="No plugin matches that."
        renderMemberAction={(member) => (
          <Switch
            aria-label={`Enable ${member.name}`}
            checked={enabled[member.id] === true}
            onCheckedChange={(checked) =>
              setEnabled((current) => ({ ...current, [member.id]: checked }))
            }
          />
        )}
      />
    </div>
  )
}
