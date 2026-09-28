## Problem Statement

A developer building a data-dense, agentic or enterprise application on Prism
runs out of Prism before they run out of application.

Three problems have no Component at all. **A live region** does not exist
anywhere in the component package: `aria-live` appears zero times, so a result
list that filters as you type, a search that updates a count, and an agent run
that appends output all change silently for anyone using a screen reader. **A
match highlight** does not exist: `<mark>` appears zero times, so a command
palette or a result list cannot show which substring matched. **A tree** does not
exist: `role="tree"` and `aria-level` appear zero times, and the entire tree
implementation is two private functions inside `DocsShell`, whose data type is
bound to documentation navigation. A file tree, a category tree, an outline and a
knowledge base have nothing to build from.

The 31-Component deferred tail is a second, separate shortage. It is specified
and unwritten: `command`, `combobox`, `chart`, `sidebar`, `form`, `spinner`,
`toast`, `collapsible`, `resizable`, `scroll-area`, `item`, `empty-state-01`'s
mechanics and eighteen more, plus four Blocks and three Pages. A developer who
needs a command palette or a date range or a resizable panel today writes it
themselves, in their own CSS, against a design system that has no override path
to help them.

Both shortages are the same problem from two directions. Prism's own research
(`docs/research/taxonomy-survey.md`, 108 product categories surveyed) measured
what the standard application surfaces need and found **10 covered, 51 partial,
41 gaps**. The three absent primitives between them block the largest number of
those gaps of anything on the roadmap.

## Solution

Prism ships the three absent primitives and completes the deferred tail, in that
order, with no change to the closed `kind` union and no new gate.

The three primitives first, because they are prerequisites rather than
nice-to-haves. The live region is what makes the `live` Kind buildable at all: the
Kind's event log surface is a live region, and an unannounced append is not
accessible, so a run log shipped before this exists is a run log a screen reader
cannot follow. The match highlight is what makes any search experience coherent.
The tree promotes an existing private implementation to a published Component,
which is a different kind of task from adding an item to a tail and is scoped
accordingly.

The deferred tail second, because it is already specified. This is completion
work against a written roster, not design work, and the specification carries it
as a roster and its acceptance rather than thirty-one designs.

Neither the `live` Kind nor the Patterns Section is in this spec. Both are
decided in `DESIGN.md` and both are sequenced after this work.

## User Stories

