---
'@nanisoft/prism-ui': minor
---

`ToggleGroup` requires the accessible name its role already needed

`aria-label` was declared optional on `ToggleGroupProps` while the JSDoc directly
above it said "Required rather than defaulted". TypeScript enforced nothing, so a
group shipped unnamed, and both roles this Component draws are ones ARIA puts a MUST
on: a reader tabbing onto an unnamed `toolbar` is told "toolbar" and cannot ask which
set of controls they have reached, and an unnamed `radiogroup` says nothing about
which question its radios are answering. `TextFormatToolbar` draws the same role with
a required `label`, which is the shape this now matches.

**This is a compile-time break, and the fix is one prop.** A `ToggleGroup` that
passed no name now fails to build:

```tsx
// before
<ToggleGroup value={range} onValueChange={setRange}>

// after
<ToggleGroup aria-label="Date range" value={range} onValueChange={setRange}>
```

`aria-labelledby` still arrives through the forwarded props, so a caller whose name
is already drawn somewhere can point at it rather than repeat it.

**Why `minor` and not `major`.** The bump line for this repository is `0.y.z` and the
package is at 0.7, so `major` would be 1.0.0 and would claim a stability promise for
a design system whose catalogue gained 130 Items in the release before this one. The
published precedent is in `packages/ui/CHANGELOG.md`: the `*Variant` to `*Form`
renames and the prop removals in 0.7.0 shipped on the `minor` line, each with its
reason in the entry. This is the same shape of change, and it is described here in
full rather than left to be discovered by a compiler.
