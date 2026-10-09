# The consumer gate kit, and where the law went

The five NaniSoft repositories used to coordinate through a prose contract
mirrored in four files. This document records what that contract became, and it
deliberately contains almost no rules: the rules are the failure messages of the
gates in `@nanisoft/prism-ui/gates`, and a rule restated here would be a second
copy of one of them.

## The mechanism, in one line

**The law is the failure message of a gate, and the gate is in the package every
consumer pins exactly.**

## Why it moved and not just moved somewhere else

A prose contract mirrored in four repositories cannot fail, so it stays true until
the day it is not and nobody is told. It had already drifted: two sites that
mattered held three implementations of one rule, and one of the three rules was
false. It also had a version line that nothing could act on, so one site spent a
release on a different component line from its three siblings while every gate was
green, because the gate that read the pin asked only whether the pin was exact and
it was.

A gate is a program in a package a consumer pins exactly, so a fix reaches four
repositories in one release and cannot be declined by a document nobody reads.
There is no version line, because the pinned package is the version and a sweep
is a release.

## The test for what is a law and what is a site's data

**A clause earns a law when its violation is silent.**

Every law in the kit is silent by construction. An unlayered bare-element
declaration of the page ground looks like a design decision in a screenshot. A
`var()` that resolves to nothing erases the declaration rather than painting a
wrong colour. A link that goes nowhere renders exactly like a link that works. A
pack boundary that resolves the light block on a dark page is pack-correct and
looks right. None of them throws. That is the whole reason they are programs.

So a consumer's repository holds only the facts only it knows: its stylesheets,
its pack map and the reason each region exists, its region resolver, its coverage
floors, the destinations its own corpus gets wrong, and the custom properties its
own build supplies. All of that is `prism-gates.json`, and every line of it is
data.

## Where the line was drawn, and why

The judgement on this ticket was which part of each of the four duplicated gate
programs is the law and which part is the site's data. The line:

| it was | it is now |
| --- | --- |
| the judgement about what competes with the design system's base rules | the law, in the kit |
| the seven property names | the law, in the kit, and derived rather than restated |
| the wording of every failure | the law, in the kit, once |
| the sheet this repository owns | its data, in `prism-gates.json` |
| how many declarations count as having read it | its data, in `prism-gates.json` |
| which pack map describes this landing | its data, in `prism-gates.json` |
| naming a region from a DOM node | its data, in `scripts/pack-regions.mjs` |
| the destinations this corpus gets wrong, with reasons | its data, in `prism-gates.json` |
| the custom properties this build supplies, with reasons | its data, in `prism-gates.json` |

The one that was genuinely contested is the region resolver. Naming a region means
knowing a page's own DOM, so it is the resolver rather than the gate that holds
the law about what a region is. It is a declared module rather than a table in the
kit because a fact about one page, kept in a file about all pages, is wrong the
moment the page changes. Three of the four sites ship the same resolver today and
that is four copies of about twenty lines, which is a number worth watching rather
than a law worth moving: they agree because three sites share one header and one
switcher and one numbered band, not because the kit says so.

## What was deliberately not moved

**The content-parity comparison.** `check-content-parity.mjs` was a one-time
instrument for the migration sweep, and its header says the baseline lives outside
the repository and is destroyed at the close of that sweep. So it is a historical
record as much as a gate, and it is not one of the laws in the kit: it asserts
that a rebuild changed the rendering layer and not the content, which is a
statement about one migration in four repositories rather than a rule any future
change must obey. It could not be a gate in the package because the thing it
compares against does not exist and never will again.

**The design system's own gates.** The utility cascade, the content joins, the
search budget, the client-JavaScript budget and the rest read this repository's
own tree. They are not cross-repository laws and moving them would put a build
step in four sites' module graphs.

## The published changes of this effort, and the test applied

The admin-screen effort widened a large part of the published interface: the
specification module and its five types, four forms and a settings region onto the
field specification, four figure owners onto the metric specification, the record
index onto typed columns and a per-row node, a record detail and a split and an
unrestricted empty state, and the deprecation of the issue detail Block. Each was a
candidate for a new law here, and each was decided rather than assumed, because a
law added for a mistake a compiler already names is a law that ships to spend a
release repeating what the consumer's own build already said.

The test is the one above, narrowed to a published widening: **a widening earns a
law here only when its violation is silent in a consumer's own repository in the
way every law in the kit is silent, where nothing throws, nothing fails to compile
and nothing on screen says the build is wrong, and only when the violation is a
fact about the consumer's repository that a program there has to read.** The kit
reads a consumer's stylesheet half, its pack map, its routes, its pin and its
hidden states. Where the compiler is the thing that names the mistake, the
compiler is the gate, and it runs in the consumer's own build before any Prism
program does.

