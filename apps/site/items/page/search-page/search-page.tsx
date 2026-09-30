'use client'

import { useMemo, useState } from 'react'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@nanisoft/prism-ui/components/pagination'
import { SearchPage, type SearchPageResult } from '@nanisoft/prism-ui/pages/search-page'

const INDEX: readonly SearchPageResult[] = [
  {
    id: 'estate',
    group: 'Handbook',
    title: 'The estate handbook',
    summary: 'How an estate is mapped, what a node is, and who may name one.',
    href: '#estate',
    updatedAt: '12 September 2026',
  },
  {
    id: 'capture',
    group: 'Handbook',
    title: 'Capture at index scale',
    summary: 'Why a full chain is captured minute by minute rather than on demand.',
    href: '#capture',
    updatedAt: '4 September 2026',
  },
  {
    id: 'tokens',
    group: 'Reference',
    title: 'The token contract',
    summary: 'Every semantic name Prism publishes, in both modes and all six packs.',
    href: '#tokens',
    hrefLabel: 'Read the contract',
  },
  {
    id: 'component',
    group: 'Reference',
    title: 'components/search-field',
    summary: 'A controlled search input with a clear control.',
    href: '#search-field',
    updatedAt: '28 August 2026',
  },
  {
    id: 'gates',
    group: 'Reference',
    title: 'The consumer gates',
    summary: 'What a law is, and where the line is drawn between a law and a site fact.',
    href: '#gates',
  },
  {
    id: 'run-stream',
    group: 'Surfaces',
    title: 'RunStream01',
    summary: 'The event log of a run, receiving events as they arrive.',
    href: '#run-stream',
    updatedAt: '21 August 2026',
  },
  {
    id: 'tool-ledger',
    group: 'Surfaces',
    title: 'ToolLedger01',
    summary: 'The tool-call ledger of a run, in structure rather than in words.',
    href: '#tool-ledger',
  },
  {
    id: 'release',
    group: 'Changelog',
    title: '0.13.0',
    summary: 'The live Kind, and the first surface that arrives on its own.',
    href: '#release',
  },
]

/** How many results one window of the pager holds. */
const WINDOW = 4

/**
 * The search screen with a query, a count the caller composes, three groups, a
 * current result, the caller's own recent searches and the caller's own pager.
 *
 * The filtering, the count, the window and the pager are all the caller's, and
 * that is the point of the Demo: the Page renders what it is given and the words
 * on this screen are all written here.
 */
export default function SearchPageDemo() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [current, setCurrent] = useState<string | undefined>('tokens')

  const trimmed = query.trim().toLowerCase()

  const found = useMemo(
    () =>
      trimmed === ''
        ? INDEX
        : INDEX.filter((entry) => `${entry.title} ${entry.group}`.toLowerCase().includes(trimmed)),
    [trimmed],
  )

  const pages = Math.max(1, Math.ceil(found.length / WINDOW))
  const shown = found.slice((page - 1) * WINDOW, page * WINDOW)

  return (
    <SearchPage
      headingLevel="h3"
      eyebrow="Nexus"
      title="Search the handbook"
      description="Every document on this site. The query stays in your own state and your own address."
      label="Search the handbook"
      clearLabel="Clear the handbook search"
      value={query}
      onValueChange={(next) => {
        setQuery(next)
        setPage(1)
      }}
      summary={(matches) =>
        trimmed === ''
          ? `${matches} documents, newest first`
          : `${matches} of ${INDEX.length} documents match`
      }
      results={shown}
      groupLabel="Results"
      selectedId={current}
      onSelect={setCurrent}
      empty={
        <span>
          Nothing in the index matches that. The index is one file, so it may not hold what you are
          looking for: try a shorter phrase, or ask someone who knows where it lives.
        </span>
      }
      recent={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Recent</span>
          {['token contract', 'capture', 'gates'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term)
                setPage(1)
              }}
              className="border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-2 py-1 text-xs"
            >
              {term}
            </button>
          ))}
        </div>
      }
      pagination={
        <Pagination label="Result pages">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#previous"
                onClick={(event) => {
                  event.preventDefault()
                  setPage((value) => Math.max(1, value - 1))
                }}
              />
            </PaginationItem>
            {Array.from({ length: pages }, (_, index) => index + 1).map((value) => (
              <PaginationItem key={value}>
                <PaginationLink
                  href={`#page-${value}`}
                  isActive={value === page}
                  onClick={(event) => {
                    event.preventDefault()
                    setPage(value)
                  }}
                >
                  {value}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#next"
                onClick={(event) => {
                  event.preventDefault()
                  setPage((value) => Math.min(pages, value + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      }
    />
  )
}
