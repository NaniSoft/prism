import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Metric } from '../../components/ui/metric'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The tone a project's state is drawn in, from the semantic contract and no other.
 *
 * Keyed by the caller's own words rather than by a union, and the two states that
 * share a role are the same two that share it in `Project01`: `active` and
 * `complete` are both `success`, because a project that is running and a project
 * that finished are the two states a reader is glad to see, and the words beside the
 * dot are what tell them apart. `blocked` is `warning` and not `destructive` for the
 * reason `FieldMap01` gives for an unmapped field: a blocked project is a thing to
 * unblock rather than a breakage, and four amber rows is a dashboard with four tasks
 * in it while four red rows is a dashboard sending a reader looking for an incident
 * that is not happening.
 */
const STATE_TONE: Record<string, StatusTone> = {
  planning: 'info',
  active: 'success',
  blocked: 'warning',
  complete: 'success',
  archived: 'neutral',
}

/**
 * The tone a state is drawn in, falling back to the supporting ink.
 *
 * `neutral` for a state this table does not name, and the reason is that an
 * unrecognised state is not an emergency: it is a vocabulary this Block has not been
 * taught, and drawing it in the alarm colour would turn a naming mismatch into a page
 * of red panels.
 */
function toneOf(state: string): StatusTone {
  return STATE_TONE[state] ?? 'neutral'
}

/**
 * One figure in the row across the top.
 *
 * The same three fields `Project01` takes for its figures, declared separately
 * rather than imported for the reason `ProcessFlow01` gives on `ProcessStage`: a
 * dashboard and a detail header are different claims, and a caller composing one has
 * no reason to take the other's type, and sharing the declaration would invite a
 * caller to widen a dashboard figure by reaching for a detail field. The field names
 * are still the same on purpose, so a consumer with a project model has one model.
 */
export type ProjectDashboard01Figure = {
  /** What the figure measures, read under it. */
  label: string
  /** The figure itself, already formatted by the caller. */
  value: ReactNode
  /**
   * The change against the previous reading, as a number whose sign is the
   * direction. See `MetricDelta` on the Component.
   */
  delta?: number
}

/**
 * How much of the grid one panel takes.
 *
 * Three, and the set is a fraction of the row rather than a width in pixels: a
 * dashboard's panels are wide or narrow, and the honest question about a panel is
 * how much of the row beside it it wants, which is a proportion of the page rather
 * than a measurement of itself. `full` is a panel that wants the whole row, `half`
 * is a panel that shares it with one other, and `third` is a panel in a row of
 * three.
 */
export type ProjectDashboard01Span = 'full' | 'half' | 'third'

/**
 * The tracks each span takes, out of the six the grid is built from.
 *
 * Spelled out per span so the arithmetic is in one table rather than in three
 * places: six tracks, a half is three of them and a third is two. A map rather than
 * a lookup at the call site because the translation is a fact about this Block's
 * grid rather than about the caller's data, and a Block that computed it three times
 * in three places would be three chances to compute it once differently.
 */
const SPAN: Record<ProjectDashboard01Span, string> = {
  full: 'lg:col-span-6',
  half: 'lg:col-span-3',
  third: 'lg:col-span-2',
}

/**
 * One panel of the overview: what it is called, how much of the row it takes, the
 * controls that act on it, and its content.
 *
 * `children` is the whole of the panel and it is required, because a panel is a
 * frame around something the caller composed and an empty frame is a card with a
 * title and a gap in it. The six named panels this Block does not draw are the six
 * a project overview usually has: a chart, a run queue, a list of stages, the people
 * on it, its open issues and its recent activity. What a caller wants in them is a
 * fact about their product, and a pipeline wants the run queue wide and the
 * approvals narrow while an estate wants capacity wide and the fleet list narrow, so
 * a Block that chose which of the six it was would be a template wearing a
 * component's name.
 */
export type ProjectDashboard01Panel = {
  /** A stable key for the panel, so a test can name one of them. */
  id: string
  /**
   * What the panel is called, in the caller's own words.
   *
   * Omit it for a panel that is a chart or a list with nothing to say above it, and
   * the card draws no heading rather than an empty one. When it is given it is a
   * heading one level below the section, derived rather than written, so a
   * dashboard embedded one level deeper than it was written for carries its panel
   * titles with it.
   */
  title?: ReactNode
  /**
   * How much of the row this panel takes. Defaults to `half`.
   *
   * A proportion of the row rather than a width, and the default is `half` because
   * two panels beside each other is the arrangement that works for every number of
   * panels: one panel is half a row with a gap beside it, three are a row and a
   * half, and six are three rows of two.
   */
  span?: ProjectDashboard01Span
  /**
   * The controls that act on this panel rather than on the project: a range
   * selector, a view switcher, a sort, a link to the full list.
   *
   * A slot, and placed at the trailing edge of the panel's header beside its title
   * rather than above it, because a control the reader has to find is a control the
   * reader does not use, and the title is what the panel is for.
   */
  toolbar?: ReactNode
  /** The panel's content, which is the caller's own node. */
  children: ReactNode
}

