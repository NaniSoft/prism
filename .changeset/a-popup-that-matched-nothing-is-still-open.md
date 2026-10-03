---
'@nanisoft/prism-ui': minor
---

A popup that matched nothing is still an open popup, and its message is not an option

Four Components said "collapsed" while a popup was on the page, and two of them put
the sentence saying so inside the listbox.

`aria-expanded` was reading "are there results" rather than "is the popup displayed",
and the two came apart in exactly the state a search field exists to render: a query
that matched nothing. `CommandPalette` and `Combobox` both drew a bordered panel
carrying the caller's empty sentence and told the field there was nothing to reach.
`aria-expanded` is now the open state in all four, because that is what the
attribute is for and because closing on a non-match tells the reader their keystroke
broke the control, which `Combobox` already argued in prose.

`aria-controls` pointed at a listbox that was not rendered. `Combobox`,
`MultiCombobox` and `CreatableCombobox` omit the listbox entirely when nothing
matched and left the reference written anyway, so the field pointed at an id nothing
carried. **It now points at the popup rather than at the listbox inside it**, which
is the decision the existing axe run forced and the right one on its own terms:
`aria-controls` is a required attribute on an expanded `combobox`, so a field that is
expanded and carries no reference is itself a violation, and the panel is what the
field opened either way. `CommandPalette` points at the palette itself for the same
reason. All four write the reference only while the popup is displayed, so a closed
field carries none.

**A listbox owns `option` and `group` and nothing else.** `CommandPalette` drew its
no-results `<p>` inside the listbox and its group headings in a bare `<div>`, so the
message was a row the index counted and no reader could choose, and the rows under a
heading could not say what they belonged to. `CreatableCombobox` drew its
`<p role="status">` in the same place. In all three the empty state is now a sibling
of the listbox rather than a child of it, which is the arrangement `Combobox` and
`MultiCombobox` already shared, and each group wrapper is a `group` named by the
heading already drawn above it through `aria-labelledby`.

`CommandPalette` gains two things to know about: the two branches carry the same box,
so the panel does not change size or position when the last result is filtered out,
and its listbox now appears only when there is something in it, so a caller selecting
`[data-slot="command-palette-list"]` finds nothing in the empty state. The empty
state carries `data-slot="command-palette-empty-state"` on its box and the message
keeps `data-slot="command-palette-empty"`.

No prop changes and no import breaks.
