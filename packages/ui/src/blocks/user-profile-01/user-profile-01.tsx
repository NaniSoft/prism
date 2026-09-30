import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { FactList } from '../../components/ui/fact-list'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Separator } from '../../components/ui/separator'
import { cn } from '../../lib/utils'

/**
 * The initials a name produces, and the rule that produces them.
 *
 * Two letters from the first and last words, and the first two characters of a
 * single word. It is the same rule `AvatarGroup`, `Team01` and `MemberList01` each
 * apply, repeated rather than imported, and the boundary is the reason: that
 * helper is private to its module, and exporting it would make a private
 * derivation part of a published surface in order to save six lines in a Block.
 * The cost is stated rather than hidden: four modules now carry this rule, so a
 * change to it is a change in four places, and a caller who needs a case the rule
 * does not cover composes `Avatar` themselves and passes their own node.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  if (first === undefined) return ''
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  return `${first.charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * One fact about a person, as a profile states it: the term and the answer.
 *
 * A node of its own rather than a re-export of `Fact`, and the reason is that
 * `Fact` is four fields and this profile has two of them. A re-export would put a
 * `href` and a `newTab` on a type whose only drawing is a definition list with no
 * anchor in it, and a caller reading the type would reasonably expect those two to
 * do something. The cost of the narrower type is that a caller whose fact value is
 * a destination composes `FactList` themselves rather than passing it here, and
 * that is the honest answer because the destination is a decision about their own
 * routes rather than a fact about a person.
 */
export type UserProfile01Fact = {
  /**
   * The caller's stable key for this fact.
   *
   * Required, because a profile's facts are very often assembled from a store the
   * caller already keys, and re-deriving a key here would be a second identity for
   * one value. It is not drawn and it is not on the markup: `FactList` owns the
   * row and keys it by position, so a caller whose facts reorder between renders
   * and who needs row identity composes `FactList` directly. That is the cost and
   * it is a small one.
   */
  id: string
  /**
   * The term that names the fact.
   *
   * A short noun phrase, because a column of these is read by scanning its left
   * edge and a term that wraps to two lines costs the whole column its alignment.
   * A `string` rather than a node, for the same reason `Fact`'s own `label` is
   * scanned rather than read.
   */
  label: string
  /**
   * The answer.
   *
   * A node, and the reason is that a profile's answers are not all the same kind
   * of thing: a date is a `RelativeTime`, a place is a place, a count is a figure
   * the caller has already formatted in their own locale, and a licence key is
   * something this Block must not set in a mono face on the caller's behalf
   * because it does not know what a key looks like in their product.
   */
  value: ReactNode
}

/**
 * The props a UserProfile01 takes.
 *
 * Every string is a prop and the Block ships none: no name, no role, no
 * biography, no fact and not one letter of any of them. A profile is a claim about
 * a person, and a Block that shipped a name would put Prism's staff, or a
 * stranger's, into every consumer's product.
 */
