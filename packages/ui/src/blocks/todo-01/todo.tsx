'use client'

import { useId, type ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { CtaLink } from '../../components/ui/cta-link'
import { Checkbox } from '../../components/ui/checkbox'
import { Progress } from '../../components/ui/progress'
import { RelativeTime } from '../../components/ui/relative-time'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * How a task is arranged, and the two questions the choice answers.
 *
 * `list` puts everything about a task under its title, so a task can carry a note
 * and a reading and an owner and still read as one block. `checklist` puts the
 * title on a line of its own and the owner, the moment and the mark at the
 * trailing edge of it, so a reader scanning the left edge of a long list sees
 * titles and a column of names without reading a paragraph to do it.
 *
 * The difference is arrangement and not content. Both draw the same fields and
 * neither drops one, because a variant that hid a field would be a variant that
 * decided which facts matter, and that is a claim about the caller's work rather
  * than a shape. What a checklist costs is the note: it is the piece that goes
  * second when the row runs out of width, so a list of tasks with long notes is a
  * list, and a list of short ones is a checklist.
  *
  * **The type is `Todo01Form` and the prop is `variant`, and the two names
  * differing is the surface gate working rather than a slip.**
  * `check-surface.mjs` refuses to let a public entry export a name ending in
  * `Variant`, because in this package that shape names a cva map: a recipe a
  * consumer could read and compose with. This union is the two arrangements the
  * Block can draw and it is named for the arrangement. The prop keeps the name
  * `variant` because a Component is allowed to take one. `ChartForm` and
  * `ContentGrid01Form` are named the same way for the same reason.
  */
export type Todo01Form = 'list' | 'checklist'

/** One task in a list. */
export type Todo01Task = {
  /** The task's stable key within the list. */
  id: string
  /**
   * What the task is, in the words a reader would use about it in conversation.
   *
   * It is also the checkbox's own `<label>`, which is the whole of the keyboard
   * story on this Block: see the Component JSDoc.
   */
  title: string
  /**
   * One line about the task, under its title.
   *
   * A node because the honest second line of a task is not always a sentence: it
   * is a link, a quoted line, a code reference, a warning. The Block draws it in
   * the muted ink and never truncates it, because a truncated note on a task is a
   * note the reader has to open the task to read, which is a worse queue than one
   * that says less.
   */
  note?: ReactNode
  /** Who has it, in the product's own words. A person, a team, a role. */
  owner?: string
  /**
   * The owner's picture, when there is one.
   *
   * A `name` is required and the `src` is not, because the name is what the
   * fallback initials are made from and a face with no name beside it identifies
   * nobody. Both are the caller's: a task list that fetched a directory would be a
   * task list that had a data client in it.
   */
  ownerAvatar?: { src?: string; name: string }
  /**
   * When the task is wanted, in whichever of the three forms the caller holds it.
   *
   * Drawn through `relative-time`, so a number arrives as a date in the reader's
   * own locale and a string is handed to the platform untouched. The rejected
   * alternative was drawing the value as passed, which puts a raw epoch on the
   * page for every caller whose data layer holds milliseconds, and a due date
   * printed as an integer is the one field on a task list nobody can act on.
   */
  due?: number | string | ReactNode
  /**
   * The caller's own words for the moment, given the moment they passed.
   *
   * Optional, and used only when `due` is a value: it is the relative half, and
   * the absolute half is the platform's, which is the split `relative-time`
   * states at length. A caller who wants both halves in their own voice passes a
   * node as `due` instead, and this is not called.
   */
  dueLabel?: (due: number | string) => string
  /** Whether the task is finished. */
  done?: boolean
  /**
   * Where the task goes. Its presence makes the title's row carry a link beside
   * the title rather than the title itself, because a task's title is its checkbox
   * label and a link cannot be a label without taking the control away from the
   * reader.
   */
  href?: string
  /** The words on that link, and required whenever `href` is. */
  hrefLabel?: string
  /**
   * Whether the task is blocked, and the words for that.
   *
   * A mark and not a lock, and the reason is worth stating because the obvious
   * arrangement is a disabled checkbox: a control that has stopped asking is a
   * control the reader has stopped reading, and a task somebody unblocked two
   * minutes ago would need the page to re-render before its checkbox came back.
   * The Block marks the row and leaves the control live, and the caller's handler
   * decides what a blocked task may become.
   */
  blocked?: boolean
  /** The words for a blocked task, in the product's own vocabulary. */
  blockedLabel?: string
}

/**
 * The props a Todo01 takes.
 *
 * Every string is a prop and the Block ships none. There is no sample task, no
 * owner, no due reading, no progress sentence and no wording for an empty list,
 * and the absence of the first two is the sharpest version of the rule: a task
 * list is a claim about what a team has agreed to do, and a Block that shipped
 * three of them would be publishing somebody else's commitments.
 *
 * The last two members are a union rather than three independent optional props,
 * for the reason the authoring contract gives: `progressLabel` is required in one
 * shape and forbidden in the other, and an optional prop cannot say that. A
 * caller who turns the bar off must not be left holding a function nothing reads,
 * and a caller who leaves it on must not be able to forget the words.
 */
export type Todo01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title.
   *
   * Optional, because a task list is very often composed inside a page that
   * already owns a heading for it, and a Block that insisted on a second one
   * would put two `h2`s in the same place.
   */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The tasks, in the order a reader should meet them.
   *
   * Order is the caller's and the Block does not sort. A task list is very often
   * already ordered by the thing that produced it, and a Block that sorted by due
   * date would put an undated task last for no reason the reader can see, which is
   * the failure a hand-rolled list avoids by not sorting at all.
   */
  tasks: readonly Todo01Task[]
  /**
   * Called with a task's `id` and the state it is being changed to, when the
   * reader ticks or unticks its checkbox.
   *
   * A callback and not state the Block holds, for the reason the whole package
   * holds: a task list is the consumer's data and the consumer is the only one who
   * can persist a change to it. The Block reports the change and re-renders from
   * whatever the caller passes next, so a server-rendered list and a client store
   * drive the same Block. Omit it and the checkboxes render read-only, which is
   * the honest state for a list nobody can change.
   */
  onToggle?: (id: string, done: boolean) => void
  /**
   * What the Block renders in place of the list when there are none.
   *
   * Required and a node, for the reason it is required on every Block in this
   * package: an empty task list is a claim, and "nothing to do" is a different
   * claim in a product where the week is quiet and in a product where the query
   * failed.
   */
  empty: ReactNode
  /**
   * How a task is arranged. @defaultValue 'list'
   *
   * See `Todo01Form` for what the two questions are and what each costs.
   */
  variant?: Todo01Form
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
} & (
  | {
      /**
       * Whether the aggregate bar is drawn. @defaultValue true
       *
       * On by default, and the default is the decision: a task list whose progress
       * is not visible makes a reader count the ticked rows, and counting is the
       * one thing this Block can do for them for free.
       */
      showProgress?: true
      /**
       * The words for the aggregate, given how many are done and how many there
       * * are.
       *
       * Required whenever the bar is drawn, and the reason is the seam rather than
       * the sentence. This Block is a server Component until `onToggle` is passed
       * and a client Component after it, because a handler is a function and a
       * function is a piece of state. `Progress` is a client Component either way.
       * A function prop cannot cross from a server Component into a client one,
       * so `getAriaValueText` is not expressible from half of the callers this
       * Block has, and `valueText` is: the caller composes the words, the Block
       * counts the rows, and the bar announces a string across the boundary. That
       * rule is `Progress`'s own, and it is worth restating in every Block that
       * composes a client Component with a callback, because a caller who reaches
       * for `getAriaValueText` first will not find it.
       */
      progressLabel: (done: number, total: number) => string
    }
  | {
      /** Turn the aggregate bar off, for a list short enough to read as a whole. */
      showProgress: false
      /** Forbidden with the bar off, because a function nothing reads is a trap. */
      progressLabel?: never
    }
)

