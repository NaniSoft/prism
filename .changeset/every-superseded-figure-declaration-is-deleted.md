---
'@nanisoft/prism-ui': major
---

Every superseded figure declaration is deleted

The five local declarations of a reading over a population are gone from the
published interface, and `MetricSpec` from `@nanisoft/prism-ui/spec` is the one
shape a figure is declared with in this package. The expand step made each of the
five an alias of the shared type so an old name resolved while its callers moved;
this is the contract step, and it deletes every one of them now that a search of
the whole tree, the documentation and the corpus finds no caller left. Deleted:

- `Dashboard01Metric`, from `@nanisoft/prism-ui/blocks/dashboard-01`.
- `ProjectDashboard01Figure`, from `@nanisoft/prism-ui/blocks/project-dashboard-01`.
- `ChartCard01Reading`, from `@nanisoft/prism-ui/blocks/chart-card-01`.
- `Trend01Item`, from `@nanisoft/prism-ui/blocks/trend-01`.
- `Stat`, from `@nanisoft/prism-ui/blocks/stats-01`.

`Dashboard01`, `ProjectDashboard01`, `ChartCard01`, `Trend01` and `Stats01` keep
their own names, kinds and arrangements; only the shape is shared, because a shape
is shared and a screen is not. This is the close of the metric expand-contract
sequence, and the count of declarations describing a reading over a population in
this package is one.

The process stage shape, `ProvisioningStep`, stays declared with `Provisioning01`
and is not migrated. It is the inside of one Item rather than a shape two Items
would each declare, and a declared stage has not happened, so it is not migrated
onto the event specification either.

# Migration

- Replace every use of `Dashboard01Metric`, `ProjectDashboard01Figure`,
  `ChartCard01Reading`, `Trend01Item` and `Stat` with `MetricSpec`, imported from
  `@nanisoft/prism-ui/spec`.
- The shape is unchanged, so the migration is a rename of the type reference. A
  figure or row still carries `key`, `label` and `value`, and the optional `delta`,
  `deltaFormat`, `hint`, `series` with `seriesLabel`, and `href` with `hrefLabel`.
- A build that reports one of the five names as missing is reporting a name that
  was deleted here rather than an exported entry that moved.
