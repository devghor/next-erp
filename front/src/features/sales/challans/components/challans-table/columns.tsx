'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Challan } from '../../api/types';

export const columns: ColumnDef<Challan>[] = [
  {
    id: 'reference_no',
    accessorKey: 'reference_no',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Reference No' />,
    cell: ({ row }) => (
      <Link href={`/dashboard/challans/${row.original.id}`} className='hover:underline'>
        {row.original.reference_no}
      </Link>
    )
  },
  {
    id: 'courier_name',
    accessorKey: 'courier_name',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Courier' />,
    cell: ({ row }) => row.original.courier_name ?? '—'
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
        {row.original.status === 'active' ? 'Active' : 'Closed'}
      </Badge>
    )
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Total Amount' />,
    cell: ({ row }) => Number(row.original.total_amount).toFixed(2)
  },
  {
    id: 'total_due',
    accessorKey: 'total_due',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Total Due' />,
    cell: ({ row }) => Number(row.original.total_due).toFixed(2)
  },
  {
    id: 'closing_date',
    accessorKey: 'closing_date',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Closing Date' />,
    cell: ({ row }) => (row.original.closing_date ? formatDate(row.original.closing_date) : '—')
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Challan, unknown> }) => <DataTableColumnHeader column={column} title='Created At' />,
    cell: ({ cell }) => formatDate(cell.getValue<Challan['created_at']>())
  }
];
