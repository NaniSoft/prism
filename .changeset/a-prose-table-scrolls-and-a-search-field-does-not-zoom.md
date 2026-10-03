---
'@nanisoft/prism-ui': minor
---

`Prose` gives a table a scroll container, and the two search fields stop zooming an iPhone

Four defects, three of them narrow-viewport, one of them about a reader's own
settings. A consumer sees all four.

**A table in a Prose widened the page instead of scrolling.** The Component's
JSDoc has always listed tables among the content it accepts, and the code fence
beside them has always scrolled, but the table itself could not: `overflow`
applies to block containers, and a `display: table` element is not one. A table
box cannot be a scroll container, so a four-column table in a Markdown document
pushed the whole page sideways rather than offering a scrollbar.

A `<table>` passed straight to a Prose now gets `display: block`, which is what
makes it a block container, and the same `overflow-x: auto` the code fence has.
The grid inside now sizes to its content up to the measure rather than stretching
to fill it, which is the trade the technique always carries and is the one worth
knowing about before you rely on it. Collapsed borders are unaffected: the row
groups are wrapped in an anonymous table box that still inherits
`border-collapse`.

The treatment is a child selector rather than a descendant one, on purpose. A
descendant selector would reach a `Table` you have already put in a scroll
container of your own and set `display: block` on the table inside it, which
moves the caption off being a caption and stops the grid filling its wrapper. A
table you have wrapped in your own element is left alone as it was; give that
element `overflow-x-auto` and it is what scrolls. For a table whose markup you
control, `Table` remains the right answer.

**`SearchDialog` and `CommandPalette` zoomed the page on focus.** Both drew their
search field at 14 pixels. iOS Safari zooms the viewport on a focused input whose
font size is under 16 pixels and does not zoom back out, so a reader who opened
either surface on a phone was left on a magnified page with no way off it. Both
now carry the `text-base` then `md:text-sm` pair that `Input`, `Textarea`,
`Combobox`, `Form` and `NumberField` already carried, which is the same 16 pixels
at a phone's width and the same 14 everywhere else.

**The bump is `minor` rather than `patch`.** A table in a Prose renders
differently: a narrow one no longer stretches to the measure. That is a visible
change to a published Component rather than a fix nobody notices, and a site that
was relying on a prose table filling its column is the one thing that needs to
look at it.
