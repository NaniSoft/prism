import type { ComponentProps, ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { cn } from '../../lib/utils'

/**
 * The three sizes a group is drawn at, as the authored `size-*` and `text-*`
 * values rather than as one number.
 *
 * A group is read as one thing, so the whole group takes one size, and a caller
 * who sized each disc through `className` would be able to draw a group of five
 * different heights, which is not a group. The pair is authored together for the
 * same reason `ProductMark` keeps its mark and its name in one table: the
 * initials have to stay legible inside the disc, and a size that is right for the
 * disc is wrong for the letters.
 */
const SIZES = {
  sm: { root: 'size-6', ink: 'text-mono' },
  md: { root: 'size-8', ink: 'text-xs' },
  lg: { root: 'size-10', ink: 'text-sm' },
} as const

/**
 * How many discs a group shows before the rest become a count.
 *
 * Four, and the number is a reading decision rather than a fitting one. A group
 * of four discs is narrow enough to sit beside a name, a column, or a button
 * without pushing it, and a fifth disc is where a row of faces stops being a
 * summary and starts being a list the reader has to look at. A caller who wants
 * a different number passes `max`, and pays for it in width.
 */
const DEFAULT_MAX = 4

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. This is Prism deriving a value from the caller's data, not Prism
 * choosing a face: the fallback is the person's own initials, so a reader who
 * cannot see the photograph still recognises the name beside it. The alternative,
 * a silhouette, is a picture of nobody and tells a reader nothing about who they
 * are looking at, and the cost of the derivation is stated rather than hidden: a
 * name of one letter, a name in a script with no case and no word boundaries, and
 * a name whose initials collide with another person's are all cases the rule does
 * not cover, and a caller who cares about any of them passes their own node
 * through the `avatars` slot instead.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/** The props an `AvatarGroup` takes. */
export type AvatarGroupProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * The people, in the order the caller wants them shown.
   *
   * A name per person and an optional image. The name is required because it is
   * what the initials are derived from, what the image's alternative text says,
   * and what a caller who has no photograph still has: a disc with no name behind
   * it is a shape, and a shape is not a person.
   */
  avatars: readonly {
    /** The person's image. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is also the initials' source. */
    name: string
  }[]
  /**
   * The trailing slot, for a control that belongs to the whole group rather than
   * to one person: an invite, a count of the rest, a manage link.
   *
   * After the count rather than inside it, because a control inside the count is
   * a control whose size is the count's size, and a group whose count is the
   * thing a reader presses is a control pretending to be a summary.
   */
  children?: ReactNode
  /**
   * The drawn size of every disc in the group, so a set shows one size rather
   * than a mix.
   *
   * @defaultValue 'md'
   */
  size?: keyof typeof SIZES
  /**
   * The number of discs shown before the rest become a count.
   *
   * @defaultValue 4
   */
  max?: number
  /**
   * The sentence the count is read as, given the number of people it stands for.
   *
   * Required whenever `max` is set, and not defaulted, for a reason that is about
   * the number and not about the language: a count is a numeral, and a screen
   * reader reading a bare "3" out of a row of faces has been told a quantity and
   * nothing about what it is a quantity of. "3 more" is a different piece of
   * information, and it is also a sentence whose wording is the consumer's, in the
   * consumer's language, with the consumer's plural rules. Prism will not ship
   * that sentence, so the prop is a function of the count and there is no default
   * to fall back on. When truncation happens with no `overflowLabel`, the badge is
   * the bare number, which is a state the caller chose by not passing one.
   */
  overflowLabel?: (count: number) => string
  /**
   * Which end of the row the topmost disc sits at.
   *
   * Off by default, so the first person in `avatars` is the one whose whole disc
   * is visible and whose face is not cut in half by its neighbour. Turn it on when
   * the array is sorted so that the most recent or the most senior is last, which
   * is the common shape of a members list, and the reader expects to be able to
   * see the person who matters most rather than the one who happens to be first.
   */
  reverse?: boolean
  /** Layout only, exactly as on every Component. */
  className?: string
} & (
  | {
      /**
       * How many discs to show, with the sentence the count is read as.
       *
       * A union rather than two independent optionals, because the sentence is
       * required in exactly the shape where truncation is possible and meaningless
       * in the shape where it is not, and one optional prop set cannot say that.
       */
      max: number
      overflowLabel: (count: number) => string
    }
  | {
      /**
       * No explicit cap, so no count can appear and no sentence is owed.
       *
       * Every disc is drawn, which is right for a short set and wrong for a long
       * one. A caller who knows the set is long passes `max` and pays for the
       * sentence.
       */
      max?: never
      overflowLabel?: (count: number) => string
    }
)

