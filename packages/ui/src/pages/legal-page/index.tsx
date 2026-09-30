import type { ReactNode } from 'react'

import { Prose } from '../../components/ui/prose'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Text } from '../../components/ui/typography'
import { cn } from '../../lib/utils'

/**
 * One legal document: what it is called, where it lives, and optionally the line
 * a reader needs to decide whether to open it.
 *
 * `selected` is the caller's decision and not a state this Page infers. A Page
 * cannot know which document its `body` holds, because the body is an opaque node
 * the caller composed, so the caller marks the one that is showing. The Page draws
 * the mark and refuses to derive it, and the reason is the same one
 * `Team01` gives for `highlight`: a border or a weight that follows a position
 * moves to a different document after a reorder, and a mark that says "you are
 * here" is a claim about where the reader is.
 */
export type LegalPageDocument = {
  /** A stable key for the row, and not the document's title. */
  id: string
  /** The document's own name, as the document is titled. */
  title: string
  /** Where the document lives on its own route. Omit it for the one being shown here. */
  href?: string
  /** The line under the name, for a reader choosing between six documents. */
  summary?: ReactNode
  /**
   * Marks this document as the one in the body.
   *
   * At most one should be marked. Two marked documents say the reader is in two
   * places, which is the one state `aria-current` cannot represent.
   */
  selected?: boolean
}

/**
 * The props a LegalPage takes.
 *
 * Every string is a prop and the Page ships none. A legal screen is the screen
 * where a sentence is a promise, and this package is not entitled to write one: a
 * Page that hardcoded a "last updated" line or a list of document names would put
 * one company's legal position into every product that installs it, and a legal
 * page is the last page on a site where a wrong sentence is a real problem.
 */