/**
 * The props a ProjectDashboard01 takes.
 *
 * Every string and every number is a prop and the Block ships none: no project, no
 * state, no figure, no panel and not one panel title. The absence of the panels is
 * the sharpest version of the rule, because a dashboard is the surface most likely
 * to be shipped with somebody else's numbers in it: a set of figures invented to look
 * like a working product is worse than no dashboard, which is the argument
 * `Stats01` makes in full and the reason that Block's early version is a paragraph
 * on its own JSDoc.
 */
export type ProjectDashboard01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The project's own name.
   *
   * Required, and it is the section heading rather than a field inside the
   * dashboard, because a dashboard whose name is a line of body text has already
   * lost the outline: a reader navigating by heading would meet the section and then
   * nothing until the panels.
   */
  name: string
  /** One or two sentences about what this project is, under the name. */
  summary?: ReactNode
  /**
   * Where the project stands, in the product's own vocabulary.
   *
   * Optional, and paired with `stateLabel` rather than beside it: a state a reader
   * can only see is a state nobody can act on, so the words are required wherever
   * the dot is drawn, and the run refuses exactly one of the two rather than
   * drawing a dot with no sentence.
   */
  state?: string
  /** The words for that state. Required whenever `state` is given. */
  stateLabel?: string
  /** The figures, in the order a reader should meet them. */
  figures?: ProjectDashboard01Figure[]
  /**
   * The panels, in the order a reader should meet them.
   *
   * Order is the caller's because it is a claim about what a reader looks at first
   * on a page that is trying to tell them everything at once, and this Block does
   * not reorder panels to put a chart first: a dashboard whose top panel is the one
   * the product cares about is a claim the caller is better placed to make.
   */
  panels?: ProjectDashboard01Panel[]
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Block. */
  className?: string
}

/**
 * One project's overview: the figures across the top, and a grid of panels whose
 * spans the caller declares.
 *
 * **Every panel is a slot, and the reason is that what a project overview shows is a
 * fact about the project.** A pipeline wants the run queue wide and the approvals
 * narrow. An estate wants capacity wide and the fleet list narrow. A research group
 * wants the papers wide and the citations narrow. Three products, three entirely
 * different answers to "what is the most important thing on this page", and a Block
 * that chose one of them would be a template wearing a component's name: a consumer
 * whose most important panel is the narrow one would have to put it in a slot that
 * was not there, and the fix would be to fork the Block rather than compose it,
 * which is the one thing this package does not offer. So this Block owns three
 * things and nothing else: the grid, the spans, and the figures row. What goes in a
 * panel, what it is called, and how much of the row it wants are the caller's, and
 * the cost of that is named rather than hidden: a caller with a panel no Component
 * in this package can draw composes the row themselves inside the slot, and a
 * dashboard with no panels at all is a figures row, which is a real surface and a
 * short one.
 *
 * **The spans are proportions of a six-track row, and the row is the Block's rather
 * than the caller's.** A caller who could pass a width would be choosing between
 * pixels and fractions, and would have to keep the six answers in step by hand; the
 * alternative, a `span` of `1 | 2 | 3`, reads as a count of tracks and invites a
 * caller to pass a four that the row cannot express. So there are three words, they
 * are proportions, and the tracks behind them are in one table above. What that
 * costs is real and is on `ProjectDashboard01Span`: a dashboard that wants a fifth
 * of a row has no seam here, and the answer is two panels side by side, which is
 * also the arrangement that reads better on a phone.
 *
 * **The figures are `Metric` and the state is `Status`, and both were redrawn here
 * at first.** `Metric` owns the arrangement a headline figure is read in, which
 * puts the figure first and the name under it, and it owns the three things a
 * hand-rolled version gets wrong: that the direction is derived from the sign of
 * the number rather than declared beside it, that the rising mark is a glyph so
 * assistive technology names it in the reader's own language rather than through an
 * English `aria-label`, and that a string figure is set in the mono face while a
 * composed one is not. `Status` owns the dot and the arrangement that matters most on
 * a dashboard: the dot is `aria-hidden` and the words carry the state, so a reader
 * who cannot separate the tones still reads which is which, and a row of states
 * never becomes a row of colours. The one thing `Metric` cannot do is print a delta
 * it has no unit for, so a figure with a `delta` and no formatter prints the number
 * itself, which is honest and usually not what was wanted; the caller's answer is to
 * put the whole change in `value` as a node they formatted.
 *
 * **A panel's title is a heading one step below the section, derived rather than
 * written, and a panel with no title draws no heading at all.** A dashboard is
 * usually three to six titled cards under one heading, and hardcoding `h3` would be
 * right exactly once, at the nesting depth it was written for; `childLevel` is the
 * answer every Block in this package gives the same question, and a dashboard
 * embedded one level deeper than it was written for carries its titles with it. A
 * panel with no title is a chart with nothing to say above it, and an empty heading
 * is a gap the reader looks through.
 *
 * **An empty set renders the name and nothing else, which is the honest state for a
 * project with no data on it yet.** The alternative, an empty grid of empty cards,
 * is a page of six frames with nothing in them, and a reader who sees it concludes
 * the product is broken rather than that the data has not arrived.
 *
 * It is a server Component: no hook, no state, no client code of its own and no
 * router. What a panel contains is the caller's node, so a dashboard full of charts
 * costs a consumer nothing from this module.
 */
