import { useId, type ReactNode } from 'react'

import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

/**
 * The three states a compliance row can be in.
 *
 * Three, and the set is closed. It is `Status`'s set of five tones narrowed to
 * the states a claim about a standard can actually be in, and the narrowing is
 * the argument: a compliance surface has no `destructive` row, because "we do not
 * hold this" is not a claim a publisher makes about a standard it has chosen to
 * publish, and a surface with a destructive state on it invites exactly the
 * marketing use this Block exists to refuse.
 */
export type ComplianceState = 'held' | 'in-progress' | 'not-applicable'

/**
 * The tone each state is drawn in.
 *
 * Mapped rather than passed, because `Status` owns the tones and a Block that
 * let a caller pick one would be handing out five judgements about somebody
 * else's regulatory position. `in-progress` is `info` rather than `warning`
 * because a standard being worked toward is the ordinary state of a compliance
 * programme and not an alarm; `not-applicable` is `neutral` because it is the
 * state with nothing to alarm about, which is exactly what `Status` says `neutral`
 * is for.
 */
const STATE_TONE: Record<ComplianceState, StatusTone> = {
  held: 'success',
  'in-progress': 'info',
  'not-applicable': 'neutral',
}

/**
 * One claim, and everything that makes it checkable.
 *
 * The words in every one of these fields are the caller's legal statements, not
 * Prism's. See the Block's JSDoc for why that sentence is load-bearing rather
 * than a formality.
 */
type Compliance01RowBase = {
  /**
   * A stable key for the row, and carried on the markup as `data-compliance` so
   * a test can name one claim rather than the first one.
   */
  id: string
  /**
   * What is claimed, in the publisher's own words.
   *
   * The anchor of the row and the row header the table announces with it. It is
   * the sentence a reader checks against the document beside it, so it is not
   * shortened, softened or rewritten here.
   */
  claim: string
  /**
   * The standard, framework or control the claim is made against.
   *
   * Optional, and its absence is meaningful rather than a gap: a claim with no
   * standard is a statement the publisher has made about itself, and there is no
   * tick to draw for it. See the Block's JSDoc for the refusal.
   */
  standard?: string
  /**
   * What the claim covers: which system, which region, which version.
   *
   * A compliance claim without a scope is a claim about everything, which is a
   * stronger claim than any publisher can usually support, and this Block does
   * not write the scope for them.
   */
  scope?: string
  /**
   * When the claim was last reviewed, already written as it should be read.
   *
   * A string rather than a `Date`, and that is a decision with a reason: this is
   * a Block and a Block ships no formatting, so the reading is the caller's
   * string rather than a date Prism would have to turn into words. The honest
   * reading of a review date is a `relative-time`, which is a Component a caller
   * composes; see the Block's JSDoc.
   */
  reviewedAt?: string
  /**
   * The state of the claim, drawn from the tone set `Status` owns.
   *
   * Optional, and a row with no state says nothing about its own status, which
   * is the honest reading of a claim nobody has labelled. A `held` claim also
   * needs a `standard`; see the Block's JSDoc.
   */
  state?: ComplianceState
  /**
   * The words for the state, in the publisher's own vocabulary.
   *
   * Required whenever `state` is given, and not defaulted, for the reason
   * `StatusLedger01`'s `statusLabel` states in full: the state is a colour and
   * the words are the information, and a publisher whose regimes say "attested"
   * where another's say "held" cannot be given one vocabulary by a design system.
   * A missing one is a thrown diagnostic rather than a silent absence.
   */
  stateLabel?: string
}

/**
 * One row of the claims table.
 *
 * **The evidence pair is a union, and that is the whole of why this is a type
 * alias over an interface.** The four fields a row always carries are on every
 * arm, and the two fields that describe an evidence link are on one arm together:
 * a row either links to a published document and names it, or it does neither.
 * Declaring `evidenceHref` and `evidenceLabel` as two independent optional
 * properties would have produced three states a compliance table must never show,
 * a link with no name, a name with no link, and neither, and only the first of
 * those is what the optional pair was trying to say.
 *
 * The `state` pair works the same way and for the same reason, and the
 * `stateLabel` is a separate union below for the same reason again: a state is a
 * colour and the words beside it are the information.
 */
export type Compliance01Row = Compliance01RowBase &
  (
    | {
        /**
         * Where the evidence is: a native anchor `href`.
         *
         * Omit it and the cell says nothing, which is a truthful answer. A claim
         * with no published document behind it has no evidence link, and this
         * Block will not link to a contact form to fill the gap.
         */
        evidenceHref: string
        /**
         * The words that name the evidence, and the link's accessible name.
         *
         * Required on this arm and forbidden on the other one, so a link whose
         * accessible name is its address is a compile error rather than
         * something a screen reader announces as punctuation, and a name with no
         * link beside it is a compile error rather than a sentence in an empty
         * cell. The words are the caller's, because the words say which document
         * this is.
         */
        evidenceLabel: string
      }
    | {
        /** Forbidden, so that "a link with no name" cannot be typed. */
        evidenceHref?: never
        /** Forbidden, so that "a name with no link" cannot be typed either. */
        evidenceLabel?: never
      }
  )

