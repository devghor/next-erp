'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Purchase } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Purchase>[] = [
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
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Reference No' />
    ),
    meta: { label: 'Reference No', placeholder: 'Search reference...', variant: 'text' as const, icon: Icons.text },
    enableColumnFilter: true
  },
  {
    id: 'supplier_name',
    accessorKey: 'supplier_name',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Supplier' />
    ),
    cell: ({ row }) => row.original.supplier_name ?? 'N/A'
  },
  {
    id: 'warehouse_name',
    accessorKey: 'warehouse_name',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Warehouse' />
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => <Badge variant='secondary'>{row.original.status}</Badge>
  },
  {
    id: 'payment_status',
    accessorKey: 'payment_status',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Payment' />
    ),
    cell: ({ row }) => {
      const status = row.original.payment_status;
      const variant = status === 'paid' ? 'default' : status === 'partial' ? 'secondary' : 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    }
  },
  {
    id: 'grand_total',
    accessorKey: 'grand_total',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Grand Total' />
    ),
    cell: ({ row }) => Number(row.original.grand_total).toFixed(2)
  },
  {
    id: 'due_amount',
    accessorKey: 'due_amount',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Due' />
    ),
    cell: ({ row }) => Number(row.original.due_amount).toFixed(2)
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Purchase, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Purchase['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
