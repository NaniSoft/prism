---
'@nanisoft/prism-ui': minor
---

The accessible name a control announces is now a prop, so a consumer can localise it

`Pagination`, `Dialog` and `Breadcrumb` each shipped an `aria-label` that a
consumer could not change, and `ProductSwitcher` shipped a `label` default that
put the word "Products" into every consumer's navigation. A consumer could
localise the visible text of a pagination step and not the name a screen reader
announced for it, which left a control that looked localised and was half of it.

What changed:

- `Pagination` takes `label` for the region name, and each of `PaginationPrevious`
  and `PaginationNext` takes `label` beside its existing `text`, so the visible
  word and the announced name move together.
- `Dialog` takes `closeLabel` for the built-in close control, so a localised
  dialog no longer announces "Close" in a product that never uses that word.
- `Breadcrumb` takes `label` for its region name.
- `ProductSwitcher` no longer defaults `label`. A switcher with no `label`
  renders a navigation with no accessible name, which is a real state the caller
  resolves, rather than one that is quietly wrong.

Every new prop keeps the word Prism would have used as its default, so nothing
changes for a consumer that never set one. The one behaviour that does change is
`ProductSwitcher`'s, and it is the point: the default was a claim about a
consumer's product that the prop existed so they would not have to make.
