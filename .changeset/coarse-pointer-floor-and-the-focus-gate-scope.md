---
'@nanisoft/prism-ui': minor
---

Coarse-pointer controls take the 44px floor, and the focus gate reads the whole package

Thirteen controls were drawing targets between 16 and 36 pixels with nothing done
about it on touch input, so a consumer composing the bare primitive shipped a
target that fails WCAG 2.2 SC 2.5.8 and falls short of this package's own 44px
standard. All of them are fixed, and **the desktop metrics are untouched**: a mouse
and a trackpad see exactly what they saw before, and every change is inside
`@media (pointer: coarse)`.

`Checkbox`, `RadioGroupItem`, `Calendar`'s day cells and paging controls,
`Dialog`'s trigger and close control, and `SearchDialog`'s close control grow to
44 by 44. `Slider`'s and `RangeField`'s thumbs, `Switch`, and `DatePicker`'s clear
control take a transparent 44 by 44 band around the control instead, because
growing them would draw something the design does not have: a 44px ball on a six
pixel rail, a switch that is not a switch. The band is a pseudo-element, so the
box the value is computed from is the box you see.

**`NumberField` turns its two steppers side by side on a coarse pointer.** This is
the one place the floor changes an arrangement rather than a size. Two 44px targets
stacked in the split column need an 88px field, and two 44px bands on two 18px rows
overlap so much that the lower stepper takes the boundary between them, so a press
aimed at increment would step down.

**`Calendar` now matches `MiniCalendar` on the same controls.** The identical
control in one package at two target sizes is the defect, not the 32px.

Three things to know before you style against these:

- A `Calendar` on a phone is six rows of 44px rather than six of 36px, so the panel
  is taller. It is the densest control in the package and the one a finger is least
  able to aim at.
- `Checkbox` and `RadioGroupItem` draw a 44px bordered box on touch input, and the
  row, column or field around them grows to hold it. That is the price
  `tag-group.tsx` already records for its chips.
- On a `Slider` and a `RangeField`, a press inside a thumb's band drags the thumb
  from where it was rather than jumping the value to where you pressed. The arrow
  keys and the range input behind the track still reach every value. Two bounds
  closer together than the band is wide are dragged by the one used last until Tab
  moves to the other, so give a range a `minGap` a finger can pinch apart.

`DESIGN.md` states both patterns and the three conditions that decide between them.

**The focus-indicator gate read 132 of the package's 400 source files.** It read
`components/ui` and nothing else, so it saw no Block, no Page, neither `live`
surface and no provider, and it skipped any file whose JSDoc made no keyboard claim
before reading a single class string in it. It now reads `components`, `blocks`,
`pages`, `live` and `provider`, recursively, and judges every class string in the
scope. It does not read `apps/site`: that is another package with its own `check`
chain.

**Its exclusion for menu and listbox options was a suffix match, and is now a
roster.** `/(?:-item|-sub-trigger)$/` is a statement about spelling rather than
about menus, and over the Blocks it swallowed `radio-group-item`,
`toggle-group-item`, `accordion-item`, `breadcrumb-item`, `tree-item` and about
thirty more, every one of which is an ordinary focusable control.

**Two scanning defects are fixed, and both were making the gate report green over
a file it had not read.** A block comment inside a `cn()` call held an apostrophe,
which the scanner read as an opening quote and which hid every class after it; and
a module-level `const` was sliced to the end of its file rather than to the end of
its value, so a menu item read as carrying a full-strength ring that belonged to a
component further down the same module. Both are proved by fixtures that fail
without the fix. The shipped tree has no genuine findings; a planted one fires in a
Block and in a file whose JSDoc makes no claim, which is the negative control that
makes the clean run mean something.

**The bump is `minor` rather than `patch`.** No prop, import or rendered element
changes, and no desktop metric changes, so nothing breaks a call site. It is
`minor` because thirteen controls now measure differently on a coarse pointer, and a
consumer who styles any of them has to know that: a `Calendar` panel is taller, a
`Checkbox` box and a `RadioGroup` column are bigger, and a `NumberField` lays its
steppers out differently. That is a visible metric change on the platform most of
these controls are used on, and describing it as a patch would describe something
nobody sees.