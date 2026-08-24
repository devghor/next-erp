'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { PackingSlip } from '../../api/types';
import { CellAction } from './cell-action';

const statusVariant: Record<PackingSlip['status'], 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  in_transit: 'secondary',
  delivered: 'secondary',
  cancelled: 'destructive'
};

export const columns: ColumnDef<PackingSlip>[] = [
  {
    id: 'reference_no',
    accessorKey: 'reference_no',
    header: ({ column }: { column: Column<PackingSlip, unknown> }) => (
      <DataTableColumnHeader column={column} title='Reference' />
    ),
    meta: {
      label: 'Reference',
      placeholder: 'Search reference...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'sale_reference_no',
    accessorKey: 'sale_reference_no',
    header: ({ column }: { column: Column<PackingSlip, unknown> }) => (
      <DataTableColumnHeader column={column} title='Sale Reference' />
    ),
    cell: ({ row }) => row.original.sale_reference_no ?? '—'
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<PackingSlip, unknown> }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => row.original.customer_name ?? '—'
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }: { column: Column<PackingSlip, unknown> }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ cell }) => cell.getValue<PackingSlip['amount']>().toFixed(2)
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<PackingSlip, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<PackingSlip['status']>();
      return <Badge variant={statusVariant[value]}>{value.replace('_', ' ')}</Badge>;
    },
    meta: {
      label: 'Status',
      variant: 'select' as const,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<PackingSlip, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<PackingSlip['created_at']>())
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
