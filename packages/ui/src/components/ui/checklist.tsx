'use client'

import { PlusIcon } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

import { Button } from './button'
import { Checkbox } from './checkbox'
import { Input } from './input'
import { LiveRegion } from './live-region'
import { RelativeTime } from './relative-time'
import { cn } from '../../lib/utils'

/**
 * How urgent one task is, and the three values the set is closed to.
 *
 * A closed set of three rather than a string, because the tone a priority is drawn
 * in is a judgement Prism can make from the value alone: nothing makes no claim
 * about the reader's work, something does, and urgent does. What Prism cannot make
 * is the *word*, which is why `priorityLabel` is a required prop rather than a map
 * of Prism's own: "P1", "Blocker", "Sev 1" and "Urgente" are four products' answers
 * to the same value, and a shared library cannot know which one a caller uses.
 *
 * The rejected alternative is a caller-supplied tone, and the rejection is the
 * argument: a colour prop on a priority is an override path. It would let a
 * caller paint a task urgent in a colour that means nothing in their own product,
 * and it would take away the one decision Prism can make correctly.
 */
export type ChecklistPriority = 'none' | 'normal' | 'urgent'

/**
 * One task in a checklist.
 *
 * `id` is required for the reason `ItemEntry` requires it: this set completes and
 * announces, and a task identified by its position has a reader's focus and a
 * screen reader's announcement land on a different task the moment one above it is
 * completed.
 */
export type ChecklistTask = {
  /** A stable key for the task, held across every completion. */
  id: string
  /** The task itself, in the words a reader would use about it in conversation. */
  title: ReactNode
  /**
   * One line about the task, under its title, in the muted ink.
   *
   * Omit it rather than passing an empty string, for the reason `ItemEntry` gives:
   * a task with no second line is one line tall, and a task with an empty second
   * line is one line tall with the reader looking for the thing that is not there.
   */
  description?: ReactNode
  /** How urgent it is. Omitted and `none` are the same, and neither is announced. */
  priority?: ChecklistPriority
  /**
   * When it is wanted, in whichever of the three forms the caller holds it.
   *
   * A `Date`, epoch milliseconds, or a string the platform parses, handed to
   * `RelativeTime` untouched. A bare number is milliseconds and nothing else, so a
   * consumer whose data layer holds seconds gets 1970 and blames the library, which
   * is a mistake no Component can detect from the value.
   */
  due?: Date | number | string
  /**
   * The caller's own words for the moment, given the moment they passed.
   *
   * Used only when `due` is a value, because this is the relative half and the
   * absolute half is the platform's, which is the split `RelativeTime` states at
   * length. A caller who wants both halves in their own voice passes a node as
   * `due` instead, and this is not called.
   */
  dueLabel?: (due: Date | number | string) => string
  /** Whether it is finished. */
  done?: boolean
}

/**
 * The props a Checklist accepts.
 *
 * A declared interface rather than one extended from a native element's, and the
 * reason is the same `LifecycleButton` gives: a forwarded `onSubmit` or a
 * forwarded `children` would be a second way to say what this Component does. The
 * two callbacks and every readable string are decided here, because each of them
 * is a sentence this package may not choose on a consumer's behalf.
 */
