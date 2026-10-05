import type { ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
import { CtaLink } from '../../components/ui/cta-link'
import { Heading, Text } from '../../components/ui/typography'
import { Prose } from '../../components/ui/prose'
import { Section, headingSizeClass } from '../../components/ui/section'

/**
 * One tag on a post, or one step in the trail to the next one.
 *
 * `href` is optional and a tag without one renders as text. A tag that goes
 * somewhere is a link, a tag that does not is a word, and a post's tags are
 * usually the words.
 */
export type BlogPostTag = {
  /** The word on the tag. */
  label: string
  /** Where the tag goes, for a tag that filters an archive. */
  href?: string
}

/**
 * One neighbour of this post: the title and where it is.
 *
 * `title` and `href` are both required. A next post with no title is an arrow
 * with a destination and no promise about what is at the other end, which is the
 * one thing a reader deciding whether to click cannot afford.
 */
export type BlogPostNeighbour = {
  /** The post's title. */
  title: string
  /** Where the post is. */
  href: string
}

/**
 * The two words the trail renders above the neighbouring posts' titles.
 *
 * Both are required, and both are the caller's: "Previous" and "Next" are this
 * Page's own phrasing, a site that files posts newest-last says the opposite pair,
 * and a Page that ships no copy ships no reader-facing copy either.
 */
export type BlogPostTrailLabels = {
  /** The word above the previous post's title. */
  previous: string
  /** The word above the next post's title. */
  next: string
}

/**
 * The props a BlogPostPage takes.
 *
 * The post's own text is `children`, because a post's body is authored wherever it
 * is authored - a Markdown file, a CMS, a headless store - and Prism owns the
 * measure and the rhythm around it, not the words. Everything that is a *fact*
 * about the post rather than its text is a prop: the title, the standfirst, the
 * date, the tags and the neighbours.
 */
export type BlogPostPageProps = {
  /**
   * The post's title. It is the page's `h1`, so the page has exactly one and it
   * is the post's name.
   */
  title: string
  /**
   * The standfirst: one or two sentences under the title that say what the post
   * is about. It is a prop rather than the first paragraph of the body because a
   * reader deciding whether to read needs it before the body starts, and because
   * it is what an index, a feed and a search result show.
   */
  description?: string
  /**
   * The publication date as a reader reads it: already formatted, in words, in
   * whatever convention the publishing site writes dates in. The Page renders this
   * string verbatim and never touches it, and **it is the caller's to format**.
   *
   * It is a separate prop from `dateTime` precisely so the two can differ, and
   * passing one value to both is refused rather than rendered: see the component
   * JSDoc below for why the Page will not show a reader a machine date.
   */
  date: string
  /**
   * The date in a machine-readable form, `YYYY-MM-DD`, carried on the `time`
   * element. Required, and deliberately not derived from `date`: parsing a
   * formatted date back into an ISO one is a guess about a locale, and a guess in
   * a `datetime` attribute is a wrong date in a feed.
   *
   * Typed as the shape it is rather than as `string`, so a formatted string
   * passed here is a compile error instead of a `datetime` attribute no reader can
   * check.
   */
  dateTime: `${number}-${number}-${number}`
  /** Who wrote the post. A name, or a link to an author page. */
  author?: ReactNode
  /**
   * The tags on the post, in the order a reader should meet them. Omit them for a
   * post with none: an empty row of badges is a row of nothing.
   */
  tags?: readonly BlogPostTag[]
  /** How long the post takes to read, in the consumer's own words. */
  readingTime?: string
  /**
   * The post's body. Any flow content: paragraphs, headings, lists, code, images,
   * tables. `Prose` holds it to the reading measure and to the block rhythm.
   */
  children: ReactNode
  /**
   * The post before this one and the post after it, for the trail at the foot of
   * the page. Omit the half there is no neighbour for; a "previous" link with no
   * previous post is a link to nothing.
   */
  previous?: BlogPostNeighbour
  next?: BlogPostNeighbour
  /**
   * The two words the trail renders above the neighbouring posts' titles. Required
   * whenever either neighbour is passed, because they are words a reader reads and
   * a Page that ships no copy ships no reader-facing copy either.
   */
  trailLabels: BlogPostTrailLabels
  /**
   * The accessible name of the trail between the neighbouring posts. It is
   * required whenever either neighbour is passed, because it is a word a reader
   * hears and a Page that ships no copy ships no reader-facing copy either. "More
   * posts" is the Page's own phrasing and a site that files posts by release calls
   * the same landmark something else.
   */
  trailLabel: string
  /**
   * The way back to the archive the post is filed in, rendered as one call to
   * action under the trail. A prop rather than a hardcoded "back to the index",
   * because the words and the route belong to the site that publishes the post
   * and a Page that held either would be a Page making a claim about a consumer's
   * own site.
   */
  indexLink?: BlogPostNeighbour
  /**
   * A slot for what comes after the trail: a related-posts grid, a newsletter
   * form, a call to action. A slot rather than a prop because every one of those
   * is a Block, and a Page that took a Block per prop would be a Page whose
   * interface lists the whole catalogue.
   */
  footer?: ReactNode
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A complete blog post screen: the title, the standfirst, the byline, the body at
 * the measure, and the trail to the neighbouring posts.
 *
 * All four NaniSoft sites publish a blog, each with four posts and the same
 * frontmatter: a title, a description, a date and a list of tags. Each one then
 * rendered that frontmatter in its own component, with its own wrapper, its own
 * measure and its own treatment of the date, and each of them wrote the trail to
 * the neighbouring posts separately or not at all.
 *
 * It is a Page rather than a Block because it is a whole screen and it is the
 * screen a content pipeline targets: a route that reads one document and hands
 * its frontmatter to this Page. The Page is what makes the frontmatter a
 * contract, because a field that is not a prop is a field nothing checks.
 *
 * **The date is two props, and the Page will not collapse them into one.** `date`
 * is the words a reader sees and `dateTime` is the machine value on the `time`
 * element, and they are kept apart because parsing a formatted date back into an
 * ISO one is a guess about a locale. A wrong date in a `datetime` attribute is a
 * wrong date in a feed reader and in a search result, and neither reader can see
 * the string that was wrong.
 *
 * The other half of that is the one this Page now refuses. A Page that renders a
 * date has no business making a reader parse `2026-09-26`, and the Page is the
 * only place in a site where that sentence can be enforced rather than requested,
 * because a consumer's own pipeline is where the date is a string and Prism is
 * where it becomes a page. So `date` is the caller's to format, and handing this
 * Page the same string in both slots is refused at render rather than shipped:
 * all four NaniSoft sites did exactly that, because a prop called `date` taking a
 * string is not obviously wrong, and the defect is invisible to every reviewer who
 * does not open the page. `StackGrid01` refuses its own missing `ownLabel` for the
 * same reason and by the same mechanism. The refusal is on the pair, not on the
 * shape of either value: a site whose own convention writes dates as `2026-09-26`
 * has the machine value on the element already, in the `datetime` attribute and in
 * every feed, so displaying it a second time is a redundancy rather than a
 * choice, and the `description` and `footer` slots are there for anything else the
 * page wants to say about the post.
 *
 * The body is `children` and it is held by `Prose`, not by a set of per-element
 * props. A post's body is authored somewhere else - a Markdown pipeline, a CMS -
 * and a Page that took `paragraphs` and `headings` as arrays would be a Page that
 * had to be handed a parsed document, which is a second representation of
 * something the consumer's own pipeline already owns.
 *
 * The trail is one `nav` with two links, and it renders only the halves it is
 * given. A previous link on the oldest post is a link to the first post a reader
 * has already read, and a next link on the newest is a promise the site cannot
 * keep.
 *
 * It is a server Component. It fetches nothing, it holds no state and it imports
 * no router, so a consumer renders it from a server route and hands it the
 * document their pipeline produced.
 */
export function BlogPostPage({
  title,
  description,
  date,
  dateTime,
  author,
  tags,
  readingTime,
  children,
  previous,
  next,
  trailLabels,
  trailLabel,
  indexLink,
  footer,
  className,
}: BlogPostPageProps) {
  // The one input this Page refuses, and the reason it is a refusal rather than a
  // note in a JSDoc block. A JSDoc block is read by whoever is integrating Prism
  // and by an agent reading the corpus; this line runs in the four consumer
  // repositories the next time one of them builds, which is the only place the
  // string that was wrong could still be changed.
  if (date === dateTime) {
    throw new Error(
      'BlogPostPage: `date` and `dateTime` are the same string, so the Page has been handed no ' +
        'display formatting and would put a machine value in front of a reader. `date` is the words ' +
        'a reader sees and `dateTime` is the machine value on the `time` element; format `date` for ' +
        'display and pass the ISO date as `dateTime`.',
    )
  }
  return (
    <Section className={className}>
      <article data-slot="blog-post" className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <Heading as="h1" className={headingSizeClass('h1')}>
            {title}
          </Heading>
          {description ? (
            <Text size="lg" className="text-muted-foreground max-w-measure">
              {description}
            </Text>
          ) : null}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {author ? <span className="text-foreground font-medium">{author}</span> : null}
            <time dateTime={dateTime}>{date}</time>
            {readingTime ? <span>{readingTime}</span> : null}
          </div>
          {tags && tags.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <li key={tag.label}>
                  {tag.href ? (
                    <a
                      href={tag.href}
                      className="rounded-sm"
                      aria-label={`Posts tagged ${tag.label}`}
                    >
                      <Badge variant="secondary">{tag.label}</Badge>
                    </a>
                  ) : (
                    <Badge variant="secondary">{tag.label}</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <Prose>{children}</Prose>

        {previous || next ? (
          <nav
            aria-label={trailLabel}
            className="border-border grid gap-4 border-t pt-6 sm:grid-cols-2"
          >
            {previous ? (
              <a href={previous.href} className="flex flex-col gap-1 rounded-sm">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {trailLabels.previous}
                </span>
                <span className="text-sm font-semibold">{previous.title}</span>
              </a>
            ) : null}
            {next ? (
              <a
                href={next.href}
                className="flex flex-col gap-1 rounded-sm sm:items-end sm:text-right"
              >
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {trailLabels.next}
                </span>
                <span className="text-sm font-semibold">{next.title}</span>
              </a>
            ) : null}
          </nav>
        ) : null}

        {footer ? <div className="border-border border-t pt-8">{footer}</div> : null}
      </article>

      {indexLink ? (
        <div className="mt-10 flex justify-center">
          <CtaLink href={indexLink.href} variant="outline">
            {indexLink.title}
          </CtaLink>
        </div>
      ) : null}
    </Section>
  )
}

export default BlogPostPage