/**
 * The classes the two arrangements give the row, and the classes a finished task
 * gives its own text.
 *
 * A finished task is muted and struck through, and nothing else about it changes.
 * The two utilities are here rather than written on the elements because they are
 * one decision about one state, and three places that each decide it is three
 * places that can disagree about what a finished task looks like.
 */
const ROW: Record<Todo01Form, string> = {
  list: 'flex flex-col gap-1.5 py-4',
  checklist: 'flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5',
}

/** The moment half of a row, which is a value, a node, or nothing at all. */
function dueOf(task: Todo01Task): ReactNode {
  if (task.due === undefined) return null
  if (typeof task.due !== 'string' && typeof task.due !== 'number') return task.due
  return <RelativeTime date={task.due} relative={task.dueLabel?.(task.due)} />
}

/**
 * The two-letter mark a face falls back to, from a name the caller already holds.
 *
 * Two letters and not three, because the circle this sits in is sixteen pixels
 * across and a third letter is a mark narrower than the gap between two of them.
 * The name is a caller's data, so this reads it and invents nothing: a name with
 * one word gives that word's first letter, because that is the only letter there
 * is.
 */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part.charAt(0))
  return letters.join('').toUpperCase()
}

/**
 * A task list: a checkbox, a title, a note, an owner, a moment and a link per
 * task, with an aggregate bar and no state of its own.
 *
 * **The checkbox is `checkbox.tsx` and a `div` with an `onClick` is not an
 * alternative, for the reason the Component JSDoc gives and the reason a keyboard
 * reader feels.** `Checkbox` owns its focus ring at full strength, it owns a hit
 * target that grows to 44 pixels on a coarse pointer, and it renders a hidden
 * native input beside itself so the whole thing submits and validates like a
 * checkbox in a form. A `div` with an `onClick` has none of those: it is not in
 * the tab order at all, it cannot be operated with Space, and a screen reader
 * announces a group of text rather than a control that can be changed. On a task
 * list that defect is not a nicety, because ticking a box is the only thing a
 * reader does with a task list, and a list whose every control is unreachable is a
 * list a keyboard user cannot use to do their job.
 *
 * **The title is the checkbox's `<label>`, and that is a decision about the hit
 * target as much as the name.** A bare sixteen pixel control is a control a reader
 * has to aim at, and a task list is a list of things people read on a phone
 * while walking. Labelling the control with the whole title makes the target the
 * width of the task, which is the single cheapest thing this Block does for a
 * coarse pointer, and it makes the accessible name the same text the row shows, so
 * the two cannot drift. The rejected arrangement is an `aria-label` per checkbox,
 * which announces a sentence the reader cannot see on the page.
 *
 * **The aggregate bar is `Progress` with `valueText` and not with
 * `getAriaValueText`, and the reason is the server boundary rather than taste.**
 * This Block is a server Component until `onToggle` is passed and a client
 * Component after it, because a handler is a function, a function is a piece of
 * state, and state is a client module. `Progress` is a client Component either
 * way. A function prop from a server Component into a client Component is a build
 * error rather than a warning, so `getAriaValueText` is not expressible from half
 * of the callers this Block has, and a Block that shipped it would be a Block
 * half its callers cannot render. `valueText` is the form that crosses: the
 * caller composes the words, the Block counts the rows it was given, and the bar
 * announces a string. The rule is worth stating once per Block that composes a
 * client Component with a callback, and this is the place it cost somebody a
 * release.
 *
 * **The words travel as a string and are not drawn a second time.** `valueText`
 * is what the bar announces, and printing the same sentence beside the bar means
 * a screen reader reads it once as the bar's value and once as loose text on the
 * page. A caller who wants the aggregate visible as well as announced passes their
 * own node above the list, which is a sentence they can place, style and
 * translate.
 *
 * **A finished task stays in the list, struck through and muted, and it is still
 * reachable by keyboard.** Both halves of that are the decision. Hiding a finished
 * task makes a list look shorter every time it works, which is a queue that
 * rewards the reader for not checking it, and a completed task a reader cannot
 * find is a task they will redo: the failure mode is not an aesthetic complaint
 * about a strikethrough, it is duplicated work. So the row stays, the checkbox
 * stays focusable and unticked-able, and the two utilities are the whole of the
 * change. The cost is real and worth naming: a long list of finished tasks is a
 * list a reader has to scan past, and the answer is the consumer's own filter,
 * which is the only one who knows whether the reader wanted the history on the
 * page.
 *
 * **Nothing here holds the state, and the checkboxes say so when nobody is
 * listening.** With no `onToggle` the control renders `readOnly` rather than
 * `disabled`, which is a real distinction: a disabled checkbox is skipped by the
 * tab order and announced as unavailable, so a list of them tells a keyboard
 * reader that the whole list is broken, while a read-only one is focusable and
 * announces its state. A list nobody can change is a list someone is reading, and
 * reading is a use.
 *
 * It is a client Component, and the reason is the callback rather than the state,
 * as in every other Block in this wave. `onToggle` is a function, a function is a
 * piece of state, and state is a client module: a server component cannot hand an
 * event handler to a `<button>`, so a caller rendering this from a server
 * component would get a list whose checkboxes do nothing. The rest of the
 * rendering is a list and a bar, which is the price of that and a small one.
 */
