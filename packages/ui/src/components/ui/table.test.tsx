import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'

describe('Table', () => {
  it('renders a named table with column headers and cells', () => {
    render(
      <Table>
        <TableCaption>Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(screen.getByRole('table', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument()
  })
})