/**
 * What each column says it holds.
 *
 * Six nodes and all six required, because a compliance table whose columns are
 * unnamed is a grid, and a grid of claims is a set of assertions with nothing to
 * check them against. The words are the caller's because what a publisher calls
 * its review date, its scope and its evidence is part of the claim rather than
 * part of the layout.
 */
export type Compliance01Columns = {
  /** Above the claim column, which is also the row header the table announces. */
  claim: ReactNode
  /** Above the standard column. */
  standard: ReactNode
  /** Above the scope column. */
  scope: ReactNode
  /** Above the last reviewed column. */
  reviewedAt: ReactNode
  /** Above the state column. */
  state: ReactNode
  /** Above the evidence column. */
  evidence: ReactNode
}

/**
 * The props a Compliance01 takes.
 *
 * Every string is a prop and the Block ships none. There is no standard list, no
 * certification vocabulary, no default state and not one word of a claim: a
 * compliance surface that shipped any of them would be making statements about a
 * publisher's regulatory position on their behalf.
 */
export type Compliance01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, required.
   *
   * Required because this is the one surface in the system where an unlabelled
   * table of claims is a defect rather than a layout: a table of assertions with
   * no statement of who is making them reads as a certification nobody issued.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The claims, in the order a reader should meet them. Order is the caller's. */
  rows: readonly Compliance01Row[]
  /** What each column says it holds. See `Compliance01Columns`. */
  columns: Compliance01Columns
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The two refusals, as checks, so that a claim Prism cannot justify is a
 * diagnostic in a console rather than a rendered row.
 *
 * A `held` claim with no standard throws because a tick beside an assertion with
 * nothing behind it is the single worst thing this Block could render: it is a
 * certification mark for a claim that names no standard, which is precisely the
 * render a design system is most tempted to ship and is the one this Item exists
 * to refuse. An `in-progress` or `not-applicable` claim with no standard is
 * allowed, because both of those are statements about work rather than
 * attestations, and a statement about work does not need a standard behind it.
 *
 * An `evidenceHref` with a blank label throws for the reason `Status` states for
 * its own label: the link would be announced by its address, which is a link no
 * reader can follow.
 */
function assertRow(row: Compliance01Row): void {
  if (row.state === 'held' && (row.standard === undefined || row.standard.trim() === '')) {
    throw new Error(
      'Compliance01: a row is in the held state and names no standard, so the state mark would be a bare tick ' +
        'for a claim nobody has checked against anything. Name the standard, or put the row in the in-progress or ' +
        'not-applicable state, which is a statement about work rather than an attestation.',
    )
  }

  if (row.state !== undefined && (row.stateLabel === undefined || row.stateLabel.trim() === '')) {
    throw new Error(
      'Compliance01: a row declares a state and no words for it, so the state would be a colour with nothing to ' +
        'read beside it. Pass stateLabel in the vocabulary the publisher uses, which is not this Block choice.',
    )
  }

  if (row.evidenceHref !== undefined && row.evidenceLabel.trim() === '') {
    throw new Error(
      'Compliance01: a row declares an evidenceHref and an empty evidenceLabel, so the link would be announced by ' +
        'its address, which is punctuation rather than a name. Pass the words that say which document it is.',
    )
  }
}

