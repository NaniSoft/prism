'use client'

import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * Where the notice sits, and which of the two costs the caller is choosing.
 *
 * **`banner` is the default and `dialog` exists for the case where a notice that
 * covers the page's content is a notice the reader cannot avoid.** Both arms are
 * real and the difference between them is not cosmetic, so neither is refused. What
 * is refused is the idea that the choice belongs to the design system: which one is
 * lawful depends on the caller's jurisdiction, what the caller's page is, and
 * whether the caller's own layout can accommodate a surface that covers it, and
 * none of those three is a fact this package holds.
 *
 * The default is `banner` because of the sentence above read the other way round. A
 * notice over the content is a notice readers dismiss without reading, which is the
 * behaviour a notice exists to prevent, and a consumer who has not thought about it
 * should get the arrangement where a reader can scroll past and keep the page. A
 * consumer whose counsel has told them otherwise passes `dialog` and owns the
 * consequence, which is a reader who has been shown something and has not read it.
 */
export type Consent01Position = 'banner' | 'dialog'

/** The props a Consent01 takes. Every string in this Block is one of them. */
export type Consent01Props = {
  /**
   * The notice's heading, and required.
   *
   * A node rather than a string, because a notice's heading is often the product's
   * own name plus a phrase and a caller composes that from two strings they already
   * have, and because the same notice has to be readable at two different sizes
   * depending on which arm drew it.
   */
  title: ReactNode
  /**
   * What the reader is told, in the caller's own words.
   *
   * Required, and this is the one prop on the Block that Prism has no ability to
   * help with at all. What a site tracks, with which processors, for how long, and
   * what a reader's refusal changes are four facts about the caller's product and
   * its agreements, and a Block that wrote them would be making representations
   * about somebody else's data processing on a page the caller owns.
   */
  body: ReactNode
  /** The words on the control that records consent. */
  acceptLabel: string
  /**
   * The words on the control that records a refusal.
   *
   * Required rather than optional for the same reason `onReject` is, and drawn at
   * the same size as the accept beside it. See the JSDoc on the Block for the
   * argument, which is the whole reason this Item exists.
   */
  rejectLabel: string
  /**
   * The words on the control that opens the caller's preferences surface.
   *
   * Required even though `onSettings` is not, and the reason is that the three
   * names belong together in the caller's own vocabulary: a notice whose two
   * visible controls are written next to each other and whose third name is
   * deferred to wherever the preferences surface gets built is a notice whose
   * three controls end up in two vocabularies. The honest cost is that a consumer
   * with no preferences surface passes a name for a control this Block does not
   * draw, and that is a placeholder in their own code rather than a change to this
   * type.
   */
  settingsLabel: string
  /**
   * Called when the reader accepts.
   *
   * **Required, and there is no arm of this component in which a reader is shown a
   * notice they cannot refuse.** Both of these are required rather than one of
   * them, because the shape that makes a notice unlawful is the one that offers a
   * way forward and no way back, and an optional `onReject` is how that ships: a
   * consumer who has not written a refusal path yet leaves the prop off, the Block
   * draws the accept and nothing else, and the page is compliant with nobody.
   */
  onAccept: () => void
  /** Called when the reader refuses. Required for the reason `onAccept` is. */
  onReject: () => void
  /**
   * Called when the reader asks for their preferences.
   *
   * Optional, and a caller with nowhere to send them passes nothing: the control is
   * not drawn at all rather than drawn as a dead end, and `settingsLabel` is the
   * cost of that, stated above.
   */
  onSettings?: () => void
  /**
   * Where the caller's policy is.
   *
   * Required, and it is required because a notice that says what it does and gives
   * no way to read the detail is a claim with nothing behind it. The honest
   * destination is the caller's own document rather than a route in this package,
   * and Prism does not read it or check that it resolves.
   */
  policyHref: string
  /**
   * The words on the link to the policy.
   *
   * The link's accessible name, so a required `string` for the same reason every
   * accessible name in this package is one: a reader reaching towards a control has
   * to hear what it is before they press it, and the name of a cookie policy is a
   * sentence the caller writes.
   */
  policyLabel: string
  /**
   * Whether the notice sits in the flow or covers the content.
   *
   * @defaultValue 'banner'
   */
  position?: Consent01Position
  /** Heading level for the notice's heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, on the `Section` this Block composes. Changing a Prism-owned
   * visual property from here is prohibited.
   */
  className?: string
}

