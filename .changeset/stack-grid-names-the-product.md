---
'@nanisoft/prism-ui': minor
---

`StackGrid01` names the real product behind a codename, and `Cta01` states the rule it enforces

**`StackPart` gains an optional `realName`.** The value goes inside the tile the
Block already draws, so it is an additive optional field, matching `ProductGrid01`'s
`pack` and `StatusLedger01`'s `detail`. It renders only when passed: a tile that
reserves a line for absent content is a layout shift on the first thing a reader
scrolls to, and because the grid is a grid, an empty line in one column would also
knock the row's baseline out for every tile beside it. Both are asserted, the
second by counting elements rather than by checking a class.

**`Cta01`'s JSDoc told consumers the opposite of the truth.** It said a panel wants
`default` or `secondary` and never `outline`, which was the answer *before* the
`outline` variant was given its ink, and it contradicted the code forty lines below
it, where the second action defaults to `outline`. A consumer reading the type would
have been actively misled. The settled rule is the inverse on the first variant:
`secondary` and `outline` are both fine and `default` is the one to avoid, because
the band is `bg-primary` and `default` fills with `--primary`, so a default action
on this band is the band's own colour against the band's own colour. Its label is
legible, because `primary-foreground` on `primary` is a gated pair, and the control
has no edge, which is a different defect and the reason the sentence is about the
fill rather than the text.

**A test that measured a pair it believed in.** The existing resolved-ink test
asserted the pair the test itself thought the defaults resolve to, so it stayed green
on a Block that had stopped asking for it. The new case renders `Cta01` with no
explicit variant, reads the utilities off the two anchors, maps each to the token it
names, and resolves those tokens from the emitted CSS. It asserts the resolved pair
rather than the class string, because a class-string assertion passes on a token
change, and it adds two things a ratio cannot see: that the ink is stated rather than
inherited, and that the fill is one the band is not.

The ticket's single lavender-dark figure understated the blast radius. The base pack
failed in **both** modes, at 1.00:1 and 1.01:1, and seven of twelve combinations were
affected. It is 13.59:1 or better in all twelve now.

**The acceptance criterion asked for the wrong instrument.** It asked for a row in
the token contrast gate, and that gate structurally cannot see this class of defect:
it measures token pairs, and what failed was a component declining to use a value it
was relying on by accident. `check-variant-ink.mjs` is the gate that holds it, and it
already existed.
