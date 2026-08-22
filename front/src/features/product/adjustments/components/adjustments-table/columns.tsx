'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Adjustment } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Adjustment>[] = [
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
    header: ({ column }: { column: Column<Adjustment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Reference No' />
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
    header: ({ column }: { column: Column<Adjustment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Warehouse' />
    )
  },
  {
    id: 'user_name',
    accessorKey: 'user_name',
    header: ({ column }: { column: Column<Adjustment, unknown> }) => (
      <DataTableColumnHeader column={column} title='By' />
    ),
    cell: ({ row }) => row.original.user_name ?? 'N/A'
  },
  {
    id: 'total_qty',
    accessorKey: 'total_qty',
    header: ({ column }: { column: Column<Adjustment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total Qty' />
    )
  },
  {
    id: 'note',
    accessorKey: 'note',
    header: ({ column }: { column: Column<Adjustment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Note' />
    ),
    cell: ({ row }) => row.original.note ?? '—'
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Adjustment, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Adjustment['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
