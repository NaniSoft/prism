import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One downloadable artefact: what it is, what shape it is, how big it is, what it
 * hashes to, and where it goes.
 *
 * **`href` and `hrefLabel` are both required, and the second one is the reason
 * this type is not a set of optional fields.** A download link whose accessible
 * name is the file's name tells a screen reader user nothing about what activating
 * it will do: they hear "token-contract.css, link" and the two facts they needed
 * are the destination and the fact that a transfer is about to start, and the
 * second of those is the one that decides whether they press it on a metered
 * connection. "Download" is the word that tells them, so `hrefLabel` is required
 * rather than defaulted, and the words are the caller's because a product whose
 * interface says "Get" or "Fetch" has no way to override a default it cannot see.
 *
 * **`size` is a number of bytes and `formatSize` carries the ladder, and the
 * precedent is `FileUploadFile`'s, named here rather than reinvented.** A caller
 * that hands over "1.2 MB" has done the division, picked a unit, decided the
 * rounding and written a separator, and has to do all four again in every locale
 * the product ships in and in every language. The number is a fact about the file
 * and the sentence is the consumer's. `FileUpload` states that at length and then
 * carries a default that asks `Intl` for the number and its unit, so the grouping
 * separators and the unit spelling are the reader's, because "kB" in one language
 * is "Ko" in another and "KB" in a third.
 *
 * **There is no default formatter here, and that is a decision with a cost stated
 * rather than hidden.** `FileUpload` can carry one because it is a Component and
 * the ladder lives in the module that owns the row. This is a Block, it composes
 * no Component that exports a formatter, and copying `FileUpload`'s ladder into a
 * second module would put byte formatting in two places in one package, which is
 * the exact shape of defect the token law exists to prevent. So `formatSize` is
 * required whenever `size` is, the run fails without it, and the honest cost is
 * that a consumer who wants a formatted size has to reach for the formatter rather
 * than inherit it. The message names `FileUpload` and the alternative, so a caller
 * who wants the default has one function to import and one line to write.
 *
 * **A checksum renders in the mono face beside the size, and a Block does not
 * compute one.** A checksum is a fact about bytes, and the bytes this Block has are
 * a string of source code in a file it does not read: hashing that string would be
 * hashing the wrong thing, because the artefact a reader downloads is a build
 * output, a generated file, a tarball of a hundred files, or a signed binary, and
 * none of those is the string the caller passed in as `name` and `format`. A Block
 * that computed a digest and printed it would be printing a claim about a file the
 * reader has never seen, and a reader who checked it would find a mismatch and
 * conclude the library was wrong, which is the right conclusion for the wrong
 * reason. So the value is the caller's, and it came from the build that made the
 * artefact.
 *
 * **`format` is a word and `checksum` is a hex string, and they are set
 * differently on purpose.** A format is something a reader scans for: "PDF",
 * "CSV", "gz" are three marks that a reader recognises without reading them, and
 * the mono face is the face this repository annotates machine-readable values
 * with, so it is machine notation. A checksum is the same face and the same
 * reason, and it is the only place in this package where a long unbroken run of
 * characters is a thing a reader is meant to read, which is why it is truncated
 * rather than wrapped and why a caller who wants the whole digest has a `note`.
 */
export type Download01File = {
  /** The artefact's stable key within the set. */
  id: string
  /**
   * The artefact's own name, as its authors spell it. It is the row's title, so
   * it is a heading one step below the section.
   */
  name: string
  /**
   * The shape of the artefact, in whatever form the caller's own set uses it.
   *
   * Optional, and its absence draws no line rather than an empty one: a set where
   * every artefact is the same shape has said that in its heading.
   */
  format?: string
  /**
   * The artefact's size, in bytes.
   *
   * A number and not a formatted string, and the difference is the whole
   * interface. See `formatSize` on this type, and `FileUploadFile`'s `size` for
   * the argument at length.
   */
  size?: number
  /**
   * Renders this artefact's `size` as the sentence a reader sees.
   *
   * Required whenever `size` is, and the run fails without it, because a bare
   * number in a row with no column header above it is a count with no unit and a
   * reader cannot use it. `FileUpload` carries a default that asks `Intl` for the
   * number and its unit in the runtime's own locale, so a caller who wants that
   * behaviour passes that function, and a caller who wants a fixed locale, a
   * different base or a fourth rung passes their own.
   *
   * It is per artefact rather than one formatter for the set, and the reason is
   * that a downloads list is very often a mixed set: a byte count for a tarball, a
   * page count for a guide, a record count for a dataset, and one formatter on
   * the Block would have to be told to handle all three. The cost is that a caller
   * who wants one formatter for eleven files writes it eleven times, and the
   * honest answer is that they hold it in a variable and pass the variable.
   */
  formatSize?: (bytes: number) => string
  /**
   * The digest of the artefact, as the build that made it printed it.
   *
   * Rendered verbatim beside the size, in the mono face, and never computed here.
   * See this type's JSDoc for why hashing this Block's own input would be hashing
   * the wrong bytes.
   */
  checksum?: string
  /** Where the artefact goes. Required, because this is a list of downloads. */
  href: string
  /**
   * The words on the download control, and required.
   *
   * Never the artefact's own name. See this type's JSDoc for what a screen reader
   * user is missing when a link's name is the file's name.
   */
  hrefLabel: string
  /**
   * A line under the row, for what a reader needs before they press it: a licence,
   * a retention window, a note that the file is regenerated nightly.
   *
   * A node, because a licence is a link and a retention window is a sentence and
   * a regeneration notice is a `RelativeTime` beside a word, and the three are not
   * one shape.
   */
  note?: ReactNode
}