1. As a screen reader user filtering a result list, I want the new result count announced, so that I know the filter took effect without navigating to a count.
2. As a screen reader user watching an agent run, I want each output chunk announced, so that I can follow the run without polling the pane.
3. As a screen reader user in a long tree, I want my position announced, so that I know where I am without sighted orientation.
4. As a sighted keyboard user in a long tree, I want arrow keys to move between nodes, so that I can navigate without tabbing through every node.
5. As a keyboard user searching, I want the matched substring visibly marked, so that I can see why a result matched rather than reading every result.
6. As a keyboard user in a palette, I want the matched substring marked, so that the highlighted entry is obvious at a glance.
7. As a developer building a file browser, I want a tree Component, so that I do not write my own `role="tree"` implementation.
8. As a developer building a knowledge base, I want a tree Component whose shape arrives as data, so that the tree is a projection of my content rather than hand-maintained markup.
9. As a developer building an outline, I want a tree Component that renders a flat list as a flat tree, so that an outline is not a special case.
10. As a consumer, I want a tree whose nodes take all their words as props, so that my install ships no English in a locale I do not serve.
11. As a consumer, I want a live region whose politeness I choose, so that a chat transcript that appends is not as interruptive as a failed payment.
12. As a consumer, I want the live region to expose `aria-busy` while it is still receiving, so that assistive technology can distinguish "arriving" from "arrived".
13. As a consumer, I want the live region to render nothing of its own when there is nothing to announce, so that an empty region is not focusable or announced.
14. As a consumer, I want the mark treatment to carry no semantics I did not ask for, so that highlighting does not invent emphasis a screen reader will read aloud.
15. As a consumer, I want the tree to mark the current node with `aria-current`, so that a reader knows which node is the one they are in.
16. As a consumer, I want a tree node with no children to render as a label rather than a dead control, so that a group heading is not something focusable that goes nowhere.
17. As a developer, I want a command palette Component, so that I do not build a global search myself.
18. As a developer, I want a combobox Component, so that I do not build type-ahead myself.
19. As a developer, I want a date picker, so that I do not build calendar maths myself.
20. As a developer, I want a chart Component, so that I do not choose a charting runtime and hand-roll axis and legend behaviour.
21. As a developer, I want a sidebar Component, so that the `sidebar-*` token family has a consumer.
22. As a developer, I want a form binding, so that field validation is Prism's rather than mine.
23. As a developer, I want a spinner, so that a pending state is a token rather than an animation I wrote.
24. As a developer, I want a toast, so that a transient confirmation is accessible rather than a div that disappears.
25. As a developer, I want a collapsible, so that a disclosure is accessible rather than a click handler on a div.
26. As a developer, I want a resizable primitive, so that a split pane is draggable and keyboard-operable rather than a mouse-only div.
27. As a developer, I want a scroll area, so that a long rail scrolls within its own region rather than the page.
28. As a developer, I want an item Component, so that a list row has one shape across a facet list, a result list and a nav rail.
29. As a developer, I want an empty state, so that a zero-result list says something and offers a way forward.
30. As a developer, I want a meter, so that a bounded value is not a progress bar with the wrong semantics.
31. As a developer, I want a number field, so that increment and decrement are keyboard-operable.
32. As a developer, I want a native select, so that a dense in-cell choice does not pull the full Select into every row.
33. As a developer, I want an input group, so that icon, input and clear are one control rather than three absolutely positioned siblings.
34. As a developer, I want a button group, so that a transport row is one control rather than four with hand-written spacing.
35. As a developer, I want a toggle and a toggle group, so that an active-filter chip and a range selector are accessible.
36. As a developer, I want a context menu, so that a right-click action set is not a `div` with a listener.
37. As a developer, I want a hover card, so that a preview is dismissible and reachable by keyboard, not hover-only.
38. As a developer, I want a sheet, so that a mobile filter drawer is a real surface with a focus trap.
39. As a developer, I want an alert dialog, so that a destructive confirmation is modal and focus-managed.
40. As a developer, I want a menubar, so that application menus are keyboard-navigable.
41. As a navigation-menu, I want a navigation menu, so that a mega-menu is a landmark rather than a div.
42. As a developer, I want a carousel, so that a media strip is keyboard-operable and does not trap focus.
43. As a developer, I want an aspect ratio primitive, so that media reserves its space before it loads.
44. As a developer, I want an input OTP, so that a verification code field is one control with paste support.
45. As a developer, I want a standalone label, so that a control outside a field still has a programmatic name.
46. As a developer, I want a standalone empty Component, so that the four deferred marketing Blocks and every new list have an empty state.
47. As a consumer, I want every new Component to resolve all its words as props, so that a build gate can hold me to it.
48. As a consumer, I want every new Component to carry JSDoc, so that the corpus has an entry for it and the agent surface can read its props.
49. As a consumer, I want every new Component to appear in the catalogue, so that the agent surface and the site both know it exists.
50. As an agent, I want the corpus to describe the new Components, so that I can read their props without reading their source.
51. As an agent, I want `aria-live` to be visible in the emitted declarations, so that I can tell a live region from a static region.
52. As a maintainer, I want the roster and the disk compared three ways, so that a module with no catalogue entry fails the build.
53. As a maintainer, I want the deferred tail removed from the roster as each item lands, so that the tail does not describe work that is done.
54. As a consumer, I want no new npm subpath, so that the public surface stays the same three layers.
55. As a consumer, I want the `kind` union unchanged, so that my imports keep working.
56. As a maintainer, I want no new gate, so that the gate set does not grow a member that can pass without reading anything.
57. As a consumer, I want the live region to be one client module with a budget, so that shipping it does not quietly raise the all-client ceiling.

## Implementation Decisions

- **The live region is a new Component, and it is the first of the three.** The
  component package has no live region, so the event log surface the `live` Kind
  is specified to own has nothing to be built on. It ships first and the Kind
  follows it. The three absences were verified at zero occurrences each in the
  component package source rather than inferred, because "it looks like there
  isn't one" is not evidence.

