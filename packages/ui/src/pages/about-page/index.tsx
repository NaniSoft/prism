import type { ReactNode } from 'react'

import { About01 } from '../../blocks/about-01'
import { Services01 } from '../../blocks/services-01'
import { Story01 } from '../../blocks/story-01'
import { Team01 } from '../../blocks/team-01'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One principle the company holds itself to: a short name and a sentence saying
 * what holding to it means in practice.
 *
 * Declared here rather than taken from `about-01`, following the note
 * `About01` makes about `hero-01`: a page's principle and a band's principle are
 * two surfaces a consumer composes separately, and a consumer that reaches for
 * one while building the other should not have to import the other's type. The
 * shapes are identical and the duplication is the cost, and the cost is small
 * because both are three fields and a key.
 */
export type AboutPagePrinciple = {
  /** A stable key, and not the name: a rename in the copy is not a rename in a key. */
  id: string
  /**
   * The principle's own name.
   *
   * A string because a principles grid is scanned down its left edge, and a name
   * that wraps to two lines costs every other tile its alignment. The sentence
   * under it is the part a consumer wants to mark up, and that is a node.
   */
  title: string
  /** What holding to this one means, in practice. */
  body: ReactNode
}

/**
 * One moment in the company's history: when it happened, what it was called, what
 * changed, and optionally a figure of the time.
 *
 * `at` is a string rather than a `Date` and Prism formats no date: `2024`,
 * `Q3 2024` and `Winter 2024` are all honest readings, and the reading a reader
 * in a particular locale and script should see is the caller's to compose with
 * `RelativeTime` or with the platform's own `Intl`.
 *
 * `body` is optional here and required on the rail, which is a boundary and not an
 * oversight: a milestone that is a date and a name is a legitimate row, and the
 * Page hands the rail an empty node for the paragraph rather than dropping the
 * milestone, because a history with a hole in it is worse than a milestone with
 * one sentence fewer.
 */
export type AboutPageMilestone = {
  /** A stable key for the milestone. */
  id: string
  /** When it happened, already written the way a reader should see it. */
  at: string
  /** What the milestone was called at the time. */
  title: string
  /** What changed, in the reader's terms rather than the company's. */
  body?: ReactNode
  /** A figure of the time, composed by the caller. */
  media?: ReactNode
  /** The caption for `media`. Separate from `media` because a figure that needs none is real. */
  mediaLabel?: string
}

/**
 * One person, as a team grid shows them: a name, a role, and whatever else the
 * consumer publishes about them.
 *
 * All four of the optional fields are optional because each absence is a fact
 * about what the consumer publishes rather than a state this Page has to render
 * around: a portrait may be absent, a biography may be absent, a destination may
 * be absent.
 */
export type AboutPagePerson = {
  /** A stable key for the cell, carried on the markup so a test can name one person. */
  id: string
  /** The person's own name, as they publish it, and the source of the portrait's initials. */
  name: string
  /**
   * What they do, in the words the consumer uses.
   *
   * Required because a portrait and a name with no role says who someone is and
   * not what they are for, which on a team page is the only reason the person is
   * in it.
   */
  role: string
  /** A sentence or two about the person, set at the reading measure and never cut short. */
  bio?: ReactNode
  /**
   * The portrait, with the name the initials come from.
   *
   * A name rather than a string, because a portrait with no fallback is an empty
   * circle for as long as the image takes to arrive and for ever if it never does.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
  /** Where the person goes. A native anchor, and it makes the whole cell the destination. */
  href?: string
  /** The words naming the destination. Required whenever `href` is, and enforced below. */
  hrefLabel?: string
}

/**
 * One engagement or capability: what it is called, what the work is, what the
 * reader gets, and what it is for.
 *
 * `deliverables` is a `readonly string[]` rather than a node because a
 * deliverables list is a set of short noun phrases a reader checks off against
 * their own situation, and one paragraph in a five item list is a list the reader
 * stops scanning.
 */
