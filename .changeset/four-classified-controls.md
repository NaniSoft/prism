---
'@nanisoft/prism-ui': patch
---

The gate that holds a Block's controls now reads the menu row and the switch

**No published surface changed.** Nothing in this entry is a prop, a Component or a
behaviour you compose differently: the change is to `scripts/check-block-controls.mjs`,
which is a repository gate and is not in the published tarball. It is here because the
law it holds reaches a consumer as the shape their own Block has to take, and a
consumer reading the changelog should be able to find that law without reading this
repository.

That gate classified `Button` and `CtaLink`, and neither of them is a menu row. The
shipped record index takes a declared list of per-row actions whose handler is
optional and renders each entry as a `DropdownMenuItem`, so a caller who passes a
label and no handler gets a row that sits in the menu's keyboard order, is announced
as a menu item, and activates to nothing. The gate could not see that Component, so
every gate in the repository was green while it shipped, and a clean run was the
absence of a check rather than the presence of a correct one.

Four Components are classified now, each with the arms that make it act:

- `Button`: `onClick`, `type="submit"`, `type="reset"`. Unchanged.
- `CtaLink`: `href`, which is required, so that arm is the compiler's. Unchanged.
- `DropdownMenuItem`: `onClick`, or `render` together with `href` in the element it
  renders as. Both words rather than either one, because `render={<span />}`
  navigates to nothing and a bare `href` would accept a `data-href` as a destination.
- `Switch`: `onCheckedChange`, and nothing else. A switch does not navigate and is
  meaningless without the handler, because the state it changes is the consumer's
  setting rather than anything a Block holds.

Every `DropdownMenuItem` and every `Switch` the tree renders already carries one of
those arms, so nothing shipped failed and no Block moved. What the widening buys is
the next one: a menu row or a switch a Block renders with nothing behind it is a
finding naming the file and the line, where yesterday it was invisible.

**Two limits are printed on every run and neither is new.** A `{...rest}` spread
inside a rendered control reads as carrying no handler, and a handler forwarded from a
declared optional prop reads as present, because resolving whether the caller passed
it is reading a type rather than a file. The second is why the shipped row action list
is still a finding for a reader and not for this gate: the optional handler behind the
attribute is invisible to a source scan. Removing that declared list is the authoring
work, and this gate is what makes the next one of them fail the run.

**A Block that holds a disclosure itself is still not caught, and that gap was left
open on purpose.** `Collapsible` and `Accordion` put none of the four classified
Components in a Block's source, so a Block rendering one with a `defaultOpen` and no
change handler reads as clean while the state is still state a Block holds. A
disclosure's activation lives inside the disclosure rather than on an attribute of the
row that opens it, so there is no arm for this gate to read, and a rule that inferred
one would report the Blocks that compose `Collapsible` correctly. The prohibition
stays a design rule in `DESIGN.md`, an auditor checks it by looking for the absence,
and the run prints that it is not a finding so a clean run is not read as more than it
is.