- **The live region exposes politeness and busy state as props, and defaults to
  the least interruptive politeness that is still announced.** A run log that
  announces assertively interrupts a screen reader mid-sentence; one that is too
  polite is not announced at all. The default is a decision Prism makes once so
  that twenty consumers do not each make it differently, and the prop exists so
  a consumer with a genuinely assertive event can be.

- **`aria-busy` is a prop tied to whether more content is expected, not a spinner
  prop.** The distinction is that a busy region is still readable, and a consumer
  that sets it permanently has told assistive technology the stream never ends.
  The prop is therefore about the consumer's knowledge, not about an animation.

- **The mark treatment carries no semantics beyond the mark.** A consumer that
  marks a search hit wants a visual treatment and a screen reader that reads the
  surrounding sentence, not one that announces "highlight" between every word.
  The Component therefore styles a `mark` and does not add a role, and a
  consumer that wants the announcement writes it.

- **The mark treatment is a Component and not a Prose extension.** `Prose` styles
  a caller's block children through child selectors and has no injection point, so
  extending it would mean a consumer could mark text by wrapping a span in
  arbitrary prose. A standalone Component keeps `Prose`'s contract intact and is
  what the catalogue gate checks for.

- **The tree is a published Component, promoted from `DocsShell`'s private
  renderers.** The implementation already exists as two private functions, with
  depth indentation, a `border-l` rule, `aria-current` marking, and the rule that
  a group with no `href` renders a label rather than a dead anchor. What is
  missing is that it is reachable, and that its data type is bound to
  documentation navigation rather than being a tree's own vocabulary. The
  promotion is the work; a second implementation is not.

- **`DocsShell` is not deleted and does not change behaviour.** It keeps its own
  private renderers because its two rules, a section carrying no status or count
  and a group with no index rendering a label, are specific to a documentation
  rail and are reasoned at length in `DESIGN.md`. A documentation rail is one
  shape a tree takes, not the shape. Whether `DocsShell` later composes the
  published tree is a separate decision this spec does not make.

- **The tree's node type is a union with the same closure argument as
  `DocsNavEntry`.** A node is a destination, a label over children, or a rule,
  and a single shape with optional fields would make all three look alike, which
  is the distinction the whole arrangement turns on. The published Component
  states this in its own JSDoc.

- **The tree renders a flat list as a flat tree.** An outline is a tree of depth
  one, so the consumer passes leaves and gets leaves. A component that required
  nesting to express a flat structure would make the common case the awkward one.

- **Every new Component takes all reader-facing words as props, and the existing
  gate enforces it.** `check-block-copy.mjs` already fails the build on a
  word-shaped literal in a Block or Page, and it scans `src/blocks` and
  `src/pages`. The Component layer needs the same rule, and the reason is stated
  in the map: a Component that ships "Popular" ships a claim about a consumer's
  plan. The extension is the same script rather than a new one, because a second
  copy-prose gate is a second thing that can pass without reading anything.

- **The deferred tail lands as written, and each item leaves the roster as it
  lands.** The tail is a specification of what is still to come. When an item
  ships, the roster entry goes with it, so the table never describes work that is
  done. This is why the `empty` token was removed from the tail in `DESIGN.md`
  while `empty-state-01` is recorded as settled: the tail is a pending list, and
  a resolved name in a pending list is a defect.

- **`empty-state-01` is a Block and not a Component, and this spec does not
  reverse that.** `DESIGN.md` resolves it: the old item was already a
  composition of icon, title, body and action, which is a Block's shape. A
  standalone `empty` Component is in the tail because the shadcn baseline has
  one, and the map found that the resolution and the tail disagreed. This spec
  builds the Block, and records the tail entry as superseded rather than
  silently leaving both.

- **`chart` is built on the existing `chart-1` through `chart-5` semantic
  tokens and introduces no charting runtime into the published package.** The
  tokens already ship and currently have exactly one consumer, a conic gradient
  in `ProductMark`. The component's job is to make the token family legible as a
  palette. A runtime that renders the chart is a consumer dependency, and the
  design system's job is the colour, axis and legend semantics, not the drawing.
  Whether a consumer adopts a runtime is the consumer's decision, and the
  client-JavaScript budget applies to it as it does to any other dependency.

