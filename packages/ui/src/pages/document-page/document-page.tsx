'use client'

import { Fragment, type ComponentProps, type ReactNode } from 'react'

import { ActivityFeed01 } from '../../blocks/activity-feed-01'
import { Compare01 } from '../../blocks/compare-01'
import { DataTable01 } from '../../blocks/data-table-01'
import { MemberList01 } from '../../blocks/member-list-01'
import { RecordDetail01 } from '../../blocks/record-detail-01'
import { Prose } from '../../components/ui/prose'
import { Section } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * A props type with the heading level removed, distributed over a union.
 *
 * `Omit` does not distribute over a union: `Omit<A | B, K>` keeps only the keys
 * the two arms share, so `Omit<DataTable01Props, 'headingLevel'>` would drop the
 * selection arm's own members and a caller could no longer pass `selectable`. The
 * conditional distributes, so each arm loses only its heading level.
 */
type WithoutHeading<T> = T extends unknown ? Omit<T, 'headingLevel'> : never

/**
 * The document read in full, plus its body.
 *
 * It is the props of `RecordDetail01` minus the two the Page decides for it. The
 * `title`, `eyebrow`, `description`, `fields`, `actions` and `relations` are the
 * record's own, unchanged, so the Page mints no document type: a document is a
 * record, and the record detail is the Block that draws one. `headingLevel` is
 * removed because the Page owns the document's `h1`, and `children` is replaced by
 * `body` so the Page can hold the body to the reading measure rather than pass it
 * through untouched.
 */
export type DocumentPageDocument = Omit<
  ComponentProps<typeof RecordDetail01>,
  'headingLevel' | 'children'
> & {
  /**
   * The document's body: the authored copy between the document's facts and its
   * regions.
   *
   * The Page wraps it in `Prose`, so the measure and the block rhythm are the
   * system's and the words are the caller's. Omit it for a document that is only
   * its facts and its regions.
   */
  body?: ReactNode
}

/**
 * One region beside the document body, as the caller's own content.
 *
 * **The union is by arrangement and not by subject matter, and that is the whole
 * of what keeps the Page from minting a document type.** A `version`, a `comment`
 * and a `source` are each a product's word for its own record, and a member naming
 * one of them on a Prism type would promise that every consumer's document holds
 * those things. What the Page knows is which settled Block draws a region: an
 * `activity` is `ActivityFeed01`, a `table` is `DataTable01`, `members` is
 * `MemberList01` and `comparison` is `Compare01`. A version list and a source list
 * are both a `table` with the caller's own columns; a comment thread is `members`
 * or a `table`; the evidence matrix is `comparison`. So the six document variants
 * and the research workspace are one Page under different content, exactly as the
 * decision recorded, and the difference between them is which region the caller
 * put in the list.
 *
 * `key` is the caller's stable key for the region, because a region list is an
 * ordered list and React needs an identity per entry that survives a reorder.
 */
export type DocumentPageRegion =
  | {
      key: string
      block: 'activity'
      props: WithoutHeading<ComponentProps<typeof ActivityFeed01>>
    }
  | {
      key: string
      block: 'table'
      props: WithoutHeading<ComponentProps<typeof DataTable01>>
    }
  | {
      key: string
      block: 'members'
      props: WithoutHeading<ComponentProps<typeof MemberList01>>
    }
  | {
      key: string
      block: 'comparison'
      props: WithoutHeading<ComponentProps<typeof Compare01>>
    }

/**
 * The props a DocumentPage takes.
 *
 * The document is one prop and the regions are another, because the document read
 * in full is the whole of the page and the regions are what the caller opens
 * beside its body. Every word, value, column, member and arm is the caller's: the
 * Page ships no sentence, holds no document, fetches nothing and owns no editor,
 * no share, no export and no permission.
 */
