import { useId, type ReactNode } from 'react'

import { AvatarGroup } from '../../components/ui/avatar-group'
import { CtaLink } from '../../components/ui/cta-link'
import { ListPanel } from '../../components/ui/list-panel'
import { Section, SectionHeading, childLevel, headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import { Table, TableBody } from '../../components/ui/table'
import { Timeline, type TimelineEntry } from '../../components/ui/timeline'
import type { RelationKind, RelationSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'
import { EmptyState01, type EmptyReason } from '../empty-state-01'

/**
 * One fact a reader is told about the record, in the caller's own order.
 *
 * `id` is a stable key rather than the words of the label, for the reason every
 * other key in this package gives: it is what a caller keys their own rendering
 * by, and a key built out of a label breaks the moment the label is translated.
 * The value is a node rather than a string because the facts a record carries are
 * the caller's own and they are not all text: a status word, a moment, a link and
 * a composed figure are all things a caller puts in one slot.
 */
export type RecordDetail01Field = {
  /** A stable key for the field, so a caller and a test can name one. */
  id: string
  /** What the fact is, in the product's own words. */
  label: ReactNode
  /** What it reads. */
  value: ReactNode
}

/**
 * The words a relationship draws in its own frame when it has no members.
 *
 * **A relation declares its own empty words, and the reason is that an empty
 * collection and a reader who has chosen nothing are two different sentences.** A
 * customer with no invoices, an order with no payments and a project with no
 * people are all collections that are empty, narrowed, emptied or hidden, and
 * every one of those is a reason `EmptyState01` was drawn for. The words are the
 * caller's because only the product knows whether the answer is "nothing has ever
 * been here" or "this reader may not see it", and a Block that published one
 * sentence for all four would tell a reader who emptied a collection that their
 * filter matched nothing.
 *
 * `reason` is `EmptyState01`'s own closed union, reused rather than re-spelled,
 * so a relation cannot reach an empty state the Block that draws it does not
 * have.
 */
export type RecordDetail01RelationEmpty = {
  /** Which of the four situations this is. */
  reason: EmptyReason
  /** The headline, in the reader's own words. */
  title: string
  /** The sentence under the headline, for the part the headline cannot fit. */
  body?: string
  /** The label of the one action, when the reader has something to do here. */
  actionLabel?: string
  /** The handler for `actionLabel`, required whenever `actionLabel` is set. */
  onAction?: () => void
}

/**
 * One relationship of a record, as the detail draws it.
 *
 * **It is the shared `RelationSpec` plus the words its empty frame needs, and the
 * split is deliberate.** The specification carries the data: a stable `key`, the
 * caller's `label`, the `kind`, an optional `href` on the heading with its
 * required `hrefLabel`, an optional `count` that is the caller's own string, and
 * the `members`. The empty words are a drawing rather than data, and the
 * specification module stays plain serialisable data with no reference to a
 * Block, which is why they sit here beside the Block that draws them rather than
 * on the shared type.
 *
 * **Depth is one, and the bound is in `RelationSpec` rather than in this type.**
 * `members` is `readonly unknown[]` and never names `RelationSpec`, so a relation
 * cannot hold a relation. A member is a row, a person, an occurrence or a node in
 * the caller's data, and a related record with its own related records is a graph
 * the consumer walks: a member carries the caller's own `href` when it should
 * open, and the destination is the caller's route.
 */
export type RecordDetail01Relation = RelationSpec & {
  /** The words this relation draws when it has no members. */
  empty: RecordDetail01RelationEmpty
}

/**
 * The props a `RecordDetail01` accepts.
 *
 * Every word is the caller's and the Block ships none: no title, no fact, no
 * action label, no relation name, no empty sentence and not one figure. The
 * record's own content arrives as `title`, `eyebrow`, `description`, `fields` and
 * `children`, its own controls arrive as `actions`, and its relationships arrive
 * as one ordered `relations` list. The Block fetches nothing, reads nothing by
 * key and defaults to no record.
 */
export type RecordDetail01Props = {
  /**
   * The record's own heading, in the caller's words.
   *
   * Required, because a detail that does not name the record it is showing is a
   * surface a reader has to identify from its fields, and the heading is the one
   * thing the caller already holds when they put the record in the address.
   */
  title: ReactNode
  /**
   * A line above the title, such as the record's own key or type.
   *
   * The caller's own words, and it is drawn in the mono face because an
   * identifier is machine notation: it is what a reader pastes into a search box,
   * quotes in a message and cites in a review, and this repository annotates
   * machine-readable values with the mono stack rather than with anything else.
   */
  eyebrow?: ReactNode
  /** A sentence under the title, for the part the title cannot fit. */
  description?: ReactNode
  /**
   * The facts a reader is entitled to be told about the record, in the order they
   * should be read.
   *
   * The caller's list, because a fixed set of fields would decide what a record
   * is made of, which is a claim only the product can make. A record that carries
   * a story point, a sprint, a customer and a severity has four facts this
   * package knows nothing about, and a Block that named four of them would have
   * to be forked to carry the fifth.
   */
  fields?: readonly RecordDetail01Field[]
  /**
   * The record's own content, composed by the caller.
   *
   * A slot, because what a record shows besides its facts is the caller's
   * composition: a screen that wants a figure composes `Summary01` or `Stats01`
   * here rather than asking this Block to keep a running total, and a screen with
   * prose composes `Prose`. The Block places it and styles nothing inside it.
   */
  children?: ReactNode
  /**
   * The controls that act on the record, placed in the record's own band.
   *
   * One optional node the caller wrote, and the Block renders no control of its
   * own. What the screen can do to itself belongs to `PageHeader01`; what can be
   * done to this record belongs beside its identity, and a detail in a split pane
   * has no page header above it. There is no declared action union and no
   * destination arm, so the strongest action beside a record is the caller's, and
   * the confirmation for a destructive one is the caller's own `AlertDialog`
   * composed around their control in this slot.
   */
  actions?: ReactNode
  /**
   * The record's relationships, one ordered list, drawn open in the declared
   * order.
   *
   * One list on one frame rather than a card per relation, so a record with four
   * relationships and a record with one read the same way. Every relation is
   * drawn open, because a relation a reader has to ask for is a disclosure, a
   * disclosure is a control, and a control in a Block is the finding
   * `scripts/check-block-controls.mjs` exists to catch.
   */
  relations?: readonly RecordDetail01Relation[]
  /**
   * Heading level for the record's own heading.
   *
   * Each relation's label sits one level under it, derived rather than asked for,
   * so a Block moved one level deeper carries its relation headings with it.
   *
   * @defaultValue 'h2'
   */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The collection arrangements a relation is drawn in, keyed by the kind's
 * lowercase name.
 *
 * The map covers every member of `RelationKind`, so a kind added to the union
 * fails the compiler here until it is drawn. Each arrangement is one of the
 * Components this package already ships, and each takes the relation's `members`
 * as the shape that Component already declares: a `Table` relation's members are
 * the caller's own row nodes, drawn in a `TableBody`; a `ListPanel` relation's
 * members are the caller's own list rows; a `Timeline` relation's members are
 * `TimelineEntry` values; an `AvatarGroup` relation's members are `{ name, src }`
 * values; and a `slot` relation's members are the caller's own nodes, placed in
 * the order given. The cast is the same one `DataTable01` makes for a cell, and
 * for the same reason: the specification is the weakest type in the module on
 * purpose, and the arrangement is the thing that knows what a member is.
 */
const ARRANGEMENT: Record<
  Lowercase<RelationKind>,
  (members: readonly unknown[], context: { label: string; labelledBy: string }) => ReactNode
> = {
  table: (members, { labelledBy }) => (
    <Table aria-labelledby={labelledBy}>
      <TableBody>{members as unknown as ReactNode[]}</TableBody>
    </Table>
  ),
  listpanel: (members) => (
    <ListPanel scroll={false}>
      <ul className="divide-border flex flex-col divide-y">
        {members as unknown as ReactNode[]}
      </ul>
    </ListPanel>
  ),
  timeline: (members, { label }) => (
    <Timeline entries={members as unknown as TimelineEntry[]} label={label} />
  ),
  avatargroup: (members) => (
    <AvatarGroup avatars={members as unknown as { src?: string; name: string }[]} />
  ),
  slot: (members) => (
    <div data-slot="record-detail-01-slot" className="flex flex-col gap-4">
      {members as unknown as ReactNode[]}
    </div>
  ),
}

/**
 * One relationship, drawn open: its heading and count, its optional destination,
 * and either its members in the arrangement the kind names or the caller's empty
 * state in the relation's own frame.
 *
 * The heading level is passed in rather than derived here, so every relation on a
 * record sits at one level under the record's own heading.
 */
function Relation({ relation, level }: { relation: RecordDetail01Relation; level: HeadingLevel }) {
  const headingId = useId()
  const Heading = level
  // A `Timeline` names its list with a string, so a node label falls back to the
  // relation's own key rather than to a flattened sentence the Block invented.
  const labelText = typeof relation.label === 'string' ? relation.label : relation.key
  const arrangement = ARRANGEMENT[relation.kind.toLowerCase() as Lowercase<RelationKind>]

  return (
    <section
      data-slot="record-detail-01-relation"
      data-relation={relation.key}
      aria-labelledby={headingId}
      className="flex flex-col gap-4 p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading
          id={headingId}
          className={cn('font-semibold tracking-tight text-balance', headingSizeClass(level))}
        >
          {relation.label}
        </Heading>

        {relation.href === undefined ? null : (
          <CtaLink data-slot="record-detail-01-relation-link" href={relation.href} variant="ghost" size="sm">
            {relation.hrefLabel}
          </CtaLink>
        )}
      </div>

      {relation.count === undefined ? null : (
        <p data-slot="record-detail-01-relation-count" className="text-muted-foreground text-sm tabular-nums">
          {relation.count}
        </p>
      )}

      {relation.members.length === 0 ? (
        <EmptyState01
          reason={relation.empty.reason}
          title={relation.empty.title}
          body={relation.empty.body}
          actionLabel={relation.empty.actionLabel}
          onAction={relation.empty.onAction}
        />
      ) : (
        arrangement(relation.members, { label: labelText, labelledBy: headingId })
      )}
    </section>
  )
}

/**
 * The record detail: one record in full, its relationships drawn open, and its
 * own actions beside its identity.
 *
 * **It is handed the record and it owns no selection.** The consumer put the
 * record in the address; a detail that knew which record it shows would own the
 * selection state the split and the record index already hold, and a Page cannot
 * own it either because a Page imports no router. So `title`, `eyebrow`,
 * `description`, `fields` and `children` are the caller's, the `relations` are
 * the caller's ordered list, and this Block fetches nothing, reads nothing by key
 * and defaults to no record. A record that is gone, one this reader may not see
 * and one whose fetch failed are three causes sharing one address and three
 * different sentences, so whether this Block is drawn at all is the caller's
 * answer.
 *
 * **Relationships are one declared list on one frame, not a card per relation.**
 * Each entry is a `RelationSpec` from `@nanisoft/prism-ui/spec` plus the words its
 * own empty frame needs. They are drawn in the declared order, under one heading
 * level, inside one bounded frame with one rule between them, so a record with
 * four relationships and a record with one read the same way rather than becoming
 * a grid of equal panels. The `kind` names the collection arrangement this
 * package already draws, and a relation the union does not name is the `slot`
 * member, drawn open and placed by the caller.
 *
 * **Depth is one, and the bound is in the type.** `RelationSpec.members` is
 * `readonly unknown[]` and never names `RelationSpec`, so a relation cannot hold
 * a relation and this Block draws one ring of a graph the consumer walks. A
 * descendant is reached by a link rather than by depth: a member carries the
 * caller's own `href` when it should open, and the destination is the caller's
 * route. The Block composes no disclosure anywhere, because a disclosure is a
 * control and a control in a Block is the finding the block controls gate exists
 * to catch, and because a relation behind a disclosure is a record the reader has
 * to choose to find.
 *
 * **The record's actions are the caller's node, placed in the record's own band.**
 * What the screen can do to itself belongs to `PageHeader01`; what can be done to
 * this record belongs beside its identity, and a detail in a split pane has no
 * page header above it. The prop is one optional `ReactNode` and the Block
 * renders no control of its own, so there is no edit, archive or delete button
 * here, and the confirmation for a destructive action is the caller's own
 * `AlertDialog` composed around their control in the same slot. There is no cap
 * on how many actions are placed, because a slot cannot be counted.
 *
 * **A relation with no members draws `EmptyState01` at a reason the caller names,
 * in the relation's own frame.** Every one of that Block's reasons is a statement
 * about a collection, and a relation with no members is exactly that: a customer
 * with no invoices, an order with no payments and a project with no people are
 * all collections that are empty, narrowed, emptied or hidden. `NothingChosen01`
 * is a statement about a reader's pointer at a record in the index beside the
 * pane, which this Block cannot be in, because a Block handed a record was handed
 * the selection with it.
 *
 * **It takes no total, no count and no sum.** A relation's `count` is the
 * caller's own string and is never derived from the members, because a count
 * computed over the members a Block was handed is false the moment the collection
 * is larger than the page. A screen that wants a figure composes `Summary01` or
 * `Stats01` into `children` rather than asking this Block to keep a running
 * total, and a record write form is a Block composed beside or below this one and
 * never a mode of it.
 *
 * It owns no selection, fetch, ordering, paging or filtering of its relations,
 * no navigation and no address, no edit state, no confirmation, toast, retry or
 * undo, and no second pane. It is a server Component: no hook beyond `useId`, no
 * state and no client code, so a consumer that passes a client action inside a
 * slot pays for the action and not for the frame.
 *
 * **It is measured against `IssueDetail01`, which is deprecated in its favour.** An
 * issue detail and a record detail are the same job: a key in the mono face, a state
 * as a tone beside the caller's own words, declared facts, a body and a thread in the
 * caller's order. The issue detail's name is wrong the moment the record is an invoice
 * or a subscription, and a name that has to be wrong about nine tenths of its uses is
 * a name that fails the test that its name survives being wrong, so that Item is
 * deprecated rather than merged or replaced. A reader arriving at either Item arrives
 * at the same answer: a record drawn in full is this Block, whatever the product calls
 * its records.
 */
export function RecordDetail01({
  title,
  eyebrow,
  description,
  fields,
  children,
  actions,
  relations,
  headingLevel = 'h2',
  className,
}: RecordDetail01Props) {
  const relationLevel = childLevel(headingLevel)
  const list = relations ?? []

  return (
    <Section data-slot="record-detail-01" className={cn(className)}>
      <div className="flex flex-col gap-10">
        {/*
          The record's own band: its identity on one side and its actions on the
          other. The actions sit beside the record rather than at the top of the
          viewport because a reader who has been reading one record for a minute
          is looking for that record's actions, not for the screen's.
        */}
        <div
          data-slot="record-detail-01-band"
          className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4"
        >
          <div className="flex min-w-0 flex-col gap-2">
            {eyebrow === undefined ? null : (
              <span data-slot="record-detail-01-eyebrow" className="text-muted-foreground font-mono text-sm">
                {eyebrow}
              </span>
            )}
            <SectionHeading
              as={headingLevel}
              align="left"
              title={title}
              description={description}
              className="mb-0"
            />
          </div>

          {actions === undefined ? null : (
            <div
              data-slot="record-detail-01-actions"
              className="flex shrink-0 flex-wrap items-center gap-2"
            >
              {actions}
            </div>
          )}
        </div>

        {/*
          The facts as a definition list, which is what a set of terms and their
          answers read down a column is. `contents` on the pair is what lets the
          `dl` own the grid while each term and its answer stay one pair.
        */}
        {fields === undefined || fields.length === 0 ? null : (
          <dl
            data-slot="record-detail-01-fields"
            className="grid gap-x-8 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)]"
          >
            {fields.map((field) => (
              <div key={field.id} data-slot="record-detail-01-field" className="contents">
                <dt className="text-muted-foreground text-sm font-medium">{field.label}</dt>
                <dd className="min-w-0 text-sm">{field.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children === undefined ? null : (
          <div data-slot="record-detail-01-content" className="flex flex-col gap-10">
            {children}
          </div>
        )}

        {list.length === 0 ? null : (
          <div
            data-slot="record-detail-01-relations"
            className="divide-border divide-y overflow-hidden rounded-xl border"
          >
            {list.map((relation) => (
              <Relation key={relation.key} relation={relation} level={relationLevel} />
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

export default RecordDetail01
