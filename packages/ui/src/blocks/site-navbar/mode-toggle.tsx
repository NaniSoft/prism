'use client'

import { Moon, Sun } from 'lucide-react'

import { usePrismTheme } from '../../provider/provider'

/** The props the mode toggle takes. */
export type ModeToggleProps = {
  /** The accessible name of the control while the page is in light mode. */
  lightLabel: string
  /** The accessible name of the control while the page is in dark mode. */
  darkLabel: string
}

/**
 * The light and dark control.
 *
 * One button rather than a menu, because the choice has two members and a menu is
 * the shape a set of six belongs in. The icon states the mode the page is in and
 * the name states the mode the button will move it to, which is the pairing that
 * makes the control readable at a glance and unambiguous to a screen reader: a
 * button labelled "dark mode" that is currently showing a sun is a control whose
 * label and its state have to be reconciled before it can be used.
 *
 * **It reads the mode from the provider rather than from the document.** The class
 * on `<html>` is the mode, so this could read `document.documentElement.classList`
 * and would then hold a value the theme itself owns in two places. The provider is
 * the single writer of that class, and a control that wrote it directly would be a
 * second writer of a state every other part of the page reads.
 *
 * `aria-pressed` is on the control, and it is worth stating why a toggle rather than
 * a pair of buttons: the button's accessible name changes with the mode, and a
 * changing name on a pressed control is the combination that leaves a screen reader
 * announcing "dark mode, pressed" for a page that is in light mode. The name
 * describes the destination and the pressed state describes the current mode, so the
 * two never contradict each other because neither claims to be the other.
 *
 * **The two labels are keyed to the mode they are shown in, not to the mode they
 * name.** `lightLabel` is what the control is called while the page is in light
 * mode, which is the word that sends a reader to dark mode. Reading them the other
 * way round is the mistake this control shipped with and the test that found it:
 * a page in light mode announced "Switch to light mode", which is a control that
 * claims to do the thing the page is already doing.
 */
export function ModeToggle({ lightLabel, darkLabel }: ModeToggleProps) {
  const { mode, toggleMode } = usePrismTheme()
  const dark = mode === 'dark'

  return (
    <button
      type="button"
      data-slot="site-navbar-mode-toggle"
      onClick={toggleMode}
      aria-label={dark ? darkLabel : lightLabel}
      aria-pressed={dark}
      className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
    >
      {dark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
    </button>
  )
}
