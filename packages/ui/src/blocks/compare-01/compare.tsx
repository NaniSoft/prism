import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/** One row of the comparison, when each point carries its own label. */
export type Compare01Point = {
  /**
   * The row's name, as the caller writes it.
   *
   * A short noun phrase. The column is scanned top to bottom, and a label that
   * wraps to two lines is a row whose two values sit at different heights.
   */
  label: string
  /** The value on this arm. The caller's node, rendered as the caller wrote it. */
  value: ReactNode
}

/**
 * One row of the comparison, when the shared `labels` array names it.
 *
 * `label` is declared `never` rather than merely optional, so a caller who passes
 * the shared array and also labels a point gets a type error instead of a matrix
 * whose left column is named twice by two different words. See
 * `Compare01Props.labels`.
 */
export type Compare01SharedPoint = {
  /** Forbidden on this arm. The Block's `labels` array names this row. */
  label?: never
  /** The value on this arm. */
  value: ReactNode
}

/**
 * One arm of a comparison whose points carry their own labels.
 *
 * `name` is the arm's title: a `th scope="col"` in the `table` form and a heading
 * at `childLevel(headingLevel)` in the `stacked` form, so it is the one thing in
 * the Block a reader navigating by heading can land on.
 */
export type Compare01Arm = {
  /** The arm's name, as the caller writes it. */
  name: string
  /** One or two sentences about the arm, under its name. */
  summary?: ReactNode
  /** A slot for whatever shows the arm: a figure, a screenshot, a code sample. */
  media?: ReactNode
  /**
   * The rows, in the order a reader should meet them, each carrying its own
   * label. Order is the caller's because it is a claim about which difference
   * matters first.
   */
  points: readonly Compare01Point[]
}

/**
 * One arm of a comparison whose rows are named by the shared `labels` array.
 *
 * The same arm as `Compare01Arm` with the point's own label removed, which is the
 * whole difference: the row names are one list because the two arms are the same
 * shape, and a caller who has reached that conclusion should write it once.
 */
export type Compare01SharedArm = {
  /** The arm's name, as the caller writes it. */
  name: string
  /** One or two sentences about the arm, under its name. */
  summary?: ReactNode
  /** A slot for whatever shows the arm. */
  media?: ReactNode
  /** The rows, positionally paired with the Block's `labels`. */
  points: readonly Compare01SharedPoint[]
}

/** The two arm shapes side by side, which is what a caller actually holds. */
type Compare01AnyArm = Compare01Arm | Compare01SharedArm

/** The two point shapes side by side. */
type Compare01AnyPoint = Compare01Point | Compare01SharedPoint

/**
 * The props a Compare01 takes.
 *
 * The last member is a union, and the union is the decision this Block made once.
 * A comparison has a left column of row names, and there are exactly two ways to
 * supply it: the names live on the points, or they live in one array that applies
 * to both arms. Supporting both at once per arm is the shape this type refuses,
 * because a comparison whose left arm names its rows and whose right arm does not
 * is a table whose middle column is prose on one side and silence on the other,
 * and the reader has to work out which side is the naming side. So the choice is
 * made once, at the top, and the losing arm declares `label` as `never` so the
 * compiler can see it. The cost is a props type a caller has to read before they
 * write anything, and it is paid for a reason that shows up in the rendered page
 * rather than in a type error.
 *
 * Every string is a prop and the Block ships none: no arm name, no summary, no row
 * name and no value.
 */
export type Compare01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Omit it for a comparison composed under its own heading. */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * Which form the comparison takes.
   *
   * `table` is a real table, and it scrolls sideways on a narrow screen, because a
   * table that restacks has stopped being a table and a reader comparing by
   * attribute is reading across a row. `stacked` puts one arm above the other and
   * collapses to a single column, which costs the reader the side-by-side
   * alignment they came for and buys them a page they can read on a phone. Both
   * are legitimate and the difference is a fact about the reader's device rather
   * than about the two things being compared, so the Block offers the two and does
   * not pick. The rejected alternative was deciding from the viewport alone, which
   * is a media query making a claim about how a reader compares.
   *
   * @defaultValue 'table'
   */
  variant?: 'table' | 'stacked'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout classes for the comparison. Layout only; every visual property is Prism's. */
  className?: string
} & (
  | {
      /**
       * Forbidden on this arm: the points carry their own labels, and a shared
       * array beside them would be a second place for the same words.
       */
      labels?: never
      /** The left arm. */
      left: Compare01Arm
      /** The right arm. */
      right: Compare01Arm
    }
  | {
      /**
       * The row names, one per row, in the order the rows appear. Required on
       * this arm because it is what names the left column, and a comparison with
       * no named rows is two columns of values with nothing to align them on.
       */
      labels: readonly string[]
      /** The left arm. Its points carry no labels of their own. */
      left: Compare01SharedArm
      /** The right arm. Its points carry no labels of their own. */
      right: Compare01SharedArm
    }
)