/**
 * A row of overlapping discs with a count for the rest, built on `Avatar`.
 *
 * **The discs are `Avatar`, `AvatarImage` and `AvatarFallback`, and the fallback
 * is the caller's initials rather than a silhouette.** That is the whole reason
 * this is a Component rather than a row of `div`s: the loading state, the missing
 * image, the failed image and the ring that separates two overlapping discs are
 * four things `Avatar` already holds to one standard, and a hand-written stack
 * gets one of them wrong in a way no test on the stack would notice. A group's
 * fallback is the one place a silhouette is tempting, because most of the group
 * may have no photograph, and it is refused here for the reason it is refused on a
 * single avatar: a picture of nobody is not a person, and a reader who has been
 * shown a row of identical silhouettes has learned nothing about anybody in it.
 *
 * **The order is the caller's, because a group of five people has no natural
 * order and which of them is visible is a decision rather than a fact.** A set of
 * members has no first member; it has an owner, or a most recent signer, or the
 * alphabetical result of a directory query, and each of those is a claim about
 * importance that only the consumer can make. So `avatars` is rendered in the
 * order it arrives and the first `max` are the ones shown, and Prism does not
 * sort, does not rotate, and does not pick a "representative" to lead. The cost
 * is stated rather than hidden: a caller who passes an unordered array gets an
 * arbitrary subset, and a caller who wants the most important person shown has to
 * put them first, which is one line of `sort` in their own code and a decision
 * they are better placed to make than this Component is.
 *
 * **The separator between two discs is a ring in the page ground, and that is a
 * decision with a cost.** Overlapping discs need something between them, and the
 * two candidates are a gap and a ring. A gap cannot work here, because the whole
 * point of a group is that the discs touch, so the separator is drawn: a ring in
 * `background`, which is the surface a group is nearly always on. The cost is
 * that a group placed on a card or on the muted surface reads its separators
 * against the page ground rather than against the surface it is sitting on, and
 * the separator is then very slightly the wrong colour. The alternative, taking
 * the surface as a prop, would put a theming axis on a Component that currently
 * has none and would be a second thing for a consumer to keep in step with the
 * pack; a group whose separators matter more than its width should not be
 * overlapping.
 *
 * **The count is a badge, not a truncation of the array.** The people past `max`
 * are not drawn at all, and the badge says how many. A group that faded its last
 * discs out would show a reader a row that looks complete and is not, and a
 * reader who counted the faces would be wrong. The badge is a `div` with no role
 * and no name of its own: the number is spoken by the sentence the caller passed
 * to `overflowLabel`, and the badge is the place that sentence appears. When no
 * `overflowLabel` is given, the badge holds the bare number, and the JSDoc on the
 * prop says what that costs.
 *
 * **An empty set renders nothing, and the trailing slot goes with it.** The same
 * reason `ProductSwitcher` and `FactList` render nothing rather than an empty
 * frame: a row of zero discs is an outline around a gap. The cost is that a
 * caller whose "Manage" control should survive an empty set has to render it
 * outside the group rather than in its slot, and that is a real case in a members
 * panel where the last person left yesterday.
 *
 * It is a server Component. It holds no state, reads no context and attaches no
 * handler, and `Avatar` is a client Component whose only client work is measuring
 * whether an image has loaded, so a group of forty costs no JavaScript from this
 * module. A group the reader can act on belongs in the caller's own row: the
 * trailing slot is where a link or a button goes, and the discs themselves are not
 * controls.
 */
function AvatarGroup({
  avatars,
  children,
  size = 'md',
  max = DEFAULT_MAX,
  overflowLabel,
  reverse = false,
  className,
  ...props
}: AvatarGroupProps) {
  const drawn = SIZES[size]
  const shown = avatars.slice(0, max)
  const overflow = avatars.length - shown.length
  // Which disc sits on top of its neighbour. The stacking is the z-order, not the
  // order on screen, so the row still reads left to right in the array's order
  // while one end of it is the disc nothing overlaps.
  const raised = reverse ? shown.length - 1 : 0

  /*
   * An empty set renders nothing, for the reason `ProductSwitcher` and `FactList`
   * both render nothing: an empty row of zero-width discs is a frame with a gap
   * in it, and a caller with nothing to show is better served by the absence of
   * the group than by its outline. The trailing slot goes with it, and that is
   * stated rather than assumed: a caller whose "Manage" control should survive an
   * empty set renders it outside the group rather than in its slot.
   */
  if (avatars.length === 0) return null

  return (
    <div
      data-slot="avatar-group"
      className={cn('flex items-center [&>*+*]:-ms-2', className)}
      {...props}
    >
      {shown.map((person, index) => (
        <span
          // The name and the position together, because the array carries no id
          // and two people can share a name. A name alone would be a duplicate key
          // and a React warning, which is a warning about a control that looks
          // fine; the position is here because the alternative is worse, and a
          // caller who reorders a set with duplicate names is reordering data they
          // can distinguish and this Component cannot.
          key={`${person.name}-${index}`}
          data-slot="avatar-group-item"
          data-raised={index === raised ? 'true' : undefined}
          className={cn('relative', index === raised ? 'z-10' : '')}
        >
          <Avatar className={cn('ring-background ring-2', drawn.root)}>
            {person.src === undefined ? null : (
              <AvatarImage src={person.src} alt={person.name} />
            )}
            <AvatarFallback className={drawn.ink}>{initialsOf(person.name)}</AvatarFallback>
          </Avatar>
        </span>
      ))}

      {overflow > 0 ? (
        <span
          data-slot="avatar-group-overflow"
          className={cn(
            'bg-muted text-muted-foreground ring-background relative flex shrink-0 items-center justify-center rounded-full font-medium ring-2',
            drawn.root,
            drawn.ink,
          )}
        >
          {overflowLabel === undefined ? overflow : overflowLabel(overflow)}
        </span>
      ) : null}

      {children}
    </div>
  )
}

export { AvatarGroup }
