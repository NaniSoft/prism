# Why the ink gate stops at the Component layer

A finding from attempting to widen `check-variant-ink.mjs` to the Block and Page
layers, and then withdrawing the change. Recorded because the reasoning is
counter-intuitive enough that the next person to see the gap will try it again.

## The finding that prompted it

Working a defect ticket on `Cta01`, an agent reported what it took to be a gap in
the gate:

> that gate only reads `src/components/ui`, so a Block or Page that hand-rolls a
> `bg-` with no `text-` in its own markup is outside it. No current file does, but
> that is a real hole.

Both halves of that turned out to be load-bearing, and the second one is the
interesting half.

## The shape is present

`StackGrid01` writes this, at `packages/ui/src/blocks/stack-grid-01/stack-grid.tsx`:

```tsx
<Card className="bg-muted h-full gap-2 py-4">
```

A fill override with no ink beside it. Measured naively, that is the exact defect
`check-variant-ink` exists to end: the tile's text takes whatever ink it inherits,
and inheriting `--primary-foreground` onto a `--muted` fill measures **1.09:1** in
the base pack's light mode, failing in **7 of 12** pack and mode combinations. That
is the same shape, and nearly the same number, as the Cta01 button the gate was
written for.

## It is not a defect

`Card` declares its own pair, at `packages/ui/src/components/ui/card.tsx`:

```
'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm'
```

and `cn()` merges the caller's `className` over it. The override replaces the
**fill**; the **ink** arrives with the base. The tile renders `--muted` behind
`--card-foreground`, which is 13.88:1 in dark and 16.44:1 in light. Nothing is
wrong with it.

This was confirmed by rendering the Block and reading the classes off the DOM, not
by reading the source. That step mattered: the source reads as a fill with no ink,
and only the rendered output shows the ink arriving. A probe written to measure
the source reported a 1.09:1 defect in a component that is fine.

## Why the gate cannot be widened to see this

The ink a rendered element has is a property of the **merge**, not of any one
string. `cn(base, override)` produces a third class list that is in neither input.
A gate that reads strings cannot recover it.

The measurements, so nobody repeats them:

| Scope | Files | Findings | Nature |
| --- | --- | --- | --- |
| Own fill, any state | 152 | 26 | 10 sit on elements that render no text at all |
| Narrowed: labelled elements, no gradients | 152 | 15 | every one has its ink from the overridden component |

The ten from the first row are a slider thumb, a progress track, a scroll-area
bar, a gradient overlay. An ink is not a meaningful utility on an element that
holds no label, so a gate demanding one is demanding nonsense.

The fifteen from the second row are the harder half. Narrow the rule to elements
that *can* hold a label, exclude `bg-gradient-to-*`, exclude self-closing elements,
and the population is a `DialogPrimitive` overlay, a `SwitchPrimitive` thumb, a
`TooltipPrimitive` bubble, a `SliderPrimitive`, a `site-header` whose
`bg-background` is the page ground by definition, a `site-footer`, a
`ProgressPrimitive` track. In each, the ink is supplied by the component being
overridden, which is the same fact as the `Card` case, seen from the other side.

Widening the gate would add fifteen findings that each need an explanation, which
is a gate nobody runs, against a real defect it would still not catch.

## What the gate is actually for

The rule is not "anything with a fill states an ink". It is **a variant states an
ink**, and a variant is a control whose surface is a choice a caller can see. A
`variant` key is Prism's own declaration; a `className` override on a component
that already declares its ink is a caller changing a fill the component will
re-ink anyway.

So the two layers differ in kind, not in degree, and that is why the boundary is a
kind and not a line.

## The judgement a Block makes instead

A Block that wants a genuinely different surface states both utilities itself, or
declares a variant that does. Where neither is possible, the pair belongs in
`check-contrast.mjs`, which measures token pairs and so can be asked about
`--muted` on `--card-foreground` directly. That gate has the reach this one does
not: it can be handed a pair, where this one can only be handed a class string.

## What this is not

Not a decision to leave a defect in place. The measurement found no defect. The
"no current file does" half of the agent's report was correct, and it was correct
for a reason the agent could not have seen from inside the Component layer.