export type LegalPageProps = {
  /**
   * The page's heading.
   *
   * Required, and the Page draws it itself. A legal screen whose heading were
   * inside the body would lose its `h1` in every state where the body is not
   * passed, and a route whose heading is a sentence in the middle of a document is
   * a route a search engine and a screen reader both handle badly.
   */
  title: ReactNode
  /**
   * When the selected document last changed, already written the way a reader
   * should see it.
   *
   * A string, because Prism formats no date and a `Date` here would push the
   * locale and the calendar onto every consumer. A bare date under a page heading
   * reads as the date the page was published, which is a different fact, so it is
   * never drawn without `updatedLabel`.
   */
  updatedAt?: string
  /**
   * The words that say what the date is.
   *
   * Required whenever `updatedAt` is, and enforced rather than documented: a bare
   * date under a legal heading is read as the date the document was published
   * rather than the date it was last changed, and those two are the pair a reader
   * is checking.
   */
  updatedLabel?: string
  /**
   * The documents, in the order a reader should meet them.
   *
   * Order is the caller's because it is a claim about which document the reader
   * is most likely to want, and this Page does not reorder a legal set.
   */
  documents: readonly LegalPageDocument[]
  /**
   * The accessible name of the table of documents.
   *
   * Required, because the table is a navigation landmark and a landmark with no
   * name is announced as "navigation", which on a site with a header above it is
   * two regions called the same thing. The words are the caller's: "Legal
   * documents" and "Policies and terms" are two filings and only the site knows
   * which one it has.
   */
  documentsLabel: string
  /**
   * The selected document's body, at the reading measure.
   *
   * Required, and an opaque node on purpose. See the Page's JSDoc for why this
   * Page does not parse it and what the cost of that decision is.
   */
  body: ReactNode
  /**
   * The accessible name of the region the body sits in.
   *
   * Optional, and the reason it is optional is the element rather than the
   * prop: a `<section>` with no accessible name is not a landmark at all, so
   * passing this turns the band into a named region and omitting it leaves it as
   * a plain division of the page. A caller with one document on the route has
   * nothing to name and nothing is lost.
   */
  bodyLabel?: string
  /**
   * A slot for what comes after the document: a related set, a contact address, a
   * second form.
   *
   * A slot rather than a prop because everything that could go here is a Block, and
   * a Page that took a Block per prop would be a Page whose interface lists the
   * whole catalogue.
   */
  footer?: ReactNode
  /**
   * The heading level for the page's own heading, and one level deeper for the
   * document's own headings, which the caller writes inside `body`.
   *
   * Defaults to `h1`, because a page owns the top of the document outline.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A complete legal screen: what this set of documents is, which one is selected,
 * and that one at the reading measure.
 *
 * **The decision this Page makes is that it does not own the text and does not
 * parse it, and the decision is the reason the screen exists at all.** A legal
 * document is prose a lawyer wrote, it has a structure a design system knows
 * nothing about, and a Page that imposed a section grammar on it would be
 * rewriting the document it exists to publish. The rejected alternatives are both
 * reasonable-looking and both refusals. A `sections` prop of typed blocks would
 * have made a legal document a `ContentGrid01` entry per clause, which means this
 * package would decide what a clause is and what an amendment is, and a consumer's
 * counsel would then be reviewing a layout rather than reading their own words. A
 * Markdown string with `dangerouslySetInnerHTML` would have been worse and quieter:
 * a legal document is the one place on a site where a rendering bug is a
 * compliance problem rather than a visual one. So `body` is a node, authored
 * wherever it is authored, and Prism supplies the measure, the rhythm and the
 * block treatments and nothing else. The cost is real and it is the honest
 * counterweight: Prism cannot check that a consumer's document has a version in
 * it, cannot find the headings, and cannot put a table of contents in step with
 * the text, so a consumer who needs a synced contents list builds it themselves.
  *
 * **The document list is a `nav` of the caller's own rows and not a Block, and the
 * reason is the current item.** A legal screen has to mark the document in the
 * body, because a reader who has lost their place in a set of six is the whole
 * problem this screen exists to solve, and that mark is `aria-current="page"`
 * because a current item is a position and not a hue. `ContentGrid01` is the
 * nearest Block and it is the wrong one twice over: it is a grid of dated entries
 * and a legal document has no date, and it carries no current mark, so composing
 * it would have meant either losing the position or reaching around it with a
 * colour. The Page draws the list itself, as a `nav` with the caller's name on it,
 * and the only Prism-owned thing in it is the focus behaviour every anchor in this
 * package already has.
 *
 * **The selected item is marked three ways, and only one of them is a colour.** The
 * `aria-current` is what a screen reader announces. The weight is what a reader
 * scanning the left edge sees. The colour is there and it is the weakest of the
 * three, which is the whole doctrine: a design system that marked the current item
 * in the accent hue alone would be unreadable for a reader who cannot separate
 * that hue from the page ground, and every rule in this package that draws a
 * current item draws it the same way. The mark is also never given a hover state
 * that looks like it, because a row that changes colour under the pointer is a row
 * that lies about where the reader is. The surface moves on hover; the position
 * does not.
 *
 * **The date needs its words, and the Page throws without them.** A bare date
 * under a legal heading is read as the date the page was published, and a
 * reader checking a document's currency is checking the difference between the two.
 * So `updatedAt` is never drawn on its own: the caller's `updatedLabel` says what
 * the date is, and the check runs before anything is drawn, because a page that
 * rendered the date anyway would look correct in a screenshot and be wrong on the
 * page.
 *
 * **The body is a `Prose`, so the measure and the rhythm are tokens rather than a
 * guess.** A legal document is the longest run of prose on almost every site, and
 * the alternative was a `max-w-*` utility written in this file, which would have
 * been a second source of truth for the measure and a number that goes stale when
 * the token changes. The cost of handing the measure to `Prose` is that the caller
 * cannot put a table or a wide figure beside the text, and the answer is that
 * `className` is layout only and a legal document that needs a full-bleed
 * attachment is a page the consumer composes themselves.
 *
 * It is a server Component. It fetches nothing, it holds no state and it imports
 * no router, so a consumer renders it from whichever route their framework names
 * for a legal document and hands it the body their own content pipeline produced.
 */
export function LegalPage({
  title,
  updatedAt,
  updatedLabel,
  documents,
  documentsLabel,
  body,
  bodyLabel,
  footer,
  headingLevel = 'h1',
  className,
}: LegalPageProps) {
  assertUpdatedLabel(updatedAt, updatedLabel)

  return (
    <div data-slot="legal-page" className={cn(className)}>
      <Section data-slot="legal-page-heading">
        <div className="flex flex-col gap-3">
          <SectionHeading as={headingLevel} align="left" title={title} />
          {updatedAt === undefined ? null : (
            <Text data-slot="legal-page-updated" size="sm" tone="muted">
              <span>{updatedLabel}</span> <span>{updatedAt}</span>
            </Text>
          )}
        </div>
      </Section>

      <Section data-slot="legal-page-documents">
        <nav aria-label={documentsLabel} data-slot="legal-page-documents-nav">
          <ul className="flex flex-col gap-1">
            {documents.map((document) => {
              const current = document.selected === true

              const row = (
                <>
                  <span
                    data-slot="legal-page-document-title"
                    className={cn('text-sm', current ? 'text-foreground font-semibold' : 'text-muted-foreground')}
                  >
                    {document.title}
                  </span>
                  {document.summary === undefined ? null : (
                    <span
                      data-slot="legal-page-document-summary"
                      className="text-muted-foreground text-pretty text-sm"
                    >
                      {document.summary}
                    </span>
                  )}
                </>
              )

              return (
                <li key={document.id} data-slot="legal-page-document" data-current={current ? 'true' : undefined}>
                  {document.href === undefined ? (
                    <span
                      data-slot="legal-page-document-link"
                      aria-current={current ? 'page' : undefined}
                      className="flex flex-col gap-1 rounded-sm"
                    >
                      {row}
                    </span>
                  ) : (
                    <a
                      data-slot="legal-page-document-link"
                      href={document.href}
                      aria-current={current ? 'page' : undefined}
                      className="hover:bg-accent/50 flex flex-col gap-1 rounded-sm transition-colors duration-fast ease-out"
                    >
                      {row}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </Section>

      {/*
        The region, and the reason `bodyLabel` is optional rather than required is
        the element: a `<section>` with no accessible name is not a landmark, so
        passing the label promotes the band and omitting it leaves a plain division.
      */}
      <Section data-slot="legal-page-body" aria-label={bodyLabel}>
        <Prose size="lg">{body}</Prose>
      </Section>

      {footer === undefined ? null : <Section data-slot="legal-page-footer">{footer}</Section>}
    </div>
  )
}

/**
 * The date's own check, run before anything is drawn.
 *
 * A bare date under a legal heading is read as the date the page was published,
 * and a reader checking a document's currency is checking the difference between
 * that and the date it last changed. The cost of throwing rather than degrading is
 * that a caller with a data file that has drifted finds out at render rather than
 * in review, which is the trade every refusal in this package makes.
 */
function assertUpdatedLabel(updatedAt: string | undefined, updatedLabel: string | undefined): void {
  if (updatedAt === undefined) return
  if (updatedLabel !== undefined && updatedLabel.trim() !== '') return

  throw new Error(
    'LegalPage: updatedAt was passed with no updatedLabel, so the date would be drawn on its own under the page ' +
      'heading, where a reader reads it as the date the page was published rather than the date the document last ' +
      'changed. Those are two different facts and the second is the one a reader checking a document is here for. ' +
      'Pass the words that say what the date is, or drop the date.',
  )
}

export default LegalPage
