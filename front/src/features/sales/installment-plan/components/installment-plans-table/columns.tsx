'use client';
import Link from 'next/link';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { InstallmentPlan } from '../../api/types';

export const columns: ColumnDef<InstallmentPlan>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<InstallmentPlan, unknown> }) => <DataTableColumnHeader column={column} title='Plan Name' />,
    cell: ({ row }) => (
      <Link href={`/dashboard/installmentplan/${row.original.id}`} className='hover:underline'>
        {row.original.name}
      </Link>
    )
  },
  {
    id: 'sale_reference_no',
    accessorKey: 'sale_reference_no',
    header: ({ column }: { column: Column<InstallmentPlan, unknown> }) => <DataTableColumnHeader column={column} title='Sale Reference' />
  },
  {
    id: 'customer_name',
    accessorKey: 'customer_name',
    header: ({ column }: { column: Column<InstallmentPlan, unknown> }) => <DataTableColumnHeader column={column} title='Customer' />
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }: { column: Column<InstallmentPlan, unknown> }) => <DataTableColumnHeader column={column} title='Total Amount' />,
    cell: ({ row }) => Number(row.original.total_amount).toFixed(2)
  },
  {
    id: 'paid_count',
    header: ({ column }: { column: Column<InstallmentPlan, unknown> }) => <DataTableColumnHeader column={column} title='Paid' />,
    cell: ({ row }) => `${row.original.paid_count ?? 0} / ${row.original.months}`
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<InstallmentPlan, unknown> }) => <DataTableColumnHeader column={column} title='Created At' />,
    cell: ({ cell }) => formatDate(cell.getValue<InstallmentPlan['created_at']>())
  }
];
