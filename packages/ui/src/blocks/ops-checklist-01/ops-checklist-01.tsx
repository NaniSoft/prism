import type { ReactNode } from 'react'

import { Metric } from '../../components/ui/metric'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The four verdicts a check can come to, and the tone each one is drawn in.
 *
 * **Four, and the set is closed because a check's verdict is a judgement the caller
 * makes about a threshold Prism does not have.** `pass` is the only state that means
 * the estate is as it should be, so it is `success`. `fail` is the one a reader must
 * not miss, so it is `destructive`. `warn` is the interesting one and it is `warning`
 * rather than a fifth thing: it is the verdict a reader has to act on without
 * stopping work, which is exactly the thing the warning tone has always meant in this
 * system, and inventing a fourth state for it would be a colour a reader must learn
 * and a word a maintainer must keep true. `skipped` is `neutral`, and it is in the
 * list rather than absent, because a check a person could not run is a fact about the
 * run and hiding it would make a runbook look complete when it is not.
 *
 * `skipped` being `neutral` rather than `destructive` is the decision most worth
 * stating. A check that was skipped is not a check that failed, and drawing it in the
 * tone that means a reader must not miss would train a reader to ignore that tone on
 * the next run. The cost is that a runbook with forty skipped checks looks calm, and
 * the words beside the dot are what say so.
 */
export type OpsChecklist01Verdict = 'pass' | 'fail' | 'warn' | 'skipped'

/** The tone each of the four verdicts is drawn in, from the semantic contract. */
const VERDICT_TONE: Record<OpsChecklist01Verdict, StatusTone> = {
  pass: 'success',
  fail: 'destructive',
  warn: 'warning',
  skipped: 'neutral',
}

/**
 * One check a person performs, and everything they need to record about it: what it
 * is, what the estate should read, what it actually read, what they concluded, and
 * anything that qualifies the conclusion.
 *
 * **`name` is required and the rest is optional, and the reason is that a check with
 * no name is a row nobody can refer to in a handover.** A runbook is read aloud in
 * pairs on a rota, and "the thing on the third line" is not a reference. Everything
 * else is optional because a person performing checks records different subsets: a
 * check whose estate is healthy has no note, and a check on a system that does not
 * exist yet has no expected reading at all.
 */
export type OpsChecklist01Check = {
  /** The check's stable key within its group. */
  id: string
  /**
   * What the person checks, in the words the runbook uses.
   *
   * The identity of the row and the words a reader scans down a column looking for, so
   * it is a short noun phrase rather than a sentence. "Certificates under 90 days" is
   * a check; "We should check the certificates" is an instruction and belongs in the
   * note.
   */
  name: string
  /**
   * What this estate should read, if the check passes.
   *
   * A node, and drawn as passed, in the muted ink and in the first of the two cells.
   * The honest expected reading is four different things across four NaniSoft
   * estates: a count, a version, a duration and a threshold, and each of them is a
   * sentence in the runbook's own vocabulary. A Block that printed "3 or fewer" would
   * be deciding which unit an estate counts certificates in, and one that printed a
   * comparison would be writing the arithmetic for a threshold the caller owns.
   *
   * A node rather than a string partly so the caller can compose their own column
   * name into the value: this Block draws no words above either cell, because "Expected"
   * and "Actual" are this system's reading of the word and every estate that reads a
   * runbook aloud says something else. See the Block's JSDoc for what that costs.
   */
  expected?: ReactNode
  /**
   * What the estate actually read when the check was performed.
   *
   * A node and a separate field, and **this is the whole of why a runbook is a
   * two-cell check rather than a one-cell one.** A runbook is about the difference
   * between what should be and what is, and a Block that rendered one of them was
   * rendering half the check: a column of expected readings tells a reader what the
   * runbook believes, a column of actual readings tells them what happened, and
   * neither one alone answers the only question a person opening a runbook has, which
   * is whether the estate is well. So the two are two cells, in that order, with the
   * expected reading in the muted ink and the actual reading in the foreground, which
   * is the order a person says them in.
   *
   * Omit it for a check nobody has run yet, and the cell draws nothing rather than
   * carrying a placeholder, because a check nobody has run is a fact about the runbook
   * worth showing and a dash would read as nothing left to do.
   */
  actual?: ReactNode
  /**
   * What the person concluded, which is a judgement Prism cannot make.
   *
   * Required in the sense that a check with no verdict is a check that has not been
   * performed, and the run refuses to imply otherwise: see the Block's JSDoc, which is
   * the most important sentence in this file. A design system that computed pass or
   * fail would be making a claim about an estate it cannot see, on thresholds it does
   * not have, and the caller who owns the estate owns the threshold.
   *
   * Omit it for a check that is not yet done, and the row then carries no mark at
   * all rather than a grey dot saying nothing happened.
   */
  verdict?: OpsChecklist01Verdict
  /**
   * The words for the verdict, given the verdict.
   *
   * Required whenever `verdict` is set and the run fails without it, for the reason
   * the Component JSDoc on `Status` gives at length: the tone is a colour and the
   * words are the information, and a runbook is the worst place in a product for an
   * English word, because it is the document a person reads at three in the morning
   * and quotes to somebody else afterwards. Four estates between them use nine words
   * for these four states, and a function of the verdict is what lets one of them
   * say "green" and another say "passing" without this Block choosing.
   */
  verdictLabel?: (verdict: OpsChecklist01Verdict) => string
  /**
   * Anything that qualifies the verdict: what was actually run, what was skipped and
   * why, a ticket, a follow-up.
   *
   * A node and not a string, because a note on a runbook is a sentence in one case, a
   * link to a ticket in the next and a list of three commands in the third, and a
   * string prop would force the caller to flatten whichever of those it had. The
   * Block draws it in the muted ink under the row and never truncates it, because a
   * truncated note is a qualification removed and qualifications are the whole reason
   * a runbook is not a status page.
   */
  note?: ReactNode
}

