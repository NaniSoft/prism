---
'@nanisoft/prism-ui': minor
---

The metric summary Block takes the shared metric specification

`Dashboard01.metrics` is now a `MetricSpec[]` from `@nanisoft/prism-ui/spec`
rather than the Block's own figure shape. This is the first step of a breaking
consolidation: five metric shapes are declared across this package today and they
already disagree about whether a delta is a number or a percentage, about
`deltaFormat`, about `hint` and about whether a series and its name are part of a
figure at all. `MetricSpec` is the one shape, and this release makes the metric
summary Block the first surface to take it. The other four owners are migrated in
later batches, so this is one Block wider rather than five replaced at once.

**What a figure is now.** Every entry is a `MetricSpec`: a stable `key` that is
never the words of the label, a required `label` and `value`, a `delta` whose sign
is the direction, an optional `deltaFormat` carrying the caller's own words for
that change, an optional `hint` for the period or the caveat, and an optional
`series` with its `seriesLabel` and an optional `href` with its `hrefLabel`. The
two pairs are held by the type: a series set without its name, or a destination set
without its words, does not compile.

**What changes for a consumer.** `label` is now a `ReactNode`, so a caller that
passed a string passes the same string and a caller that passed a node keeps it.
`deltaFormat` is the caller's own words rather than a `(value: number) => string`
callback, so `deltaFormat: (v) => String(Math.abs(v))` becomes
`deltaFormat: '3 fewer than yesterday'` and the direction mark still comes from the
sign of `delta`. `sparkline` and `sparklineLabel` are now `series` and
`seriesLabel`, and `key` is now required. `Metric` takes the words as a node when
the Block hands them over, so a delta with a formatter prints the caller's words
and a delta without one prints the number the caller passed.

**`Dashboard01Metric` is kept as an alias** of `MetricSpec` so an existing name
resolves while the other four figure owners are migrated. It is a synonym on its
way out, not a second shape, and a later contract release removes it alongside the
superseded `ProjectDashboard01Figure`, `ChartCard01Reading`, `Trend01Item` and
`Stat`.

**Nothing else is owned.** The Block still performs no aggregation, owns no period,
no unit, no threshold, no target, no severity and no freshness, and draws no period
switcher, no comparison toggle and no export.
