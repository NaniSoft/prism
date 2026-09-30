'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { SearchField } from '@nanisoft/prism-ui/components/search-field'

const INVOICES = [
  { id: 'inv-1042', number: 'INV-1042', customer: 'Northwind Traders' },
  { id: 'inv-1043', number: 'INV-1043', customer: 'Contoso' },
  { id: 'inv-1051', number: 'INV-1051', customer: 'Fabrikam' },
  { id: 'inv-1060', number: 'INV-1060', customer: 'Northwind Traders' },
  { id: 'inv-1062', number: 'INV-1062', customer: 'Tailspin Toys' },
  { id: 'inv-1077', number: 'INV-1077', customer: 'Adventure Works' },
]

/**
 * A search field in the three states it is actually in: filtering a list,
 * refusing a query that is too short to be worth running, and sitting beside a
 * filter trigger of the caller's own.
 */
export default function SearchFieldDemo() {
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const trimmed = query.trim().toLowerCase()
  const results =
    trimmed === ''
      ? INVOICES
      : INVOICES.filter(
          (invoice) =>
            invoice.number.toLowerCase().includes(trimmed) ||
            invoice.customer.toLowerCase().includes(trimmed),
        )

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <div className="flex flex-col gap-3">
        <SearchField
          label="Search invoices"
          placeholder="Number or customer"
          description="Matches the invoice number and the customer name."
          value={query}
          onValueChange={setQuery}
          clearLabel="Clear the invoice search"
          resultSummary={`${results.length} of ${INVOICES.length} invoices`}
          error={
            trimmed !== '' && trimmed.length < 3
              ? 'Use at least three characters, or a whole invoice number.'
              : undefined
          }
        />

        <ul className="border-border divide-border divide-y border text-sm">
          {results.map((invoice) => (
            <li key={invoice.id} className="flex items-baseline justify-between gap-4 py-2">
              <span className="font-mono text-xs">{invoice.number}</span>
              <span className="text-muted-foreground">{invoice.customer}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <SearchField
          label="Search projects"
          placeholder="Project name or code"
          value={project}
          onValueChange={setProject}
          clearLabel="Clear the project search"
          trailing={
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters
            </Button>
          }
          resultSummary={
            filtersOpen
              ? 'Filters are open. Status and owner are narrowing the list.'
              : undefined
          }
        />
        <p className="text-muted-foreground text-sm">
          The trigger the caller composes sits inside the field, so the query and
          the narrowing read as one control. The clear control stays at the edge of
          the field, where a reader found it the first time.
        </p>
      </div>
    </div>
  )
}
