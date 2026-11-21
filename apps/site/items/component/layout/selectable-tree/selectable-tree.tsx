'use client'

import { useState } from 'react'

import { Badge } from '@nanisoft/prism-ui/components/badge'
import { ListPanel } from '@nanisoft/prism-ui/components/list-panel'
import {
  SelectableTree,
  type SelectableTreeNode,
} from '@nanisoft/prism-ui/components/selectable-tree'

/**
 * Two pipeline sets, one of them the default.
 *
 * The first group carries a chapter heading and a count of its phases, and the
 * second is there so the reader meets two of them: a tree of one group is a list
 * with a heading, and the point of the arrangement is what happens between two.
 * The third phase has no supporting line, which is the shape a caller gets by
 * omitting `description` rather than by passing an empty one.
 */
const NODES: SelectableTreeNode[] = [
  {
    type: 'group',
    title: 'Standard',
    meta: <Badge variant="secondary">default</Badge>,
    items: [
      {
        type: 'item',
        id: 'plan',
        leading: '1',
        title: 'Plan the change',
        description: 'planning, research',
      },
      {
        type: 'item',
        id: 'patch',
        leading: '2',
        title: 'Write the patch',
        description: 'no skills',
        meta: <Badge variant="outline">flash</Badge>,
      },
      { type: 'item', id: 'open', leading: '3', title: 'Open the pull request' },
    ],
  },
  {
    type: 'group',
    title: 'Delivery',
    items: [
      {
        type: 'item',
        id: 'triage',
        leading: '1',
        title: 'Triage the issue',
        description: 'issue-labels',
      },
      {
        type: 'item',
        id: 'review',
        leading: '2',
        title: 'Review the change',
        items: [
          {
            type: 'item',
            id: 'checks',
            leading: '2.1',
            title: 'Run the checks',
            description: 'no skills',
          },
        ],
      },
    ],
  },
]

/** What the pane beside the tree says about the picked phase. */
const NOTES: Record<string, string> = {
  plan: 'The phase that reads the issue and writes the plan it will follow.',
  patch: 'The phase that edits the worktree, with a pinned model and no planning skill.',
  open: 'The phase that commits, pushes and opens the pull request.',
  triage: 'The first phase of the delivery set, which labels the issue before work starts.',
  review: 'A phase that can be picked and also holds one of its own.',
  checks: 'A nested phase, one level deeper than the rest, selected on its own.',
}

/**
 * A rail of records with the picked one drawn beside it.
 *
 * The pick drives the pane, which is the job: a reader meeting this for the first
 * time should try the arrow keys and notice that they move without changing what
 * the pane says, and then press Enter and watch the pane change. That is the one
 * decision the Component asks a caller to agree with.
 */
export default function SelectableTreeDemo() {
  const [value, setValue] = useState<string | null>('patch')

  return (
    <div className="grid gap-4 sm:grid-cols-[17rem_minmax(0,1fr)]">
      <ListPanel title="Pipelines" count={`${NODES.length} sets`} scroll={false}>
        <SelectableTree
          nodes={NODES}
          value={value}
          onValueChange={setValue}
          label="Pipelines"
          className="p-1"
        />
      </ListPanel>

      <div className="border-border flex flex-col gap-2 rounded-lg border p-4">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Picked
        </span>
        <p className="text-sm">{value === null ? 'Nothing picked yet' : NOTES[value]}</p>
        <p className="text-muted-foreground text-sm">
          The arrows move the tab stop without moving the pick, and Enter or Space
          takes it. A reader browsing a set is not choosing every record they pass.
        </p>
      </div>
    </div>
  )
}
