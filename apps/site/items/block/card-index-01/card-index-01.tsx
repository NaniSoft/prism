'use client'

import { useState } from 'react'

import {
  CardIndex01,
  type CardIndex01Labels,
  type CardIndex01Row,
  type CardIndex01SelectionScope,
} from '@nanisoft/prism-ui/blocks/card-index-01'
import { Button } from '@nanisoft/prism-ui/components/button'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { Price } from '@nanisoft/prism-ui/components/price'
import { Text } from '@nanisoft/prism-ui/components/typography'

type Product = { id: string; name: string; price: number; note: string }

const PRODUCTS: Product[] = [
  { id: 'p-1', name: 'Aran Crew', price: 12800, note: 'Wool, four colours' },
  { id: 'p-2', name: 'Linen Camp', price: 9600, note: 'Short sleeve, two colours' },
  { id: 'p-3', name: 'Merino Roll', price: 16400, note: 'Fine gauge, one colour' },
  { id: 'p-4', name: 'Cotton Oxford', price: 7400, note: 'Button down, three colours' },
]

const ROWS: CardIndex01Row[] = PRODUCTS.map((product) => ({ ...product, key: product.id }))

const LABELS: CardIndex01Labels = {
  selectAll: 'Select every product on this page',
  selectCard: (row) => `Select ${String(row.name)}`,
  cardActions: 'Product actions',
  selectedCount: (count) => `${count} selected on this page`,
  selectedAllMatching: (count) => `All ${count} matching products selected`,
  clearedSelection: 'No products selected',
  dismissSelection: 'Clear selection',
  previous: 'Previous',
  next: 'Next',
  page: (value) => `Go to page ${value}`,
  empty: 'No products match the current search.',
}

/** The record index as pictures, wired to local selection state. */
export default function CardIndex01Demo() {
  const [selected, setSelected] = useState<string[]>([])
  const [scope, setScope] = useState<CardIndex01SelectionScope>({ scope: 'page' })
  const [added, setAdded] = useState<string[]>([])

  return (
    <div className="flex max-w-measure flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Each record is a card the caller composed: a plate, a name and a price, with
        the selection tick and the card controls the Block places around it.
      </p>
      <p className="text-muted-foreground text-sm">
        {added.length === 0 ? 'Nothing added yet.' : `Shortlisted: ${added.join(', ')}.`}
      </p>

      <CardIndex01
        title="Catalogue"
        description="Four records compared as pictures."
        headingLevel="h3"
        columnsPerRow={4}
        rows={ROWS}
        getRowId={(row) => String(row.key)}
        renderCard={(row) => (
          <div className="flex flex-col gap-2">
            <div className="bg-muted flex aspect-[8/5] w-full items-center justify-center rounded-lg">
              <Text as="span" className="text-muted-foreground text-3xl font-semibold">
                {String(row.name).charAt(0)}
              </Text>
            </div>
            <Text as="span" className="font-medium">
              {String(row.name)}
            </Text>
            <Price amount={Number(row.price)} currency="USD" />
            <span className="text-muted-foreground text-xs">{String(row.note)}</span>
          </div>
        )}
        renderCardActions={(row) => (
          <>
            <CtaLink href={`/products/${String(row.id)}`} variant="ghost" size="sm">
              View
            </CtaLink>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setAdded((previous) =>
                  previous.includes(String(row.id))
                    ? previous.filter((entry) => entry !== String(row.id))
                    : [...previous, String(row.id)],
                )
              }
            >
              Shortlist
            </Button>
          </>
        )}
        selectable
        selectedIds={selected}
        onSelectedIdsChange={(ids) => {
          setSelected(ids)
          setScope({ scope: 'page' })
        }}
        selectionScope={scope}
        batchActions={
          <Button size="sm" onClick={() => setSelected([])}>
            Archive selected
          </Button>
        }
        pageCount={1}
        labels={LABELS}
      />
    </div>
  )
}
