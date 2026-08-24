'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Coupon } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Coupon>[] = [
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
    id: 'code',
    accessorKey: 'code',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    meta: {
      label: 'Code',
      placeholder: 'Search code...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    )
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize'>
        {row.original.type}
      </Badge>
    )
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) =>
      row.original.type === 'percentage' ? `${row.original.amount}%` : row.original.amount
  },
  {
    id: 'used',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Used / Qty' />
    ),
    cell: ({ row }) => `${row.original.used} / ${row.original.quantity}`
  },
  {
    id: 'expired_date',
    accessorKey: 'expired_date',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Expires' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<Coupon['expired_date']>();
      return value ? formatDate(value) : '—';
    }
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }: { column: Column<Coupon, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
