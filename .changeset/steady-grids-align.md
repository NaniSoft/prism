---
'@nanisoft/prism-ui': patch
---

Lay `Calendar`'s month grid as a table again: the `flex` came off its cells

The weekday headings and the day cells carried `display: flex`, and a flexed
`th` or `td` is pulled out of the table's column layout: the browser wraps each
one in its own anonymous cell, and the seven-column month collapsed into a
single stacked column at four times its height. In `Calendar` the day cell is
the `td` itself, so the whole grid fell; in `MiniCalendar` the day is a button
inside the cell, so the weekday row alone stacked above a surviving grid, and
`DatePicker` and the `Calendar01` Block inherit whichever they compose. The
cells are centred by the table instead (`text-center` with `align-middle` and
`p-0`), which keeps the seven columns, the 36px cell, the 44px coarse-pointer
floor and every state exactly as they were designed, and the weekday heading
now sits over the column it names.
