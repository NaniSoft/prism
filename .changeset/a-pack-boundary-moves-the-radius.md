---
'@nanisoft/prism-ui': patch
---

A pack boundary's effect on corner radius is stated, and gated

A scoped `data-pack` boundary resolves the pack's colour AND the pack's corner
radius beneath it, because radius is the only non-colour member of a pack block
and the token build emits it the same way. The radius range across the five packs
is 0.5rem to 1rem, so a row of elements each carrying its own pack shows a spread
of corner radii, and a small pill becomes a different pill five times over. The
governing law stated the colour half and was silent on the shape half, so an
implementer following it exactly produced mismatched corners and called it
correct.

The law now states both halves and where a boundary may sit. The agent-facing
surface no longer says the attribute belongs on the root element, which it did
while listing the radius among the values it will pick up: a tool that shows the
value and denies the subtree is worse than a tool that is silent.

`check-pack-boundary.mjs` holds the law. It reads the emitted `--radius-*`
bindings rather than a list of class names, which is the part that matters: a
scale step like `rounded-xl` is `calc(var(--radius) * 1.4)`, so an element
carrying one is pinned to a step and the step is pack-relative. The first version
of the gate treated "carries a radius utility" as the safe case and passed
exactly the defect the ticket is about. The gate also reads the colour contract
from the token source, so a second per-pack axis the token build has not been
asked about is a finding rather than a property silently counted as a colour.

One live boundary was found and repaired: the themes page scoped five cards, one
per pack, each with `rounded-xl`, so the page a reader uses to compare packs was
comparing shape as well as colour. The cards now carry a literal radius and the
pack's radius is shown in the row's own label, where it is information rather
than an accident.