export type AboutPageService = {
  /** A stable key for the engagement. */
  id: string
  /** What the engagement is called. */
  title: string
  /** What the work is, in a few sentences. */
  body: ReactNode
  /** What the reader gets, as short noun phrases, in the order it arrives. */
  deliverables?: readonly string[]
  /** What it is for, stated as an effect rather than as a feature. */
  outcome?: ReactNode
  /** Where the engagement's own page is. Its presence makes the card carry a link. */
  href?: string
  /** The words on the link. Required whenever `href` is, and enforced below. */
  hrefLabel?: string
}

/**
 * The closing band: a heading, a supporting line, and at most one way on.
 *
 * `cta` is optional because a closing band that asks for nothing is a real
 * arrangement, and `Cta01`'s own JSDoc gives the same reason for the same prop. A
 * band that wants two destinations is a page a consumer composes.
 */
export type AboutPageContact = {
  /** The band's heading. */
  title: ReactNode
  /** One or two sentences under the heading. */
  description?: ReactNode
  /** The one way on, as a native anchor with a destination. */
  cta?: {
    /** The words on the link. */
    label: string
    /** Where it goes. */
    href: string
  }
}

/**
 * The props an AboutPage takes.
 *
 * Every string, every date and every destination is a prop and the Page ships
 * none of them. An about page is the page a consumer is most tempted to fill with
 * somebody else's sentences, because it is the page where a company talks about
 * itself, and a Page that held any of it would put one company's history, one
 * company's staff and one company's promises into every product that installs it.
 */
