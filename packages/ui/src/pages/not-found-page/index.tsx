import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { Prose } from '../../components/ui/prose'
import { Section, headingSizeClass } from '../../components/ui/section'
import { Heading, Text } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One way out of a page that was not found.
 *
 * A destination, and the words for it. Both are required, because a not-found
 * page with no way out is a dead end with a message on it, and a link with no
 * words is a shape a reader has to guess at.
 */
export type NotFoundLink = {
  /** The words of the link. */
  label: string
  /** Where it goes. */
  href: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Almost never right here: a reader who
   * followed a broken link and is sent to a new tab has to find their way back.
   */
  newTab?: boolean
}

/**
 * The props a NotFoundPage takes.
 *
 * Every string is a prop and the Page ships none. There is no "404", no "this
 * page does not exist", no product name and no default set of links: a not-found
 * page that hardcoded any of them would be a page that made a claim about a
 * product it knows nothing about, and the one page on a site that every reader
 * and no crawler will see is the worst place to hardcode a sentence.
 */
export type NotFoundPageProps = {
  /**
   * The status code, shown as the page's own `h1`. Required, and a string rather
   * than a number because it is displayed, not computed: a Page never decides
   * what code it is answering.
   */
  code: string
  /**
   * The headline under the code: the sentence that says what happened. It is the
   * part a reader actually reads, and it is the caller's because every product
   * says it differently - "No node here", "This page does not exist (yet)".
   */
  title: string
  /**
   * One or two sentences under the headline, for anything a reader should know
   * before they follow one of the links: that the URL may be mistyped, that the
   * page is planned, that a search would find it.
   */
  description?: string
  /**
   * The ways out, in the order a reader should see them. Put the destination
   * most likely to help first; a not-found page that offers a homepage link
   * before the documentation sends a reader further from what they wanted.
   */
  links: readonly NotFoundLink[]
  /**
   * The accessible name of the row of ways out. It is required, because it is a
   * word a reader hears and a Page that ships no copy ships no reader-facing copy
   * either. "Ways out" is the Page's own phrasing; a site that files its
   * destinations differently names the same landmark differently.
   */
  linksLabel: string
  /**
   * A slot for whatever else the site wants to say here: a search box, a list of
   * recent posts, a contact address.
   */
  children?: ReactNode
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A complete not-found screen: the code, what happened, and the ways out.
 *
 * All four NaniSoft sites compose one, each in its own `not-found` route, and
 * three of them are the same six lines with a different product name on it: a
 * display title carrying the code, one muted sentence, and two or three links.
 * The fourth wrote the same thing in its own markup. Four hand-written screens
 * for one shape.
 *
 * It is a Page rather than a Block because it is a whole screen: it owns the
 * document's `h1`, it is what a router renders when a route does not resolve, and
 * it composes `Section`, `Heading`, `Text`, `Prose` and `CtaLink` into the one
 * arrangement of them that answers "this is not here". A Block would be a band
 * of that arrangement, and the band's job is not separable from the screen's:
 * there is one correct page here and it is short.
 *
 * **The code is the `h1` and the sentence is not.** A not-found page whose
 * `h1` is "Page not found" gives a search engine and a screen reader nothing
 * distinct to index, and the code is the one string on the page that is the same
 * for every broken URL. The code takes the display step and the sentence takes
 * the muted one, which is the reverse of what a reader sees first and the right
 * way round for anything that reads the outline.
 *
 * The links are `CtaLink`, so each one is a native anchor with a destination a
 * browser can show, copy and open in a new tab. A not-found page is the one place
 * on a site where a reader most wants to see where a link goes before following
 * it, because they have just followed one that went nowhere.
 *
 * The page carries no `noindex` and no `robots` directive, because this is a
 * component and not a route: what a not-found response is indexed as is the
 * consumer's server's decision, and a Page that declared it would be a Page
 * making a claim about a deployment it cannot see.
 *
 * It is a server Component. It fetches nothing, it holds no state and it imports
 * no router, which is what lets a consumer render it from whichever not-found
 * route their framework names.
 */
export function NotFoundPage({
  code,
  title,
  description,
  links,
  linksLabel,
  children,
  className,
}: NotFoundPageProps) {
  return (
    <Section className={className}>
      <div className="flex flex-col items-start gap-6">
        <Heading as="h1" className={cn('text-muted-foreground font-mono', headingSizeClass('h1'))}>
          {code}
        </Heading>
        <div className="flex flex-col gap-3">
          <Heading as="h2" className={headingSizeClass('h2')}>
            {title}
          </Heading>
          {description ? <Text size="lg">{description}</Text> : null}
        </div>
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
        {children ? <Prose className="mt-2">{children}</Prose> : null}
      </div>
    </Section>
  )
}

export default NotFoundPage
