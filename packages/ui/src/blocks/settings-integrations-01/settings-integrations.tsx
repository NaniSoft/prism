'use client'

import { type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import {
  Section,
  SectionHeading,
  childLevel,
  type HeadingLevel,
} from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * Where a connection stands, and the four answers that are true.
 *
 * `needs-attention` is the member of this set that a two-state design system does
 * not have, and the Block's JSDoc argues for it at length: an integration that is
 * connected and wrong is the common case, not the exception, and a system offering
 * only connected and available leaves a consumer with exactly one way to render
 * it, which is to draw it as available. That is a lie the reader acts on.
 */
export type SettingsIntegrationsState =
  | 'connected'
  | 'available'
  | 'needs-attention'
  | 'unavailable'

/**
 * The tone each state is drawn in, from the semantic contract and no other.
 *
 * Mapped here rather than passed, for the reason `Status` gives for refusing to
 * pick a tone itself: the tone is a judgement about urgency and only the caller
 * can make it, but the mapping from a state to a tone is a judgement this Block
 * can make once and every consumer would otherwise make the same way. So the
 * mapping is stated and the words are not.
 *
 * `needs-attention` is `warning` and not `destructive`, and the reason is the one
 * `member-list-01` gives for a colleague who is away: a token that expired last
 * Tuesday is work waiting to be done, not a fault, and `destructive` on a settings
 * page is the tone for something the reader broke. A page of red integrations is a
 * page of alarms that means nothing, and the reader who sees it learns to skip the
 * row. `unavailable` is `neutral` rather than `destructive` for the same reason
 * from the other side: a capability that is not offered in this region is not in
 * dispute, and drawing it as though it were turns a commercial fact into an error.
 */
const STATE_TONE: Record<SettingsIntegrationsState, StatusTone> = {
  connected: 'success',
  available: 'info',
  'needs-attention': 'warning',
  unavailable: 'neutral',
}

/**
 * One system a workspace connects to, and everything a reader needs to decide
 * what to do about it.
 *
 * The mark is a slot and Prism ships no vendor marks, for the two reasons
 * `integration-01` states in full: a vendor's mark is a licensed asset with terms
 * attached, and a set of marks in a design system is a set of marks that will be
 * wrong within a year.
 */
export type SettingsIntegrationsItem = {
  /** A stable key for the row, passed back to `onConnect`, and carried as `data-integration`. */
  id: string
  /** The system's own name, as the system spells it. */
  name: string
  /**
   * One line about what connecting it gets a reader.
   *
   * A capability and not a description. "Reads process values from every site" is
   * a fact a reader can check by trying it; "a powerful integration for your team"
   * is a sentence about the product, and one of those on every row is a list of
   * sentences.
   */
  capability: string
  /** Where the connection stands. Required, because a row with no state cannot be acted on. */
  state: SettingsIntegrationsState
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is given, which is always, and a thrown diagnostic
   * rather than a silent absence, for the reason `Status` states in full: the
   * tone is a colour and the words are the information, and a row of states with
   * no words is a row of coloured dots that a reader who cannot separate the tones
   * cannot read and a screen reader cannot read at all. A product whose vocabulary
   * says "Reconnect" where another's says "Needs attention" cannot be given one
   * word by a design system.
   */
  stateLabel?: string
  /**
   * The system's own mark, composed by the caller.
   *
   * A slot, and one that draws no frame of its own. See the Block's JSDoc for why
   * that is a decision rather than an omission: a mark in this position is very
   * often a `PackSwatch`, which is a fully rounded element carrying a `data-pack`
   * boundary, and a frame with a radius utility around it pins the swatch inside a
   * second shape.
   */
  mark?: ReactNode
  /**
   * When the connection was made, in whichever of the two forms the caller already
   * has it.
   *
   * A moment rather than a reading, and the reading is `connectedSinceLabel`. The
   * Block prints the value exactly as passed when no formatter is given, which is
   * the arrangement `compliance-01` and `member-list-01` both take and the same
   * cost applies to.
   */
  connectedSince?: number | string
  /**
   * The words for the connection date, given the moment.
   *
   * A function because the honest reading is a localised sentence, which is what
   * `relative-time` hands back and what no Block in this package prints on its own.
   */
  connectedSinceLabel?: (value: number | string) => string
  /**
   * Where the connection is managed, which is the destination a reader wants
   * before they want to reconnect anything.
   */
  href?: string
  /**
   * The words on that link. Required whenever `href` is set, and a thrown
   * diagnostic rather than a silent absence: a link announced by its address is a
   * link no reader can tell from its neighbour.
   */
  hrefLabel?: string
  /**
   * The caller's own control for this row, in place of the Block's connect
   * control.
   *
   * A slot and not a variant, because the four states want four different
   * controls and a connected integration usually needs a disconnect or a fix
   * rather than a connect. See the Block's JSDoc for which states draw the
   * Block's own control and which draw this.
   */
  action?: ReactNode
  /**
   * The group this integration belongs in, for `groupBy="category"`. Omit it and
   * the integration is not grouped, which is the same state as passing
   * `groupBy="none"`.
   */
  category?: string
}

/**
 * One named group of integrations, in the order the caller first named them.
 *
 * A group with no `name` is the one that holds the integrations the caller did
 * not put anywhere, and it is rendered last with no title over it, because a row
 * that quietly disappears from a list is worse than an untitled one.
 */
type SettingsIntegrationsGroup = { id: string; name?: string; items: SettingsIntegrationsItem[] }

/**
 * The caller's integrations, gathered into the groups they named.
 *
 * First appearance sets the order rather than an alphabet, on the same argument
 * every list in this package takes: order is a claim about what matters first,
 * and an alphabetically sorted set of categories is a claim this Block would be
 * making for the caller about a taxonomy the Block has never seen. A category
 * whose name was passed by two rows that are not adjacent is one group, because
 * grouping by name is the only thing that can be right.
 */
function groupOf(integrations: readonly SettingsIntegrationsItem[]): SettingsIntegrationsGroup[] {
  const groups: SettingsIntegrationsGroup[] = []
  const byName = new Map<string, SettingsIntegrationsGroup>()

  for (const integration of integrations) {
    if (integration.category === undefined) continue
    const existing = byName.get(integration.category)
    if (existing !== undefined) {
      existing.items.push(integration)
      continue
    }
    const group: SettingsIntegrationsGroup = {
      id: integration.category,
      name: integration.category,
      items: [integration],
    }
    byName.set(integration.category, group)
    groups.push(group)
  }

  const loose = integrations.filter((integration) => integration.category === undefined)
  if (loose.length > 0) {
    groups.push({ id: 'ungrouped', items: loose })
  }

  return groups
}

/**
 * The props a SettingsIntegrations01 takes.
 *
 * Every string is a prop and the Block ships none. There is no integration list,
 * no vendor name, no capability, no state word, no mark, no connect sentence and
 * not one of the four sentences a connection surface is most tempted to ship.
 */
export type SettingsIntegrations01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /** The section title. Required, because a list of connections with no heading is a fragment. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /** The integrations, in the order a reader should meet them. Order is the caller's. */
  integrations: readonly SettingsIntegrationsItem[]
  /**
   * Called when a reader presses the connect control on an available integration.
   *
   * A request and not a mutation, for the reason `settings-notifications-01` and
   * `settings-members-01` both take: the row's state comes from the data, so a
   * control that moved and rolled back would show a reader a connection the
   * product did not make.
   */
  onConnect?: (id: string) => void
  /**
   * The words on the connect control, given the integration.
   *
   * Required whenever `onConnect` is set, and a function because the honest
   * sentence usually names the system and sometimes qualifies the action, so a
   * record of one string per state would be the wrong shape. The sentence also
   * has to be distinct per row, because a column of four controls all announced
   * as "Connect" is a column a screen reader user cannot act on.
   */
  connectLabel?: (integration: { id: string; name: string }) => string
  /**
   * Whether the integrations are gathered into the groups they named.
   *
   * @defaultValue 'none'
   */
  groupBy?: 'none' | 'category'
  /**
   * What the surface shows when there are no integrations.
   *
   * Required, and the reason is the one `settings-members-01` gives: a workspace
   * that has connected to nothing and a workspace whose connections failed to load
   * are not the same page, and a Block that chose between them would be choosing
   * between a true sentence and a false one.
   */
  empty: ReactNode
  /** Heading level for the section title. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, so that a connections surface never renders a control or a word
 * it cannot justify.
 *
 * A state with no words, a link with no name, a connect handler with no sentence
 * on the control, and a sentence on a control whose handler is not there. Each is
 * a caller's mistake rather than a request.
 */
function assertProps(props: {
  integrations: readonly SettingsIntegrationsItem[]
  onConnect?: (id: string) => void
  connectLabel?: (integration: { id: string; name: string }) => string
}): void {
  const { integrations, onConnect, connectLabel } = props

  if (onConnect !== undefined && connectLabel === undefined) {
    throw new Error(
      'SettingsIntegrations01: onConnect was passed with no connectLabel, so every control would be announced ' +
        'by the same word and a reader would be told which system to press by nothing. Pass the function that ' +
        'names the system.',
    )
  }

  if (onConnect === undefined && connectLabel !== undefined) {
    throw new Error(
      'SettingsIntegrations01: connectLabel was passed with no onConnect, so the sentences would be composed ' +
        'and then discarded, which is a caller who believes they have named the controls on a surface that has ' +
        'none.',
    )
  }

  for (const integration of integrations) {
    if (integration.stateLabel === undefined || integration.stateLabel.trim() === '') {
      throw new Error(
        `SettingsIntegrations01: the integration ${JSON.stringify(integration.name)} declares a state and no ` +
          'words for it, so the row would be a coloured dot with nothing to read beside it. Pass stateLabel in ' +
          'the vocabulary your product uses, which is not this Block to choose.',
      )
    }

    if (integration.href !== undefined && (integration.hrefLabel === undefined || integration.hrefLabel.trim() === '')) {
      throw new Error(
        `SettingsIntegrations01: the integration ${JSON.stringify(integration.name)} carries an href with no ` +
          'hrefLabel, so the link would be announced by its address, which is punctuation rather than a name.',
      )
    }
  }
}

/**
 * The systems a workspace connects to, one row each, with the state that tells a
 * reader whether anything needs doing and one control that matches that state.
 *
 * **`needs-attention` is the state that makes this Block worth shipping, and the
 * argument is that a two-state design system cannot help a consumer tell the
 * truth.** The common case in every product with integrations is a connection
 * that was made, and has since stopped being right: the token expired, the scope
 * was narrowed, the account was renamed, the vendor changed its API and the
 * integration kept working until it did not. That is not an edge case and it is not
 * a fault, it is the ordinary life of a connection. A design system offering only
 * connected and available gives a consumer exactly one way to draw it, and the one
 * way on offer is `available`, which says to the reader that nothing is wrong and
 * that they may carry on. The reader acts on that: they do not go and look, and the
 * failure they were one click from finding arrives later, in somebody else's part
 * of the product, with no connection to this page. So the state exists here as a
 * first-class member rather than as a tone somebody applies by hand, and the words
 * beside it are the caller's because "Reconnect", "Needs attention" and "Token
 * expired" are three products' honest answers to the same tone.
 *
 * **The tone for it is `warning` and not `destructive`, and that is a judgement
 * about the reader rather than about the severity.** A token that expired last
 * Tuesday is work waiting to be done, and `destructive` on a settings page is the
 * tone for something the reader broke. A page of red connections is a page of
 * alarms that means nothing, and the reader who sees it learns to stop reading the
 * row, which is the opposite of what a state exists to achieve. `unavailable` is
 * `neutral` for the same reason from the other side: a capability that is not
 * offered in this region is not in dispute, and drawing it as though it were turns
 * a commercial fact into an error.
 *
 * **The Block draws a connect control on an available row and nothing on the
 * other three, and the `action` slot is where the other three put theirs.** A
 * control that cannot work is worse than no control: a connect button on an
 * unavailable row is a promise the product will break, and a connect button on a
 * needs-attention row names the wrong action, because the reader does not want to
 * connect a second time, they want to fix a first one. So the Block offers exactly
 * the control its own state implies and hands the rest to the caller, which is
 * why `action` is a slot and not a `variant` string. The cost is stated rather
 * than hidden: a consumer who wants a uniform control down the whole column draws
 * it in the slot for three rows out of four, and the Block will not pretend the
 * fourth is the same.
 *
 * **The mark slot draws no frame, no surface and no radius, and that is a
 * decision about a specific Component.** A mark in this position is very often a
 * `PackSwatch`, which is a fully rounded element carrying a `data-pack` boundary,
 * and the token build resolves the whole radius scale beneath that boundary: a
 * pack changes the corners of everything under it, which is the point. A frame
 * with a radius utility drawn around the slot would pin the swatch inside a second
 * shape, so six packs in a row would show six different silhouettes and the reader
 * comparing them would be comparing the frame rather than the pack. A tinted
 * background is refused for the same reason one shade lighter: it says the mark is
 * a picture, and a swatch is a preview rather than a picture, and the words beside
 * it are already the identity. A caller who wants a framed logo puts a frame in
 * the slot.
 *
 * **A connected row shows when it was connected rather than a control, because
 * the question a reader has about a working connection is how long it has been
 * working.** The alternative was a row of identical management controls down the
 * whole list, which tells a reader nothing they did not know and pushes the row
 * that needs them further down. The date is printed exactly as passed, with
 * `connectedSinceLabel` offered for the caller who has a formatter, and the honest
 * relative reading is a `relative-time` the caller composes. The cost is the one
 * `compliance-01` states for a review date: a caller who passes a raw timestamp
 * gets a raw timestamp, which is honest and rarely what was wanted.
 *
 * **A grouped list still shows the integrations the caller did not group.** They
 * are drawn last, under no title, and the count is on the list element as
 * `data-ungrouped`, because dropping them is the one simplification that produces
 * the worst support question a component can produce: a reader who counted eleven
 * and found ten.
 *
 * It is a client Component, and the directive is unconditional: a surface that
 * attaches a handler owns the JavaScript that carries it, and the directive is on
 * the module rather than in a leaf so a consumer composing a server page gets the
 * boundary in one place they can see. The cost is that with `onConnect` omitted the
 * module is still in the client graph, which was judged worth one boundary rather
 * than two arrangements of the same surface.
 */
export function SettingsIntegrations01({
  eyebrow,
  title,
  description,
  integrations,
  onConnect,
  connectLabel,
  groupBy = 'none',
  empty,
  headingLevel = 'h2',
  className,
}: SettingsIntegrations01Props) {
  assertProps({ integrations, onConnect, connectLabel })

  // A group is a group inside the section, so its name is one level below the
  // section's own heading. The rows carry no headings of their own: a row's name
  // is a label on a record rather than a section of the page, and eight headings
  // in a list of connections is eight entries for a reader navigating by heading
  // who expected sections.
  const GroupTitle = childLevel(headingLevel)

  if (integrations.length === 0) {
    return (
      <Section className={className} data-slot="settings-integrations">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <p
          data-slot="settings-integrations-empty"
          className="text-muted-foreground text-pretty text-sm"
        >
          {empty}
        </p>
      </Section>
    )
  }

  const groups: SettingsIntegrationsGroup[] =
    groupBy === 'category'
      ? groupOf(integrations)
      : [{ id: 'all', items: [...integrations] }]

  // The one control the Block draws itself, and the one state it draws it on. The
  // other three states hand the row to the caller, for the reason the Block
  // JSDoc gives.
  const connectable = (state: SettingsIntegrationsState) => state === 'available'

  return (
    <Section className={className} data-slot="settings-integrations">
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div
        data-slot="settings-integrations-list"
        data-ungrouped={
          groupBy === 'category' && integrations.some((one) => one.category === undefined)
            ? integrations.filter((one) => one.category === undefined).length
            : undefined
        }
        className={cn('flex flex-col gap-10', className)}
      >
        {groups.map((group) => (
          <section
            key={group.id}
            data-slot="settings-integrations-group"
            data-group={group.name}
            className="flex flex-col gap-4"
          >
            {group.name === undefined ? null : (
              <GroupTitle
                data-slot="settings-integrations-group-title"
                className="border-border text-muted-foreground border-t pt-4 text-sm font-semibold tracking-wide uppercase"
              >
                {group.name}
              </GroupTitle>
            )}

            <ul data-slot="settings-integrations-rows" className="flex flex-col">
              {group.items.map((integration) => (
                <li
                  key={integration.id}
                  data-slot="settings-integrations-row"
                  data-integration={integration.id}
                  data-state={integration.state}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-3 border-b py-4 first:border-t"
                >
                  {integration.mark === undefined ? null : (
                    /*
                      No frame, no surface and no radius around the mark, and the
                      reason is in the Block JSDoc: a `PackSwatch` in this slot is a
                      fully rounded element carrying a `data-pack` boundary, and the
                      token build resolves the radius scale beneath it. A frame here
                      would pin six packs inside six different silhouettes.
                    */
                    <span
                      aria-hidden
                      data-slot="settings-integrations-mark"
                      className="flex shrink-0 items-center"
                    >
                      {integration.mark}
                    </span>
                  )}

                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm font-semibold">{integration.name}</span>
                    <span className="text-muted-foreground text-pretty text-sm">
                      {integration.capability}
                    </span>
                  </span>

                  <Status
                    data-slot="settings-integrations-state"
                    size="sm"
                    tone={STATE_TONE[integration.state]}
                    label={integration.stateLabel}
                    className="shrink-0"
                  />

                  {integration.state === 'connected' &&
                  integration.connectedSince !== undefined ? (
                    <span
                      data-slot="settings-integrations-since"
                      className="text-muted-foreground shrink-0 text-xs tabular-nums"
                    >
                      {integration.connectedSinceLabel === undefined
                        ? integration.connectedSince
                        : integration.connectedSinceLabel(integration.connectedSince)}
                    </span>
                  ) : null}

                  {integration.href === undefined ? null : (
                    <CtaLink
                      data-slot="settings-integrations-href"
                      href={integration.href}
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                    >
                      {integration.hrefLabel}
                    </CtaLink>
                  )}

                  {integration.action === undefined ? null : (
                    <span
                      data-slot="settings-integrations-action"
                      className="flex shrink-0 items-center gap-2"
                    >
                      {integration.action}
                    </span>
                  )}

                  {integration.action === undefined &&
                  connectable(integration.state) &&
                  onConnect !== undefined &&
                  connectLabel !== undefined ? (
                    <Button
                      data-slot="settings-integrations-connect"
                      size="sm"
                      variant="outline"
                      onClick={() => onConnect(integration.id)}
                      className="shrink-0"
                    >
                      {connectLabel({ id: integration.id, name: integration.name })}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  )
}

export default SettingsIntegrations01
