import type { ReactNode } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Card, CardContent } from '../../components/ui/card'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One quote and the person it is attributed to.
 *
 * `id` is separate from `name` for the reason every id in this package is
 * separate from its display text: `format="pair"` matches on it, and a name is
 * display content a consumer may correct in one release and not the other.
 */
export type Testimonial01Quote = {
  /** Stable identity, used for the key and for the pair's column matching. */
  id: string
  /** The words, as the caller composes them. A node so a caller can mark one. */
  quote: ReactNode
  /**
   * The person quoted.
   *
   * Required, and it is the only required field after the words themselves,
   * because a quote with no name is a sentence the reader cannot weigh. See the
   * JSDoc on the Block.
   */
  name: string
  /**
   * What the person does, in the product's own words.
   *
   * A separate field from `company` rather than one `byline` string, and the
   * reason is the shape of the data. A quote whose speaker has a role and no
   * company, a consultant, a regulator, an author, would otherwise have to write
   * something in the company field to fill it, and the two common workarounds are
   * both worse than an empty field: a consumer writes "Independent" and publishes
   * a claim about a person's employment status, or they concatenate the two into
   * one string and lose the ability to link the company.
   */
  role?: string
  /** The organisation the person speaks for, when there is one. */
  company?: string
  /**
   * Where the organisation's own page is, when there is one.
   *
   * Rendered as a real anchor with the company as its accessible name, so a
   * reader hears "NaniSoft, link" rather than a bare URL and can follow it. Omit
   * it and the company is text, which is the right answer when the company has no
   * page of its own.
   */
  companyUrl?: string
  /**
   * The person's picture, and what to show when there is none.
   *
   * `src` and `name` are both the caller's and the pairing is the point: `name` is
   * what the fallback shows, so a caller supplies the initials or monogram they
   * want rather than accepting ones this Block derived. See the JSDoc on the
   * Block for why Prism does not extract them.
   */
  avatar?: { src?: string; name: string }
}

/**
 * The props a Testimonial01 takes.
 *
 * Every string is a prop and the Block ships none: no quote, no name, no role, no
 * company and no avatar text. A testimonial is the one place on a marketing page
 * where a hardcoded name is a claim about a real person, which is a different kind
 * of wrong from a hardcoded price.
 */
export type Testimonial01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The section title.
   *
   * Optional, unlike a section that introduces a set. A testimonial band placed
   * between a case study and a pricing table often has nothing to add to what is
   * above it, and a heading invented to fill the space is a heading nobody
   * wanted.
   */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The quotes, in the order a reader should meet them.
   *
   * `format="single"` takes exactly one and `format="pair"` takes exactly two.
   * A count that does not match is a thrown diagnostic rather than a short row,
   * for the reason the matrix throws: a testimonial that quietly drops its third
   * quote is a product that decided a reader was not meant to read it.
   */
  quotes: readonly Testimonial01Quote[]
  /**
   * Which form the quotes take.
   *
   * `single` is the default because one quote read well is worth more than three
   * read quickly, and a band of four is a carousel with better manners. `pair` is
   * two columns, which is the most a reader can hold side by side before the
   * attributions start to blur.
   *
   * @defaultValue 'single'
   */
  format?: 'single' | 'pair'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout classes for the band. Layout only; every visual property is Prism's. */
  className?: string
}

/** One quote: the words, then the person they are attributed to. */
function Quote({
  quote,
  name,
  role,
  company,
  companyUrl,
  avatar,
  Name,
}: Testimonial01Quote & {
  /** The level the attributed name is composed at, from the Block's own section. */
  Name: HeadingLevel
}) {
  return (
    <Card data-slot="testimonial-quote" className="gap-4">
      <CardContent>
        {/*
          A `figure` around a `blockquote` and a `figcaption`, which is what the
          pair is: a quotation and the attribution it depends on. The blockquote
          carries the words and the caption carries the person, and a screen
          reader announces the two together rather than as a paragraph followed by
          a byline a reader has to connect themselves.
        */}
        <figure className="flex flex-col gap-4">
          <blockquote
            data-slot="testimonial-text"
            className="text-pretty text-base leading-relaxed"
          >
            {quote}
          </blockquote>

          <figcaption
            data-slot="testimonial-attribution"
            className="text-muted-foreground flex items-center gap-3 text-sm"
          >
            {avatar ? (
              <Avatar className="size-9">
                {avatar.src ? <AvatarImage src={avatar.src} alt="" /> : null}
                <AvatarFallback>{avatar.name}</AvatarFallback>
              </Avatar>
            ) : null}

            <span className="flex min-w-0 flex-col gap-0.5">
              {/*
                The name is the answer, and it is the reason this whole block
                exists, so it is a heading at the child level rather than a span
                in a caption. A reader navigating by heading should be able to
                reach the person as well as the words.
              */}
              <Name className="text-foreground text-sm font-medium">{name}</Name>
              {/*
                The role and the company are two items in one line rather than one
                concatenated string, so a reader is not left parsing a byline and
                working out where the role ends and the employer begins. The gap
                is the separator, and it is a gap rather than a comma because the
                punctuation of a byline is a typographic decision in a language
                this Block does not read. The line is drawn when either is present,
                so a person with nothing but a name does not get an empty second
                line under it.
              */}
              {role || company ? (
                <span className="flex flex-wrap items-center gap-x-2">
                  {role ? <span>{role}</span> : null}
                  {company ? (
                    companyUrl ? (
                      <a
                        href={companyUrl}
                        rel="noopener noreferrer"
                        className="focus-visible:ring-ring rounded-xs underline underline-offset-4 outline-none focus-visible:ring-[3px]"
                      >
                        {company}
                      </a>
                    ) : (
                      <span>{company}</span>
                    )
                  ) : null}
                </span>
              ) : null}
            </span>
          </figcaption>
        </figure>
      </CardContent>
    </Card>
  )
}

