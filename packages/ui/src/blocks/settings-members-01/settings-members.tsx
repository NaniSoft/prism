'use client'

import { type ReactNode, useId } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Field, FieldLabel } from '../../components/ui/field'
import { ListPanel } from '../../components/ui/list-panel'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * One role a member can hold, as the caller names it.
 *
 * The option list is the caller's rather than a `Role` union in this module, and
 * the argument is the same one the shared field specification's choice options
 * make: the set of
 * roles a workspace has is that workspace's own fact, it changes with its plan
 * and with its commercial agreements, and a Block that shipped a list would
 * install a permission model into every consumer's settings page.
 */
export type SettingsMembersRole = {
  /** The value handed back to `onRoleChange`. */
  id: string
  /**
   * The role's own name, as the product writes it.
   *
   * The fallback for the words, and the only one used when `roleLabel` is not
   * passed. See `SettingsMembers01Props.roleLabel` for why the function is
   * normally the one that draws the control.
   */
  label: string
}

/**
 * One member of the workspace, as a settings surface shows them.
 *
 * The six fields are the six questions a reader asks of a row on this surface:
 * who is this, what can they do, when did they arrive, and what can I do about
 * it. A row that answers four of them is a directory entry, which is
 * `member-list-01`.
 */
export type SettingsMembersMember = {
  /**
   * A stable key for the row, passed back to `onRoleChange`, and carried on the
   * markup as `data-member` so a test can name one row rather than the first.
   */
  id: string
  /** The member's own name, and the identity the row is read by. */
  name: string
  /**
   * Where the member can be reached, which is how a reader tells two people with
   * the same name apart. Omit it rather than passing an empty string.
   */
  email?: string
  /**
   * The role's machine value, so the select can show the current one and so a
   * row with no select still states what the person can do.
   */
  role: string
  /**
   * The words for the role, drawn by `roleLabel` when it is passed.
   *
   * A member with no control on the row still has a role, and a role with no
   * words is a machine value in a place a reader reads: `admin` is a term of art
   * in one product and a typo in another. See `SettingsMembers01Props.roleLabel`.
   */
  roleLabel?: string
  /**
   * When the member arrived, in whichever of the two forms the caller already
   * has it.
   *
   * A moment rather than a reading, and the reading is `joinedLabel`. The Block
   * prints the value exactly as passed when no formatter is given, which is
   * honest and rarely what was wanted; see the Block's JSDoc for the whole of
   * that argument, which `compliance-01` states for a review date and
   * `member-list-01` for a last-seen.
   */
  joined?: number | string
  /**
   * The words for the arrival, given the moment.
   *
   * A function rather than a string because the honest reading of when somebody
   * joined is a localised sentence, which is what `relative-time` hands back and
   * what no Block in this package prints on its own.
   */
  joinedLabel?: (value: number | string) => string
  /**
   * The portrait, with the name the initials come from.
   *
   * Omit it for a member the consumer has no photograph of. The initials rule is
   * the one `AvatarGroup` applies and is repeated rather than imported; see that
   * Component for why the helper is not exported.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The member's name, which is the initials' source. */
    name: string
  }
  /**
   * Marks this row as the reader's own, and the marking is what stops the Block
   * drawing a role control on it.
   *
   * The argument for the flag is in the Block's JSDoc and it is long, because
   * this is the one field here whose absence is a trap rather than a gap: a
   * settings surface that lets a reader remove themselves without saying so is a
   * trap, and one that lets a reader change their own role is worse.
   */
  isSelf?: boolean
  /**
   * The words that mark the reader's own row, such as the second person.
   *
   * Required whenever `isSelf` is set, and a thrown diagnostic rather than a
   * silent absence, for the reason `Status` gives for its own label: a row the
   * Block has decided is the reader's own, marked by nothing a reader can see,
   * is a claim with no document to check it against.
   */
  selfLabel?: string
  /**
   * The controls at the trailing edge of this row.
   *
   * A node rather than a function of the member id, because a member list this
   * size is a list where each row's action differs and the caller composes them
   * in their own map. A function would be the shape `member-list-01` uses for a
   * list of any length; here it would be a function returning a function, and
   * the caller has already got the map.
   */
  actions?: ReactNode
}

