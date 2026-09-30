import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Prose } from '../../components/ui/prose'
import { RelativeTime } from '../../components/ui/relative-time'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { Tag } from '../../components/ui/tag-group'
import { cn } from '../../lib/utils'

/**
 * The tone an issue's state is drawn in, from the semantic contract and no other.
 *
 * The state is the caller's own string and the words beside it are the caller's
 * too, and the pair is the whole design for the same reason it is the design in
 * `StatusLedger01`, `FieldMap01` and `Project01`: a tone is a colour, and colour is
 * not information a reader can act on. Four trackers between them use fourteen
 * words for a state column, where "Open", "Active" and "Todo" are one position and
 * "Shipped", "Resolved" and "Done" are another, and a Block that rendered the
 * state key would put one tracker's vocabulary into every consumer's product.
 *
 * So the table below is keyed by the caller's own words rather than by a union, and
 * a state this table has not been taught draws in the supporting ink. The cost is
 * named rather than hidden: a consumer whose states are "needs-triage",
 * "ready-for-agent" and "wontfix" gets three neutral dots and three words, and the
 * words are what carry the column. A caller who wants a triage column to read at a
 * glance extends this map, which is a one-line change in their own file rather than
 * a request to Prism for a state it has no opinion about.
 */
const DEFAULT_TONE: Record<string, StatusTone> = {
  planning: 'info',
  active: 'success',
  blocked: 'warning',
  complete: 'success',
  archived: 'neutral',
  open: 'info',
  closed: 'success',
}

/**
 * The tone a state is drawn in, falling back to the supporting ink.
 *
 * `neutral` for a state this table does not name, and the reason is that an
 * unrecognised state is not an emergency: it is a vocabulary this Block has not
 * been taught, and drawing it in the alarm colour would turn a naming mismatch
 * into a page of red rows. The state value is on the row as `data-state`, so a
 * consumer reading their own page can see which states need mapping rather than
 * guessing which ones are wrong.
 */
function toneOf(state: string): StatusTone {
  return DEFAULT_TONE[state] ?? 'neutral'
}

/**
 * A person, as a tracker shows one: a name and the portrait where there is one.
 *
 * The same shape `Team01` takes, repeated rather than imported for the reason that
 * file gives: a Block that is not a card grid is not a place a person's identity
 * belongs, and a caller who draws a person in a comment thread and the same person
 * on a team page is better served by one field name than by a type exported from
 * whichever Block they found first.
 */
