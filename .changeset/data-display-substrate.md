---
'@nanisoft/prism-ui': minor
---

Add the data display substrate: item, scroll area, carousel, toggle and the rest

Nine Items, and the one that matters most is `item`, because it is the row almost
every list in the package hand-rolls today.

**`item` is the row and not the list.** A caller writes the `ul`, the `dl` or the
grid and composes rows into it, because the same row appears in four different
parents and a Component that owned the list would own all four.

**`scroll-area` keeps the browser scrolling and takes over only the appearance of
the bar.** The alternative is a transform on a `div`, which looks identical in a
screenshot and has no scroll position, so no keyboard, no `scrollIntoView` and
nothing to announce. The custom bar is also a real accessibility obligation rather
than a decoration: a scrollbar is a control, and a control made of `div`s is worse
than the one the browser shipped.

**`aspect-ratio` takes the ratio as a prop rather than as a class.** Prism's
stylesheet scans only Prism's own source, so a consumer's `aspect-[4/3]` is a rule
the shipped sheet does not contain, and the box silently collapses.

**`carousel` is never the only route to its content.** Every slide stays in the
DOM, the controls state where the reader is through a required `position` function,
and there is a focus handoff: a control that has just been disabled leaves the tab
order without giving up focus, so a reader who pressed "next" onto the last slide
would otherwise be stranded inside the carousel.

**`toggle` is pressed; a `switch` takes effect at once.** The JSDoc says so and one
test asserts the three controls side by side, because confusing them is the usual
failure and the confusion is a bug report rather than a compile error.

**`toggle-group` changes the role, not the look.** `single` is a `radiogroup` of
`role="radio"` with `aria-checked`; `multiple` is a `toolbar` of pressed buttons
where the arrows move the highlight without pressing it. A `group` carrying
`aria-orientation` is an axe violation, so `group` was not implementable as the
issue's phrasing suggested, and the toolbar is the more accurate role anyway.

**`native-select` is an addition and not a rival.** The existing `Select` is Base
UI: a `button role="combobox"` with a portalled popup, not a `select` element. A
native select is right when the platform picker beats anything this package could
draw, and wrong the moment an option needs to be more than a string. The test
renders both and asserts one is a `SELECT` and the other a `BUTTON`.

**`button-group` draws the focus ring once around the group** and the members
suppress their own, with the click-versus-keyboard trade stated rather than hidden.

**`table-sort` announces the direction it will go next, not the one it is in**, and
its cycle returns to unsorted in three clicks, so the caller's original order is
reachable from the control the reader already knows.