/**
 * The row names, read from whichever shape arrived.
 *
 * The two branches are the union's two arms, and only one of them is reachable for
 * a given `shared`: with the shared array present every element is a
 * `Compare01SharedPoint` and the array is the total source of names, and with it
 * absent every element is a `Compare01Point` whose `label` is required. The
 * `?? ''` is the price of holding both element types in one array, and it is
 * unreachable for a caller who wrote TypeScript.
 */
function rowNames(
  points: readonly Compare01AnyPoint[],
  shared: readonly string[] | undefined,
): readonly string[] {
  if (shared !== undefined) return shared
  return points.map((point) => point.label ?? '')
}

/** One row of the `table` form: the row's name, then a value per arm. */
function CompareRow({
  label,
  left,
  right,
}: {
  label: string
  left: ReactNode
  right: ReactNode
}) {
  return (
    <TableRow>
      <TableHead scope="row" className="w-56 align-top whitespace-normal font-normal">
        <span className="text-sm font-medium">{label}</span>
      </TableHead>
      <TableCell className="align-top whitespace-normal">{left}</TableCell>
      <TableCell className="align-top whitespace-normal">{right}</TableCell>
    </TableRow>
  )
}

/** One arm of the `stacked` form: a titled card, its media, and its own rows. */
function StackedArm({
  name,
  summary,
  media,
  points,
  rows,
  Heading,
}: {
  name: string
  summary?: ReactNode
  media?: ReactNode
  points: readonly Compare01AnyPoint[]
  rows: readonly string[]
  Heading: HeadingLevel
}) {
  return (
    <Card data-slot="compare-arm" className="gap-4">
      <CardHeader>
        <CardTitle as={Heading}>{name}</CardTitle>
        {summary ? <CardDescription>{summary}</CardDescription> : null}
      </CardHeader>
      {media ? <div data-slot="compare-media">{media}</div> : null}
      <CardContent>
        {/*
          A definition list, for the reason `NoteGrid01` is one: each row name is
          a term and the value beside it is that term's explanation, and a `dl` is
          what tells a screen reader so. The arms are read one after the other
          rather than across, which is what the `stacked` form is for.
        */}
        <dl className="flex flex-col gap-3">
          {points.map((point, index) => (
            <div key={index} className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground text-xs font-medium">{rows[index]}</dt>
              <dd className="text-pretty text-sm">{point.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

/**
 * Two things side by side, in the shape the word "compare" usually means: a
 * two-column band with a shared row of labels down the left.
 *
 * **Prism ships no verdict, and the absence is the feature.** A compare Block is
 * the one place on a marketing page where the surface is allowed to be unfair, and
 * that is exactly why a design system has no standing in it. So there is no
 * winner state, no check on the better column, no default highlight, no `featured`
 * arm and no prop that would produce one. A design system that marks a winner is
 * making a claim about a market it knows nothing about, in the same terms `Price`
 * refuses to pick a currency: Prism is not entitled to a verdict either, and the
 * two refusals are the same refusal. The cost is real and worth naming. A Block
 * that could mark a winner would be a shorter thing to sell, it would demo better,
 * and every consumer who used it would be publishing a comparison a competitor
 * could read. So the Block lays out two arms, draws both at the same weight, and
 * stops. The arms do not even take a `highlight`: symmetry is cheaper to defend
 * than a documented exception.
 *
 * **A row whose two arms disagree is a row, and the Block says nothing about which
 * is better.** There is no em, no tick, no colour and no ordering between the
 * arms. A `value` is a node the caller composed, so a consumer that wants a check
 * in one column puts a check in one column, in their own words and with their own
 * judgement behind it, and Prism's part in that is not disagreeing. The cost of
 * that refusal is that a caller cannot get a comparison to declare itself in one
 * line, and the answer is that a comparison which declares itself is not a
 * comparison any more.
 *
 * **The two narrow-screen answers are the caller's, and the Block decides once
 * rather than per row.** `table` scrolls sideways on a narrow screen and `stacked`
 * puts one arm above the other, for the reason `Compare01Props.variant` gives. The
 * narrow-screen decision is made once, here, because a Block that re-decided it
 * per row would be a table whose first two rows stack and whose rest do not.
 *
 * **The label column is a real column and the choice of who names it is made once.**
 * See `Compare01Props` for the union. A shared array is the better fit when the two
 * arms are the same shape, which is the usual case, and per-point labels are the
 * better fit when one arm has a row the other has no answer for. What is not
 * available is the half-and-half case, because a left column named by two
 * mechanisms is a column no reader can rely on.
 *
 * **Arms of different lengths are refused rather than padded.** A column with a
 * missing cell is a claim about a product, made by a comparison whose own data
 * disagreed with it, and no amount of quiet padding makes that the caller's
 * intent. The check runs before anything is rendered, and it names both counts in
 * the message so the fix is a one-line edit at the call site.
 *
 * It is a server Component: no hook, no state, no client code and no router.
 */
export function Compare01(props: Compare01Props) {
  const { eyebrow, title, description, variant = 'table', headingLevel = 'h2', className } = props
  const shared = props.labels
  const { left, right } = props
  const leftPoints = left.points
  const rightPoints = right.points

  if (leftPoints.length !== rightPoints.length) {
    throw new Error(
      `Compare01: the arm '${left.name}' has ${leftPoints.length} point(s) and the arm ` +
        `'${right.name}' has ${rightPoints.length}. A comparison whose arms are different lengths is a ` +
        'column with a missing cell, so the lengths are checked rather than padded.',
    )
  }
  if (shared !== undefined && shared.length !== leftPoints.length) {
    throw new Error(
      `Compare01: the arm '${left.name}' has ${leftPoints.length} point(s) and labels has ` +
        `${shared.length} name(s). A comparison whose rows are not named one for one is a row with no ` +
        'name or a name with no row, so the lengths are checked rather than padded.',
    )
  }

  const rows = rowNames(leftPoints, shared)
  // The arm names are the two column headings, so they are titles inside the
  // section that introduces the comparison.
  const ArmHeading = childLevel(headingLevel)

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      {variant === 'stacked' ? (
        <div
          data-slot="compare"
          data-variant="stacked"
          className={cn('grid gap-6 lg:grid-cols-2', className)}
        >
          <StackedArm
            name={left.name}
            summary={left.summary}
            media={left.media}
            points={leftPoints}
            rows={rows}
            Heading={ArmHeading}
          />
          <StackedArm
            name={right.name}
            summary={right.summary}
            media={right.media}
            points={rightPoints}
            rows={rows}
            Heading={ArmHeading}
          />
        </div>
      ) : (
        <div
          data-slot="compare"
          data-variant="table"
          className={cn('flex flex-col gap-4', className)}
        >
          <div className="border-border overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  {/*
                    The corner. Empty on purpose: the first column holds row
                    headers, so a word here would name a column of row names, which
                    is not what the column is.
                  */}
                  <TableHead className="w-56" />
                  {([left, right] as const).map((arm, index) => (
                    <TableHead
                      key={index}
                      scope="col"
                      className="whitespace-normal align-bottom"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <ArmHeading className="text-base font-semibold tracking-tight text-balance">
                          {arm.name}
                        </ArmHeading>
                        {arm.summary ? (
                          <span className="text-muted-foreground text-sm font-normal">
                            {arm.summary}
                          </span>
                        ) : null}
                        {arm.media ? <div data-slot="compare-media">{arm.media}</div> : null}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  // Positional: a row name is display content and a caller may
                  // legitimately compare the same attribute twice under two
                  // headings, which keying on the name would punish.
                  <CompareRow
                    key={index}
                    label={row}
                    left={leftPoints[index].value}
                    right={rightPoints[index].value}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Section>
  )
}

export default Compare01
