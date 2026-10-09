---
'@nanisoft/prism-ui': minor
---

The record write form renders a field specification whole

`RecordForm01` is a new Block: a create or edit screen rendered from a typed,
ordered field specification. It takes `FieldSpecGroup[]` from
`@nanisoft/prism-ui/spec` and draws Prism's own controls, each inside one shell of
label, help and error. Every field carries a stable `key`, a required `label`, a
required `kind` and optional help, hint, placeholder, disabled flag and starting
value; a control the package does not ship is the `slot` arm, and the Block still
draws the shell around the caller's node.

**The error state is an issue list keyed by field**, the shape `FormDialog` and
`FormWizard` already publish, and a message about the submission rather than about
a control is `submitError`, which names no field. **The save union has three arms**
and the compiler holds it: `action` posts to a URL, `onSubmit` hands over the
form's element, and `submit` is a slot for the caller's own control. The save
control is `type="submit"` inside the `<form>` the Block renders. **Layout is
derived**: `columns` is `1 | 2` at the form level, one column again at the narrow
breakpoint, and there is no per-field layout prop and no slot per region.

**One piece of per-kind rendering data is added.** The `MoneyField` arm of
`FieldSpec` gains a required `currency` and an optional `locale`, because an
amount is meaningless without the currency it is in and no locale can supply it.
Nothing else in the shared module changes, and the module stays plain serialisable
data with no rule, no validator and no callback on it.
