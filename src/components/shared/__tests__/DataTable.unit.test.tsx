import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/DataTable'

interface Row {
  name: string
  age: number
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'age', header: 'Age', enableSorting: false },
]

const data: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]

const baseProps = {
  columns,
  pageIndex: 0,
  pageCount: 3,
  onPageChange: vi.fn(),
}

describe('DataTable', () => {
  it('renders rows from data prop', () => {
    render(<DataTable {...baseProps} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows 5 skeleton rows when isLoading=true (not real rows)', () => {
    const { container } = render(
      <DataTable {...baseProps} data={[]} isLoading={true} />
    )
    // Each skeleton row has Skeleton cells; check no real data rendered
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    // There are 5 skeleton rows × number of columns skeleton elements
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(10) // 5 rows × 2 columns
  })

  it('shows EmptyState when data=[] and isLoading=false', () => {
    render(<DataTable {...baseProps} data={[]} isLoading={false} />)
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('calls onSortChange when a sortable column header is clicked', () => {
    const onSortChange = vi.fn()
    render(<DataTable {...baseProps} data={data} onSortChange={onSortChange} />)
    fireEvent.click(screen.getByText('Name'))
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc')
  })

  it('calls onRowClick with row data when a row is clicked', () => {
    const onRowClick = vi.fn()
    render(<DataTable {...baseProps} data={data} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('Alice'))
    expect(onRowClick).toHaveBeenCalledWith({ name: 'Alice', age: 30 })
  })

  it('prev button is disabled when pageIndex=0', () => {
    render(<DataTable {...baseProps} data={data} pageIndex={0} />)
    const buttons = screen.getAllByRole('button')
    // First button is Prev (ChevronLeft)
    expect(buttons[0]).toBeDisabled()
  })

  it('next button is disabled at last page', () => {
    render(<DataTable {...baseProps} data={data} pageIndex={2} pageCount={3} />)
    const buttons = screen.getAllByRole('button')
    // Second button is Next (ChevronRight)
    expect(buttons[1]).toBeDisabled()
  })

  it('shows "Page 1 of 3" text when pageIndex=0 and pageCount=3', () => {
    render(<DataTable {...baseProps} data={data} pageIndex={0} pageCount={3} />)
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })
})
