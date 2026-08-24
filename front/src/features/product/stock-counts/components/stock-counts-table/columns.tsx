'use client';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { StockCount, StockCountStatus } from '../../api/types';
import { CellAction } from './cell-action';

const statusVariant: Record<StockCountStatus, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  counted: 'outline',
  adjusted: 'default'
};

export const columns: ColumnDef<StockCount>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'reference_no',
    accessorKey: 'reference_no',
    header: ({ column }: { column: Column<StockCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Reference No' />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/product/stock-counts/${row.original.id}`}
        className='text-primary hover:underline'
      >
        {row.original.reference_no}
      </Link>
    ),
    meta: {
      label: 'Reference No',
      placeholder: 'Search reference...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'warehouse_name',
    accessorKey: 'warehouse_name',
    header: ({ column }: { column: Column<StockCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Warehouse' />
    )
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }: { column: Column<StockCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => <span className='capitalize'>{row.original.type}</span>
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<StockCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]} className='capitalize'>
        {row.original.status}
      </Badge>
    )
  },
  {
    id: 'user_name',
    accessorKey: 'user_name',
    header: ({ column }: { column: Column<StockCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='By' />
    ),
    cell: ({ row }) => row.original.user_name ?? 'N/A'
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<StockCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<StockCount['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
