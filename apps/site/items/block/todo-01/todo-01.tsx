'use client'

import { useState } from 'react'

import { Todo01, type Todo01Task } from '@nanisoft/prism-ui/blocks/todo-01'

/**
 * A week's work with a done task in the middle of it and a blocked one at the end,
 * in both arrangements.
 *
 * The two arrangements are the point of the second half. A list puts everything
 * about a task under its title so a task can carry a note and still read as one
 * block. A checklist puts the owner, the moment and the mark at the end of the
 * title's own line, so a reader scanning the left edge sees titles and a column of
 * names. Nothing is dropped either way, which is the whole difference.
 *
 * The state lives here, in the caller, and the Block is handed the array back. A
 * task list whose checkbox mutated its own copy would be a list whose state a
 * server render could not produce and a store could not own.
 */
const INITIAL: Todo01Task[] = [
  {
    id: 'reconcile',
    title: 'Reconcile the September invoice run against the ledger',
    note: 'Two captures on the same card on the 2nd. Billing has the second one; the ledger has the first.',
    owner: 'Priya Raman',
    ownerAvatar: { name: 'Priya Raman' },
    due: '2026-09-29T17:00:00Z',
    dueLabel: () => 'Tuesday',
    done: true,
  },
  {
    id: 'okta',
    title: 'Fix the Okta group mapping so the claim carries the role',
    note: 'The assertion has the group and the claim does not. The claim is the one we read.',
    owner: 'Tomas Berg',
    ownerAvatar: { name: 'Tomas Berg' },
    due: '2026-09-30T17:00:00Z',
    dueLabel: () => 'Wednesday',
  },
  {
    id: 'export',
    title: 'Ship the warehouse export that keeps its own identifiers',
    note: 'Requested twice this month and both times closed as duplicate. It is not a duplicate.',
    owner: 'Wren Ashby',
    due: '2026-10-02T17:00:00Z',
    dueLabel: () => 'Friday',
    href: '/requests/203',
    hrefLabel: 'Read the request',
  },
  {
    id: 'access',
    title: 'Sign off the access review for the reporting warehouse',
    owner: 'Ops',
    due: '2026-10-06T17:00:00Z',
    dueLabel: () => 'Tuesday next week',
    blocked: true,
    blockedLabel: 'Waiting on the data owner',
  },
]

export default function Todo01Demo() {
  const [tasks, setTasks] = useState(INITIAL)

  function toggle(id: string, done: boolean) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done } : task)))
  }

  return (
    <>
      <Todo01
        headingLevel="h3"
        eyebrow="Nexus"
        title="This week"
        description="Tick a box and the caller rewrites the array. The bar takes your words as a string, because a function cannot cross from a server Component into a client one."
        tasks={tasks}
        onToggle={toggle}
        showProgress
        progressLabel={(done: number, total: number) => `${done} of ${total} done`}
        empty="Nothing is on the list this week. That is a claim about your week, so it is your sentence."
      />

      <Todo01
        headingLevel="h3"
        eyebrow="Nexus"
        title="The same week as a checklist"
        description="The titles, the owners and the moments on one line each. The note still goes under the title it belongs to."
        tasks={tasks}
        variant="checklist"
        onToggle={toggle}
        showProgress
        progressLabel={(done: number, total: number) => `${done} of ${total} done`}
        empty="Nothing is on the list this week."
      />

      <Todo01
        headingLevel="h3"
        eyebrow="Nexus"
        title="And with no handler at all"
        description="No onToggle, so every checkbox renders read only. A read only control is focusable and announces its state, which a disabled one does not."
        tasks={tasks}
        showProgress
        progressLabel={(done: number, total: number) => `${done} of ${total} done`}
        empty="Nothing is on the list this week."
      />
    </>
  )
}
