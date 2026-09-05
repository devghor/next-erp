'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Quotation } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Quotation>[] = [
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
    header: ({ column }: { column: Column<Quotation, unknown> }) => (
      <DataTableColumnHeader column={column} title='Reference No' />
    ),
    meta: { label: 'Reference No', placeholder: 'Search reference...', variant: 'text' as const, icon: Icons.text },
    enableColumnFilter: true
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<Quotation, unknown> }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => row.original.customer_name ?? 'N/A'
  },
  {
    id: 'warehouse_name',
    accessorKey: 'warehouse_name',
    header: ({ column }: { column: Column<Quotation, unknown> }) => (
      <DataTableColumnHeader column={column} title='Warehouse' />
    )
  },
  {
    id: 'quotation_status',
    accessorKey: 'quotation_status',
    header: ({ column }: { column: Column<Quotation, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.quotation_status === 'sent' ? 'default' : 'secondary'}>
        {row.original.quotation_status}
      </Badge>
    )
  },
  {
    id: 'grand_total',
    accessorKey: 'grand_total',
    header: ({ column }: { column: Column<Quotation, unknown> }) => (
      <DataTableColumnHeader column={column} title='Grand Total' />
    ),
    cell: ({ row }) => Number(row.original.grand_total).toFixed(2)
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Quotation, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Quotation['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
