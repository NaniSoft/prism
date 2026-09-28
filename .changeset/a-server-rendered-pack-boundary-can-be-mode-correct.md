---
'@nanisoft/prism-tokens': minor
'@nanisoft/prism-ui': minor
---

A server-rendered pack boundary can now be mode-correct

The only dark selector for a pack was `[data-pack="<id>"].dark`, which requires
the mode class on the same element. A server cannot know the reader's mode, so a
subtree carrying a second pack rendered in that pack's light values on a dark
page. The token build now emits the two-member list

```
[data-pack="<id>"].dark, .dark [data-pack="<id>"]
```

as one rule with one declaration block, for all five packs. The compound half is
retained, because it is what a dark surface on a light page is and it is a
capability the package already published.

Consumers get a second change alongside it. `themeAttributes` now takes `mode` as
optional, because a required one is that same impossibility written into the type:
the only way to ask for a boundary with no mode class of its own was to pass
`'light'` as a guess, and the guess is wrong for half of readers. Omitting `mode`
is the honest spelling of "wear the mode of the element carrying `.dark`". The
change is a widening, so every existing caller still compiles.

The theme-boundary law in `DESIGN.md` is rewritten to match. It previously
instructed an implementer to put `data-pack` and `class="dark"` on a boundary
together, which works for a client-applied boundary and cannot work for a
server-rendered one.