export type UserProfile01Props = {
  /**
   * The person's own name, as they publish it.
   *
   * Required, and it is the section heading rather than a line inside the body,
   * which is the decision this Block is shaped around. A reader who arrives at a
   * profile is arriving for one person, so the name is the thing the section is
   * about and it belongs in the outline at the level the surrounding document
   * gives this Block. A profile whose name was a `span` inside a band would be a
   * page a reader cannot navigate to by heading, and a page whose only content is
   * one person is exactly the page a reader navigates to by heading.
   */
  name: string
  /**
   * What they do, in the words the caller uses.
   *
   * Drawn as the section's supporting line rather than as a fact, because a role
   * is the answer to the question a reader arrives with and everything in `facts`
   * is the answer to a question they did not know to ask. It is a `string` and not
   * a node because a role is a short noun phrase in a product's own vocabulary and
   * there is nothing in it to emphasise.
   */
  role?: string
  /**
   * A paragraph or two about the person, in the caller's own words.
   *
   * A node, and drawn at the reading measure, because a biography is prose and a
   * line of prose at card width is a caption. Nothing here truncates it: a Block
   * that cut a biography at three lines with an ellipsis would be deciding which
   * part of a person's account of their own work matters, and it would do it by
   * cutting mid-sentence, which is the one place a truncation reliably removes the
   * qualification rather than the flattery. A caller who wants three lines writes
   * three lines.
   */
  bio?: ReactNode
  /**
   * The portrait, with the name the initials come from.
   *
   * **A slot and never a drawn silhouette, and the reason is that a fallback which
   * is a person-shaped glyph is a claim about a person the system knows nothing
   * about.** A grey disc with a head and shoulders in it says there is a person
   * here, which is a fact, and it says the same thing about every reader of every
   * product that installs this Block, so a reader who has seen three of them has
   * learned nothing about anybody. The fallback here is the person's own initials,
   * which is derived from the caller's own data rather than chosen by this package,
   * so a reader who cannot see the photograph still recognises the name beside it.
   * Omit the whole field for a person the caller has no photograph of: this Block
   * then draws no mark at all rather than a placeholder, and a profile with no
   * portrait and a name is a complete profile.
   */
  avatar?: {
    /** The photograph. Omit it, or pass a URL that fails, for the initials. */
    src?: string
    /** The person's name, which is the initials' source. */
    name: string
  }
  /**
   * The facts, in the order a reader should meet them.
   *
   * Order is the caller's because it is a claim about what matters most, and a list
   * that sorted itself would be making that claim on the caller's behalf. Omit it
   * for a person whose whole profile is a name and a role, which is a real and
   * common case rather than a thin one.
   */
  facts?: readonly UserProfile01Fact[]
  /**
   * The controls that belong to this person rather than to the page: follow,
   * message, assign, remove.
   *
   * A slot and not a set of named controls, because which actions a person has is
   * the caller's fact, and a Block that drew a message button and a kebab menu
   * would be drawing one product's idea of what can be done to a colleague. Each
   * control inside is the caller's own Component, so this is where a caller
   * composes their own menu rather than asking the Block to grow one.
   */
  actions?: ReactNode
  /**
   * The caller's own sections, under a rule: activity, permissions, history.
   *
   * A slot and not a tab strip, and the reason is that tabs are a behaviour as well
   * as a look. Which sections exist, which one is showing, and what happens when
   * the reader changes it are three decisions about the caller's application, and a
   * Block that drew the strip would have to own all three to make it work. So the
   * space is here, a rule is drawn above it, and `Tabs` is the caller's to compose.
   */
  tabs?: ReactNode
  /**
   * Whether the portrait sits beside the name or above it.
   *
   * @defaultValue 'header'
   *
   * `header` is the wide arrangement and it is right wherever the profile is a band
   * across a page. `sidebar` is the narrow one: portrait above, everything stacked
   * in a single column at the reading measure, which is what a profile looks like
   * in a rail or on a phone. It is a layout prop and not a `className` because
   * swapping the arrangement is a decision a page makes repeatedly, and
   * re-deriving it from utility classes at each call site is how a page ends up
   * with two profiles on opposite sides and no reason why.
   */
  layout?: 'header' | 'sidebar'
  /**
   * Heading level for the person's name. Defaults to `h2` because a Block is
   * composed, not a page. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component and Block. Changing a Prism-owned
   * visual property from here is prohibited.
   */
  className?: string
}

