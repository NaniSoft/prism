---
'@nanisoft/prism-ui': minor
---

The rest of the controls take the coarse-pointer floor, and the divider explains itself

Fifteen controls were drawing targets between 28 and 40 pixels with nothing done about
it on touch input, and three more were found by going looking rather than by reading a
list. All of them now take the 44px floor, and **the desktop metrics are untouched**: a
mouse and a trackpad see exactly what they saw before, and every change is inside
`@media (pointer: coarse)`.

**Sixteen take a step, and the step is the default for all of them.** A popup trigger
(`PopoverTrigger`, `DropdownMenuTrigger`, `NavigationMenuTrigger`, `MenubarTrigger`,
`AlertDialogTrigger`), an alert dialog's confirm and dismiss pair, a page link
(`PaginationLink` and the previous and next controls), a tab and its list, a select
trigger and a native select, a `Toggle`, a `ToggleGroupItem` and the sidebar's toggle
all grow to 44 tall through `pointer-coarse:h-11`. `Carousel`'s two controls, both of
`Lightbox`'s, both of `ImageZoom`'s, the drawer's close control and `PaginationLink`'s
`icon` size take `pointer-coarse:size-11` and are 44 by 44.

**Four of them take `min-w-11` on the second axis as well, because a floor paid on one
axis is not a floor.** A one-digit page link at 44 tall is 20 wide. An icon-only
`Toggle` is `size-4` plus `px-2.5`. An icon-only `ToggleGroupItem` is the same. This is
the arrangement `Button` already states and the reason it states it, and the page-link
case is the one worth naming: `PaginationPrevious` and `PaginationNext` pass
`size="default"` and override the padding to `px-2.5`, so on a phone the word is hidden
and the control is an icon with a 40 pixel width until `min-w-11` says otherwise.

**`TabsList` grows too, and that is the half that is easy to forget.** The list is
`h-9 p-1`, so its content box is 28 tall and a trigger grown to 44 would not fit inside
it. It takes `pointer-coarse:h-13`, which is the trigger's 44 plus the list's own `p-1`
on each side. Both halves are asserted in the test, because either alone leaves a
control under the floor or a list that clips one.

**Two of the fifteen are not targets and take nothing, and both are worth stating
because each looks exactly like every other finding here.**

`steps.tsx`'s marker is a `<span>` with no role, no `tabIndex` and no handler. It is not
focusable, it is announced by nothing, and a press on it falls through to the step's own
text. The rail is a reading structure: the `<ol>` carries `aria-label`, the `<li>`
carries `aria-current="step"`, and the connecting rule is `aria-hidden`. Growing a 32px
disc to 44 would pay the floor on a decoration and push the step's text down the page.

`pagination.tsx`'s ellipsis is a `<span aria-hidden="true">`, for the same reason. The
page links around it are the targets and they take the floor in `PaginationLink`. The
floor is a claim about targets a finger is asked to hit, and neither of these is one.

**`ResizableHandle` takes a band, and it is the only control here where a step is
arithmetically impossible rather than merely wrong.** The panes are given
`flexBasis: <size>%` with `flexShrink: 0`, so the two of them already sum to the group's
whole width and the divider is what overflows it, by exactly its own one pixel. A `w-11`
divider would overflow the group by 44, which on a phone pushes the right pane's edge off
the screen, and making room would mean changing what `size` means.

The band works because three facts hold that the three conditions in `DESIGN.md` ask
about. It is a pseudo-element, so the box the drag measures stays the drawn box:
`onPointerDown` reads the **group's** rect and `onPointerMove` divides by the group's
travel, so nothing reads this element's own size at all, which is the failure `DESIGN.md`
warns about for a `Slider` thumb and which does not apply here. It paints above both
panes without a `z-index`, because the handle is `relative` with `z-index: auto` and the
panes are static, and a positioned descendant paints after non-positioned siblings. And
it is 44 by 44 rather than 44 by the handle's length, which is what keeps the overlap
local: along the split the handle already spans the group so 44 there is free, and across
the split it reaches 21 pixels into each pane over a 44 pixel stretch of the line rather
than the whole height of the group.

**The cost is stated at the class rather than hidden in a document.** A press within 21
pixels of the line, over a 44 pixel stretch of it, grabs the divider rather than the
pane, and `touch-none` travels with the band because the pseudo-element resolves its
`touch-action` from this element. Text selection near the divider is unavailable inside
that patch. That is the trade a resize gutter makes on every platform, and it is bounded
to a patch rather than run the length of both panes.

Three things to know before you style against these:

- A tab list, a menubar, a navigation bar and a segmented toggle group are 44 tall on
  touch rather than 28 to 36. A `Tabs` panel is that much further down the page.
- A page header's row of links, an alert dialog's footer and a carousel's control row are
  each 8 to 16 pixels taller on touch. Nothing shifts off an edge: every one of them is
  content-sized and centred rather than flush.
- On a resizable split, a press inside 21 pixels of the divider grabs the divider. The
  arrow keys, Home and End still move it, and `aria-valuenow` still reports where it is.

**Three controls the earlier list did not name, found by searching for the two patterns
rather than reading a line number.** `Toggle`, `SelectTrigger` and `NativeSelect` were
all drawing 32 or 36 pixel targets and all three are the same family as controls the
earlier release had already fixed. They are included because a trigger that opens a
popup is a button, not a text field: it has no caret, takes no typed input, and its job
is to be pressed.

**One family was found and deliberately left, and the reason is worth having in writing.**
`Input`, `Textarea`, `Form`'s `FieldControl`, `Combobox`'s input and the draft field in
`CreatableCombobox` all draw 36 tall on a coarse pointer. Growing them is a different
decision from every one above rather than an omission: a text field is the one control
whose height also sets the line box the caret sits in, it is composed into dozens of
Blocks, and this package already carries a deliberate narrow-viewport decision on exactly
these elements (the `text-base md:text-sm` pair that stops iOS zooming the page on focus).
The line this release draws is **triggers and buttons take the floor; text entry does
not, in this sweep**, and the text-entry family is a separate piece of work rather than a
gap in this one.

**The bump is `minor` rather than `patch`.** No prop, import or rendered element changes,
and no desktop metric changes, so nothing breaks a call site. It is `minor` because
eighteen controls now measure differently on a coarse pointer, and a consumer who styles
any of them has to know that: a tab list is taller, a navigation bar is taller, a
segmented group is taller, a resizable split claims 21 pixels either side of its line.
That is a visible metric change on the platform most of these controls are used on, and
describing it as a patch would describe something nobody sees. This is the same judgement
the earlier release made for the thirteen controls it fixed.

`DESIGN.md` states both patterns and the three conditions that decide between them, and
`test/coarse-pointer-floor.test.tsx` asserts the class each floor is written as. **What
that test does not do is prove a size of 44 pixels, and the file says so in its first
paragraph:** jsdom has no CSS engine, no cascade and no box, so `@media (pointer: coarse)`
is never evaluated here and a coarse-pointer variant is a string that a test can only
assert is present on the element the Component rendered. The assertions query by role and
name rather than searching the source, so they catch a floor that was moved onto a
wrapper or dropped in a refactor; they do not and cannot catch a browser that lays the
element out at 30 pixels. `apps/site/e2e/display.spec.ts` over a real browser is where
that is checked.