/**
 * A table of what is claimed, to which standard, by whom, when it was last
 * reviewed, and where the evidence is.
 *
 * **The reason this Item exists is not the table.** A table is `Table`, and
 * `Table` is already in this package. What a design system is tempted to do on a
 * compliance surface is render a tick for a claim nobody has checked: the tick
 * is the reward, it is the thing the marketing copy reaches for, and every
 * design system that has shipped a compliance section has shipped one by
 * defaulting the state to the good one. So this Block ships a state set in which
 * the honest answers are first class rather than absent. `in-progress` and
 * `not-applicable` are members of the set, not edge cases, which is what stops a
 * publisher from reading the two tone-less states as an admission they have to
 * hide by claiming the first one instead. And a row that claims to hold something
 * with no standard behind it throws rather than rendering a bare tick, because
 * the alternative is a certification mark this package drew for a sentence it
 * cannot check.
 *
 * **Every word in every cell is the caller's legal statement.** The claims, the
 * standards, the scopes, the review readings, the state vocabulary and the
 * evidence names are all props, and the Block composes none of them into a
 * sentence of its own. That is not a formality in this one place. A compliance
 * surface is a set of representations made to regulators, to customers and to
 * auditors, and a design system that contributed a word to one of them would be
 * publishing a representation it has no standing to make. The cost of the rule is
 * real and stated here: there is no default for anything, so a consumer wiring
 * this Block up writes every label themselves, and a half-built compliance
 * section is a build error rather than a page that ships six ticks.
 *
 * **The state is a tone and the words are the caller's, which is the same split
 * `StatusLedger01` makes.** `Status` owns the five tones and refuses to pick one,
 * and this Block maps its three states onto three of those tones while taking the
 * words beside them from the caller. A publisher whose regimes say "attested"
 * where another's say "held" is not a vocabulary this Block can reconcile, and a
 * missing `stateLabel` throws rather than falling back to the machine value,
 * which would print `in-progress` into a regulatory document as if it were a term
 * of art.
 *
 * **`reviewedAt` is a string because a Block ships no formatting, and the honest
 * reading of a review date is a Component rather than a call into `Intl`.** The
 * alternative was to accept a `Date` and format it here, which is a Block
 * choosing a locale, a calendar and a granularity on a publisher's regulatory
 * behalf, and which would put `Intl` in every consumer's bundle for a rendering
 * Prism has no stake in. So the value is printed exactly as passed. A caller who
 * wants the reading to say "three months ago" composes `relative-time` beside
 * this table, or formats the string themselves, and a Block that wanted the
 * relative phrase would compose that Component rather than format inline. The
 * cost is stated rather than hidden: a caller who passes an ISO string gets an
 * ISO string, which is honest and rarely what was wanted.
 *
 * **The claim is the row header, so the table announces it with every cell.** The
 * claim cell is a `th` with `scope="row"` rather than a `td`, which is what lets
 * a screen reader say which claim each state and each date belongs to. The row
 * header and the cells carry `whitespace-normal` and `h-auto` because
 * `TableHead` and `TableCell` set `whitespace-nowrap` and a fixed header height,
 * which is right for a figure in a data grid and wrong for a sentence that is a
 * legal statement; that is the one place in this Block where a `className`
 * changes a Prism-owned property rather than placing something, and it is stated
 * here rather than left to be discovered.
 *
 * An empty set renders the table with no rows, which is deliberate and is the
 * opposite of the rule every other Block in this package follows: a compliance
 * section with a heading and no rows says "we publish nothing here", and hiding
 * it would leave a reader wondering whether the section was missed. The cost is
 * that a heading can survive on a page whose claims have all been withdrawn, so a
 * consumer who would rather see nothing should not render the Block.
 *
 * It is a server Component: no hook, no state, no client code and no motion.
 */
export function Compliance01({
  eyebrow,
  title,
  description,
  rows,
  columns,
  headingLevel = 'h2',
  className,
}: Compliance01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  return (
    <Section className={className}>
      <SectionHeading
        as={headingLevel}
        id={headingId}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {/*
       * The table takes its name from the heading above it rather than from a
       * second copy of the same words. A `<table>` is named by a caption, an
       * `aria-label` or an `aria-labelledby`, and none of the three is inferred
       * from a heading that happens to be nearby, so a reader listing the tables
       * on a page found this one anonymous while every other element around it was
       * named. A reference rather than a caption because a caption is drawn, and a
       * visible line repeating the heading is noise; a reference because `title`
       * is the caller own words and a Block may not compose a second set. See
       * `Table`, which asks for exactly one of the three.
       */}
      <Table aria-labelledby={headingId} data-slot="compliance">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{columns.claim}</TableHead>
            <TableHead scope="col">{columns.standard}</TableHead>
            <TableHead scope="col">{columns.scope}</TableHead>
            <TableHead scope="col">{columns.reviewedAt}</TableHead>
            <TableHead scope="col">{columns.state}</TableHead>
            <TableHead scope="col">{columns.evidence}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            assertRow(row)

            return (
              <TableRow key={row.id} data-slot="compliance-row" data-compliance={row.id}>
                <TableHead
                  scope="row"
                  className="text-foreground h-auto whitespace-normal font-medium"
                >
                  {row.claim}
                </TableHead>

                <TableCell className="whitespace-normal">
                  {row.standard === undefined ? null : row.standard}
                </TableCell>

                <TableCell className="whitespace-normal">{row.scope ?? null}</TableCell>

                <TableCell className="tabular-nums">{row.reviewedAt ?? null}</TableCell>

                <TableCell>
                  {row.state === undefined ? null : (
                    <Status size="sm" tone={STATE_TONE[row.state]} label={row.stateLabel} />
                  )}
                </TableCell>

                <TableCell>
                  {row.evidenceHref === undefined ? null : (
                    <a
                      data-slot="compliance-evidence"
                      href={row.evidenceHref}
                      className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors duration-fast ease-out focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                      {row.evidenceLabel}
                    </a>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Section>
  )
}

export default Compliance01