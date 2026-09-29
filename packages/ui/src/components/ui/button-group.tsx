import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** The props the ButtonGroup accepts. */
export interface ButtonGroupProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The buttons, or the controls, in the order a reader meets them.
   *
   * Children rather than an array of entries, because a ButtonGroup's whole claim
   * is that it arranges whatever the caller composed. It does not decide what a
   * button says, which variant it wears, or what it does; it draws the frame
   * around them and removes the frames they would otherwise each draw.
   */
  children?: ReactNode
  /**
   * The accessible name of the group.
   *
   * Required rather than defaulted, and it is the one prop a caller cannot skip.
   * A row of three buttons is announced as three buttons and nothing else, so a
   * reader who tabs into a toolbar of alignment controls cannot tell which of the
   * four toolbars on the page they are in. Prism does not know what the caller's
   * buttons are for, so the name is the caller's word.
   */
  label: string
  /** The direction the group runs in. @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Layout only. */
  className?: string
}

/**
 * Related controls joined as one, with the focus ring drawn once around them.
 *
 * **The ring is the reason this is a Component and not a flex row.** Three
 * buttons side by side each draw their own focus ring, so a reader tabbing along
 * the row sees three separate rings marching across a control that reads as one
 * thing, and the reader has to work out each time whether the thing they are in
 * has changed. Here the group takes the ring: the buttons suppress their own, and
 * the group draws a single ring around its whole bounds when focus is inside it.
 * The reader sees one indicator around one control, and it moves as a unit.
 *
 * The cost is stated rather than hidden: a ring drawn around a group is on the
 * group, so it is visible whether the focus arrived from the keyboard or from a
 * click. That is a real trade, and it is the right one here, because a group of
 * mutually exclusive or sequential actions is nearly always operated from the
 * keyboard and the ambiguity of a ring on a click is much cheaper than three rings
 * marching. A caller who needs the per-button indicator back puts the buttons in a
 * `Toolbar` instead, which is a different Component with a different claim.
 *
 * **The frame is drawn by the group and the inner frames are removed.** A
 * ButtonGroup carries the border and the radius; each button inside drops its own
 * border and its own corner radius, and the first and last keep the outer corners.
 * The alternative, letting each button keep its own border, gives a row with a
 * double rule between every pair and a gap at both ends, which is the reason
 * grouped toolbars so often look like a row of separate buttons that happen to be
 * near each other.
 *
 * **It is a `group` with a name, not a `toolbar`.** A toolbar is a set of controls
 * that operates on a document, with its own arrow-key model, and a ButtonGroup is
 * usually a set of related actions rather than an editing surface. The `group`
 * role says "these belong together" and stops there, which is the claim being
 * made. A caller whose buttons operate on a document and want the arrow keys
 * composes Prism's `Toolbar` and does not use this.
 *
 * It is a server Component. It holds no state, reads no context and attaches no
 * handler, so a row of controls in a static page costs no JavaScript, and the
 * focus behaviour is two descendant variants of the group's own class string.
 */
function ButtonGroup({
  className,
  children,
  label,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      data-orientation={orientation}
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        // The ring belongs to the group, at full strength, and it is drawn when
        // focus is anywhere inside it. This is the whole Component: without this
        // the buttons beside it draw their own and the reader sees three rings
        // crossing one control.
        'focus-within:ring-ring focus-within:ring-[3px]',
        'rounded-md',
        className,
      )}
      {...props}
    >
      {/*
       * The join. The negative margin collapses each button's own border onto its
       * neighbour's, so the divider between two buttons is one rule rather than
       * two, and the first and last keep the group's radius while the ones between
       * them square off. The button's own ring is suppressed, because the group
       * is drawing it and two rings around the same control is a reader being told
       * two things about one focus.
       */}
      <div
        data-slot="button-group-inner"
        className={cn(
          'flex items-stretch',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          '[&>*]:rounded-none',
          orientation === 'vertical'
            ? '[&>*+*]:-mt-px [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md'
            : '[&>*+*]:-ms-px [&>*:first-child]:rounded-s-md [&>*:last-child]:rounded-e-md',
          // The ring is the group's, and only the group's. A button that drew its
          // own as well would put a second indicator on the same control.
          '[&>*]:focus-visible:outline-none',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { ButtonGroup }