/**
 * One invitation that has been sent and not yet accepted.
 *
 * Four fields and no state, which is the decision this Block's JSDoc defends at
 * length: the only signal that an invitation has expired is that the caller
 * passed `expiresLabel`, because the Block holds no clock and a design system
 * that guessed would be guessing about somebody else's deadline.
 */
export type SettingsMembersInvitation = {
  /** A stable key for the row, carried on the markup as `data-invitation`. */
  id: string
  /** The address the invitation went to, and the row's identity. */
  email: string
  /**
   * When it was sent, in whichever of the two forms the caller already has it.
   *
   * Printed exactly as passed. See `SettingsMembersMember.joined` for why a Block
   * does not format it.
   */
  sentAt?: number | string
  /**
   * The words for an invitation that has expired.
   *
   * Its presence is the mark: the row is dimmed, the words are read beside the
   * address, and the invitation is not removed from the list. See the Block's
   * JSDoc for why a list that shrinks is worse than a list with a faded row.
   */
  expiresLabel?: string
}

/**
 * The three things a members table can put in a column, and the words above it.
 *
 * A closed set, and the closure is the point, for the reason
 * `ResourceListCell` gives: the cells are the Block's, so a table with a fourth
 * column would be a column with nothing to put in it. The names are the caller's,
 * which is the other half of the same thing. A members table has one column
 * whose name is worth arguing over, the role column, and a product that calls it
 * "Access" and a product that calls it "What they can do" are both right.
 */
export type SettingsMembersColumn = {
  /** Which cell the column draws. */
  id: 'name' | 'role' | 'joined'
  /** The heading above the column. */
  header: ReactNode
  /** Layout only: a width, or an alignment. */
  className?: string
}

/**
 * The props a SettingsMembers01 takes.
 *
 * Every string is a prop and the Block ships none. There is no member, no role
 * list, no invite copy, no column name, no arrival reading and not one of the
 * four sentences a settings surface is most tempted to ship. A settings Block is
 * where a hardcoded word does the most damage, because the reader is already
 * looking at their own account while they read it.
 */
