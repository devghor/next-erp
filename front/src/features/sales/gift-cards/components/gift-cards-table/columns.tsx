'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { GiftCard } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<GiftCard>[] = [
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
    id: 'card_no',
    accessorKey: 'card_no',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Card No' />
    ),
    meta: {
      label: 'Card No',
      placeholder: 'Search card no...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => row.original.customer_name ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Loaded' />
    ),
    cell: ({ cell }) => cell.getValue<GiftCard['amount']>().toFixed(2)
  },
  {
    id: 'expense',
    accessorKey: 'expense',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Spent' />
    ),
    cell: ({ cell }) => cell.getValue<GiftCard['expense']>().toFixed(2)
  },
  {
    id: 'balance',
    accessorKey: 'balance',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Balance' />
    ),
    cell: ({ cell }) => (
      <span className='font-medium'>{cell.getValue<GiftCard['balance']>().toFixed(2)}</span>
    )
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) =>
      cell.getValue<GiftCard['is_active']>() ? (
        <Badge variant='secondary'>Active</Badge>
      ) : (
        <Badge variant='outline'>Inactive</Badge>
      )
  },
  {
    id: 'expired_date',
    accessorKey: 'expired_date',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Expires' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<GiftCard['expired_date']>();
      return value ? formatDate(value) : '—';
    }
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<GiftCard, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<GiftCard['created_at']>()),
    meta: {
      label: 'Created At',
      variant: 'dateRange' as const,
      icon: Icons.calendar
    },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
