---
'@nanisoft/prism-ui': minor
---

Let `SiteNavbar`'s `nav` carry groups, rendered as one trigger that opens a menu

A `nav` entry may now be a group: `{ label, children }` beside the existing
link shape. On the row a group renders as the row's one control, a trigger
whose menu lists its children as real anchors, marked with `aria-current` when
the reader is on one; below the row's threshold the panel lists the same group
flat, as a label above its links, so no destination is two disclosures deep.
The current mark now reads the route as a place rather than a string, so a
reader on `/components/button` finds `Components` marked rather than nothing.
A flat `nav` renders exactly as before, and the new `SiteNavGroup` and
`SiteNavEntry` types are exported beside `SiteNavLink`.
