import { ChevronDownIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** The props the NativeSelect accepts. */
/**
 * The props the NativeSelect accepts.
 *
 * `size` is this Component's own height in the package's scale, which is why the
 * native `size` attribute is omitted from the props it forwards. The two mean
 * different things: the native one is how many rows of the list the platform shows
 * at once, which on a single-selection select is a way of drawing a taller control,
 * and a single prop cannot be both without lying about which one a caller is
 * setting. A list box several rows tall is `Select`, or a `NativeSelect` inside a
 * `ScrollArea`.
 */
export interface NativeSelectProps extends Omit<ComponentProps<'select'>, 'children' | 'size'> {
  /** The options, as `option` or `optgroup` elements. */
  children?: ReactNode
  /**
   * The control's accessible name, when no visible label is used.
   *
   * A native select takes its name from an associated `label` like any other form
   * control, and Prism's `Field` puts one there. This is for the case where there
   * is no `Field` around it, and it is a prop for the reason every accessible name
   * in this package is one.
   */
  'aria-label'?: string
  /** The control's height. @defaultValue 'default' */
  size?: 'sm' | 'default'
  /** Layout only. */
  className?: string
}

/**
 * A native `<select>`, styled to match the rest of this package.
 *
 * **This is not a second Select, and the difference is which element is on the
 * page.** The `Select` in this package is Base UI's: a `<button>` carrying
 * `role="combobox"` and a popup list Base UI positions, types into and manages the
 * keyboard for. It is a custom control, and everything it offers over the platform
 * is the price of being one: it needs JavaScript to open, it cannot be operated by
 * the mobile picker a reader expects when they tap a select on a phone, it is
 * invisible to a right-click menu that offers "Save as", and it is a set of `div`s
 * where the browser's own is one element with thirty years of platform behaviour
 * behind it.
 *
 * So this Component renders the platform element. Everything the browser does with
 * a `<select>` it still does: the wheel on Windows, the wheel on macOS and iOS,
 * type-ahead on the first letter, the mobile picker, the form submission, and the
 * context menu. The styling is the package's, so the control looks like its
 * neighbours, and the appearance is suppressed so the drawn chevron is Prism's
 * rather than the platform's.
 *
 * **When this is the right answer rather than the compromise it sounds like.** A
 * native select is right when the platform's picker is better than anything this
 * package could draw: a long list of plain strings on a phone, a form that must
 * submit without JavaScript, a control inside a page that is already a form and
 * gains nothing from a popup that is portalled and dismissed. It is wrong when the
 * option needs to be more than a string, because an `<option>` holds text and
 * nothing else: no description, no count, no state, no nested markup. That is the
 * line, and the `Select` is on the other side of it.
 *
 * **The chevron is decoration and says so.** It is `aria-hidden` and it is not
 * focusable, because the value is already announced by the platform control and a
 * reader hearing "graphic" after every option set is a reader being told something
 * about the drawing rather than about the value. The control is one tab stop and
 * the browser owns its key handling entirely, which is the point.
 *
 * It is a server Component. A native select holds no state, runs no effect and
 * attaches no handler, so a form of twenty of them costs no JavaScript at all,
 * which is a real answer to the argument above rather than a footnote to it.
 */
function NativeSelect({
  className,
  size = 'default',
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div data-slot="native-select" className="relative w-full">
      <select
        data-slot="native-select-control"
        className={cn(
          // `appearance-none` is what lets the chevron be drawn rather than
          // inherited: the platform's own arrow is the one piece of this control
          // that would otherwise belong to no design system, and the whole reason
          // this Component exists is to take that over.
          'border-input bg-background text-foreground w-full appearance-none rounded-md border ps-3 pe-9 text-sm outline-none',
          'transition-[color,box-shadow,border-color] duration-fast ease-out',
          'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // The font is inherited explicitly, because a `<select>` does not
          // inherit one in every engine and a control in the platform's face
          // beside text in Inter is a control nobody designed.
          'font-inherit',
          // The coarse-pointer floor, as a step, and the same string `select.tsx` puts on
          // its trigger. This Component exists to take over the platform's own arrow, so
          // its metrics are Prism's to state rather than the browser's, and the argument
          // is the trigger's: a select is a control a finger presses to open a list, not a
          // field a finger types into, so its height belongs on the floor. It is `w-full`,
          // so only the height was short. See DESIGN.md, The coarse-pointer floor.
          'pointer-coarse:h-11',
          size === 'sm' ? 'h-8' : 'h-9',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {/*
       * The chevron, drawn rather than inherited. It is over the control rather
       * than inside it because an element inside a `<select>` is not rendered by
       * the browser, and a sibling absolutely positioned over it is the only
       * arrangement that works.
       *
       * The positioning and the hit-testing live on a wrapper rather than on the
       * icon. An icon library composes its own class string with whatever it is
       * given, so a `pointer-events-none` handed to the icon is a declaration
       * about a subtree this package does not own; the wrapper is ours, and a
       * chevron that swallowed clicks would be a region of the control that does
       * nothing when pressed.
       */}
      <span
        data-slot="native-select-icon"
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 flex size-4 -translate-y-1/2 items-center justify-center"
      >
        <ChevronDownIcon className="size-4" />
      </span>
    </div>
  )
}

export { NativeSelect }
