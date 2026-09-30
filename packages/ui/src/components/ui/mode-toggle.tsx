'use client'

import { Moon, Sun } from 'lucide-react'
import type { ComponentProps } from 'react'

import { usePrismTheme } from '../../provider'
import { Button } from './button'
import { cn } from '../../lib/utils'

/** The props a `ModeToggle` takes. */
export interface ModeToggleProps extends Omit<ComponentProps<'button'>, 'children'> {
  /**
   * The control's accessible name.
   *
   * Required, and a `string` rather than a node because it is written into
   * `aria-label` and an accessible name is a string. It names the mode the button
   * moves to rather than the mode the page is in, so the words and the icon
   * beside them always say the same thing. Three of the four products in this
   * family phrase it the other way round, which is a caller's sentence and not a
   * Component's, and the prop is where that difference goes.
   */
  label: string
  /**
   * The control's height, forwarded to `Button`.
   *
   * `sm` and `md` and nothing else, because those are the two heights a site
   * header and a settings row actually need. The underlying `Button` also has an
   * icon size, which is refused here: an icon-only control with a label's
   * proportions is what this is, and the icon size draws a square, which shows in
   * the corner radius a reader sees.
   */
  size?: 'sm' | 'md'
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The control that moves the reader between the light and the dark mode.
 *
 * **This is the one Component in the library that needs `PrismProvider` above it,
 * and the reason is that it is the only one that writes the theme rather than
 * reading it.** Every other Component reaches its colours through the cascade: the
 * pack is an attribute on an ancestor and the mode is a class, and a Component
 * that draws a `bg-primary` has drawn the right thing in every pack without
 * knowing which pack it is in. This one cannot work that way, because moving
 * between the modes means writing `.dark` on the document element, and the
 * document element is not a thing a Component may reach for on its own. The
 * provider is that permission, and it is optional everywhere else in Prism, which
 * is why this is the only Component with a hard dependency on it. Mounted without
 * one, `usePrismTheme` throws, and that is the intended behaviour rather than a
 * silent no-op: a control that looks like it switches the mode and does nothing
 * is worse than a page that says the provider is missing.
 *
 * **It renders one button and not a group, and a two-button group here is a
 * segmented control doing a switch's job.** The obvious alternative is a pair of
 * buttons, one per mode, with the current one marked selected. It is worse three
 * separate ways. It takes two tab stops where the action needs one, so a reader
 * tabbing along a header pays for a second stop to learn a thing the first stop
 * already said. It announces a radio group, which changes what the arrow keys do
 * inside it, so a reader who has learned the row they are in has to learn another
 * model in the row above it. And it is the wrong role: two options where one is
 * always selected and choosing either one leaves the page in the same state as
 * choosing the other is a switch, and `toggle-group.tsx` is where a switch with
 * two labelled members belongs, with the roving tab stop and the pressed set it
 * already implements. A `Switch` is the other candidate and is refused for a
 * different reason: a switch says "this setting is on" and a mode is not a
 * setting, it is which of two renderings the page is using right now.
 *
 * **The icon is the destination and the name is the destination, so the two can
 * never contradict each other.** A page in light mode shows a moon, because
 * pressing it makes the page dark. The alternative, showing the current mode, puts
 * a sun on a light page, which reads as a control that is already on, and a reader
 * has to reconcile the picture with the state before they can use it. The icon is
 * swapped, not animated between: the Motion law refuses a transition whose only
 * purpose is decoration, and a sun morphing into a moon is decoration on a
 * control that is about to be re-rendered with the other one anyway. So there is
 * no transition here at all, and the swap is a repaint.
 *
 * **There is no `aria-pressed`, and that is a decision with a cost.** A pressed
 * state describes the current mode, and the name describes the mode the press
 * produces, so a pressed control named for its destination announces the opposite
 * of what it is about: a screen reader reads "Switch to dark mode, pressed" on a
 * page that is already dark. Since this Component takes one name rather than one
 * per mode, the name cannot describe the current mode, and the honest reading of
 * what is left is a button that performs an action. The cost is that a reader
 * using a screen reader cannot ask the control what the page is in; they read the
 * mode from the page, and a caller who would rather the control carried the state
 * passes a name for the mode itself and mounts their own control, which is a real
 * answer this Component is declining to give.
 *
 * **A reader who never mounts this is not left without the mode.** The mode on the
 * page comes from the two document attributes, `data-pack` and `.dark`, and the
 * blocking script in the head resolves them before first paint from a stored value
 * or from what the server rendered. That is the declarative path, it is
 * SSR-safe, and it is the one that works with no JavaScript at all. So this
 * Component is a convenience layered on top of a mechanism that already works, not
 * the mechanism, and a consumer who does not want a client Component in their
 * layout can leave this one out: they put the attributes on their root element
 * and write a plain button in their own code that calls `setMode` from the
 * provider's hook. That is the reason the honest dependency is stated rather than
 * hidden. A site that wants the mode switch with no JavaScript at all renders the
 * attributes on the root and offers the choice inside a form, which is a real
 * answer and a slightly worse one than a button.
 *
 * It is a client Component, and the provider it reads is a client module, so
 * there is no way to make this one without `'use client'`. That is the cost of
 * writing the theme rather than reading it, paid once, here.
 */
function ModeToggle({ label, size = 'md', className, ...props }: ModeToggleProps) {
  const { mode, toggleMode } = usePrismTheme()

  return (
    <Button
      type="button"
      data-slot="mode-toggle"
      variant="ghost"
      size={size === 'sm' ? 'sm' : 'default'}
      aria-label={label}
      onClick={toggleMode}
      className={cn('shrink-0', className)}
      {...props}
    >
      {/*
       * The icon for the mode the button moves to, not the one the page is in, and
       * a plain swap with no transition between the two. The destination is the
       * reading: a sun on a light page looks like a control that is already on,
       * while a moon on a light page says what pressing it does. The swap is not
       * animated because the Motion law refuses a transition whose only purpose is
       * decoration, and the element is about to re-render with the other one
       * anyway, so a cross-fade would be two frames of movement a reader did not
       * ask for and could not act on.
       */}
      {mode === 'dark' ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </Button>
  )
}

export { ModeToggle }
