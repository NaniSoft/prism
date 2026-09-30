import { XIcon } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * One tag in a group, and the tone it is drawn in.
 *
 * The tone is the caller's because it is a claim about the tag rather than about
 * the design system: a skill, a recipient, a filter, and a licence key are all
 * tags, and which of them deserves the destructive fill is the caller's decision
 * about their own product. `neutral` is the answer when there is nothing to say,
 * and it is the default for that reason.
 */
export type TagGroupTag = {
  /**
   * The caller's own identity for the tag, and what the remove control reports.
   *
   * Required, and required as a string rather than as the label: two tags can
   * carry the same label, and a remove control that named the label would
   * announce two identical buttons and leave the reader to guess which one they
   * are on.
   */
  id: string
  /** What the chip says. A node, because a tag is often an avatar and a word. */
  label: ReactNode
  /** The fill the chip is drawn in. */
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'destructive'
}

/** The props a single Tag accepts. */
export interface TagProps {
  /** What the chip says. */
  label: ReactNode
  /** The fill the chip is drawn in. */
  tone?: TagGroupTag['tone']
  /**
   * Called when the reader presses the remove control.
   *
   * Omit it and the chip is read-only, which is a legitimate state rather than a
   * missing prop. See the note on `TagGroup` for the difference between a tag
   * and a badge.
   */
  onRemove?: () => void
  /**
   * The accessible name of the remove control, naming the tag it removes.
   *
   * Required whenever `onRemove` is given, and the Component throws without it
   * rather than drawing a button it cannot name.
   */
  removeLabel?: string
  /** Layout only. */
  className?: string
}

/** The props a TagGroup accepts. */
export interface TagGroupProps {
  /**
   * The tags, in the order a reader should meet them.
   *
   * Required, and order is the caller's because it is a claim about importance.
   * The group wraps onto the next line rather than truncating, so a set of
   * thirty tags is thirty tags and not the first eight.
   */
  tags: TagGroupTag[]
  /**
   * Called with a tag's `id` when the reader removes it.
   *
   * Omit it and the group is read-only, which is a legitimate state rather than a
   * missing prop: a set of tags that were applied for the reader rather than
   * chosen by them is a set of tags nobody can take back, and drawing a remove
   * control there would promise a freedom the field does not have.
   */
  onRemove?: (id: string) => void
  /**
   * The accessible name of one tag's remove control, given that tag's label.
   *
   * Required whenever `onRemove` is given, and a function rather than a string
   * for a reason Prism cannot design around: a tag's label is a node, so the
   * name of the control that removes it cannot be composed from it. A tag that
   * shows an avatar and a word has no string to interpolate, and one that shows
   * a word and a count has a count the reader needs to hear in the name of the
   * control that will take it away. The Component refuses rather than guessing,
   * because the guess is a nameless button in every locale but one.
   */
  removeLabel?: (label: ReactNode) => string
  /**
   * The group's own name, drawn above the tags and used as its accessible name.
   *
   * A node and not a string, so the same element that a sighted reader reads is
   * the one a screen reader names the group by. Without it the group is
   * announced as an unlabelled group, which tells a reader nothing about why
   * these particular tags are collected together.
   */
  label?: ReactNode
  /**
   * What to draw when there are no tags.
   *
   * An empty group with no `empty` renders nothing at all, which is the same
   * choice `FactList` makes: a bordered box with a heading above it and nothing
   * inside it reads as a rendering failure rather than as an absence. Never a
   * placeholder chip: a chip that is not a tag, drawn where tags go, is a thing
   * a reader tries to remove.
   */
  empty?: ReactNode
  /** Layout only. */
  className?: string
}

/**
 * The five fills a chip is drawn in, and nothing else.
 *
 * A tone names an intent and every one of them is a semantic utility, so a chip
 * in a scoped pack boundary re-inks with everything around it. `info` is the
 * brand hue at a tenth's strength with a border at four tenths, because the
 * contract publishes no information role and inventing one here would be a
 * second place a new colour gets decided.
 */
const TAG_TONE = {
  neutral: 'bg-secondary text-secondary-foreground border-transparent',
  info: 'bg-brand-ink/10 text-foreground border-brand-ink/40',
  success: 'bg-success text-success-foreground border-transparent',
  warning: 'bg-warning text-warning-foreground border-transparent',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
} as const

/**
 * The remove control, drawn once and shared by the group and the lone chip.
 *
 * The ink is left to the chip's tone: the control changes its opacity and its
 * ring and never its colour, because a control that has to know which of five
 * fills it is sitting on is a control whose contrast has to be checked five
 * times and is right in none of them by default.
 *
 * On a coarse pointer the control takes the 44px floor and the chip grows to
 * hold it, so a row of tags on a phone is a row of 44px pills. That is the price
 * of the floor and it is paid visibly: the alternative is a 16px target sitting
 * 4px from a label the reader also wants to press.
 */
