'use client'

import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { LiveRegion } from '../../components/ui/live-region'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One thing that can sign a reader in without a secret, and what is known about it.
 *
 * **A name and two moments and a transport, and none of them is anything this
 * package can verify.** The name is the reader's own, because a passkey is only
 * identifiable by the person who registered it: a fingerprint reader called "the
 * office laptop's Touch ID" is a name a reader can recognise and a fingerprint
 * template id is not. The two moments are whatever the caller already holds, in
 * either of the two forms a caller holds a moment in, and the transport is a string
 * the caller chose.
 *
 * The alternative was a type with a `credentialId`, a `publicKey` and a
 * `signCount`, and that would have been a claim this Block cannot keep: it would
 * have implied that the Block can read a credential, and it cannot, and it must
 * not, because a credential store is the most sensitive thing on the reader's
 * device and a design system is not a place to reach for one.
 */
export type Passkey01Authenticator = {
  /** A stable key for the row, passed back to `onRemove`. */
  id: string
  /**
   * What the reader calls this one, in their own words.
   *
   * Required, and a sentence rather than a noun phrase wherever the reader has one:
   * "the phone in my coat pocket" is a name and "Pixel 8" is a device. A caller whose
   * only record is a product name can pass that, and the cost of doing so is that two
   * rows in a reader's list will be indistinguishable and they will have to guess
   * which one to remove, which is the one thing this screen exists to let them do.
   */
  name: string
  /**
   * When it was registered, in whichever of the two forms the caller already holds
   * it. Drawn exactly as passed when there is no `dateLabel`.
   */
  created?: number | string
  /**
   * When it was last used to sign in, in whichever of the two forms the caller
   * already holds it.
   *
   * The moment a reader actually came looking for is this one. A passkey that has
   * never been used is the row that explains why a sign-in failed on a device the
   * reader expected to work, and drawing nothing beside it would leave the most
   * useful fact on the screen unstated.
   */
  lastUsed?: number | string
  /**
   * The words for either moment, given the moment.
   *
   * A function because the honest reading is a localised sentence, and a number
   * printed raw is a timestamp in the reader's head rather than in their language. It
   * is one function for both moments because a caller that formats them differently
   * is a caller with two formatters to keep in step, and a row that says "3 days ago"
   * beside "2026-01-04" reads as two different systems.
   */
  dateLabel?: (value: number | string) => string
  /**
   * How this authenticator can be used, in the caller's own words.
   *
   * A string and not a union, and the reason is the sentence rather than the token.
   * "This phone" and "the laptop on my desk" are what a reader needs in order to
   * choose which one to remove, and "hybrid" and "nfc" and "internal" are tokens that
   * a caller can pass and that this package will not expand into words of its own.
   */
  transport?: string
  /**
   * The words for a transport, given the transport.
   *
   * For the caller who holds a token and wants a sentence: pass `"internal"` here and
   * this turns it into whatever their product calls the built-in reader. Omit it and
   * the string is drawn exactly as passed, which is right for a caller who already
   * holds a sentence and would be wrong for a caller who did not notice.
   */
  transportLabel?: (transport: string) => string
}

/**
 * What the caller's own ceremony is doing, in the caller's own words.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: a WebAuthn ceremony has more outcomes than any other request in
 * this package, from a user who cancelled the prompt to a reader who has no
 * authenticator at all to a platform that refused to create a credential to a relying
 * party whose identifier is not permitted on this origin, and one sentence cannot be
 * true of them all.
 */
