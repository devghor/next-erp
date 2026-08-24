'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Delivery, DeliveryStatus } from '../../api/types';
import { CellAction } from './cell-action';

const statusVariant: Record<DeliveryStatus, 'outline' | 'secondary' | 'default'> = {
  packing: 'outline',
  delivering: 'secondary',
  delivered: 'default'
};

const statusLabel: Record<DeliveryStatus, string> = {
  packing: 'Packing',
  delivering: 'Delivering',
  delivered: 'Delivered'
};

export const columns: ColumnDef<Delivery>[] = [
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
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
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
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
      <DataTableColumnHeader column={column} title='Sale' />
    ),
    cell: ({ row }) => row.original.sale_reference_no ?? '—'
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => row.original.customer_name ?? '—'
  },
  {
    id: 'courier_name',
    accessorKey: 'courier_name',
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
      <DataTableColumnHeader column={column} title='Courier' />
    ),
    cell: ({ row }) => row.original.courier_name ?? 'Manual'
  },
  {
    id: 'tracking_code',
    accessorKey: 'tracking_code',
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tracking Code' />
    ),
    cell: ({ row }) => row.original.tracking_code ?? '—'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<DeliveryStatus>();
      return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
    },
    meta: {
      label: 'Status',
      variant: 'select' as const,
      options: [
        { label: 'Packing', value: 'packing' },
        { label: 'Delivering', value: 'delivering' },
        { label: 'Delivered', value: 'delivered' }
      ]
    },
    enableColumnFilter: true
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Delivery, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Delivery['created_at']>()),
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
