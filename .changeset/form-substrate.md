---
'@nanisoft/prism-ui': minor
---

Add the form substrate: command, combobox, calendar, date picker, input group, number field, one-time code, label and form

Nine Items, and the one that changes an existing Component's behaviour is the
`Combobox`.

**Typing never discards a choice.** A field showing exactly the chosen label is
not narrowing anything, so "chosen and filtered out" is not a reachable state: the
answer changes only on an explicit choose or an explicit clear. A combobox that
empties its own selection as a reader types is the usual failure, and it loses
data silently.

**`Command` is the leaf row and it ranks nothing.** `matchRange` is a prop, so
whoever filtered the list decides where the match fell, and one command object can
be spread onto the row with its `keywords` accepted and never rendered.

**`Calendar` keeps a disabled date drawn and in the arrow path, and refuses to be
chosen.** A date that is simply absent is indistinguishable from a grid that
failed to render that week, and a reader paging with the arrows should not have
the path change under them.

**`DatePicker` reseeds the month on show from the chosen value**, so re-picking a
date in another month does not silently reset the grid to the month the caller
created the field in.

**`InputGroup` puts the focus on the control and the ring on the control.** The
frame is a `div` and is never focused, because putting the ring on a wrapper is how
an indicator ends up around the wrong box.

**`NumberField` clamps a value as it arrives, not only as it is typed**, and an
empty field reports `null` rather than zero. Base UI clamps typing and refuses the
steppers past a bound but lets an out-of-range `value` straight through, so the
clamp is applied on the way in and the consequence for a controlled consumer is
documented: `onValueChange` is the authority.

**`OneTimeCode` holds the code as one value, not six.** Backspace removes a
character from the string and the rest close up, which is the only rule for an
empty box that is not wrong for somebody. Base UI's own field strips the label from
the first segment on purpose, so a visually hidden `<label for>` is rendered
instead, and its steppers are put back in the tab order because an announced
control a keyboard cannot reach is worse than a second stop.

**`Form` makes the error and the way out of it one unit.** `FormError` draws the
message and the caller's `action` in a single live region that is in the document
before either of them, so a server error that arrives with the form is announced
rather than appearing silently.

**`Label` keeps the required mark as decoration.** The control's own `required` is
what is announced and what the form enforces, so a second signal that says
something slightly different is the thing to avoid.

## The ranking is now one module, not two surfaces' private copy

`locate` and `RANKS` moved to `packages/ui/src/lib/rank.ts`, and the `Combobox`
imports them from there rather than from the `CommandPalette`. A command palette
and a combobox that each carried their own scorer would agree for a month and then
diverge on the case nobody thought about, and a reader would find a query that
floats to the top in one surface and sinks in the other. The first version put the
scorer inside the palette and the combobox reached into a composite for it, which
compiles and typechecks and is still wrong: the next surface to need one has no
honest module to import, and the tempting answer is to copy the one it can see.