/**
 * How the artefacts are drawn: full-width rows or a grid of cards.
 *
 * **The type is `Download01Form` and the prop is `variant`, and the two names
 * differing is the surface gate working rather than a slip.**
 * `check-surface.mjs` refuses to let a public entry export a name ending in
 * `Variant`, because in this package that shape names a cva map: a recipe a
 * consumer could read and compose with. This union is the two arrangements the
 * Block can draw and it is named for the arrangement. The prop keeps the name
 * `variant` because a Component is allowed to take one. `ChartForm` and
 * `ContentGrid01Form` are named the same way for the same reason.
 */
export type Download01Form = 'list' | 'cards'

/** How many cards fit across, for the card arrangement only. */
export type Download01Columns = 2 | 3

/**
 * The tracks a grid of artefacts gets.
 *
 * Spelled out per count so a grid has exactly as many tracks as it declared and
 * not one empty at the end of a row. The `sm:` step is a narrowing rather than a
 * widening, because a three-up row of file names, formats and digests at phone
 * width is three columns of two words each.
 */
const TRACKS: Record<Download01Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * The props a Download01 takes.
 *
 * Every string is a prop and the Block ships none: no file name, no format, no
 * size, no checksum, no note and not one word on a download control. A Block that
 * shipped a download button labelled "Download" would put English into every
 * consumer's page, and a Block that shipped a list of artefacts would be a
 * downloads page about somebody else's build output.
 */
export type Download01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Not optional as the other Blocks' titles are, because a list of downloads with
   * no name above it is a column of file names a reader has to be told is a
   * downloads column, and the artefact names alone are often indistinguishable
   * from one another.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The artefacts, in the order a reader should meet them.
   *
   * Order is the caller's, and the Block does not sort by name, by size or by
   * date: a downloads list is very often already in the order a build produced and
   * the most recent release belongs at the top rather than at the letter D.
   */
  files: Download01File[]
  /**
   * How the set is drawn.
   *
   * @defaultValue 'list'
   *
   * `list` is the default because a download row carries four facts beside the
   * name and a row is the only arrangement that gives them a line each, and
   * `cards` is for a set of two or three large artefacts, such as a report and its
   * data, where the name and the note are longer than the digest.
   */
  variant?: Download01Form
  /**
   * How many cards sit on one line in the `cards` variant. Ignored by `list`,
   * which has one artefact per line by definition.
   *
   * @defaultValue 2
   */
  columns?: Download01Columns
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The annotation line on one artefact: the format, the size and the digest.
 *
 * Drawn only when there is at least one of the three, for the same reason
 * `ContentGrid01`'s annotation line is: a row with a reserved line for a format
 * nobody passed is a list whose names sit at two different heights.
 */
function FileMeta({ file }: { file: Download01File }) {
  if (file.format === undefined && file.size === undefined && file.checksum === undefined) {
    return null
  }

  return (
    <div
      data-slot="download-meta"
      className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
    >
      {file.format ? (
        <span data-slot="download-format" className="font-mono">
          {file.format}
        </span>
      ) : null}
      {file.size !== undefined && file.formatSize !== undefined ? (
        <span data-slot="download-size" className="font-mono">
          {file.formatSize(file.size)}
        </span>
      ) : null}
      {file.checksum ? (
        <span data-slot="download-checksum" className="font-mono">
          {file.checksum}
        </span>
      ) : null}
    </div>
  )
}

