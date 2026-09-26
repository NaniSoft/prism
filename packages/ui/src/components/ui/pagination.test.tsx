import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

describe('Pagination', () => {
  it('names the navigation region and marks the active page', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/page/1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/page/2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="/page/3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Go to the previous page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to the next page' })).toBeInTheDocument()
  })
})