/**
 * One person in full: a portrait where there is one, a name, a role, a biography,
 * a set of facts, the caller's own controls, and room for the caller's own
 * sections underneath.
 *
 * **This is a Block and not a Card, and not `MemberList01`, and the three facts
 * that separate them are all about how many people are on the page and why the
 * reader came.** A profile is one person in full and the reader arrived for them:
 * they followed a link, they opened a record, they are looking at the one subject
 * the page is about, and everything on it is about that person. A member list is
 * many people and the reader is looking for one, which is the opposite reading
 * order: the reader scans a column of names and stops at one, so a member list is
 * optimised for scanning and a profile is optimised for reading. A card is a
 * bounded group of related content, and a profile is not a group: it has one
 * subject, and a subject in a frame reads as a set of facts about a thing rather
 * than as the thing. The three are separately the right answers to three different
 * pages, and a Block that blurred them would be a Block whose weight was wrong for
 * whichever page used it.
 *
 * **The facts compose `FactList` rather than being drawn as a definition list
 * here, and the reason is the empty case, quoted from the Component: "An empty
 * list renders nothing rather than an empty frame, so a caller that has nothing to
 * say does not get a bordered box with a title above it."** A profile is very
 * often a person with three facts and also a person with none, and the second case
 * is not a defect to be papered over with a placeholder row; it is a person whose
 * whole profile is a name. `FactList` draws the real `<dl>` with the term before its
 * answer, which is what a specification is and what a pair of columns is not, and
 * it draws the hairlines and the alignment that a hand-rolled version gets subtly
 * wrong. Writing a second definition list here would put a second answer to "how
 * does a set of facts read" in one package, and the second answer is always the one
 * that disagrees. The cost is stated rather than hidden: `FactList` keys its own
 * rows by position, so a caller whose facts reorder between renders and who needs
 * row identity composes the Component directly rather than passing them here.
 *
 * **The portrait is a slot and no mark is drawn in its place, because a fallback
 * which is a person-shaped glyph is a claim about a person this system knows
 * nothing about.** A silhouette says there is a person here, which is true, and it
 * says it identically about every reader of every product that installs this
 * Block, so a reader who has seen four of them has learned nothing about any of
 * them. The fallback that ships is the person's own initials, derived from the
 * caller's data by a rule this file repeats rather than imports, so a reader who
 * cannot see the photograph still recognises the name printed beside it. Omit
 * `avatar` entirely and nothing is drawn where the portrait would be, which is the
 * honest state: a person the caller has no photograph of is still a person, and a
 * grey disc is a claim that the absence is a gap.
 *
 * **The name is the section heading and not a line in the body, and that is the
 * decision the rest of the Block follows from.** A page whose only subject is one
 * person is a page a reader reaches by following a link and navigates away from by
 * heading, so a name in a `span` is a name no reader can come back to. It also
 * settles the arrangement: the name is at `headingLevel`, the role is the
 * supporting line under it, and the facts are the answers to questions the reader
 * did not arrive with, which is why they are a definition list and not more
 * headings. The cost is that the section heading is the person's name, so a page
 * with two profiles on it has two sections whose titles are people, and a
 * consumer who wants a page titled by the product instead composes the profile
 * inside their own `Section` rather than using this one.
 *
 * **`actions` and `tabs` are slots, and both are refused as anything else.** The
 * controls that belong to a person rather than to the page are the caller's fact:
 * follow, message, assign and remove are four different products' ideas, and a
 * Block that drew one of them would be drawing a workflow. Tabs are worse, because
 * a tab strip is a behaviour as much as a look: which sections exist, which one is
 * showing, and what happens when the reader changes it are three decisions about
 * the caller's application, and a Block that drew the strip would have to own all
 * three for it to work. So the space is here, a rule is drawn above it, and
 * `Tabs` is the caller's to compose. The cost is that this Block does not enforce
 * a relationship between the two, and a caller who passes neither gets a profile
 * with a facts list and nothing else, which is a valid page.
 *
 * **There is no motion in this Block, and the reason is worth stating because the
 * absence is a decision rather than an oversight.** The first law of motion covers
 * feedback, which is a response to something the reader did, and a profile has
 * nothing the reader pressed: there is no control that opens, no panel that
 * closes, and no row that changes state. The second law covers a cycle, which is a
 * demonstration of a mechanism, and the test that decides which law a motion falls
 * under is falsifiable: stop the animation, is the figure still true and still
 * legible? There is no figure here at all, so the question does not arise, and a
 * Block that answered it by animating the portrait in would be decoration wearing
 * the costume of a demonstration, which is the thing the first law was written to
 * exclude. The one place a transition could honestly go is the caller's own
 * controls, and those are the caller's Components with their own motion already
 * settled.
 *
 * It is a server Component: no hook, no state, no effect and no client code of its
 * own. The portrait is `Avatar`, which is a client Component whose only client work
 * is measuring whether an image has loaded, so a profile costs a consumer nothing
 * in client JavaScript beyond that and a caller composing a client `actions` slot
 * pays for the action rather than for the profile.
 */