/**
 * A list of downloadable artefacts: a name, a format, a size, a digest, a note and
 * a control whose name is the caller's.
 *
 * **Every artefact has a control and the control has the caller's words on it,
 * and that is what the type is built around.** A downloads list without a control
 * per row is a table of file names, and the action a reader came for is one click
 * they have to guess at. `hrefLabel` is required beside `href` rather than beside
 * the type, so a caller cannot pass one without the other, and the reason is a
 * specific thing a screen reader user is not told: a link named after its file
 * gives them the destination and not the consequence, and on a metered connection
 * the consequence is the fact that decides whether they press it. The words are
 * the caller's rather than a default because a product whose interface says "Get"
 * or "Fetch" cannot override a default it never sees.
 *
 * **`formatSize` is required whenever `size` is, and the run fails without it
 * rather than printing a bare number.** The precedent is `FileUploadFile`'s and
 * the ladder is `FileUpload`'s: a number of bytes is a fact about the artefact and
 * a formatted size is a sentence in a locale, and a caller who has already done
 * the division has to do it again in every language the product ships in. What is
 * different here is that no default is carried, and the reason is one source of
 * truth: `FileUpload` owns a ladder in the module that owns its row, and copying
 * that ladder into a second module in the same package would be byte formatting
 * in two places, which is the shape of defect the token law exists to prevent. The
 * cost is real, and it is that a consumer who wants the default formatter writes
 * the line rather than inheriting it. The diagnostic names the Component and the
 * function, so the fix is one import and one line rather than a search.
 *
 * **A checksum is drawn and never computed, and the argument is about which bytes
 * a digest is a fact about.** This Block holds a name, a format, a byte count and
 * a URL. The artefact a reader downloads is a build output: a tarball of a
 * hundred files, a generated CSS bundle, a signed binary, a zip with a manifest in
 * it. None of those is the string this Block was handed, so a digest computed here
 * would be a digest of nothing the reader can obtain, and a reader who checked it
 * against the file they downloaded would find a mismatch and conclude the library
 * was wrong. Which is the right conclusion for the wrong reason, and the worst
 * outcome available. So the digest travels as a prop, from the build that made the
 * artefact, and this Block's job is to set it in the mono face beside the size so
 * a reader can see the two facts that belong together and copy the one they need.
 *
 * **The size and the digest are on the annotation line and the name is the
 * heading, in both variants.** An artefact's name is what a reader is looking for
 * and it is a heading one step below the section, derived rather than written, so
 * a Block embedded one level deeper carries its names with it. Everything else is
 * an annotation: a format, a size, a digest and a note, all in the muted face or
 * the mono face, all in a line that is allowed to wrap and is never a heading. A
 * long digest is truncated by the mono face's own overflow rather than wrapped,
 * because a digest wrapped across two lines is a digest nobody can select and
 * check, and a caller who needs the whole one in the text has `note`.
 *
 * **The two variants draw the same tree, not two.** The name, the annotation line,
 * the note and the control are the same elements in the same order in both; the
 * arrangement is carried by the classes on the `li` and the `ul`. Two trees would
 * have put every artefact in the accessibility tree twice.
 *
 * It is a server Component: no hook, no state and no client code. A caller who
 * wants a `RelativeTime` beside a note composes it there, and a caller who wants a
 * copy control for a digest composes it there too, which is the arrangement a
 * `ReactNode` slot exists for.
 */
export function Download01({
  eyebrow,
  title,
  description,
  files,
  variant = 'list',
  columns = 2,
  headingLevel = 'h2',
  className,
}: Download01Props) {
  // An artefact's name is a heading one step below the section that introduces the
  // set, so a reader navigating by heading meets the artefacts under the section
  // rather than as siblings of it.
  const Title = childLevel(headingLevel)
  const asCards = variant === 'cards'

  // Checked before anything is drawn, so the run fails once with the name of the
  // field rather than once per artefact with a row that shows a bare number.
  for (const file of files) {
    if (file.size !== undefined && file.formatSize === undefined) {
      throw new Error(
        `Download01: the artefact "${file.name}" passed a size with no formatSize, so the row would print a bare ` +
          'number, and a number with no unit and no column header above it is a count a reader cannot use. Pass a ' +
          'formatSize, or pass a preformatted size and leave the byte count out. FileUpload carries the default ' +
          'that asks the platform for the number and its unit in the reader own locale, and its formatSize is the ' +
          'one to pass here.',
      )
    }
  }

  if (files.length === 0) return null

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-12"
      />

      <ul
        data-slot="download-list"
        data-variant={variant}
        className={cn(asCards ? 'grid gap-4' : 'flex flex-col', asCards && TRACKS[columns], className)}
      >
        {files.map((file) => {
          const control = (
            <CtaLink href={file.href} variant="outline" size="sm" className="self-start">
              {file.hrefLabel}
            </CtaLink>
          )

          return (
            <li
              key={file.id}
              data-slot="download-item"
              className={cn(asCards && 'h-full', !asCards && 'border-border border-t pt-4 first:border-t-0')}
            >
              {asCards ? (
                <Card className="h-full gap-3 py-5">
                  <CardHeader className="gap-2">
                    <FileMeta file={file} />
                    <CardTitle className="text-sm leading-snug">
                      <Title>{file.name}</Title>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {file.note ? (
                      <div data-slot="download-note" className="text-muted-foreground text-pretty text-sm">
                        {file.note}
                      </div>
                    ) : null}
                    {control}
                  </CardContent>
                </Card>
              ) : (
                <div
                  data-slot="download-row"
                  className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <FileMeta file={file} />
                    <Title className="text-sm font-semibold">{file.name}</Title>
                    {file.note ? (
                      <div data-slot="download-note" className="text-muted-foreground text-pretty text-sm">
                        {file.note}
                      </div>
                    ) : null}
                  </div>
                  <div data-slot="download-aside" className="flex shrink-0 items-center">
                    {control}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export default Download01