/**
 * A cookie and tracking notice with two peers, a route to the policy, and no memory.
 *
 * **Reject and accept are peers, and the reject is drawn at the same size and with
 * the same reach as the accept. That is the whole reason this Block exists.** The
 * obvious way to build this panel is a filled accept beside a `ghost` reject,
 * because that is the arrangement every marketing site already has and because a
 * filled button is what a button is for. It is also a dark pattern, and the reason
 * a design system shipping it is worse than a product shipping it is that the
 * design system shipped the styling: four consumers then inherit a reject that looks
 * like a footnote, and none of them had to choose it. So the reject is drawn at
 * `outline`, which is the same height, the same padding, the same coarse-pointer
 * target and a border a reader can see, beside an accept that is filled. The two
 * differ by fill and by nothing else, and the reader's eye is not asked to weigh
 * them. The cost is named rather than hidden: a consumer who would rather the accept
 * were the quiet one and the reject the loud one cannot restyle Prism's buttons,
 * because the no-override-path rule is the reason this argument had to be made
 * here, and the answer is to compose `Button` twice in their own panel.
 *
 * **The settings control is quieter than both, and that is a different claim.** The
 * two peers are two decisions about the caller's tracking. The settings control is
 * a route to a surface where a reader can change their mind later, and a reader who
 * wants neither of the two decisions is exactly the reader who needs it, so drawing
 * it at the same weight would spend a third control's emphasis on the least likely
 * branch. It is `ghost` because it is a route rather than a decision. A reader who
 * reached it and found nothing there is the cost, and the fix is not to pass
 * `onSettings`.
 *
 * **The `dialog` arm exists, and the choice between the two is the caller's.** A
 * notice that covers the page's content is a notice readers dismiss without reading,
 * which is the behaviour a notice exists to prevent, and that is why `banner` is the
 * default and why the in-flow panel is a full measure rather than something tucked
 * into a corner. `dialog` is not refused, because a jurisdiction in some places
 * requires the decision before the page is usable and a caller's own layout may have
 * nowhere else to put a panel that must be unmissable. Which of the two is correct
 * depends on the caller's jurisdiction, the caller's page and the caller's layout,
 * and none of those is a fact this package holds, so the prop is required to be a
 * decision rather than defaulted into an opinion. The cost of the covering arm is
 * the sentence this Block opens with, and a caller who passes it has chosen it.
 *
 * **What the covering arm deliberately does not do, and the honest cost of that.**
 * Prism does not put `role="dialog"` on it, does not make the page inert and does
 * not trap focus, so a reader can Tab out of the panel into content behind a scrim
 * that says the page is unavailable. That is a real hole and it is named here rather
 * than hidden behind a role the markup cannot keep: `aria-modal` and a trapped
 * focus ring are claims about behaviour, and a Block that set one without the other
 * would be announcing a modal to assistive technology while the keyboard walked out
 * of it. The answer for a caller who needs the behavioural half is `Dialog`, which
 * does all three, and this Block's `banner` composed inside it. What `dialog` gives
 * here is the visual half, which is the half a notice is usually missing.
 *
 * **Both handlers are required, so there is no arm in which a reader cannot
 * refuse.** This is the same mechanism `HeroAction` uses for the same reason: the
 * shape that forbids something says so in the type rather than in prose, and an
 * optional `onReject` is a notice that can be shipped with no way out of it. A
 * consumer who has not built a refusal path yet is exactly the consumer who would
 * have left the prop off, which is why the refusal is the part that is required
 * rather than the part that is convenient.
 *
 * **The Block persists nothing, and it does not remember the decision.** There is
 * no cookie, no `localStorage`, no `document.cookie` and no state, so a page load
 * shows the notice again until the caller stops rendering it. That is the correct
 * default for a notice about something still true, and the alternative is a
 * different thing and a deliberate act: a stored consent decision is a record in the
 * consumer's own storage that outlives the notice, and it is the half of the feature
 * a design system is least able to get right, because its correctness depends on the
 * consumer's jurisdictions, on how long their records are kept, on whether a reader
 * who clears their browsing data has to be asked again, and on whether a change to
 * the policy invalidates the last decision. Prism has no standing to decide any of
 * those, so the decision and its consequences are the consumer's. The cost is that
 * a caller who wants the notice once writes the storage themselves, and a caller
 * who writes nothing gets a notice that comes back, which is the safe direction to
 * be wrong in. The handlers are the seam, and both are the caller's.
 *
 * **Prism pins nothing to the viewport, and that is a decision about the frame
 * rather than about the notice.** A position in the reader's window is a position
 * in their layout, and a Block that claimed one would be a Block every consumer had
 * to move, which is the override path the rules exist to prevent. `position` chooses
 * how the panel is presented inside the `Section` this Block composes: in the flow
 * at the start of the container, or centred on a muted ground so the panel is the
 * only thing in it. A consumer who wants the notice fixed to the bottom of the
 * window puts this Block in a container they have fixed themselves.
 *
 * It is a client Component, and the reason is the handlers rather than the state,
 * as in every other Block in this wave. `onAccept` is a function, a function is a
 * piece of state, and state is a client module: a server component cannot hand an
 * event handler down to a `<button>`, so a caller rendering this from a server
 * component gets a notice whose two controls do nothing. There is no state in this
 * file at all, so the client cost is the three handlers and not a running loop.
 */
