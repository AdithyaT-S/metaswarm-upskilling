'use client'

import { useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  pageIndex: number
  pageCount: number
  onPageChange: (page: number) => void
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void
  emptyState?: React.ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  pageIndex,
  pageCount,
  onPageChange,
  onSortChange,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualPagination: true,
    manualSorting: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      if (next.length > 0 && onSortChange) {
        onSortChange(next[0].id, next[0].desc ? 'desc' : 'asc')
      }
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.getCanSort() && 'cursor-pointer select-none')}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-4 w-4" />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  {emptyState ?? <EmptyState title="No results found." />}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {pageIndex + 1} of {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => onPageChange(pageIndex - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => onPageChange(pageIndex + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