export interface ChecklistProps {
  /**
   * The tasks, in the order they are shown.
   *
   * Required and controlled, and the objects must be the same objects across
   * renders for the reason `RepeatableRows` says it: the Component keys each task
   * by its identity, and an identity built from the position would reuse one DOM
   * element for a different task the moment one above it completed.
   */
  tasks: readonly ChecklistTask[]
  /**
   * Called when a task completes or uncompletes, given the task and the state it is
   * moving to.
   *
   * Required, and required with both arguments rather than one, because the two
   * halves are not the same move: uncompleting undoes work a reader did and
   * completing confirms it, and a caller who has to read the task's current `done`
   * to tell them apart is a caller who gets it wrong when two updates land in one
   * batch. The Component never moves the state; the caller's array is the truth and
   * this reports the intent.
   */
  onToggle: (task: ChecklistTask, done: boolean) => void
  /**
   * Called with the title the reader typed, when they ask for another task.
   *
   * Required, and the Component appends nothing itself. A task is a record with a
   * title the caller owns, so manufacturing an empty one would have this package
   * inventing that title in its own language. Passing the typed title rather than
   * reporting an addition is the whole of the contract: the caller decides what a
   * new task looks like beyond its title, including the id and any default
   * priority, and the Component never has to know.
   */
  onAdd: (title: string) => void
  /**
   * The visible label of the add control, in the product's own words.
   *
   * Required and never defaulted, for the reason every reader-facing string here
   * is one: "Add task", "Add a check" and "Ajouter une tâche" are three products'
   * answers to the same control.
   */
  addLabel: ReactNode
  /**
   * The placeholder inside the add field, in the product's own words.
   *
   * Required, and a placeholder rather than a permanent label because the field is
   * one line tall and a label above it would put two labels on the add control of
   * every list in a product. It is `aria-hidden` at the call site, because the
   * field's own accessible name is `addFieldLabel` and a placeholder read after
   * that name is the same instruction twice.
   */
  addPlaceholder: string
  /**
   * The accessible name of the add field itself, in the product's own words.
   *
   * Required and separate from the placeholder because the two answer different
   * questions for different readers: the name is the control's and has to survive a
   * reader who has typed into the field and cleared it, while the placeholder is
   * an example that disappears on the first keystroke.
   */
  addFieldLabel: string
  /**
   * The words for one priority value, in the product's own words.
   *
   * Required for all three members, not only for the ones a given list uses, so
   * that a list gaining its first urgent task is not a second edit to this prop.
   */
  priorityLabel: (priority: ChecklistPriority) => string
  /**
   * The words read when a task completes, given the task and how many of the set
   * are finished afterwards.
   *
   * Required, and the count is there because completion is a state machine and its
   * useful sentence is the running one: "Rotate the signing keys. 3 of 7 done." A
   * caller who has to reach back into their own array to build that count is
   * keeping a second source of truth in step with the set.
   */
  completedLabel: (task: ChecklistTask, done: number, total: number) => string
  /**
   * The words read when a task goes back to unfinished, given the task and the
   * count.
   *
   * Required, and required rather than a reuse of `completedLabel` because the two
   * events are not the same one to a reader. Uncompleting is undoing work they did,
   * and one sentence for both directions tells them the list cannot be trusted.
   */
  uncompletedLabel: (task: ChecklistTask, done: number, total: number) => string
  /**
   * The words read when a task has just been added.
   *
   * Required, and the title is passed back as a string rather than the task,
   * because at the moment of the announcement the task does not exist as a record
   * yet: the caller has been told the title and has not applied anything. Passing a
   * task here would have this Component invent an id to stand in for one.
   */
  addedLabel: (title: string, total: number) => string
  /**
   * The words read when the reader asks for a task with nothing in the field.
   *
   * Required, and the reason it exists rather than doing nothing quietly is the one
   * `ReorderableList` gives for a refused move: a control that accepts a press and
   * answers with silence is a control a reader takes to be broken, and an empty
   * task is the most likely reason they press it a second time.
   */
  emptyLabel: string
  /**
   * The set's own name, drawn above it and used as its accessible name.
   *
   * Optional, and the omission is `ListPanel`'s decision rather than an oversight:
   * a region may arrive anonymous here, because a name invented by this package is
   * a claim that is wrong in every consumer's product, and an anonymous region is
   * honestly absent from the landmark list rather than announced as something it is
   * not.
   */
  label?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The completion indicator's own placement, applied on top of `Checkbox`.
 *
 * The sizing lives here rather than on `Checkbox` because a completion control is
 * pressed far more often than a form checkbox is and is worked through with a thumb
 * on a phone. `size-8` with the coarse-pointer floor at 44px is that, and it is a
 * deliberate difference from the `size-4` a form checkbox draws: a task list is a
 * queue and a form is a document, and they are not the same control at two sizes.
 *
 * The focus ring is repeated here rather than inherited, because `Checkbox` draws
 * its own and the two would sit on the same element, and the ring this Component
 * adds is at full strength on `focus-visible`.
 */
const TOGGLE =
  'size-8 rounded-full pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A set of tasks that complete, uncomplete, and can be added to while the reader
 * works through them.
 *
 * **The value is a completion state machine and an add affordance, and neither is
 * a prop of anything else in this package.** A `Table` renders rows and has no
 * opinion about what a row *is*. A `ListPanel` of `Item` rows is a titled, bounded,
 * scrollable panel, which is the container a long read-only list wants and not the
 * one a queue wants. The `todo-01` Block is the closest thing here and it is a
 * different thing by the definition of the word: a Block is a pre-composed section
 * that takes its content as props and draws its own heading, its own progress bar
 * and its own empty state, and is installed whole. This is a Component with one
 * job, so it draws the set and the completion control and refuses to draw the
 * heading, the meter or the empty state: those three are the Block's, and a
 * consumer who wants the whole arrangement puts this inside their own section or
 * composes `todo-01` where the read-only view belongs. The cost is stated rather
 * than hidden: a caller who wanted a section writes three lines around this, and a
 * caller who expected a section gets a set.
 *
 * **Completion is a machine with two moves, and the Component refuses to hold it.**
 * A boolean cannot say which way a task is moving, and the two ways are not
 * symmetric to a reader: uncompleting undoes work they did and completing confirms
 * it, and one sentence for both tells them the list cannot be trusted. So the
 * callback takes the task and the state it is moving to, and the Component moves
 * nothing. What that costs is the price of a controlled set: the caller's array is
 * the only truth, and a caller who forgets to apply the change sees a checkbox that
 * visibly refuses to tick, which is a better failure than a Component that
 * half-owns its own state.
 *
 * **Every transition is announced, and the count is in each sentence.** Three
 * transitions can happen here and all three are close to invisible: a completion
 * moves a check, an uncompletion removes one, and an addition lengthens a list that
 * was already the right height. So `completedLabel`, `uncompletedLabel` and
 * `addedLabel` are three required props, each taking the running count, and each
 * with its own word rather than one shared sentence. The live region is `polite`
 * rather than assertive, and that is a deliberate difference from
 * `ReorderableList`: a reader working through a queue is waiting for the next task
 * rather than for an answer to a question they asked, so the announcement takes its
 * turn instead of cutting across whatever they were reading.
 *
 * **The add affordance is a real form and a real field, and it is not a dialog.**
 * A button that opened a dialog per task is three interactions for one row, and a
 * keyboard reader adding four tasks dismisses the same dialog four times. One line
 * beside the add control is one interaction, `Enter` works because it is a genuine
 * `<form>` with a genuine submit button rather than a `div` with a keydown handler,
 * and a reader with a switch device gets a real control. The reader is put in the
 * field on arrival and the field keeps focus after an addition, because the field
 * is already on the page and a row that has not been applied yet cannot be focused.
 * An empty press says `emptyLabel` and adds nothing, because a task with no title
 * is a row the reader has to delete before the list is usable.
 *
 * **A completed task stays where it is and is struck through rather than moved.**
 * Moving a completed row to the bottom makes the queue shorter as it is worked
 * through, which is a claim about progress that is false: three finished and seven
 * to go is still ten tasks, and a list whose length is the measure of what is left
 * lies the moment one row is uncompleted. The strike is on the title only, so the
 * description stays legible to a reader checking what they finished.
 *
 * **`Checkbox` and `RelativeTime` are composed rather than drawn.** The checkbox
 * submits, validates, announces `checked` in the reader's own assistive technology
 * and carries the mixed state, and a hand-rolled `div` with a tick in it does none
 * of those. The relative time hands the absolute reading to the platform and takes
 * the relative half from the caller, which is the split that keeps a date from
 * arriving in English inside a product that is not in English.
 *
 * **It is a client Component**, because completion is a state change and addition
 * is an event handler, and because every one of its value props is a function the
 * caller hands it, which is a client-to-client boundary wherever it is written.
 * What that costs is the price of every client control: a server Component may
 * render the set once with its tasks already in place, and what it may not do is
 * let a reader complete one.
 */
function Checklist({
  tasks,
  onToggle,
  onAdd,
  addLabel,
  addPlaceholder,
  addFieldLabel,
  priorityLabel,
  completedLabel,
  uncompletedLabel,
  addedLabel,
  emptyLabel,
  label,
  className,
}: ChecklistProps) {
  const labelId = useId()
  const fieldId = useId()
  const fieldRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [said, setSaid] = useState('')

  const total = tasks.length
  const done = tasks.reduce((count, task) => (task.done === true ? count + 1 : count), 0)

  return (
    <div
      data-slot="checklist"
      role="group"
      aria-labelledby={label === undefined ? undefined : labelId}
      className={cn('flex w-full flex-col gap-3', className)}
    >
      {label === undefined ? null : (
        <span
          id={labelId}
          data-slot="checklist-label"
          className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
        >
          {label}
        </span>
      )}

      {/*
       * An `ol` rather than a `ul`, because the position is a fact about a queue a
       * reader is working through and the list semantics are what put it in the
       * accessibility tree. The region around the set is named once, on the
       * wrapper, by the element the reader can see, so the name a screen reader
       * announces and the name a sighted reader reads are the same text by
       * construction rather than by two props kept in step.
       */}
      <ol data-slot="checklist-list" className="flex w-full flex-col gap-1">
        {tasks.map((task) => {
          const finished = task.done === true
          const urgent = task.priority === 'urgent'
          const raised = task.priority !== undefined && task.priority !== 'none'

          return (
            <li
              key={task.id}
              data-slot="checklist-row"
              data-done={finished ? 'true' : undefined}
              className="hover:bg-muted/60 flex items-start gap-2 rounded-md px-1 py-1 transition-colors duration-fast ease-out"
            >
              {/*
               * The completion control, and its accessible name is the task's own
               * title rather than a separate sentence. That is deliberate: the
               * control names the thing it acts on, so a reader who tabs through a
               * queue hears each task once rather than hearing a label and then the
               * task. A caller whose title is a node rather than a string passes
               * `taskLabel` instead, because a name has to be a string.
               */}
              <Checkbox
                data-slot="checklist-toggle"
                checked={finished}
                onCheckedChange={(next) => {
                  onToggle(task, next)
                  const after = next ? done + 1 : done - 1
                  setSaid(
                    next ? completedLabel(task, after, total) : uncompletedLabel(task, after, total),
                  )
                }}
                aria-label={typeof task.title === 'string' ? task.title : undefined}
                className={TOGGLE}
              />

              <div data-slot="checklist-content" className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  data-slot="checklist-title"
                  className={cn(
                    'min-w-0 text-sm',
                    finished ? 'text-muted-foreground line-through' : 'text-foreground',
                  )}
                >
                  {task.title}
                </span>

                {task.description === undefined ||
                task.description === null ||
                task.description === false ? null : (
                  <span
                    data-slot="checklist-description"
                    className="text-muted-foreground min-w-0 text-sm"
                  >
                    {task.description}
                  </span>
                )}

                {/*
                 * The metadata line, drawn only when the task has some.
                 *
                 * A priority is a badge and not a colour on the row, because it is a
                 * fact about the task rather than a state of it, and a coloured row
                 * reads as a state. `urgent` sets its own fill and therefore its own
                 * ink, which is the Stated Ink Rule read from this side: a tint with
                 * an inherited colour is the same task on the page ground and inside
                 * a filled panel.
                 */}
                {raised === false && task.due === undefined ? null : (
                  <span data-slot="checklist-meta" className="flex flex-wrap items-center gap-2">
                    {raised ? (
                      <span
                        data-slot="checklist-priority"
                        aria-hidden="true"
                        className={cn(
                          'inline-flex w-fit items-center rounded-md border px-1.5 py-0.5 text-xs font-medium',
                          urgent
                            ? 'border-destructive/30 bg-destructive/10 text-destructive'
                            : 'text-muted-foreground border-border',
                        )}
                      >
                        {priorityLabel(task.priority as ChecklistPriority)}
                      </span>
                    ) : null}

                    {task.due === undefined ? null : (
                      <span data-slot="checklist-due" className="text-muted-foreground text-xs">
                        <RelativeTime
                          data-slot="checklist-due-time"
                          date={task.due}
                          renderRelative={task.dueLabel}
                        />
                      </span>
                    )}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/*
       * The add affordance: a field and a control on one line, inside a real form.
       *
       * `preventDefault` on the submit is what stops the browser navigating, and it
       * is the whole of what this Component does to the event: the typed title goes
       * to `onAdd` and the field clears, and everything else about the new task is
       * the caller's.
       */}
      <form
        data-slot="checklist-add"
        onSubmit={(event) => {
          event.preventDefault()
          const title = draft.trim()
          if (title === '') {
            setSaid(emptyLabel)
            fieldRef.current?.focus()
            return
          }
          onAdd(title)
          // The count is passed as it will be after the caller's array has caught
          // up, because at this moment it has not: the Component cannot read the
          // new total from `tasks` and must not invent one either.
          setSaid(addedLabel(title, total + 1))
          setDraft('')
          fieldRef.current?.focus()
        }}
        className="flex items-center gap-2"
      >
        <Input
          ref={fieldRef}
          id={fieldId}
          data-slot="checklist-add-field"
          name="task"
          value={draft}
          placeholder={addPlaceholder}
          aria-label={addFieldLabel}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button data-slot="checklist-add-control" type="submit" variant="outline" size="sm">
          <PlusIcon aria-hidden="true" />
          {addLabel}
        </Button>
      </form>

      {/*
       * The three transitions, announced. Mounted from its content rather than held
       * empty, for the reason `LifecycleButton` states at length: a live region
       * sitting on the page permanently announces unrelated changes of its
       * ancestors, which is the noise the region exists to avoid as well as to
       * cause.
       */}
      <LiveRegion className="sr-only" politeness="polite">
        {said}
      </LiveRegion>
    </div>
  )
}

export { Checklist }