export function Consent01({
  title,
  body,
  acceptLabel,
  rejectLabel,
  settingsLabel,
  onAccept,
  onReject,
  onSettings,
  policyHref,
  policyLabel,
  position = 'banner',
  headingLevel = 'h2',
  className,
}: Consent01Props) {
  return (
    <Section data-slot="consent-01" className={cn(className)}>
      {/*
       * The stage, and it is the only place `position` is read. `banner` is the
       * panel in the flow at the start of the container, which is the arrangement a
       * reader can scroll past with the page still in front of them. `dialog`
       * centres the panel on a muted ground inside the same container, so the notice
       * is the only thing in its own space without pretending to be a modal Prism
       * does not trap focus for. See the JSDoc for the third thing this deliberately
       * does not do.
       */}
      <div
        data-slot="consent-01-stage"
        className={cn(
          'flex w-full',
          position === 'dialog' ? 'justify-center rounded-2xl bg-muted/40 px-4 py-10' : null,
        )}
      >
        <Card data-slot="consent-01-panel" className="w-full max-w-measure gap-4">
          <CardContent data-slot="consent-01-body" className="flex flex-col gap-4">
            <SectionHeading title={title} align="left" as={headingLevel} />

            {/*
             * The explanation, set at body size rather than at the heading's
             * supporting-line size. It is not a standfirst under a title here: it is
             * the notice, and it is usually two or three sentences a regulator
             * expects to be readable rather than skimmed. `text-pretty` is there so
             * a caller's paragraph does not leave a one-word last line.
             */}
            <div
              data-slot="consent-01-explanation"
              className="text-muted-foreground text-pretty text-sm"
            >
              {body}
            </div>

            {/*
             * The two peers, then the route. Accept is filled and reject is
             * outlined, which is a difference of fill and not of size: the two are
             * the same height, the same padding and the same coarse-pointer target,
             * so a reader reaching for the refusal is reaching for a control of the
             * same size as the one that agrees with them. The settings control comes
             * last and at `ghost` because it is a route rather than a third
             * decision, and it is not drawn at all when there is nowhere to send the
             * reader.
             */}
            <div
              data-slot="consent-01-controls"
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Button data-slot="consent-01-accept" variant="default" onClick={onAccept}>
                {acceptLabel}
              </Button>

              <Button data-slot="consent-01-reject" variant="outline" onClick={onReject}>
                {rejectLabel}
              </Button>

              {onSettings === undefined ? null : (
                <Button
                  data-slot="consent-01-settings"
                  variant="ghost"
                  size="sm"
                  onClick={onSettings}
                >
                  {settingsLabel}
                </Button>
              )}
            </div>

            {/*
             * A `CtaLink` and not a bare anchor, so the link carries the focus ring
             * and is announced as a link with a destination rather than as a control
             * that goes somewhere. It is drawn last because it is the one control a
             * reader may never press, and a reader who has decided is helped by it
             * being the furthest control from the two decisions.
             */}
            <CtaLink
              data-slot="consent-01-policy"
              href={policyHref}
              variant="ghost"
              size="sm"
              className="self-start"
            >
              {policyLabel}
            </CtaLink>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}

export default Consent01