export type SettingsMembers01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Required, because a members list with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The members, in the order a reader should meet them. The Block does not sort. */
  members: readonly SettingsMembersMember[]
  /**
   * The invitations sent and not yet accepted.
   *
   * Omit it and the group is not drawn at all, which is right for a workspace
   * that invites by link rather than by address.
   */
  invitations?: readonly SettingsMembersInvitation[]
  /**
   * The name of the group holding the pending invitations.
   *
   * Required whenever `invitations` is non-empty, and a thrown diagnostic rather
   * than a silent absence. A group with no name is not a group: it is a second
   * list on the page that a reader cannot point at, and the reader who is trying
   * to work out whether an invitation they sent is still pending is exactly the
   * reader who needs to be able to.
   */
  pendingTitle?: ReactNode
  /**
   * The caller's own invite control, drawn above the members.
   *
   * A slot and not an `inviteLabel` string with a handler of the Block's, for
   * the reason every toolbar slot in this package is a slot: the invite control
   * in a real product is a dialog trigger, a route, a popover or a command, and
   * a Block that chose would be choosing for four products at once.
   */
  inviteLabel?: ReactNode
  /**
   * The roles a member can be moved between, in the order a reader should meet
   * them.
   *
   * Passing it is what puts a role control on each row that is not the reader's
   * own, so it and `onRoleChange` travel together; the Block refuses either
   * without the other rather than rendering a control that does nothing.
   */
  roleOptions?: readonly SettingsMembersRole[]
  /**
   * The words for one role, given the option.
   *
   * Required whenever `roleOptions` is passed, and a function rather than a
   * record of strings for the reason `Integration01`'s `stateLabel` is one: a
   * role name in a consumer's settings page is exactly the defect the copy gate
   * was written to end, and three products that call the same set Owner, Admin
   * and Workspace admin cannot be given one word by a design system. The
   * function rather than a record because the honest rendering is often longer
   * than the trigger can show, and because one option may need a qualifier the
   * others do not.
   */
  roleLabel?: (option: SettingsMembersRole) => string
  /**
   * Called when a reader moves a member to another role.
   *
   * The Block holds no role state: the select is uncontrolled, the value comes
   * from `member.role`, and a change is a request the consumer answers by
   * re-rendering with the new value. That is the arrangement a server action
   * wants, and it is stated rather than hidden: a select that moved and then
   * snapped back when the request failed is a control that lied, and the fix
   * belongs where the failure is known.
   */
  onRoleChange?: (memberId: string, roleId: string) => void
  /**
   * What the list shows when there are no members.
   *
   * Required, and the reason is that a members surface has two honest empty
   * sentences and they are opposites: one is about the workspace and one is
   * about the reader who just arrived in it, and no design system knows which
   * one this consumer is in the middle of. With nothing passed this Block would
   * have to render nothing, and a heading over an empty panel reads as a fault.
   */
  empty: ReactNode
  /**
   * The caller's own column names, which is what turns the member list into a
   * table.
   *
   * Optional, and its absence is a decision rather than a default: without it
   * the members are rows, which is the right shape for the four-to-twenty-member
   * workspace and the one that holds a portrait, a name and a role on one line.
   * With it they are a real table, and the column names are then required for
   * the reason `compliance-01` states: a table whose columns are identified by
   * position is a grid, and a grid of people is a list a screen reader user
   * cannot navigate.
   */
  columns?: readonly SettingsMembersColumn[]
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
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
 * The three refusals, so that a members surface never renders something it
 * cannot justify.
 *
 * A role control with nothing to move a member to, a role control that does
 * nothing when it is moved, a row the Block has decided is the reader's own and
 * has marked in no way a reader can see, and a group of invitations under no
 * name. Each is a caller's mistake rather than a request, so each throws in a
 * console rather than rendering the quiet version of itself.
 */
function assertProps(props: {
  members: readonly SettingsMembersMember[]
  invitations?: readonly SettingsMembersInvitation[]
  roleOptions?: readonly SettingsMembersRole[]
  roleLabel?: (option: SettingsMembersRole) => string
  onRoleChange?: (memberId: string, roleId: string) => void
  pendingTitle?: ReactNode
  columns?: readonly SettingsMembersColumn[]
}): void {
  const { members, invitations, roleOptions, roleLabel, onRoleChange, pendingTitle, columns } = props

  if (roleOptions !== undefined && roleLabel === undefined) {
    throw new Error(
      'SettingsMembers01: roleOptions was passed with no roleLabel, so each role control would draw the ' +
        'option own label and no sentence about what the set is called in this product. Pass the function.',
    )
  }

  if (onRoleChange !== undefined && roleOptions === undefined) {
    throw new Error(
      'SettingsMembers01: onRoleChange was passed with no roleOptions, so every row would be a control with ' +
        'nowhere to move a member to. Pass the roles, or drop the handler and draw your own control.',
    )
  }

  if (members.some((member) => member.isSelf === true) && members.every((member) => member.isSelf === true)) {
    throw new Error(
      'SettingsMembers01: every member is marked as the reader own, so the surface is a list of one person ' +
        'and no role control is drawn on any row. A workspace with one member is a real state; the honest ' +
        'answer for it is your empty sentence rather than a table of yourself.',
    )
  }

  for (const member of members) {
    if (member.isSelf === true && (member.selfLabel === undefined || member.selfLabel.trim() === '')) {
      throw new Error(
        'SettingsMembers01: a member is marked isSelf and passed no selfLabel, so the row the Block has ' +
          'decided is the reader own would be marked by nothing a reader can see. Pass the words that say so.',
      )
    }
  }

  if ((invitations?.length ?? 0) > 0 && pendingTitle === undefined) {
    throw new Error(
      'SettingsMembers01: invitations were passed with no pendingTitle, so the group would be a second list ' +
        'on the page under no name at all. Name it, so a reader can say which list they are looking at.',
    )
  }

  for (const column of props.columns ?? []) {
    if (column.id !== 'name' && column.id !== 'role' && column.id !== 'joined') {
      throw new Error(
        `SettingsMembers01: a column names the cell ${JSON.stringify(column.id)}, which is not one of the ` +
          'three cells this table can draw. A column with nothing to put in it is a column a reader counts ' +
          'past, so add the cell rather than the heading.',
      )
    }
  }

  if (columns !== undefined && !columns.some((column) => column.id === 'name')) {
    throw new Error(
      'SettingsMembers01: columns were passed with no name column, so the table would hold no row header and ' +
        'a screen reader navigating it by row would be given numbers with nothing to attach them to. A column ' +
        'of people is the one column that names the row.',
    )
  }
}

