---
'@nanisoft/prism-ui': minor
---

`Progress` announces a value text again, and `getAriaValueText` works

Every `Progress` in every consumer was announcing a bare number. `aria-valuenow`
carried the position and `aria-valuetext` was absent from the tree altogether, so
the sentence a screen reader says for a bar was a number with nothing to say what
range it was a number in. A bar with `value={null}` was worse than bare: with no
`aria-valuenow` to fall back on, its entire value was nothing.

**What changed.** `aria-valuetext` is now passed only when you pass `valueText`, so
the default that Base UI computes survives. You get it for free:

- a determinate bar announces its value as a percentage of the range, so
  `value={68}` is announced as `68%`;
- a bar of unknown length announces `indeterminate progress`.

**`getAriaValueText` was dead and is not any more.** It was called on every render
and its return value was then discarded, so a consumer who wrote one was paying for
it and hearing nothing. It receives the formatted percentage first and the raw
`value` second, unchanged.

**`format` and `locale` had no observable effect either, and now do.** Both exist
only to shape the announced string, so with the attribute absent there was nothing
for them to shape. One trap worth knowing: `format` is applied to the raw value on
the scale, not to the share of it, so `format={{ style: 'percent' }}` on a
zero-to-hundred range reads as `4050%`. The unformatted default is the only path
that asks for a percentage of the fraction.

**Nothing you passed changes meaning.** An explicit `valueText` still wins, an
`aria-valuetext` written on the Component itself still wins over both, and a bar
given both `valueText` and `getAriaValueText` still throws. What a consumer hears
on a bar that passes neither of them is the whole of this change, and it is a
change to every bar a consumer that passes neither already has.

The bump is `minor` because it changes what a screen reader says in every
composition of this Component. No prop, import or exported name changes.