export type IssueDetail01Person = {
  /** The person's own name, as they publish it. */
  name: string
  /**
   * The portrait, with the name the initials come from.
   *
   * A name rather than a string, because an `Avatar` with no fallback is an empty
   * circle for exactly as long as the image takes to arrive and forever if it never
   * does.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
}

/**
 * One fact the reader is entitled to be told about the issue, and what it reads.
 *
 * `label` and `value` are separate because they answer different questions for
 * different readers: the label is what a reader scanning the field list is
 * looking for, and the value is what a reader who has arrived at that field wants.
 * The value is a node because the facts a tracker hangs off an issue are the
 * caller's own and they are not all text: a status word, a date, a link, a chip, a
 * count and a nested list are all things a caller puts in one slot, and a
 * `string` would force a flattening that loses whichever one it could not hold.
 */
export type IssueDetail01Field = {
  /** A stable key for the field, so a test and the caller can name one of them. */
  id: string
  /** What the fact is, in the product's own words. */
  label: string
  /** What it reads. */
  value: ReactNode
}

/**
 * One comment on the issue: who wrote it, when, and what they said.
 *
 * `body` is a node and is not optional, because a comment with no body is not a
 * comment: it is a reaction, and a product that has reactions has somewhere else
 * to put them. `author` is required rather than optional for the same reason a
 * comment thread cannot start with a reading: an unattributed comment is a claim
 * nobody can check, and a tracker that allows one is a tracker whose history is not
 * a record.
 */
export type IssueDetail01Comment = {
  /** A stable key for the comment. */
  id: string
  /** Who wrote it. */
  author: IssueDetail01Person
  /**
   * When it was written, in whichever of the three forms the caller holds it.
   *
   * Omit it for a comment with no moment, which is a real one: an imported
   * archive and a webhook that posts without a clock both produce comments with
   * no date, and a Block that invented one would be claiming a fact.
   */
  at?: number | string
  /**
   * The sentence for that moment, given the moment.
   *
   * Optional rather than required, and the difference from a progress bar is the
   * difference between a number and a date: a bar at forty per cent with no
   * sentence announces a figure meaning whatever the reader assumes, while a date
   * in the reader's own locale is already a complete reading. The sentence is
   * there for the reader who wants to know how stale the thread is rather than
   * when it was written, and the honest cost is that a thread whose comments carry
   * no `at` shows a reading and no age.
   */
  dateLabel?: (value: number | string) => string
  /** What they said. */
  body: ReactNode
}

/**
 * The issue itself: the key a machine knows it by, the sentence a person reads,
 * where it stands, who opened it, when, and the facts the caller says a reader may
 * be told.
 */
export type IssueDetail01Issue = {
  /**
   * The issue's own key, as its system spells it: `NX-412`, `GH-1180`, a UUID.
   *
   * Drawn in the mono face above the title, and that is the whole reason it is
   * there and the whole reason it is set that way. A key is machine notation: it
   * is what a reader pastes into a search box, quotes in a message and cites in a
   * review, and this repository annotates machine-readable values with the mono
   * stack rather than with anything else. It is a separate field from the title
   * rather than part of it because the two answer different questions and are read
   * at different moments: a reader who has the key wants the issue and ignores the
   * sentence, and a reader who has the sentence has no use for the key.
   */
  key: string
  /**
   * The issue's title, in the words its author wrote.
   *
   * It is the section heading rather than a field in the surface, because an issue
   * detail whose title is a line of body text has already lost the outline: a
   * reader navigating by heading would meet the section and then nothing until the
   * fields.
   */
  title: string
  /**
   * Where the issue stands, in the tracker's own vocabulary.
   *
   * A string and not a union, because an issue tracker and a task list and a
   * support queue all have a state column and all three disagree about what the
   * values are. The words beside the dot are the caller's and the tone is drawn
   * from the table above, and both halves of the column are the caller's to keep.
   */
  state: string
  /**
   * The words for that state.
   *
   * Optional in the type and required in practice, because every issue carries a
   * state, and the run throws without it. A dot with no sentence beside it is the
   * one arrangement every Component in this package refuses to draw, for the same
   * reason each time: a state a reader can only see is a state nobody can act on.
   */
  stateLabel?: string
  /** Who opened it. Omit it for an issue imported with no author. */
  author?: IssueDetail01Person
  /**
   * When it was opened, in whichever of the three forms the caller holds it.
   *
   * Handed to `RelativeTime` untouched, so the reading a reader sees is the
   * platform's in their own locale. See the Block JSDoc for why this Block formats
   * nothing and takes the sentence from the caller instead.
   */
  openedAt?: number | string
  /**
   * The sentence for that moment, given the moment.
   *
   * Optional, for the reason `IssueDetail01Comment.dateLabel` gives: a localised
   * date is already a complete reading and the sentence is the caller's addition
   * for a reader who wants the age rather than the date.
   */
  dateLabel?: (value: number | string) => string
  /**
   * What the issue says, as a node.
   *
   * The caller's own writing, and it is drawn through `Prose` because an issue body
   * is prose written by a person rather than a field a Block composed: it has
   * paragraphs, it has lists, it has a code block in it, and `Prose` styles a
   * consumer's plain elements as this system without asking the consumer for a
   * class. A Block that set a body as one muted paragraph would flatten the three
   * bodies out of the four that are not one paragraph.
   */
  body?: ReactNode
  /**
   * The facts a reader is entitled to be told about this issue, in the order they
   * should be read.
   *
   * The caller's list, and the reason is the argument the whole Block rests on. An
   * issue detail surface with a fixed set of fields is a surface that decides what a
   * reader may be told about an issue, and that decision is invisible in a review
   * because the rendered surface looks complete: four labelled values and a
   * comment thread read as a finished page. A tracker whose issues carry a story
   * point, a sprint, an epic, a customer and a severity has five facts this system
   * knows nothing about, and a surface that named four of them would have to be
   * forked to carry the fifth, in a package whose whole promise is that there is no
   * override path. So Prism names no fields at all and draws the caller's, and the
   * cost is stated rather than hidden: the field list has no heading of its own, so
   * a caller who wants one composes a title into the first field or draws the list
   * themselves.
   */
  fields?: IssueDetail01Field[]
  /** The caller's own chips for this issue, in the order they should be met. */
  labels?: { id: string; label: ReactNode }[]
}

/**
 * The props an IssueDetail01 takes.
 *
 * Every string and every number is a prop and the Block ships none: no key, no
 * title, no state, no field, no comment, no chip and not one word of the empty
 * thread or the sentence beside a date. The absence of the issue is the sharpest
 * version of the rule, because an issue header drawn with a key in it is the
 * easiest thing in this package to write by accident and the most likely to be
 * somebody else's backlog.
 */
export type IssueDetail01Props = {
  /** The issue. */
  issue: IssueDetail01Issue
  /**
   * The comments, oldest first and newest last, in the caller's order.
   *
   * The Block never sorts them, and the reason is the one `AuditLog01` gives: an
   * order a Block imposed is a claim about which record came first, and a thread
   * sorted the wrong way reads as a conversation in an order nobody had. It is
   * worse than a layout problem for a second reason, which is that the sorting
   * would be invisible: a thread rendered newest first looks exactly like a thread
   * rendered oldest first to a reader who has no reference for which is which, and
   * the only way to notice is to know the truth. So the order is the caller's and
   * this Block never touches it, and a caller whose store returns newest first
   * passes `reverse()`.
   */
  comments?: IssueDetail01Comment[]
  /**
   * The editor slot, under the thread.
   *
   * A slot and not a textarea, because a comment editor is a product decision and
   * the biggest one on this surface: whether it is a textarea or a rich editor,
   * whether it previews markup, whether it posts on a command or a button, whether
   * it holds a draft across a navigation and where the draft is stored, and what
   * happens when the submit fails. A Block that drew the editor would be drawing
   * all six, and a consumer who wanted a different one would have to replace the
   * Block rather than configure it, which is the one thing this package does not
   * offer. The cost is stated rather than hidden: there is no announce hook here
   * either, so a caller whose product posts optimistically and then reports a
   * failure composes their own `LiveRegion` beside the form.
   */
  commentForm?: ReactNode
  /**
   * The controls that act on the issue: assign, close, reopen, subscribe.
   *
   * A slot and not a set of named buttons, because which controls an issue has is
   * the caller's fact, and because a permission is a decision about the reader:
   * a Block that drew a close control would hand every consumer a control its
   * product may not grant the reader who is looking at it. Drawn at the top of the
   * main column, under the facts, because a reader who opened an issue to act on it
   * is looking for the controls before they are looking at the thread.
   */
  actions?: ReactNode
  /**
   * The aside: labels, watchers, related issues, a project panel, an activity log.
   *
   * One slot rather than a set of named parts, for the same reason the fields are
   * the caller's list: what belongs beside an issue is a fact about the consumer's
   * model, and a Block that named four of those parts would be deciding what an
   * issue is. The cost is that a caller with six of them composes their own
   * arrangement inside the slot, which is a layout they would have written anyway.
   */
  sidebar?: ReactNode
  /**
   * Whether the aside sits beside the body or under it.
   *
   * `split` is the default because an aside is what an aside is for: the labels,
   * the watchers and the related issues are looked at after the body, and a reader
   * who has to scroll past four hundred words of thread to find the labels has been
   * sent to the wrong place. `stacked` is right in a narrow column, where a
   * two-column layout would put the main content at half the measure, and where a
   * reader on a phone would otherwise have to scroll past the whole thread to reach
   * anything in the aside at all.
   */
  layout?: 'split' | 'stacked'
  /** Heading level for the issue title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Block. */
  className?: string
}

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup`, `Team01`, `Project01` and
 * `ProjectList01` apply and it is repeated here for the reason `Team01` states in
 * full: that helper is private to its module and exporting it would make a private
 * derivation part of the published surface of a Component in order to save six
 * lines in a Block. The cost of the repetition is named rather than hidden, because
 * five modules now carry this rule and a change to it is a change in five.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}$${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * One issue in full: the key a machine knows it by, the title, the state, the
 * fields the caller says a reader may be told, the body, the thread, and the
 * controls that act on it.
 *
 * **The reader here is looking for one issue, one of the two things they came for
 * being a particular one.** That is the fact the whole arrangement is built on:
 * somebody has a key or a sentence from a colleague, and everything on this surface
 * is arranged so that key and that sentence are the two things a reader meets
 * first, before the body and long before the thread. Scanability and keyboard
 * reach outrank expression at this tier, and a key a reader has to hunt for is a
 * key they will copy from the wrong place.
 *
 * **The fields are the caller's, and that is the argument the whole Block rests
 * on.** An issue detail surface with a fixed set of fields is a surface that
 * decides what a reader may be told about an issue, and the decision is invisible
 * in review because the rendered surface looks complete: four labelled values and
 * a thread read as a finished page, and a reviewer sees no gap. A tracker whose
 * issues carry a story point, a sprint, an epic, a customer and a severity has five
 * facts this system knows nothing about, and a surface that named four of them
 * would have to be forked to carry the fifth, in a package whose whole promise is
 * that there is no override path and no merge. So `fields` is the caller's list and
 * Prism names none: it draws a definition list of whatever the caller declares,
 * which is the same argument `Contact01` makes about a form's fields and reaches
 * the same way, from the same refusal to decide what a record is made of. The cost
 * is stated rather than hidden: the list has no heading of its own, so a caller
 * who wants one either composes a title into their first field or draws the list
 * themselves in the `sidebar` slot, and a caller with twenty fields per issue has a
 * twenty-row definition list where a table would read better.
 *
 * **The key is in the mono face because an identifier is machine notation.** It is
 * the one value on this surface a reader pastes into a search box, quotes in a
 * message and cites in a review, and this repository annotates machine-readable
 * values with the mono stack rather than with anything else. It sits above the
 * title rather than inside it, and the reason is that the two answer different
 * questions and are read at different moments: a reader who has the key wants the
 * issue and ignores the sentence, and a reader who has the sentence has no use for
 * the key. Set in the interface face, the two would read as one string and a reader
 * scanning for either would have to read both.
 *
 * **The thread renders in the order the caller passes it and this Block never
 * sorts, for the reason `AuditLog01` gives.** An order a Block imposed is a claim
 * about which record came first, and a conversation rendered in an order nobody
 * had reads as a conversation in that order: the reply appears above the question
 * it answers and the reader reconstructs the thread from the timestamps. The
 * failure is silent in the way that matters most here, because a thread rendered
 * newest first looks exactly like a thread rendered oldest first to a reader with
 * no reference for which is which, and the only way to catch it is to already know
 * the answer. So `comments` is drawn in the order it arrives, oldest first and
 * newest last is the convention rather than a rule, and a caller whose store
 * returns newest first passes `reverse()` in their own code where the decision
 * about their data belongs.
 *
 * **The body and every comment are drawn through `Prose`, because they are prose
 * written by a person rather than fields this Block composed.** An issue body has
 * paragraphs, lists and a code block in it, and a Block that set it as one muted
 * paragraph would flatten three bodies out of the four that are not one paragraph.
 * `Prose` styles a consumer's plain elements as this system without asking the
 * consumer for a class, which is the whole reason it exists and the reason the two
 * slots are nodes rather than strings. The cost is a real one: `Prose` is a set of
 * descendant selectors over arbitrary children, so a caller who puts an
 * interactive control inside a body inherits styles written for text, and the
 * answer is a plain container in their own node.
 *
 * **The dates are the caller's and the sentence is the caller's.** Both moments on
 * this surface are handed to `RelativeTime` untouched, so the absolute reading a
 * reader sees is the platform's own in the language they have, and `dateLabel`
 * supplies the sentence beside it, which is the one string in the pair that is
 * English by nature: it has a plural, it changes shape past a day, and every
 * language words it differently. A Block that formatted the moment would ship one
 * locale's format into every consumer's backlog. The cost is that `dateLabel` is
 * optional here, unlike `progressLabel` on `Project01`, and the difference is the
 * difference between a figure and a date: a bar at forty per cent with no sentence
 * announces a number meaning whatever the reader assumes, while a localised date is
 * already a complete reading and the sentence is an addition.
 *
 * **Nothing here is interactive and the editor is a slot, which is what makes this
 * a server Component.** An issue's body, its fields and its thread are content, and
 * a Block that owned a comment editor would own six decisions at once: whether the
 * editor is a textarea or a rich editor, whether it previews markup, whether it
 * posts on a command or a button, whether a draft survives a navigation and where
 * it is stored, and what happens when the submit fails. A consumer who wanted a
 * different one of those would have to replace the Block rather than configure it,
 * which is the one thing this package does not offer. The cost is named rather
 * than hidden: there is no announce hook either, so a caller whose product posts
 * optimistically and then reports a failure composes their own `LiveRegion` beside
 * the form.
 */
export function IssueDetail01({
  issue,
  comments,
  commentForm,
  actions,
  sidebar,
  layout = 'split',
  headingLevel = 'h2',
  className,
}: IssueDetail01Props) {
  if (!issue.stateLabel) {
    throw new Error(
      `IssueDetail01: the issue "${issue.key}" carries a state and no stateLabel, so its row would be a ` +
        'dot with no sentence beside it, and a state a reader can only see is a state nobody can act on. ' +
        `Pass the words your readers use for that state.`,
    )
  }

  const fields = issue.fields ?? []
  const labels = issue.labels ?? []
  const thread = comments ?? []

  const main = (
    <div data-slot="issue-detail-main" className="flex min-w-0 flex-col gap-10">
      {actions === undefined ? null : (
        <div data-slot="issue-detail-actions" className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}

      {issue.body === undefined ? null : (
        <Prose data-slot="issue-detail-body">{issue.body}</Prose>
      )}

      {fields.length === 0 ? null : (
        /*
          The caller's facts as a definition list, and a definition list rather
          than a table because a field list is a set of terms and their answers
          read down a column, which is what a `dl` is for. The label is the term
          and the value is the answer, so a reader who navigates to a term hears
          the label and the value together rather than a value with no statement
          of what it is. `contents` on the pair is what lets the `dl` own the
          grid while each term and its answer stay one pair of elements.
        */
        <dl data-slot="issue-detail-fields" className="grid gap-x-8 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)]">
          {fields.map((field) => (
            <div key={field.id} data-slot="issue-detail-field" className="contents">
              <dt className="text-muted-foreground text-sm font-medium">{field.label}</dt>
              <dd className="min-w-0 text-sm">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {labels.length === 0 ? null : (
        <div data-slot="issue-detail-labels" className="flex flex-wrap items-center gap-1.5">
          {labels.map((label) => (
            <Tag key={label.id} label={label.label} />
          ))}
        </div>
      )}

      {/*
        The thread, and one `<ol>` for all of it. A thread split by a page, a day
        or a participant would be several lists and a screen reader would announce
        it as several, so the list is one list and the order inside it is the
        caller's. See the JSDoc above for why this Block does not sort it.
      */}
      {thread.length === 0 ? null : (
        <ol data-slot="issue-detail-comments" className="flex flex-col gap-8">
          {thread.map((comment) => (
            <li
              key={comment.id}
              data-slot="issue-detail-comment"
              className="border-border flex flex-col gap-2 border-t pt-5"
            >
              <div
                data-slot="issue-detail-comment-head"
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                {comment.author.avatar === undefined ? null : (
                  <Avatar className="size-6">
                    {comment.author.avatar.src === undefined ? null : (
                      <AvatarImage src={comment.author.avatar.src} alt="" />
                    )}
                    <AvatarFallback className="text-mono">
                      {initialsOf(comment.author.avatar.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm font-medium">{comment.author.name}</span>
                {comment.at === undefined ? null : (
                  <RelativeTime
                    className="text-muted-foreground text-sm"
                    date={comment.at}
                    relative={comment.dateLabel?.(comment.at)}
                  />
                )}
              </div>

              <Prose data-slot="issue-detail-comment-body">{comment.body}</Prose>
            </li>
          ))}
        </ol>
      )}

      {commentForm === undefined ? null : (
        <div data-slot="issue-detail-comment-form" className="max-w-measure">
          {commentForm}
        </div>
      )}    </div>
  )

  return (
    <Section data-slot="issue-detail-01" data-layout={layout} className={cn(className)}>
      <div className="flex flex-col gap-8">
        <div data-slot="issue-detail-head" className="flex flex-col gap-4">
          {/*
            The key, above the title, in the mono face. The whole reason it is a
            separate element rather than part of the title is in the JSDoc: a
            reader who has the key wants the issue and ignores the sentence, and a
            reader who has the sentence has no use for the key, so the two are read
            at different moments and one of them is a machine value.
          */}
          <span data-slot="issue-detail-key" className="text-muted-foreground font-mono text-sm">
            {issue.key}
          </span>

          <SectionHeading as={headingLevel} align="left" title={issue.title} className="mb-2" />

          <div data-slot="issue-detail-facts" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Status data-state={issue.state} tone={toneOf(issue.state)} label={issue.stateLabel} />

            {issue.author === undefined ? null : (
              <span
                data-slot="issue-detail-author"
                className="flex min-w-0 items-center gap-2"
              >
                {issue.author.avatar === undefined ? null : (
                  <Avatar className="size-6">
                    {issue.author.avatar.src === undefined ? null : (
                      <AvatarImage src={issue.author.avatar.src} alt="" />
                    )}
                    <AvatarFallback className="text-mono">
                      {initialsOf(issue.author.avatar.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm">{issue.author.name}</span>
              </span>
            )}

            {issue.openedAt === undefined ? null : (
              <RelativeTime
                data-slot="issue-detail-opened"
                className="text-muted-foreground text-sm"
                date={issue.openedAt}
                relative={issue.dateLabel?.(issue.openedAt)}
              />
            )}
          </div>
        </div>

        <div
          data-slot="issue-detail-body-grid"
          className={cn(
            // The two arrangements get one display each rather than a base and an
            // override, because `flex` and `grid` are the same property and which
            // one wins is a question about the generated stylesheet rather than
            // about the order of the class names here.
            layout === 'split'
              ? 'grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14'
              : 'flex flex-col gap-10',
          )}
        >
          {main}

          {sidebar === undefined ? null : (
            <aside data-slot="issue-detail-sidebar" className="flex min-w-0 flex-col gap-6">
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    </Section>
  )
}

export default IssueDetail01
