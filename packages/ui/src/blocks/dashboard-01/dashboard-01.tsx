import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Sparkline } from '../../components/ui/sparkline'
import type { MetricSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * How much of the six-track panel grid one panel takes.
 *
 * Three names rather than a number, and the arithmetic is the argument. A
 * `colSpan: number` prop hands this Block a grid instead of a panel: it would have
 * to reproduce an arrangement exactly, including the arrangements nobody can lay
 * out, because a span of 7 in a six-track grid type-checks, renders, and produces a
 * composition no reader can reason about. A third, a half and the whole are the
 * three relationships a set of panels can have to each other, and they add up to
 * compositions by arithmetic the caller never performs: two halves side by side, a
 * full width under a row of thirds, two thirds above a row of halves.
 */
export type Dashboard01Span = 'full' | 'half' | 'third'

/**
 * One panel in the grid: an identifier, how much width it takes, and the caller's
 * own content.
 *
 * `children` is required and `title` is not, and that is deliberate. A panel with
 * no title is a list, a queue, or a run console: all three are panels and none of
 * them is a titled region, and a heading invented for them would be a claim about
 * somebody else's product. A panel with a title is a titled region, and then the
 * outline says so.
 */
export type Dashboard01Panel = {
  /** A key unique within the set, carried on the markup as `data-panel`. */
  id: string
  /** The panel's title, drawn as a heading one step below the section. */
  title?: ReactNode
  /** How much of the grid the panel takes. See `Dashboard01Span`. */
  span?: Dashboard01Span
  /**
   * The controls that act on the whole panel rather than on one row of it: a
   * filter, a refresh, a link to the whole set.
   *
   * A slot and not a set of named controls, because which controls a panel has is
   * the consumer's fact. A panel that drew a search box and a sort would be a panel
   * that assumed the list it holds is searchable and sortable.
   */
  toolbar?: ReactNode
  /**
   * The band under the panel's content, for the actions that belong to the whole
   * panel: load more, or the line saying how much of the set is shown.
   *
   * Distinct from `toolbar` because a header acts on the panel and a footer ends it.
   * Merging them would put a control that has to stay reachable in a band a reader
   * has to scroll to reach.
   */
  footer?: ReactNode
  /** The panel's content. The caller's own list, table, figure or console. */
  children: ReactNode
}

/**
 * The props a Dashboard01 takes. Every string is a prop and the Block ships none.
 */
export type Dashboard01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a dashboard composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The page header above everything, usually the caller's own `PageHeader01`.
   *
   * A slot, and not a set of title, breadcrumb and action props, for the reason
   * `AppShell01` gives for its top bar: the header of a product screen is a
   * composition the product has already made, with its own trail and its own
   * actions, and a Block that redrew the parts of it would be a second implementation
   * of an Item that is already in this package.
   */
  header?: ReactNode
  /**
   * The figures along the top, as the shared `MetricSpec` typed data, in the order
   * a reader should meet them.
   *
   * **It is the shared specification and not a shape of this Block's own.** `key`,
   * `label` and `value` are required on each figure, `delta` is a number whose sign
   * is the direction, `deltaFormat` is the caller's own words for that change,
   * `hint` carries the period or the caveat, and a `series` and an `href` each
   * travel with the label or the words they cannot be read without. The type is
   * published as `@nanisoft/prism-ui/spec` so the words a caller learns on this row
   * are the words on every other figure surface.
   *
   * Order is the caller's because it is a claim about what matters first. A row
   * that sorted itself by size or by name would be making that claim on the
   * caller's behalf, and on a dashboard the claim is the whole point.
   */
  metrics?: MetricSpec[]
  /** The panels, in the order a reader should meet them. See `Dashboard01Panel`. */
  panels?: Dashboard01Panel[]
  /**
   * The narrow column at the right-hand edge of the screen, above `lg`.
   *
   * A slot, and the reasoning is the Block's own JSDoc rather than a line here. The
   * short version: the right column of a dashboard is a queue, a watchlist or a set
   * of links in any given product, and a Block cannot know which.
   */
  rail?: ReactNode
  /**
   * What stands in for the whole body when there is no metric, no panel and no rail.
   *
   * A `ReactNode` and not a string, because the sentence a reader reaches an empty
   * overview with is the one sentence on the surface nobody can write for them: it
   * says what should have been there, and only the caller knows.
   */
  empty?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * What each named span takes of the six tracks, at the breakpoint the grid appears.
 *
 * A map of machine values rather than three conditional class strings, so the
 * relationship between a span name and a track count is one table a reader can
 * check in one place. Every value is a `col-span` utility and nothing else, and
 * `className` being layout only is the reason the grid placement lives here rather
 * than on the caller.
 */
const SPAN: Record<Dashboard01Span, string> = {
  third: 'lg:col-span-2',
  half: 'lg:col-span-3',
  full: 'lg:col-span-6',
}

/**
 * The refusals, as checks, so a tile that would render a control nobody can name is
 * a diagnostic in a console rather than a rendered link.
 *
 * **The type already holds both pairs, and these checks exist for the caller the
 * type never saw.** `MetricSpec` requires a destination's words wherever it has a
 * destination and a series name wherever it has a series, so a typed caller cannot
 * reach either diagnostic. A JavaScript caller can, and the cost of reaching one is
 * a tile that draws a link with no words or a shape no reader can announce, so the
 * same rule is stated once more where a runtime value can be read: the pair rule is
 * the one `Changelog01` and `ContentGrid01` make, and the series name is the one
 * `Sparkline` gives in full.
 */
function assertMetrics(metrics: readonly MetricSpec[]): void {
  for (const metric of metrics) {
    if ((metric.href === undefined) !== (metric.hrefLabel === undefined)) {
      throw new Error(
        `Dashboard01: the metric "${metric.key}" declares one of href and hrefLabel without the other, so the ` +
          'tile would carry a link with no words on it, or a name with no link beside it. Pass the words that say ' +
          'what following it does, or omit the href.',
      )
    }
    if ((metric.series === undefined) !== (metric.seriesLabel === undefined)) {
      throw new Error(
        `Dashboard01: the metric "${metric.key}" declares one of series and seriesLabel without the other, so the ` +
          'figure would be a picture with no name, which a screen reader cannot announce and two shapes in one row ' +
          'cannot be told apart. Pass the series name in the words the product uses, or omit the series.',
      )
    }
  }
}

/**
 * An overview screen composed entirely of slots: a caller own header, a row of
 * figures, a grid of panels, and an optional narrow column at the right.
 *
 * **The composition is the whole design, and the reason is that an overview's shape
 * is a fact about the product rather than about the design system.** A pipeline
 * wants the run queue wide and the ledger beside it. An estate wants capacity wide
 * and a watchlist down the side. A trading floor wants a watchlist wide and the
 * queue beside it. Four NaniSoft products want four arrangements, and every one of
 * them is right for its own screen. A Block that picked one would be a template, and
 * a template carries an opinion about hierarchy that every consumer inherits: the
 * consumer who wants the argument on the right has three answers, restyle a
 * catalogue item, wrap it, or accept a page whose most important panel is the one
 * Prism happened to put first. So `panels` is a list with a width on each entry and
 * this Block's only remaining opinion is the six-track grid they are placed on.
 *
 * **The figures are typed by the shared `MetricSpec` and drawn by `Metric` and
 * `Sparkline`, and a dashboard that hand-drew its own metric row would be a second
 * implementation of a Component whose whole argument is that the direction is derived
 * rather than declared.** The row is a list of the same specification every other
 * figure surface takes, published as `@nanisoft/prism-ui/spec`, so a consumer that
 * learned the shape here exports it unchanged to a project dashboard and a summary
 * panel. `Metric`'s delta is a `number` and the sign is the direction, so a rising
 * mark cannot be drawn on a falling reading; a Block that took `{ value, direction }`
 * could, and the mistake would be invisible in review and visible to every reader of
 * that dashboard. It also puts the label under the value, which is the arrangement a
 * dashboard row wants, because a row is scanned by its figures and settled by its
 * names. And `Sparkline` draws the numbers behind its shape as a table in the
 * document, so a metric row of six costs six tables in the accessibility tree rather
 * than six pictures nobody can query. The cost is stated rather than implied: a series
 * needs a name and a series that is not flat, and a caller who passes an empty array
 * or a series of one repeated value gets `Sparkline`'s own refusal, which is the
 * right place for it.
 *
 * **The panels are `Card` and not `ListPanel`, and the reason is what a panel
 * usually holds.** `ListPanel` exists for a long list, and its reason is stated in
 * its own JSDoc: a panel that grows to the length of its list is a frame around a
 * page. A dashboard panel is bounded by what fits above the fold, not by a number of
 * rows, so the bound is the caller's own composition and the scroll is the caller's
 * own choice. What a dashboard panel does need is a title that is a heading, and
 * `ListPanel` draws its title as a `span` because four panels in a grid are four
 * titles under one section heading; a dashboard is exactly that case, and this
 * Block wants the outline, so it takes the `Card` whose title is a real element. The
 * price is that a panel of four hundred rows grows until the caller wraps it in
 * something bounded, which is a decision about the data and therefore theirs.
 *
 * **The rail is a slot and not a property of a row, and the reason is that the
 * right-hand column is three different things in three different products.** In a
 * pipeline it is the run queue. In an estate manager it is a watchlist of the nodes
 * that are degraded. In a consumer product it is a set of links. None of them is a
 * property of a metric or a panel, and a Block that drew it would be drawing one of
 * the three for all of them. So it is a column and the caller fills it, and the
 * column is narrow because a rail that competes with the panels has stopped being a
 * rail.
 *
 * **The measurement that sets the widths, stated as arithmetic rather than taste.**
 * The container is `Section`'s, which is a 72rem measure with 2rem of padding at
 * each edge, so 68rem of content. With a rail the main column takes three of four
 * tracks, which is about 50rem, and the rail takes the fourth, which is about 17rem.
 * A `third` panel inside that main column is then about 16rem and a `half` is about
 * 24rem, against 22rem and 33rem in a dashboard with no rail. That is the cost of
 * the rail and it is real: a `third` panel beside a rail is tight, and a product
 * whose dashboard is mostly rail wants a `Page` rather than this Block. The layout
 * is `lg` and up in both cases, because a phone has one column and a rail beside
 * panels is two things a 360 pixel screen cannot show.
 *
 * **A panel title is a heading one step below the section, and the level is derived
 * rather than written.** The panels are a set of titled regions, so the outline
 * says so, and a Block embedded one level deeper carries its outline with it
 * instead of announcing six siblings of the section that introduces them. A panel
 * with no title draws no heading at all, which is a list and is a valid panel.
 *
 * **An overview with nothing in it renders `empty` and no grid.** The rule is
 * `FactList`'s: a frame around nothing is a gap the reader looks through, and a
 * six-track grid with no panels in it is a gap six tracks wide. The alternative was
 * to draw the grid regardless so the page does not reflow when the first panel
 * arrives, and the cost of that is a dashboard whose first paint is an empty box.
 *
 * It is a server Component: no hook, no state, no client code and no motion. A
 * caller that wants a control in a panel composes it in the panel's own slot, which
 * is the arrangement a `ReactNode` exists for.
 */
export function Dashboard01({
  eyebrow,
  title,
  description,
  header,
  metrics = [],
  panels = [],
  rail,
  empty,
  headingLevel = 'h2',
  className,
}: Dashboard01Props) {
  // A panel's title is a heading one step below the section that introduces the set,
  // so a Block embedded one level deeper carries its outline with it.
  const PanelTitle = childLevel(headingLevel)

  if (metrics.length > 0) assertMetrics(metrics)

  const hasRail = rail !== undefined && rail !== null && rail !== false
  const hasLead = header !== undefined || title !== undefined
  const hasBody = metrics.length > 0 || panels.length > 0 || hasRail

  return (
    <Section data-slot="dashboard-01" className={className}>
      {/*
        The header and the section heading sit above the body grid rather than inside
        the main column, because a page header belongs to the screen and not to one
        column of it: a caller's `PageHeader01` carries a breadcrumb trail and a rule
        under it, and both of those are about the whole container. Below them the grid
        arrives, with the rail as its fourth track.
      */}
      <div data-slot="dashboard-01-lead" className="flex flex-col gap-8">
        {header === undefined ? null : (
          <div data-slot="dashboard-01-header">{header}</div>
        )}

        {title === undefined ? null : (
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        )}
      </div>

      <div
        data-slot="dashboard-01-body"
        className={cn(
          'flex flex-col gap-8',
          // The gap between the header and the body is a fact about whether the lead
          // drew anything, so it arrives with that fact rather than as a margin on
          // two of the three possible children.
          hasLead ? 'mt-8' : null,
          hasRail ? 'lg:grid lg:grid-cols-4 lg:items-start lg:gap-6' : null,
        )}
      >
        <div
          data-slot="dashboard-01-main"
          className={cn('flex min-w-0 flex-col gap-6', hasRail ? 'lg:col-span-3' : null)}
        >
          {/*
            The figure row. Two columns below `lg` and four above it, because four
            figures across a 68rem container leaves each tile about 16rem, and a
            tile holds a figure, a label, a hint and a 96 pixel sparkline: the
            sparkline is a fixed width, so a tile that ran out of room would either
            squeeze it or wrap the whole figure, and a metric row where the figures
            are on different baselines is a row nobody can scan.
          */}
          {metrics.length > 0 ? (
            <div
              data-slot="dashboard-01-metrics"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {metrics.map((metric) => {
                // The delta's words are the caller's own node, and `Metric` takes a
                // formatter, so the node is placed through one. A delta with no words
                // is left to `Metric`, which prints the number the caller passed.
                const deltaWords = metric.deltaFormat
                return (
                  <Card
                    key={metric.key}
                    data-slot="dashboard-01-metric"
                    data-metric={metric.key}
                    className="gap-4 py-5"
                  >
                    <CardContent className="flex flex-col gap-3">
                      <Metric
                        value={metric.value}
                        label={metric.label}
                        delta={metric.delta}
                        deltaFormat={deltaWords === undefined ? undefined : () => deltaWords}
                        hint={metric.hint}
                      />
                      {metric.series === undefined ? null : (
                        <div data-slot="dashboard-01-sparkline" className="flex">
                          {/*
                            Pushed to the trailing edge so the sparklines in a row line
                            up with each other, which is what makes the row read as one
                            band of figures rather than four tiles with pictures at
                            four different offsets. The label is not optional here:
                            `MetricSpec` requires a series name wherever a series is
                            set, so the type has already refused the one case the cast
                            used to stand in for.
                          */}
                          <Sparkline
                            values={metric.series}
                            label={metric.seriesLabel}
                            className="ms-auto"
                          />
                        </div>
                      )}
                    </CardContent>

                    {metric.href === undefined ? null : (
                      <CardFooter data-slot="dashboard-01-metric-link" className="justify-end">
                        <CtaLink href={metric.href} variant="ghost" size="sm">
                          {metric.hrefLabel}
                        </CtaLink>
                      </CardFooter>
                    )}
                  </Card>
                )
              })}
            </div>
          ) : null}

          {/*
            The panel grid is six tracks at `lg` and one column below it. A dashboard
            is worse on a phone than a stack, because a panel that is half a phone
            wide is a panel nobody can read a table in, so below the breakpoint every
            panel is full width and the widths are the first thing to lose.
          */}
          {panels.length > 0 ? (
            <div data-slot="dashboard-01-panels" className="grid gap-4 lg:grid-cols-6">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  data-slot="dashboard-01-panel"
                  data-panel={panel.id}
                  className={SPAN[panel.span ?? 'full']}
                >
                  <Card className="h-full gap-4 py-5">
                    {panel.title === undefined && panel.toolbar === undefined ? null : (
                      <CardHeader className="grid-cols-[minmax(0,1fr)_auto] gap-x-3">
                        {panel.title === undefined ? null : (
                          <CardTitle as={PanelTitle} className="text-base">
                            {panel.title}
                          </CardTitle>
                        )}
                        {panel.toolbar === undefined ? null : (
                          <div
                            data-slot="dashboard-01-panel-toolbar"
                            className="flex min-w-0 items-center gap-2"
                          >
                            {panel.toolbar}
                          </div>
                        )}
                      </CardHeader>
                    )}

                    <CardContent>{panel.children}</CardContent>

                    {panel.footer === undefined ? null : (
                      <CardFooter data-slot="dashboard-01-panel-footer">
                        {panel.footer}
                      </CardFooter>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ) : null}

          {/*
            An overview with nothing in it. The grids above are not drawn, so there
            is no six-track gap to look through, and the caller's own words stand
            where the body would have been.
          */}
          {hasBody ? null : <div data-slot="dashboard-01-empty">{empty}</div>}
        </div>

        {hasRail ? (
          <div data-slot="dashboard-01-rail" className="flex min-w-0 flex-col gap-4 lg:col-span-1">
            {rail}
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export default Dashboard01
