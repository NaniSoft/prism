---
'@nanisoft/prism-ui': minor
---

The fourth Kind: `live`, a surface whose content changes without a navigation event

**This is a breaking change, released as a minor: 0.11.0.** `CATALOG_KINDS` gains a
member, so a consumer switching exhaustively over `kind` is broken. A minor is the
right line for a breaking change from a `0.x` version, where anything may change at
any time, and taking 1.0.0 would declare the public API stable rather than describe
this change. `CONTRIBUTING.md` says a breaking change is a `major` bump, so this is
the one place the convention and the record disagree; the disagreement is deliberate
and `DESIGN.md` carries it with the reasoning.

**A `live` surface is what the other three cannot express.** A Component, a Block and
a Page are all rendered from props, and props arrive when the caller says so. A run's
event log, a monitoring view, anything fed by a socket, changes on its own. That is
the whole of the fourth Kind, and it is why `RunStream01` is the first client
Component in the package: a surface that receives events owns the subscription that
delivers them, and that is not an accident of implementation.

**Prism owns the surface, the consumer owns the transport.** `subscribe` is a
function the consumer supplies and a function it tears down. There is no socket, no
endpoint, no retry policy, no persistence and no provider to mount, so a consumer
that already has a connection passes it in and one that does not has not acquired a
client runtime by importing this.

**Four transcriptions were found by the compiler rather than by a reader**, which is
the argument for the ties that already existed. `STORE_KINDS`'s `_KindsMatch`
assertion fired on the first edit. The exhaustive `KIND_LABELS` record added
earlier fired the next, and adding a Kind is now a compile error in both places. The
corpus builder's `KIND_SEGMENT` produced a mirror path of `undefined` and the
`llms` gate reported it. And the site's three copies of the Kind labels were
collapsed into one table, so the fourth Kind is one edit rather than three.

**One divergence is deliberate and named.** A `live` surface ships as
`registry:block`, because the `type` field belongs to the shadcn registry schema,
which has no live surface and rejects a type it does not know. The **Kind** is ours
and is `live` in `CATALOG_KINDS`, the corpus, the MCP tools and the site's Sections.
The registry is a derived internal artefact, never served and never an install lane,
so the two vocabularies are allowed to differ because only one of them is ours. The
catalogue gate carries it as a named exception keyed on the Item's own `source`, so
the exception cannot drift from the thing it excuses, and the other 103 items are
still compared strictly.

**The Section plurality rule is gone, and two Sections is why.** It read that a
Section holding Items is plural. `patterns` broke it from the prose side and `live`
from the catalogue side, because `components`, `blocks` and `pages` are plural nouns
and `live` is an adjective with no plural. A rule two of nine Sections decline is a
convention, not a law, and a second exception would have invited a third. What is
asserted instead is the fact underneath it: every Section is registered once, in the
root ordering, at a segment the manifest agrees with.

## The proof that the tests can fail

`RunStream01`'s fourteen tests are proved by writing the mistakes they exist to catch.
Appending instead of sorting, which is the reconnect bug, fails the ordering cases.
And three defects were found by the tests rather than reasoned about in advance:

- **`statusLabel` rendered twice.** The heading fell back to it when no `title` was
  given, so "Failed after 3 attempts" was the surface's subject *and* its state. A
  status is not a heading.
- **`initial` was a trap.** It read like the current event list and quietly seeded
  only once. It now also *reseeds* when `resubscribeKey` changes, which is what a
  second run in one surface means, and the log clears with it rather than the old
  run's events growing the new run's.
- **A `setNewest` before its declaration**, which the run-switch test caught as a
  temporal-dead-zone error and which no type checker in this repository would.

**A `live` surface is budgeted, not exempted.** A Block composes Components, so its
own client figure restates theirs. A live surface is the only client code a consumer
pulls in *for itself*, so it has a row: 10 KB, of which `ScrollArea` is 8.1. The
figure is set above the measured size, because a budget below it is a wish.