/**
 * One group of checks, and the caller's own name for the group.
 *
 * A group is a place a reader navigates to rather than a result they read, which is
 * why a group title is a heading one step below the section and why the checks under
 * it are the next level: a runbook read aloud on a rota is read group by group, and a
 * reader who has learned the outline on one group has learned it for all of them.
 */
export type OpsChecklist01Group = {
  /** The group's stable key. */
  id: string
  /** The group's own name, which is also its card title. */
  title: string
  /**
   * One line under the group's name: what these checks are for, or which part of the
   * estate they cover.
   *
   * A node and not a string, for the reason the category description on `help-01` and
   * `directory-01` is a node: the honest line is sometimes a sentence and sometimes a
   * list of the three systems in the group.
   */
  description?: ReactNode
  /** The checks in it, in the order they should be performed. */
  checks: readonly OpsChecklist01Check[]
}

/**
 * The props an OpsChecklist01 takes.
 *
 * Every string is a prop and the Block ships none: no check name, no expected reading,
 * no actual reading, no verdict word, no note and not one column heading. A runbook
 * with Prism's words in it would be a runbook for an estate Prism cannot see, which is
 * the one thing a runbook is not.
 */
export type OpsChecklist01Props = {
  /** The short line above the title, usually which estate this runbook is for. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, and the reason is the one `inbox-01` and `intake-01` give: a list of
   * checks with no heading is a column of check names a reader cannot name, and a
   * reader who cannot name a region cannot navigate back to it.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The groups, in the order the checks should be performed.
   *
   * Order is the caller's, and the Block does not sort, because a runbook's order is
   * a claim about what to look at first and re-ordering it would be second-guessing
   * the person who wrote it with the estate in front of them.
   */
  groups: readonly OpsChecklist01Group[]
  /**
   * The figures across the whole run, drawn as metrics above the groups.
   *
   * **A label and a value and nothing else, and that is why this is a list of pairs
   * rather than a set of props.** A runbook's summary is "9 of 12 passing" and "1
   * failing" and "2 not run", and the sentence around each of those is the runbook's
   * own: an estate that says "failing" and an estate that says "needs attention" are
   * describing the same two checks differently. The figures are `Metric`s composed
   * rather than redrawn, for the reason `About01` gives: `Metric` owns the
   * arrangement a headline figure is read in, which puts the figure first and the name
   * under it, and it owns the type-scale decision. What this Block does not pass is a
   * `delta`, because a runbook is a snapshot of one run and a change against a previous
   * run is a claim about a runbook the caller may not have.
   */
  summary?: readonly { label: string; value: ReactNode }[]
  /**
   * The caller's own sentence for a runbook with no checks in it.
   *
   * Required, and the reason is the one every list in this package states: a person
   * who opened a runbook and found nothing in it is reading exactly one line, and
   * that line is the most load-bearing sentence on the page. "Nothing to check" is a
   * claim, and it is a different claim in an estate whose checks have not been written
   * yet and in one where the query that fills the page is broken.
   */
  empty: ReactNode
  /**
   * Heading level for the section heading. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusal, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a coloured dot with no sentence beside it on a
 * runbook somebody reads at three in the morning.
 *
 * One, and it is the same refusal `StatusLedger01`, `inbox-01` and every other mark
 * in this package makes: a verdict is a colour and the words are the information. The
 * message names the check and the group, because a runbook has one check called
 * "Certificates" in three groups and a caller needs to know which.
 */
function assertChecks(groups: readonly OpsChecklist01Group[]): void {
  for (const group of groups) {
    for (const check of group.checks) {
      if (check.verdict !== undefined && check.verdictLabel === undefined) {
        throw new Error(
          `OpsChecklist01: the check "${check.name}" in the group "${group.title}" has a verdict and no ` +
            'verdictLabel, so the mark would be a coloured dot with nothing to read beside it, in the document ' +
            'a person reads at three in the morning and quotes to somebody else afterwards. Pass the words ' +
            'for the verdict in your own language, or drop the verdict.',
        )
      }
    }
  }
}

/**
 * A runbook: a set of checks a person performs on an estate, each with a state, an
 * expected reading, the reading that was taken, and a verdict.
 *
 * **It must not decide a verdict, and that is the most important sentence in this
 * file.** A design system that computed pass or fail would be making a claim about an
 * estate it cannot see, on thresholds it does not have. What counts as a warning is a
 * decision about an estate's risk appetite, and four NaniSoft estates have four of
 * them: one calls a certificate at 89 days a pass, one calls it a warning, and one has
 * no certificates at all. The threshold belongs to the caller who owns the estate, and
 * so does the reading that was taken. So the verdict is a prop, the tones are this
 * system's, and the words are the caller's, and a Block that inferred a verdict from
 * a comparison between two cells would be a design system asserting an infrastructure
 * fact. The cost of the refusal is real and it is the right one: a caller with three
 * checks whose verdicts are all derivable writes three calls, and a caller who wanted
 * the arithmetic done for them reaches for their own data layer, which is the only
 * place that can see the estate.
 *
  * **`expected` and `actual` are two cells rather than one, because a runbook is about
  * the difference between what should be and what is.** A Block that rendered one of
  * them was rendering half the check: a column of expected readings tells a reader what
  * the runbook believes, a column of actual readings tells them what happened, and
  * neither one alone answers the only question a person opening a runbook has, which
  * is whether the estate is well. So the two are separate fields, in that order, with
  * the expected reading in the muted ink and the actual reading in the foreground,
  * which is the order a person says them in, and the two cells are the same shape so
  * the eye compares them without either one being the odd one out. A caller who passes
  * one and not the other gets one cell filled and one empty, and the empty one is the
  * fact: a check nobody has run yet is worth showing rather than hiding behind a
  * placeholder.
  *
  * **No column name is drawn above either cell, and that is a refusal with a real
  * cost.** "Expected" and "Actual" are this system's reading of the word, and every
  * estate that reads a runbook aloud says something else: "Wanted" and "Found", "Should
  * be" and "Is", "Configured" and "Running". A Block that named them would be
  * publishing one estate's vocabulary into every product that installs it, inside a
  * design system rather than inside a product's copy, which is where a translation
  * tool is least likely to look. So the two are told apart by ink and by position, the
  * expected one always first, and a caller who wants the words composes them into the
  * node, which is what a `ReactNode` is for. The cost is the honest one: a caller who
  * does not compose them is left with two columns a reader tells apart by shade rather
  * than by word, and the answer for a runbook that needs a real header row is
  * `DataTable01`, which is that table with the caller's own cells and column names.
  *

 * **The four verdicts are mapped here and the words are the caller's, and the
 * `skipped` tone is the decision worth naming.** `pass` is `success` because it is
 * the only verdict that means the estate is as it should be. `fail` is `destructive`
 * because it is the one a reader must not miss. `warn` is `warning` because it is the
 * verdict a reader has to act on without stopping work, which is what the warning
 * tone has always meant here, and giving it a fifth state would be a colour a reader
 * must learn and a word a maintainer must keep true. And `skipped` is `neutral`, not
 * `destructive`, because a check a person could not run is not a check that failed,
 * and drawing it in the tone that means a reader must not miss would train a reader to
 * ignore that tone on the next run. The cost is that a runbook with forty skipped
 * checks looks calm, and the words beside the dot are the only thing that says
 * otherwise, which is the trade this design makes everywhere.
 *
 * **`verdictLabel` is a function of the verdict and is required, for the reason
 * every mark in this package states and the reason a runbook is the worst case of
 * them.** A coloured dot is invisible to a reader who cannot separate the tones and
 * unreadable to a screen reader whatever the tones are, and the document being read is
 * the one a person quotes to somebody else afterwards. Four estates between them use
 * nine words for these four states, so the prop is a function and there is no default
 * to fall back on. A check with a verdict and no label throws rather than rendering a
 * dot, and the message names the check and the group.
 *
 * **The summary is `Metric` composed and not redrawn, and the Block passes no
 * `delta`.** A runbook's figures are read first and named under, which is the
 * arrangement `Metric` owns along with the type-scale decision and the rule that a
 * string figure is set in the mono face. What this Block declines to pass is a delta,
 * because a runbook is a snapshot of one run and a change against the previous run is
 * a claim about a runbook the caller may not keep. The `label` is a `string` and the
 * `value` a `node`, which is the same split `About01`'s figures make: a label is
 * scanned and a value is composed.
 *
 * **The group title is a heading one step below the section and the check names are
 * headings one step below that, because a runbook has two levels of outline and both
 * of them are used.** A person reading a rota aloud goes group by group and check by
 * check, and a reader who has learned the outline on one group has learned it for all
 * of them. So the groups are headings at `childLevel(headingLevel)` and the checks are
 * headings at `childLevel(childLevel(headingLevel))`, both derived, so a runbook
 * embedded one level deeper carries its whole outline with it. The cost is a
 * five-level outline on a deeply nested page, and `childLevel` holds at `h6` rather
 * than wrapping for exactly that reason.
 *
 * **It is a server Component: no hook, no state, no effect, no client code and no
 * router.** A runbook is a document a person reads, not a surface they work, so
 * there is nothing here for a reader to press. The cost of that choice is that the
 * Block cannot record that a check was performed; whether a runbook is a document or a
 * checklist a person ticks off in the page is a decision about the caller's product,
 * and a caller who wants the ticking composes their own control in `note` or their own
 * region beside this Block.
 */
export function OpsChecklist01({
  eyebrow,
  title,
  description,
  groups,
  summary,
  empty,
  headingLevel = 'h2',
  className,
}: OpsChecklist01Props) {
  // A group's title is a heading one step below the section, and a check's name is a
  // step below that, so a runbook embedded one level deeper than it was written for
  // carries its whole outline with it rather than announcing a set of siblings of the
  // section.
  const GroupTitle = childLevel(headingLevel)
  const CheckTitle = childLevel(GroupTitle)

  assertChecks(groups)

  const drawn = groups.reduce((total, group) => total + group.checks.length, 0)

  return (
    <Section data-slot="ops-checklist-01" className={cn(className)}>
      <div data-slot="ops-checklist-01-body" className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        {summary === undefined || summary.length === 0 ? null : (
          /*
           * The figures, read first and named under, which is `Metric`'s arrangement
           * and the reason this Block composes it rather than drawing a figure row of
           * its own. A rule between them and the groups below, because a figure and a
           * check list are two different readings of the same page and a gap alone
           * stops being visible at the zoom levels where a figure gets small.
           */
          <div
            data-slot="ops-checklist-01-summary"
            className="border-border grid grid-cols-2 gap-6 border-t pt-6 sm:grid-cols-3 lg:grid-cols-4"
          >
            {summary.map((figure) => (
              <Metric key={figure.label} label={figure.label} value={figure.value} />
            ))}
          </div>
        )}

        {drawn === 0 ? (
          /*
           * The caller's own sentence, drawn where the groups would have been rather
           * than above them. A `text-pretty` wrapper is here because the honest
           * sentence is sometimes a paragraph and `text-balance` would leave a
           * one-word last line in it.
           */
          <p
            data-slot="ops-checklist-01-empty"
            className="text-muted-foreground max-w-measure-narrow text-pretty"
          >
            {empty}
          </p>
        ) : (
          <div data-slot="ops-checklist-01-groups" className="flex flex-col gap-10">
            {groups.map((group) =>
              group.checks.length === 0 ? null : (
                <section
                  key={group.id}
                  data-slot="ops-checklist-01-group"
                  data-group={group.id}
                  aria-labelledby={`${group.id}-heading`}
                  className="flex flex-col gap-4"
                >
                  <div
                    data-slot="ops-checklist-01-group-head"
                    className="flex flex-col gap-1.5"
                  >
                    <GroupTitle
                      id={`${group.id}-heading`}
                      data-slot="ops-checklist-01-group-title"
                      className="text-lg font-semibold tracking-tight"
                    >
                      {group.title}
                    </GroupTitle>
                    {group.description === undefined ? null : (
                      <p
                        data-slot="ops-checklist-01-group-description"
                        className="text-muted-foreground text-pretty text-sm"
                      >
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/*
                    * A list rather than a table, and the reason is that a person
                    * performs these checks one at a time and reads each one whole. A
                    * table would invite a reader to scan a column of verdicts down the
                    * page, which is a valid way to read a runbook after the fact and
                    * not a valid way to perform one, and it would cost the two-cell
                    * comparison its paired layout: a two-cell row beside a name is a
                    * comparison a reader can see at a glance, and two of those cells
                    * in a table are two columns separated by the width of the page.
                    * The rule between rows is a border rather than a gap alone, so the
                    * boundary survives at any zoom level where the gap stops being
                    * visible.
                    */}
                  <ul
                    data-slot="ops-checklist-01-checks"
                    className="border-border flex flex-col border-t"
                  >
                    {group.checks.map((check) => (
                      <li
                        key={check.id}
                        data-slot="ops-checklist-01-check"
                        data-check={check.id}
                        data-verdict={check.verdict}
                        className="border-border flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-start sm:gap-6"
                      >
                        <div
                          data-slot="ops-checklist-01-identity"
                          className="flex min-w-0 flex-1 flex-col gap-3"
                        >
                          <CheckTitle
                            data-slot="ops-checklist-01-name"
                            className="text-sm font-semibold"
                          >
                            {check.name}
                          </CheckTitle>

                          {/*
                            The two cells, in the order a person says them: what it
                            should read, then what it did read. The expected reading is
                            in the muted ink because it is what the runbook believes
                            rather than what happened, and the actual reading is in the
                            foreground for the same reason.

                            **No column name is drawn above either one, and that is a
                            deliberate cost rather than an oversight.** A runbook's two
                            columns are "Expected" and "Actual" in this system's
                            reading of the word, and every estate that reads a runbook
                            aloud says something else: "Wanted" and "Found", "Should
                            be" and "Is", "Configured" and "Running". A Block that
                            named them would be publishing one estate's vocabulary into
                            every product that installs it, inside a design system
                            rather than inside a product's copy, which is where a
                            translation tool is least likely to look. So the two are
                            told apart by ink and by position, the expected one always
                            first, and a caller who wants the words composes them into
                            the node: `expected` is a `ReactNode`, not a string, and
                            `<><span>Wanted</span>three or fewer</>` is one value. The
                            cost is real and it is the honest one: a caller who does
                            not is left with two columns a reader tells apart by shade
                            rather than by word, and the answer for a runbook that
                            needs a real header row is `DataTable01`, which is that
                            table with the caller's own cells and column names.
                          */}
                          <div
                            data-slot="ops-checklist-01-readings"
                            className="grid gap-3 sm:grid-cols-2 sm:gap-6"
                          >
                            {/*
                              The expected reading. An absent one draws nothing at
                              all rather than a placeholder, because a check with no
                              threshold written down is a fact about the runbook worth
                              showing and a dash would read as nothing to do.
                            */}
                            <div
                              data-slot="ops-checklist-01-expected"
                              data-taken={check.expected !== undefined}
                              className="text-muted-foreground flex min-w-0 flex-col text-pretty text-sm"
                            >
                              {check.expected}
                            </div>

                            {/*
                              The actual reading, in the foreground ink and with the
                              same geometry, so the two cells are the same shape and
                              the eye compares them without either one being the odd
                              one out. A rule above it rather than a gap alone, so the
                              pair reads as a pair at any zoom level where a gap stops
                              being visible.
                            */}
                            <div
                              data-slot="ops-checklist-01-actual"
                              data-taken={check.actual !== undefined}
                              className="border-border flex min-w-0 flex-col border-t pt-3 text-pretty text-sm sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6"
                            >
                              {check.actual}
                            </div>
                          </div>

                          {check.note === undefined ? null : (
                            <p
                              data-slot="ops-checklist-01-note"
                              className="text-muted-foreground text-pretty text-sm"
                            >
                              {check.note}
                            </p>
                          )}
                        </div>

                        {check.verdict === undefined || check.verdictLabel === undefined ? null : (
                          /*
                            * The mark, with the caller's words beside it. It sits at the
                            * trailing edge of the row and after the two readings,
                            * never inside either, because a verdict a reader has to
                            * reach past the expected reading to find is a verdict they
                            * will not find. The dot inside `Status` is `aria-hidden`
                            * and the words are not, so a reader who cannot separate
                            * `warning` from `destructive` still reads which is which.
                            */
                          <Status
                            data-slot="ops-checklist-01-verdict"
                            size="sm"
                            tone={VERDICT_TONE[check.verdict]}
                            label={check.verdictLabel(check.verdict)}
                            className="shrink-0"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ),
            )}
          </div>
        )}
      </div>
    </Section>
  )
}

export default OpsChecklist01
