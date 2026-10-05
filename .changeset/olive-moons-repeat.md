---
'@nanisoft/prism-ui': patch
---

`SiteFooter` links are a 24 pixel target instead of a 17 pixel one

Measured in the built exports of three consumer sites: six to eight destinations per
footer, every one of them 17 pixels tall (`39x17`, `30x17`, `42x17`, `33x17`, `70x17`,
`37x17`), with the code a reader can see at
`https://www.w3.org/TR/WCAG22/#target-size-minimum` asking for 24 by 24.

**The link had no box.** A bare inline anchor is not a 17 pixel target by design; it
has no box at all. What a pointer aims at on one is the font's content area, and for
the shipped face at `text-sm` that is 16.94 pixels: fourteen pixels of type times the
face's own ascent and descent, times its size-adjust. Those three numbers are not a
guess, they are read out of the `@font-face` this package ships for `Inter Fallback`,
and reading them is what produced 16.94 against the 17 in the export. The social row
was the other shape and the other number: an `inline-flex` box, so its height is its
line box, 20.01 pixels.

**The floor is paid on the box, so the link looks the same.** Both links are now
`flex min-h-6 items-center`: a block at least `--spacing-6`, 24 pixels, tall, with the
same fourteen-pixel type at the same weight in the same colour inside it. It is the
arrangement `mobile-nav` already uses for a stacked navigation link at the
coarse-pointer floor, one step lower and at every pointer rather than only on a coarse
one. `--spacing-6` is arithmetic on the authored spacing multiplier the way every
`size-*` and `h-*` in this package is, so a retune of the scale moves the floor and the
Block could not have pinned it.

**No height anywhere moves.** A footer column link sat in a line box built from the
footer's inherited sixteen-pixel body, so each row was already 24 pixels tall before the
floor and each row is the same 24 after it; only the 17 pixels of target inside the row
grew. The footer's own height is unchanged at both widths, which is the outcome four
consumer pages are composed against, and the assertion that says so is in the suite.

The 24 pixel circle exception in the criterion arguably held, because consecutive rows
in a footer column stand 32 pixels apart centre to centre and a 24 pixel circle on
either clears the other. The fix is made anyway, and `DESIGN.md` records why under
**The target-size floor**: a target whose size depends on the gap beside it is one edit
away from failing and nothing in this repository would report it.

No `data-slot` changed, no prop changed, no call site moves, and the Block is still a
server Component with no client code. `DESIGN.md` states the rule once, in the section
beside **The coarse-pointer floor** it is deliberately not merged with.