| the published change | the ruling | why |
| --- | --- | --- |
| the five specification types and their three closed unions, the vocabulary a consumer now declares content with | no law | every member of `FieldKind`, `ColumnKind` and `RelationKind` is a string literal on a published union, and every member the five specifications refuse is refused by the compiler, so a consumer who breaks it gets a type error in its own build. The one pairing no type holds, a relation `href` without its `hrefLabel`, is a fact about the declaration this repository emits, which is the seam `check-spec-unions.mjs` reads, and not a program a consumer runs over its own tree. |
| the record write form's save union of three arms, and the setting region's copy of it | no law | each arm forbids the other two in the type, so the compiler holds it: a caller who passes two arms, or none where one is required, gets a type error. The union is the gate. |
| the record index's typed columns, its required row identity and selection callback, its batch node, its `selectionScope` count, its `groupBy` with its label, and its per-row node | no law | the typed columns, the required `getRowId`, the required `onSelectedIdsChange` and `batchActions` on the selectable arm, the `selectionScope` union carrying the filter `count`, and the `groupBy` and `groupLabel` union are each held by the compiler. The per-row `renderRowActions` node is the consumer's own composition, so a dead control inside it is the consumer's own data to hold; the law that a control must act is held for Prism's Blocks by `scripts/check-block-controls.mjs`, and the kit does not read how a consumer composes a Component. |
| the settings panel's retirement of its own field declaration, and its `sections` to `groups` and `secondaryAction` to `footerStart` | no law | `SettingsPanelField` is gone and the two old props no longer resolve, so the consumer's build names the mistake. |
| the four field declaration retirements and the Blocks whose props changed with them | no law | `AuthFormField`, `ContactField`, `ProvisioningField` and `SignupField` are gone and their Blocks take the shared field specification, so every old name and every old prop shape is a compile error. |
| the five metric migrations and the contract that deleted the superseded declarations | no law | `Dashboard01Metric`, `ProjectDashboard01Figure`, `ChartCard01Reading`, `Trend01Item` and `Stat` are gone and `MetricSpec` replaces them, so a consumer using any old name fails to compile, and a series without its label or a destination without its words is rejected by the type. |
| the activity trail and the audit log on the shared event specification | no law | `ActivityFeed01Event` is gone and `EventSpec` replaces it, so an entry's old `id` or a refused `kind` is a compile error, and the tone and destination pairs are checked by the Block at render rather than passed silently. |
| the deprecation of `IssueDetail01` in favour of `RecordDetail01` | no law | the export still resolves and renders, so there is no violation to fail on. A deprecation is a JSDoc tag and a catalogue status that a reader acts on and a build cannot, and a gate over it would fail a consumer whose screen works, which is the opposite of what a law is for. |
| the new record detail, split, unrestricted empty state and write form Blocks, and the fourth reason on the empty state union | no law | each is additive and typed. A consumer that enumerates `EMPTY_REASONS` gains a fourth member its own exhaustive handling already covers at compile time, and nothing else on the surface changed. |
| the repository gate that now classifies four controls | no law | no published surface changed: it is `scripts/check-block-controls.mjs`, a program of this repository, and the law it holds already reaches a consumer as the shape of its own Block. |

No law was added, so the kit is unchanged: the same gates and the same laws, and
no consumer is asked to move. A published change after this one runs this same
test in its own pull request, and when the answer is a law it lands here once, as
the failure message of a gate. The test is a rule rather than an event.

## The residual, stated rather than hidden

- The kit reads text, not a cascade. It cannot resolve which rule wins.
- It reads the emitted export, not a browser, so a consumer runs it after its
  build.
- It does not see a runtime that sets an attribute after paint.
- A stylesheet half is not a rendered half: a consumer that ships a hidden state
  also needs a test that renders with scripting switched off.
- `jsdom` is the consumer's dependency, resolved through the consumer's own
  manifest. The kit does not ship one, because a kit that did would add a copy to
  four repositories so that four gates could read four documents.
- The laws' own coverage floors are the consumer's to set. A floor is a statement
  about one repository's size, and the four are four different sizes.

## What was left undone, and why

**The kit is not published, so the four consumers have not been swept onto it
yet.** The trusted publisher is not configured on npmjs.com for these packages,
so the release lane cannot publish; 0.6.0, 0.7.0 and everything since shipped from
a maintainer's machine, which `CONTRIBUTING.md` records in full. A changeset is cut
for this release and nothing was published.

That is not a detail, it is the shape of the work. The sweep is a release, exactly
as the contract's own note said it would be: a consumer cannot import a subpath
that is not on the registry, so the four sites cannot run the kit until 0.8.0 is
published and installed. Two consequences, both deliberate:

- **The four sites keep their own gate programs, and their `pnpm check` still runs
  them.** Deleting them before the release would leave four repositories with no
  gate at all, which is a worse state than a duplicated one: a gate that cannot run
  reports nothing, and nothing reads as a pass.
- **Each site carries a `check:prism-gates` script that resolves the kit from its
  installed package.** On 0.7.0 the subpath does not exist and the script fails
  with the message the kit prints. It is not in the `check` chain yet, and it is
  the exact command that replaces the chain.

The sweep, in each of the four repositories, is then:

```sh
pnpm check:prism-gates        # red until the release lands, green after
# then: "check": "prism-gates" (plus any site-only gate), and delete the site's
# own retired-line gate, its link gate, its stylesheet-ownership gate, its
# pack-map gate and, on the one site that had it, its hidden-state gate
```

`packages/ui/gates/__tests__/gates.test.mjs` asserts the end state, so the sweep
cannot be forgotten quietly: it fails while any of those files exists, and the
failure names the repository and the file. Those three assertions skip, with that
reason printed, until a published version of the component package declares the
kit's subpath, because a consumer cannot delete a gate in favour of one it cannot
resolve. A skip that names its precondition is visible; a hard failure before the
release would be a red build that teaches everyone to ignore the lane.
