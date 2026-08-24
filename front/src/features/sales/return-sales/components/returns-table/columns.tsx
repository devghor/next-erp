'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { SaleReturn } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<SaleReturn>[] = [
  {
    id: 'reference_no',
    accessorKey: 'reference_no',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Reference No' />,
    meta: { label: 'Reference No', placeholder: 'Search reference...', variant: 'text' as const, icon: Icons.text },
    enableColumnFilter: true
  },
  {
    id: 'sale_reference_no',
    accessorKey: 'sale_reference_no',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Sale Reference' />
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Customer' />
  },
  {
    id: 'warehouse_name',
    accessorKey: 'warehouse_name',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Warehouse' />
  },
  {
    id: 'grand_total',
    accessorKey: 'grand_total',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Grand Total' />,
    cell: ({ row }) => Number(row.original.grand_total).toFixed(2)
  },
  {
    id: 'refund_amount',
    accessorKey: 'refund_amount',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Refunded' />,
    cell: ({ row }) => Number(row.original.refund_amount).toFixed(2)
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<SaleReturn, unknown> }) => <DataTableColumnHeader column={column} title='Created At' />,
    cell: ({ cell }) => formatDate(cell.getValue<SaleReturn['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
