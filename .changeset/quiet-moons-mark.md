---
'@nanisoft/prism-ui': patch
---

`DocsShell` marks where its rails cut off, drops the rows it cannot name, and reaches a tablet

Three defects on the one documentation screen the other NaniSoft sites import.

**The contents rail hid a third to a half of the navigation behind an invisible
scroll.** The rail is capped against the viewport and scrolls inside that cap, and
Chrome's scrollbars are overlay scrollbars, so they appear only once the reader has
already scrolled. Measured in two consumers' built exports at 1280 by 680, the rail's
content stood at 912 and 1318 pixels in a 568 pixel box: 344 and 750 pixels of a
primary documentation navigation below the fold with `mask-image: none`, no
persistent scrollbar, no fade and no count. The last visible row was cut mid-word
above dead space, which reads as a rendering fault rather than as a scroll region.
A cap nobody can see is not a cap.

**The affordance is a fade across the foot of each rail, and the space it covers is
reserved rather than borrowed.** The sticky offset moved to a wrapper that does not
scroll, because nothing inside a scroll container stays put while that container
scrolls: a gradient or a mask written into the scrollport travels with the content
and marks nothing. The wrapper travels, so the gradient is pinned to its foot, and
the `<nav>` inside keeps the cap, the independent scrolling and the whole of its
class contract. The rail reserves `padding-bottom` of the same height as the fade,
which is the half that makes it honest: at rest the gradient falls on reserved space
and the last row is fully legible, and only while there is more below does it fall on
content. Without that padding the same gradient washes the last row permanently,
which is the usual cost of this answer and the reason it is not optional.

Two alternatives were rejected for stated reasons rather than passed over. A
persistent themed scrollbar is truthful at both ends and costs nothing to
legibility, but it says "there is more" without saying which way, and it needs its
gutter reserved in a 15rem rail so a short tree becoming a tall one does not shift
the content. A collapse control, and an "N more" control, both need state or a count
this Page cannot have: one is a client Component and the other is a measurement a
server Component cannot take.

The fade costs a keyboard and a screen-reader reader nothing. It is an empty element
with `aria-hidden` and `pointer-events-none`, inside the `<nav>` and outside the
`<ul>`, so it is not a list item, it is never announced, it never takes a press and it
never reaches a Tab stop. The region still scrolls on its own, so the arrow keys walk
every entry exactly as before.

**The Page can emit a navigation row containing nothing, and now refuses to.** An
entry whose `title` is the empty string rendered as
`<li data-slot="docs-nav-page"><span data-slot="docs-nav-label"></span></li>`: a row of
nothing inside a `<nav>`, which one consumer measured at 102 across 25 of its 31
documentation pages, because that site maps a heading whose title arrives as a React
element to `''`. A blank row is not a destination, and it is not a label either,
because a label is words. The Page now drops the entry, drops a group label it cannot
name while keeping the pages under that group, and drops a group that has neither
words nor pages. Nothing is swallowed: the rail carries the tally as
`data-unnamed-entries`, the same answer `Diagram` gives a relation it cannot resolve,
so a consumer can tell "nothing was wrong" from "the Page stopped counting".

A blank `title` and a blank `href` are still answered differently, because they have
different amounts left. A page with an address and no words is a real page with one
unrenderable field, so losing the row costs a reader nothing while taking the screen
down over it would cost them everything. A page with words and no address is a row
whose entire content is a route that does not exist, and that is still refused by
name.

**Below `lg` there was no navigation at all.** At 768 and at 1024 both rails were
`hidden` and the only navigation left inside the article was the two-item pager at
its foot, so a reader on a thirty-one document reference at tablet width had no
contents, no on-this-page and no way to a sibling page except Previous and Next. Each
tree is now also drawn behind a `<details>`, first in the document so it is what a
narrow reader meets before the text. `<details>` is the disclosure that needs no
runtime: the platform holds the expanded state, the control is in the Tab order with
a real expanded state, and the Page stays a server Component with no hook, no context
and no handler. The summary carries `navLabel` or `tocLabel`, which is the caller's
own word for that navigation, so the Page ships no reader-facing copy and a
consumer that files its documentation in another language gets the control in that
language by having named the region once.

The tree is therefore in the document twice, and only one copy is displayed at any
width: the rail is `hidden lg:block` and the disclosures are `lg:hidden`, so the
other is `display: none` and is out of the accessibility tree and out of the tab
order rather than a second list a reader meets.

**What did not change, and what a consumer may notice.** Every existing `data-slot`
value stays, so no call site and no test that addresses the Page by slot needs to
move; three new slots are added, `docs-rail-fade`, `docs-nav-compact` and
`docs-nav-disclosure`. The rail's `<nav>` now sits inside a wrapper, which is what
lets the fade stay put, so a consumer stylesheet reaching for it as a direct child of
`[data-slot="docs-rail"]` reaches the wrapper instead. `data-slot` is documented as
markup metadata rather than a styling API, and `Diagram` and `PulseGraph` took the
same wrapper for the same reason in the same release line.

The bump is a patch rather than a minor because nothing a consumer composes through
widens: no prop is added, no export is added, no token and no name in the contract
move, and no call site changes. What changes is what the Page draws from data it
already accepted.

**The one thing this leaves alone is stated rather than left to be found.** Below
`lg` the frame is a single column and this Page runs `Prose` at `fullWidth`, so the
frame decides the track: the article column is the whole container, which is 45rem at
768 and 61rem at 1024, against the 35rem it gets at 1216 and above. That is a wider
measure than the one the reading column is held to, in the band between the two
breakpoints, and it is a frame decision rather than a `Prose` one. A phone at 390
gets 21rem and is inside the measure. Capping the article track below `lg` is a
deliberate layout choice with two honest forms, a centred column at the measure or a
two-column frame from `md`, and either one changes what a narrow reader sees on
every documentation page in the family, so it is left to the maintainer rather than
taken here beside two defects that had no such choice in them.
