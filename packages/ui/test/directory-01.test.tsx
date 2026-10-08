/**
 * The per-member node on the directory index.
 *
 * **What is being tested is the escape, not the layout.** A directory is a browse, so
 * the enable a plugin row carries is a property of a member rather than a command on a
 * selection, and the Block cannot draw the control itself: `check-block-controls.mjs`
 * classifies `Switch` and fails a Block that renders one without its handler, and a
 * Block ships no behaviour and so cannot supply one. So the control arrives as a node
 * the caller wrote, holding the caller's own handler, and the two things worth
 * asserting are that the node is placed in both arrangements and that the Block draws
 * no control of its own in its place.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Directory01, type Directory01Category } from '../src/blocks/directory-01'
import { Switch } from '../src/components/ui/switch'

const CATEGORIES: Directory01Category[] = [
  {
    id: 'installed',
    title: 'Installed',
    members: [
      {
        id: 'linear',
        name: 'Linear',
        role: 'Issue tracking',
        href: '/connections/linear',
        hrefLabel: 'Open the Linear connection',
      },
      {
        id: 'figma',
        name: 'Figma',
        role: 'Design handoff',
        href: '/connections/figma',
        hrefLabel: 'Open the Figma connection',
      },
    ],
  },
]

/** The Block, with the caller's per-member node when one is passed. */
function renderDirectory(renderMemberAction?: Parameters<typeof Directory01>[0]['renderMemberAction']) {
  return render(
    <Directory01
      title="Plugins"
      value=""
      onValueChange={() => {}}
      label="Search the plugins"
      clearLabel="Clear the search"
      categories={CATEGORIES}
      empty="No plugin matches that."
      {...(renderMemberAction === undefined ? {} : { renderMemberAction })}
    />,
  )
}

describe('the per-member node', () => {
  it('places the caller’s node for every member, in the card arrangement', () => {
    const { container } = renderDirectory((member) => (
      <Switch aria-label={`Enable ${member.name}`} checked onCheckedChange={() => {}} />
    ))

    // The node is placed once per member, in the band the Block owns, and it is the
    // caller's control rather than a copy the Block made.
    expect(container.querySelectorAll('[data-slot="directory-01-member-action"]')).toHaveLength(2)
    expect(screen.getAllByRole('switch')).toHaveLength(2)
    expect(screen.getByRole('switch', { name: 'Enable Linear' })).toBeTruthy()
    expect(screen.getByRole('switch', { name: 'Enable Figma' })).toBeTruthy()
  })

  it('places the same node in the row arrangement', () => {
    const { container } = render(
      <Directory01
        title="Plugins"
        variant="rows"
        value=""
        onValueChange={() => {}}
        label="Search the plugins"
        clearLabel="Clear the search"
        categories={CATEGORIES}
        empty="No plugin matches that."
        renderMemberAction={(member) => (
          <Switch aria-label={`Enable ${member.name}`} checked onCheckedChange={() => {}} />
        )}
      />,
    )

    expect(container.querySelectorAll('[data-slot="directory-01-row"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-slot="directory-01-member-action"]')).toHaveLength(2)
    expect(screen.getAllByRole('switch')).toHaveLength(2)
  })

  it('draws no control of its own where the node is not passed', () => {
    const { container } = renderDirectory()

    // No node, no control. The Block's only controls are the search field and the
    // member link, and neither is the enable this prop exists for.
    expect(container.querySelectorAll('[data-slot="directory-01-member-action"]')).toHaveLength(0)
    expect(screen.queryAllByRole('switch')).toHaveLength(0)
  })

  it('draws no control of its own in the node’s place, in either arrangement', () => {
    const cards = renderDirectory((member) => <span>Enable {member.name}</span>)
    expect(screen.getAllByText(/^Enable /)).toHaveLength(2)
    expect(cards.container.querySelectorAll('[data-slot="switch"]')).toHaveLength(0)
    cards.unmount()

    const rows = render(
      <Directory01
        title="Plugins"
        variant="rows"
        value=""
        onValueChange={() => {}}
        label="Search the plugins"
        clearLabel="Clear the search"
        categories={CATEGORIES}
        empty="No plugin matches that."
        renderMemberAction={(member) => <span>Enable {member.name}</span>}
      />,
    )
    expect(screen.getAllByText(/^Enable /)).toHaveLength(2)
    expect(rows.container.querySelectorAll('[data-slot="switch"]')).toHaveLength(0)
  })
})
