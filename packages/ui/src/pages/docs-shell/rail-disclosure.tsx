'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible'

/**
 * The width query the island's open state agrees with the frame's own `lg:` cut
 * on. It is spelled out here rather than read from a theme, because the CSS that
 * hides the trigger above the cut and the JavaScript that opens the panel below it
 * must resolve to the same width or the two disagree: a trigger hidden at a width
 * where the panel is closed is navigation a reader cannot reach.
 */
const RAIL_CUT = '(min-width: 64rem)'

/** The props the rail's disclosure takes. */
type RailDisclosureProps = {
  /**
   * The rail's accessible name, which is also the word on the trigger. The Page
   * already requires it as `navLabel`, and a trigger that answers to the name the
   * rail already answers to is one name to know rather than two.
   */
  label: string
  /** The rail itself: the `<nav>` and the fade the Page renders around it. */
  children: ReactNode
}

/**
 * The disclosure the navigation rail stands behind below `lg`.
 *
 * **This is the island 0.16.1 said should be built deliberately, and it is built
 * on the terms that commit set.** 0.16.0 gave a reader below `lg` a second copy of
 * the tree behind a `<details>` and shipped a doubled document to every
 * documentation page in the family with it: doubled `aria-current` markers, doubled
 * `docs-nav-page` rows, and a second `<nav>` carrying the rail's own accessible
 * name, which is the thing a consumer's suite reaches the rail by. So there is one
 * `<nav>` here, the caller's own tree, and the disclosure wraps it. Nothing is
 * drawn twice, no count can come back doubled, and no `<details>` ships a second
 * copy of anything. The removal commit's sentence is the specification this file
 * was written against: the open state is held on purpose, in one place, by a
 * module that exists to hold it.
 *
 * **Open is the server's answer, and scripting-disabled parity is the reason.**
 * The tree renders open in the server HTML, so a reader with scripting disabled
 * meets the whole tree in flow exactly as the Page has shipped it since 0.16.1,
 * rather than locked behind a trigger that cannot act. When script is present the
 * island agrees with `RAIL_CUT`: closed below the cut, open above it, and updated
 * when the reader crosses it, so rotating a tablet or resizing a window moves the
 * rail to the arrangement that width owns. The one cost of an open server render
 * is a fold at hydration, and it is stated on the Page rather than hidden: the
 * alternatives were a second pre-paint inline script, which this package declines
 * to make a pattern of (the theme script is its one), and a closed server render,
 * which takes the navigation away from the one reader a server render exists for.
 *
 * **The trigger carries the rail's own name, and the way back never depends on
 * the panel.** A disclosure whose words arrive from this package would be copy the
 * Page does not ship; a trigger that repeats `navLabel` is the name the reader was
 * already given. The trigger is always in the document while `nav` is, so a reader
 * who closes the rail finds the way back as a named control and not as a
 * disappeared panel.
 *
 * **A closed rail costs no rows and no Tab stops, which is the point.** The panel
 * unmounts while closed, so a keyboard reader reaches the document in one Tab
 * instead of through every page in the tree, and a screen-reader user is not read
 * a sitemap before the article. `WCAG 2.1 SC 2.4.1` is the sentence this answers:
 * a reader must be able to bypass the repeated block, and a named trigger ahead of
 * the block is the bypass.
 */
export function RailDisclosure({ label, children }: RailDisclosureProps) {
  // Open until the island knows otherwise, which is the server's answer and the
  // scripting-disabled answer. The effect below is the only thing that closes it.
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const media = window.matchMedia(RAIL_CUT)
    const sync = () => setOpen(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <Collapsible open={open} onOpenChange={setOpen} data-slot="docs-rail-disclosure" className="gap-1">
      <CollapsibleTrigger
        data-slot="docs-rail-trigger"
        className="border-border bg-card lg:hidden pointer-coarse:min-h-11 rounded-md border px-4"
      >
        {label}
      </CollapsibleTrigger>
      {/*
        `overflow-visible` above the cut, because the panel's own closed-clipping
        would sit between the rail's sticky wrapper and the viewport and a sticky
        element inside an overflow ancestor sticks to that ancestor's scrollport,
        which never scrolls. The rail's cap, its scroll region and its fade are all
        written at `lg:` on the Rail itself; the panel only has to get out of their
        way there.
      */}
      <CollapsibleContent data-slot="docs-rail-panel" className="lg:overflow-visible">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
