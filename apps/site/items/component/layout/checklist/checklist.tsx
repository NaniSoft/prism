'use client'

import { useState } from 'react'

import {
  Checklist,
  type ChecklistPriority,
  type ChecklistTask,
} from '@nanisoft/prism-ui/components/checklist'

const INITIAL: ChecklistTask[] = [
  {
    id: 'keys',
    title: 'Rotate the signing keys',
    description: 'Both environments, then record the new key ids.',
    priority: 'urgent',
    due: Date.UTC(2026, 9, 2),
    dueLabel: (due) => {
      const days = Math.round((new Date(due).getTime() - Date.UTC(2026, 8, 28)) / 86400000)
      return days === 1 ? 'tomorrow' : `in ${days} days`
    },
  },
  {
    id: 'readings',
    title: 'Chase the estate with no readings after 14 March',
    priority: 'normal',
  },
  { id: 'alerts', title: 'Silence the paging alert on the ingest queue', done: true },
  {
    id: 'runbook',
    title: 'Write the rollback runbook',
    description: 'Nobody has done this since the estate migration.',
  },
]

/** The three priorities, in the words this product uses for them. */
const PRIORITY: Record<ChecklistPriority, string> = {
  none: 'No priority',
  normal: 'This week',
  urgent: 'Before Friday',
}

/**
 * A queue of work the reader completes as they go.
 *
 * The first row is urgent and carries a due date; the third is done, and it has
 * stayed where it is with its title struck through rather than moving to the bottom.
 * That is the decision worth watching: a list that shortens as it is worked through
 * claims the reader has less left than they do, and the claim is false the moment
 * one row is uncompleted.
 */
export default function ChecklistDemo() {
  const [tasks, setTasks] = useState(INITIAL)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-8">
      <Checklist
        label="Pre-release work"
        tasks={tasks}
        onToggle={(task, done) =>
          setTasks((current) =>
            current.map((candidate) =>
              candidate.id === task.id ? { ...candidate, done } : candidate,
            ),
          )
        }
        onAdd={(title) =>
          setTasks((current) => [...current, { id: `task-${current.length + 1}`, title }])
        }
        addLabel="Add a task"
        addPlaceholder="What needs doing?"
        addFieldLabel="New task title"
        priorityLabel={(priority) => PRIORITY[priority]}
        completedLabel={(task, done, total) =>
          `${typeof task.title === 'string' ? task.title : 'Task'} done. ${done} of ${total} complete.`
        }
        uncompletedLabel={(task, done, total) =>
          `${typeof task.title === 'string' ? task.title : 'Task'} is back on the list. ${done} of ${total} complete.`
        }
        addedLabel={(title, total) => `${title} added. ${total} tasks on the list.`}
        emptyLabel="Type what the task is before adding it."
      />

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        Complete a task, uncomplete it, and add one. Each of the three transitions is
        announced, and each sentence carries the running count, because the count is
        the part a reader cannot get from the drawing.
      </p>
    </div>
  )
}
