import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The two steps a star readout is drawn at, as frame and figure together.
 *
 * The pair moves as one because a readout is a figure with a unit attached to it
 * and the two are read as one sentence: a count at the `sm` step beside a noun
 * at the `md` step is a count and a caption, and a reader scanning a page of them
 * sees the numbers at one height and the nouns at another. `sm` is for a footer,
 * a table row and a card description, and `md` is for a card header and a page
 * header. There is no third step because a star count is never the headline
 * figure of a page, and a Component that could be drawn at the title step would
 * be a Component asking to be the thing it annotates.
 */
const REPO_STARS_SIZE = {
  sm: 'items-center gap-1 text-xs',
  md: 'items-center gap-1.5 text-sm',
} as const

/**
 * The two steps a star readout is drawn at.
 *
 * @defaultValue 'md'
 */
export type RepoStarsSize = keyof typeof REPO_STARS_SIZE

/** The props a RepoStars accepts. */
export type RepoStarsProps = {
  /**
   * The number of stars, exactly as the host reported it.
   *
   * Required, and a `number` rather than the formatted string for the reason the
   * whole `format` argument is about: a count is a fact the host owns, and a
   * Component that accepted a string would be accepting a rendering and calling
   * it a fact. A count nobody has fetched yet is a consumer's problem and not a
   * Component's, and a `null` is refused by the type rather than drawn as a zero
   * that nobody earned.
   */
  count: number
  /**
   * The noun the count carries, and where the repository is named when the
   * surrounding surface does not name it.
   *
   * Required, and required as a `string` because it is the whole of what the
   * readout says about itself: a number beside no unit is a number the reader has
   * to guess the meaning of, which is the one thing a headline figure cannot
   * afford, and it is the same argument `Metric` makes about its own label. It is
   * also where the repository goes when a link's accessible name would otherwise
   * not say where the link leads, so a caller on a page that names the repository
   * already writes "stars" and a caller on a page that does not writes "stars on
   * this repository". The words are the consumer's, in their own language.
   */
  label: string
  /**
   * The host's own mark, passed in and never drawn by this package.
   *
   * Required, and a slot rather than an asset, for the reason the package states
   * everywhere it has a mark to fill: Prism's icon lane is Lucide, and Lucide has
   * no repository host in it. A host's mark is a licensed trademark with rules
   * governing its clear space, its colour, its minimum size and its use on a third
   * party's surface, and a package that shipped one would be shipping an asset it
   * was not entitled to and that is out of date the moment the host redraws it.
   * So the space is here and the frame around it is a size and a clip and nothing
   * else, so a consumer's vector mark and a consumer's raster asset come out the
   * same height whichever they pass.
   *
   * Required rather than optional, and that is a decision with a cost. A readout
   * with no mark beside it is a number and a noun and nothing saying which host
   * they are about, so the mark is what makes the number mean what it claims to.
   * The cost is that a consumer hosting their own repository, with no third party
   * brand to point at, has no mark to pass and so has no use for this Component:
   * the honest answer for them is a `Metric`, which is a figure that needs no
   * host.
   */
  mark: ReactNode
  /**
   * The words the count is drawn through, given the count.
   *
   * Optional, and there is no default that abbreviates, because "1.2k" is two
   * decisions rather than one. It is a locale, because the compact form a reader
   * expects in English is not the one a German or a Japanese reader expects, and
   * it is a judgement, because a count of 1,204 reads as a large project on a
   * repository page and as a rounding error beside a funding total, and only the
   * consumer knows which page it is on. So the number is printed exactly as
   * given when this is absent, which is honest and usually not what was wanted
   * for a six figure count, and a consumer who wants grouping or a compact form
   * passes the formatter that has it.
   *
   * **`Intl` is deliberately not the fallback.** A server-rendered figure
   * formatted in the runtime's own locale is a figure that changes when the
   * deployment region changes, and a number that reads "1,204" in one build and
   * "1.204" in another is a number two readers were told different things about.
   * The fallback is `String(count)`, which is what `Metric` prints for a delta
   * with no formatter, and it has the same property: the same bytes everywhere.
   */
  format?: (count: number) => string
  /**
   * Where the readout leads, when the reader may follow it.
   *
   * Optional, and a plain `href` rather than a router link, because this package
   * imports no router and a Page is what a consumer's router renders. With it
   * the mark, the count and the noun are one thing to follow rather than three
   * things to read, and the whole readout is the anchor's hit area. Without it the
   * readout is a span, and that is a legitimate state rather than a missing prop:
   * a page footer that reports a project's popularity is reporting it, and
   * offering a link there invites a reader off a page they are reading.
   */
  href?: string
  /** The drawn step, as frame and figure together. @defaultValue 'md' */
  size?: RepoStarsSize
  /**
   * The span's own props are forwarded. `children` is removed because the
   * readout draws its own content and a caller who passed any would be reaching
   * past the count.
   */
} & Omit<ComponentProps<'span'>, 'children'>

/**
 * The two halves of a readout, drawn once for the span and once for the anchor.
 *
 * A part rather than an Item, and it stays inside this module: DESIGN.md's
 * authoring contract says compound parts ship from their parent module and do
 * not form a second vocabulary, so this is a module-local function and not a
 * fourth export. It exists because the mark has to sit inside the anchor when
 * there is one, so that the whole readout is the hit area rather than the figure
 * with a dead mark beside it, and writing the two spans twice is two places to
 * change them.
 */