export type DocumentPageProps = {
  /** The document read in full, with its body. The Page gives it the page's `h1`. */
  document: DocumentPageDocument
  /**
   * The regions beside the body, in the order a reader should meet them. Omit the
   * prop for a document that is only its body, which is the deliverable case.
   */
  regions?: readonly DocumentPageRegion[]
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * One region, drawn by the Block its arrangement names.
 *
 * The heading level is set here rather than taken from the caller, so every region
 * is a section one level under the document's `h1` and the outline cannot be
 * flattened by a caller who passed the wrong level to a Block.
 */
function renderRegion(region: DocumentPageRegion): ReactNode {
  if (region.block === 'activity') return <ActivityFeed01 {...region.props} headingLevel="h2" />
  if (region.block === 'table') return <DataTable01 {...region.props} headingLevel="h2" />
  if (region.block === 'members') return <MemberList01 {...region.props} headingLevel="h2" />
  return <Compare01 {...region.props} headingLevel="h2" />
}

/**
 * A whole document screen: the document read in full with its body, and one or
 * more regions beside it.
 *
 * **This is a Page authored beside `DocsShell`, and neither of that Page's two
 * rules is relaxed.** `DocsShell` states that a section is a label and not a
 * control, and that a group with no index is a label and not a route. Both are
 * statements about a documentation site's navigation tree, where a section is a
 * topic a reader may reach in any order. This workspace never asks that question:
 * its status is a state of a region of one document and belongs to the Block that
 * draws the region, and its route is the document's own contents. So the two are
 * separate Items, no consumer of `DocsShell` is affected, and this Page owns the
 * document's `h1` because a route renders it for a document and nothing frames it.
 *
 * **One Page draws all seven screens, because the difference between the six
 * document variants and the research workspace is content rather than
 * structure.** The record is the same thing in every one of them: an authored
 * document with a title, a body and a set of things attached to it. What separates
 * them is which region is open beside the body, which is the caller's content, so
 * a version list, a comment thread, a source list, an output list and an evidence
 * matrix are regions of one Page rather than six Items. The Page is the
 * arrangement that places the document and one or more of those regions, and it
 * ships none of their words.
 *
 * **It composes settled Items and mints no document, version, comment or source
 * type.** The document read in full is `RecordDetail01`, and the body is `Prose`.
 * A version list is `ActivityFeed01` or a `table` region; a comment thread is a
 * `members` region or a `table`; a source list and an output list are `table`
 * regions with the caller's per-row destination; the evidence comparison matrix is
 * `Compare01` as a `comparison` region. Nothing here declares a shape named after
 * a product's record, because a document is a record and every attached thing is
 * the caller's own rows.
 *
 * **The editor, the fetch, the retention, the share, the export and the permission
 * are the consumer's.** The Page owns no editor, so an annotation anchored to a
 * passage, a version created, a comment resolved and a document sent are all
 * behaviour and all the caller's. It fetches nothing, so it holds no document, no
 * version history and no source; it owns no retention, no archive and no recovery,
 * which are properties of the caller's store; and it owns no permission, because
 * who may read or comment is the caller's store. Every figure, word and node is a
 * prop.
 *
 * It is a client Component because the Blocks it composes hold state: a table
 * holds its selection and a member list attaches a handler. That is a property of
 * this composition and not of the data, and the caller still owns every row, every
 * callback and every word.
 */
export function DocumentPage({ document, regions, className }: DocumentPageProps) {
  const { body, ...record } = document
  const list = regions ?? []

  return (
    <Section data-slot="document-page" className={cn(className)}>
      <article data-slot="document-page-article" className="flex flex-col gap-12">
        {/*
          The document read in full, at the page's own heading level. `RecordDetail01`
          draws the identity, the declared facts, the composed body and the relations,
          and the Page gives it the `h1` a whole document screen owns rather than the
          `h2` a composed section would take.
        */}
        <RecordDetail01 {...record} headingLevel="h1">
          {body === undefined ? null : <Prose>{body}</Prose>}
        </RecordDetail01>

        {list.length === 0 ? null : (
          <div data-slot="document-page-regions" className="flex flex-col gap-12">
            {list.map((region) => (
              <Fragment key={region.key}>{renderRegion(region)}</Fragment>
            ))}
          </div>
        )}
      </article>
    </Section>
  )
}

export default DocumentPage
