---
'@nanisoft/prism-ui': minor
---

Four more figure owners take the shared metric specification

`ChartCard01`, `ProjectDashboard01`, `Stats01` and `Trend01` now take the same
`MetricSpec` the metric summary takes, so a figure a consumer declares on one of
these surfaces is the same figure it declares on the others. This is the migrate
step of a breaking consolidation: five shapes are declared across this package
for a reading over a population, and they disagree about whether a delta is a
number or a percentage, about `deltaFormat`, about `hint`, and about whether a
series and a destination are part of a figure at all. This release moves the four
remaining owners onto `MetricSpec`, so one shape is left in use. Their superseded
local declarations stay exported as deprecated aliases until the contract ticket
deletes them, so an existing name continues to resolve.

**The shape every one of the four now takes.** A stable `key` that is never the
words of the label, a required `label` (a `ReactNode`) and `value` (the caller's
own node), a `delta` whose sign is the direction, an optional `deltaFormat` (the
caller's own words for the change, a `ReactNode` rather than a callback), an
optional `hint` for the period or the caveat, and an optional `series` with its
`seriesLabel` and an optional `href` with its `hrefLabel`. The two pairs are held
by the type: a series set without its name, or a destination set without its
words, does not compile.

**What changes per Block, and the arm that replaces each prop that goes.**

- **`ChartCard01`**: `ChartCard01Reading` becomes an alias of `MetricSpec`. A
  reading's `deltaFormat` is now the caller's own words rather than a `(value:
  number) => string` callback, so pass a node, and `key` is now required. The
  reading line draws the series and the destination too.
- **`ProjectDashboard01`**: `ProjectDashboard01Figure` becomes an alias of
  `MetricSpec`, `key` is now required, and a figure can now carry `deltaFormat`,
  `hint`, `series` and `href`. The bare `0.12` a delta without a formatter used to
  print is now a decision rather than a drift.
- **`Stats01`**: `Stat` becomes an alias of `MetricSpec`, `key` is now required,
  and a delta no longer has a percent sign appended to it. A delta with no
  formatter prints the number the caller passed, and a delta with a formatter
  prints the caller's own words.
- **`Trend01`**: `Trend01Item` becomes an alias of `MetricSpec`, a row's `id`
  becomes `key`, and `deltaLabel` becomes the `deltaFormat` node. A row can now
  carry a series and a destination, and a delta with no formatter prints the
  number rather than making the Block throw.

**What is kept, and what is still not owned.** Each Block keeps its own name,
kind and arrangement. `ChartGroup01`, the page fixtures and the site landing page
were updated at their call sites, because this package resolves the shared type
through the component package. No Block performs aggregation, derives a rate of
change, owns a period, a unit, a threshold, a target, a severity or a freshness
state, and none draws a period switcher, a comparison toggle or an export. A
metric's period stays the caller's own words, carried by `deltaFormat` and `hint`.

`@nanisoft/prism-ui/spec` is the type to import: `MetricSpec`, from
`@nanisoft/prism-ui/spec`, replaces `ChartCard01Reading`, `ProjectDashboard01Figure`,
`Stat` and `Trend01Item` at every call site.