const REMOVE_CONTROL =
  'inline-flex size-4 shrink-0 items-center justify-center rounded-sm opacity-70 outline-none transition-opacity duration-fast ease-out pointer-coarse:size-11 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A wrapping row of tags the reader chose, each of which can be taken back.
 *
 * **A Tag is what the reader chose; a Badge is what they are told.** That is the
 * whole difference between this and `badge.tsx`, and the remove control is all
 * of it. A badge carries a status the system decided: a count, a plan name, a
 * licence tier. A tag carries something the reader picked and can un-pick, and
 * the control that un-picks it is the reason the two are different Components.
 * Folding them together would mean either a badge with a remove control on it,
 * which offers the reader a freedom the status does not have, or a tag with no
 * remove control on it, which is a badge that happens to be round.
 *
 * **A group with no `onRemove` is read-only, and that is a legitimate state.**
 * A set of tags applied for the reader, by an import, by a colleague or by a
 * saved filter, is a real thing, and the honest way to draw it is as tags with
 * no way to take one back. What is not honest is drawing the remove control
 * anyway and having it do nothing, so the control is drawn exactly when
 * `onRemove` is given. `TagGroup` throws if it is given one without `removeLabel`
 * rather than shipping a nameless button.
 *
 * **The remove control's name has to name the tag, so it cannot be composed.**
 * A tag's label is a node because a tag is often an avatar and a word, and the
 * accessible name of the control that removes it has to include that word. Prism
 * cannot interpolate a `ReactNode` into a sentence, so it asks for a function of
 * the label instead of a template it fills in. The cost is real: every caller
 * writes the sentence, once, in their own language, and a caller who has four
 * tag groups writes it four times or writes it once and reuses it.
 *
 * **The group wraps and the label sits on its own line.** Tags accumulate, and a
 * row that clipped or scrolled would hide tags a reader had chosen and cannot
 * see. A group that reaches the end of its container starts a new line, so the
 * set stays whole and the layout above it is the caller's to decide.
 *
 * It carries no directive. It holds no state: which tags exist and which one is
 * being removed are the caller's, so the group is the same code whether the
 * caller is a server component rendering a saved filter or a client component
 * holding a form.
 */
function TagGroup({
  tags,
  onRemove,
  removeLabel,
  label,
  empty,
  className,
}: TagGroupProps) {
  const generated = useId()
  const labelId = `${generated}-label`

  if (onRemove !== undefined && removeLabel === undefined) {
    throw new Error(
      'TagGroup: a removable group needs removeLabel, because the accessible name of a remove control has ' +
        'to name the tag it removes and this Component cannot compose a name from a ReactNode. Pass a ' +
        'function of the tag label, or drop onRemove for a group the reader cannot change.',
    )
  }

  if (tags.length === 0 && empty === undefined) return null

  return (
    <div
      data-slot="tag-group"
      role="group"
      aria-labelledby={label === undefined ? undefined : labelId}
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {label === undefined ? null : (
        <span
          id={labelId}
          data-slot="tag-group-label"
          className="text-muted-foreground w-full text-xs font-medium tracking-wide uppercase"
        >
          {label}
        </span>
      )}
      {tags.length === 0 ? (
        <p data-slot="tag-group-empty" className="text-muted-foreground text-sm">
          {empty}
        </p>
      ) : (
        tags.map((tag) => (
          <Tag
            key={tag.id}
            label={tag.label}
            tone={tag.tone}
            {...(onRemove === undefined
              ? null
              : {
                  onRemove: () => onRemove(tag.id),
                  // The throw above is what makes this call total. The compiler
                  // cannot see it, so the optional call is the shape that is
                  // honest at the type level and unreachable at the run level.
                  removeLabel: removeLabel?.(tag.label),
                })}
          />
        ))
      )}
    </div>
  )
}

/**
 * One tag on its own, for a caller placing a chip where no group is wanted.
 *
 * Everything said about a tag in `TagGroup` applies here, and the reason it is
 * exported at all is that a chip has uses a group does not cover: the selected
 * option in a combobox row, the one filter a panel is showing on its own, a
 * token in a text field's own row. Each of those is one chip, and wrapping a
 * single chip in a group would draw a label and a role the caller did not ask
 * for.
 */
function Tag({
  label,
  tone = 'neutral',
  onRemove,
  removeLabel,
  className,
}: TagProps) {
  if (onRemove !== undefined && removeLabel === undefined) {
    throw new Error(
      'Tag: a removable tag needs removeLabel, because a remove control with no accessible name is ' +
        'announced as a button and nothing else. Pass the name for this tag, or drop onRemove for a ' +
        'read-only chip.',
    )
  }

  return (
    <span
      data-slot="tag"
      data-tone={tone}
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        TAG_TONE[tone],
        className,
      )}
    >
      <span data-slot="tag-label" className="min-w-0 truncate">
        {label}
      </span>
      {onRemove === undefined ? null : (
        <button
          type="button"
          data-slot="tag-remove"
          aria-label={removeLabel}
          onClick={onRemove}
          className={REMOVE_CONTROL}
        >
          <XIcon className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}

export { TagGroup, Tag }