/**
 * One quote with an attribution, or two side by side.
 *
 * **The attribution is the load-bearing part, and everything else on this Block is
 * arranged around it.** A quote with no name is a sentence the reader cannot
 * weigh: an unattributed sentence on a marketing page is a claim the page makes
 * about itself, wearing somebody's voice, and a reader who is weighing whether to
 * trust the product has nothing to weigh it against. A quote with a name and no
 * role is only slightly better, because a name is a name and a reader cannot tell
 * a user from the person who wrote the thing they are using.
 *
 * **So `role` and `company` are two optional fields and not one `byline` string,
 * and the reason is the shape of the data rather than the shape of the layout.** A
 * testimonial whose speaker has a role and no company is ordinary: a consultant, a
 * regulator, an auditor, an author, an engineer who has left. One `byline` string
 * would have forced that speaker to put something in the company half, and the two
 * workarounds available at the time were both worse than an empty field. A
 * consumer writes "Independent" and publishes a claim about somebody's employment
 * status that may be false. Or the consumer concatenates the two into one string
 * and loses the ability to link the company, which is the half a reader most wants
 * to follow. Two fields cost a consumer one extra line and cost this Block
 * nothing, and the two are laid out as two items in one caption line rather than
 * as one concatenated string, so a reader is not left parsing a byline and working
 * out where the role ends and the employer begins. The cost of the decision is
 * that a caller who wants a single unbroken byline has to write the punctuation
 * themselves, which is the right way round: it is their name and their voice.
 *
 * **`companyUrl` renders a real anchor, and the company is its accessible name.**
 * The alternative was a bare URL under the attribution, which is a link a reader
 * has to read character by character and a link whose destination is announced as
 * punctuation. The anchor also carries the full-strength focus ring the rest of
 * this package draws, because a bare anchor in a `figcaption` is the one link on
 * the page a keyboard reader is most likely to reach without having seen.
 *
 * **`avatar.name` is the caller's fallback text and Prism does not derive it.** The
 * obvious Block would take a `name` and take the initials from it, and that is a
 * claim about the grammar of names in a language this repository has no data for:
 * one word, two words, a surname first, a patronymic, a suffix, a name that is
 * written with a space in it. So the fallback is the caller's own short string, and
 * a caller who wants a monogram writes the monogram. The image's `alt` is empty
 * rather than the person's name, for the reason `Avatar`'s JSDoc gives: the
 * attribution beside it already identifies the person, and an `alt` repeating that
 * name is the same sentence twice.
 *
 * **There is no carousel and nothing advances.** `DESIGN.md`'s Motion section
 * refuses an attention loop, and a testimonial that moves is a testimonial a
 * reader cannot finish reading. A quote is a sentence somebody chose to say about
 * a product they use, and the reader is being asked to weigh it; swapping it out
 * from under them mid-sentence is the opposite of being asked, and an
 * auto-advancing quote is a quote the reader has to outrun. The consequence is
 * that a reader who wants more quotes scrolls, and a product with twenty
 * testimonials ships a `pair` twice or a page of them rather than a control. That
 * is a real cost: a carousel is shorter, and this is a Block that cannot be made
 * shorter. The rejected alternative was a manual carousel, which is the same
 * component with the motion taken out and the truncation left in.
 *
 * **The count must match the form, and it throws rather than truncating.** See
 * `Testimonial01Props.quotes`. `format="single"` with three quotes would render one
 * of them and drop two, and a dropped testimonial is a product that decided a
 * reader was not meant to read it.
 *
 * It is a server Component: no hook, no state and no client code of its own. It
 * composes `Avatar`, which ships its own client directive, so a consumer who
 * passes no `avatar` pays for nothing.
 */
export function Testimonial01({
  eyebrow,
  title,
  description,
  quotes,
  format = 'single',
  headingLevel = 'h2',
  className,
}: Testimonial01Props) {
  const wanted = format === 'pair' ? 2 : 1
  if (quotes.length !== wanted) {
    throw new Error(
      `Testimonial01: format is '${format}', which takes ${wanted} quote(s), and ${quotes.length} were ` +
        'passed. A testimonial that quietly drops the ones past the count is a product deciding a reader ' +
        'was not meant to read them, so the mismatch is refused rather than truncated.',
    )
  }

  // The person quoted is the section's child title, for the reason the JSDoc gives:
  // a reader navigating by heading should reach the name as well as the words.
  const AttributionName = childLevel(headingLevel)

  return (
    <Section>
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

      <div
        data-slot="testimonial"
        data-format={format}
        className={cn(
          'grid gap-6',
          format === 'pair' ? 'lg:grid-cols-2' : 'max-w-measure',
          className,
        )}
      >
        {quotes.map((entry) => (
          <Quote key={entry.id} {...entry} Name={AttributionName} />
        ))}
      </div>
    </Section>
  )
}

export default Testimonial01
