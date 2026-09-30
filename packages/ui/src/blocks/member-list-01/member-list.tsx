'use client'

import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The three presences a member can be in, and the tone each one is drawn in.
 *
 * The mapping is stated here rather than left in the caller's hands, and the
 * reason is that a presence is a statement about a colleague. `online` is
 * `success`, because it is the state the reader is looking for and it is the one
 * a green dot has always meant. `away` is `warning`, because a colleague who is
 * away has said they are not available and amber is the one tone in the contract
 * that reads as not available rather than as broken. `offline` is `neutral`,
 * because most people on a member list are offline and a row of red dots is a
 * page of alarms that means nothing.
 *
 * `offline` is deliberately not `destructive`. Somebody who closed their laptop
 * has not broken anything, and a tone that says they have is a claim about a
 * colleague drawn from a row of data. The cost is stated rather than hidden: a
 * reader who cannot separate `neutral` from `success` on a small dot still reads
 * the words beside it, which is the same trade `Status` makes everywhere.
 */
const PRESENCE_TONE: Record<MemberPresence, StatusTone> = {
  online: 'success',
  away: 'warning',
  offline: 'neutral',
}

/**
 * What a member is doing right now, as far as the caller knows.
 *
 * The caller knows, not this Block. Presence arrives from a socket or a poll the
 * consumer owns, and a Block that read it would be a Block that fetches.
 */
export type MemberPresence = 'online' | 'away' | 'offline'

/**
 * One member, as a members list shows them: who they are, what they do, whether
 * they are around, and when they were last here.
 */
export type MemberList01Member = {
  /**
   * A stable key for the row, passed back to `onSelect` and `actions`, and
   * carried on the markup as `data-member` so a test can name one row rather than
   * the first one.
   */
  id: string
  /** The member's own name, and the accessible name of the row's control. */
  name: string
  /** What they do. Omit it rather than passing an empty string. */
  role?: string
  /** Where they are, as far as the consumer knows. See `MemberPresence`. */
  presence?: MemberPresence
  /**
   * The words for the presence, in the consumer's own vocabulary.
   *
   * Required whenever `presence` is given and not defaulted, for the reason
   * `StatusLedger01`'s `statusLabel` states in full: the tone is a colour and the
   * words are the information, and three products that call the same state "free",
   * "available" and "online" cannot be given one word by a design system. A
   * missing one throws, because a presence dot with no words beside it is a
   * claim about a colleague that nothing in the document backs up.
   */
  presenceLabel?: string
  /**
   * When the member was last here, already written as it should be read.
   *
   * A string rather than a `Date` and rather than a number of minutes, because a
   * Block ships no formatting: see the Block's JSDoc for what the honest reading
   * of a last-seen is and why Prism does not print it.
   */
  lastSeen?: string
  /**
   * The portrait, with the name the initials come from.
   *
   * Omit it for a member the consumer has no photograph of. The initials rule
   * is the one `AvatarGroup` applies and it is repeated rather than imported; see
   * that Component for why the helper is not exported.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The member's name, which is the initials' source. */
    name: string
  }
  /**
   * Where the member's own record goes.
   *
   * Rendered as a real anchor on the identity part of the row, so the destination
   * shows in the status bar and can be opened in a new context. Mutually
   * exclusive with a Block-level `onSelect`: see the Block's JSDoc.
   */
  href?: string
}

/**
 * The props a MemberList01 takes.
 *
 * Every string is a prop and the Block ships none. There is no member list, no
 * default presence vocabulary and not one default presence label, because a
 * presence label is a claim about a colleague and a design system is not the party
 * that makes it.
 */
