'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { SaleExchange } from '../../api/types';

export const columns: ColumnDef<SaleExchange>[] = [
  {
    id: 'reference_no',
    accessorKey: 'reference_no',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Reference No' />,
    meta: { label: 'Reference No', placeholder: 'Search reference...', variant: 'text' as const, icon: Icons.text },
    enableColumnFilter: true,
    cell: ({ row }) =>
      row.original.sale_id ? (
        <Link href={`/dashboard/sales/${row.original.sale_id}/edit`} className='hover:underline'>
          {row.original.reference_no}
        </Link>
      ) : (
        row.original.reference_no
      )
  },
  {
    id: 'sale_reference_no',
    accessorKey: 'sale_reference_no',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Sale Reference' />,
    cell: ({ row }) => row.original.sale_reference_no ?? '—'
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Customer' />
  },
  {
    id: 'warehouse_name',
    accessorKey: 'warehouse_name',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Warehouse' />
  },
  {
    id: 'payment_type',
    accessorKey: 'payment_type',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Settlement' />,
    cell: ({ row }) => {
      const type = row.original.payment_type;
      if (!type) return <Badge variant='secondary'>None</Badge>;
      return <Badge variant={type === 'pay' ? 'destructive' : 'default'}>{type === 'pay' ? 'Pay' : 'Receive'}</Badge>;
    }
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Amount' />,
    cell: ({ row }) => Number(row.original.amount).toFixed(2)
  },
  {
    id: 'grand_total',
    accessorKey: 'grand_total',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='New Grand Total' />,
    cell: ({ row }) => Number(row.original.grand_total).toFixed(2)
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<SaleExchange, unknown> }) => <DataTableColumnHeader column={column} title='Created At' />,
    cell: ({ cell }) => formatDate(cell.getValue<SaleExchange['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  }
];
