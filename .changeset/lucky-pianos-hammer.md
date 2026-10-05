---
'@nanisoft/prism-ui': patch
---

`StackGrid01` lifts both arms of the grid to the type floors

Measured on `nexus.nanisoft.com`: the in-house arm set its tile names at 14 pixels and
the line under them at 12, so a heading on this Block rendered smaller than the copy
around it and the tile read as a caption rather than as a tile.

**Both arms are raised, and the reason is a floor rather than a comparison.** `DESIGN.md`
already states both, which is why this is a Component coming into line rather than a new
rule:

- A tile name is a card title, and `CardTitle` says a card title sits at Body. Body is
  `text-lg` in this system, 18 pixels, so a name at 14 was below it.
- A role and a blurb are supporting copy, and `DESIGN.md` gives supporting copy
  `text-sm`, 14 pixels, so a line at 12 was below that too.

The first is the floor the heading ladder stops to avoid: `lg` is the deepest authored
step that is not smaller than Body, precisely so that a heading never renders smaller
than the copy it introduces. A tile name at 14 against copy at 18 broke exactly that.

**The two arms set the same steps in both, which is a fact and not a comparison.**
They already agreed here, so this was not a reconciliation and the reported arms
never disagreed: what agreed was below both floors. The difference the two arms are
supposed to carry is a claim about provenance, and it is carried in weight and ink,
the muted tile against the page with a `border-primary` hairline and the `md` shadow
step. A second group set quieter than the first would be a grid claiming the in-house
work matters less than the assembled parts, which is the opposite of what the group is
for. The assertion in the suite states the agreement as a fact so it cannot drift.

The mono annotation over an in-house name and under a codename is left at `text-xs` on
purpose. That is a machine annotation in the platform monospace stack, which is what
`DESIGN.md` uses the mono face for, not a run of prose, and it is the only type on the
tile that is not prose.

No `data-slot` changed, no prop changed, no field was added to either arm and neither
arm was widened, and the Block is still a server Component with no client code. The
tile's own height grows by the four pixels of the name plus the two of the line, which is
what the floors cost and not a change of rhythm: the grid was already `h-full` per row, so
a row of tiles is as tall as its tallest and both arms move together.
