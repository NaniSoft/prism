---
'@nanisoft/prism-ui': minor
---

A form-level error marks the field it is about, not every field

`AuthForm01` set `aria-invalid` on every field whenever a form-level `error` existed,
so a reader tabbing through a sign-in card heard "invalid" on a correctly filled
email address because the password was wrong. A form-level message is usually not
about a control at all: bad credentials, a locked account and a rate limit are three
things no field is wrong about, and the first thing a screen reader says about each
field is the state, so a reader told two correct answers are wrong stops trusting the
rest of the form.

`AuthFormField` gains `errorId`. The Block marks the field whose `id` the caller
names there and no other, and a caller with nothing to name leaves every field
unmarked, which is the honest state: the message is still drawn in an `Alert`, which
is announced when it enters, and WCAG 3.3.1 is answered by the message rather than by
a mark on a control that is not the problem. Omitting `errorId` on every field is now
the way to say "this is about the submission", and the JSDoc says so.

**A field's description was drawn and never announced.** The `FieldDescription`
carried no id and the input carried no `aria-describedby`, so a hint about a format
or a constraint was on the page for a sighted reader alone. The id is derived from
the field's own `id`, which is already the one stable caller-owned string on the
field, so the reference costs a template and cannot collide. `login-01` and
`signup-01` already wired the pair; this was the Block that had not.

**`SettingsNotifications01` had the same unlinked description.** Each event's
`FieldDescription` was drawn under the control's visible label and referred to by
nothing, while the section note was referred to by every read-only switch. The one
`aria-describedby` now carries both: the event's own description and, on a read-only
control, the note that says why it will not move. A reader who meets one without the
other has to work out which half they are missing.

Two notes for a caller. `AuthForm01` renders no `aria-invalid` on any field unless a
field names itself, so a form that relied on every field being marked has to name the
one that is. And `SettingsNotifications01` writes the joined pair as a template rather
than through a `join`, which is the same reason `MultiCombobox` does: a bare
separator literal is a string the copy gate reads as a space somebody typed.

No prop is removed and no import breaks.