export function UserProfile01({
  name,
  role,
  bio,
  avatar,
  facts,
  actions,
  tabs,
  layout = 'header',
  headingLevel = 'h2',
  className,
}: UserProfile01Props) {
  const beside = layout === 'header'

  return (
    <Section data-slot="user-profile-01" className={cn(className)}>
      <div
        data-slot="user-profile-01-body"
        data-layout={layout}
        className={cn(
          'flex flex-col gap-8',
          // The narrow arrangement is the one that needs a bound of its own, because
          // the wide one is already inside the container `Section` owns. `max-w-*`
          // is a bound token and not an arbitrary width, which is the whole of what
          // the layout gate allows in this position.
          beside ? null : 'max-w-measure-narrow',
        )}
      >
        <div
          data-slot="user-profile-01-head"
          className={cn(
            'flex flex-col gap-6',
            beside ? 'sm:flex-row sm:items-start sm:gap-6' : 'items-start',
          )}
        >
          {avatar === undefined ? null : (
            /*
             * The portrait, and the only place in this Block a client Component is
             * composed. `size-20` rather than a size the caller chooses, because a
             * profile's portrait is the one image on the page and its size is part
             * of what a profile looks like rather than a fact about the person.
             * `AvatarImage` takes an empty `alt` because the name is printed beside
             * it in the same heading, so an `alt` repeating that name would be the
             * same string twice for a reader who meets the image first.
             */
            <Avatar data-slot="user-profile-01-avatar" className="size-20 shrink-0">
              {avatar.src === undefined ? null : <AvatarImage src={avatar.src} alt="" />}
              <AvatarFallback className="text-mono">{initialsOf(avatar.name)}</AvatarFallback>
            </Avatar>
          )}

          {/*
           * The heading, which is the person's name, and the supporting line under
           * it, which is what they do. `align="left"` because there is content
           * under this heading in both arrangements, which is the rule
           * `SectionHeading` states and the list in
           * `test/section-heading-align.test.tsx` holds every Block to.
           */}
          <SectionHeading
            as={headingLevel}
            align="left"
            title={name}
            description={role}
            className="min-w-0 flex-1"
          />
        </div>

        {bio === undefined ? null : (
          <p
            data-slot="user-profile-01-bio"
            className="text-muted-foreground max-w-measure text-pretty text-sm"
          >
            {bio}
          </p>
        )}

        {facts === undefined ? null : (
          /*
           * The facts, composed and not derived. `FactList` renders nothing at all
           * for an empty list, which is the case this Block leans on hardest: a
           * person with no facts gets a name and a role and no box where facts
           * would have been. The mapping exists only because this Block's fact has
           * an `id` for the caller's data and `Fact` has no use for one.
           */
          <FactList
            data-slot="user-profile-01-facts"
            facts={facts.map((fact) => ({ label: fact.label, value: fact.value }))}
          />
        )}

        {actions === undefined ? null : (
          /*
           * The caller's own controls, in a plain row with no role. A group role
           * here would be a group with no name and one more thing a reader has to
           * walk past, and the controls inside are the controls.
           */
          <div data-slot="user-profile-01-actions" className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}

        {tabs === undefined ? null : (
          /*
           * The caller's own sections, under a rule rather than inside a strip.
           * The rule is decorative and says so by default, which is right: it
           * separates two blocks of the caller's own content and does not express
           * a separation a keyboard reader needs to know about.
           */
          <div data-slot="user-profile-01-sections" className="flex flex-col gap-6">
            <Separator data-slot="user-profile-01-rule" />
            {tabs}
          </div>
        )}
      </div>
    </Section>
  )
}

export default UserProfile01
