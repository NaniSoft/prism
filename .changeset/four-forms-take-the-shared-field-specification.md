---
'@nanisoft/prism-ui': major
---

Four forms take the shared field specification

`AuthForm01`, `Contact01`, `Provisioning01` and `Signup01` now take the same
`FieldSpec` and `FieldSpecGroup` a record write form takes, so the vocabulary a
consumer learns on one screen is the vocabulary on all five. Each Block's own
field declaration goes from the published interface, and a control Prism does not
ship arrives as the `slot` arm of `FieldKind` rather than as a property on a
per-Block type.

- **`AuthForm01`**: `fields: AuthFormField[]` becomes `groups: readonly
  FieldSpecGroup[]`. The controlled `value` and `onChange` on a field go, because
  the specification is data and holds no callback; the Block is uncontrolled and
  the caller reads the values out of the form element. `error` becomes
  `submitError`, and `errorId` becomes an entry in the new `issues` list keyed by
  field. `AuthFormField` is removed and `AuthForm01Issue` is added.
- **`Contact01`**: `fields: ContactField[]` becomes `groups: readonly
  FieldSpecGroup[]`, and a new `issues` list draws a message under a field.
  `ContactField` and `Contact01Option` are removed and `Contact01Issue` is added.
- **`Provisioning01`**: a step's `fields: readonly ProvisioningField[]` becomes
  `fields: readonly FieldSpec[]`. `ProvisioningField`, `ProvisioningFieldType` and
  `ProvisioningOption` are removed; `ProvisioningStep`, `ProvisioningValue` and
  `Provisioning01Status` are unchanged.
- **`Signup01`**: `fields: readonly SignupField[]` becomes `groups: readonly
  FieldSpecGroup[]`. `SignupField` and `SignupOption` are removed; the `password`
  arrangement, `SignupValue`, `Signup01Password`, `Signup01Reading`,
  `Signup01Status` and `Signup01SignIn` are unchanged.

`FieldCommon` gains an optional `autoComplete`, the platform's autofill hint, once
for every screen rather than in a second declaration per Block. Requiredness stays
a rendering fact and an HTML attribute; no specification carries a rule.

# Migration

Replace a field list with groups of `FieldSpec` from `@nanisoft/prism-ui/spec`:

- Rename a field's `id` to `key`, its `type` to a `kind` naming a Prism control
  (`'text'`, `'email'` and `'tel'` become `'Input'`, `'password'` becomes
  `'PasswordField'`, `'textarea'` becomes `'Textarea'`, `'select'` becomes
  `'NativeSelect'`), and its `description` to `help`.
- Move a choice's `options` under its kind, unchanged in shape.
- Wrap the list in one or more `{ fields: [...] }` groups and pass it as `groups`.
- Pass a control Prism does not ship as `{ kind: 'slot', control: <your control /> }`.
- On `AuthForm01`, replace `error` with `submitError` and, where you marked a
  field, pass `issues={[{ field: key, message }]}` instead of `errorId`.
- Read `onSubmit` values by each field's `key`. `AuthForm01` is uncontrolled: read
  `new FormData(event.currentTarget)` rather than a controlled `value`/`onChange`.
- Pass `autoComplete` on the fields a password manager or a phone keyboard fills.