export type MemberList01Props = {
  /**
   * The list's own accessible name, rendered as the list's name and as no visible
   * text.
   *
   * A string rather than a node because `aria-label` is a string in the platform:
   * a node label would need an `aria-labelledby` hop to an element the
   * surrounding panel owns, which is the caller's decision and not this Block's.
   */
  label?: string
  /** The section title. Omit it for a list composed inside a panel that has one. */
  title?: ReactNode
  /** The members, in the order the caller wants them. The Block does not sort. */
  members: readonly MemberList01Member[]
  /**
   * Makes each row a control.
   *
   * Pass it and every row is a real button whose accessible name is the member's
   * own name, and this is the one Block in this wave that ships client code: a
   * surface that attaches a handler is a client Component, and the directive is
   * here rather than in a leaf so a consumer composing a server page gets the
   * boundary in one place.
   */
  onSelect?: (id: string) => void
  /**
   * The controls at the trailing edge of one row.
   *
   * A function of the member id rather than a node, so a caller with one row
   * action set draws it once for a list of any length. These are in addition to
   * whatever `href` or `onSelect` reaches and never instead of it, which is the
   * rule `Item` states and the reason a members list never has a row whose only
   * destination is a kebab menu.
   */
  actions?: (id: string) => ReactNode
  /**
   * What the list shows when there are no members.
   *
   * A slot rather than a sentence, for the reason `EmptyState01` exists: an empty
   * list has more than one reason behind it and the words differ. With nothing
   * passed and no members, this Block renders nothing at all.
   */
  empty?: ReactNode
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup` applies, repeated rather than
 * imported, and the boundary is the reason: that helper is private to its module
 * and exporting it would make a private derivation part of a published surface
 * to save six lines in a Block. The cost is stated rather than hidden: two
 * modules carry the rule, so a change to it is a change in both.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * The three refusals, so that a member list never renders something it cannot
 * justify.
 *
 * A presence with no words is a coloured dot, which is unreadable to a screen
 * reader and invisible to a reader who cannot separate the tones. A member with
 * both a destination and a selection is two controls in one row, which no
 * keyboard model can express. The rest is composition the caller owns.
 */
function assertMembers(members: readonly MemberList01Member[], selectable: boolean): void {
  for (const member of members) {
    if (member.presence !== undefined && (member.presenceLabel === undefined || member.presenceLabel.trim() === '')) {
      throw new Error(
        'MemberList01: a member declares a presence and no presenceLabel, so the dot would be a colour with ' +
          'nothing to read beside it, which is a claim about a colleague no document backs up. Pass the words ' +
          'this product uses for that state.',
      )
    }

    if (selectable && member.href !== undefined) {
      throw new Error(
        'MemberList01: a member declares an href while the list is selectable, so the row would be a link and a ' +
          'button at once. Pick one for the row: either the member has a destination, or the row selects.',
      )
    }
  }
}

/**
 * A dense list of people for an application surface: a name, a role, a presence,
 * a last-seen column and a slot for the caller's own row actions.
 *
 * **This is a Block and not `Item` and not `ListPanel`, and the two facts that
 * make it a member list are the presence dot and the last-seen column.** `Item`
 * is a row, and it is the right row for most lists: media, a title, a
 * description, one value and trailing controls. What it cannot be is a row that
 * knows a colleague is online. Its `meta` is one value, so presence and last-seen
 * would have to be packed into one field and read as a single sentence by a
 * screen reader, which is exactly the defect `Item`'s own JSDoc argues against
 * when it says a row should not have to guess. `ListPanel` is the other half: a
 * titled, bounded, scrollable region with header and footer slots, which knows
 * about a region and not about its rows. Composing a member list from those two
 * would leave every consumer writing the same two columns again, and writing them
 * slightly differently each time, which is the drift this package exists to end.
 *
 * **The presence tones are mapped here and the words are the caller's, because a
 * wrong mapping is a claim about a colleague.** `online` is `success`. `away` is
 * `warning`, the one tone that reads as not available rather than as broken. And
 * `offline` is `neutral` rather than `destructive`, because most people on a
 * members list are offline and a page of red dots says a page of faults, which
 * nobody believes and everybody has to look at. The words beside the dot come
 * from `presenceLabel`, because three products that call the same state "free",
 * "available" and "online" cannot be given one word by a design system, and a dot
 * with no words is a claim with nothing in the document to check it against.
 *
 * **`lastSeen` is a string and Prism prints it exactly as passed.** The honest
 * reading of when somebody was last around is a localised one, which is what
 * `relative-time` exists for, so the caller composes that Component in its own
 * code and passes the reading it produced, or draws the Component beside this
 * list. A Block that formatted the moment itself would be choosing a locale, a
 * calendar and a granularity on a colleague's behalf, and would put `Intl` in
 * every consumer's bundle for a rendering Prism has no stake in. The cost is
 * stated rather than hidden: a caller who passes a raw timestamp gets a raw
 * timestamp, which is honest and rarely what was wanted.
 *
 * **A row with `onSelect` is a real button whose accessible name is the member's
 * name and nothing else.** The name is set as the accessible name explicitly so
 * that the role, the presence words and the last-seen reading inside the row do
 * not get appended to it, which would make the button's name a sentence a
 * speaker has to read twice. The visible name is inside that accessible name, so
 * the WCAG rule that a visible label must be contained in the accessible name
 * holds; the alternative, letting the row's own text name the button, is the
 * arrangement this sentence exists to prevent. The button wraps the identity part
 * of the row only, with the presence, the reading and the caller's actions
 * outside it, so one row is one control and the actions are the second thing a
 * reader meets rather than the first.
 *
 * **`href` and `onSelect` are exclusive per member, and the type cannot say so,
 * so a check does.** A row that is a link and a button at once is not a control
 * any keyboard model can express, and passing both is a mistake rather than a
 * request, so it throws in a consumer's console rather than rendering one of the
 * two. The alternative was a union on the member type keyed on a Block-level
 * prop, which would have made every caller narrow their own data for a decision
 * this Block can make once.
 *
 * It is the one client Block in this wave and the directive is the reason rather
 * than an accident: `onSelect` attaches a handler, and a surface that attaches a
 * handler owns the JavaScript that carries it. With `onSelect` omitted the
 * rendered output is entirely static and there is no state to hydrate, because
 * `Avatar` is the only client leaf and its client work is measuring whether an
 * image has loaded.
 */
export function MemberList01({
  label,
  title,
  members,
  onSelect,
  actions,
  empty,
  headingLevel = 'h2',
  className,
}: MemberList01Props) {
  assertMembers(members, onSelect !== undefined)

  return (
    <Section className={cn('py-6', className)}>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          title={title}
          className="mb-6"
        />
      ) : null}

      {members.length === 0 ? (
        empty === undefined ? null : (
          <div data-slot="member-list-empty" className="text-muted-foreground text-pretty text-sm">
            {empty}
          </div>
        )
      ) : (
        <ul
          data-slot="member-list"
          aria-label={label}
          className="border-border flex flex-col border-t"
        >
          {members.map((member) => {
            const identity = (
              <>
                {member.name}
                {member.role === undefined ? null : (
                  <span className="text-muted-foreground block text-xs">{member.role}</span>
                )}
              </>
            )

            return (
              <li
                key={member.id}
                data-slot="member-list-row"
                data-member={member.id}
                data-presence={member.presence}
                className="border-border flex items-center gap-3 border-b px-3 py-2"
              >
                {member.avatar === undefined ? null : (
                  <Avatar className="size-8">
                    {member.avatar.src === undefined ? null : (
                      <AvatarImage src={member.avatar.src} alt="" />
                    )}
                    <AvatarFallback className="text-mono">
                      {initialsOf(member.avatar.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {onSelect === undefined ? (
                  member.href === undefined ? (
                    <span data-slot="member-list-identity" className="min-w-0 flex-1 text-sm font-medium">
                      {identity}
                    </span>
                  ) : (
                    <a
                      data-slot="member-list-identity"
                      href={member.href}
                      className="focus-visible:ring-ring min-w-0 flex-1 rounded-sm text-sm font-medium transition-colors duration-fast ease-out hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                      {identity}
                    </a>
                  )
                ) : (
                  <button
                    data-slot="member-list-identity"
                    type="button"
                    aria-label={member.name}
                    onClick={() => onSelect(member.id)}
                    className="focus-visible:ring-ring min-w-0 flex-1 rounded-sm text-left text-sm font-medium transition-colors duration-fast ease-out hover:underline focus-visible:ring-[3px] focus-visible:outline-none"
                  >
                    {identity}
                  </button>
                )}

                {member.presence === undefined ? null : (
                  <Status
                    size="sm"
                    tone={PRESENCE_TONE[member.presence]}
                    label={member.presenceLabel}
                    className="shrink-0"
                  />
                )}

                {member.lastSeen === undefined ? null : (
                  <span
                    data-slot="member-list-last-seen"
                    className="text-muted-foreground shrink-0 text-xs tabular-nums sm:w-40 sm:text-right"
                  >
                    {member.lastSeen}
                  </span>
                )}

                {actions === undefined ? null : (
                  <span data-slot="member-list-actions" className="flex shrink-0 items-center gap-1">
                    {actions(member.id)}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export default MemberList01