import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The five fills a pill is drawn in, and the same five a tag is drawn in.
 *
 * The five are the semantic contract's, and each is a fill with a matched ink, so
 * a pill in a scoped pack boundary re-inks with everything around it. `info` is
 * the brand hue at a tenth's strength with a border at four tenths, because the
 * contract publishes no information role and inventing one here would be a second
 * place a new colour gets decided.
 *
 * **The table is written out rather than imported from `tag-group`, and the cost
 * of that is a change in one place being a change in the other.** A shared module
 * would be a third Item with no job of its own, or a file under the package's
 * internal `lib`, where a new declaration has to be declared in the surface gate
 * before it can ship, so the only two shapes that reach a consumer without a
 * change somewhere else are a duplicate table and a new surface. The duplicate is
 * the cheaper of the two, and the drift it risks is bounded: five lines, all of
 * which name contract roles rather than a chosen colour, and every one of which
 * the contrast gate already measures.
 *
 * `neutral` is the answer when there is nothing to say, and it is the default for
 * that reason rather than because it is the least interesting.
 */
export type PillTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive'

/** The fill each tone is drawn in, from the semantic roles and no other. */
const PILL_TONE = {
  neutral: 'bg-secondary text-secondary-foreground border-transparent',
  info: 'bg-brand-ink/10 text-foreground border-brand-ink/40',
  success: 'bg-success text-success-foreground border-transparent',
  warning: 'bg-warning text-warning-foreground border-transparent',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
} as const

/**
 * The two steps a pill is drawn at, as frame and label together.
 *
 * The pair moves as one because a pill whose label is set at one step and padded
 * at the other is a chip with a hole in the middle of it: the extra leading
 * reads as a mistake in the fill rather than as room for the label. `sm` is for a
 * dense table row, a filter summary and a chart legend, and `md` is for a row a
 * reader is meant to read. There is no third step because a chip set larger than
 * `md` is a `Badge` at a different size and a `Badge` is the Component for a
 * status the system decided.
 */
const PILL_SIZE = {
  sm: { frame: 'gap-1 px-2 py-0.5 text-xs', label: 'font-medium' },
  md: { frame: 'gap-1.5 px-2.5 py-1 text-sm', label: 'font-medium' },
} as const

