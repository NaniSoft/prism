import type { ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
import { Card, CardHeader, CardTitle } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'

/**
 * One recognition: the body that gave it, the organisation they gave it to, the
 * year, and where the record is.
 *
 * The field called `body` is the work, not a sentence describing it. A reader
 * checks the name of the work first, so the work is the anchor of the row and the
 * awarding body and the date are the two facts that sit beside it.
 */
export type Awards01Award = {
  /**
   * A stable key for the row.
   *
   * Required, and carried on the markup as `data-award`, so a test can name one
   * recognition rather than the first one and two recognitions in one list are
   * individually addressable. Two bodies can win the same recognition in the
   * same year, which is the case a name used as a key fails on.
   */
  id: string
  /**
   * The work that was recognised, named as the awarding body names it.
   *
   * The anchor of the row and the card title. It is a public claim: a name that
   * is not the body's own spelling of the work reads as a correction of the record.
   */
  body: string
  /**
   * The organisation that gave the recognition.
   *
   * Not the body that received it and not the publisher of the list. This is who
   * decided, which is the half of a recognition a reader cannot infer from the
   * name of the work.
   */
  organisation: string
  /**
   * The year the recognition was given, as the awarding body writes it.
   *
   * Required, and required by law rather than by habit: see the Block's JSDoc for
   * why an undated award is a logo with words. A body that gives an award every
   * year writes a year, a season or a date. A body that has not published since
   * has not given one, and the honest entry for that is not an award.
   */
  year: string
  /**
   * The category or track, when the awarding body splits its recognition into
   * more than one.
   *
   * Rendered as an outlined `Badge` rather than as another line of copy, because
   * a category is a label a reader scans past rather than a sentence they read.
   * The words are the caller's own, since a body names its own tracks.
   */
  category?: string
  /**
   * Where the record is.
   *
   * A native anchor `href`, so the whole row is a link with the browser's own
   * affordances. Omit it for a recognition whose record is not public, and the
   * row is then read rather than followed; nothing about a missing destination is
   * inferred.
   */
  href?: string
}

/**
 * The props an Awards01 takes.
 *
 * Every string is a prop and the Block ships none: no body, no year, no category
 * and not one award. A list of recognitions that hardcoded any of them would hand
 * every consumer who installed it a claim about that consumer's own work.
 */
export type Awards01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a list composed under its own heading. */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The recognitions, in the order a reader should meet them.
   *
   * Order is a claim about what the reader should see first, and the Block does
   * not sort. A caller who wants recency has a year on every row and can sort on
   * it in one line of their own code; a Block that sorted would be deciding what
   * a consumer is proudest of.
   */
  awards: readonly Awards01Award[]
  /**
   * `list` draws hairline rows. `cards` draws a card per recognition with the
   * work as its title.
   *
   * @defaultValue 'list'
   */
  layout?: 'list' | 'cards'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The two facts that sit beside the work: who decided, and when.
 *
 * Two elements rather than one joined string, and the reason is the mono stack.
 * The organisation is the interface face and the year is set in mono, because a
 * year is a machine reading and this system annotates those in mono everywhere
 * else. A single string could not be both, and a year set in the interface face
 * beside a wordmark stops reading as a value. The pair is a `flex` column in the
 * list arrangement and a baseline row in the cards arrangement, and both read in
 * the same order: who, then when, then what for.
 */
function AwardAttribution({
  organisation,
  year,
}: {
  organisation: string
  year: string
}) {
  return (
    <>
      <span data-slot="awards-organisation" className="text-sm font-semibold">
        {organisation}
      </span>
      <span data-slot="awards-year" className="text-muted-foreground font-mono text-xs">
        {year}
      </span>
    </>
  )
}

/**
 * The check that makes this Block an argument rather than a list.
 *
 * A year that is absent or blank throws, and the diagnostic names the reason in
 * the words a developer needs: an undated award is a logo with words attached. A
 * throw rather than a fallback because there is no fallback that is not a claim.
 * An empty year cell is a visible gap in the middle of a public record, and a
 * year this Block invented would be worse than either. Rendering nothing would
 * be quietest and worst, because a consumer who published the page would never
 * learn that their record was incomplete.
 */
function assertYear(award: Awards01Award): void {
  if (typeof award.year !== 'string' || award.year.trim() === '') {
    throw new Error(
      'Awards01: an award declares no year, and an undated award is a logo with words attached. Pass the year ' +
        'the awarding body published, or use a block that makes no dated claim, such as a logo cloud or a trust ' +
        'strip.',
    )
  }
}

/**
 * A list of recognitions: who gave it, what for, and the year it was given.
 *
 * **This is a separate Item from `logo-cloud-01` because a logo and an award are
 * not the same kind of claim.** A logo is a mark, and a mark says only who works
 * with us, which is a fact about a relationship and one that does not expire. An
 * award is a sentence: a body decided something about a piece of work, on a
 * date, and wrote it down. A consumer can show a mark they were given this
 * morning or a recognition from eleven years ago; they cannot show an award
 * without the year, because the year is the part of the sentence that is a fact
 * about when it was true, and the part that goes out of date. So the date is a
 * required field here, set in the mono face beside the organisation rather than
 * inside the body copy, which is what separates the two Blocks visually as well
 * as factually.
 *
 * **A missing year is a thrown diagnostic, and that is the Block's whole argument.**
 * An award with no date is not an award: it is a logo with words attached, and
 * the words are the half that would let a reader believe it. The date is the part
 * that expires and the part a reader checks, because a recognition has a
 * currency, and an undated one cannot be stale, so it never goes out of date and
 * therefore never has to be withdrawn. A consumer who wants a band of marks
 * already has `logo-cloud-01`, where no date is required because no date is
 * claimed, so there is nothing here for the undated case to fall back on.
 *
 * **`trust-strip-01` is the same content without the date, and it is a different
 * Item because it makes a weaker claim.** The strip is one line, undated,
 * unlinked, and reads as a general assurance, so it can hold "Recognised by
 * leading industry bodies" where a dated record would be a claim nobody has
 * checked. Both are correct and neither is interchangeable: a consumer who swaps
 * one for the other is upgrading an assurance into a record, which is an
 * editorial and legal decision rather than a layout one. So the two Blocks do
 * not merge and neither takes the fields of the other.
 *
 * **A row with a destination is a native anchor and a row without one is not a
 * disabled link.** The whole row is the anchor in the list arrangement and the
 * whole card is the anchor in the cards arrangement, so the destination shows in
 * the status bar, a context menu can copy it and middle click opens it. The card
 * arrangement puts the anchor outside the card rather than inside it, so the
 * focus ring bounds the card rather than the words in it, which is the argument
 * `Item` states in full: a ring around a box that sized itself to its own text is
 * not an indicator.
 *
 * The list arrangement is a `ul`, so a reader hears how many recognitions there
 * are before the first one. A card title is composed at `childLevel(headingLevel)`
 * rather than at a fixed level, so a set embedded one level deeper than it was
 * written for carries its titles with it. An empty set renders nothing, for the
 * reason `ProductSwitcher` and `AvatarGroup` each state: an empty frame is worse
 * than an absent one.
 *
 * It is a server Component: no hook, no state, no client code and no motion
 * beyond the transition on a row that is a link.
 */
export function Awards01({
  eyebrow,
  title,
  description,
  awards,
  layout = 'list',
  headingLevel = 'h2',
  className,
}: Awards01Props) {
  if (awards.length === 0) return null

  const Title = childLevel(headingLevel)

  return (
    <Section className={className}>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      {layout === 'cards' ? (
        <ul data-slot="awards" data-layout={layout} className="grid gap-6 sm:grid-cols-2">
          {awards.map((award) => {
            assertYear(award)

            const card = (
              <Card className="h-full gap-4 py-6">
                <CardHeader className="gap-2.5">
                  <CardTitle as={Title}>{award.body}</CardTitle>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <AwardAttribution organisation={award.organisation} year={award.year} />
                  </div>
                  {award.category === undefined ? null : (
                    <Badge variant="outline">{award.category}</Badge>
                  )}
                </CardHeader>
              </Card>
            )

            return (
              <li key={award.id} data-slot="awards-item" data-award={award.id} className="h-full">
                {award.href === undefined ? (
                  card
                ) : (
                  <a
                    data-slot="awards-link"
                    href={award.href}
                    className="focus-visible:ring-ring block h-full rounded-xl transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:outline-none"
                  >
                    {card}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <ul data-slot="awards" data-layout={layout} className="flex flex-col">
          {awards.map((award) => {
            assertYear(award)

            return (
              <li
                key={award.id}
                data-slot="awards-item"
                data-award={award.id}
                className="border-border border-b first:border-t"
              >
                {award.href === undefined ? (
                  <div className="flex flex-col gap-1.5 px-2 py-5 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="flex shrink-0 flex-col gap-0.5 sm:w-64">
                      <AwardAttribution organisation={award.organisation} year={award.year} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-pretty text-sm">{award.body}</span>
                      {award.category === undefined ? null : (
                        <Badge variant="outline">{award.category}</Badge>
                      )}
                    </span>
                  </div>
                ) : (
                  <a
                    data-slot="awards-link"
                    href={award.href}
                    className="hover:bg-accent/50 focus-visible:ring-ring flex flex-col gap-1.5 rounded-sm px-2 py-5 transition-colors duration-fast ease-out focus-visible:ring-[3px] focus-visible:outline-none sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <span className="flex shrink-0 flex-col gap-0.5 sm:w-64">
                      <AwardAttribution organisation={award.organisation} year={award.year} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-pretty text-sm">{award.body}</span>
                      {award.category === undefined ? null : (
                        <Badge variant="outline">{award.category}</Badge>
                      )}
                    </span>
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export default Awards01