export function ProjectDashboard01({
  eyebrow,
  name,
  summary,
  state,
  stateLabel,
  figures,
  panels,
  headingLevel = 'h2',
  className,
}: ProjectDashboard01Props) {
  if ((state === undefined) !== (stateLabel === undefined)) {
    throw new Error(
      `ProjectDashboard01: "${name}" passes ${state === undefined ? 'a stateLabel with no state' : 'a state with no stateLabel'}, ` +
        'so the dashboard would draw a dot with no sentence beside it or a sentence about a state that is ' +
        'not there. A state a reader can only see is a state nobody can act on, so pass both or neither.',
    )
  }

  const Title = childLevel(headingLevel)

  return (
    <Section data-slot="project-dashboard-01" className={cn(className)}>
      <div data-slot="project-dashboard-head" className="flex flex-col gap-6">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={name}
          description={summary}
        />

        {state === undefined ? null : (
          <div data-slot="project-dashboard-state">
            <Status tone={toneOf(state)} label={stateLabel} />
          </div>
        )}
      </div>

      {figures === undefined || figures.length === 0 ? null : (
        <div
          data-slot="project-dashboard-figures"
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {figures.map((figure) => (
            <Metric
              key={figure.label}
              data-slot="project-dashboard-figure"
              value={figure.value}
              label={figure.label}
              delta={figure.delta}
            />
          ))}
        </div>
      )}

      {/*
        The grid, and the six tracks every span is a fraction of. Six rather than
        twelve because a twelfth of a row is not a width anybody composes with, and
        a six-track row is the finest division that still gives a panel a half, a
        third and a whole. `sm:grid-cols-2` is a narrowing rather than a widening:
        on a narrow screen a panel takes the row it is in, which is the right answer
        for a chart at phone width and for a list at phone width.
      */}
      {panels === undefined || panels.length === 0 ? null : (
        <div
          data-slot="project-dashboard-panels"
          className="mt-10 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-6"
        >
          {panels.map((panel) => (
            <Card
              key={panel.id}
              data-slot="project-dashboard-panel"
              data-panel={panel.id}
              data-span={panel.span ?? 'half'}
              className={SPAN[panel.span ?? 'half']}
            >
              {panel.title === undefined && panel.toolbar === undefined ? null : (
                <CardHeader className="flex items-center justify-between gap-4">
                  {panel.title === undefined ? null : (
                    <CardTitle as={Title} className="min-w-0">
                      {panel.title}
                    </CardTitle>
                  )}
                  {panel.toolbar === undefined ? null : (
                    <div
                      data-slot="project-dashboard-panel-toolbar"
                      className="flex shrink-0 items-center gap-2"
                    >
                      {panel.toolbar}
                    </div>
                  )}
                </CardHeader>
              )}

              {/*
                The panel's content, and nothing around it. A caller who wants a
                bounded, scrolling region composes `ListPanel` inside this slot; a
                Block that drew the bounds would be deciding how long a caller's
                list is allowed to be, which is a fact about their data.
              */}
              <CardContent className="min-w-0">{panel.children}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  )
}

export default ProjectDashboard01
