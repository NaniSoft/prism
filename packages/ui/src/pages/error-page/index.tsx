import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Prose } from '../../components/ui/prose'
import { Section, childLevel, headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import { Heading, Text } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One way out of a failed screen, and the words for it.
 *
 * Identical to `NotFoundLink`, and it is a second declaration rather than an import
 * because a Page's props are the surface a consumer reads and this Page is shipped
 * from its own subpath: a consumer reading the corpus for a retry screen should not
 * have to know that a not-found screen also exists. The duplication is four fields
 * and a key, and the alternative is a shared type in one Page's module that the
 * other Page's documentation would then be about.
 */
export type ErrorPageLink = {
  /** The words of the link. */
  label: string
  /** Where it goes. */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Almost never right on a failed screen: a
   * reader who has just been shown a failure and is sent to a new tab has to find
   * their way back and cannot tell whether the thing they were doing is still there.
   */
  newTab?: boolean
}

/**
 * Every field of an ErrorPage except whether it shows a support reference.
 *
 * Not exported, because the two arms below are what a caller writes and this is
 * only the half they share. The union is what makes `referenceLabel` required
 * wherever `reference` is set, and a flat pair of optional props could not: a
 * reference with no label is a value on the page that nothing names, and a label
 * with no reference is a word heading nothing.
 */
type ErrorPageFields = {
  /**
   * The status code, drawn as the page's own `h1`.
   *
   * Required, and a string rather than a number because it is displayed, not
   * computed: a Page never decides what code it is answering, and a code a product
   * derives from its own exception class is a code this Page would then be
   * asserting about the consumer's deployment.
   */
  code: string
  /**
   * The headline under the code: the sentence that says what happened.
   *
   * A `string` because it is one sentence and it is the part a reader actually
   * reads, and it is the caller's because every product says it differently.
   */
  title: string
  /** One or two sentences, for anything a reader should know before they press anything. */
  description?: string
  /**
   * The control that tries the failed request again.
   *
   * A node and not a label and a handler, and that is the decision this Page is
   * shaped around. See the JSDoc on the Page: a slot is what keeps this screen a
   * server Component while the retry is still the first thing on it.
   */
  retry?: ReactNode
  /**
   * The ways out, in the order a reader should see them. Put the destination most
   * likely to help first.
   */
  links: readonly ErrorPageLink[]
  /**
   * The accessible name of the row of ways out.
   *
   * Required, because it is a word a reader hears and a Page that ships no copy
   * ships no reader-facing copy either. The Page's own phrasing is "where to next";
   * a site that files its destinations differently names the same landmark
   * differently.
   */
  linksLabel: string
  /** A slot for anything else the site wants to say here: a status page, a chat route. */
  children?: ReactNode
  /**
   * The level of the code, and one step below it for the headline.
   *
   * Defaults to `h1`, because a Page owns the top of the document outline and the
   * code is this screen's one string that is the same for every failure of its kind.
   */
  headingLevel?: HeadingLevel
  /** Layout only, exactly as on every Item. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The props an ErrorPage takes.
 *
 * Every string and every destination is a prop and the Page ships none. There is no
 * "something went wrong", no "please try again" and no product name, for the same
 * reason `NotFoundPage` gives: the failure screens are the ones every reader and no
 * crawler sees, so a sentence written here would be a claim about a product this
 * package knows nothing about, in the exact place where being wrong is worst.
 */
export type ErrorPageProps = ErrorPageFields &
  (
    | {
        /**
         * The support reference a reader quotes to a person: the request id, the
         * incident, the case number.
         *
         * A `string` because it is a machine value a reader copies rather than
         * reads, which is why it is drawn in the mono face and why the label beside
         * it is the caller's word.
         */
        reference: string
        /**
         * The word naming that value.
         *
         * Required here and forbidden on the other arm. "Reference", "Incident"
         * and "Case" are three words for three products, and a reference a reader
         * has to guess the name of is a reference they cannot quote.
         */
        referenceLabel: string
      }
    | {
        /** No reference on this screen. */
        reference?: never
        /** No word is needed, because there is no value to name. */
        referenceLabel?: never
      }
  )

/**
 * The one check the union cannot make, run before anything is drawn.
 *
 * It is here for the JavaScript caller and for a value that came out of a database
 * with the type's guarantee already gone, for the reason `Help01`, `Team01` and
 * `Onboarding01` each keep their own: a defect that is invisible in a screenshot is
 * not a defect a design system can afford to ship quietly.
 */
function assertReference(reference: string | undefined, referenceLabel: string | undefined): void {
  if (reference === undefined) return
  if (referenceLabel === undefined || referenceLabel.trim() === '') {
    throw new Error(
      'ErrorPage: a reference is shown with no referenceLabel, so the value would sit on the page with nothing ' +
        'naming it and a reader would have no way to know what it is for. Pass the word your support process ' +
        'asks readers to quote, or drop the reference.',
    )
  }
}

/**
 * A complete failure screen: the code, what happened, the retry, and the ways out.
 *
 * **This is the third of the three Pages that `DESIGN.md` records under Known Open
 * Items as deferred to v1.1**, so it discharges that row rather than adding to the
 * tail. The other two are `PricingPage` and `OnboardingPage`.
 *
 * **It is the sibling of `NotFoundPage` and the two fail for opposite reasons, which
 * is the reason they are two items rather than one with a prop.** A not-found is a
 * request that will never succeed: the address is wrong, the page was never there,
 * and no amount of asking again produces it, so a retry on a 404 is a lie told by a
 * button, and a reader who believes it waits, and then believes the next one too. A
 * server error is a request that may well succeed on a second try: the database was
 * briefly unreachable, a deploy was halfway, a queue was full. So on this screen the
 * retry is not one control among several, it is the most important thing on the page,
 * and it goes first, above the links and above the sentence that names the failure.
 * A design system that treated the two as one item, with a `retry` prop on the shared
 * screen and a flag deciding whether to draw it, would be wrong twice: it would teach
 * a 404 reader to press a button that cannot work, and it would teach an error
 * reader that the product agrees with them. Two screens with one shape between them
 * is the honest arrangement, and the cost is that a consumer with an error boundary
 * renders two components and holds two sets of words, which is a sentence in their
 * own copy rather than a fork.
 *
 * **Everything else is deliberately identical to its sibling**, and the shape of
 * that sameness is the argument. The code is the `h1` and the headline is one step
 * below it, for the reason `NotFoundPage` gives: the code is the one string on the
 * screen that is the same for every failure of its kind, so it is what anything
 * reading the outline indexes. The code is set in the mono face because it is a
 * machine value and that is the face this package annotates machine values with. The
 * links are native anchors with real destinations, for the reason its sibling gives
 * and for the same doubled reason: a reader who has just followed one link to a
 * failure is the reader on this site who most wants to see where the next one goes.
 *
 * **`retry` is a slot and that is what keeps this screen a server Component, and the
 * argument is about the boundary rather than about the control.** The rejected shape
 * was `retry: { label, onRetry }`: a handler is a function, a function is a piece of
 * state, and state is a client module, so that shape would have put the entire
 * failure screen, including every link and the code, on the client because one button
 * wanted an `onClick`. Passing the control in as a node inverts it: the caller writes
 * their own button in their own client component, this Page renders the node, and a
 * consumer whose retry is a router refresh, a mutation retry or a plain reload all
 * pass their own thing and get it drawn first. The cost is that Prism cannot check
 * that the slot is a control at all, and can neither label it nor disable it while a
 * retry is in flight, so a caller whose retry needs a busy state holds that state in
 * the component they wrote. That is the right home for it: the in-flight state is a
 * fact about the consumer's request and not about a screen.
 *
 * **The reference is a `dl`, and the label is a prop, because the word is the
 * consumer's.** "Reference", "Incident" and "Case" are three words for three
 * products and a reader has to be able to quote the word their support process asks
 * for. The value itself is a machine string a reader copies rather than reads, so it
 * is drawn in the mono face, and the pair is a definition list so a screen reader
 * announces the label with the value rather than reading a bare string.
 *
 * The Page carries no `noindex` and no `robots` directive, for the reason its
 * sibling gives: what a failure response is indexed as is the consumer's server's
 * decision, and a component that declared it would be making a claim about a
 * deployment it cannot see.
 *
 * It is a server Component. It fetches nothing, it holds no state and it imports no
 * router, so a consumer renders it from whichever route their framework names for
 * the status, and nothing on the screen costs client JavaScript until the caller's
 * own retry control does.
 */
export function ErrorPage({
  code,
  title,
  description,
  retry,
  links,
  linksLabel,
  reference,
  referenceLabel,
  children,
  headingLevel = 'h1',
  className,
}: ErrorPageProps) {
  assertReference(reference, referenceLabel)

  /*
    The headline sits one step below the code, which is the same derivation every
    Block uses and the reason a hardcoded `h2` would be right exactly once. The
    size is asked of the same table rather than passed to `Heading`'s `size`, which
    is a step of the scale and not a rung of the ladder, so the code and the
    headline were drawn at fixed sizes that the ladder's ceiling has since left
    behind.
  */
  const TitleHeading = childLevel(headingLevel)

  return (
    <Section data-slot="error-page" className={cn(className)}>
      <div data-slot="error-page-body" className="flex flex-col items-start gap-6">
        <Heading
          as={headingLevel}
          className={cn('text-muted-foreground font-mono', headingSizeClass(headingLevel))}
        >
          {code}
        </Heading>

        <div className="flex flex-col gap-3">
          <Heading as={TitleHeading} className={headingSizeClass(TitleHeading)}>
            {title}
          </Heading>
          {description ? <Text size="lg">{description}</Text> : null}
        </div>

        {/*
          The retry is first among the controls and above the sentence that names the
          failure, because on this screen the request may well succeed on a second
          try. That is the whole difference between this Page and its sibling, and
          the whole reason the two are two items.
        */}
        {retry === undefined ? null : (
          <div data-slot="error-page-retry">{retry}</div>
        )}

        {links.length > 0 ? (
          <nav aria-label={linksLabel} className="flex flex-wrap items-center gap-3">
            {links.map((link, index) => (
              <CtaLink
                key={link.href}
                href={link.href}
                newTab={link.newTab}
                variant={index === 0 ? 'default' : 'outline'}
              >
                {link.label}
              </CtaLink>
            ))}
          </nav>
        ) : null}

        {reference === undefined ? null : (
          <dl
            data-slot="error-page-reference"
            className="flex flex-col items-start gap-1"
          >
            <dt className="text-muted-foreground text-xs">{referenceLabel}</dt>
            <dd className="font-mono text-sm">{reference}</dd>
          </dl>
        )}

        {children ? <Prose className="mt-2">{children}</Prose> : null}
      </div>
    </Section>
  )
}

export default ErrorPage
