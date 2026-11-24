---
'@nanisoft/prism-ui': patch
---

InstrumentPanel01 state words never truncate, and text-link targets take the coarse-pointer floor

`InstrumentPanel01`'s `stateLabel` span drops `truncate` and carries `shrink-0`, so the state's words arrive whole at any width and the label is the one span that yields: the word-first rule carried down to a phone bar, where an ellipsis in place of a state word was the usual outcome when a long label and a short state word shared one row. `DocsShell` rail links (page links and group headings) and `SiteFooter` social and column links now step up to a 44px target box under a coarse pointer (`pointer-coarse:min-h-11`, with the rail link's block turning into a centred flex row), the same step `Button` and `CtaLink` already take, paid on the box rather than on the type and leaving the fine-pointer rows untouched.

A rail group heading also carries the 24px target-size floor at every pointer now, as `flex min-h-6 items-center`: the heading was a bare inline anchor whose whole hit area was the type's content area, which is the exact shape `DESIGN.md`'s target-size floor is written against, and a floor owed under a mouse as much as under a finger is not delivered by a coarse-pointer step alone. `SiteNavbar`'s brand link takes the coarse step as well, because the brand is a control the bar asks to be hit and the step is a flex item's height inside the bar's own centred row, so nothing beside it moves.