export function Todo01({
  eyebrow,
  title,
  description,
  tasks,
  onToggle,
  empty,
  variant = 'list',
  headingLevel = 'h2',
  className,
  showProgress = true,
  progressLabel,
}: Todo01Props) {
  const uid = useId()

  for (const task of tasks) {
    if (task.href !== undefined && task.hrefLabel === undefined) {
      throw new Error(
        `Todo01: the task "${task.title}" declares an href with no hrefLabel, so the row would carry a ` +
          'link with no words of its own and a reader would not know what activating it does. Pass the ' +
          'words that say what it does, or omit the href.',
      )
    }
    if (task.blocked === true && task.blockedLabel === undefined) {
      throw new Error(
        `Todo01: the task "${task.title}" is blocked and no blockedLabel, so the mark beside it would be ` +
          'a coloured dot with no sentence beside it. Pass the words for the state, or drop the flag.',
      )
    }
  }

  // Counted from the array that is about to be rendered rather than from a second
  // pass, so a caller whose label disagrees with the page has a bug in their own
  // function rather than a Block that passed one number and drew another.
  const total = tasks.length
  const done = tasks.reduce((count, task) => count + (task.done === true ? 1 : 0), 0)

  if (total === 0) {
    return (
      <Section data-slot="todo-01" className={cn(className)}>
        {title === undefined ? null : (
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="mb-8"
          />
        )}
        <p data-slot="todo-01-empty" className="text-muted-foreground text-pretty">
          {empty}
        </p>
      </Section>
    )
  }

  return (
    <Section data-slot="todo-01" className={cn(className)}>
      {title === undefined ? null : (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-8"
        />
      )}

      {showProgress ? (
        <Progress
          data-slot="todo-01-progress"
          className="mb-6"
          value={done}
          max={total}
          valueText={progressLabel?.(done, total)}
        />
      ) : null}

      <ul data-slot="todo-01-list" data-variant={variant} className="flex flex-col">
        {tasks.map((task, index) => {
          const inputId = `${uid}-${index}`
          const finished = task.done === true

          const titleNode = (
            <label
              htmlFor={inputId}
              className={cn(
                'text-sm font-medium',
                finished ? 'text-muted-foreground line-through' : null,
              )}
            >
              {task.title}
            </label>
          )

          const meta = (
            <div
              data-slot="todo-01-meta"
              className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs"
            >
              {task.ownerAvatar === undefined && task.owner === undefined ? null : (
                <span
                  data-slot="todo-01-owner"
                  className="text-muted-foreground inline-flex min-w-0 items-center gap-1.5"
                >
                  {task.ownerAvatar === undefined ? null : (
                    <Avatar className="size-5">
                      {task.ownerAvatar.src === undefined ? null : (
                        <AvatarImage src={task.ownerAvatar.src} alt="" />
                      )}
                      <AvatarFallback>{initialsOf(task.ownerAvatar.name)}</AvatarFallback>
                    </Avatar>
                  )}
                  {task.owner ?? task.ownerAvatar?.name}
                </span>
              )}

              {task.due === undefined ? null : (
                <span data-slot="todo-01-due" className="text-muted-foreground">
                  {dueOf(task)}
                </span>
              )}

              {task.blocked === true && task.blockedLabel !== undefined ? (
                <Status size="sm" tone="warning" label={task.blockedLabel} />
              ) : null}

              {task.href === undefined || task.hrefLabel === undefined ? null : (
                <CtaLink href={task.href} variant="ghost" size="sm">
                  {task.hrefLabel}
                </CtaLink>
              )}
            </div>
          )

          return (
            <li
              key={task.id}
              data-slot="todo-01-task"
              data-done={finished ? 'true' : undefined}
              data-blocked={task.blocked === true ? 'true' : undefined}
              className={cn(
                'border-border flex items-start gap-3 border-b first:border-t',
                ROW[variant],
              )}
            >
              <Checkbox
                id={inputId}
                checked={finished}
                readOnly={onToggle === undefined}
                onCheckedChange={
                  onToggle === undefined ? undefined : (checked) => onToggle(task.id, checked)
                }
                className="mt-0.5"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {/*
                 * The title as the control's own label, so the accessible name is
                 * the text on the page and the hit target is the width of the task
                 * rather than sixteen pixels of it.
                 */}
                {titleNode}

                {/*
                 * The two arrangements differ only in where the trailing pieces
                 * sit. In a checklist they are on the title's own line at its end,
                 * so a reader scanning the left edge sees titles and a column of
                 * names; in a list they are on the line under the note, so a task
                 * with a paragraph under it reads as one block. Nothing is dropped
                 * either way, which is the whole difference between the two.
                 */}
                {variant === 'checklist' ? meta : null}

                {task.note === undefined ? null : (
                  <span className="text-muted-foreground text-pretty text-sm">{task.note}</span>
                )}

                {variant === 'list' ? meta : null}
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export default Todo01
