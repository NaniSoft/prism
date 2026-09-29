# Provenance: the expansion past three layers

**Effort:** expanding Prism past its three closed layers using a category taxonomy
surveyed from agent-facing product documentation rather than from any component
library, then implementing independently.

**Date of record:** 2026-09-29.

**Status: asserted, not verified.** A document can record that a claim was made. It
cannot establish that the claim is true, and nothing in this repository is able to.
That limit is stated here once rather than hedged into every section, and it is the
reason the four axes below are each given a *means of checking* as well as a finding:
a claim with no way to check it is a claim, not a record.

**This is one document per effort, not one per asset.** The originality claim is a
fact about how the work was done, which is one fact about the effort rather than
forty facts about its outputs. A per-asset record would be forty copies of the same
paragraph, and forty copies drift from each other in exactly the way this repository
has already had to unpick three times.

## 1. The provenance record

**What was consulted.** One primary-source record, and it is a prerequisite rather
than a background reading: `docs/history/licensing-review-shadcnblocks.md`, retrieved
2026-09-28. Two of its findings constrained what the effort was allowed to look at.

- The shadcnblocks License Agreement is **proprietary** and never mentions shadcn/ui
  or MIT. Its examples of restriction name building a UI library using Components and
  distributing it, and publishing the Components or their derivatives in a public
  repository. Both would apply to Prism at once **if any Component were derived**.
- The free tier is 55 blocks under **MIT plus Commons Clause**, GitHub-classified
  `NOASSERTION`. The paid tier is HTTP 401 without a key.
- NaniSoft holds **no shadcnblocks licence**, confirmed 2026-09-28.

**What was deliberately not consulted.** No Component source, CSS, Tailwind
configuration, JSX or TSX, API surface, prop names, component names, folder
structure, documentation, examples, assets, SVGs or animations was read from any
third-party component product as a source to copy or adapt. The taxonomy that scoped
the work was built by **reading agent-facing product documentation** and naming the
problems those documents describe.

**The method that was rejected and why.** "Read the rendered web pages and re-create
what is on them" was considered as the authorship method and rejected: re-creating
from a rendered page is not clean-room authorship, because the rendered page is the
prior author's expression and the method cannot distinguish what was learned from it
and what was already known. The problem space was surveyed; the implementation was not.

## 2. The originality checklist

Thirteen checks. Each is a question that can be answered about this repository, and
each carries how it was answered.

1. **No third-party Component source in the tree.** Answered by search across all
   source, configuration and manifest files for vendor identifiers. The licensing
   review records the result: zero hits, and the only mentions are deliberate
   statements of non-derivation.
2. **No third-party CSS or Tailwind configuration.** Prism builds its own stylesheet
   over its own token source. Semantic custom property names are the shadcn variable
   contract on purpose, so an unmodified shadcn theme works against the packs, and
   that is a name-level interoperability decision rather than a copied value.
3. **No third-party markup.** Every rendered structure is authored here. Compound
   part naming follows the accessibility convention a component library is measured
   against, not one implementation's spelling of it.
4. **No third-party prop names.** Props are named for what they do in this system.
   Where a name is conventional it is the conventional one, and the corpus publishes
   it, so a reader is not asked to learn a private vocabulary.
5. **No third-party component names.** Every exported name is composed from this
   repository's own three-layer vocabulary. `ProcessRail01` and `ProcessFlow01` are
   named for what they draw; a rail and a flow are this repository's words.
6. **No third-party folder structure.** Layout follows the three layers, which are
   this repository's.
7. **No third-party documentation, examples or assets.** Demos, item documentation
   and prose sections are authored here, including the Patterns and Templates
   documents, whose argument is this system's own.
8. **No third-party SVGs or icons.** Icons are consumed from a package as a
   dependency at a named import. No icon file is vendored, redrawn or traced.
9. **No third-party animation.** Motion is by token: named durations and easings
   only, with one documented exception for the ambient cycle, which is authored here.
10. **Problems surveyed, not answers copied.** The taxonomy came from reading
    agent-facing product documentation and naming what those documents describe. No
    component product's feature list was used as a work list.
11. **Decisions taken by this repository, on this evidence.** Where an existing
    decision was copied it would be a second list about the same thing, which is the
    failure mode this repository already has three unpickings of. The four-space
    process ceiling, the staging order of a step, the queue-vs-mailbox choice and
    every other judgement in the effort were taken here and are argued in place.
12. **Defects found in prior work were fixed, not inherited.** Several defects in
    this repository were corrected rather than carried forward, and one defect in
    this effort's own output was introduced and then caught and fixed, which is
    recorded in the commit that fixed it.
13. **Every claim here is falsifiable in principle.** Each axis in section 3 carries a
    means of checking. A provenance record whose claims cannot be checked is a
    statement of intent.

## 3. The four-axis similarity assessment

Four axes, chosen because each is checkable by a different means, so a finding on
one is not automatically a finding on the others.

### Axis 1: Source text

**Question:** is any of the prior author's text present, character for character?

**Finding: none.** No source, documentation prose, comment or string literal is
carried over. Prose in this effort is written about this system's own decisions and
does not restate another document.

**Means of checking:** the identifier and phrase search the licensing review records,
run across the tree, which found zero vendor references.

### Axis 2: Structure and arrangement

**Question:** is the arrangement derived: file layout, module decomposition, element
order, the order of steps in a process?

**Finding: none, and this axis was the most exposed.** A sequence of steps, a
component's internal decomposition and a page's element order are where derivation
is hardest to see, because they are constrained by convention and by accessibility
requirements rather than by choice. Every arrangement here was argued from this
system's own rules and is recorded in place, and the three cases most likely to look
conventional are worth naming: the staging order of a process step, the internal
part decomposition of a compound Component, and the reading order of a Page.

**Means of checking:** the reasoning is in the commit and in the Item documentation
for each, so a reviewer can read the argument rather than infer it from the output.

### Axis 3: Interface

**Question:** are names derived: exports, props, types, tokens, CSS classes?

**Finding: none.** Naming is the axis where derivation is most tempting and most
damaging, because a derived name makes a reader's question answerable by the prior
author rather than by the documentation. Every exported name, prop and type here is
composed from this repository's vocabulary.

**Means of checking:** `catalog.ts` is the one list of names, it is generated into
the registry, and the corpus publishes the same names. A name that is not composed
from this vocabulary is visible in a single file.

### Axis 4: Appearance

**Question:** is the visual design derived: colour values, spacing, radii, shadows,
type scale, motion timings?

**Finding: none.** Every value traces to a token in this repository's own source, and
the emitted contract gate checks that. Where a value is shared with another system it
is shared at the level of a variable name, on purpose, so that an unmodified theme
works against the packs.

**Means of checking:** the contrast gate measures every required token pair, and the
emitted contract gate checks that the published roles are the ones this repository
defines.

## 4. The independent implementation declaration

Prism's expansion past three layers was implemented independently, from a problem
space surveyed in agent-facing product documentation and from this repository's own
design rules and token source. No third-party component product's source, CSS,
configuration, markup, API surface, naming, structure, documentation or visual design
was used as a source to copy or adapt, and no rendered page was re-created as a method
of authorship.

This declaration is a claim about how the work was done. It is made here, in one
place, so that it can be read by a person deciding whether to rely on this work, and
so that it is falsifiable by the person who checks it.

**What a reader should do with it.** Treat it as the starting point of a check rather
than the end of one. The four axes above name what to look at and how. If a finding
contradicts this document, the finding is the more valuable of the two and this
document is what should change.