- **The tree, the live region and the mark treatment are three new client
  modules, and each takes a client budget.** `check-client-budget.mjs` already
  requires every module carrying `'use client'` to have a budget and every budget
  to name a real client component, and the roster is checked in both directions.
  A new client module therefore cannot ship without a number, which is the
  property that makes the 90 KB all-client ceiling meaningful.

- **No new gate, and no new npm subpath, and no change to `kind`.** The public
  surface is Components, Blocks and Pages, and this work adds to it rather than
  extending it. The `live` Kind, the Patterns Section and the composition gate are
  all decided and all sequenced after this work, and none of them is a
  prerequisite for a Component being installable.

- **Sequencing within this spec is a build order, not a release order.** The
  three primitives land first because the `live` Kind depends on the live region
  and because each blocks more than one Priority 1 domain. The tail lands after,
  in the order the roster states. The two are one spec because they are one
  layer, and the tail is thin enough that a separate document would be a roster
  with a template wrapped around it.

## Testing Decisions

**What makes a good test here:** it asserts a claim a consumer can observe, and it
fails when the claim stops being true. It does not assert an implementation
detail, a class name, or a count. The repository has already settled this
position twice and both are prior art: `check-catalogue.mjs` compares the source
tree, the catalogue and the generated registry in three directions and prints one
line per offending item, because a length assertion cannot report which item is
wrong; and `content-tree.ts` refuses to build on a file it cannot place, because
a file nobody places looks like a green build.

- **Existence and the roster: the existing catalogue gate, extended in place.** A
  module with no catalogue entry fails, naming the module. A catalogue entry with
  no module fails, naming the entry. A registry item with no catalogue entry
  fails. This is `check-catalogue.mjs` and it needs no new mechanism; it needs
  the new entries to be added honestly rather than the gate to be taught
  something.

- **The roster tail shrinks as items land: asserted in both directions.** The
  gate already compares the tree against the list in both directions, so an item
  that ships without leaving the tail is a finding, and a tail entry that names
  no module is a finding. This is what makes the tail a pending list rather than
  a wish list.

- **Documentation is present, because JSDoc is the documentation source:** a
  Component with no JSDoc block has no corpus entry, so a new Component with no
  JSDoc is a Component the agent surface cannot describe. The existing item-docs
  gate is the seam.

- **Every new Component is in the client budget roster in both directions.** A
  new client module cannot ship without a number, and a budget naming a module
  that no longer exists is a finding. This is `check-client-budget.mjs` unchanged,
  and the two-way roster check is the prior art for it.

- **Copy-free wording, extended to the Component layer:** the existing
  `check-block-copy.mjs` rule, extended from `src/blocks` and `src/pages` to
  `src/components/ui`, so a Component cannot ship a word-shaped string that makes
  a claim about a consumer's data. The same script, not a second one.

- **Accessibility is asserted as a claim, at the rendered seam.** The live region
  renders an element carrying the politeness and busy props, and the tree renders
  nodes carrying `role="tree"`, `role="treeitem"` and `aria-level`, asserted
  through the existing testing-library and `axe-core` setup that the per-component
  test files already use. This is the one place a rendering assertion is
  required, because the whole point of the live region is an attribute on a
  rendered element, and a source-level check cannot see it.

- **The live region announces nothing when empty, and that is a test.** An empty
  region must not be focusable and must not be announced, because a live region
  that is always present announces on every state change of its container. This
  is a behavioural claim with a user-visible consequence, so it is tested
  behaviourally rather than by asserting the absence of a string.

- **The tree's label-is-not-a-route rule is tested, because it is the rule most
  likely to be broken.** A node with no `href` renders a `span` and nothing
  focusable, a node with an `href` renders a native anchor so a reader can see
  the destination before taking it, and a group with no children is not a group.
  This mirrors the existing precedent in `DocsShell`, where the absent case is
  exercised deliberately rather than incidentally.

- **The mark treatment is tested for not adding semantics,** because the failure
  mode is invisible: a `mark` that acquired a role would make every search result
  read differently, and no visual regression would show it.