export type Passkey01Status = {
  /**
   * Which of the three the ceremony is in. Read by the Block for one thing only.
   *
   * `registering` marks the outcome region busy, because a ceremony is a prompt the
   * browser puts in front of the reader and everything on the page should hold still
   * while it is there. The other two are the caller's to say, and the reason is the
   * Block's own argument: whether a credential was created is a fact about the
   * platform, and the Block has no way to observe it.
   */
  state: 'idle' | 'registering' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The props a Passkey01 takes. Every string in this Block is one of them.
 *
 * There is no credential vocabulary in this file, and that is the design. A passkey
 * is stored by the platform, bound to an origin and a relying party, and created or
 * used inside a ceremony the browser runs. None of those is a rendering decision, so
 * the Block takes a list of names, a list of moments and two callbacks, and holds
 * nothing else.
 */
export type Passkey01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because a list of sign-in methods with no heading is a list a reader
   * cannot come back to, and this is a screen a reader arrives at in order to answer
   * one question about their own account.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The caller's registered authenticators, in the order a reader should meet them.
   *
   * **These are the caller's rows and this Block cannot see a credential, a store, an
   * origin or a relying party.** A consumer that wants to draw a real passkey screen
   * passes what it already knows about each registered authenticator and nothing
   * else, and the list is a projection rather than a reading. The cost is stated
   * rather than hidden: a consumer whose authenticator list arrives from its own
   * server has to fetch it and pass it in, because a Block that fetched it would be a
   * Block that ships a transport, and a consumer that has no server has a reader who
   * can register but never see what they registered, which is a true and unusual
   * product.
   */
  authenticators: readonly Passkey01Authenticator[]
  /**
   * Called when the reader presses the register control. **This is where the
   * ceremony runs, and the ceremony is not this Block's.**
   *
   * **A design system that called `navigator.credentials` would be choosing three
   * things for every consumer that installed it**, and all three are decisions about
   * a reader's security rather than about how a list is drawn. The first is the
   * origin, because a credential is bound to the origin that created it and one that
   * is created against the wrong origin is unusable on the site that needs it. The
   * second is the user-verification flag, which is the difference between a ceremony
   * that asks for a fingerprint or a face and one that only proves the presence of a
   * device, and a product whose risk assessment says the weaker flag is right is a
   * product that must be able to say so. The third is the relying party's identifier,
   * which is a durable name for this deployment, and a product that deploys in two
   * regions with two identifiers is a product this Block would have to guess about.
   *
   * So the callback is the whole of the mechanism and the Block is the whole of the
   * list, the labels and the states. What the reader sees is identical either way and
   * what the caller's server accepts is not: the ceremony is theirs, and so is every
   * decision it involves.
   */
  onRegister?: () => void
  /**
   * The words on the register control.
   *
   * Required whenever `onRegister` is set, and a sentence for the reason every other
   * control name in this package is: "add" says what the control is and "register a
   * passkey on this device" says what pressing it does, and the second is the one a
   * voice control user has to be able to say out loud. It is also the one control on
   * this screen that starts a prompt in the platform's own chrome, outside this
   * page, which is worth naming in the words: a reader who presses a button labelled
   * "Add" and is then shown a system dialog has been told the wrong thing about where
   * they are.
   */
  registerLabel?: string
  /**
   * Whether the reader's own ceremony is running.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `registering` is the control and `status.state` is the outcome. Passing both is
   * ordinary: a caller whose ceremony is a promise sets the flag from it and sets the
   * status from the result.
   */
  registering?: boolean
  /**
   * Called with the authenticator's id when the reader removes one.
   *
   * **Offered on every row, including the one the reader is signed in through, and
   * that is the decision most likely to be got wrong.** Every instinct on a security
   * surface is to withhold the dangerous control from the row the reader is sitting
   * on, and the instinct is wrong for a reason that has nothing to do with the
   * interface: a reader who wants to remove the credential they are using is a reader
   * who will find another way, and what they find instead is a credential they cannot
   * see, on a device they are not holding. So the control is drawn on every row and
   * what the Block does not do is confirm: a bare click that destroys a credential is
   * not a confirmation, and a product that wants one composes its own dialog and
   * passes the control through, or calls `onRemove` from its own.
   */
  onRemove?: (id: string) => void
  /**
   * The words on a remove control, given the authenticator.
   *
   * Required whenever `onRemove` is set, and a function for two reasons. A column of
   * controls all announced as "remove" is a column a screen reader user cannot act
   * on, because the sentence says nothing about which of them. And the honest
   * sentence names the thing: removing the credential on a phone and removing the one
   * on a laptop are different consequences, and the reader is the only one who knows
   * which they mean.
   */
  removeLabel?: (authenticator: { id: string; name: string }) => string
  /**
   * What the caller's own ceremony is doing, drawn in a live region and announced.
   *
   * See the Block's JSDoc for why there is no registered sentence anywhere in this
   * file and what the honest failure of a ceremony looks like.
   */
  status?: Passkey01Status
  /**
   * What the surface shows when there are none.
   *
   * **Required, and the reason is the one every list in this package states: a reader
   * with no passkeys and a caller's server that failed to answer are not the same
   * page.** The first is the state most readers reach and it is safe; the second is
   * the state in which a reader may have two registered authenticators and be about to
   * remove both because the list looks empty. So the sentence is the caller's, and a
   * caller whose server can fail has a state of its own to pass for it.
   */
  empty: ReactNode
  /** Heading level for the section heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * Whether a caller passed a word that is not there.
 *
 * Read as `string | undefined` rather than as the declared type, because the check
 * is about the value that turned up rather than about what the type promised. A
 * JavaScript caller and a value out of a session store both arrive with the type's
 * guarantee already gone, and the diagnostic below is the last place that can still
 * say what was wrong.
 */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on the screen where a
 * reader is about to remove the credential that lets them in.
 *
 * Six shapes. A row with no name is a list in which every row is anonymous, on the
 * one screen whose whole purpose is telling a reader apart from their other devices.
 * A remove control with one name across the list is a list a screen reader user
 * cannot act on. A register control with no words is a button that starts a system
 * dialog the reader was not told about. A handler with no control and a control with
 * no handler are the same mistake in opposite directions, and both leave a caller
 * believing they have something the surface does not draw. A `dateLabel` with no
 * moment and a `transportLabel` with no transport compose a function and then
 * discard it.
 */
function assertPasskey(input: {
  authenticators: readonly Passkey01Authenticator[]
  onRegister: (() => void) | undefined
  registerLabel: string | undefined
  onRemove: ((id: string) => void) | undefined
  removeLabel: ((authenticator: { id: string; name: string }) => string) | undefined
}): void {
  const { authenticators, onRegister, registerLabel, onRemove, removeLabel } = input

  for (const authenticator of authenticators) {
    if (blank(authenticator.name)) {
      throw new Error(
        `Passkey01: the authenticator ${JSON.stringify(authenticator.id)} declares no name, so the row ` +
          'would be a date and a set of controls with nothing to say which credential it belongs to, on the ' +
          'one screen whose purpose is telling a reader apart from their other devices. Pass the words the ' +
          'reader gave it.',
      )
    }
    if (
      authenticator.dateLabel !== undefined &&
      authenticator.created === undefined &&
      authenticator.lastUsed === undefined
    ) {
      throw new Error(
        `Passkey01: the authenticator ${JSON.stringify(authenticator.name)} passes a dateLabel and no moment ` +
          'to format, so the sentence would be composed and then discarded. Pass created or lastUsed, or drop ' +
          'the function.',
      )
    }
    if (authenticator.transportLabel !== undefined && authenticator.transport === undefined) {
      throw new Error(
        `Passkey01: the authenticator ${JSON.stringify(authenticator.name)} passes a transportLabel and no ` +
          'transport, so the sentence would be composed and then discarded. Pass the string your platform ' +
          'reports, or drop the function.',
      )
    }
  }

  if (onRegister === undefined) {
    if (registerLabel !== undefined) {
      throw new Error(
        'Passkey01: a registerLabel was passed with no onRegister, so the sentence would be composed and ' +
          'then discarded, which is a caller who believes they have named a control on a screen that has none. ' +
          'Pass the handler, or drop the words.',
      )
    }
  } else if (blank(registerLabel)) {
    throw new Error(
      'Passkey01: onRegister was passed with no registerLabel, so the control that starts a ceremony in the ' +
        'platform chrome would be a button announced as a button, and a reader who presses a nameless button ' +
        'and is then shown a system dialog has been told the wrong thing about where they are. Pass the ' +
        'sentence.',
    )
  }

  if (onRemove === undefined) {
    if (removeLabel !== undefined) {
      throw new Error(
        'Passkey01: a removeLabel was passed with no onRemove, so the sentences would be composed and then ' +
          'discarded, which is a caller who believes they have named the controls on a surface that has none. ' +
          'Pass the handler, or drop the function.',
      )
    }
    return
  }

  if (removeLabel === undefined) {
    throw new Error(
      'Passkey01: onRemove was passed with no removeLabel, so every remove control would be announced by the ' +
        'same word and a reader would be told which credential to destroy by nothing at all. Pass the function ' +
        'that names the authenticator.',
    )
  }
}

/**
 * The authenticators a reader has registered, and the control that adds one.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a security settings page: a list of the ways in, a control to
 * add another, and a control beside each row to take one away, and its purpose is to
 * let a shopper see which second factor is protecting their card. Prism's products
 * observe a pipeline, capture a market, watch an estate and run agents, and a machine
 * acting on behalf of a person is the whole subject, so this is the list of the
 * credentials a machine may act under on this reader's behalf. The composition is the
 * settings page's and is unchanged: the list, the add control, the remove control on
 * each row, the empty state. What is different is what the list is made of, and that
 * difference is the whole of this Block's argument.
 *
 * **It opens no credential store, it calls no WebAuthn API, and it owns no ceremony.**
 * Those three sentences are the Block. A passkey is a private key the platform holds
 * and this repository never sees, bound to an origin and to a relying party, and it
 * is created or used inside a ceremony the browser runs: a prompt in the platform's
 * own chrome, outside this page, with the reader's biometric or their device
 * passphrase behind it. A Block that reached for that would be choosing three things
 * for every consumer that installed it, and all three are decisions about a reader's
 * security rather than about how a list is drawn. The origin, because a credential
 * is bound to the origin that created it and one created against the wrong origin is
 * unusable on the site that needs it. The user-verification flag, which is the
 * difference between a ceremony that asks for a fingerprint and one that only proves
 * the presence of a device, and a product whose risk assessment says the weaker flag
 * is right must be able to say so. And the relying party's identifier, a durable name
 * for this deployment, which a product deploying in two regions has two of. So
 * `onRegister` is where the ceremony runs, and this file holds the list, the labels
 * and the states and nothing else. What the reader sees is identical either way. What
 * the caller's server accepts afterwards is entirely the caller's, and a reader who
 * registered a passkey the wrong way finds out at the next sign-in.
 *
 * **What it authorises.** Nothing on its own, and that is worth saying plainly on the
 * screen's own documentation. A press of the register control is a request that the
 * caller's code run a ceremony; whether a credential now exists, on which origin,
 * bound to which relying party, is a fact about the platform that this Block has no
 * way to observe. The remove control is the mirror: it hands over an id and the
 * caller decides what destroying that credential means, including whether the reader
 * has another way in first.
 *
 * **What it deliberately does not do.** It will not call `navigator.credentials`. It
 * will not hold, cache, serialise or request a credential id, a public key or a sign
 * count. And it will not confirm before removing. Each of those is the consumer's,
 * and each is a security decision rather than a rendering one, so a Block that made
 * any of them would be something other than a composition. A Block that held a
 * credential would be putting the most sensitive thing on a reader's device into a
 * component library's memory and into the bundle of every product that installed it.
 * A Block that confirmed would be a dialog this package designed, and a confirmation
 * is a product's decision about what a reader is agreeing to and what the escape is.
 * So the control is drawn on every row, including the row the reader is signed in
 * through, and the confirmation is the caller's, composed from their own surface.
 *
 * **The remove control is offered on the row the reader is in, and that is the
 * decision most likely to be got wrong.** Withholding it is the instinct, and the
 * instinct is wrong for a reason that has nothing to do with the interface: a reader
 * who wants to remove the credential they are using is a reader who will find another
 * way, and what they find is a credential they cannot see on a device they are not
 * holding. So the control is on every row. What the Block does not do is confirm,
 * because a bare click that destroys a credential is not a confirmation.
 *
 * **The honest failure state is the caller's sentence, and the reason is that a
 * ceremony has more outcomes than one sentence can be true of.** It can fail because
 * the reader dismissed the platform's prompt, because the reader has no authenticator
 * at all, because the platform refused to create a credential, because the relying
 * party's identifier is not permitted on this origin, because the origin is not a
 * secure context, because the reader's device is out of room, because a third party
 * on the reader's device answered instead of them, or because the caller's own server
 * refused the public key after the platform had already created it. Those are nine
 * outcomes and the difference between a reader who cancelled and a reader whose
 * platform is not permitted is the difference between "try again" and a support
 * ticket, and only the caller knows which one just happened. So `status` is a prop,
 * this file holds no `registered` flag and no `removed` flag, and the words are the
 * product's. What the Block does about a failure is the two rendering decisions: the
 * register control is disabled while the caller says the ceremony is running, because
 * a second press starts a second prompt the reader did not ask for, and the outcome is
 * drawn in a live region, `assertive` for the refusal, because a ceremony that fails
 * silently looks to a reader exactly like a ceremony that is still thinking.
 *
 * **The row's name is not a heading, and the reason is that a row is not a section of
 * the page.** A reader who navigates this screen by heading wants one place to land:
 * the list. A list of eight devices put in the outline is eight entries that say
 * nothing the section's own heading has not said, and a reader tabbing through
 * headings hears eight of them. So the name is a `span` at the row's own weight, which
 * is the arrangement `settings-security-01` already uses for the methods beside it,
 * and the two Blocks are the same decision made twice.
 *
 * **It is a client Component, and the directive is present because the handlers
 * attach, not because this screen holds state.** A Block with neither `onRegister`
 * nor `onRemove` renders entirely static output and could be a server Component, and
 * the cost of that is that the same module is one thing for a caller who only lists
 * and another for a caller who removes, so a consumer who never removes a credential
 * still pays for the client boundary. That is the price of shipping one Block for both
 * halves, and the alternative was two Items where one of them would be a list with no
 * controls in it, which is not a thing a credential screen should be without.
 */
export function Passkey01({
  eyebrow,
  title,
  description,
  authenticators,
  onRegister,
  registerLabel,
  registering = false,
  onRemove,
  removeLabel,
  status,
  empty,
  headingLevel = 'h2',
  className,
}: Passkey01Props) {
  assertPasskey({ authenticators, onRegister, registerLabel, onRemove, removeLabel })

  const none = authenticators.length === 0
  const busy = registering || status?.state === 'registering'

  return (
    <Section data-slot="passkey-01" className={cn(className)}>
      <div data-slot="passkey-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <Card data-slot="passkey-01-card" className="max-w-measure gap-0 px-6">
          {/*
            The register control is above the list rather than below it, and the
            reason is what the screen is for. A reader arrives here with one of two
            intentions: to add a credential, which is the intention the control exists
            for, or to work out which of the credentials they have is the one they
            expected to be signed in with. The first is the one that cannot proceed
            without the control, and on a list of one row the control below the row
            reads as a footnote on it.
          */}
          {onRegister === undefined ? null : (
            <div data-slot="passkey-01-register-row">
              <Button
                data-slot="passkey-01-register"
                type="button"
                disabled={busy}
                onClick={onRegister}
              >
                {registerLabel}
              </Button>
            </div>
          )}

          {/*
            The list, or the caller's sentence for there being none. A `ul` rather than
            a set of paragraphs, because the rows are the count a reader wants to know
            and a list is what tells assistive technology how many there are. The rule
            between rows is a border rather than a gap alone, so the boundary survives
            at any zoom level where the gap stops being visible.
          */}
          {none ? (
            <p data-slot="passkey-01-empty" className="text-muted-foreground text-pretty text-sm">
              {empty}
            </p>
          ) : (
            <ul data-slot="passkey-01-rows" className="border-border flex flex-col border-t">
              {authenticators.map((authenticator) => (
                <li
                  key={authenticator.id}
                  data-slot="passkey-01-row"
                  data-authenticator={authenticator.id}
                  className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-3 last:border-b-0"
                >
                  {/*
                    The name and the three facts about it, in the order a reader
                    checks them: what it is, when it was added, when it was last used,
                    and how it can be used. The moments are drawn through the caller's
                    own function when there is one and exactly as passed when there is
                    not, because a Block that formatted a moment would be choosing a
                    locale and a granularity on a reader's behalf, and on the screen
                    where a reader is working out which device signed them in last
                    that choice is the answer they came for.
                  */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      data-slot="passkey-01-name"
                      className="text-base font-semibold break-words"
                    >
                      {authenticator.name}
                    </span>
                    <span
                      data-slot="passkey-01-detail"
                      className="text-muted-foreground flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs"
                    >
                      {authenticator.created === undefined ? null : (
                        <span data-slot="passkey-01-created">
                          {authenticator.dateLabel === undefined
                            ? authenticator.created
                            : authenticator.dateLabel(authenticator.created)}
                        </span>
                      )}
                      {authenticator.lastUsed === undefined ? null : (
                        <span data-slot="passkey-01-last-used">
                          {authenticator.dateLabel === undefined
                            ? authenticator.lastUsed
                            : authenticator.dateLabel(authenticator.lastUsed)}
                        </span>
                      )}
                      {authenticator.transport === undefined ? null : (
                        <span data-slot="passkey-01-transport">
                          {authenticator.transportLabel === undefined
                            ? authenticator.transport
                            : authenticator.transportLabel(authenticator.transport)}
                        </span>
                      )}
                    </span>
                  </div>

                  {/*
                    The remove control, on every row including the reader's own, for
                    the reason the Block's JSDoc gives at length: withholding it from
                    the row they are in does not remove the wish, it removes the honest
                    route to it, and what is left behind is a credential they cannot
                    see and a support ticket. The words name the authenticator, and
                    the run above has already refused to draw the control without a
                    function that does.
                  */}
                  {onRemove === undefined || removeLabel === undefined ? null : (
                    <Button
                      data-slot="passkey-01-remove"
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onRemove(authenticator.id)}
                      className="shrink-0"
                    >
                      {removeLabel({ id: authenticator.id, name: authenticator.name })}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/*
            The outcome, and it renders nothing while there is no message.
            `LiveRegion` draws no element at all for an empty child, which is why a
            list in its resting state carries no live region rather than an empty one
            announcing every unrelated change of its ancestors. `busy` follows the
            caller's own ceremony, because a ceremony is a prompt in the platform's
            chrome and everything in this page should hold still while it is there.
          */}
          <LiveRegion
            data-slot="passkey-01-status"
            politeness={status?.state === 'error' ? 'assertive' : 'polite'}
            busy={busy}
            className={cn(
              'text-sm',
              status?.state === 'error' ? 'text-destructive font-medium' : 'text-muted-foreground',
            )}
          >
            {status?.message}
          </LiveRegion>
        </Card>
      </div>
    </Section>
  )
}

export default Passkey01
