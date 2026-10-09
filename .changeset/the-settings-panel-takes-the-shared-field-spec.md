---
'@nanisoft/prism-ui': major
---

The settings panel takes the shared field specification

`SettingsPanel01` now takes the same `FieldSpec`, `FieldSpecGroup` and `FieldKind`
a record write form takes, and its own field declaration, `SettingsPanelField`, is
gone from the published interface. The archetype is answered by the record write
form Block and earns no Item of its own: the difference between a form and a setting
is about what sits behind the surface, not about the surface.

Two things change in the props, and the second is breaking.

- `sections` is now `groups`, and a field is a `FieldSpec` with a stable `key`, a
  required `label` and a required `kind`. The `slot` arm means a control this
  package does not ship has somewhere to go, and a field's shell stays Prism's
  either way.
- `secondaryAction` is gone. That position is now `footerStart`, a node the caller
  wrote, placed without styling. A caller who passed a label and no function could
  previously produce a focusable control that activated to nothing; a `CtaLink` with
  its required `href` cannot.

`submitLabel` is now one arm of a save union: `action`, `onSubmit` or `submit`, each
forbidding the others, exactly as the write form takes them. A region that applies
on change passes `values` and an `onValueChange` that applies the mutation, and no
save arm at all, and the Block draws no footer. Whether a setting leaves on change,
on blur or at a save is the caller's own handler and the caller's own submission
arm, and no prop here decides it.

The Block renders no revert control, no reset to defaults control and no storage of
any kind, and it draws no tab strip and no rail.

# Migration

- Rename the `sections` prop to `groups`, and pass each field as a `FieldSpec` with
  a stable `key`, a required `label` and a required `kind`, imported from
  `@nanisoft/prism-ui/spec`. A control this package does not ship goes in the
  `slot` arm.
- Replace `secondaryAction` with `footerStart`, a node you write, placed without
  styling. A label with no function no longer compiles into a control that does
  nothing.
- Replace `submitLabel` with one arm of the save union: `action` for a destination,
  `onSubmit` for a handler, or `submit` for a node you write. The three forbid one
  another. A region that applies on change passes `values` and `onValueChange` and
  no save arm, and draws no footer.
- Remove any use of `SettingsPanelField`; it is gone from the published interface.