- **Prior art, all existing:** `packages/ui/scripts/check-catalogue.mjs` for
  three-way set comparison, `apps/site/scripts/content-joins.mjs` for comparing
  declared claims against published reality, `packages/ui/scripts/check-block-copy.mjs`
  for copy-free wording, `check-client-budget.mjs` for the two-way client roster,
  `check-item-docs.mjs` for JSDoc presence, and the per-component
  `*.test.tsx` files for rendered accessibility assertions.

- **Not asserted, deliberately.** No test asserts a component count, because
  `DESIGN.md` already records that the catalogue deliberately does not restate
  its roster in prose and that a gate on prose punishes editing a comment. No
  test asserts a token value, because the contrast gate measures the roles
  against the surfaces they land on rather than checking a literal.

## Out of Scope

- **The `live` Kind.** Decided in `DESIGN.md`, sequenced after the live region
  this spec builds. Adding it is a breaking change at 1.0.0 and is gated on the
  two untied transcriptions named by issue 72, sequenced behind the concurrent
  work on the same three files. Its three non-live siblings, the run history, the
  approval queue and the cost ledger, are Workflows and are out of scope here
  entirely.

- **The Patterns Section, the Template tier, and the Workflow tier.** All three
  are decided in `DESIGN.md` and none of them is npm surface. A Template reuses
  the published `DocsNavEntry` union, a Pattern declares its composition, and the
  composition gate is part of that work rather than this.

- **The two untied `kind` transcriptions** named by issue 72: the `KINDS` literal
  in the site's catalogue module and the `kindLabel` fallthrough. Both are that
  ticket's unfinished half, sequenced last behind the concurrent work.

- **Anything touching the four consumer sites.** `nexus`, `atlas`, `alphalens`
  and `landing-page` stay on the retired line. This spec adds to the library and
  migrates nothing.

- **The commercial-category gaps the survey found but this layer does not serve:**
  commerce, media, and enterprise control. The survey measured them and the
  measurement is the point; serving them is later work, and the media surface's
  two members are in the tail while the rest is not.

- **A charting runtime.** See the `chart` decision above.

- **Promoting `DocsShell` onto the published tree.** A later decision, and
  `DocsShell` does not change in this work.

- **Any deprecation of the pre-rebuild published line.** Recorded in
  `DESIGN.md` as an open item and unrelated to this layer.

## Further Notes

**The research this rests on, and its limits.** `docs/research/taxonomy-survey.md`
surveyed 108 product categories and measured 10 covered, 51 partial, 41 gaps.
Its own limitations are recorded in the file and should be read before the gap
list is used as anything but a starting point: category purpose is inferred from
the name plus entry titles, because the page-level purpose text is templated and
carries no information; eleven placements are ambiguous and listed individually;
and cluster overlaps are resolved arbitrarily. It says where to look, not what to
build.

**The compliance position.** There is no evidence of derivation from any
third-party component source in this repository, and the one measurement taken
was a zero shared run of three to six consecutive Tailwind tokens against five
free reference blocks. The taxonomy survey read category listings and public
product documentation and no implementation at all. The originality and
similarity record is a self-assessment against a stated method: a gate can prove
a claim was made, not that it is true.
`docs/research/licensing-review-shadcnblocks.md` is the evidence for the method,
not a substitute for review by someone who did not write the code.

**One question no artifact in this repository can answer.** Whether anyone on
the team holds a shadcnblocks licence. No code would reveal it. If one exists,
the clause about building a UI library using Components becomes a live question
rather than a hypothetical. It is a question for a person.

**Three corrections were made during the mapping this spec comes from, all of
them the same mistake, and the pattern is worth carrying.** A rule was read at one
location and generalised to the whole system three times: the kind union's
compile-time tie, the `empty` roster contradiction, and a rule that turned out to
be about a documentation rail rather than about Pages. Each generalisation was
wrong. The check that catches it is cheap and should be applied from the start:
find the heading a sentence sits under, and read the sentence's own stated
reason. A rule carrying a specific reason is about the thing it names, not about
the class it belongs to.

**Do not pin a version.** The package versions moved during the mapping, and a
second agent is working the same repository. Read the tree.