function StarBody({ mark, figure, className }: { mark: ReactNode; figure: string; className: string }) {
  return (
    <>
      {/*
       * The frame is on the slot and the clip is on the frame rather than on the
       * mark, so a consumer who passes an SVG with its own clear space keeps it
       * and a consumer who passes something too wide gets it cropped rather than
       * shrunk. The mark is left in the accessibility tree: a licensed asset may
       * be the only thing on the readout that says which host this is, and hiding
       * the slot would make the consumer's own `alt` unreachable. A consumer
       * whose mark really is decoration passes an `aria-hidden` image and decides
       * that for itself, which is the only party that knows.
       */}
      <span data-slot="repo-stars-mark" className="flex size-4 shrink-0 items-center justify-center">
        {mark}
      </span>
      {/*
       * The number and its noun are one text run rather than two elements,
       * because the accessible name of a link is the concatenation of its
       * contents and a layout gap between two spans is not a space: two spans
       * would be announced as "1,204stars", and one run is announced as "1,204
       * stars" because there is a space in it.
       */}
      <span data-slot="repo-stars-figure" className={cn('min-w-0 truncate font-medium tabular-nums', className)}>
        {figure}
      </span>
    </>
  )
}

/**
 * How many people starred a source repository, beside the host's own mark.
 *
 * **The mark is a slot and the reason is a licence, not a preference.** Prism's
 * icon lane is Lucide, and Lucide draws interface glyphs rather than other
 * companies' trademarks, and a repository host's mark is a licensed asset with
 * rules about its clear space, its colour, its minimum size and where it may
 * appear. A package that shipped one would be distributing an asset it does not
 * own, and it would be wrong within a year as hosts redraw. So the consumer passes
 * the mark and this Component draws the frame around it. The cost is stated
 * rather than hidden: a consumer who wants the readout in an afternoon has to
 * source the mark, and a consumer with no host to point at cannot use this
 * Component at all.
 *
 * **The count is printed by a callback and the fallback is the bare number.**
 * There is no `Intl` default and the omission is the decision, for the reason
 * `format` states: a compact count is a locale and a judgement, and a figure
 * formatted in the runtime's locale changes when the deployment region changes.
 * The visible cost is that a consumer with a six figure count and no formatter
 * draws all six digits, which is honest and wider than they wanted.
 *
 * **There is no navigation region and no landmark, and the reason is that a
 * count is not a place.** A `<nav>` is a set of routes and this is one figure
 * beside a mark, so the readout renders a span or an anchor and nothing else. A
 * consumer who puts one inside their own `<nav>` has made a claim about their own
 * page that Prism neither makes nor checks, and the `href` is the consumer's to
 * resolve: this Component validates nothing about it, and the package is router
 * free and transport free by design.
 *
 * **A link here is an anchor, so there is no `target` and no `rel`.** Both belong
 * to the anchor and the anchor is inside the readout, and an anchor-shaped root
 * that changed element with `href` would put `rel` and `target` onto a `span` on
 * every readout that has no link, which is invalid markup for a control Prism
 * did not draw. A consumer who needs a new tab or a referrer policy writes their
 * own anchor around the readout, which is one element and keeps every class here.
 *
 * **The link's ink is `brand-ink` and the readout's is `foreground`, and that
 * split is DESIGN.md's Brand Ink Rule rather than a preference.** A readout that
 * is not a link is a figure and takes the page's ink. A readout that is a link
 * has to read as something a reader may follow, and the token gate measures
 * `brand-ink` at 4.5:1 against the page, a card and the accent surface in both
 * modes of all six sources. The focus ring is drawn at full strength on the
 * anchor rather than left to the browser, so the indicator this Component owns
 * is the indicator the gate can check.
 *
 * **It is a server Component, and the reason is that everything it draws is
 * decided from props.** No hook, no state, no effect, no handler and no directive,
 * so a page with four star readouts ships no JavaScript for them at all. The
 * consequence worth stating is the one a reader would otherwise have to work out:
 * with no `href` there is no interaction, and with one the only behaviour is the
 * browser's own navigation, so there is nothing this Component could need a client
 * runtime to do. The cost is that a consumer who wants the count to refresh
 * itself is reaching for a `live` surface and a subscription Prism does not own.
 */
function RepoStars({
  count,
  label,
  mark,
  format,
  href,
  size = 'md',
  className,
  ...props
}: RepoStarsProps) {
  const shown = format === undefined ? String(count) : format(count)
  const figure = `${shown} ${label}`

  return (
    <span data-slot="repo-stars" className={cn('inline-flex max-w-full', className)} {...props}>
      {href === undefined ? (
        <StarBody mark={mark} figure={figure} className={cn(REPO_STARS_SIZE[size], 'text-foreground')} />
      ) : (
        <a
          data-slot="repo-stars-link"
          href={href}
          className={cn(
            REPO_STARS_SIZE[size],
            'hover:underline focus-visible:ring-ring inline-flex min-w-0 rounded-sm underline-offset-2 outline-none focus-visible:ring-[3px]',
          )}
        >
          <StarBody mark={mark} figure={figure} className="text-brand-ink" />
        </a>
      )}
    </span>
  )
}

export { RepoStars }
