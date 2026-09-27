'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import { TOP_NAV } from '@/lib/nav'

/**
 * Horizontal navigation for `lg` and up.
 *
 * **`lg` is where the row fits, and that is measured rather than assumed.** The
 * row is one rigid line and nothing in it can yield: the wordmark is 97 pixels,
 * the seven Section links are 635 because a Section name is a defined term and
 * cannot be abbreviated to fit, and the three controls are 273. That is 1005 of
 * content plus two 16 pixel gaps and the 48 pixel container gutter, so the row
 * needs 1085 pixels of viewport to sit on one line at its designed size. `md` is
 * 768, and the row has never fitted there: it measured 1013 against a 768 pixel
 * viewport, the document scrolled 245 pixels sideways and the mode toggle sat off
 * screen. `lg` is 1024, it is the widest threshold the design system authors
 * (`xl` and `2xl` are closed in the emitted theme, so a larger one cannot be
 * written without inventing a token), and it is the threshold the documentation
 * sidebar already switches at, so the row and the sidebar now arrive together
 * rather than the row appearing 256 pixels before the navigation a reader at that
 * width most wants.
 *
 * The mobile menu below is therefore not the small-width fallback any more, it
 * is the primary way to reach a Section from 640 to 1023, which is why it carries
 * all seven and why its links are the 44 pixel targets the coarse-pointer floor
 * asks for.
 *
 * **The known limit, at the bottom of the band.** From 1024 to 1085 the row is up
 * to 61 pixels short of its natural width, and the wordmark is the only elastic
 * element in it, so it takes two lines there rather than pushing the document
 * sideways. Those widths rendered that way before the row moved and render that
 * way now, because the row was already on screen at `md`. Closing the band would
 * take either a threshold this repository does not author or a re-spacing of the
 * row, and the second is a design change wearing a responsive fix's clothes. The
 * measurements are in `e2e/README.md` rather than only here.
 *
 * The active item is marked with `aria-current` rather than colour alone, so the
 * current page is not communicated by hue that a theme switch can change out from
 * under it.
 *
 * The focus ring is re-declared here rather than inherited, because these are
 * plain links: nothing in the tree gives them one, and a browser default is the
 * only indicator they would otherwise have, which is a focus ring belonging to
 * no design system. It is the same treatment the button primitive carries, and at
 * full `ring` strength rather than `ring/50`, because half alpha composites this
 * `--ring` to between 1.14:1 and 2.74:1 against every surface in the palette and
 * clears 3:1 nowhere. The reasoning is recorded once, in the skip link's comment
 * in `app/layout.tsx`.
 */
export function SiteNav() {
  const pathname = usePathname()
  const ring =
    'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none'

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {TOP_NAV.map((item) => {
        const current = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            className={
              current
                ? `bg-accent text-accent-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ring}`
                : `text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ring}`
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Navigation for viewports below `lg`, where the horizontal row has no room.
 *
 * It stopped being the fallback for a phone the day the row moved to `lg`. From
 * 640 to 1023 this is how a reader reaches a Section, which is the whole of the
 * range a tablet in landscape and a small laptop sit in, so the panel carries all
 * seven Sections rather than the handful that would fit, and nothing a reader
 * could reach at 1023 is out of reach at 640.
 *
 * The panel is a disclosure rather than a route change: it closes on navigation,
 * on Escape and on a pointer-down outside itself, and every close hands focus back
 * to the trigger so the keyboard user lands back on the control they opened
 * rather than at the top of the page. Outside-dismissal is not a nicety here —
 * a panel over a full-width page whose only exits are its own links is a trap
 * once the reader has scrolled past them, and it has no Escape key to fall back on.
 *
 * Links are full-width with a 44px minimum height, because this is the only way
 * to reach a route on a touch device.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /**
   * Closes the disclosure, handing focus back to the trigger when it was inside
   * the panel.
   *
   * The panel is conditionally rendered, so unmounting it while it holds focus
   * drops the caret to `<body>` and sends a keyboard user back to the top of the
   * document. The containment check runs before `setOpen`, while the panel is
   * still mounted and `document.activeElement` still points into it; moving focus
   * to the trigger first is safe because the trigger sits outside the subtree
   * React is about to remove.
   *
   * The outside tap cannot be stolen from. `pointerdown` fires before the
   * browser's own focus handling, so at this point `activeElement` reflects where
   * the caret already was, not where the tap is about to put it: if the caret
   * was never in the panel, nothing here touches it and the default handling
   * then lands it on whatever was tapped; if it was in the panel, it is about to
   * be unmounted, and the trigger is the nearest surviving control the reader
   * opened it with.
   */
  const close = useCallback(() => {
    const panel = panelRef.current
    if (panel?.contains(document.activeElement)) {
      triggerRef.current?.focus()
    }
    setOpen(false)
  }, [])

  // Navigating away should never leave the panel covering the page it landed on.
  // Following one of its own links is a way focus ends up inside the panel, so
  // this close gets the same hand-back as Escape.
  //
  // The setState-in-effect rule is off here on purpose. The obvious refactor —
  // deriving `open` from the route, or adjusting it during render — closes the
  // panel by unmounting it, and by the time an effect could run, `panelRef.current`
  // is already null: the containment check that decides whether to hand focus back
  // has to happen while the panel is still mounted, which is before the commit an
  // effect runs after. Deriving the state instead loses the hand-back, so a
  // keyboard user who opened the menu and followed a link inside it would be dropped
  // to the top of the document instead of returned to the trigger.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    /**
     * Containment is checked against the wrapper rather than the panel, because
     * the trigger is a sibling of the panel rather than a child of it — a check
     * on `panelRef` alone would close the panel the moment its own trigger is
     * pressed, before the click that was meant to reopen it.
     *
     * The panel is absolutely positioned but still a DOM descendant of the
     * wrapper, so `contains` covers taps on the panel and on the trigger alike.
     */
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close])

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="border-border bg-popover absolute inset-x-0 top-full z-30 border-b p-2 shadow-lg"
        >
          <nav aria-label="Main" className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4">
            {TOP_NAV.map((item) => {
              const current = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className={
                    current
                      ? 'bg-accent text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : null}
    </div>
  )
}