/**
 * Who is in a workspace, what each of them can do, when they arrived, and one
 * control per row, under a group for the invitations that have not been taken up.
 *
 * **This is the Block a reader visits to change one thing and leave, which is why
 * it is a Block and not a page.** A settings surface is where a design system's
 * care is most visible and least appreciated. Nothing here is impressive. The
 * reader came to demote one colleague, they find the row, they change it, they
 * leave, and they never learn that the Block was good. They will learn it
 * immediately if one control is in a different place from the one above it, if a
 * row moves when they type, or if a word on the page is in a language they do
 * not read. So the three decisions below are all about a page that must not
 * change under the reader, and none of them is about how the page looks.
 *
 * **A members list is rows or a table, and the caller chooses rather than the
 * count.** Below the count at which a workspace stops being a list of people a
 * reader knows, a portrait and a name and a role on one line is easier to read
 * than four columns. Above it, the same data has to be compared across rows, and
 * a reader comparing a role down a column against another role is doing the job
 * a table exists for. So `columns` is the switch, the type is a closed set of
 * three cells, and the Block derives which arrangement to draw rather than being
 * told twice. The cost is that the two arrangements are not one tree: a caller
 * that switches at render time gets both in the accessibility tree, which is
 * correct, because they asked for both.
 *
 * **A table has to have a name column, and the Block refuses one that does
 * not.** This is the one requirement inside a type whose members are all
 * optional, and it is there because a table of people with no row header is the
 * arrangement a screen reader cannot use at all: the reader asks the table for a
 * row, gets nothing to attach the answers to, and is left holding twenty cells of
 * role names with no idea whose any of them are. A name column is not a default
 * because the name is also the identity the initials and the self mark hang off,
 * and a table that drew the portrait and the role without the person is a table
 * about a job title. The row's own controls get a column with nothing above it,
 * because a heading over a column of buttons would be naming the buttons rather
 * than the data, and every control in it is the caller's and carries its own
 * name.
 *
 * **`isSelf` marks the reader's own row, and the marking is what stops the Block
 * drawing a role control on it.** This is the load-bearing decision in the whole
 * Block and it is worth the paragraph. A settings surface that lets a reader
 * remove themselves without saying so is a trap: the control is in the same place
 * as every other row's, it looks the same, and the consequence is a workspace the
 * reader is no longer in. A surface that lets a reader change their own role is
 * worse, because the consequence is a workspace with nobody left who can undo it.
 * A self-service role editor is how a team loses its last owner, and it loses it
 * on the settings page, in front of a reader who believed the page. So the flag
 * is a prop the caller passes, and when it is passed the row states the role as
 * words and offers no control, and the row's own `actions` still render because
 * what a reader may do about their own membership is the caller's decision and
 * the Block is not the party that should have an opinion about it. The cost is
 * stated rather than hidden: a workspace of one has no row to change, which is
 * why every row being self is a thrown diagnostic rather than a quiet page.
 *
 * **An invitation that has expired is dimmed, and not deleted.** The signal is
 * the presence of `expiresLabel`, because the Block holds no clock and a design
 * system that guessed would be guessing about somebody else's deadline. The
 * reason for keeping the row is the reason `careers-01` gives for a closed role:
 * a reader who sent an invitation and finds it gone learns nothing at all,
 * because the absence is indistinguishable from a fault, from a list that failed
 * to load, and from a product that quietly discards invitations. A list that
 * silently shrinks is a list a reader stops trusting, and a members surface is
 * the last place to spend that trust: the reader's next question is usually
 * about somebody else's access. So the row stays, it is dimmed, and the caller's
 * words say what happened. The Block refuses to invent those words, which is why
 * their absence leaves a row that is not dimmed rather than a row that is dimmed
 * with nothing to read.
 *
 * **A role is a machine value with a sentence beside it, and the sentence is a
 * function.** `member.role` is the value, `roleLabel` is the words, and the
 * separation is what `Status` argues for a dot and `Integration01` argues for a
 * connection state: a design system that knows what a role is called is deciding
 * for four products whose permission models share nothing but the word. The
 * function rather than a record of strings because the honest rendering is
 * usually longer than a select trigger can show, so the caller needs to say more
 * than one string per option, and because one option may need a qualifier the
 * others do not.
 *
 * **The Block holds no role state, so a failed change is the caller's to show.**
 * The select is uncontrolled, the value comes from `member.role`, and
 * `onRoleChange` is a request. That is the arrangement a server action wants and
 * it is the arrangement where the truth is visible: when the request fails the
 * caller re-renders with the old value and the select is where the reader left
 * it, which is a control that told the truth. A Block that kept the new value
 * and rolled it back on a timer would show a reader a role that was not theirs
 * for as long as the rollback took, and a reader who acted on it would be acting
 * on a fiction.
 *
 * **`joined` and `sentAt` are moments, printed exactly as passed, and the
 * honest reading is a Component the caller composes.** The argument is the one
 * `compliance-01` makes for a review date and `member-list-01` makes for a
 * last-seen: a Block that formatted the moment would be choosing a locale, a
 * calendar and a granularity on a colleague's behalf, and would put `Intl` into
 * every consumer's bundle for a rendering Prism has no stake in. So the value is
 * printed as given, `joinedLabel` is offered for the caller who already has a
 * formatter, and a caller who wants "three months ago" composes `relative-time`
 * beside this Block. The cost is stated rather than hidden: a caller who passes a
 * raw timestamp into a row that has no `joinedLabel` gets a raw timestamp beside
 * a colleague's name, which is honest and rarely what was wanted.
 *
 * **A row's role control is named by the person whose role it changes, and the
 * label is visually hidden because the name is already on screen.** In the rows
 * arrangement the name is beside the control; in the table arrangement it is the
 * row header. Either way it is on the page, so the visually hidden label adds
 * nothing a reader sees and a great deal to a screen reader, which would
 * otherwise meet twenty comboboxes with no idea which person any of them belongs
 * to. Naming the control by the role instead was the alternative and it fails the
 * WCAG rule that a visible label must be contained in the accessible name, and it
 * would leave a reader asking which row.
 *
 * **It is a client Component, and the directive is unconditional.** The rule this
 * follows is the one `member-list-01` states in full: a surface that attaches a
 * handler is a client Component, and the directive is on the module rather than
 * in a leaf so that a consumer composing a server page gets the boundary in one
 * place they can see. The cost is that with `onRoleChange` omitted the whole
 * module is still in the client graph, where the static arrangement would have
 * shipped no JavaScript at all; the price was judged worth paying for one
 * boundary rather than two arrangements of the same surface.
 */