/** The props a `Pill` accepts. */
export type PillProps = Omit<ComponentProps<'span'>, 'children'> & {
  /**
   * What the chip says, in the words a reader would use about it.
   *
   * Required, and a node rather than a string because a pill is often a mark and
   * a word, or a word and a count, and a `string` prop would make a caller wrap
   * their own mark in a string to smuggle it through. A node also means the
   * element a sighted reader reads is the element a screen reader names the pill
   * by, with no second copy of the sentence to keep in step.
   */
  label: ReactNode
  /**
   * The fill the pill is drawn in. @defaultValue 'neutral'
   *
   * The tone is the caller's because it is a claim about the value rather than
   * about the design system. A tier, a recipient, a filter, a licence key and a
   * network segment are all pills, and which of them deserves the destructive fill
   * is the caller's judgement about their own product.
   */
  tone?: PillTone
  /**
   * The drawn step of the pill. @defaultValue 'md'
   *
   * See `PILL_SIZE` for why there are two and not three.
   */
  size?: keyof typeof PILL_SIZE
  /**
   * A node before the label, for a mark that is not the label: an avatar, a
   * monogram, a severity dot, a `Status`.
   *
   * A slot rather than an `icon` prop, for the reason the whole package uses
   * slots for marks. Prism's icon lane is Lucide and its mark lane is the
   * caller's own assets, and an `icon` prop would force one of the two on every
   * caller while refusing the other. The slot is also the reason a caller can put
   * something interactive at the leading edge, which a fixed `size-4` glyph could
   * never hold.
   */
  leading?: ReactNode
  /**
   * A node after the label, for whatever comes last: a count, a unit, a state, or
   * a control the caller owns.
   *
   * **The remove affordance is here and not drawn by this Component, and that is
   * the decision this Item exists to be different about.** `Tag` draws an X and
   * requires a name for it, because a tag is by definition a value in a set the
   * reader can take back and one affordance is the whole of that. A pill is one
   * value on its own, and a value on its own has at least as many reasons to end
   * in something that is not a cross: a count of what the pill counts, a state
   * the value is in, a link to the record it names. So the slot is a slot, the
   * caller puts their own `Button` in it, and that control carries its own
   * accessible name, its own confirmation and its own coarse-pointer target. The
   * cost is stated rather than hidden: Prism cannot check that the control in the
   * slot has a name, which is the one thing `Tag` enforces by throwing, so a
   * caller who puts an unlabelled button there ships an unlabelled button.
   */
  trailing?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * One small fully rounded chip, holding one value, with a slot at each end.
 *
 * **It is not a `Tag`, and the two differences are both load bearing rather than
 * cosmetic.** The first is the shape. A pill is fully rounded, and full rounding
 * is the one radius a pack boundary is allowed to sit on, because
 * `--radius-sm` through `--radius-4xl` are all computed from the pack's own
 * `--radius` by multiplication: a `rounded-md` chip carrying a `data-pack`
 * boundary is a chip whose corners move with its colour, and a row of six of them
 * shows five different corner radii for one pack. `Tag` is a `rounded-md` chip
 * because it is a chip in a running row, where a capsule per chip reads as a row
 * of buttons, and a pill is a capsule because it is one value standing on its own
 * and because the shape is the reason a `PackSwatch` and a pill can sit in the
 * same row without one of them moving. The second is the two slots, which is
 * where the cross of a `Tag` lives, and the argument for both is on `trailing`.
 *
 * **It is a single pill and not a group, and there is no `PillGroup` to be
 * asked for later.** A set of values is `TagGroup`, which wraps, which labels
 * itself, which owns the remove handler and which is a client Component the
 * moment that handler is passed. A pill holds one value and the arrangement
 * around it is the caller's, so a table cell, a chart legend, a summary line and
 * a card header each get a pill and none of them gets a role or a heading nobody
 * asked for. The cost is that a caller with six pills writes the row, and writes
 * the gap and the wrap and the accessible name for it, which is the arrangement
 * and not the chip.
 *
 * **The label truncates rather than wrapping, and the pill is capped at the
 * width of its container.** A chip is read as one thing, and a chip that runs to
 * three lines is a paragraph with a fill round it. Truncating costs the reader
 * the tail of a long value, and the answer is the caller's: a value too long for
 * a chip is a value that wants a `Table` cell or a `Tooltip` beside the pill
 * rather than a pill with a smaller font.
 *
 * The clipping is on the label and not on the pill, which is a decision with a
 * visible consequence. A pill that also carried `overflow-hidden` would cut the
 * indicator of a control in the `trailing` slot in half, and the indicator gate
 * cannot see that because it reads a class string and not a cascade. So the pill
 * clips nothing, the label clips itself, and a control at either end draws its
 * ring outside the fill where a reader can see all of it. This Component owns no
 * indicator of its own because it renders nothing a reader can reach: the mark and
 * the value are the caller's, and so is any control either of them turns out to
 * be.
 *
 * **The tone defaults to `neutral` and every tone states its own ink.** The
 * default is the tone for a value with nothing to say about it, which is the
 * common case, and the pairs are the same pairs `tag-group` measures, so a pill
 * never becomes unreadable by being moved onto another surface. The cost is
 * visible: in a pack whose brand hue is its emphasis hue, an `info` pill and an
 * emphasised mark are the same colour, and the words inside the pill are what
 * separate them.
 *
 * **It draws no heading and no region.** A pill is a chip, and a chip is not a
 * titled surface, so there is nothing here for `SectionHeading` to be right about
 * and nothing to pass a `childLevel` to. A caller who needs the row to announce
 * as a group writes the `role` and the name on their own element around it, which
 * is the arrangement rather than the chip.
 *
 * It is a server Component: no hook, no state, no effect and no handler, so a
 * page carrying two hundred pills ships no JavaScript at all. That is the whole
 * reason it is a Component rather than a row inside `TagGroup`, and the cost it
 * buys is the one on `trailing`: the pill cannot offer the affordance a caller
 * most often wants, because offering it would mean shipping a handler and a
 * client runtime for a chip.
 */
function Pill({
  label,
  tone = 'neutral',
  size = 'md',
  leading,
  trailing,
  className,
  ...props
}: PillProps) {
  const drawn = PILL_SIZE[size]

  return (
    <span
      data-slot="pill"
      data-tone={tone}
      className={cn(
        'inline-flex max-w-full items-center rounded-full border',
        drawn.frame,
        PILL_TONE[tone],
        className,
      )}
      {...props}
    >
      {leading === undefined || leading === null || leading === false ? null : (
        /*
         * The leading slot, and it does not give way. A mark that is squeezed is a
         * mark that no longer reads, so both slots are `shrink-0` and the label is
         * the part that gives way: it is the only thing here whose content can be
         * abbreviated, and a mark a reader cannot recognise is worse than a value
         * whose tail is cut.
         */
        <span data-slot="pill-leading" className="flex shrink-0 items-center">
          {leading}
        </span>
      )}

      <span data-slot="pill-label" className={cn('min-w-0 truncate', drawn.label)}>
        {label}
      </span>

      {trailing === undefined || trailing === null || trailing === false ? null : (
        <span data-slot="pill-trailing" className="flex shrink-0 items-center">
          {trailing}
        </span>
      )}
    </span>
  )
}

export { Pill }