export type AboutPageProps = {
  /** Optional label above the page's own heading. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The page's heading.
   *
   * Required, and it is the page's `h1`, which is why it is the first thing the
   * Page hands to the first band rather than a title it draws above it. See the
   * Page's JSDoc for the whole of that argument.
   */
  title: ReactNode
  /**
   * One or two sentences under the heading, for the part the heading cannot carry.
   *
   * A node rather than a string, because the supporting paragraph of an about
   * band is the one place on a marketing page a consumer wants authored prose
   * with a link in it, and a string would force them to drop the markup.
   */
  description?: ReactNode
  /**
   * The one big sentence: what this is, in the present tense, for the reader.
   *
   * Required, and it is the band. A page with a heading, a paragraph and a set of
   * principles but no statement is a hero without its actions, and a hero is a
   * claim about a product a reader has not decided anything about yet.
   */
  statement: ReactNode
  /**
   * The principles, in the order a reader should meet them.
   *
   * Required, and `readonly` because the normal way a consumer writes one of these
   * is an `as const` fixture, and a prop typed as a mutable array rejects that
   * fixture at the one moment a consumer is copying it out of a file.
   */
  principles: readonly AboutPagePrinciple[]
  /**
   * The milestones, in the order they happened. Omit them for a company with no
   * history worth publishing, and the order of the rest of the page is unchanged.
   */
  milestones?: readonly AboutPageMilestone[]
  /** The people, in the order a reader should meet them. Omit them and the band is not there. */
  people?: readonly AboutPagePerson[]
  /** The engagements, in the order a reader should meet them. Omit them and the band is not there. */
  services?: readonly AboutPageService[]
  /** The closing band. Omit it and the page ends on the last band that was given. */
  contact?: AboutPageContact
  /**
   * The heading level for the page's own heading, and one step below it for every
   * band.
   *
   * Defaults to `h1`, because a page owns the top of the document outline. A
   * consumer embedding the page under a heading it already owns passes one level
   * deeper and the whole outline follows.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A complete about screen, in the order a reader arrives with its questions.
 *
 * **The decision this Page makes is the order, and the order is the whole of what
 * it is.** Five bands, in this sequence: what this is, how it got here, who is
 * here, what it does, and how to reach it. Each is a question a reader actually
 * arrives with rather than a section a template happens to contain, and the
 * sequence is the one those questions are asked in. A reader who opens an about
 * page does not want the history first, because the history is only legible once
 * they know what the thing is; they do not want the team before the story, because
 * a name with no history behind it is a logo; and they do not want the services
 * before the people, because a list of capabilities with nobody attached to it is
 * a brochure. So: the statement, then the rail, then the faces, then the
 * engagements, then the way on.
 *
 * **The order costs something, and the cost is the point of stating it.** A
 * consumer whose story belongs after the team, which is a real and defensible
 * arrangement for a company whose people are the argument, cannot reorder this
 * page; the honest answer is that it composes two Pages, one holding the people
 * and one holding the story, and the seam between them is two page vertical
 * rhythms where the author wanted one. That is the correct price of an opinionated
 * order. The alternative was a `order` prop, or a slots array, and either would
 * have moved the decision from this file to the call site, which is to say it would
 * have stopped being a Page and become a container for five Blocks with a layout
 * the consumer has to get right themselves. An order the Page does not own is an
 * order every consumer gets wrong differently.
 *
 * **What the Page refuses is which bands appear.** It decides the sequence and
 * nothing else. `milestones`, `people`, `services` and `contact` are all optional
 * and their absence removes a band without moving any other, so a product with no
 * story to tell omits `milestones` and reads the same four questions in the same
 * order. The Page holds no opinion about how many of the five a reader needs, and
 * that is the same refusal `PageHeader01` and `Changelog01` state: the structure
 * is read from the data rather than imposed on it.
 *
 * **The `h1` is the about band's own section heading, and that is a decision worth
 * a paragraph.** The alternative is a title the Page draws above the first band,
 * and it was rejected for two reasons. The first is duplication: the about band
 * opens with a title, and a title the Page drew above it would be the same words
 * twice within one screen. The second is that a Page that draws its own heading
 * band has to decide where the bands start below it, and the answer is always a
 * second `Section` of vertical rhythm between the heading and the first thing the
 * heading is about, which on a page that already opens with a statement reads as
 * an empty band. Handing the caller's title to the first band puts the page
 * heading where the page's argument is, gives the page exactly one `h1` without
 * the Page having to police that, and lets `About01` hold the heading left, which
 * is the alignment `SectionHeading` requires of anything with content under it.
 *
 * **The bands after the first are untitled, and the outline that follows is
 * deliberate.** Every Block below the about band is composed at the page's own
 * heading level, so the principles, the milestones, the people and the engagements
 * are all one step below the page heading and each band's items sit at that same
 * level. The alternative was a section title per band, and that is a set of props
 * whose every value is a section heading this Page would then own, which is a Page
 * whose interface is a form rather than a screen. What the reader gets instead is
 * a document they can navigate by heading: the page name, then every titled thing
 * on the page, which is what a reader jumping to "the person who does X" or "the
 * milestone where we shipped Y" is actually looking for. The cost is that no band
 * announces itself, and a consumer who wants titled sections composes
 * `SectionHeading` above the bands itself, where the words are the consumer's.
 *
 * **The closing band is a heading and a link, and it is not `Contact01`.** That
 * Block is a form, its `onSubmit` is a function, and a function cannot cross from a
 * server Component to a client Component, so a Page that composed it would have to
 * be a client Component itself and every datum on this screen would then have to
 * be serialised across that boundary to reach a band four sections down. The
 * rejected alternative was a `form` slot, and it was refused for the same reason
 * every other slot on this Page is a node rather than a callback: a Page is a
 * screen model and a screen model describes a screen, it does not act on one.
 * A consumer that wants a contact form on its about page composes `Contact01`
 * beside this Page, which is where the form and the handler that owns it live.
 *
 * **The link arms are checked before anything is drawn.** A person or an
 * engagement with an `href` and no `hrefLabel` would render a link announced by
 * its address, which is punctuation rather than a name, and the cost of finding
 * that out from a screen reader is a reader who cannot follow it. The Page throws
 * rather than degrade, for the reason `Team01`, `ContentGrid01` and `Changelog01`
 * each state for their own link: a defect that is invisible in a screenshot is not
 * a defect a design system can afford to ship quietly.
 *
 * **The collections are copied rather than forwarded, and that is a boundary with
 * `About01`, `Story01` and `Services01`.** Those Blocks declare mutable lists and
 * this Page declares `readonly` ones, so each list is handed over as a fresh
 * array. The cost is one allocation per band and the reason is a fixture: an
 * `as const` array is how a consumer writes data they did not type by hand, and a
 * mutable prop rejects it at the moment it is most useful.
 *
 * It is a server Component. It fetches nothing, it holds no state, it takes no
 * function prop and it imports no router, so a consumer renders it from whichever
 * route their framework names for the about page.
 */
export function AboutPage({
  eyebrow,
  title,
  description,
  statement,
  principles,
  milestones,
  people,
  services,
  contact,
  headingLevel = 'h1',
  className,
}: AboutPageProps) {
  assertLinkLabels(people, services)

  return (
    <div data-slot="about-page" className={cn(className)}>
      <About01
        eyebrow={eyebrow}
        title={title}
        statement={statement}
        body={description}
        principles={[...principles]}
        headingLevel={headingLevel}
      />

      {/*
        The rail is composed at the page's own level rather than one deeper, so
        every titled thing on the page is one step below the page heading. See the
        JSDoc for the outline this produces and the band titles it gives up.
      */}
      {milestones === undefined || milestones.length === 0 ? null : (
        <Story01
          milestones={milestones.map((milestone) => ({
            ...milestone,
            // The rail draws one paragraph per milestone, so a milestone with no
            // body is handed an empty node rather than dropped: a hole in a
            // history is worse than a row with one sentence fewer.
            body: milestone.body ?? null,
          }))}
          headingLevel={headingLevel}
        />
      )}

      {people === undefined || people.length === 0 ? null : (
        <Team01 people={[...people]} headingLevel={headingLevel} />
      )}

      {services === undefined || services.length === 0 ? null : (
        <Services01 services={services.map(asEngagement)} headingLevel={headingLevel} />
      )}

      {contact === undefined ? null : (
        <Section data-slot="about-page-contact">
          <SectionHeading
            as={childLevel(headingLevel)}
            align="left"
            title={contact.title}
            description={contact.description}
            className="mb-8"
          />
          {contact.cta === undefined ? null : (
            <CtaLink href={contact.cta.href}>{contact.cta.label}</CtaLink>
          )}
        </Section>
      )}
    </div>
  )
}

/**
 * One engagement as the grid draws it, with the two link arms kept apart.
 *
 * `Services01` states the pair as a union rather than as two optional fields, and
 * this is the seam between that union and a Page prop which is flat on purpose: a
 * consumer's data model is flat, and a caller that had to narrow their own record
 * before they could hand it over would be doing the Block's type work at every
 * call site. So the two arms are built here, once, and the flat pair is checked
 * above before this runs.
 *
 * The `hrefLabel` fallback is unreachable, and it is there because the type cannot
 * know the check has already thrown. It is written as an empty string rather than
 * as an assertion so that a future change which reorders the two would render an
 * unnamed link rather than quietly lie to the compiler.
 */
function asEngagement(service: AboutPageService) {
  const shared = {
    id: service.id,
    title: service.title,
    body: service.body,
    deliverables: service.deliverables === undefined ? undefined : [...service.deliverables],
    outcome: service.outcome,
  }

  return service.href === undefined
    ? shared
    : { ...shared, href: service.href, hrefLabel: service.hrefLabel ?? '' }
}

/**
 * The two link checks the composed Bands would otherwise make on the Page's
 * behalf, run once here so the message names the Page's own prop.
 *
 * `Team01` and `Services01` each throw for their own link pair, and the reason
 * this runs anyway is that a consumer reading a stack trace wants the name of the
 * prop they passed, not the name of the band three frames down that received it.
 * The word is the same one either way; only the sentence about who to fix changes.
 */
function assertLinkLabels(
  people: readonly AboutPagePerson[] | undefined,
  services: readonly AboutPageService[] | undefined,
): void {
  for (const person of people ?? []) {
    if (person.href !== undefined && (person.hrefLabel === undefined || person.hrefLabel.trim() === '')) {
      throw new Error(
        'AboutPage: a person declares an href and no hrefLabel, so the cell would carry a link announced by its ' +
          'address, which a screen reader reads out as punctuation rather than as a name. Pass the words that say ' +
          'where the person goes, or drop the href.',
      )
    }
  }

  for (const service of services ?? []) {
    if (service.href !== undefined && (service.hrefLabel === undefined || service.hrefLabel.trim() === '')) {
      throw new Error(
        'AboutPage: an engagement declares an href and no hrefLabel, so the card would carry a link announced by ' +
          'its address. Pass the words that say where the engagement goes, or drop the href.',
      )
    }
  }
}

export default AboutPage