export function SettingsMembers01({
  eyebrow,
  title,
  description,
  members,
  invitations,
  pendingTitle,
  inviteLabel,
  roleOptions,
  roleLabel,
  onRoleChange,
  empty,
  columns,
  headingLevel = 'h2',
  className,
}: SettingsMembers01Props) {
  // The handle a table below takes its name from; see the note on the table.
  const headingId = useId()
  const props = {
    members,
    invitations,
    roleOptions,
    roleLabel,
    onRoleChange,
    pendingTitle,
    columns,
  }
  assertProps(props)

  // The group holding the pending invitations is a group inside the section, so
  // its title is one level below the section's own and travels with it.
  const GroupTitle = childLevel(headingLevel)
  const base = useId()
  const asTable = columns !== undefined
  // A row's own controls get a column in the table arrangement, with no heading
  // over it, for the reason `pricing-compare-01` leaves its corner empty: a
  // heading would name a column of controls, which is not what the column is, and
  // the controls are the caller's so each one carries its own accessible name.
  const hasActions = members.some((member) => member.actions !== undefined)
  // A role control needs somewhere to move a member to and somewhere to report
  // the move, and it is withheld from the row the reader is on. See the Block
  // JSDoc for why that last part is a decision rather than an omission.
  const canChangeRole = onRoleChange !== undefined && roleOptions !== undefined
  const optionLabel = (option: SettingsMembersRole): string =>
    roleLabel === undefined ? option.label : roleLabel(option)

  const renderRoleControl = (member: SettingsMembersMember) => {
    if (!canChangeRole || roleOptions === undefined) return null
    if (member.isSelf === true) return null

    const controlId = `${base}-${member.id}-role`
    return (
      <Field className="min-w-40" data-slot="settings-members-role">
        <FieldLabel htmlFor={controlId} className="sr-only">
          {member.name}
        </FieldLabel>
        <Select
          defaultValue={member.role}
          onValueChange={(value) => onRoleChange?.(member.id, value ?? '')}
          items={Object.fromEntries(roleOptions.map((option) => [option.id, optionLabel(option)]))}
        >
          <SelectTrigger id={controlId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {optionLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    )
  }

  const renderRoleWords = (member: SettingsMembersMember) => {
    const control = renderRoleControl(member)
    if (control !== null) return control
    return (
      <span data-slot="settings-members-role" className="text-sm">
        {member.roleLabel ?? member.role}
      </span>
    )
  }

  return (
    <Section className={className} data-slot="settings-members">
      <SectionHeading
        as={headingLevel}
        id={headingId}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div className="flex flex-col gap-10">
        <div data-slot="settings-members-panel" className="flex flex-col gap-4">
          {inviteLabel === undefined ? null : (
            <div data-slot="settings-members-invite" className="flex justify-end">
              {inviteLabel}
            </div>
          )}

          {members.length === 0 ? (
            <p
              data-slot="settings-members-empty"
              className="text-muted-foreground text-pretty text-sm"
            >
              {empty}
            </p>
          ) : asTable ? (
            <div className="border-border overflow-hidden rounded-xl border">

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
              <Table aria-labelledby={headingId} data-slot="settings-members-table">
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.id}
                        scope="col"
                        className={cn('whitespace-normal', column.className)}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                    {hasActions ? <TableHead scope="col" /> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow
                      key={member.id}
                      data-slot="settings-members-row"
                      data-member={member.id}
                      data-self={member.isSelf === true ? 'true' : undefined}
                    >
                      {columns.map((column) => {
                        if (column.id === 'name') {
                          return (
                            <TableHead
                              key={column.id}
                              scope="row"
                              className={cn(
                                'text-foreground h-auto font-medium whitespace-normal',
                                column.className,
                              )}
                            >
                              <span className="flex items-center gap-3">
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
                                <span className="flex min-w-0 flex-col">
                                  <span>{member.name}</span>
                                  {member.email === undefined ? null : (
                                    <span className="text-muted-foreground text-xs font-normal">
                                      {member.email}
                                    </span>
                                  )}
                                  {member.selfLabel === undefined ? null : (
                                    <span className="text-muted-foreground text-xs font-normal">
                                      {member.selfLabel}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </TableHead>
                          )
                        }

                        if (column.id === 'role') {
                          return (
                            <TableCell
                              key={column.id}
                              className={cn('whitespace-normal', column.className)}
                            >
                              {renderRoleWords(member)}
                            </TableCell>
                          )
                        }

                        return (
                          <TableCell
                            key={column.id}
                            className={cn('whitespace-normal tabular-nums', column.className)}
                          >
                            {member.joined === undefined
                              ? null
                              : member.joinedLabel === undefined
                                ? member.joined
                                : member.joinedLabel(member.joined)}
                          </TableCell>
                        )
                      })}
                      {hasActions ? (
                        <TableCell data-slot="settings-members-actions">
                          {member.actions ?? null}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <ul
              data-slot="settings-members-rows"
              className="border-border flex flex-col border-t"
            >
              {members.map((member) => (
                <li
                  key={member.id}
                  data-slot="settings-members-row"
                  data-member={member.id}
                  data-self={member.isSelf === true ? 'true' : undefined}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3 py-3"
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

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">{member.name}</span>
                    {member.email === undefined ? null : (
                      <span className="text-muted-foreground text-xs">{member.email}</span>
                    )}
                    {member.selfLabel === undefined ? null : (
                      <span className="text-muted-foreground text-xs">{member.selfLabel}</span>
                    )}
                  </span>

                  {renderRoleWords(member)}

                  {member.joined === undefined ? null : (
                    <span
                      data-slot="settings-members-joined"
                      className="text-muted-foreground shrink-0 text-xs tabular-nums"
                    >
                      {member.joinedLabel === undefined
                        ? member.joined
                        : member.joinedLabel(member.joined)}
                    </span>
                  )}

                  {member.actions === undefined ? null : (
                    <span
                      data-slot="settings-members-actions"
                      className="flex shrink-0 items-center gap-1"
                    >
                      {member.actions}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/*
          The pending invitations are their own bounded region rather than a
          fourth column in the members list, for the reason `list-panel` gives: a
          reader looking for a pending invitation is not looking for a member, and
          putting the two in one list is a list whose two halves have opposite
          lifetimes. The title is passed as an element rather than as a string so
          the group is a real heading at `childLevel(headingLevel)` and not a
          label element the outline skips.
        */}
        {(invitations?.length ?? 0) === 0 ? null : (
          <ListPanel
            data-slot="settings-members-invitations"
            scroll={false}
            title={
              <GroupTitle data-slot="settings-members-pending-title" className="text-sm font-semibold">
                {pendingTitle}
              </GroupTitle>
            }
          >
            <ul data-slot="settings-members-invitation-list" className="flex flex-col">
              {invitations?.map((invitation) => (
                <li
                  key={invitation.id}
                  data-slot="settings-members-invitation"
                  data-invitation={invitation.id}
                  data-expired={invitation.expiresLabel === undefined ? undefined : 'true'}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-3 last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">{invitation.email}</span>
                  {invitation.sentAt === undefined ? null : (
                    <span
                      data-slot="settings-members-invitation-sent"
                      className="text-muted-foreground shrink-0 text-xs tabular-nums"
                    >
                      {invitation.sentAt}
                    </span>
                  )}
                  {invitation.expiresLabel === undefined ? null : (
                    <span
                      data-slot="settings-members-invitation-expired"
                      className="text-muted-foreground shrink-0 text-xs"
                    >
                      {invitation.expiresLabel}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </ListPanel>
        )}
      </div>
    </Section>
  )
}

export default SettingsMembers01
