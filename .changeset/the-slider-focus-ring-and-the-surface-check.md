---
'@nanisoft/prism-ui': patch
---

The Slider thumb rings at full strength, and the surface check now reads both ways

Two changes, and only two, in the component package.

**The focus indicator.** The Slider's thumb suppressed the browser outline and
drew its ring at `ring-ring/50`, so the element a keyboard user lands on carried
an indicator that composites to between 1.14:1 and 2.74:1 against every surface
in all six themes. That fails WCAG 1.4.11 on the one indicator a keyboard user
has, and the Slider's own JSDoc says it is reachable by Tab. Thirteen other
components already drew that ring at full strength; the Slider was the one that
was missed. Nothing said so, because the contrast gate measures the `ring`
TOKEN and the alpha is applied in the component rather than in the token, so it
reads the Slider's ring as compliant.

`packages/ui/scripts/check-focus-indicators.mjs` is the new gate. It reads the
class strings on the elements of every shipped Component, derives the set of
components whose own JSDoc claims keyboard reach or operation, and fails any of
them that suppresses a focus style without declaring a `ring-ring` colour at
full alpha alongside a `focus-visible:ring-N` width. The claim is read from the
JSDoc because `AGENTS.md` names that as this repository's documentation source,
so a component that stops claiming to be focusable is a documentation change and
shows up in the table the run prints rather than in a list someone maintains
beside the code. The unit is a class string on one element, so a Dialog's panel
or a Tooltip's trigger can suppress the outline legitimately; every such
exclusion is declared with its reason, printed with the slots it resolved to,
and fails the run if it stops matching anything. The run fails if the table
empties, and states how much it read, classified, tabled and excluded.

**The surface check.** `scripts/check-surface.mjs` compared the published
surface against the source in one direction for two of its three rules. A
wildcard subpath that resolved to zero declarations used to leave those two
rules reading no file at all and the run still printed its success line, which is
how a published surface drifts from its source without a consumer failing first.
A wildcard target that matches nothing is now a finding naming the target. The
internal side, which the gate deliberately did not check, is now a declared
boundary checked in both directions: a new file under `dist/lib` is a finding
naming it, and a declared internal declaration that is no longer emitted is a
finding naming it too. The boundary and the per-target match counts are printed
on every run. The three existing rules and their messages are unchanged.

**The version the four downstream site plans pin is `0.6.0`.** It is
`@nanisoft/prism-ui@0.6.0`, and `@nanisoft/prism-tokens@0.6.0` with it, because
the two are linked in `.changeset/config.json` and the pending
`a-server-rendered-pack-boundary-can-be-mode-correct` changeset declares a minor
for both from `0.5.1`. The patch declared here does not raise it: changesets
takes the highest bump in the queue, and a minor is already queued. A site plan
that pins `0.6.0` therefore resolves every subpath the export map publishes,
including `./components`, `./blocks`, `./pages`, `./provider`, `./theming`,
`./catalog` and `./styles.css`.

No public prop, no type and no export changed. The one rendering change is a
ring alpha on the Slider thumb, in both modes.
