'use client'

import type { DataTable01Labels } from '@nanisoft/prism-ui/blocks/data-table-01'
import { DocumentPage, type DocumentPageRegion } from '@nanisoft/prism-ui/pages/document-page'
import type { ColumnSpec, EventSpec } from '@nanisoft/prism-ui/spec'

/**
 * The version list, as the dated attributed run the activity feed draws.
 *
 * A version is a record, so it is an `EventSpec` like every other occurrence and
 * this Page mints no version type. The reader's own words for the version go in
 * `action`.
 */
const VERSIONS: EventSpec[] = [
  {
    key: 'v3',
    at: '2026-10-08T16:20:00Z',
    actor: 'Margret Haldorsdottir',
    action: 'published version 3',
    target: 'the executive summary',
    tone: 'success',
    toneLabel: 'Published',
  },
  {
    key: 'v2',
    at: '2026-10-07T11:04:00Z',
    actor: 'Tunde Oyelaran',
    action: 'rewrote the method section',
    tone: 'info',
    toneLabel: 'Edited',
  },
  {
    key: 'v1',
    at: '2026-10-06T09:12:00Z',
    actor: 'Priya Raman',
    action: 'started the document',
  },
]

/**
 * The comment thread, as a member list.
 *
 * A comment is a record, so the Page holds no comment type: the thread is the
 * caller's own members with their own words.
 */
const COMMENTERS = [
  {
    id: 'mh',
    name: 'Margret Haldorsdottir',
    role: 'Lead author',
    presence: 'online' as const,
    presenceLabel: 'Online now',
    lastSeen: 'just now',
    href: '/people/mh',
  },
  {
    id: 'ja',
    name: 'Jide Abara',
    role: 'Reviewer',
    presence: 'away' as const,
    presenceLabel: 'Away',
    lastSeen: '2 hours ago',
  },
  {
    id: 'sk',
    name: 'Soren Kjeldsen',
    role: 'Reviewer',
    presence: 'offline' as const,
    presenceLabel: 'Offline',
    lastSeen: 'yesterday',
  },
]

/** The source list, as a table with the caller's own columns. */
const SOURCE_COLUMNS: readonly ColumnSpec[] = [
  { key: 'title', header: 'Source', kind: 'Typography' },
  { key: 'kind', header: 'Kind', kind: 'Badge' },
  { key: 'used', header: 'Used for', kind: 'Typography' },
]

const SOURCE_ROWS = [
  { id: 's1', title: 'Northbound arrival logs', kind: 'Dataset', used: 'The four minute gap' },
  { id: 's2', title: 'Signal check schedule', kind: 'Document', used: 'The cause of the hold' },
  { id: 's3', title: 'Operator interview', kind: 'Interview', used: 'The recovery window' },
]

const SOURCE_LABELS: DataTable01Labels = {
  search: 'Search sources',
  filters: 'Filters',
  reset: 'Reset filters',
  columns: 'Columns',
  viewColumns: 'View',
  selectAll: 'Select every source on this page',
  selectRow: (row) => `Select ${String(row.title)}`,
  rowActions: 'Source actions',
  sort: (column, direction) => `Sort by ${column}, ${direction}`,
  selectedCount: (count) => `${count} selected on this page`,
  selectedAllMatching: (count) => `All ${count} matching sources selected`,
  clearedSelection: 'No sources selected',
  dismissSelection: 'Clear selection',
  previous: 'Previous',
  next: 'Next',
  page: (value) => `Go to page ${value}`,
  empty: 'No source matches the current search and filters.',
}

/**
 * The evidence matrix, as `Compare01` on shared axes.
 *
 * This is the research workspace's region and not a relation and not its own Item:
 * a matrix is a comparison of two things judged on one set of axes, which is the
 * Block's whole job. Prism states no verdict, so neither arm is marked.
 */
const EVIDENCE: DocumentPageRegion = {
  key: 'evidence',
  block: 'comparison',
  props: {
    title: 'Evidence',
    description: 'The two studies the conclusion rests on, judged on the same axes.',
    labels: ['Method', 'Sample', 'Confidence', 'Conflict of interest'],
    left: {
      name: 'Study A, the arrival logs',
      summary: 'Four weeks of northbound timings from two operators.',
      points: [
        { value: 'Instrumented, minute resolution' },
        { value: '2 operators, 4 weeks' },
        { value: 'High, cross checked against the schedule' },
        { value: 'None declared' },
      ],
    },
    right: {
      name: 'Study B, the operator interviews',
      summary: 'Six interviews with the people who worked the route.',
      points: [
        { value: 'Structured interview' },
        { value: '6 operators, 3 depots' },
        { value: 'Moderate, self reported' },
        { value: 'One author knows two participants' },
      ],
    },
  },
}

/**
 * The regions beside the body, in the order a reader should meet them: the
 * evidence matrix, the sources, the versions and the comment thread.
 */
const REGIONS: readonly DocumentPageRegion[] = [
  EVIDENCE,
  {
    key: 'sources',
    block: 'table',
    props: {
      title: 'Sources',
      description: 'What the conclusion is built from, each a record you can open.',
      columns: SOURCE_COLUMNS,
      rows: SOURCE_ROWS,
      getRowId: (row) => String(row.id),
      pageCount: 1,
      labels: SOURCE_LABELS,
    },
  },
  {
    key: 'versions',
    block: 'activity',
    props: {
      title: 'Versions',
      description: 'Every published version, newest first.',
      events: VERSIONS,
      empty: 'This document has no published version yet.',
    },
  },
  {
    key: 'comments',
    block: 'members',
    props: {
      label: 'People on this document',
      title: 'Comment thread',
      members: COMMENTERS,
      empty: 'Nobody has commented on this document yet.',
    },
  },
]

/**
 * A document workspace: one document read in full, with its evidence, its sources,
 * its versions and its comment thread beside it.
 *
 * Every region is the caller's own content, and which Block draws it is the only
 * thing the Page decides. The same Page draws the six document variants and the
 * research workspace, because the difference between them is which regions are
 * passed rather than a different screen.
 */
export default function DocumentPageDemo() {
  return (
    <DocumentPage
      document={{
        eyebrow: 'DOC-4821',
        title: 'Northbound timetable review',
        description: 'Where the northbound service loses four minutes, and what to do about it.',
        fields: [
          { id: 'status', label: 'Status', value: 'In review' },
          { id: 'owner', label: 'Owner', value: 'Margret Haldorsdottir' },
          { id: 'updated', label: 'Updated', value: '8 October 2026' },
        ],
        body: (
          <>
            <p>
              The northbound service loses four minutes between Berwick and Dunbar, and it
              loses them on most days. This review sets out what the arrival logs show, what
              the operators say, and what a fix would cost.
            </p>
            <h2 id="the-gap">The gap</h2>
            <p>
              The gap opens at the signal check south of Berwick and closes again by Dunbar.
              It is not the timetable: the timings on either side are met.
            </p>
            <ul>
              <li>The hold is between ninety seconds and four minutes.</li>
              <li>It happens on four days in five, and rarely at weekends.</li>
              <li>Recovery is possible but costs a later path.</li>
            </ul>
            <h2 id="the-recommendation">The recommendation</h2>
            <p>
              Move the check to the loop, and hold the path rather than the train. The cost
              is one signal upgrade and a change to the working timetable.
            </p>
          </>
        ),
      }}
      regions={REGIONS}
    />
  )
}
